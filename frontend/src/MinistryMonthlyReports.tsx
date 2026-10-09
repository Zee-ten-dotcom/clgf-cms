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
  <div id="clgf-ministry-monthly-print"><h3>{role==='ADMIN'?'Ministry Leadership Review':'My Ministry Reports'}</h3><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Month','Ministry','Status','Activities','Achievements','Challenges','Assistance','Next Plans'].map(h=><th key={h} style={{textAlign:'left',padding:8,borderBottom:'2px solid #d4af37'}}>{h}</th>)}</tr></thead><tbody>{reports.map(r=><tr key={r.id}>{[r.report_month,r.ministry_name,r.status,r.activities,r.achievements,r.challenges,r.assistance_required,r.next_plans].map((v,i)=><td key={i} style={{padding:8,borderBottom:'1px solid #ddd',verticalAlign:'top'}}>{v}</td>)}</tr>)}</tbody></table></div></div>
  <button type="button" onClick={()=>window.print()} style={{marginTop:16}}>Print Reports</button>
 </section>
}
