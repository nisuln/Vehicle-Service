import { useState } from "react";
import Icon from "./Icon";
import { fmt } from "../utils/helpers";
import { invoiceAPI } from "../services/api";

function InvoicesModule({ invoices, setInvoices, vehicles, jobs }) {
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [viewing, setViewing] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [error, setError]     = useState(null);

  const normalize = (inv) => ({
    ...inv,
    status: (inv.paymentStatus || inv.status || "UNPAID").toLowerCase().replace("_","-"),
    owner: inv.customerName || inv.owner || "",
    vehicle: inv.vehicleInfo || inv.vehicle || "",
    plate: inv.plate || "",
    date: inv.issueDate || inv.date || "",
    total: inv.totalAmount || 0,
    id: inv.invoiceNumber || inv.id || "",
  });

  const filtered = invoices.map(normalize).filter(inv => {
    const matchF = filter==="all" || inv.status===filter || (filter==="unpaid" && (inv.status==="unpaid"||inv.status==="partially-paid"));
    const matchS = !search || inv.owner.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  const grandTotal = (inv) => {
    if (inv.totalAmount != null) return parseFloat(inv.totalAmount);
    const sub = (inv.items||[]).reduce((a,i)=>a+(i.total||i.totalPrice||0),0);
    return sub + sub*((inv.tax||0)/100);
  };

  const generateInvoice = async () => {
    if (!selectedOrderId) return;
    setGenerating(true); setError(null);
    try {
      const res = await invoiceAPI.generateFromOrder(selectedOrderId);
      setInvoices(p=>[res.data,...p]);
      setShowGenerate(false); setSelectedOrderId("");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to generate invoice");
    } finally { setGenerating(false); }
  };

  const markPaid = async (inv) => {
    const rawInv = invoices.find(i=>(i.invoiceNumber||i.id)===(inv.id));
    if (!rawInv?.id) return;
    setPayingId(rawInv.id);
    try {
      const res = await invoiceAPI.recordPayment(rawInv.id, rawInv.totalAmount || grandTotal(rawInv), "CASH");
      setInvoices(p=>p.map(i=>i.id===rawInv.id?res.data:i));
    } catch (e) {
      // Fallback local update
      setInvoices(p=>p.map(i=>(i.invoiceNumber||i.id)===(inv.id)?{...i,paymentStatus:"PAID",status:"paid"}:i));
    } finally { setPayingId(null); }
  };

  const completedJobs = (jobs||[]).filter(j=>(j.status||"").toUpperCase()==="COMPLETED"||j.status==="completed");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Invoices</div>
          <div className="page-sub">{invoices.length} total · ${fmt(invoices.reduce((a,i)=>a+grandTotal(i),0))} billed</div>
        </div>
        <button className="btn btn-accent" onClick={()=>setShowGenerate(true)}>
          <Icon name="plus" size={15} /> Generate Invoice
        </button>
      </div>

      <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center" }}>
        <div className="search-bar">
          <Icon name="search" size={15} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search invoices..." />
        </div>
        <div className="filter-chips">
          {["all","paid","unpaid"].map(f=>(
            <span key={f} className={`chip ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Invoice</th><th>Customer</th><th>Vehicle</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(inv=>(
                <tr key={inv.id}>
                  <td><span className="td-mono">{inv.id}</span></td>
                  <td><span className="td-bold">{inv.owner}</span></td>
                  <td>
                    <span style={{ color:"var(--gray-500)" }}>{inv.vehicle}</span>
                    {inv.plate&&<><br/><span className="td-mono">{inv.plate}</span></>}
                  </td>
                  <td>{inv.date}</td>
                  <td><strong>${fmt(inv.total||grandTotal(inv))}</strong></td>
                  <td>
                    <span className={`badge badge-${inv.status}`}>
                      {inv.status.charAt(0).toUpperCase()+inv.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:"flex",gap:6 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setViewing(inv)}>
                        <Icon name="eye" size={14} />
                      </button>
                      {(inv.status==="unpaid"||inv.status==="partially-paid") && (
                        <button className="btn btn-success btn-sm" onClick={()=>markPaid(inv)} disabled={payingId!=null}>
                          <Icon name="check" size={13} /> Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={7}><div className="empty"><div className="empty-text">No invoices found</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showGenerate&&(
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setShowGenerate(false)}>
          <div className="modal" style={{ maxWidth:480 }}>
            <div className="modal-header">
              <span className="modal-title">Generate Invoice from Job</span>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setShowGenerate(false)}><Icon name="x" /></button>
            </div>
            <div className="modal-body">
              {error&&<div style={{ background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"10px 14px",marginBottom:16,color:"#DC2626",fontSize:13 }}>{error}</div>}
              <div className="form-group">
                <label className="form-label">Select Completed Job *</label>
                <select className="form-select" value={selectedOrderId} onChange={e=>setSelectedOrderId(e.target.value)}>
                  <option value="">Select a completed job...</option>
                  {completedJobs.map(j=>(
                    <option key={j.id} value={j.id}>
                      {j.orderNumber||j.id} — {j.customerName||j.owner} — ${fmt(j.totalCost||j.estimate||0)}
                    </option>
                  ))}
                </select>
              </div>
              {completedJobs.length===0&&<p style={{ fontSize:13,color:"var(--gray-400)" }}>No completed jobs available. Complete a job first.</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowGenerate(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={generateInvoice} disabled={generating||!selectedOrderId}>
                {generating?"Generating...":"Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewing&&(
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setViewing(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">Invoice Preview</span>
              <div style={{ display:"flex",gap:8 }}>
                <button className="btn btn-ghost btn-sm" onClick={()=>window.print()}><Icon name="print" size={14} /> Print</button>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setViewing(null)}><Icon name="x" /></button>
              </div>
            </div>
            <div className="modal-body">
              <div className="inv-preview">
                <div className="inv-header">
                  <div>
                    <div className="inv-logo">Auto<span>Fix</span> Pro</div>
                    <div style={{ fontSize:12,color:"var(--gray-400)",marginTop:4 }}>123 Garage Lane · info@autofix.pro</div>
                  </div>
                  <div className="inv-meta">
                    <h2>INVOICE</h2>
                    <div className="inv-meta-id">{viewing.id||viewing.invoiceNumber}</div>
                    <div style={{ fontSize:12,color:"var(--gray-500)",marginTop:6 }}>Date: {viewing.date||viewing.issueDate}</div>
                  </div>
                </div>
                <div className="inv-parties">
                  <div>
                    <div className="inv-party-label">Billed To</div>
                    <div className="inv-party-name">{viewing.owner||viewing.customerName}</div>
                    <div className="inv-party-detail">{viewing.vehicle||viewing.vehicleInfo}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div className="inv-party-label">Status</div>
                    <span className={`badge badge-${viewing.status}`} style={{ fontSize:13,padding:"5px 14px" }}>
                      {(viewing.status||"").charAt(0).toUpperCase()+(viewing.status||"").slice(1)}
                    </span>
                  </div>
                </div>

                {/* Parts Details Table */}
                {viewing.parts && viewing.parts.length > 0 && (
                  <div style={{ marginTop:24,marginBottom:24 }}>
                    <div style={{ fontSize:14,fontWeight:600,marginBottom:12,color:"var(--gray-700)" }}>Parts & Materials</div>
                    <div style={{ border:"1px solid var(--gray-200)",borderRadius:8,overflow:"hidden" }}>
                      <table style={{ width:"100%",fontSize:13 }}>
                        <thead style={{ background:"var(--gray-50)" }}>
                          <tr>
                            <th style={{ padding:"10px 14px",textAlign:"left",fontWeight:600,color:"var(--gray-600)" }}>Part Name</th>
                            <th style={{ padding:"10px 14px",textAlign:"center",fontWeight:600,color:"var(--gray-600)" }}>Qty</th>
                            <th style={{ padding:"10px 14px",textAlign:"right",fontWeight:600,color:"var(--gray-600)" }}>Unit Price</th>
                            <th style={{ padding:"10px 14px",textAlign:"right",fontWeight:600,color:"var(--gray-600)" }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewing.parts.map((part, idx) => (
                            <tr key={idx} style={{ borderTop:"1px solid var(--gray-200)" }}>
                              <td style={{ padding:"10px 14px",color:"var(--gray-700)" }}>{part.partName}</td>
                              <td style={{ padding:"10px 14px",textAlign:"center",color:"var(--gray-600)" }}>{part.quantity}</td>
                              <td style={{ padding:"10px 14px",textAlign:"right",color:"var(--gray-600)" }}>${fmt(part.unitPrice)}</td>
                              <td style={{ padding:"10px 14px",textAlign:"right",fontWeight:600,color:"var(--gray-900)" }}>${fmt(part.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="inv-totals">
                  <div className="inv-totals-box">
                    <div className="inv-total-row"><span>Labor</span><span>${fmt(viewing.laborTotal||viewing.laborCost||0)}</span></div>
                    <div className="inv-total-row"><span>Parts</span><span>${fmt(viewing.partsTotal||viewing.partsCost||0)}</span></div>
                    {(viewing.discountAmount>0||viewing.discount>0)&&<div className="inv-total-row"><span>Discount</span><span>-${fmt(viewing.discountAmount||viewing.discount||0)}</span></div>}
                    <div className="inv-total-row"><span>Tax</span><span>${fmt(viewing.taxAmount||0)}</span></div>
                    <div className="inv-total-row grand"><span>Total</span><span>${fmt(viewing.totalAmount||viewing.total||grandTotal(viewing))}</span></div>
                    {viewing.paidAmount>0&&<div className="inv-total-row" style={{ color:"var(--green)" }}><span>Paid</span><span>${fmt(viewing.paidAmount)}</span></div>}
                    {viewing.balanceDue>0&&<div className="inv-total-row" style={{ color:"var(--red)",fontWeight:700 }}><span>Balance Due</span><span>${fmt(viewing.balanceDue)}</span></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoicesModule;