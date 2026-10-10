type Member = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  status: string;
};

type Props = {
  members: Member[];
};

export default function MemberCelebrations({ members }: Props) {
  const today = new Date();
  const year = today.getFullYear();

  const upcoming = members
    .filter(m => m.status === 'ACTIVE' && m.date_of_birth)
    .map(m => {
      const birth = new Date(m.date_of_birth!.slice(0, 10) + 'T12:00:00');
      let next = new Date(year, birth.getMonth(), birth.getDate());

      if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        next = new Date(year + 1, birth.getMonth(), birth.getDate());
      }

      const days = Math.round(
        (next.getTime() -
          new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
        ) / 86400000
      );

      return { ...m, next, days };
    })
    .filter(m => m.days >= 0 && m.days <= 30)
    .sort((a, b) => a.days - b.days);

  return (
    <section className="member-profile-section">
      <h3>🎂 Upcoming Member Birthdays</h3>
      <p>Celebrations in the next 30 days</p>

      {upcoming.length === 0 ? (
        <p>No upcoming birthdays recorded.</p>
      ) : (
        upcoming.map(m => (
          <div key={m.id} className="member-card"
            style={{ marginBottom: 12 }}>
            <strong>{m.first_name} {m.last_name}</strong>
            <p>
              {m.next.toLocaleDateString('en-ZA', {
                day: 'numeric',
                month: 'long',
              })}
              {' — '}
              {m.days === 0 ? 'Today!' : `In ${m.days} days`}
            </p>
            <button type="button" onClick={() => {
              const text = encodeURIComponent(
                `Happy Birthday ${m.first_name}! 🎉\n` +
                `May the Lord bless you and keep you.\n\n` +
                `The City Of The Living God Fellowship`
              );
              window.open(`https://wa.me/?text=${text}`, '_blank');
            }}>
              Send Birthday Greeting
            </button>
          </div>
        ))
      )}
    </section>
  );
}
