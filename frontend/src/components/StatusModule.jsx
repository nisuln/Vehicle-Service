// src/components/StatusModule.jsx
import { useState } from "react";
import { fmt, initials } from "../utils/helpers";
import { serviceOrderAPI } from "../services/api";

const COLS = [
  { id: "pending",     label: "Diagnosing", color: "var(--amber)" },
  { id: "in-progress", label: "Repairing",  color: "var(--blue)"  },
  { id: "completed",   label: "Ready",      color: "var(--green)" },
];

// FIX: API returns "PENDING","IN_PROGRESS","COMPLETED" — normalize to col ids
function toColId(status) {
  const s = (status || "").toUpperCase().replace(/-/g, "_");
  if (["PENDING","DIAGNOSED"].includes(s))         return "pending";
  if (["IN_PROGRESS","WAITING_PARTS"].includes(s)) return "in-progress";
  if (["COMPLETED","DELIVERED"].includes(s))       return "completed";
  return "pending";
}
const COL_TO_API = { "pending":"PENDING", "in-progress":"IN_PROGRESS", "completed":"COMPLETED" };
const PLABEL = { low:"Low", medium:"Normal", normal:"Normal", high:"High", urgent:"Urgent" };

function StatusModule({ jobs, setJobs }) {
  const [movingId, setMovingId] = useState(null);

  const moveJob = async (job, colId) => {
    const newStatus = COL_TO_API[colId];
    setJobs(p => p.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
    setMovingId(job.id);
    try {
      await serviceOrderAPI.update(job.id, { status: newStatus });
    } catch {
      setJobs(p => p.map(j => j.id === job.id ? { ...j, status: job.status } : j));
      alert("Failed to update status.");
    } finally { setMovingId(null); }
  };

  const activeJobs = jobs.filter(j => !["CANCELLED","cancelled"].includes(j.status || ""));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Service Status Pipeline</div>
          <div className="page-sub">Kanban view · {activeJobs.length} active job{activeJobs.length !== 1 ? "s" : ""}</div>
        </div>
      </div>
      <div className="kanban">
        {COLS.map((col, colIdx) => {
          const colJobs = activeJobs.filter(j => toColId(j.status) === col.id);
          return (
            <div className="kanban-col" key={col.id}>
              <div className="kanban-col-header">
                <span className="kanban-col-title" style={{ color: col.color }}>{col.label}</span>
                <span className="kanban-count">{colJobs.length}</span>
              </div>
              {colJobs.length === 0 && (
                <div className="empty" style={{ padding: "24px 0" }}>
                  <div className="empty-text" style={{ fontSize: 12 }}>No jobs here</div>
                </div>
              )}
              {colJobs.map(job => {
                const p = (job.priority || "MEDIUM").toLowerCase();
                const moving = movingId === job.id;
                return (
                  <div className="kanban-card" key={job.id}
                    style={{ opacity: moving ? 0.5 : 1, transition: "opacity .2s" }}>
                    <div className="kanban-card-id">{job.orderNumber || job.id}</div>
                    <div className="kanban-card-title">{job.customerName || job.owner || "—"}</div>
                    <div className="kanban-card-sub">
                      {job.vehicleInfo || job.vehicle || "—"}
                      {(job.vehiclePlate || job.plate) ? ` · ${job.vehiclePlate || job.plate}` : ""}
                    </div>
                    <div style={{ fontSize:12, color:"var(--gray-500)", marginBottom:8, lineHeight:1.4 }}>
                      {job.customerComplaint || job.serviceType || job.issue || "—"}
                    </div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      <span className={`badge badge-${p === "medium" ? "normal" : p}`}>{PLABEL[p] || p}</span>
                      <span className="badge badge-normal" style={{ background:"var(--gray-50)" }}>
                        Est. ${fmt(job.totalCost || job.estimate || 0)}
                      </span>
                    </div>
                    <div className="kanban-card-footer">
                      <div className="kanban-card-mechanic">
                        <div className="avatar">{initials(job.mechanicName || job.mechanic || "?")}</div>
                        {job.mechanicName || job.mechanic || "Unassigned"}
                      </div>
                      <div style={{ display:"flex", gap:4 }}>
                        {colIdx > 0 && (
                          <button className="btn btn-ghost btn-sm" style={{ fontSize:11, padding:"3px 8px" }}
                            disabled={moving} onClick={() => moveJob(job, COLS[colIdx-1].id)}>← Back</button>
                        )}
                        {colIdx < COLS.length - 1 && (
                          <button className="btn btn-primary btn-sm" style={{ fontSize:11, padding:"3px 8px" }}
                            disabled={moving} onClick={() => moveJob(job, COLS[colIdx+1].id)}>
                            {moving ? "..." : "Move →"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default StatusModule;