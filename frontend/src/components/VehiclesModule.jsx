// src/components/VehiclesModule.jsx  (ADMIN)
import { useState, useEffect } from "react";
import Icon from "./Icon";
import { fmt } from "../utils/helpers";
import { vehicleAPI, customerAPI, serviceOrderAPI } from "../services/api";

const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];
const TRANSMISSION_TYPES = ["AUTOMATIC", "MANUAL", "CVT"];

const EMPTY_NEW = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  licensePlate: "",
  vin: "",
  color: "",
  mileage: 0,
  fuelType: "PETROL",
  transmissionType: "AUTOMATIC",
};

export default function VehiclesModule() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [vehHistory, setVehHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newV, setNewV] = useState(EMPTY_NEW);

  // ── Load all vehicles + customers ───────────────────────────────────────────
  useEffect(() => {
    Promise.all([vehicleAPI.getAll(), customerAPI.getAll()])
      .then(([vRes, cRes]) => {
        setVehicles(vRes.data || []);
        setCustomers(cRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Load service history when vehicle selected ──────────────────────────────
  useEffect(() => {
    if (!selected) return;
    serviceOrderAPI
      .getByVehicle(selected.id)
      .then((r) => setVehHistory(r.data || []))
      .catch(() => setVehHistory([]));
  }, [selected]);

  const filtered = vehicles.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (v.customerName || "").toLowerCase().includes(q) ||
      (v.make || "").toLowerCase().includes(q) ||
      (v.model || "").toLowerCase().includes(q) ||
      (v.licensePlate || "").toLowerCase().includes(q) ||
      (v.color || "").toLowerCase().includes(q)
    );
  });

  // ── Save new vehicle (ADMIN creates customer record too) ────────────────────
  const saveVehicle = async () => {
    if (!newV.phone || !newV.make || !newV.model || !newV.licensePlate) {
      setError("Phone, Make, Model and License Plate are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Find or create customer
      let customerId;
      const existing = customers.find(
        (c) => c.email === newV.email || c.phone === newV.phone,
      );
      if (existing) {
        customerId = existing.id;
      } else {
        const cRes = await customerAPI.create({
          firstName: newV.firstName,
          lastName: newV.lastName,
          phone: newV.phone,
          email: newV.email,
          address: newV.address,
        });
        customerId = cRes.data.id;
        setCustomers((p) => [...p, cRes.data]);
      }

      // Create vehicle with customerId
      const vRes = await vehicleAPI.create({
        customerId,
        make: newV.make,
        model: newV.model,
        year: parseInt(newV.year),
        licensePlate: newV.licensePlate,
        vin: newV.vin || null,
        color: newV.color || null,
        mileage: parseInt(newV.mileage) || 0,
        fuelType: newV.fuelType,
        transmissionType: newV.transmissionType,
      });

      setVehicles((p) => [...p, vRes.data]);
      setShowAdd(false);
      setNewV(EMPTY_NEW);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete vehicle ──────────────────────────────────────────────────────────
  const deleteVehicle = async (id) => {
    if (!window.confirm("Delete this vehicle and all its records?")) return;
    try {
      await vehicleAPI.delete(id);
      setVehicles((p) => p.filter((v) => v.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed.");
    }
  };

  if (loading)
    return (
      <div className="page">
        <div
          style={{ textAlign: "center", padding: 60, color: "var(--gray-400)" }}
        >
          Loading vehicles...
        </div>
      </div>
    );

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Vehicle Profiles</div>
          <div className="page-sub">{vehicles.length} registered vehicles</div>
        </div>

      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {/* ── Vehicle List ── */}
        <div style={{ flex: selected ? "0 0 380px" : 1 }}>
          <div className="search-bar" style={{ marginBottom: 14 }}>
            <Icon name="search" size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, make, model, plate..."
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelected(v === selected ? null : v)}
                className="card"
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  borderColor:
                    selected?.id === v.id ? "var(--navy)" : undefined,
                  boxShadow:
                    selected?.id === v.id ? "0 0 0 2px var(--navy)" : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {v.customerName || "—"}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--gray-500)",
                        marginTop: 2,
                      }}
                    >
                      {v.year} {v.make} {v.model} ·{" "}
                      <span className="td-mono">
                        {v.licensePlate || "No plate"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--gray-400)",
                        marginTop: 4,
                      }}
                    >
                      {v.color || "—"} · {v.fuelType || "—"} ·{" "}
                      {(v.mileage || 0).toLocaleString()} km
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVehicle(v.id);
                      }}
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="empty">
                <div className="empty-text">No vehicles found</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Detail Panel ── */}
        {selected && (
          <div style={{ flex: 1 }}>
            {/* Vehicle info card */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <span style={{ fontWeight: 700 }}>
                  {selected.year} {selected.make} {selected.model}
                </span>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={() => setSelected(null)}
                >
                  <Icon name="x" />
                </button>
              </div>
              <div className="card-body">
                <div className="form-grid-3">
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--gray-400)",
                        marginBottom: 4,
                      }}
                    >
                      Owner
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {selected.customerName || "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                      {selected.ownerUsername
                        ? `@${selected.ownerUsername}`
                        : ""}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--gray-400)",
                        marginBottom: 4,
                      }}
                    >
                      Registration
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      <span className="td-mono">
                        {selected.licensePlate || "—"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                      VIN:{" "}
                      <span className="td-mono" style={{ fontSize: 11 }}>
                        {selected.vin || "—"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--gray-400)",
                        marginBottom: 4,
                      }}
                    >
                      Details
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {selected.color || "—"} · {selected.year}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {selected.fuelType || "—"} ·{" "}
                      {selected.transmissionType || "—"}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {(selected.mileage || 0).toLocaleString()} km
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service history */}
            <div className="card">
              <div className="card-header">
                <span style={{ fontWeight: 700 }}>Service History</span>
                <span style={{ fontSize: 12, color: "var(--gray-400)" }}>
                  {vehHistory.length} records
                </span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehHistory.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          <div className="empty" style={{ padding: 24 }}>
                            <div className="empty-text">
                              No service history yet
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {vehHistory.map((h) => (
                      <tr key={h.id}>
                        <td>
                          <span className="td-mono">
                            {h.orderNumber || `#${h.id}`}
                          </span>
                        </td>
                        <td>
                          <span className="td-bold">
                            {h.serviceType || h.customerComplaint || "Service"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge badge-${(h.status || "").toLowerCase().replace("_", "-")}`}
                          >
                            {h.status}
                          </span>
                        </td>
                        <td>{h.dateIn || "—"}</td>
                        <td>
                          <strong>${fmt(h.totalCost || 0)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Vehicle Modal ── */}
      {showAdd && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">Add Vehicle</span>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setShowAdd(false)}
              >
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              {error && (
                <div
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 16,
                    color: "#DC2626",
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}

              {/* Owner info */}
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "var(--gray-400)",
                  marginBottom: 12,
                }}
              >
                Owner Information
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    className="form-input"
                    value={newV.firstName}
                    onChange={(e) =>
                      setNewV((p) => ({ ...p, firstName: e.target.value }))
                    }
                    placeholder="John"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    className="form-input"
                    value={newV.lastName}
                    onChange={(e) =>
                      setNewV((p) => ({ ...p, lastName: e.target.value }))
                    }
                    placeholder="Smith"
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    className="form-input"
                    value={newV.phone}
                    onChange={(e) =>
                      setNewV((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="555-0000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    value={newV.email}
                    onChange={(e) =>
                      setNewV((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="owner@email.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  className="form-input"
                  value={newV.address}
                  onChange={(e) =>
                    setNewV((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="123 Main St"
                />
              </div>

              <hr className="divider" />

              {/* Vehicle info */}
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "var(--gray-400)",
                  marginBottom: 12,
                }}
              >
                Vehicle Information
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Make *</label>
                  <input
                    className="form-input"
                    value={newV.make}
                    onChange={(e) =>
                      setNewV((p) => ({ ...p, make: e.target.value }))
                    }
                    placeholder="Toyota"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Model *</label>
                  <input
                    className="form-input"
                    value={newV.model}
                    onChange={(e) =>
                      setNewV((p) => ({ ...p, model: e.target.value }))
                    }
                    placeholder="Camry"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input
                    className="form-input"
                    type="number"
                    value={newV.year}
                    onChange={(e) =>
                      setNewV((p) => ({ ...p, year: e.target.value }))
                    }
                    min="1980"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">License Plate *</label>
                  <input
                    className="form-input"
                    value={newV.licensePlate}
                    onChange={(e) =>
                      setNewV((p) => ({
                        ...p,
                        licensePlate: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="ABC-1234"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    className="form-input"
                    value={newV.color}
                    onChange={(e) =>
                      setNewV((p) => ({ ...p, color: e.target.value }))
                    }
                    placeholder="Silver"
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Fuel Type</label>
                  <select
                    className="form-select"
                    value={newV.fuelType}
                    onChange={(e) =>
                      setNewV((p) => ({ ...p, fuelType: e.target.value }))
                    }
                  >
                    {FUEL_TYPES.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transmission</label>
                  <select
                    className="form-select"
                    value={newV.transmissionType}
                    onChange={(e) =>
                      setNewV((p) => ({
                        ...p,
                        transmissionType: e.target.value,
                      }))
                    }
                  >
                    {TRANSMISSION_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">VIN</label>
                  <input
                    className="form-input"
                    value={newV.vin}
                    onChange={(e) =>
                      setNewV((p) => ({
                        ...p,
                        vin: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="17-character VIN (optional)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mileage (km)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={newV.mileage}
                    onChange={(e) =>
                      setNewV((p) => ({ ...p, mileage: e.target.value }))
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-accent"
                onClick={saveVehicle}
                disabled={
                  saving ||
                  !newV.phone ||
                  !newV.make ||
                  !newV.model ||
                  !newV.licensePlate
                }
              >
                {saving ? "Saving..." : "Add Vehicle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
