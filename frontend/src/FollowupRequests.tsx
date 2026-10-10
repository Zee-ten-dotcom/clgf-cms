import { useEffect, useState } from 'react';

type Request = {
  id: string;
  member_id: string;
  pastoral_care_id?: string | null;
  first_name: string;
  last_name: string;
  home_cell_name?: string;
  reason: string;
  status: string;
  created_at: string;
};

type Props = {
  role: string;
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onCreateCase: (memberId: string, requestId: string) => void;
};

export default function FollowupRequests({
  role, apiUrl, authFetch, onCreateCase,
}: Props) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await authFetch(
        `${apiUrl}/member-followup-requests`
      );
      if (!response.ok) throw new Error('Unable to load requests');
      setRequests(await response.json());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function review(id: string, decision: 'APPROVED' | 'REJECTED') {
    try {
      const response = await authFetch(
        `${apiUrl}/member-followup-requests/${id}/review`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision }),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed');
    }
  }

  return (
    <section style={{ marginTop: 24 }}>
      <h3>Member Follow-Up Requests</h3>
      <button type="button" onClick={() => void load()}>
        Refresh Requests
      </button>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && requests.length === 0 && <p>No follow-up requests.</p>}
      {requests.map(r => (
        <div key={r.id} style={{
          border: '1px solid #d4af37',
          borderRadius: 8,
          padding: 14,
          marginTop: 12,
        }}>
          <strong>{r.first_name} {r.last_name}</strong>
          <p>{r.home_cell_name || 'No Home Cell'}</p>
          <p>Reason: {r.reason}</p>
          <p>Status: <strong>{r.status}</strong></p>
          <p>Requested: {new Date(r.created_at).toLocaleDateString()}</p>
          {role === 'ADMIN' && r.status === 'PENDING' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => void review(r.id, 'APPROVED')}>
                Approve
              </button>
              <button type="button" onClick={() => void review(r.id, 'REJECTED')}>
                Reject
              </button>
            </div>
          )}
          {r.pastoral_care_id && (
            <p><strong>Case Created</strong></p>
          )}
          {role === 'ADMIN' && r.status === 'APPROVED' && !r.pastoral_care_id && (
            <button type="button" onClick={() => onCreateCase(r.member_id, r.id)}>
              Create Pastoral Care Case
            </button>
          )}
        </div>
      ))}
    </section>
  );
}
