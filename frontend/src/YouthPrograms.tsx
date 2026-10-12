import { useEffect, useState } from 'react';

type Program = {
  id: string;
  title: string;
  event_date: string;
  description: string;
  location: string;
};

type Props = {
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

export default function YouthPrograms({ apiUrl, authFetch }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const response = await authFetch(`${apiUrl}/youth/programs`);
      if (!response.ok) throw new Error(await response.text());
      setPrograms(await response.json());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loading failed');
    }
  }

  useEffect(() => { void load(); }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await authFetch(`${apiUrl}/youth/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          eventDate: date,
          description,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      setTitle('');
      setDate('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saving failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="clgf-youth-manager">
      <h3>Youth Programs & Activities</h3>
      <form onSubmit={save}>
        <input
          aria-label="Program title"
          placeholder="Program or activity title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          aria-label="Program date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <textarea
          aria-label="Program description"
          placeholder="Speaker, worship, outreach, activities"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button disabled={saving}>
          {saving ? 'Saving...' : 'Create Youth Program'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <h3>Scheduled Programs</h3>
      {programs.length === 0 && <p>No youth programs yet.</p>}
      {programs.map(program => (
        <div className="clgf-youth-service" key={program.id}>
          <strong>{program.title}</strong>
          <p>{String(program.event_date).slice(0, 10)}</p>
          <p>{program.description}</p>
          <p>{program.location}</p>
        </div>
      ))}
    </section>
  );
}
