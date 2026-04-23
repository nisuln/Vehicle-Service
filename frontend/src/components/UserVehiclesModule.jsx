// src/components/UserVehiclesModule.jsx
import { useState } from "react";
import Icon from "./Icon";
import { vehicleAPI } from "../services/api";

const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];
const TRANSMISSION_TYPES = ["AUTOMATIC", "MANUAL", "CVT"];

const EMPTY_FORM = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  color: "",
  licensePlate: "",
  vin: "",
  mileage: "",
  fuelType: "PETROL",
  transmissionType: "AUTOMATIC",
};

const vehicleColors = [
  "White",
  "Black",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Brown",
  "Gold",
  "Beige",
  "Purple",
  "Pink",
  "Maroon",
  "Navy Blue",
  "Sky Blue",
  "Dark Green",
  "Champagne",
  "Bronze",
  "Pearl White",
  "Matte Black",
];

const vehicleBrands = [
  "Toyota",
  "Suzuki",
  "Honda",
  "Nissan",
  "Mitsubishi",
  "Mazda",
  "Subaru",
  "Daihatsu",
  "Isuzu",
  "Hyundai",
  "Kia",
  "Genesis",
  "SsangYong",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Porsche",
  "Opel",
  "Mini",
  "Smart",
  "Ferrari",
  "Lamborghini",
  "Maserati",
  "Fiat",
  "Alfa Romeo",
  "Pagani",
  "Renault",
  "Peugeot",
  "Citroen",
  "Bugatti",
  "Ford",
  "Chevrolet",
  "Cadillac",
  "GMC",
  "Jeep",
  "Dodge",
  "Chrysler",
  "Tesla",
  "Lincoln",
  "Buick",
  "Volvo",
  "Polestar",
  "Saab",
  "Jaguar",
  "Land Rover",
  "Bentley",
  "Rolls-Royce",
  "Aston Martin",
  "McLaren",
  "Skoda",
  "Seat",
  "Cupra",
  "Tata",
  "Mahindra",
  "Maruti Suzuki",
  "Force Motors",
  "Proton",
  "Perodua",
  "Chery",
  "Geely",
  "BYD",
  "Great Wall",
  "Haval",
  "Nio",
  "Xpeng",
  "Li Auto",
  "Lexus",
  "Acura",
  "Infiniti",
];

