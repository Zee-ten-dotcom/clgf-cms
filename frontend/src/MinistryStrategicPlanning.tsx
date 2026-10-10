import { useCallback, useEffect, useState } from 'react';
import './ministry-strategic-planning.css';

type Plan = {
  id: string;
  ministry_id: string;
  ministry_name: string;
  plan_year: number;
  vision: string;
  goals: string;
  programmes: string;
  budget: string;
  quarter1: string;
  quarter2: string;
  quarter3: string;
  quarter4: string;
};

type Ministry = {
  id: string;
  name: string;
};

type PlanFields = {
  vision: string;
  goals: string;
  programmes: string;
  budget: string;
  quarter1: string;
  quarter2: string;
  quarter3: string;
  quarter4: string;
};

const blank: PlanFields = {
  vision: '',
  goals: '',
  programmes: '',
  budget: '',
  quarter1: '',
  quarter2: '',
  quarter3: '',
  quarter4: '',
};

const labels: Record<keyof PlanFields, string> = {
  vision: 'Ministry Vision and Objectives',
  goals: 'Annual Strategic Goals and Targets',
  programmes: 'Planned Programmes and Initiatives',
  budget: 'Estimated Budget and Resources Required',
  quarter1: 'Quarter 1 Evaluation',
  quarter2: 'Quarter 2 Evaluation',
  quarter3: 'Quarter 3 Evaluation',
  quarter4: 'Quarter 4 Evaluation',
};

export default function MinistryStrategicPlanning({
  apiBaseUrl, authFetch, role,
}: {
  apiBaseUrl: string;
  authFetch: any;
  role: string;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [view, setView] = useState<'plans' | 'editor'>('plans');
  const [ministryId, setMinistryId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [fields, setFields] = useState<PlanFields>({ ...blank });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([
        authFetch(`${apiBaseUrl}/ministry-planning`),
        authFetch(`${apiBaseUrl}/ministries`),
      ]);

      if (!p.ok || !m.ok) {
        throw Error('Unable to load ministry plans');
      }

      const [planData, ministryData] = await Promise.all([
        p.json(), m.json(),
      ]);

      setPlans(Array.isArray(planData) ? planData : []);
      const ministryList = Array.isArray(ministryData)
        ? ministryData
        : Array.isArray(ministryData?.data)
          ? ministryData.data
          : Array.isArray(ministryData?.ministries)
            ? ministryData.ministries
            : Array.isArray(ministryData?.items)
              ? ministryData.items
              : [];

      setMinistries(ministryList);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Unable to load plans'
      );
    }
  }, [apiBaseUrl, authFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  const edit = (plan?: Plan) => {
    if (plan) {
      setMinistryId(plan.ministry_id);
      setYear(plan.plan_year);
      setFields({
        vision: plan.vision || '',
        goals: plan.goals || '',
        programmes: plan.programmes || '',
        budget: plan.budget || '',
        quarter1: plan.quarter1 || '',
        quarter2: plan.quarter2 || '',
        quarter3: plan.quarter3 || '',
        quarter4: plan.quarter4 || '',
      });
    } else {
      setMinistryId('');
      setYear(new Date().getFullYear());
      setFields({ ...blank });
    }
    setMessage('');
    setView('editor');
  };

  const save = async () => {
    if (role !== 'ADMIN') {
      setMessage('Only administrators can save strategic plans.');
      return;
    }
    if (!ministryId || !fields.goals.trim()) {
      setMessage('Select a ministry and enter its annual goals.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const response = await authFetch(
        `${apiBaseUrl}/ministry-planning`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ministryId, year, ...fields,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Unable to save plan'
        );
      }

      await load();
      setView('plans');
      setMessage('Strategic plan saved successfully.');
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Unable to save plan'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="clgf-strategic">
      <div className="clgf-strategic-heading">
        <div>
          <h3>Ministry Strategic Planning</h3>
          <p>Annual objectives, programmes, budgets and quarterly reviews.</p>
        </div>
        <button type="button" onClick={() =>
          view === 'plans' ? edit() : setView('plans')
        }>
          {view === 'plans' ? '+ New Annual Plan' : '← View Plans'}
        </button>
      </div>

      {view === 'plans' && (
        <>
          <div className="clgf-strategic-stats">
            <div>
              <strong>{plans.length}</strong>
              <span>Annual Plans</span>
            </div>
            <div>
              <strong>{new Set(plans.map(p => p.ministry_id)).size}</strong>
              <span>Ministries With Plans</span>
            </div>
            <div>
              <strong>{plans.filter(p =>
                p.plan_year === new Date().getFullYear()
              ).length}</strong>
              <span>Current Year Plans</span>
            </div>
          </div>

          <div className="clgf-strategic-panel">
            <h3>Annual Ministry Plans</h3>
            {!plans.length && <p>No strategic plans recorded yet.</p>}
            {plans.map(plan => (
              <article className="clgf-strategic-card" key={plan.id}>
                <h4>{plan.ministry_name}</h4>
                <p><strong>Planning Year:</strong> {plan.plan_year}</p>
                <details>
                  <summary>View Strategic Plan</summary>
                  {Object.entries(labels).map(([key, label]) => (
                    <div key={key}>
                      <h4>{label}</h4>
                      <p>
                        {plan[key as keyof PlanFields] ||
                          'Not recorded'}
                      </p>
                    </div>
                  ))}
                </details>
                {role === 'ADMIN' && (<button type="button" onClick={() => edit(plan)}>
                  Edit / Quarterly Review
                </button>)}
              </article>
            ))}
          </div>
        </>
      )}

      {role === 'ADMIN' && view === 'editor' && (
        <div className="clgf-strategic-panel">
          <h3>Annual Ministry Strategic Plan</h3>

          <label>
            Ministry
            <select value={ministryId}
              onChange={e => {
                setMinistryId(e.target.value);
                const existing = plans.find(
                  p => p.ministry_id === e.target.value &&
                       p.plan_year === year
                );
                setFields(existing
                  ? Object.fromEntries(
                      Object.keys(blank).map(k => [
                        k, existing[k as keyof PlanFields] || '',
                      ])
                    ) as PlanFields
                  : { ...blank });
              }}>
              <option value="">Select Ministry</option>
              {ministries.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>

          <label>
            Planning Year
            <input type="number" min="2020" max="2100"
              value={year}
              onChange={e => {
                const nextYear = Number(e.target.value);
                setYear(nextYear);
                const existing = plans.find(
                  p => p.ministry_id === ministryId &&
                       p.plan_year === nextYear
                );
                setFields(existing
                  ? Object.fromEntries(
                      Object.keys(blank).map(k => [
                        k, existing[k as keyof PlanFields] || '',
                      ])
                    ) as PlanFields
                  : { ...blank });
              }}
            />
          </label>

          {Object.entries(labels).map(([key, label]) => (
            <label key={key}>
              {label}
              <textarea rows={3}
                value={fields[key as keyof PlanFields]}
                onChange={e => setFields(previous => ({
                  ...previous, [key]: e.target.value,
                }))}
              />
            </label>
          ))}

          <button type="button" disabled={busy}
            onClick={() => void save()}>
            Save Strategic Plan
          </button>
        </div>
      )}

      {message && <p role="status">{message}</p>}
      
    </section>
  );
}
