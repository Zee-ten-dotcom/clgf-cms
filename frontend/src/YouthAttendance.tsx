import { useEffect, useState } from 'react';

type Session = {
  id: string;
  service_date: string;
  present: number;
  absent: number;
};

type YouthMember = {
  id: string;
  first_name: string;
  last_name: string;
};

type Props = {
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

export default function YouthAttendance({ apiUrl, authFetch }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [members, setMembers] = useState<YouthMember[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [memberId, setMemberId] = useState('');
  const [status, setStatus] = useState('PRESENT');
  const [marking, setMarking] = useState(false);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const response = await authFetch(`${apiUrl}/youth/attendance`);
      if (!response.ok) throw new Error(await response.text());
      setSessions(await response.json());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load');
    }
  }

  async function loadMembers() {
    try {
      const response = await authFetch(`${apiUrl}/members`);
      if (!response.ok) throw new Error('Unable to load members');
      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load members');
    }
  }

  useEffect(() => {
    void load();
    void loadMembers();
  }, []);

  async function mark(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMarking(true);
    try {
      const response = await authFetch(
        `${apiUrl}/youth/attendance/${selectedSession}/members`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId, status }),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      setError('');
      setMemberId('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to mark attendance');
    } finally {
      setMarking(false);
    }
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await authFetch(`${apiUrl}/youth/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceDate: date, notes }),
      });
      if (!response.ok) throw new Error(await response.text());
      setDate('');
      setNotes('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="clgf-youth-manager">
      <h3>Youth Attendance</h3>
      <form onSubmit={create}>
        <input
          aria-label="Attendance date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <textarea
          aria-label="Attendance notes"
          placeholder="Youth service notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <button disabled={saving}>
          {saving ? 'Saving...' : 'Create Youth Attendance'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}

      <h3>Mark Youth Member Attendance</h3>
      <form onSubmit={mark}>
        <select
          aria-label="Youth attendance session"
          value={selectedSession}
          onChange={e => setSelectedSession(e.target.value)}
          required
        >
          <option value="">Select Youth Service</option>
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              {String(session.service_date).slice(0, 10)}
            </option>
          ))}
        </select>

        <select
          aria-label="Church member"
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          required
        >
          <option value="">Select Member</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.first_name} {member.last_name}
            </option>
          ))}
        </select>

        <select
          aria-label="Attendance status"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
        </select>

        <button type="submit" disabled={marking}>
          {marking ? 'Saving...' : 'Save Youth Attendance'}
        </button>
      </form>

      <h3>Youth Attendance Sessions</h3>
      {sessions.map(session => (
        <div className="clgf-youth-service" key={session.id}>
          <strong>{String(session.service_date).slice(0, 10)}</strong>
          <p>Present: {session.present} | Absent: {session.absent}</p>
        </div>
      ))}
    </section>
  );
}
