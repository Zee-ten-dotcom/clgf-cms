import { useCallback, useEffect, useState } from 'react';
import './church-assets.css';

type Asset = {
  id: string;
  name: string;
  category: string;
  asset_number: string;
  purchase_date: string | null;
  purchase_cost: string;
  estimated_value: string;
  condition: string;
  custodian: string;
  notes: string;
};

type Maintenance = {
  id: string;
  asset_id: string;
  description: string;
  maintenance_date: string;
  cost: string;
  performed_by: string;
};

const initial = {
  name: '',
  category: 'Sound & Audio',
  assetNumber: '',
  purchaseDate: '',
  purchaseCost: '0',
  estimatedValue: '0',
  condition: 'GOOD',
  custodian: '',
  notes: '',
};

const money = (value: string | number) =>
  Number(value || 0).toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });

export default function ChurchAssets({
  apiBaseUrl, authFetch, role,
}: {
  apiBaseUrl: string;
  authFetch: any;
  role: string;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [form, setForm] = useState({ ...initial });
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState('');
  const [maintenanceForm, setMaintenanceForm] = useState({
    description: '',
    maintenanceDate: new Date().toISOString().slice(0, 10),
    cost: '0',
    performedBy: '',
  });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await authFetch(
        `${apiBaseUrl}/church-assets`
      );
      if (!response.ok) throw Error('Unable to load assets');
      const data = await response.json();
      setAssets(Array.isArray(data.assets) ? data.assets : []);
      setMaintenance(
        Array.isArray(data.maintenance) ? data.maintenance : []
      );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Unable to load assets'
      );
    }
  }, [apiBaseUrl, authFetch]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!form.name.trim() || !form.assetNumber.trim()) {
      setMessage('Enter an asset name and asset number.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await authFetch(
        `${apiBaseUrl}/church-assets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            purchaseCost: Number(form.purchaseCost),
            estimatedValue: Number(form.estimatedValue),
          }),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Unable to save asset'
        );
      }
      await load();
      setForm({ ...initial });
      setAdding(false);
      setMessage('Asset registered successfully.');
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Unable to save asset'
      );
    } finally {
      setBusy(false);
    }
  };

  const saveMaintenance = async () => {
    if (!selected || !maintenanceForm.description.trim()) {
      setMessage('Enter maintenance details.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await authFetch(
        `${apiBaseUrl}/church-assets/${selected}/maintenance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...maintenanceForm,
            cost: Number(maintenanceForm.cost),
          }),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Unable to record maintenance'
        );
      }
      await load();
      setSelected('');
      setMaintenanceForm({
        description: '',
        maintenanceDate: new Date().toISOString().slice(0, 10),
        cost: '0',
        performedBy: '',
      });
      setMessage('Maintenance recorded successfully.');
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Unable to save maintenance'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="clgf-assets">
      <div className="clgf-assets-heading">
        <div>
          <h2>Church Asset & Equipment Management</h2>
          <p>Church property, custodians and maintenance.</p>
        </div>
        {role === 'ADMIN' && (
          <button onClick={() => setAdding(!adding)}>
            {adding ? '← Asset Register' : '+ Register Asset'}
          </button>
        )}
      </div>

      <div className="clgf-assets-stats">
        <div><strong>{assets.length}</strong><span>Total Assets</span></div>
        <div>
          <strong>{assets.filter(a =>
            a.condition !== 'GOOD').length}</strong>
          <span>Need Attention</span>
        </div>
        <div>
          <strong>{money(assets.reduce(
            (sum, a) => sum + Number(a.estimated_value), 0
          ))}</strong>
          <span>Estimated Asset Value</span>
        </div>
        <div>
          <strong>{money(maintenance.reduce(
            (sum, m) => sum + Number(m.cost), 0
          ))}</strong>
          <span>Maintenance Costs</span>
        </div>
      </div>

      {adding && role === 'ADMIN' && (
        <div className="clgf-assets-panel">
          <h3>Register Church Asset</h3>
          {([
            ['name', 'Equipment Name'],
            ['assetNumber', 'Asset Number'],
            ['custodian', 'Assigned Custodian'],
            ['purchaseDate', 'Purchase Date'],
            ['purchaseCost', 'Purchase Cost (R)'],
            ['estimatedValue', 'Estimated Value (R)'],
          ] as const).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type={
                  key === 'purchaseDate' ? 'date' :
                  key === 'purchaseCost' ||
                  key === 'estimatedValue' ? 'number' : 'text'
                }
                min={key === 'purchaseCost' ||
                  key === 'estimatedValue' ? '0' : undefined}
                step={key === 'purchaseCost' ||
                  key === 'estimatedValue' ? '0.01' : undefined}
                value={form[key]}
                onChange={e => setForm(previous => ({
                  ...previous, [key]: e.target.value,
                }))}
              />
            </label>
          ))}
          <label>Category
            <select value={form.category}
              onChange={e => setForm(p => ({
                ...p, category: e.target.value,
              }))}>
              {[
                'Sound & Audio', 'Musical Instruments',
                'Furniture', 'Computers & Technology',
                'Electrical', 'Kitchen', 'Other',
              ].map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Condition
            <select value={form.condition}
              onChange={e => setForm(p => ({
                ...p, condition: e.target.value,
              }))}>
              <option value="GOOD">Good</option>
              <option value="NEEDS_REPAIR">Needs Repair</option>
              <option value="DAMAGED">Damaged</option>
            </select>
          </label>
          <label>Notes
            <textarea rows={3} value={form.notes}
              onChange={e => setForm(p => ({
                ...p, notes: e.target.value,
              }))}/>
          </label>
          <button disabled={busy} onClick={() => void save()}>
            Save Asset
          </button>
        </div>
      )}

      <div className="clgf-assets-panel">
        <h3>Church Asset Register</h3>
        {!assets.length && <p>No assets registered yet.</p>}
        <div className="clgf-assets-grid">
          {assets.map(asset => (
            <article className="clgf-assets-card" key={asset.id}>
              <h4>{asset.name}</h4>
              <p><strong>Asset No:</strong> {asset.asset_number}</p>
              <p><strong>Category:</strong> {asset.category}</p>
              <p><strong>Condition:</strong> {
                asset.condition.replaceAll('_', ' ')
              }</p>
              <p><strong>Custodian:</strong> {
                asset.custodian || 'Not assigned'
              }</p>
              <p><strong>Estimated Value:</strong> {
                money(asset.estimated_value)
              }</p>
              {asset.notes && <p>{asset.notes}</p>}
              <details>
                <summary>Maintenance History ({
                  maintenance.filter(m =>
                    m.asset_id === asset.id).length
                })</summary>
                {maintenance.filter(m =>
                  m.asset_id === asset.id
                ).map(m => (
                  <div key={m.id} className="clgf-maintenance-entry">
                    <strong>{String(m.maintenance_date).slice(0, 10)}</strong>
                    <p>{m.description}</p>
                    <p>Cost: {money(m.cost)}</p>
                    <p>By: {m.performed_by || 'Not specified'}</p>
                  </div>
                ))}
              </details>
              {role === 'ADMIN' && (
                <button onClick={() =>
                  setSelected(selected === asset.id ? '' : asset.id)
                }>
                  {selected === asset.id
                    ? 'Cancel Maintenance'
                    : '+ Record Maintenance'}
                </button>
              )}
              {selected === asset.id && role === 'ADMIN' && (
                <div className="clgf-assets-maintenance-form">
                  <label>Maintenance Date
                    <input type="date"
                      value={maintenanceForm.maintenanceDate}
                      onChange={e => setMaintenanceForm(p => ({
                        ...p, maintenanceDate: e.target.value,
                      }))}/>
                  </label>
                  <label>Description
                    <textarea rows={3}
                      value={maintenanceForm.description}
                      onChange={e => setMaintenanceForm(p => ({
                        ...p, description: e.target.value,
                      }))}/>
                  </label>
                  <label>Cost (R)
                    <input type="number" min="0" step="0.01"
                      value={maintenanceForm.cost}
                      onChange={e => setMaintenanceForm(p => ({
                        ...p, cost: e.target.value,
                      }))}/>
                  </label>
                  <label>Performed By
                    <input value={maintenanceForm.performedBy}
                      onChange={e => setMaintenanceForm(p => ({
                        ...p, performedBy: e.target.value,
                      }))}/>
                  </label>
                  <button disabled={busy}
                    onClick={() => void saveMaintenance()}>
                    Save Maintenance
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
