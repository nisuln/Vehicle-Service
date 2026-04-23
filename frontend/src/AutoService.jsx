import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Icon from "./components/Icon";
import Dashboard from "./components/Dashboard";
import InvoicesModule from "./components/InvoicesModule";
import InventoryModule from "./components/InventoryModule";
import JobCardsModule from "./components/JobCardsModule";
import StatusModule from "./components/StatusModule";
import VehiclesModule from "./components/VehiclesModule";
import BookingsModule from "./components/BookingsModule";
import UserDashboard from "./components/UserDashboard";
import UserVehiclesModule from "./components/UserVehiclesModule";
import { styles } from "./styles/globalStyles";
import { useState } from "react";
import {
  vehicleAPI,
  partAPI,
  serviceOrderAPI,
  invoiceAPI,
} from "./services/api";

const ADMIN_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "status" },
  { id: "bookings",  label: "Bookings",  icon: "calendar" },
  { id: "vehicles",  label: "Vehicles",  icon: "vehicles" },
  { id: "pipeline",  label: "Pipeline",  icon: "wrench" },
  { id: "jobcards",  label: "Job Cards", icon: "jobcard" },
  { id: "invoices",  label: "Invoices",  icon: "invoice" },
  { id: "inventory", label: "Inventory", icon: "inventory" },
];

const USER_TABS = [
  { id: "dashboard",  label: "Dashboard",   icon: "status" },
  { id: "myvehicles", label: "My Vehicles", icon: "vehicles" },
  { id: "bookings",   label: "My Bookings", icon: "calendar" },
];

export default function AutoServiceCenter() {
  const { user, logout, isAdmin } = useAuth();
  const { tab: urlTab } = useParams();
  const navigate = useNavigate();

  const TABS = isAdmin ? ADMIN_TABS : USER_TABS;
  const validIds = TABS.map((t) => t.id);

  // Resolve active tab — fall back to "dashboard" if URL tab is unknown
  const activeTab = validIds.includes(urlTab) ? urlTab : "dashboard";

  // If URL doesn't match a valid tab, redirect cleanly
  useEffect(() => {
    if (!validIds.includes(urlTab)) {
      navigate("/dashboard", { replace: true });
    }
  }, [urlTab, validIds, navigate]);

  // If role changes (e.g. admin → user), make sure current tab is still valid
  useEffect(() => {
    if (!validIds.includes(activeTab)) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAdmin]);

  const navigateTo = (tabId) => navigate(`/${tabId}`);

  const [vehicles,  setVehicles]  = useState([]);
  const [inventory, setInventory] = useState([]);
  const [jobs,      setJobs]      = useState([]);
  const [invoices,  setInvoices]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetches = isAdmin
      ? [
          vehicleAPI.getAll(),
          serviceOrderAPI.getAll(),
          partAPI.getAll(),
          invoiceAPI.getAll(),
        ]
      : [vehicleAPI.getAll(), serviceOrderAPI.getAll()];

    Promise.all(fetches)
      .then(([vRes, soRes, pRes, invRes]) => {
        setVehicles(vRes.data || []);
        setJobs(soRes.data || []);
        if (isAdmin && pRes)   setInventory(pRes.data  || []);
        if (isAdmin && invRes) setInvoices(invRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const norm = (p) => ({
    ...p,
    qty: p.qty ?? p.stockQuantity ?? 0,
    min: p.min ?? p.minimumStock  ?? 5,
  });

  const lowStock  = inventory.map(norm).filter((p) => p.qty <= p.min).length;
  const activeJobs = jobs.filter(
    (j) => !["COMPLETED", "DELIVERED", "CANCELLED"].includes((j.status || "").toUpperCase()),
  ).length;

  const badgeFor = (id) => {
    if (id === "inventory" && isAdmin) return lowStock   > 0 ? lowStock   : null;
    if (id === "jobcards"  && isAdmin) return activeJobs > 0 ? activeJobs : null;
    return null;
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--cream)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
          <div style={{ color: "var(--gray-500)", fontSize: 14 }}>
            Loading AutoFix Pro...
          </div>
        </div>
      </div>
    );

  return (
    <>
      <style>{styles}</style>

      {/* ── Navigation bar ─────────────────────────────────────────────────── */}
      <nav className="nav">
        {/* Brand — clicking takes users back to Home, admins back to dashboard */}
        <button
          className="nav-brand"
          onClick={() => navigate(isAdmin ? "/dashboard" : "/home")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <div className="nav-brand-icon">
            <Icon name="wrench" size={16} />
          </div>
          AutoFix Pro
        </button>

        {/* Tab navigation */}
        <div className="nav-tabs">
          {/* Home shortcut — USER only */}
          {!isAdmin && (
            <button
              className="nav-tab"
              onClick={() => navigate("/home")}
              title="Back to Home"
            >
              {/* inline home SVG — not in Icon component */}
              <svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </button>
          )}

          {TABS.map((t) => {
            const badge = badgeFor(t.id);
            return (
              <button
                key={t.id}
                className={`nav-tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => navigateTo(t.id)}
              >
                <Icon name={t.icon} size={15} />
                {t.label}
                {badge && <span className="nav-badge">{badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Right side — role badge, username, sign out */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginLeft: "auto",
            paddingLeft: 20,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              background: isAdmin ? "var(--navy)" : "#EFF6FF",
              color:      isAdmin ? "white"       : "#3B82F6",
              border:     isAdmin ? "1px solid #1C3354" : "1px solid #BFDBFE",
            }}
          >
            {user?.role}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
            {user?.fullName || user?.username}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={logout}
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.7)",
              borderColor: "rgba(255,255,255,.2)",
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── ADMIN views ────────────────────────────────────────────────────── */}
      {isAdmin && activeTab === "dashboard" && (
        <Dashboard
          invoices={invoices}
          jobs={jobs}
          inventory={inventory.map(norm)}
          vehicles={vehicles}
          bookings={[]}
        />
      )}
      {isAdmin && activeTab === "bookings"  && <BookingsModule isAdmin={true} />}
      {isAdmin && activeTab === "vehicles"  && <VehiclesModule />}
      {isAdmin && activeTab === "pipeline"  && (
        <StatusModule jobs={jobs} setJobs={setJobs} />
      )}
      {isAdmin && activeTab === "jobcards"  && (
        <JobCardsModule
          jobs={jobs}
          setJobs={setJobs}
          vehicles={vehicles}
          inventory={inventory}
        />
      )}
      {isAdmin && activeTab === "invoices"  && (
        <InvoicesModule
          invoices={invoices}
          setInvoices={setInvoices}
          vehicles={vehicles}
          jobs={jobs}
        />
      )}
      {isAdmin && activeTab === "inventory" && (
        <InventoryModule
          inventory={inventory.map(norm)}
          setInventory={setInventory}
        />
      )}

      {/* ── USER views ─────────────────────────────────────────────────────── */}
      {!isAdmin && activeTab === "dashboard"  && (
        <UserDashboard jobs={jobs} bookings={[]} vehicles={vehicles} />
      )}
      {!isAdmin && activeTab === "myvehicles" && (
        <UserVehiclesModule vehicles={vehicles} setVehicles={setVehicles} />
      )}
      {!isAdmin && activeTab === "bookings"   && (
        <BookingsModule isAdmin={false} />
      )}
    </>
  );
}