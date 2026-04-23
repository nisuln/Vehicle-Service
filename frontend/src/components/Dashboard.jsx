import { useState, useEffect } from "react";
import Icon from "./Icon";
import { fmt, statusLabel } from "../utils/helpers";
import { dashboardAPI, serviceOrderAPI, invoiceAPI } from "../services/api";

function Dashboard({ jobs, inventory, vehicles, bookings, invoices }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  // Fallback to local data if API not ready
  const grandTotal = (inv) => {
    const sub = (inv.items || []).reduce((a, i) => a + (i.total || i.totalPrice || 0), 0);
    return sub + sub * ((inv.tax || 0) / 100);
  };

  const revenue     = stats ? parseFloat(stats.revenueThisMonth || 0)
                            : invoices.filter(i => i.status === "paid").reduce((a, i) => a + grandTotal(i), 0);
  const outstanding = invoices.filter(i => i.status === "unpaid").reduce((a, i) => a + grandTotal(i), 0);
  const lowStock    = stats ? stats.lowStockParts : inventory.filter(p => p.qty <= p.min).length;
  const activeJobs  = stats ? stats.pendingOrders + stats.inProgressOrders
                            : jobs.filter(j => j.status !== "completed").length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">AutoFix Pro — Service Center Overview · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
        </div>
        {loading && <span style={{ fontSize: 12, color: "var(--gray-400)" }}>⟳ Loading live stats...</span>}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Revenue (This Month)</div>
          <div className="stat-value stat-green">${fmt(revenue)}</div>
          <div className="stat-sub">{stats ? stats.completedOrders : invoices.filter(i => i.status === "paid").length} paid orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value stat-amber">${fmt(outstanding)}</div>
          <div className="stat-sub">{invoices.filter(i => i.status === "unpaid").length} unpaid invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value stat-accent">{activeJobs}</div>
          <div className="stat-sub">{stats ? stats.inProgressOrders : jobs.filter(j => j.status === "in-progress").length} in progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock Alerts</div>
          <div className="stat-value" style={{ color: lowStock > 0 ? "var(--red)" : "var(--green)" }}>{lowStock}</div>
          <div className="stat-sub">{stats ? stats.totalParts : inventory.length} total SKUs</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header"><span style={{ fontWeight: 700 }}>Recent Job Cards</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Job</th><th>Customer</th><th>Status</th><th>Est.</th></tr></thead>
              <tbody>
                {jobs.slice(0, 5).map((j) => (
                  <tr key={j.id || j.orderNumber}>
                    <td><span className="td-mono">{j.orderNumber || j.id}</span></td>
                    <td><span className="td-bold">{j.customerName || j.owner}</span></td>
                    <td>
                      <span className={`badge badge-${(j.status || "").toLowerCase().replace("_","-")}`}>
                        {statusLabel((j.status || "").toLowerCase().replace("_","-"))}
                      </span>
                    </td>
                    <td>${fmt(j.totalCost || j.estimate || 0)}</td>
                  </tr>
                ))}
                {jobs.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--gray-300)", padding: 20 }}>No jobs yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span style={{ fontWeight: 700 }}>Upcoming Bookings</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date / Time</th><th>Customer</th><th>Service</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.filter(b => b.status !== "cancelled").slice(0, 5).map((b) => (
                  <tr key={b.id}>
                    <td><span className="td-mono">{b.date}<br />{b.time}</span></td>
                    <td><span className="td-bold">{b.owner}</span></td>
                    <td>{b.service || b.serviceType}</td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--gray-300)", padding: 20 }}>No bookings yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {lowStock > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <span style={{ fontWeight: 700, color: "var(--red)", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="alert" size={15} /> Low Stock Items
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Part</th><th>Category</th><th>In Stock</th><th>Min. Required</th></tr></thead>
              <tbody>
                {inventory.filter(p => (p.qty ?? p.stockQuantity) <= (p.min ?? p.minimumStock)).map((p) => (
                  <tr key={p.id}>
                    <td className="td-bold">{p.name}</td>
                    <td>{p.category}</td>
                    <td style={{ color: "var(--red)", fontWeight: 700 }}>{p.qty ?? p.stockQuantity}</td>
                    <td>{p.min ?? p.minimumStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;