import { useState, useEffect } from "react";
import Icon from "./Icon";
import { fmt, statusLabel, initials } from "../utils/helpers";
import { serviceOrderAPI } from "../services/api";

// ── Validation ────────────────────────────────────────────────────────────────
const EMPTY_ERRORS = {
  vehicleId: "", mechanicId: "", serviceType: "", customerComplaint: "",
  mileageIn: "", labor: "", parts: "",
};

function validateJob(job) {
  const errors = { ...EMPTY_ERRORS };

  if (!job.vehicleId)
    errors.vehicleId = "Please select a vehicle / customer.";

  if (!job.mechanicId)
    errors.mechanicId = "Please assign a mechanic.";

  if (!job.serviceType.trim())
    errors.serviceType = "Service type is required.";
  else if (job.serviceType.trim().length < 3)
    errors.serviceType = "Service type must be at least 3 characters.";
  else if (job.serviceType.trim().length > 100)
    errors.serviceType = "Service type must be under 100 characters.";

  if (!job.customerComplaint.trim())
    errors.customerComplaint = "Please describe the customer complaint or issue.";
  else if (job.customerComplaint.trim().length < 10)
    errors.customerComplaint = "Description must be at least 10 characters.";
  else if (job.customerComplaint.trim().length > 1000)
    errors.customerComplaint = "Description must be under 1000 characters.";

  if (job.mileageIn !== "" && job.mileageIn !== null && job.mileageIn !== undefined) {
    const mi = parseInt(job.mileageIn);
    if (isNaN(mi) || mi < 0)
      errors.mileageIn = "Mileage must be a whole number >= 0.";
    else if (mi > 2000000)
      errors.mileageIn = "Mileage seems too high. Please double-check.";
  }

  const badLabor = job.laborCharges.some(l => !l.desc.trim() || l.hours <= 0 || l.rate < 0);
  if (job.laborCharges.length > 0 && badLabor)
    errors.labor = "Each labor row needs a description, hours > 0, and a valid rate.";

  const badParts = job.partsUsed.some(p => !p.partId || p.qty <= 0);
  if (job.partsUsed.length > 0 && badParts)
    errors.parts = "Each part row must have a part selected and quantity > 0.";

  return errors;
}

function hasErrors(errors) {
  return Object.values(errors).some(v => v !== "");
}

// ── FieldError component ──────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5,
                  color:"#DC2626", fontSize:12, fontWeight:500 }}>
      <span style={{ fontSize:13 }}>⚠</span> {msg}
    </div>
  );
}

// ── SectionHeading ────────────────────────────────────────────────────────────
const SectionHeading = ({ label, action }) => (
  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,marginTop:20,paddingBottom:8,borderBottom:"1.5px solid var(--gray-100)" }}>
    <span style={{ fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:".6px",color:"var(--navy)" }}>{label}</span>
    {action}
  </div>
);

// ── Status / Priority maps ────────────────────────────────────────────────────
const STATUS_MAP = {
  "pending":"PENDING","in-progress":"IN_PROGRESS","in_progress":"IN_PROGRESS","completed":"COMPLETED",
  "PENDING":"pending","IN_PROGRESS":"in-progress","COMPLETED":"completed",
  "DIAGNOSED":"pending","WAITING_PARTS":"in-progress","DELIVERED":"completed","CANCELLED":"completed",
};
const toFrontend   = (s) => STATUS_MAP[s] || (s||"").toLowerCase().replace("_","-");
const toBackend    = (s) => STATUS_MAP[s] || (s||"").toUpperCase().replace("-","_");
const PRIORITY_MAP = {"normal":"MEDIUM","high":"HIGH","urgent":"URGENT","low":"LOW","MEDIUM":"normal","HIGH":"high","URGENT":"urgent","LOW":"low"};
const toFePriority = (p) => PRIORITY_MAP[p] || (p||"").toLowerCase();
const toBePriority = (p) => PRIORITY_MAP[p] || (p||"").toUpperCase();

