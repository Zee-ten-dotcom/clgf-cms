import { useEffect, useState } from 'react';

type Report = {
  id: string;
  report_month: string;
  achievements: string;
  challenges: string;
  plans: string;
};

type Props = {
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

export default function YouthReports({ apiUrl, authFetch }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [month, setMonth] = useState('');
  const [achievements, setAchievements] = useState('');
  const [challenges, setChallenges] = useState('');
  const [plans, setPlans] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const response = await authFetch(`${apiUrl}/youth/reports`);
      if (!response.ok) throw new Error(await response.text());
      setReports(await response.json());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load reports');
    }
  }

  useEffect(() => { void load(); }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await authFetch(`${apiUrl}/youth/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportMonth: month,
          achievements,
          challenges,
          plans,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save report');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="clgf-youth-manager">
      <h3>Youth Monthly Report</h3>
      <form onSubmit={save}>
        <input
          aria-label="Report month"
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          required
        />
        <textarea
          aria-label="Achievements"
          placeholder="Achievements and activities"
          value={achievements}
          onChange={e => setAchievements(e.target.value)}
        />
        <textarea
          aria-label="Challenges"
          placeholder="Challenges"
          value={challenges}
          onChange={e => setChallenges(e.target.value)}
        />
        <textarea
          aria-label="Plans"
          placeholder="Plans for next month"
          value={plans}
          onChange={e => setPlans(e.target.value)}
        />
        <button disabled={saving}>
          {saving ? 'Saving...' : 'Submit Youth Report'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <h3>Submitted Reports</h3>
      {reports.length === 0 && <p>No youth reports submitted.</p>}
      {reports.map(report => (
        <div className="clgf-youth-service" key={report.id}>
          <strong>{report.report_month}</strong>
          <p>Achievements: {report.achievements}</p>
          <p>Challenges: {report.challenges}</p>
          <p>Plans: {report.plans}</p>
        </div>
      ))}
    </section>
  );
}
