import { useEffect, useState } from 'react';

type CaseRecord = {
  id: string;
  status: string;
  care_date?: string | null;
  follow_up_date?: string | null;
  assigned_leader_id?: string | null;
  assigned_leader_first_name?: string | null;
  assigned_leader_last_name?: string | null;
};

type Activity = {
  id: string;
  follow_up_date: string;
  recorded_by_user_id?: string;
};

type Props = {
  cases: CaseRecord[];
  apiBaseUrl: string;
  authFetch: typeof fetch;
};

export default function PastoralMonthlyReport({
  cases,
  apiBaseUrl,
  authFetch,
}: Props) {
  const [month, setMonth] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}`;
  });

  const [activities, setActivities] =
    useState<Record<string, Activity[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all(
      cases.map(async (record) => {
        const response = await authFetch(
          `${apiBaseUrl}/pastoral-care/${record.id}/follow-ups`,
        );

        if (!response.ok) {
          throw new Error('Unable to load monthly report');
        }

        const data = await response.json();

        return [
          record.id,
          Array.isArray(data) ? data : [],
        ] as const;
      }),
    )
      .then((results) => {
        if (active) {
          setActivities(Object.fromEntries(results));
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cases, apiBaseUrl, authFetch]);

  const leaders = Array.from(
    new Map(
      cases
        .filter((record) => record.assigned_leader_id)
        .map((record) => [
          record.assigned_leader_id!,
          {
            id: record.assigned_leader_id!,
            name: [
              record.assigned_leader_first_name,
              record.assigned_leader_last_name,
            ].filter(Boolean).join(' ') || 'Unnamed Leader',
          },
        ]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  const rows = leaders.map((leader) => {
    const assigned = cases.filter(
      (record) => record.assigned_leader_id === leader.id,
    );

    const monthlyActivities = assigned.flatMap(
      (record) =>
        (activities[record.id] || [])
          .filter((activity) =>
            activity.follow_up_date?.slice(0, 7) === month,
          )
          .map((activity) => ({
            ...activity,
            caseId: record.id,
          })),
    );

    const attendedCases = new Set(
      monthlyActivities.map((activity) => activity.caseId),
    ).size;

    const currentOpen = assigned.filter(
      (record) =>
        !['COMPLETED', 'CLOSED'].includes(record.status),
    ).length;

    const currentClosed = assigned.length - currentOpen;

    return {
      ...leader,
      assigned: assigned.length,
      activities: monthlyActivities.length,
      attendedCases,
      currentOpen,
      currentClosed,
    };
  });

  const totals = rows.reduce(
    (total, row) => ({
      assigned: total.assigned + row.assigned,
      activities: total.activities + row.activities,
      attendedCases: total.attendedCases + row.attendedCases,
      currentOpen: total.currentOpen + row.currentOpen,
      currentClosed: total.currentClosed + row.currentClosed,
    }),
    {
      assigned: 0,
      activities: 0,
      attendedCases: 0,
      currentOpen: 0,
      currentClosed: 0,
    },
  );

  return (
    <div className="member-form">
      <h3>Monthly Leadership Accountability Report</h3>
      <p>Pastoral Care ministry activity and leadership overview</p>

      <div className="form-group">
        <label htmlFor="pastoral-report-month">
          Reporting Month
        </label>
        <input
          id="pastoral-report-month"
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
      </div>

      {loading && <p>Preparing report...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <div id="clgf-monthly-pastoral-report">
            <h3>The City Of The Living God Fellowship</h3>
            <p>Reporting Month: {month}</p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}>
                <thead>
                  <tr>
                    {[
                      'Leader',
                      'Assigned',
                      'Activities',
                      'Attended Cases',
                      'Currently Open',
                      'Currently Closed',
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: 10,
                          borderBottom: '2px solid #d4af37',
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {[
                        row.name,
                        row.assigned,
                        row.activities,
                        row.attendedCases,
                        row.currentOpen,
                        row.currentClosed,
                      ].map((value, index) => (
                        <td
                          key={index}
                          style={{
                            padding: 10,
                            borderBottom: '1px solid #ddd',
                          }}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    {[
                      'TOTAL',
                      totals.assigned,
                      totals.activities,
                      totals.attendedCases,
                      totals.currentOpen,
                      totals.currentClosed,
                    ].map((value, index) => (
                      <td
                        key={index}
                        style={{ padding: 10, fontWeight: 700 }}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: 16, fontSize: 13 }}>
              Activities and attended cases refer to the selected
              month. Assigned, open and closed figures reflect
              current case assignments and statuses, not historical
              month-end snapshots.
            </p>
            <p style={{ fontSize: 13 }}>
              Confidential case notes are excluded from this report.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            style={{
              marginTop: 16,
              padding: '12px 20px',
              background: '#d4af37',
              color: '#111',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Print Monthly Report
          </button>
        </>
      )}
    </div>
  );
}