// ── JobDetailModal ────────────────────────────────────────────────────────────
function JobDetailModal({ job, onClose, onStatusChange }) {
  if (!job) return null;
  const laborTotal = (job.serviceItems||job.laborCharges||[]).reduce((a,l)=>a+(l.totalPrice||l.total||0),0);
  const partsTotal = (job.serviceParts||job.partsUsed||[]).reduce((a,p)=>a+(p.totalPrice||p.total||0),0);
  const grandTotal = laborTotal + partsTotal;
  const status     = toFrontend(job.status);
  const nextStatus = {pending:"in-progress","in-progress":"completed",completed:"pending"};
  const nextLabel  = {pending:"Start Job","in-progress":"Mark Complete",completed:"Reopen"};
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg" style={{ maxWidth:860 }}>
        <div className="modal-header">
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <span className="modal-title">Job Card — {job.orderNumber||job.id}</span>
            <span className={`badge badge-${status}`}>{statusLabel(status)}</span>
            <span className={`badge badge-${toFePriority(job.priority)}`}>{toFePriority(job.priority)}</span>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button className="btn btn-primary btn-sm" onClick={()=>{onStatusChange(job.id,nextStatus[status]);onClose();}}>{nextLabel[status]}</button>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}><Icon name="x"/></button>
          </div>
        </div>
        <div className="modal-body" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
          <div>
            <SectionHeading label="Vehicle & Customer"/>
            {[["Customer",job.customerName||job.owner],["Vehicle",job.vehicleInfo||job.vehicle],["Plate",job.vehiclePlate||job.plate],
              ["Odometer In",(job.mileageIn||job.odometerIn)?(Number(job.mileageIn||job.odometerIn).toLocaleString()+" mi"):null],
              ["Date",job.dateIn||job.created]].filter(([,v])=>v).map(([l,v])=>(
              <div key={l} style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6 }}>
                <span style={{ color:"var(--gray-400)",fontWeight:600 }}>{l}</span>
                <span style={{ fontWeight:700 }}>{v}</span>
              </div>
            ))}
            <SectionHeading label="Assigned Mechanic"/>
            <div style={{ display:"flex",alignItems:"center",gap:10,fontSize:13 }}>
              <div className="avatar" style={{ width:34,height:34,fontSize:13 }}>{initials(job.mechanicName||job.mechanic)}</div>
              <span style={{ fontWeight:600 }}>{job.mechanicName||job.mechanic}</span>
            </div>
            <SectionHeading label="Issue / Diagnosis"/>
            <p style={{ fontSize:13,color:"var(--gray-600)",lineHeight:1.6 }}>{job.customerComplaint||job.issue}</p>
            {(job.technicianNotes||job.mechanicNotes)&&(<>
              <SectionHeading label="Mechanic Notes"/>
              <p style={{ fontSize:13,color:"var(--gray-600)",lineHeight:1.6,background:"var(--amber-light)",padding:"10px 14px",borderRadius:8,borderLeft:"3px solid var(--amber)" }}>{job.technicianNotes||job.mechanicNotes}</p>
            </>)}
          </div>
          <div>
            <SectionHeading label="Cost Summary"/>
            <div style={{ background:"var(--gray-50)",borderRadius:8,padding:"14px 16px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--gray-500)",marginBottom:6 }}><span>Parts</span><span>${fmt(job.partsCost||partsTotal)}</span></div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--gray-500)",marginBottom:10 }}><span>Labor</span><span>${fmt(job.laborCost||laborTotal)}</span></div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700,color:"var(--gray-800)",borderTop:"1.5px solid var(--gray-200)",paddingTop:10 }}>
                <span>Total</span><span style={{ color:"var(--accent)" }}>${fmt(job.totalCost||grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function JobCardsModule({ jobs, setJobs, vehicles, inventory = [] }) {
  const [showNew,   setShowNew]   = useState(false);
  const [viewing,   setViewing]   = useState(null);
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const mechanics = [
    { id: 1,  fullName: "Ashan Perera"    },
    { id: 2,  fullName: "Nuwan Silva"     },
    { id: 3,  fullName: "Kasun Fernando"  },
    { id: 4,  fullName: "Dimuth Jayawardena" },
    { id: 5,  fullName: "Pradeep Bandara" },
    { id: 6,  fullName: "Roshan Wickramasinghe" },
    { id: 7,  fullName: "Thilina Madushanka" },
    { id: 8,  fullName: "Chamara Dissanayake" },
    { id: 9,  fullName: "Saman Rathnayake" },
    { id: 10, fullName: "Lalith Gunasekara" },
  ];
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);

  // Validation state
  const [fieldErrors,     setFieldErrors]     = useState(EMPTY_ERRORS);
  const [touched,         setTouched]         = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [newJob, setNewJob] = useState({
    vehicleId:"", mechanicId:"", mechanic:"",
    customerComplaint:"", priority:"normal",
    mileageIn:"", serviceType:"",
    laborCharges:[{id:Date.now(), desc:"", hours:1, rate:50, total:50}],
    partsUsed:[],
  });

  // Re-validate whenever form changes (after first interaction)
  useEffect(() => {
    if (submitAttempted || Object.keys(touched).length > 0)
      setFieldErrors(validateJob(newJob));
  }, [newJob, submitAttempted, touched]);

  const filtered = jobs.filter(j => {
    const status = toFrontend(j.status);
    const matchF = filter==="all" || status===filter;
    const name   = (j.customerName||j.owner||"").toLowerCase();
    const id     = (j.orderNumber||j.id||"").toLowerCase();
    const veh    = (j.vehicleInfo||j.vehicle||"").toLowerCase();
    const matchS = !search || name.includes(search.toLowerCase()) || id.includes(search) || veh.includes(search.toLowerCase());
    return matchF && matchS;
  });

  // Labor helpers
  const addLabor    = () => setNewJob(p=>({...p, laborCharges:[...p.laborCharges,{id:Date.now(),desc:"",hours:1,rate:50,total:50}]}));
  const updateLabor = (idx,field,val) => {
    const c=[...newJob.laborCharges]; c[idx]={...c[idx],[field]:val};
    if(field==="hours"||field==="rate") c[idx].total=c[idx].hours*c[idx].rate;
    setNewJob(p=>({...p,laborCharges:c}));
  };
  const removeLabor = idx => setNewJob(p=>({...p,laborCharges:p.laborCharges.filter((_,i)=>i!==idx)}));

  // Parts helpers
  const addPart    = () => setNewJob(p=>({...p,partsUsed:[...p.partsUsed,{id:Date.now(),partId:"",name:"",qty:1,unitPrice:0,total:0}]}));
  const updatePart = (idx,field,val) => {
    const pts=[...newJob.partsUsed]; pts[idx]={...pts[idx],[field]:val};
    if(field==="partId"){const inv=inventory.find(i=>i.id==val);if(inv){pts[idx].name=inv.name;pts[idx].unitPrice=inv.sellingPrice||inv.price||0;}}
    if(field==="qty"||field==="unitPrice") pts[idx].total=pts[idx].qty*pts[idx].unitPrice;
    setNewJob(p=>({...p,partsUsed:pts}));
  };
  const removePart = idx => setNewJob(p=>({...p,partsUsed:p.partsUsed.filter((_,i)=>i!==idx)}));

  const partsTotal = newJob.partsUsed.reduce((a,p)=>a+p.total,0);
  const laborTotal = newJob.laborCharges.reduce((a,l)=>a+l.total,0);
  const grandTotal = partsTotal + laborTotal;

  // Validation helpers
  const handleBlur = field => setTouched(prev=>({...prev,[field]:true}));
  const showError  = field => (submitAttempted||touched[field]) && !!fieldErrors[field];
  const inputStyle = (field, base={}) => ({
    ...base,
    borderColor: showError(field) ? "#DC2626"
      : (touched[field]||submitAttempted) && !fieldErrors[field] ? "#16A34A"
      : base.borderColor || undefined,
    boxShadow: showError(field) ? "0 0 0 2px #FEE2E2" : undefined,
  });

  const inp = {
    padding:"7px 10px", border:"1.5px solid var(--gray-200)", borderRadius:6,
    fontFamily:"var(--font)", fontSize:12, color:"var(--gray-800)", background:"white", outline:"none",
  };

  // Open modal — reset all state
  const openNew = () => {
    setError(null); setFieldErrors(EMPTY_ERRORS); setTouched({}); setSubmitAttempted(false);
    setNewJob({vehicleId:"",mechanicId:"",mechanic:"",customerComplaint:"",priority:"normal",mileageIn:"",serviceType:"",laborCharges:[{id:Date.now(),desc:"",hours:1,rate:50,total:50}],partsUsed:[]});
    setShowNew(true);
  };

  // Save with validation gate
  const saveJob = async () => {
    setSubmitAttempted(true);
    const errors = validateJob(newJob);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setSaving(true); setError(null);
    try {
      const payload = {
        vehicleId:          parseInt(newJob.vehicleId),
        mechanicName:       newJob.mechanic || undefined,
        priority:           toBePriority(newJob.priority),
        status:             "PENDING",
        serviceType:        newJob.serviceType.trim(),
        customerComplaint:  newJob.customerComplaint.trim(),
        mileageIn:          newJob.mileageIn ? parseInt(newJob.mileageIn) : undefined,
        dateIn:             new Date().toISOString().split("T")[0],
        serviceItems: newJob.laborCharges.filter(l=>l.desc.trim()).map(l=>({
          description:l.desc, laborHours:l.hours, hourlyRate:l.rate, totalPrice:l.total,
        })),
        serviceParts: newJob.partsUsed.filter(p=>p.partId).map(p=>({
          partId:parseInt(p.partId), quantity:p.qty, unitPrice:p.unitPrice, totalPrice:p.total,
        })),
      };
      const res      = await serviceOrderAPI.create(payload);
      const veh      = vehicles.find(v=>String(v.id)===String(newJob.vehicleId));
      const mechName = mechanics.find(m=>String(m.id)===String(newJob.mechanicId))?.fullName || newJob.mechanic;
      setJobs(p=>[{
        ...res.data, mechanic:mechName,
        owner:   veh?.customerName||veh?.owner,
        vehicle: `${veh?.year} ${veh?.make} ${veh?.model}`,
        plate:   veh?.licensePlate||veh?.plate,
      },...p]);
      setShowNew(false);
    } catch(e) {
      setError(e.response?.data?.message || "Failed to create job card. Please try again.");
    } finally { setSaving(false); }
  };

  const cycleStatus = async (id, toStatus) => {
    const job = jobs.find(j=>(j.id||j.orderNumber)===id||(j.id===id));
    if (!job) return;
    const newStatus = toStatus||{pending:"in-progress","in-progress":"completed",completed:"pending"}[toFrontend(job.status)];
    try { await serviceOrderAPI.update(job.id,{status:toBackend(newStatus)}); } catch {}
    setJobs(p=>p.map(j=>j.id===id?{...j,status:toBackend(newStatus)}:j));
  };

  const nextLabel    = {pending:"Start","in-progress":"Complete",completed:"Reopen"};
  const errorCount   = Object.values(fieldErrors).filter(Boolean).length;
  const complaintLen = newJob.customerComplaint.length;
  const serviceLen   = newJob.serviceType.length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Job Cards</div>
          <div className="page-sub">{jobs.filter(j=>toFrontend(j.status)!=="completed").length} active · {jobs.length} total</div>
        </div>
        <button className="btn btn-accent" onClick={openNew}>
          <Icon name="plus" size={15}/> New Job Card
        </button>
      </div>

      <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center" }}>
        <div className="search-bar">
          <Icon name="search" size={15}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs..."/>
        </div>
        <div className="filter-chips">
          {["all","pending","in-progress","completed"].map(f=>(
            <span key={f} className={`chip ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
              {f==="all"?"All":statusLabel(f)}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Job ID</th><th>Customer / Vehicle</th><th>Mechanic</th><th>Priority</th><th>Status</th><th>Total</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(j=>{
                const status=toFrontend(j.status);
                const priority=toFePriority(j.priority);
                return (
                  <tr key={j.id}>
                    <td><span className="td-mono">{j.orderNumber||j.id}</span></td>
                    <td>
                      <span className="td-bold">{j.customerName||j.owner}</span><br/>
                      <span style={{ fontSize:12,color:"var(--gray-400)" }}>{j.vehicleInfo||j.vehicle} · {j.plate||""}</span>
                    </td>
                    <td>
                      <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                        <div className="avatar">{initials(j.mechanicName||j.mechanic||"?")}</div>
                        <span style={{ fontSize:12 }}>{j.mechanicName||j.mechanic}</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${priority}`}>{priority.charAt(0).toUpperCase()+priority.slice(1)}</span></td>
                    <td><span className={`badge badge-${status}`}>{statusLabel(status)}</span></td>
                    <td><strong>${fmt(j.totalCost||j.estimate||0)}</strong></td>
                    <td><span style={{ fontSize:12,color:"var(--gray-500)" }}>{j.dateIn||j.created}</span></td>
                    <td>
                      <div style={{ display:"flex",gap:5 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setViewing(j)}><Icon name="eye" size={14}/></button>
                        <button className="btn btn-primary btn-sm" style={{ fontSize:11,padding:"4px 9px" }} onClick={()=>cycleStatus(j.id)}>{nextLabel[status]}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0&&<tr><td colSpan={8}><div className="empty"><div className="empty-text">No job cards found</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {viewing&&<JobDetailModal job={viewing} onClose={()=>setViewing(null)} onStatusChange={cycleStatus}/>}

      {showNew&&(
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowNew(false)}>
          <div className="modal" style={{ maxWidth:860,maxHeight:"92vh" }}>
            <div className="modal-header">
              <span className="modal-title">New Job Card</span>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setShowNew(false)}><Icon name="x"/></button>
            </div>

            <div className="modal-body" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>

              {/* ── LEFT: Vehicle + Issue ── */}
              <div>

                {/* Server error banner */}
                {error&&(
                  <div style={{ background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"10px 14px",marginBottom:16,color:"#DC2626",fontSize:13,display:"flex",alignItems:"flex-start",gap:8 }}>
                    <span style={{ fontSize:15,marginTop:1 }}>⛔</span><span>{error}</span>
                  </div>
                )}

                {/* Summary validation banner */}
                {submitAttempted&&hasErrors(fieldErrors)&&(
                  <div style={{ background:"#FFFBEB",border:"1px solid #FCD34D",borderRadius:8,padding:"10px 14px",marginBottom:16,color:"#92400E",fontSize:12,display:"flex",alignItems:"flex-start",gap:8 }}>
                    <span style={{ fontSize:14,marginTop:1 }}>⚠️</span>
                    <span>{errorCount} field{errorCount!==1?"s need":" needs"} attention before saving.</span>
                  </div>
                )}

                <SectionHeading label="Vehicle & Reception"/>

                {/* Vehicle */}
                <div className="form-group">
                  <label className="form-label">Vehicle / Customer <span style={{ color:"var(--red)" }}>*</span></label>
                  <select className="form-select" value={newJob.vehicleId}
                    style={inputStyle("vehicleId")}
                    onChange={e=>setNewJob(p=>({...p,vehicleId:e.target.value}))}
                    onBlur={()=>handleBlur("vehicleId")}>
                    <option value="">Select vehicle...</option>
                    {vehicles.map(v=>(
                      <option key={v.id} value={v.id}>
                        {v.customerName||v.owner} — {v.year} {v.make} {v.model} ({v.licensePlate||v.plate})
                      </option>
                    ))}
                  </select>
                  <FieldError msg={showError("vehicleId")?fieldErrors.vehicleId:""}/>
                </div>

                <div className="form-grid">
                  {/* Mechanic */}
                  <div className="form-group">
                    <label className="form-label">Assigned Mechanic <span style={{ color:"var(--red)" }}>*</span></label>
                    <select className="form-select" value={newJob.mechanicId}
                      style={inputStyle("mechanicId")}
                      onChange={e=>{const m=mechanics.find(x=>String(x.id)===String(e.target.value));setNewJob(p=>({...p,mechanicId:e.target.value,mechanic:m?.fullName||""}));}}
                      onBlur={()=>handleBlur("mechanicId")}>
                      <option value="">Select mechanic...</option>
                      {mechanics.map(m=><option key={m.id} value={m.id}>{m.fullName}</option>)}
                    </select>
                    <FieldError msg={showError("mechanicId")?fieldErrors.mechanicId:""}/>
                  </div>

                  {/* Priority */}
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={newJob.priority}
                      onChange={e=>setNewJob(p=>({...p,priority:e.target.value}))}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Service Type */}
                <div className="form-group">
                  <label className="form-label">Service Type <span style={{ color:"var(--red)" }}>*</span></label>
                  <input className="form-input" value={newJob.serviceType}
                    placeholder="e.g. Oil Change, Diagnostics..."
                    style={inputStyle("serviceType")}
                    onChange={e=>setNewJob(p=>({...p,serviceType:e.target.value}))}
                    onBlur={()=>handleBlur("serviceType")}/>
                  <div style={{ fontSize:11,color:serviceLen>90?"#DC2626":"var(--gray-400)",marginTop:4 }}>
                    {serviceLen} / 100 characters
                  </div>
                  <FieldError msg={showError("serviceType")?fieldErrors.serviceType:""}/>
                </div>

                {/* Mileage */}
                <div className="form-group">
                  <label className="form-label">Odometer In</label>
                  <input className="form-input" type="number" min="0" value={newJob.mileageIn}
                    placeholder="e.g. 54200"
                    style={inputStyle("mileageIn")}
                    onChange={e=>setNewJob(p=>({...p,mileageIn:e.target.value}))}
                    onBlur={()=>handleBlur("mileageIn")}/>
                  <FieldError msg={showError("mileageIn")?fieldErrors.mileageIn:""}/>
                </div>

                {/* Customer Complaint */}
                <div className="form-group">
                  <label className="form-label">Customer Complaint / Issue <span style={{ color:"var(--red)" }}>*</span></label>
                  <textarea className="form-textarea" value={newJob.customerComplaint}
                    placeholder="Describe the issue..."
                    style={inputStyle("customerComplaint")}
                    onChange={e=>setNewJob(p=>({...p,customerComplaint:e.target.value}))}
                    onBlur={()=>handleBlur("customerComplaint")}/>
                  <div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}>
                    <FieldError msg={showError("customerComplaint")?fieldErrors.customerComplaint:""}/>
                    <span style={{ fontSize:11,color:complaintLen>900?"#DC2626":"var(--gray-400)",marginLeft:"auto" }}>
                      {complaintLen} / 1000
                    </span>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Labor + Parts ── */}
              <div>

                {/* Labor Charges */}
                <SectionHeading label="Labor Charges"
                  action={<button className="btn btn-ghost btn-sm" onClick={addLabor} style={{ fontSize:11 }}><Icon name="plus" size={12}/> Add</button>}/>

                {/* Column headers */}
                <div style={{ display:"grid",gridTemplateColumns:"2fr 55px 60px auto",gap:5,marginBottom:4 }}>
                  {["Description","Hrs","Rate ($)",""].map((h,i)=>(
                    <span key={i} style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",color:"var(--gray-400)",letterSpacing:.4 }}>{h}</span>
                  ))}
                </div>

                {newJob.laborCharges.map((labor,idx)=>{
                  const rowErr = submitAttempted && (!labor.desc.trim()||labor.hours<=0||labor.rate<0);
                  return (
                    <div key={labor.id} style={{ marginBottom:5 }}>
                      <div style={{ display:"grid",gridTemplateColumns:"2fr 55px 60px auto",gap:5,alignItems:"center" }}>
                        <input style={{ ...inp,borderColor:rowErr&&!labor.desc.trim()?"#DC2626":undefined }}
                          value={labor.desc} onChange={e=>updateLabor(idx,"desc",e.target.value)}
                          placeholder="e.g. Oil change service..."/>
                        <input style={{ ...inp,textAlign:"center",borderColor:rowErr&&labor.hours<=0?"#DC2626":undefined }}
                          type="number" step="0.5" min="0.5" value={labor.hours}
                          onChange={e=>updateLabor(idx,"hours",parseFloat(e.target.value)||0)}/>
                        <input style={{ ...inp,textAlign:"right",borderColor:rowErr&&labor.rate<0?"#DC2626":undefined }}
                          type="number" min="0" value={labor.rate}
                          onChange={e=>updateLabor(idx,"rate",parseFloat(e.target.value)||0)}/>
                        <button className="btn btn-danger btn-sm btn-icon" style={{ padding:4 }} onClick={()=>removeLabor(idx)}><Icon name="trash" size={12}/></button>
                      </div>
                      <div style={{ textAlign:"right",fontSize:11,color:"var(--gray-400)",marginTop:2 }}>
                        Subtotal: <strong>${fmt(labor.total)}</strong>
                      </div>
                    </div>
                  );
                })}
                <FieldError msg={showError("labor")?fieldErrors.labor:""}/>

                {/* Spare Parts */}
                <SectionHeading label="Spare Parts Used"
                  action={<button className="btn btn-ghost btn-sm" onClick={addPart} style={{ fontSize:11 }}><Icon name="plus" size={12}/> Add</button>}/>

                {/* Column headers */}
                <div style={{ display:"grid",gridTemplateColumns:"2fr 60px 70px auto",gap:5,marginBottom:4 }}>
                  {["Part","Qty","Price ($)",""].map((h,i)=>(
                    <span key={i} style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",color:"var(--gray-400)",letterSpacing:.4 }}>{h}</span>
                  ))}
                </div>

                {newJob.partsUsed.map((part,idx)=>{
                  const rowErr = submitAttempted && (!part.partId||part.qty<=0);
                  return (
                    <div key={part.id} style={{ marginBottom:5 }}>
                      <div style={{ display:"grid",gridTemplateColumns:"2fr 60px 70px auto",gap:5,alignItems:"center" }}>
                        <select style={{ ...inp,borderColor:rowErr&&!part.partId?"#DC2626":undefined }}
                          value={part.partId} onChange={e=>updatePart(idx,"partId",e.target.value)}>
                          <option value="">Select part...</option>
                          {inventory.map(i=><option key={i.id} value={i.id}>{i.name} (${fmt(i.sellingPrice||i.price||0)})</option>)}
                        </select>
                        <input style={{ ...inp,textAlign:"center",borderColor:rowErr&&part.qty<=0?"#DC2626":undefined }}
                          type="number" min="1" value={part.qty}
                          onChange={e=>updatePart(idx,"qty",parseFloat(e.target.value)||1)}/>
                        <input style={{ ...inp,textAlign:"right" }}
                          type="number" min="0" value={part.unitPrice}
                          onChange={e=>updatePart(idx,"unitPrice",parseFloat(e.target.value)||0)}/>
                        <button className="btn btn-danger btn-sm btn-icon" style={{ padding:4 }} onClick={()=>removePart(idx)}><Icon name="trash" size={12}/></button>
                      </div>
                      <div style={{ textAlign:"right",fontSize:11,color:"var(--gray-400)",marginTop:2 }}>
                        Subtotal: <strong>${fmt(part.total)}</strong>
                      </div>
                    </div>
                  );
                })}
                <FieldError msg={showError("parts")?fieldErrors.parts:""}/>

                {/* Cost summary */}
                <div style={{ marginTop:16,background:"var(--gray-50)",borderRadius:8,padding:"14px 16px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--gray-500)",marginBottom:5 }}><span>Parts</span><span>${fmt(partsTotal)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--gray-500)",marginBottom:8 }}><span>Labor</span><span>${fmt(laborTotal)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700,color:"var(--gray-800)",borderTop:"1.5px solid var(--gray-200)",paddingTop:8 }}>
                    <span>Estimated Total</span><span style={{ color:"var(--accent)" }}>${fmt(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <span style={{ fontSize:11,color:"var(--gray-400)",marginRight:"auto" }}>
                <span style={{ color:"var(--red)" }}>*</span> Required fields
              </span>
              <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={saveJob} disabled={saving}>
                {saving?"Saving...":"Create Job Card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobCardsModule;