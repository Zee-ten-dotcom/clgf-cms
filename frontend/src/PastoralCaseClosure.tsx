import { useState } from 'react';

type Props = {
  caseId: string;
  apiBaseUrl: string;
  authFetch: typeof fetch;
  onClosed: () => void;
};

export default function PastoralCaseClosure({
  caseId,
  apiBaseUrl,
  authFetch,
  onClosed,
}: Props) {
  const [status, setStatus] = useState<'COMPLETED' | 'CLOSED'>('COMPLETED');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await authFetch(
        `${apiBaseUrl}/pastoral-care/${caseId}/close`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, reason: reason.trim() }),
        },
      );

      if (!response.ok) {
        throw new Error('Unable to complete or close case');
      }

      onClosed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="member-form">
      <h3>Complete / Close Pastoral Care Case</h3>
      <p>Administrator only</p>

      <form onSubmit={submit}>
        <div className="form-group">
          <label>Case Decision</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as 'COMPLETED' | 'CLOSED')
            }
          >
            <option value="COMPLETED">Mark Completed</option>
            <option value="CLOSED">Close Case</option>
          </select>
        </div>

        <div className="form-group">
          <label>Reason for Completion / Closure</label>
          <textarea
            required
            minLength={5}
            maxLength={2000}
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Record the reason and final outcome"
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Confirm Case Decision'}
        </button>
      </form>
    </div>
  );
}
