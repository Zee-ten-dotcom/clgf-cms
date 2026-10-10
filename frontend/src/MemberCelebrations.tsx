import { useEffect, useState } from 'react';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  status: string;
};

type Household = {
  id: string;
  name: string;
  wedding_anniversary: string | null;
};

type Props = {
  members: Member[];
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

export default function MemberCelebrations({
  members,
  apiUrl,
  authFetch,
}: Props) {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    authFetch(`${apiUrl}/households`)
      .then(async response => {
        if (!response.ok) throw new Error('Unable to load anniversaries');
        return response.json();
      })
      .then(data => {
        if (!cancelled) {
          setHouseholds(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Anniversary reminders unavailable.');
      });

    return () => { cancelled = true; };
  }, [apiUrl, authFetch]);

  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  function nextOccurrence(date: string) {
    const parts = date.slice(0, 10).split('-').map(Number);
    const month = parts[1] - 1;
    const day = parts[2];

    let next = new Date(start.getFullYear(), month, day);

    if (next < start) {
      next = new Date(start.getFullYear() + 1, month, day);
    }

    const days = Math.round(
      (next.getTime() - start.getTime()) / 86400000,
    );

    return { next, days };
  }

  const celebrations = [
    ...members
      .filter(m => m.status === 'ACTIVE' && m.date_of_birth)
      .map(m => ({
        id: `birthday-${m.id}`,
        name: `${m.first_name} ${m.last_name}`,
        type: 'Birthday',
        ...nextOccurrence(m.date_of_birth!),
        greeting:
          `Happy Birthday ${m.first_name}! 🎉\n` +
          'May the Lord bless you and keep you.\n\n' +
          'The City Of The Living God Fellowship',
      })),

    ...households
      .filter(h => h.wedding_anniversary)
      .map(h => ({
        id: `anniversary-${h.id}`,
        name: `${h.name} Family`,
        type: 'Wedding Anniversary',
        ...nextOccurrence(h.wedding_anniversary!),
        greeting:
          `Happy Wedding Anniversary to the ${h.name} family! 💍\n` +
          'May God continue to bless your marriage with love, peace and unity.\n\n' +
          'The City Of The Living God Fellowship',
      })),
  ]
    .filter(c => c.days >= 0 && c.days <= 30)
    .sort((a, b) => a.days - b.days);

  return (
    <section className="member-profile-section">
      <h3>🎉 Upcoming Birthdays & Wedding Anniversaries</h3>
      <p>Church celebrations in the next 30 days</p>

      {error && <p>{error}</p>}

      {celebrations.length === 0 ? (
        <p>No upcoming celebrations recorded.</p>
      ) : (
        celebrations.map(c => (
          <div
            key={c.id}
            className="member-card"
            style={{ marginBottom: 12 }}
          >
            <h4>{c.name}</h4>
            <p>{c.type}</p>
            <p>
              {c.next.toLocaleDateString('en-ZA', {
                day: 'numeric',
                month: 'long',
              })}
              {' — '}
              {c.days === 0 ? 'Today!' : `In ${c.days} days`}
            </p>

            <button
              type="button"
              className="edit-button"
              onClick={() => {
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(c.greeting)}`,
                  '_blank',
                );
              }}
            >
              Send WhatsApp Greeting
            </button>
          </div>
        ))
      )}
    </section>
  );
}
