import { useEffect, useState } from 'react';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  membership_number?: string;
};

type Props = {
  apiUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRegister: () => void;
};

export default function YouthMembers({
  apiUrl, authFetch, onRegister,
}: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [churchMembers, setChurchMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [youthResponse, churchResponse] = await Promise.all([
        authFetch(`${apiUrl}/youth/members`),
        authFetch(`${apiUrl}/members`),
      ]);
      if (!youthResponse.ok || !churchResponse.ok)
        throw new Error('Unable to load members');

      const youth = await youthResponse.json();
      const church = await churchResponse.json();

      setMembers(Array.isArray(youth) ? youth : []);
      setChurchMembers(Array.isArray(church) ? church : []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loading failed');
    }
  }

  useEffect(() => { void load(); }, []);

  async function addMember() {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await authFetch(`${apiUrl}/youth/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: selected }),
      });
      if (!response.ok) throw new Error(await response.text());
      setSelected('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add member');
    } finally {
      setSaving(false);
    }
  }


  async function removeMember(id: string) {
    if (!window.confirm('Remove this member from Youth Ministry?')) return;
    try {
      const response = await authFetch(
        `${apiUrl}/youth/members/${id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error(await response.text());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove member');
    }
  }

  const existing = new Set(members.map(member => member.id));

  return (
    <section className="clgf-youth-manager">
      <h3>Youth Members</h3>
      <button type="button" onClick={onRegister}>
        Register New Member
      </button>

      <h4>Add Existing Church Member</h4>
      <select
        aria-label="Select church member"
        value={selected}
        onChange={e => setSelected(e.target.value)}
      >
        <option value="">Select Member</option>
        {churchMembers.filter(m => !existing.has(m.id)).map(m => (
          <option key={m.id} value={m.id}>
            {m.first_name} {m.last_name}
          </option>
        ))}
      </select>
      <button type="button" disabled={!selected || saving}
        onClick={() => void addMember()}>
        {saving ? 'Adding...' : 'Add to Youth Ministry'}
      </button>

      {error && <p role="alert">{error}</p>}

      <h4>Youth Ministry Members ({members.length})</h4>
      {members.length === 0 && <p>No youth members added yet.</p>}
      {members.map(m => (
        <div className="clgf-youth-service" key={m.id}>
          <strong>{m.first_name} {m.last_name}</strong>
          <p>{m.membership_number || ''}</p>
          <button
            type="button"
            onClick={() => void removeMember(m.id)}
          >
            Remove from Youth Ministry
          </button>
        </div>
      ))}
    </section>
  );
}
