import { useEffect, useState } from 'react';

type Props = {
  caseId: string;
  apiBaseUrl: string;
  authFetch: typeof fetch;
};

type Closure = {
  status: string;
  reason: string | null;
  actor_name: string | null;
  actor_email: string | null;
  created_at: string;
};

export default function PastoralClosureHistory({
  caseId, apiBaseUrl, authFetch,
}: Props) {
  const [records, setRecords] = useState<Closure[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    authFetch(`${apiBaseUrl}/pastoral-care/${caseId}/closure-history`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load closure history');
        return response.json();
      })
      .then((data) => {
        if (active) setRecords(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [caseId, apiBaseUrl, authFetch]);

  return (
    <div className="member-form">
      <h3>Case Closure History</h3>
      {loading && <p>Loading closure history...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && records.length === 0 && (
        <p>No recorded closure decision found.</p>
      )}
      {records.map((record, index) => (
        <div key={index} style={{
          borderTop: '1px solid #ddd',
          padding: '14px 0',
        }}>
          <p><strong>Decision:</strong> {record.status}</p>
          <p><strong>Reason:</strong> {record.reason || 'Not recorded'}</p>
          <p><strong>Date:</strong> {new Date(record.created_at).toLocaleString()}</p>
          <p><strong>Administrator:</strong> {
            record.actor_name || record.actor_email || 'Not recorded'
          }</p>
        </div>
      ))}
    </div>
  );
}
