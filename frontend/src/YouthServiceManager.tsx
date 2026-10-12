import { useEffect, useState } from 'react';

type YouthService = {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
};

type Props = {
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

export default function YouthServiceManager({
  apiUrl,
  authFetch,
}: Props) {
  const [services, setServices] = useState<YouthService[]>([]);
  const [title, setTitle] = useState('Saturday Youth Service');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const response = await authFetch(`${apiUrl}/youth/services`);
      if (!response.ok) throw new Error('Unable to load youth services');
      setServices(await response.json());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loading failed');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await authFetch(`${apiUrl}/youth/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          eventDate: date,
          description,
          startTime: '16:00',
          endTime: '18:00',
          location: 'CLGF Main Sanctuary',
        }),
      });
      if (!response.ok) throw new Error(await response.text());
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
    <div className="clgf-youth-manager">
      <h3>Schedule Youth Service</h3>
      <form onSubmit={save}>
        <input
          aria-label="Service title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Service title"
          required
        />
        <input
          aria-label="Service date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <textarea
          aria-label="Service program"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Program, speaker, worship and activities"
        />
        <p>Saturday Youth Service: 16:00–18:00</p>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Schedule Service'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <h3>Scheduled Youth Services</h3>
      {services.length === 0 && <p>No services scheduled yet.</p>}
      {services.map((service) => (
        <div key={service.id} className="clgf-youth-service">
          <strong>{service.title}</strong>
          <p>{String(service.event_date).slice(0, 10)}</p>
          <p>{service.start_time} – {service.end_time}</p>
          <p>{service.location}</p>
          <p>{service.description}</p>
        </div>
      ))}
    </div>
  );
}
