import { useCallback, useEffect, useState } from 'react';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  home_cell_id?: string | null;
};

type HomeCell = {
  id: string;
  name: string;
};

type Transfer = {
  id: string;
  first_name: string;
  last_name: string;
  from_home_cell_name?: string;
  to_home_cell_name: string;
  status: string;
  reason?: string;
  requested_at: string;
};

type Props = {
  members: Member[];
  homeCells: HomeCell[];
  role: string;
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onApproved: () => void;
};

export default function MemberTransfers({
  members, homeCells, role, apiUrl, authFetch, onApproved,
}: Props) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [allowedCells, setAllowedCells] = useState<string[]>([]);
  const [memberId, setMemberId] = useState('');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await authFetch(`${apiUrl}/member-transfers`);
      if (!response.ok) throw new Error('Unable to load transfers');
      const data = await response.json();
      setTransfers(Array.isArray(data) ? data : []);
    } catch {
      setMessage('Unable to load transfer history.');
    }
  }, [authFetch, apiUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (role === 'ADMIN') return;
    let active = true;
    authFetch(`${apiUrl}/attendance/context`)
      .then(async response => {
        if (!response.ok) throw new Error('Access unavailable');
        return response.json();
      })
      .then(data => {
        if (active) {
          setAllowedCells(
            Array.isArray(data.homeCells)
              ? data.homeCells.map((cell: HomeCell) => cell.id)
              : [],
          );
        }
      })
      .catch(() => {
        if (active) setAllowedCells([]);
      });
    return () => { active = false; };
  }, [authFetch, apiUrl, role]);

  const eligibleMembers = members.filter(member =>
    role === 'ADMIN' ||
    (member.home_cell_id && allowedCells.includes(member.home_cell_id)),
  );

  async function submit() {
    if (!memberId || !destination || !reason.trim()) {
      setMessage('Select a member, destination and reason.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await authFetch(`${apiUrl}/member-transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          toHomeCellId: destination,
          reason: reason.trim(),
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          typeof error.message === 'string'
            ? error.message
            : 'Transfer request failed',
        );
      }
      setMessage('Transfer request submitted successfully.');
      setMemberId('');
      setDestination('');
      setReason('');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  async function review(id: string, decision: 'APPROVED' | 'REJECTED') {
    if (!window.confirm(`${decision === 'APPROVED' ? 'Approve' : 'Reject'} this transfer?`)) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await authFetch(
        `${apiUrl}/member-transfers/${id}/review`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision }),
        },
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          typeof error.message === 'string'
            ? error.message
            : 'Review failed',
        );
      }
      setMessage(`Transfer ${decision.toLowerCase()}.`);
      await load();
      if (decision === 'APPROVED') onApproved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Review failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="member-profile-section">
      <div className="member-profile-heading">
        <div>
          <h3>Member Transfers</h3>
          <p>Home Cell transfer requests and history</p>
        </div>
        <button type="button" className="edit-button"
          onClick={() => setOpen(!open)}>
          {open ? 'Close Transfers' : 'Manage Transfers'}
        </button>
      </div>

      {open && (
        <div>
          <h4>Request Home Cell Transfer</h4>
          <div className="member-tools">
            <select aria-label="Select member" value={memberId}
              onChange={e => setMemberId(e.target.value)}>
              <option value="">Select Member</option>
              {eligibleMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>

            <select aria-label="Destination Home Cell" value={destination}
              onChange={e => setDestination(e.target.value)}>
              <option value="">Destination Home Cell</option>
              {homeCells
                .filter(cell =>
                  cell.id !== members.find(m => m.id === memberId)?.home_cell_id
                )
                .map(cell => (
                  <option key={cell.id} value={cell.id}>{cell.name}</option>
                ))}
            </select>

            <input
              type="text"
              placeholder="Reason for transfer"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <button type="button" className="edit-button"
              disabled={busy || eligibleMembers.length === 0}
              onClick={submit}>
              Request Transfer
            </button>
          </div>

          {message && <p role="status">{message}</p>}

          <h4>Transfer History</h4>
          {transfers.length === 0 ? (
            <p>No transfer requests recorded.</p>
          ) : (
            <div className="members-list">
              {transfers.map(transfer => (
                <div className="member-card" key={transfer.id}>
                  <strong>
                    {transfer.first_name} {transfer.last_name}
                  </strong>
                  <p>
                    {transfer.from_home_cell_name || 'Unassigned'}
                    {' → '}
                    {transfer.to_home_cell_name}
                  </p>
                  <p>Status: <strong>{transfer.status}</strong></p>
                  <p>Reason: {transfer.reason || 'Not specified'}</p>
                  <p>
                    Requested: {new Date(transfer.requested_at).toLocaleDateString()}
                  </p>
                  {role === 'ADMIN' && transfer.status === 'PENDING' && (
                    <div className="member-actions">
                      <button type="button" disabled={busy}
                        onClick={() => review(transfer.id, 'APPROVED')}>
                        Approve
                      </button>
                      <button type="button" disabled={busy}
                        onClick={() => review(transfer.id, 'REJECTED')}>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
