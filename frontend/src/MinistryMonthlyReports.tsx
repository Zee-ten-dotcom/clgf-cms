import './ministry-report-cards.css';
import { useCallback, useEffect, useState } from 'react';

type Report = {id:string;ministry_id:string;ministry_name:string;report_month:string;activities:string;achievements:string;challenges:string;assistance_required:string;next_plans:string;status:string};
type Ministry = {id:string;name:string;leader_id?:string|null};
type Fields = {activities:string;achievements:string;challenges:string;assistanceRequired:string;nextPlans:string};
const empty:Fields = {activities:'',achievements:'',challenges:'',assistanceRequired:'',nextPlans:''};
const labels:Record<keyof Fields,string> = {activities:'Activities completed',achievements:'Achievements',challenges:'Challenges',assistanceRequired:'Assistance required',nextPlans:'Plans for next month'};
export default function MinistryMonthlyReports({apiBaseUrl,authFetch,role}:{apiBaseUrl:string;authFetch:any;role:string}) {
 const [ministries,setMinistries]=useState<Ministry[]>([]);
 const [reports,setReports]=useState<Report[]>([]);
 const [ministryId,setMinistryId]=useState('');
 const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
 const [fields,setFields]=useState<Fields>(empty);
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const load=useCallback(async()=>{
  try {
   const [m,r]=await Promise.all([authFetch(`${apiBaseUrl}/ministries`),authFetch(`${apiBaseUrl}/ministry-monthly-reports`)]);
   if(!m.ok||!r.ok) throw Error('Unable to load ministry reports');
   const [ms,rs]=await Promise.all([m.json(),r.json()]);
   setMinistries(Array.isArray(ms)?ms:[]);setReports(Array.isArray(rs)?rs:[]);
  } catch(e) {setMessage(e instanceof Error?e.message:'Unable to load reports')}
 },[apiBaseUrl,authFetch]);
 useEffect(()=>{void load()},[load]);
 useEffect(()=>{
  const r=reports.find(x=>x.ministry_id===ministryId&&x.report_month===month);
  setFields(r?{activities:r.activities,achievements:r.achievements,challenges:r.challenges,assistanceRequired:r.assistance_required,nextPlans:r.next_plans}:empty);
 },[reports,ministryId,month]);
 const save=async(status:'DRAFT'|'SUBMITTED')=>{
  if(!ministryId){setMessage('Select a ministry first');return}
  setBusy(true);setMessage('');
  try {
   const r=await authFetch(`${apiBaseUrl}/ministry-monthly-reports`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ministryId,month,...fields,status})});
   if(!r.ok){const data=await r.json().catch(()=>({}));throw Error(Array.isArray(data.message)?data.message.join(', '):data.message||'Unable to save report')}
   await load();setMessage(status==='DRAFT'?'Draft saved':'Report submitted');
  }catch(e){setMessage(e instanceof Error?e.message:'Unable to save report')}finally{setBusy(false)}
 };
 return <section className="member-form" style={{padding:18,margin:'20px 0',background:'#fff',color:'#222',border:'1px solid #d4af37',borderRadius:10}}>
  <h2>Ministry Monthly Reports</h2><p>Monthly department activities, achievements, challenges and next steps.</p>
  <label>Ministry <select value={ministryId} onChange={e=>setMinistryId(e.target.value)}><option value="">Select ministry</option>{ministries.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
  <label style={{marginLeft:12}}>Month <input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label>
  {Object.entries(labels).map(([key,label])=><label key={key} style={{display:'block',marginTop:12}}><strong>{label}</strong><textarea rows={3} style={{display:'block',width:'100%'}} value={fields[key as keyof Fields]} onChange={e=>setFields(p=>({...p,[key]:e.target.value}))}/></label>)}
  <div style={{display:'flex',gap:12,marginTop:12}}><button disabled={busy} type="button" onClick={()=>void save('DRAFT')}>Save Draft</button><button disabled={busy} type="button" onClick={()=>void save('SUBMITTED')}>Submit Report</button></div>
  {message&&<p role="status">{message}</p>}
  
  <div id="clgf-ministry-monthly-print">
    <h3>
      {role === 'ADMIN'
        ? 'Ministry Leadership Review'
        : 'My Ministry Reports'}
    </h3>

    {role === 'ADMIN' && (
      <p>
        <strong>Total: {reports.length}</strong>
        {' | '}Submitted: {reports.filter(r => r.status === 'SUBMITTED').length}
        {' | '}Drafts: {reports.filter(r => r.status === 'DRAFT').length}
      </p>
    )}

    {reports.length === 0 && <p>No reports available.</p>}

    <div className="clgf-report-list">
      {reports.map(r => (
        <article
          key={r.id}
          className="clgf-report-card"
          data-report-id={r.id}
        >
          <h4>{r.ministry_name}</h4>
          <p><strong>Month:</strong> {r.report_month}</p>
          <p><strong>Status:</strong> {r.status}</p>

          <details>
            <summary style={{cursor:'pointer',padding:'10px 0'}}>
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
              <p>{r.assistance_required || 'None recorded'}</p>
              <h4>Plans for Next Month</h4>
              <p>{r.next_plans || 'None recorded'}</p>
            </div>
          </details>

          <button
            type="button"
            onClick={() => {
              const root = document.getElementById('clgf-ministry-monthly-print');
              root?.querySelectorAll('.clgf-report-card').forEach(card => {
                card.classList.toggle(
                  'clgf-print-selected',
                  card.getAttribute('data-report-id') === r.id
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

 </section>
}
