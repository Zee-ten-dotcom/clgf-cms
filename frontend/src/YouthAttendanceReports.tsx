import { useState } from 'react';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  present: number;
  absent: number;
};

type Report = {
  month: string;
  totalSessions: number;
  members: Member[];
};

type Props = {
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

export default function YouthAttendanceReports({
  apiUrl, authFetch,
}: Props) {
  const [month, setMonth] = useState(
    new Date().toLocaleDateString('en-CA').slice(0, 7)
  );
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!month) return;
    setLoading(true);
    setError('');
    try {
      const response = await authFetch(
        `${apiUrl}/youth/attendance/report?month=${month}`
      );
      if (!response.ok) throw new Error(await response.text());
      setReport(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report failed');
    } finally {
      setLoading(false);
    }
  }

  const present = report?.members.reduce(
    (total, member) => total + Number(member.present), 0
  ) || 0;

  const absent = report?.members.reduce(
    (total, member) => total + Number(member.absent), 0
  ) || 0;

  const rate = present + absent
    ? Math.round(100 * present / (present + absent))
    : 0;

  function printReport() {
    window.print();
  }

  return (
    <section className="clgf-youth-attendance clgf-youth-report">
      <h3>Youth Attendance Monthly Report</h3>
      <div className="clgf-ya-actions">
        <input
          aria-label="Report month"
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
        />
        <button type="button" disabled={loading}
          onClick={() => void generate()}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && <p role="alert">{error}</p>}

      {report && (
        <div className="clgf-ya-panel">
          <h4>CLGF Youth Ministry — {report.month}</h4>
          <div className="clgf-ya-stats">
            <div><span>Services</span><strong>{report.totalSessions}</strong></div>
            <div><span>Youth Members</span><strong>{report.members.length}</strong></div>
            <div><span>Present</span><strong>{present}</strong></div>
            <div><span>Absent</span><strong>{absent}</strong></div>
            <div><span>Attendance Rate</span><strong>{rate}%</strong></div>
          </div>

          <h4>Member Attendance</h4>
          {report.members.map(member => (
            <div className="clgf-ya-session" key={member.id}>
              <strong>{member.first_name} {member.last_name}</strong>
              <small>
                Present: {member.present} · Absent: {member.absent}
              </small>
            </div>
          ))}

          <h4>Members Requiring Follow-Up</h4>
          {report.members.filter(member =>
            Number(member.absent) >= 2
          ).map(member => (
            <p key={member.id}>
              {member.first_name} {member.last_name}
              {' — '}{member.absent} recorded absences
            </p>
          ))}
          <button type="button" onClick={printReport}>
            Print Report
          </button>
        </div>
      )}
    </section>
  );
}
