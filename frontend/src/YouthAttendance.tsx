import { useEffect, useState } from 'react';

type Session = {
  id: string;
  service_date: string;
  present: number;
  absent: number;
};

type Props = {
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

export default function YouthAttendance({ apiUrl, authFetch }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
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

  useEffect(() => { void load(); }, []);

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