// ── Vehicle Card ──────────────────────────────────────────────────────────────
function VehicleCard({ vehicle, onEdit, onDelete }) {
  const v = vehicle;
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,.07)",
        border: "1px solid var(--gray-100)",
      }}
    >
      {/* Card header */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--navy) 0%, #1C3354 100%)",
          padding: "18px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "white",
              letterSpacing: -0.3,
            }}
          >
            {v.year} {v.make} {v.model}
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: 6,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "var(--mono)",
              color: "white",
              background: "rgba(255,255,255,.15)",
              padding: "2px 10px",
              borderRadius: 6,
              letterSpacing: 1,
            }}
          >
            {v.licensePlate || "NO PLATE"}
          </div>
        </div>
        <div style={{ fontSize: 32 }}>🚗</div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 16px",
          }}
        >
          {[
            ["Color", v.color || "—"],
            ["Fuel", v.fuelType || "—"],
            ["Transmission", v.transmissionType || "—"],
            [
              "Mileage",
              v.mileage ? `${Number(v.mileage).toLocaleString()} km` : "—",
            ],
            ["VIN", v.vin || "—"],
          ].map(([label, val]) => (
            <div
              key={label}
              style={{ gridColumn: label === "VIN" ? "1 / -1" : undefined }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "var(--gray-400)",
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--gray-700)",
                  fontFamily: label === "VIN" ? "var(--mono)" : "inherit",
                  fontSize: label === "VIN" ? 11 : 13,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card footer */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--gray-100)",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          onClick={() => onEdit(vehicle)}
          style={{
            flex: 1,
            padding: "8px 0",
            border: "1.5px solid var(--navy)",
            borderRadius: 8,
            background: "white",
            color: "var(--navy)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--gray-50)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
        >
          <Icon name="edit" size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(vehicle.id)}
          style={{
            flex: 1,
            padding: "8px 0",
            border: "1.5px solid #FECACA",
            borderRadius: 8,
            background: "white",
            color: "var(--red)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
        >
          <Icon name="trash" size={14} /> Remove
        </button>
      </div>
    </div>
  );
}

// ── Vehicle Form Modal ────────────────────────────────────────────────────────
function VehicleFormModal({
  editId,
  form,
  setForm,
  onSave,
  onClose,
  saving,
  error,
}) {
  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const isEdit = !!editId;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">
            {isEdit ? "✏️ Edit Vehicle" : "🚗 Register Vehicle"}
          </span>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
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

          {/* Make / Model / Year */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 120px",
              gap: 12,
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Make *</label>

              <input
                className="form-input"
                list="vehicleBrands"
                value={form.make}
                onChange={set("make")}
                placeholder="Select or type brand"
              />

              <datalist id="vehicleBrands">
                {vehicleBrands.map((brand, index) => (
                  <option key={index} value={brand} />
                ))}
              </datalist>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Model *</label>
              <input
                className="form-input"
                value={form.model}
                onChange={set("model")}
                placeholder="Camry"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Year *</label>
              <input
                className="form-input"
                type="number"
                value={form.year}
                onChange={set("year")}
                min="1980"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>

          <div style={{ height: 14 }} />

          {/* License Plate / Color */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">License Plate</label>
              <input
                className="form-input"
                value={form.licensePlate}
                onChange={(e) =>
                  setForm((p) => ({
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
                list="vehicleColors"
                value={form.color}
                onChange={set("color")}
                placeholder="Select or type color"
              />

              <datalist id="vehicleColors">
                {vehicleColors.map((color, index) => (
                  <option key={index} value={color} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Fuel / Transmission */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select
                className="form-select"
                value={form.fuelType}
                onChange={set("fuelType")}
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Transmission</label>
              <select
                className="form-select"
                value={form.transmissionType}
                onChange={set("transmissionType")}
              >
                {TRANSMISSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mileage / VIN */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Mileage (km)</label>
              <input
                className="form-input"
                type="number"
                value={form.mileage}
                onChange={set("mileage")}
                placeholder="50000"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">VIN</label>
              <input
                className="form-input"
                value={form.vin}
                onChange={(e) =>
                  setForm((p) => ({ ...p, vin: e.target.value.toUpperCase() }))
                }
                placeholder="17-character VIN (optional)"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-accent"
            onClick={onSave}
            disabled={saving || !form.make || !form.model || !form.year}
          >
            {saving
              ? isEdit
                ? "Saving..."
                : "Registering..."
              : isEdit
                ? "Save Changes"
                : "Register Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main UserVehiclesModule ───────────────────────────────────────────────────
export default function UserVehiclesModule({ vehicles, setVehicles }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (vehicle) => {
    setForm({
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || new Date().getFullYear(),
      color: vehicle.color || "",
      licensePlate: vehicle.licensePlate || "",
      vin: vehicle.vin || "",
      mileage: vehicle.mileage || "",
      fuelType: vehicle.fuelType || "PETROL",
      transmissionType: vehicle.transmissionType || "AUTOMATIC",
    });
    setEditId(vehicle.id);
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setError(null);
  };

  const save = async () => {
    if (!form.make.trim() || !form.model.trim() || !form.year) {
      setError("Make, Model and Year are required.");
      return;
    }
    setSaving(true);
    setError(null);

    // Build payload with correct types
    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      year: parseInt(form.year),
      color: form.color.trim() || null,
      licensePlate: form.licensePlate.trim() || null,
      vin: form.vin.trim() || null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      fuelType: form.fuelType,
      transmissionType: form.transmissionType,
    };

    try {
      if (editId) {
        // PUT /api/vehicles/{id} — backend checks ownership
        const { data } = await vehicleAPI.update(editId, payload);
        setVehicles((p) => p.map((v) => (v.id === editId ? data : v)));
      } else {
        // POST /api/vehicles — backend auto-links to user's customer record
        const { data } = await vehicleAPI.create(payload);
        setVehicles((p) => [...p, data]);
      }
      closeForm();
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data ||
        "Failed to save vehicle.";
      if (e.response?.status === 403) {
        setError("You are not authorised to edit this vehicle.");
      } else {
        setError(typeof msg === "string" ? msg : "Failed to save vehicle.");
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this vehicle from your account?")) return;
    setDeleting(id);
    try {
      await vehicleAPI.delete(id);
      setVehicles((p) => p.filter((v) => v.id !== id));
    } catch (e) {
      if (e.response?.status === 403) {
        alert("You are not authorised to remove this vehicle.");
      } else {
        alert(e.response?.data?.message || "Failed to remove vehicle.");
      }
    } finally {
      setDeleting(null);
    }
  };

  const filtered = vehicles.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (v.make || "").toLowerCase().includes(q) ||
      (v.model || "").toLowerCase().includes(q) ||
      (v.licensePlate || "").toLowerCase().includes(q) ||
      (v.color || "").toLowerCase().includes(q) ||
      String(v.year || "").includes(q)
    );
  });

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">My Vehicles</div>
          <div className="page-sub">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}{" "}
            registered to your account
          </div>
        </div>
        <button className="btn btn-accent" onClick={openAdd}>
          <Icon name="plus" size={15} /> Register Vehicle
        </button>
      </div>

      {/* ── Search ── */}
      {vehicles.length > 0 && (
        <div className="search-bar" style={{ marginBottom: 20, maxWidth: 340 }}>
          <Icon name="search" size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by make, model, plate..."
          />
        </div>
      )}

      {/* ── Empty state ── */}
      {vehicles.length === 0 && (
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: "60px 40px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,.07)",
            border: "1px solid var(--gray-100)",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>🚗</div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "var(--navy)",
              marginBottom: 8,
            }}
          >
            No Vehicles Yet
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--gray-400)",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            Register your vehicle to start booking
            <br />
            service appointments.
          </div>
          <button className="btn btn-accent" onClick={openAdd}>
            <Icon name="plus" size={15} /> Register Your First Vehicle
          </button>
        </div>
      )}

      {/* ── No search results ── */}
      {vehicles.length > 0 && filtered.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <div className="empty-text">No vehicles match "{search}"</div>
        </div>
      )}

      {/* ── Vehicle grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((v) => (
          <div
            key={v.id}
            style={{
              opacity: deleting === v.id ? 0.5 : 1,
              transition: "opacity .2s",
            }}
          >
            <VehicleCard vehicle={v} onEdit={openEdit} onDelete={remove} />
          </div>
        ))}
      </div>

      {/* ── Form Modal ── */}
      {showForm && (
        <VehicleFormModal
          editId={editId}
          form={form}
          setForm={setForm}
          onSave={save}
          onClose={closeForm}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}
