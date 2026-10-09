import { useMemo } from 'react';

type CaseRecord = {
  id: string;
  status: string;
  follow_up_date: string | null;
  subject?: string | null;
  member_first_name?: string | null;
  member_last_name?: string | null;
};

type Props = {
  cases: CaseRecord[];
  onOpenCase: (record: CaseRecord) => void;
};

export default function PastoralReminders({
  cases,
  onOpenCase,
}: Props) {
  const reminders = useMemo(() => {
    const today = new Date();
    const todayKey = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    const nextWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7,
    );

    const nextWeekKey = [
      nextWeek.getFullYear(),
      String(nextWeek.getMonth() + 1).padStart(2, '0'),
      String(nextWeek.getDate()).padStart(2, '0'),
    ].join('-');

    return cases
      .filter((record) =>
        record.follow_up_date &&
        !['COMPLETED', 'CLOSED'].includes(record.status),
      )
      .map((record) => {
        const date = record.follow_up_date!.slice(0, 10);

        const category =
          date < todayKey ? 'Overdue' :
          date === todayKey ? 'Due Today' :
          date <= nextWeekKey ? 'Upcoming' : null;

        return { ...record, date, category };
      })
      .filter((record) => record.category !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [cases]);

  return (
    <div className="member-form">
      <h3>Pastoral Care Reminders</h3>
      <p>Outstanding follow-ups requiring attention</p>

      <div className="form-grid">
        {(['Overdue', 'Due Today', 'Upcoming'] as const).map(
          (category) => (
            <div className="event-stat-card" key={category}>
              <h3>{category}</h3>
              <strong>
                {reminders.filter(
                  (item) => item.category === category,
                ).length}
              </strong>
            </div>
          ),
        )}
      </div>

      {reminders.length === 0 ? (
        <p>No outstanding follow-ups within the next 7 days.</p>
      ) : (
        reminders.map((record) => (
          <div
            key={record.id}
            style={{
              borderTop: '1px solid #ddd',
              padding: '14px 0',
            }}
          >
            <strong>{record.category}</strong>
            <p>
              {[
                record.member_first_name,
                record.member_last_name,
              ].filter(Boolean).join(' ') ||
                record.subject ||
                'Pastoral Care Case'}
            </p>
            <p>Follow-up: {record.date}</p>
            <button
              type="button"
              onClick={() => onOpenCase(record)}
            >
              View Case
            </button>
          </div>
        ))
      )}
    </div>
  );
}
