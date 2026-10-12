import { useEffect, useState } from 'react';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
};

type Care = {
  id: string;
  member_id: string;
  member_name: string;
  subject: string;
  notes: string;
  status: string;
  follow_up_date: string | null;
};

type Leader = {
  id: string;
  member_id: string;
  member_name: string;
  role_title: string;
  responsibility: string;
};

type Props = {
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  section: 'care' | 'leadership';
  onBack: () => void;
};


const YOUTH_ROLES: Record<string, string> = {
  'Chairperson':
    'Provide leadership to the Youth Committee; chair meetings; coordinate youth ministry plans; promote unity and accountability; report progress to church leadership.',
  'Vice Chairperson':
    'Assist the Chairperson; act in their absence; support committee members; monitor implementation of youth ministry decisions.',
  'Secretary':
    'Prepare meeting agendas; record minutes; maintain youth ministry records; manage correspondence; communicate meeting decisions.',
  'Deputy Secretary':
    'Assist the Secretary; maintain attendance and administrative records; act when the Secretary is unavailable.',
  'Treasurer':
    'Maintain accurate youth ministry financial records; prepare budgets and financial reports; record approved income and expenditure; ensure accountability under church financial policies.',
  'Organizer':
    'Coordinate youth services, events and outreach; prepare activity schedules; organize volunteers, equipment and venues; monitor event readiness.',
  'Public Relations Officer':
    'Communicate approved youth announcements; promote youth activities; coordinate invitations and publicity; maintain respectful communication with members and visitors.',
  'Worship Coordinator':
    'Coordinate youth praise and worship; organize rehearsals; support worship team development; work with technical teams and service leaders.',
  'Prayer Coordinator':
    'Organize youth prayer meetings; encourage consistent prayer; coordinate intercession and prayer requests; support the spiritual growth of youth members.',
  'Youth Committee Member':
    'Attend committee meetings; support youth programs and outreach; carry out assigned responsibilities; encourage participation and uphold ministry values.'
};

export default function YouthCareLeadership({
  apiUrl, authFetch, section, onBack,
}: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [records, setRecords] = useState<(Care | Leader)[]>([]);
  const [memberId, setMemberId] = useState('');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [role, setRole] = useState('Chairperson');
  const [responsibility, setResponsibility] = useState(YOUTH_ROLES['Chairperson']);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const path = section === 'care'
    ? '/youth/follow-ups'
    : '/youth/leadership';

  async function request(url: string, options?: RequestInit) {
    const response = await authFetch(`${apiUrl}${url}`, options);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        typeof data.message === 'string'
          ? data.message : 'Request failed'
      );
    }
    return response.json();
  }

  async function load() {
    try {
      const [youth, data] = await Promise.all([
        request('/youth/members'),
        request(path),
      ]);
      setMembers(Array.isArray(youth) ? youth : []);
      setRecords(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load');
    }
  }

  useEffect(() => { void load(); }, [section]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await request(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          section === 'care'
            ? { memberId, subject, notes, followUpDate }
            : { memberId, roleTitle: role, responsibility }
        ),
      });
      setMemberId('');
      setSubject('');
      setNotes('');
      setFollowUpDate('');
      setResponsibility(YOUTH_ROLES[role] || '');
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save');
    } finally {
      setBusy(false);
    }
  }

  async function closeFollowUp(id: string) {
    setBusy(true);
    try {
      await request(`${path}/${id}/close`, { method: 'PATCH' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update');
    } finally {
      setBusy(false);
    }
  }

  const title = section === 'care'
    ? 'Youth Follow-Up & Pastoral Care'
    : 'Youth Leadership Structure';

  return (
    <section className="clgf-youth-workspace">
      <div className="clgf-youth-workspace-header">
        <div>
          <h2>{title}</h2>
          <p>CLGF Youth Ministry</p>
        </div>
        <button type="button" onClick={onBack}>
          ← Back to Youth Services
        </button>
      </div>

      <div className="clgf-youth-workspace-actions">
        <button type="button"
          onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' :
            section === 'care' ? '+ New Follow-Up' : '+ Assign Youth Leader'}
        </button>
      </div>

      {error && <p role="alert" className="clgf-ya-error">{error}</p>}

      {showForm && (
        <form className="clgf-youth-workspace-form" onSubmit={save}>
          <label>
            Youth Member
            <select value={memberId}
              onChange={e => setMemberId(e.target.value)} required>
              <option value="">Select Youth Member</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name}
                </option>
              ))}
            </select>
          </label>

          {section === 'care' ? (
            <>
              <label>
                Follow-Up Subject
                <input value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required />
              </label>
              <label>
                Notes (confidential)
                <textarea value={notes}
                  onChange={e => setNotes(e.target.value)} />
              </label>
              <label>
                Follow-Up Date
                <input type="date" value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)} />
              </label>
            </>
          ) : (
            <>
              <label>
                Leadership Position
                <select value={role}
                  onChange={e => {
                    setRole(e.target.value);
                    setResponsibility(YOUTH_ROLES[e.target.value] || '');
                  }}>
                  {[
                    'Chairperson', 'Vice Chairperson', 'Secretary',
                    'Deputy Secretary', 'Treasurer', 'Organizer',
                    'Public Relations Officer', 'Worship Coordinator',
                    'Prayer Coordinator', 'Youth Committee Member',
                  ].map(item => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Responsibilities
                <textarea
                  value={responsibility}
                  readOnly
                  rows={5}
                  aria-label="Predefined leadership responsibilities"
                />
              </label>
            </>
          )}

          <button disabled={busy}>
            {busy ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      <div className="clgf-youth-workspace-list">
        <h3>{section === 'care' ? 'Follow-Up Records' : 'Youth Leaders'}</h3>
        {records.length === 0 && <p>No records yet.</p>}

        {records.map(item => (
          <article className="clgf-youth-workspace-record" key={item.id}>
            <strong>{item.member_name}</strong>
            {'subject' in item ? (
              <>
                <p><b>Subject:</b> {item.subject}</p>
                <p><b>Status:</b> {item.status}</p>
                <p><b>Follow-Up:</b> {
                  item.follow_up_date
                    ? String(item.follow_up_date).slice(0, 10)
                    : 'Not scheduled'
                }</p>
                {item.notes && <p><b>Notes:</b> {item.notes}</p>}
                {item.status !== 'CLOSED' && (
                  <button type="button" disabled={busy}
                    onClick={() => void closeFollowUp(item.id)}>
                    Mark Completed
                  </button>
                )}
              </>
            ) : (
              <>
                <p><b>Position:</b> {item.role_title}</p>
                <p><b>Responsibilities:</b> {
                  item.responsibility || 'Not specified'
                }</p>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
