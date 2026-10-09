import './ministry-report-cards.css';
import './ministry-report-dashboard.css';
import { useCallback, useEffect, useState } from 'react';

type Report = {
  id: string;
  ministry_id: string;
  ministry_name: string;
  report_month: string;
  activities: string;
  achievements: string;
  challenges: string;
  assistance_required: string;
  next_plans: string;
  status: string;
};

type Ministry = {
  id: string;
  name: string;
  leader_id?: string | null;
};

type Fields = {
  activities: string;
  achievements: string;
  challenges: string;
  assistanceRequired: string;
  nextPlans: string;
};

type View = 'create' | 'submitted' | 'review';

const empty: Fields = {
  activities: '',
  achievements: '',
  challenges: '',
  assistanceRequired: '',
  nextPlans: '',
};

const labels: Record<keyof Fields, string> = {
  activities: 'Activities Completed',
  achievements: 'Achievements',
  challenges: 'Challenges',
  assistanceRequired: 'Assistance Required',
  nextPlans: 'Plans for Next Month',
};

export default function MinistryMonthlyReports({
  apiBaseUrl,
  authFetch,
  role,
}: {
  apiBaseUrl: string;
  authFetch: any;
  role: string;
}) {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [view, setView] = useState<View>('submitted');
  const [ministryId, setMinistryId] = useState('');
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [fields, setFields] = useState<Fields>(empty);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, r] = await Promise.all([
        authFetch(`${apiBaseUrl}/ministries`),
        authFetch(`${apiBaseUrl}/ministry-monthly-reports`),
      ]);

      if (!m.ok || !r.ok) {
        throw Error('Unable to load ministry reports');
      }

      const [ms, rs] = await Promise.all([
        m.json(),
        r.json(),
      ]);

      setMinistries(Array.isArray(ms) ? ms : []);
      setReports(Array.isArray(rs) ? rs : []);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Unable to load reports'
      );
    }
  }, [apiBaseUrl, authFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const r = reports.find(
      x => x.ministry_id === ministryId &&
           x.report_month === month
    );

    setFields(
      r
        ? {
            activities: r.activities || '',
            achievements: r.achievements || '',
            challenges: r.challenges || '',
            assistanceRequired: r.assistance_required || '',
            nextPlans: r.next_plans || '',
          }
        : { ...empty }
    );
  }, [reports, ministryId, month]);

  const save = async (status: 'DRAFT' | 'SUBMITTED') => {
    if (!ministryId) {
      setMessage('Please select a ministry first.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const r = await authFetch(
        `${apiBaseUrl}/ministry-monthly-reports`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ministryId,
            month,
            ...fields,
            status,
          }),
        }
      );

      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Unable to save report'
        );
      }

      await load();
      setMessage(
        status === 'DRAFT'
          ? 'Draft saved successfully.'
          : 'Report submitted successfully.'
      );

      if (status === 'SUBMITTED') {
        setView('submitted');
      }
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Unable to save report'
      );
    } finally {
      setBusy(false);
    }
  };

  const submitted = reports.filter(
    r => r.status === 'SUBMITTED'
  );
  const drafts = reports.filter(
    r => r.status === 'DRAFT'
  );

  const displayedReports =
    view === 'submitted' ? submitted : reports;

  return (
    <section className="clgf-monthly-dashboard">
      <div className="clgf-monthly-intro">
        <h3>Ministry Monthly Reports</h3>
        <p>
          Ministry activities, accountability, achievements
          and leadership progress.
        </p>
      </div>

      <div className="clgf-monthly-nav">
        <button
          type="button"
          className={
            'clgf-monthly-tile' +
            (view === 'create' ? ' active' : '')
          }
          onClick={() => {
            setView('create');
            setMessage('');
          }}
        >
          <span className="clgf-monthly-icon">✎</span>
          <strong>Create Monthly Report</strong>
          <small>Prepare, save or submit a report</small>
        </button>

        <button
          type="button"
          className={
            'clgf-monthly-tile' +
            (view === 'submitted' ? ' active' : '')
          }
          onClick={() => {
            setView('submitted');
            setMessage('');
          }}
        >
          <span className="clgf-monthly-icon">▤</span>
          <strong>Submitted Reports</strong>
          <small>{submitted.length} submitted reports</small>
        </button>

        <button
          type="button"
          className={
            'clgf-monthly-tile' +
            (view === 'review' ? ' active' : '')
          }
          onClick={() => {
            setView('review');
            setMessage('');
          }}
        >
          <span className="clgf-monthly-icon">✓</span>
          <strong>Leadership Review</strong>
          <small>Review ministry progress</small>
        </button>
      </div>

      {view === 'create' && (
        <div className="clgf-monthly-panel">
          <h3>Create Monthly Report</h3>
          <p>
            Complete the ministry report for the selected month.
          </p>

          <div className="clgf-monthly-fields">
            <label>
              <strong>Ministry</strong>
              <select
                value={ministryId}
                onChange={e => setMinistryId(e.target.value)}
              >
                <option value="">Select Ministry</option>
                {ministries.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <strong>Reporting Month</strong>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
              />
            </label>
          </div>

          {Object.entries(labels).map(([key, label]) => (
            <label
              key={key}
              className="clgf-monthly-textarea"
            >
              <strong>{label}</strong>
              <textarea
                rows={3}
                value={fields[key as keyof Fields]}
                onChange={e =>
                  setFields(p => ({
                    ...p,
                    [key]: e.target.value,
                  }))
                }
              />
            </label>
          ))}

          <div className="clgf-monthly-actions">
            <button
              type="button"
              disabled={busy}
              onClick={() => void save('DRAFT')}
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void save('SUBMITTED')}
            >
              Submit Report
            </button>
          </div>
        </div>
      )}

      {(view === 'submitted' || view === 'review') && (
        <div className="clgf-monthly-panel">
          <h3>
            {view === 'submitted'
              ? 'Submitted Ministry Reports'
              : role === 'ADMIN'
                ? 'Ministry Leadership Review'
                : 'My Ministry Reports'}
          </h3>

          {view === 'review' && (
            <div className="clgf-monthly-stats">
              <div>
                <strong>{reports.length}</strong>
                <span>Total Reports</span>
              </div>
              <div>
                <strong>{submitted.length}</strong>
                <span>Submitted</span>
              </div>
              <div>
                <strong>{drafts.length}</strong>
                <span>Drafts</span>
              </div>
            </div>
          )}

          <div id="clgf-ministry-monthly-print">
            {displayedReports.length === 0 && (
              <p>No reports available in this section.</p>
            )}

            <div className="clgf-report-list">
              {displayedReports.map(r => (
                <article
                  key={r.id}
                  className="clgf-report-card"
                  data-report-id={r.id}
                >
                  <h4>{r.ministry_name}</h4>
                  <p>
                    <strong>Month:</strong> {r.report_month}
                  </p>
                  <p>
                    <strong>Status:</strong> {r.status}
                  </p>

                  <details>
                    <summary
                      style={{
                        cursor: 'pointer',
                        padding: '10px 0',
                      }}
                    >
                      View Report
                    </summary>

                    <div className="clgf-report-details">
                      <h4>Activities Completed</h4>
                      <p>{r.activities || 'None recorded'}</p>

                      <h4>Achievements</h4>
                      <p>{r.achievements || 'None recorded'}</p>

                      <h4>Challenges</h4>
                      <p>{r.challenges || 'None recorded'}</p>

                      <h4>Assistance Required</h4>
                      <p>
                        {r.assistance_required || 'None recorded'}
                      </p>

                      <h4>Plans for Next Month</h4>
                      <p>{r.next_plans || 'None recorded'}</p>
                    </div>
                  </details>

                  <button
                    type="button"
                    onClick={() => {
                      const root = document.getElementById(
                        'clgf-ministry-monthly-print'
                      );

                      root
                        ?.querySelectorAll('.clgf-report-card')
                        .forEach(card => {
                          card.classList.toggle(
                            'clgf-print-selected',
                            card.getAttribute(
                              'data-report-id'
                            ) === r.id
                          );
                        });

                      window.print();
                    }}
                  >
                    Print Report
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {message && (
        <p className="clgf-monthly-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
