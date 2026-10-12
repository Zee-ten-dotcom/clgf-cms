import { useEffect, useMemo, useState } from 'react';

type Session = {
  id: string;
  service_date: string;
  present: number;
  absent: number;
};

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  membership_number?: string;
};

type Props = {
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

type View = 'dashboard' | 'take' | 'history';

export default function YouthAttendance({ apiUrl, authFetch }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [sessionId, setSessionId] = useState('');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-CA')
  );
  const [notes, setNotes] = useState('');
  const [marks, setMarks] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  async function request(path: string, options?: RequestInit) {
    const response = await authFetch(`${apiUrl}${path}`, options);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || 'Request failed');
    }
    return response.json();
  }

  async function refresh() {
    try {
      const [attendance, youth] = await Promise.all([
        request('/youth/attendance'),
        request('/youth/members')
      ]);
      setSessions(Array.isArray(attendance) ? attendance : []);
      setMembers(Array.isArray(youth) ? youth : []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load attendance');
    }
  }

  useEffect(() => { void refresh(); }, []);

  const current = sessions.find(s => s.id === sessionId);
  const totalPresent = sessions.reduce((n, s) => n + Number(s.present || 0), 0);
  const totalAbsent = sessions.reduce((n, s) => n + Number(s.absent || 0), 0);
  const attendanceRate = totalPresent + totalAbsent
    ? Math.round(100 * totalPresent / (totalPresent + totalAbsent))
    : 0;

  const filtered = useMemo(() => members.filter(m =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())
  ), [members, search]);

  async function createSession() {
    if (!date) return;
    setBusy(true);
    try {
      const created = await request('/youth/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceDate: date, notes })
      });
      await refresh();
      const id = created?.id || created?.session?.id;
      if (id) {
        setSessionId(id);
        setMarks({});
        setView('take');
      } else {
        setView('dashboard');
      }
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create session');
    } finally {
      setBusy(false);
    }
  }

  async function saveMarks() {
    if (!sessionId) return;
    const entries = Object.entries(marks);
    if (!entries.length) {
      setError('Select Present or Absent for at least one youth member.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      for (const [memberId, status] of entries) {
        await request(`/youth/attendance/${sessionId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId, status })
        });
      }
      await refresh();
      setMarks({});
      setView('dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save attendance');
    } finally {
      setBusy(false);
    }
  }

  const formatDate = (value: string) =>
    String(value).slice(0, 10);

  return (
    <section className="clgf-youth-attendance">
      <div className="clgf-ya-header">
        <h3>Youth Attendance</h3>
        <p>Saturday Youth Service · 16:00–18:00</p>
      </div>

      <div className="clgf-ya-stats">
        <div><span>Sessions</span><strong>{sessions.length}</strong></div>
        <div><span>Youth Members</span><strong>{members.length}</strong></div>
        <div><span>Present</span><strong>{totalPresent}</strong></div>
        <div><span>Absent</span><strong>{totalAbsent}</strong></div>
        <div><span>Attendance Rate</span><strong>{attendanceRate}%</strong></div>
      </div>

      <div className="clgf-ya-actions">
        <button type="button" onClick={() => setView('dashboard')}>
          Dashboard
        </button>
        <button type="button" onClick={() => setView('take')}>
          Take Attendance
        </button>
        <button type="button" onClick={() => setView('history')}>
          View History
        </button>
      </div>

      {error && <p className="clgf-ya-error" role="alert">{error}</p>}

      {view === 'dashboard' && (
        <div className="clgf-ya-panel">
          <h4>Recent Youth Services</h4>
          {sessions.length === 0 && <p>No attendance sessions yet.</p>}
          {sessions.slice(0, 5).map(s => (
            <div className="clgf-ya-session" key={s.id}>
              <div>
                <strong>{formatDate(s.service_date)}</strong>
                <small>Present: {s.present} · Absent: {s.absent}</small>
              </div>
              <button type="button" onClick={() => {
                setSessionId(s.id);
                setMarks({});
                setView('take');
              }}>Open</button>
            </div>
          ))}
        </div>
      )}

      {view === 'take' && (
        <div className="clgf-ya-panel">
          <h4>Take Youth Attendance</h4>
          <label>
            Select Existing Youth Service
            <select value={sessionId} onChange={e => {
              setSessionId(e.target.value);
              setMarks({});
            }}>
              <option value="">New Attendance Session</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {formatDate(s.service_date)}
                </option>
              ))}
            </select>
          </label>

          {!sessionId ? (
            <div className="clgf-ya-form">
              <label>
                Service Date
                <input type="date" value={date}
                  onChange={e => setDate(e.target.value)} />
              </label>
              <label>
                Service Notes
                <textarea value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional notes" />
              </label>
              <button disabled={busy || !date}
                onClick={() => void createSession()}>
                {busy ? 'Creating...' : 'Create Session & Take Attendance'}
              </button>
            </div>
          ) : (
            <>
              <p>
                <strong>Service: {current
                  ? formatDate(current.service_date)
                  : 'Selected session'}</strong>
              </p>
              <input
                type="search"
                placeholder="Search youth member..."
                aria-label="Search youth member"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="clgf-ya-member-list">
                {filtered.map(m => (
                  <div className="clgf-ya-member" key={m.id}>
                    <div>
                      <strong>{m.first_name} {m.last_name}</strong>
                      <small>{m.membership_number || ''}</small>
                    </div>
                    <div className="clgf-ya-status">
                      <button
                        type="button"
                        className={marks[m.id] === 'PRESENT' ? 'active' : ''}
                        onClick={() => setMarks(prev => ({
                          ...prev, [m.id]: 'PRESENT'
                        }))}
                      >Present</button>
                      <button
                        type="button"
                        className={marks[m.id] === 'ABSENT' ? 'active absent' : ''}
                        onClick={() => setMarks(prev => ({
                          ...prev, [m.id]: 'ABSENT'
                        }))}
                      >Absent</button>
                    </div>
                  </div>
                ))}
              </div>
              <p>{Object.keys(marks).length} member(s) selected</p>
              <button disabled={busy || !Object.keys(marks).length}
                onClick={() => void saveMarks()}>
                {busy ? 'Saving...' : 'Save Youth Attendance'}
              </button>
            </>
          )}
        </div>
      )}

      {view === 'history' && (
        <div className="clgf-ya-panel">
          <h4>Youth Attendance History</h4>
          {sessions.length === 0 && <p>No history available.</p>}
          {sessions.map(s => (
            <div className="clgf-ya-session" key={s.id}>
              <div>
                <strong>{formatDate(s.service_date)}</strong>
                <small>Present: {s.present} · Absent: {s.absent}</small>
              </div>
              <button type="button" onClick={() => {
                setSessionId(s.id);
                setMarks({});
                setView('take');
              }}>View / Edit</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
