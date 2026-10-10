import { useEffect, useState } from 'react';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  home_cell_name?: string | null;
};

type Props = {
  members: Member[];
  onCreateFollowUp: (memberId: string) => void;
  role: string;
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

type Result = {
  member: Member;
  category: string;
  recent: string[];
};

export default function MemberRetention({
  members, role, apiUrl, authFetch, onCreateFollowUp,
}: Props) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const contextResponse = await authFetch(
          `${apiUrl}/attendance/context`,
        );
        if (!contextResponse.ok) {
          throw new Error('Unable to verify attendance access');
        }

        const context = await contextResponse.json();

        const permitted = role === 'ADMIN'
          ? members.filter(m => m.status === 'ACTIVE')
          : (context.members || []).filter(
              (m: Member) => m.status === 'ACTIVE',
            );

        const data: Result[] = [];

        for (const member of permitted) {
          const response = await authFetch(
            `${apiUrl}/attendance/member/${member.id}/history`,
          );

          if (!response.ok) continue;

          const history = await response.json();
          const recorded = (history.history || [])
            .filter((s: { attendance_status: string }) =>
              s.attendance_status === 'PRESENT' ||
              s.attendance_status === 'ABSENT',
            )
            .slice(0, 5);

          const recent = recorded.map(
            (s: { attendance_status: string }) =>
              s.attendance_status,
          );

          let category = 'Insufficient Data';

          if (
            recent.length >= 3 &&
            recent.slice(0, 3).every((s: string) => s === 'ABSENT')
          ) {
            category = 'Needs Attention';
          } else if (
            recent.length >= 3 &&
            recent[0] === 'PRESENT' &&
            recent[1] === 'ABSENT' &&
            recent[2] === 'ABSENT'
          ) {
            category = 'Returned';
          } else if (
            recent.length >= 3 &&
            recent.slice(0, 3).every((s: string) => s === 'PRESENT')
          ) {
            category = 'Attending Regularly';
          } else if (recent.length >= 3) {
            category = 'Mixed Attendance';
          }

          data.push({ member, category, recent });
        }

        if (!cancelled) setResults(data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Unable to load retention',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [open, members, role, apiUrl, authFetch]);

  const groups = [
    'Needs Attention',
    'Returned',
    'Attending Regularly',
    'Mixed Attendance',
    'Insufficient Data',
  ];

  return (
    <section className="member-profile-section">
      <div className="member-profile-heading">
        <div>
          <h3>Member Retention Dashboard</h3>
          <p>Attendance-based member care indicators</p>
        </div>
        <button
          type="button"
          className="edit-button"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close Dashboard' : 'View Retention'}
        </button>
      </div>

      {open && (
        <div>
          {loading && <p>Analysing attendance...</p>}
          {error && <p role="alert">{error}</p>}

          {!loading && !error && groups.map(group => {
            const matching = results.filter(
              r => r.category === group,
            );

            return (
              <div key={group} style={{ marginTop: 20 }}>
                <h4>{group} ({matching.length})</h4>
                {matching.map(r => (
                  <div
                    key={r.member.id}
                    className="member-card"
                    style={{ marginBottom: 10 }}
                  >
                    <strong>
                      {r.member.first_name} {r.member.last_name}
                    </strong>
                    <p>
                      {r.member.home_cell_name || 'No Home Cell'}
                    </p>
                    
                    {group === 'Needs Attention' && (
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => onCreateFollowUp(r.member.id)}
                      >
                        Create Follow-Up
                      </button>
                    )}
                    <p>
                      Recent recorded attendance:{' '}
                      {r.recent.length
                        ? r.recent.join(' → ')
                        : 'No records'}
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
