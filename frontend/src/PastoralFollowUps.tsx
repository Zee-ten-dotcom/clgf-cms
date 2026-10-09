import { useEffect, useState } from 'react';

type FollowUp = {
  id: string;
  follow_up_date: string;
  contact_method: string;
  outcome: string;
  notes: string | null;
  next_follow_up_date: string | null;
};

type Props = {
  caseId: string;
  apiBaseUrl: string;
  authFetch: typeof fetch;
  closed?: boolean;
};

export default function PastoralFollowUps({
  caseId,
  apiBaseUrl,
  authFetch,
  closed = false,
}: Props) {
  const [records, setRecords] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-CA'),
  );
  const [method, setMethod] = useState('PHONE');
  const [outcome, setOutcome] = useState('SUCCESSFUL');
  const [notes, setNotes] = useState('');
  const [nextDate, setNextDate] = useState('');

  const endpoint =
    `${apiBaseUrl}/pastoral-care/${caseId}/follow-ups`;

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    authFetch(endpoint)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load follow-up history');
        }
        return response.json();
      })
      .then((data) => {
        if (active) {
          setRecords(Array.isArray(data) ? data : []);
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
  }, [caseId, apiBaseUrl]);

  async function saveFollowUp(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followUpDate: date,
          contactMethod: method,
          outcome,
          notes,
          ...(nextDate
            ? { nextFollowUpDate: nextDate }
            : {}),
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to save follow-up');
      }

      const saved = await response.json();

      setRecords((previous) =>
        [saved, ...previous].sort((a, b) =>
          b.follow_up_date.localeCompare(a.follow_up_date),
        ),
      );

      setNotes('');
      setNextDate('');
      setMessage('Follow-up recorded successfully.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Save failed',
      );
    } finally {
      setSaving(false);
    }
  }

  const methods: Record<string, string> = {
    PHONE: 'Phone Call',
    HOME_VISIT: 'Home Visit',
    CHURCH_MEETING: 'Church Meeting',
    PRAYER: 'Prayer',
    MESSAGE: 'Message',
    OTHER: 'Other',
  };

  const outcomes: Record<string, string> = {
    SUCCESSFUL: 'Successful',
    NO_ANSWER: 'No Answer',
    RESCHEDULED: 'Rescheduled',
    NEEDS_SUPPORT: 'Needs Further Support',
  };

  return (
    <>
      {!closed && (
        <div className="member-form">
          <h3>Record Follow-up</h3>
          <p>Confidential ministry activity record</p>

          <form onSubmit={saveFollowUp}>
            <div className="form-grid">
              <div className="form-group">
                <label>Follow-up Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Contact Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  {Object.entries(methods).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Outcome</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                >
                  {Object.entries(outcomes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Next Follow-up Date</label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confidential Follow-up Notes</label>
              <textarea
                value={notes}
                maxLength={5000}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record the ministry activity and support provided"
                rows={4}
              />
            </div>

            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Follow-up'}
            </button>
          </form>
        </div>
      )}

      <div className="member-form">
        <h3>Follow-up History</h3>

        {loading && <p>Loading follow-ups...</p>}
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        {!loading && records.length === 0 && (
          <p>No follow-up activities recorded yet.</p>
        )}

        {records.map((record) => (
          <div
            key={record.id}
            style={{
              padding: '14px 0',
              borderBottom: '1px solid #d6c9a8',
            }}
          >
            <strong>
              {record.follow_up_date.slice(0, 10)}
              {' — '}
              {methods[record.contact_method] ||
                record.contact_method}
            </strong>

            <p>
              Outcome: {outcomes[record.outcome] || record.outcome}
            </p>

            {record.notes && (
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {record.notes}
              </p>
            )}

            {record.next_follow_up_date && (
              <p>
                Next Follow-up:{' '}
                {record.next_follow_up_date.slice(0, 10)}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
