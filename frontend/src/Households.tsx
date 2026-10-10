import { useEffect, useState } from 'react';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
};

type HouseholdMember = Member & {
  member_id: string;
  relationship: string;
};

type Household = {
  id: string;
  name: string;
  address: string;
  phone: string;
  members: HouseholdMember[];
};

type Props = {
  members: Member[];
  role: string;
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

export default function Households({
  members, role, apiUrl, authFetch,
}: Props) {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [householdId, setHouseholdId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [relationship, setRelationship] = useState('HEAD');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const response = await authFetch(`${apiUrl}/households`);
      if (!response.ok) throw new Error('Unable to load households');
      const data = await response.json();
      setHouseholds(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Loading failed');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function send(url: string, options: RequestInit) {
    setBusy(true);
    setMessage('');
    try {
      const response = await authFetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Operation failed',
        );
      }
      await load();
      setMessage('Household information updated successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '12px',
    marginBottom: '10px',
  };

  return (
    <section className="member-profile-section">
      <div className="member-profile-heading">
        <div>
          <h3>Family & Household Management</h3>
          <p>Household groups and family relationships</p>
        </div>
        <button type="button" className="edit-button"
          onClick={() => setOpen(!open)}>
          {open ? 'Close Households' : 'Manage Households'}
        </button>
      </div>

      {open && (
        <div>
          {role === 'ADMIN' && (
            <>
              <h4>Create Household</h4>
              <input style={inputStyle} placeholder="Household / Family name"
                value={name} onChange={e => setName(e.target.value)} />
              <input style={inputStyle} placeholder="Household address"
                value={address} onChange={e => setAddress(e.target.value)} />
              <input style={inputStyle} placeholder="Contact phone"
                value={phone} onChange={e => setPhone(e.target.value)} />
              <button type="button" className="edit-button"
                disabled={busy || !name.trim()}
                onClick={async () => {
                  await send(`${apiUrl}/households`, {
                    method: 'POST',
                    body: JSON.stringify({ name, address, phone }),
                  });
                  setName('');
                  setAddress('');
                  setPhone('');
                }}>
                Create Household
              </button>

              <h4>Assign Member to Household</h4>
              <select style={inputStyle} value={householdId}
                onChange={e => setHouseholdId(e.target.value)}>
                <option value="">Select Household</option>
                {households.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              <select style={inputStyle} value={memberId}
                onChange={e => setMemberId(e.target.value)}>
                <option value="">Select Member</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
              <select style={inputStyle} value={relationship}
                onChange={e => setRelationship(e.target.value)}>
                {['HEAD', 'SPOUSE', 'CHILD', 'PARENT', 'GUARDIAN', 'OTHER']
                  .map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="button" className="edit-button"
                disabled={busy || !householdId || !memberId}
                onClick={() => send(
                  `${apiUrl}/households/${householdId}/members`,
                  {
                    method: 'POST',
                    body: JSON.stringify({ memberId, relationship }),
                  },
                )}>
                Assign Member
              </button>
            </>
          )}

          {message && <p role="status">{message}</p>}

          <h4>Registered Households ({households.length})</h4>
          {households.length === 0 && <p>No households registered yet.</p>}

          {households.map(h => (
            <div key={h.id} className="member-card"
              style={{ marginBottom: '14px' }}>
              <h4>{h.name}</h4>
              <p>Address: {h.address || 'Not provided'}</p>
              <p>Phone: {h.phone || 'Not provided'}</p>
              <p>Family Members: {h.members.length}</p>
              {h.members.map(m => (
                <div key={m.member_id}
                  style={{
                    padding: '10px 0',
                    borderTop: '1px solid #ddd',
                  }}>
                  <strong>{m.first_name} {m.last_name}</strong>
                  <span> — {m.relationship}</span>
                  {role === 'ADMIN' && (
                    <button type="button" disabled={busy}
                      style={{ marginLeft: '12px' }}
                      onClick={() => {
                        if (!window.confirm('Remove member from household?')) return;
                        void send(
                          `${apiUrl}/households/${h.id}/members/${m.member_id}`,
                          { method: 'DELETE' },
                        );
                      }}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
