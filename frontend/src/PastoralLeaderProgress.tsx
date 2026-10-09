import { useEffect, useState } from 'react';

type CaseRecord = {
  id: string;
  subject?: string | null;
  status: string;
  follow_up_date?: string | null;
  assigned_leader_id?: string | null;
  assigned_leader_first_name?: string | null;
  assigned_leader_last_name?: string | null;
};

type Activity = {
  id: string;
  follow_up_date: string;
  contact_method: string;
  outcome: string;
  recorded_by_user_id: string;
};

type Props = {
  cases: CaseRecord[];
  apiBaseUrl: string;
  authFetch: typeof fetch;
  onOpenCase: (id: string) => void;
};

export default function PastoralLeaderProgress({
  cases,
  apiBaseUrl,
  authFetch,
  onOpenCase,
}: Props) {
  const [activities, setActivities] =
    useState<Record<string, Activity[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLeader, setSelectedLeader] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all(
      cases.map(async (item) => {
        const response = await authFetch(
          `${apiBaseUrl}/pastoral-care/${item.id}/follow-ups`,
        );
        if (!response.ok) throw new Error('Unable to load leader progress');
        const data = await response.json();
        return [item.id, Array.isArray(data) ? data : []] as const;
      }),
    )
      .then((results) => {
        if (active) setActivities(Object.fromEntries(results));
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [cases, apiBaseUrl]);

  const leaders = Array.from(
    new Map(
      cases
        .filter((item) => item.assigned_leader_id)
        .map((item) => [
          item.assigned_leader_id!,
          {
            id: item.assigned_leader_id!,
            name: [
              item.assigned_leader_first_name,
              item.assigned_leader_last_name,
            ].filter(Boolean).join(' ') || 'Unnamed Leader',
          },
        ]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  const today = new Date().toLocaleDateString('en-CA');

  const visibleCases = cases.filter(
    (item) =>
      item.assigned_leader_id &&
      (!selectedLeader ||
        item.assigned_leader_id === selectedLeader),
  );

  return (
    <div className="member-form">
      <h3>Leader Progress Monitoring</h3>
      <p>Administrator overview of assigned pastoral care cases</p>

      <div className="form-group">
        <label>Select Leader</label>
        <select
          value={selectedLeader}
          onChange={(e) => setSelectedLeader(e.target.value)}
        >
          <option value="">All Leaders</option>
          {leaders.map((leader) => (
            <option key={leader.id} value={leader.id}>
              {leader.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading leader progress...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && visibleCases.length === 0 && (
        <p>No assigned pastoral care cases found.</p>
      )}

      {!loading && visibleCases.map((item) => {
        const history = activities[item.id] || [];
        const latest = [...history].sort((a, b) =>
          b.follow_up_date.localeCompare(a.follow_up_date),
        )[0];

        const closed =
          item.status === 'CLOSED' ||
          item.status === 'COMPLETED';

        const overdue =
          !closed &&
          !!item.follow_up_date &&
          item.follow_up_date.slice(0, 10) < today;

        const leaderName = [
          item.assigned_leader_first_name,
          item.assigned_leader_last_name,
        ].filter(Boolean).join(' ');

        return (
          <div
            key={item.id}
            style={{
              borderBottom: '1px solid #d6c9a8',
              padding: '16px 0',
            }}
          >
            <strong>{leaderName || 'Unnamed Leader'}</strong>
            <p>{item.subject || 'Pastoral Care Case'}</p>
            <p>Status: {item.status.replaceAll('_', ' ')}</p>
            <p>Activities Recorded: {history.length}</p>
            <p>
              Last Activity:{' '}
              {latest
                ? `${latest.follow_up_date.slice(0, 10)} — ${latest.contact_method.replaceAll('_', ' ')}`
                : 'None recorded'}
            </p>
            <p>
              Latest Outcome:{' '}
              {latest
                ? latest.outcome.replaceAll('_', ' ')
                : 'Pending'}
            </p>
            <p>
              Next Follow-up:{' '}
              {item.follow_up_date
                ? item.follow_up_date.slice(0, 10)
                : 'Not scheduled'}
            </p>
            {overdue && <strong>Overdue</strong>}
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => onOpenCase(item.id)}
                style={{
                  background: '#d4af37',
                  color: '#111',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View Case & History
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
