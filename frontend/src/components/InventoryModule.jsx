import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import { fmt } from "../utils/helpers";
import { partAPI } from "../services/api";

// ── Validation ────────────────────────────────────────────────────────────────
const EMPTY_ERRORS = {
  name: "", partNumber: "", category: "", unit: "",
  stockQuantity: "", minimumStock: "", unitCost: "", sellingPrice: "",
};

function validatePart(p) {
  const errors = { ...EMPTY_ERRORS };
  if (!p.name.trim()) {
    errors.name = "Part name is required.";
  } else if (p.name.trim().length < 3) {
    errors.name = "Part name must be at least 3 characters.";
  } else if (p.name.trim().length > 100) {
    errors.name = "Part name must be under 100 characters.";
  }
  if (p.partNumber && !/^[A-Za-z0-9\-_]+$/.test(p.partNumber.trim())) {
    errors.partNumber = "Part number can only contain letters, numbers, hyphens, or underscores.";
  }
  if (!p.category) errors.category = "Please select a category.";
  if (!p.unit.trim()) {
    errors.unit = "Unit is required (e.g. piece, bottle, set).";
  } else if (!/^[A-Za-z]+$/.test(p.unit.trim())) {
    errors.unit = "Unit must contain letters only.";
  }
  const qty = Number(p.stockQuantity);
  if (p.stockQuantity === "" || p.stockQuantity === null) {
    errors.stockQuantity = "Stock quantity is required.";
  } else if (!Number.isInteger(qty) || qty < 0) {
    errors.stockQuantity = "Stock quantity must be a whole number ≥ 0.";
  }
  const min = Number(p.minimumStock);
  if (p.minimumStock === "" || p.minimumStock === null) {
    errors.minimumStock = "Minimum stock level is required.";
  } else if (!Number.isInteger(min) || min < 1) {
    errors.minimumStock = "Minimum stock must be a whole number ≥ 1.";
  }
  const cost = Number(p.unitCost);
  if (p.unitCost === "" || p.unitCost === null) {
    errors.unitCost = "Cost price is required.";
  } else if (isNaN(cost) || cost < 0) {
    errors.unitCost = "Cost price must be a positive number.";
  }
  const sell = Number(p.sellingPrice);
  if (p.sellingPrice === "" || p.sellingPrice === null) {
    errors.sellingPrice = "Selling price is required.";
  } else if (isNaN(sell) || sell < 0) {
    errors.sellingPrice = "Selling price must be a positive number.";
  } else if (sell < cost && cost > 0) {
    errors.sellingPrice = "Selling price should not be less than the cost price.";
  }
  return errors;
}

function hasErrors(errors) {
  return Object.values(errors).some(v => v !== "");
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5,
                  color:"#DC2626", fontSize:12, fontWeight:500 }}>
      <span style={{ fontSize:13 }}>⚠</span> {msg}
    </div>
  );
}

// ── Image Preview Component ───────────────────────────────────────────────────
function PartImage({ part, size = 40 }) {
  if (!part.imageBase64) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 8,
        background: "var(--gray-100)", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, color: "var(--gray-400)", flexShrink: 0,
      }}>
        🔩
      </div>
    );
  }
  return (
    <img
      src={`data:${part.imageType || "image/jpeg"};base64,${part.imageBase64}`}
      alt={part.name}
      style={{
        width: size, height: size, borderRadius: 8,
        objectFit: "cover", flexShrink: 0,
        border: "1px solid var(--gray-200)",
      }}
    />
  );
}

// ── Image Upload Widget ───────────────────────────────────────────────────────
function ImageUpload({ imageFile, setImageFile, existingBase64, existingType }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [imageFile]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2 MB"); return; }
    setImageFile(file);
  };

  const displaySrc = preview
    ? preview
    : existingBase64
      ? `data:${existingType || "image/jpeg"};base64,${existingBase64}`
      : null;

  return (
    <div className="form-group">
      <label className="form-label">Part Image <span style={{ color:"var(--gray-400)", fontWeight:400 }}>(optional, max 2 MB)</span></label>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${dragOver ? "var(--accent)" : "var(--gray-300)"}`,
          borderRadius: 10, padding: 16, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 16,
          background: dragOver ? "var(--accent-light, #EFF6FF)" : "var(--gray-50)",
          transition: "all 0.15s",
        }}
      >
        {displaySrc ? (
          <>
            <img src={displaySrc} alt="preview"
              style={{ width:72, height:72, objectFit:"cover", borderRadius:8, border:"1px solid var(--gray-200)" }} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:13, color:"var(--gray-700)" }}>
                {imageFile ? imageFile.name : "Current image"}
              </div>
              {imageFile && (
                <div style={{ fontSize:12, color:"var(--gray-400)", marginTop:2 }}>
                  {(imageFile.size / 1024).toFixed(0)} KB · {imageFile.type}
                </div>
              )}
              <div style={{ fontSize:12, color:"var(--accent)", marginTop:4 }}>Click or drag to replace</div>
            </div>
            <button type="button" onClick={e => { e.stopPropagation(); setImageFile(null); }}
              style={{ background:"none", border:"none", cursor:"pointer", color:"var(--red)", fontSize:18, padding:4 }}>×</button>
          </>
        ) : (
          <div style={{ flex:1, textAlign:"center", padding:"8px 0" }}>
            <div style={{ fontSize:28, marginBottom:6 }}>🖼️</div>
            <div style={{ fontSize:13, color:"var(--gray-600)", fontWeight:500 }}>Click to upload or drag & drop</div>
            <div style={{ fontSize:12, color:"var(--gray-400)", marginTop:2 }}>JPG, PNG, WEBP — max 2 MB</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }}
        onChange={e => handleFile(e.target.files[0])} />
    </div>
  );
}

// ── View Part Modal ───────────────────────────────────────────────────────────
function ViewPartModal({ part, onClose }) {
  if (!part) return null;

  const qty     = part.qty ?? part.stockQuantity ?? 0;
  const min     = part.min ?? part.minimumStock ?? 5;
  const cost    = Number(part.unitCost   ?? 0);
  const sell    = Number(part.sellingPrice ?? part.price ?? 0);
  const isLow   = qty <= min;
  const pct     = Math.min(100, (qty / Math.max(min * 2, 1)) * 100);
  const margin  = cost > 0 ? (((sell - cost) / cost) * 100).toFixed(1) : null;
  const profit  = (sell - cost).toFixed(2);

  const Row = ({ label, value, mono = false }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"9px 0", borderBottom:"1px solid var(--gray-100)" }}>
      <span style={{ fontSize:12, color:"var(--gray-500)", fontWeight:500 }}>{label}</span>
      <span style={{ fontSize:13, color:"var(--gray-800)", fontWeight:600,
                     fontFamily: mono ? "monospace" : "inherit" }}>{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560, width: "100%" }}>

        {/* Header */}
        <div className="modal-header">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Icon name="eye" size={16} />
            <span className="modal-title">Part Details</span>
          </div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>

          {/* Top hero section — image + name + status */}
          <div style={{ display:"flex", gap:20, padding:"20px 24px 16px",
                        borderBottom:"1px solid var(--gray-100)", alignItems:"flex-start" }}>

            {/* Image */}
            <div style={{ flexShrink:0 }}>
              {part.imageBase64 ? (
                <img
                  src={`data:${part.imageType || "image/jpeg"};base64,${part.imageBase64}`}
                  alt={part.name}
                  style={{ width:110, height:110, borderRadius:12, objectFit:"cover",
                           border:"2px solid var(--gray-200)", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}
                />
              ) : (
                <div style={{ width:110, height:110, borderRadius:12, background:"var(--gray-100)",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:40, border:"2px solid var(--gray-200)" }}>
                  🔩
                </div>
              )}
            </div>

            {/* Name / meta */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:18, fontWeight:700, color:"var(--gray-900)",
                            marginBottom:4, lineHeight:1.3 }}>{part.name}</div>
              <div style={{ fontSize:12, color:"var(--gray-500)", fontFamily:"monospace",
                            marginBottom:10 }}>{part.partNumber || `#${part.id}`}</div>

              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                <span style={{ background:"var(--gray-100)", color:"var(--gray-700)",
                               borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:500 }}>
                  {part.category}
                </span>
                {part.brand && (
                  <span style={{ background:"#EFF6FF", color:"#2563EB",
                                 borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:500 }}>
                    {part.brand}
                  </span>
                )}
                <span style={{
                  background: isLow ? "#FEF2F2" : "#F0FDF4",
                  color:      isLow ? "#DC2626" : "#16A34A",
                  borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:600,
                }}>
                  {isLow ? "⚠ Low Stock" : "✓ In Stock"}
                </span>
              </div>

              {part.description && (
                <div style={{ marginTop:10, fontSize:12, color:"var(--gray-500)",
                              lineHeight:1.5, fontStyle:"italic" }}>
                  {part.description}
                </div>
              )}
            </div>
          </div>

          {/* Stock bar */}
          <div style={{ padding:"14px 24px", borderBottom:"1px solid var(--gray-100)",
                        background: isLow ? "#FFF9F9" : "#F9FFFE" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--gray-600)" }}>Stock Level</span>
              <span style={{ fontSize:12, fontWeight:700, color: isLow ? "var(--red)" : "var(--green)" }}>
                {qty} / {min * 2} {part.unit}s &nbsp;·&nbsp; Min: {min}
              </span>
            </div>
            <div style={{ height:8, borderRadius:99, background:"var(--gray-200)", overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:99, transition:"width 0.4s",
                width:`${pct}%`,
                background: isLow
                  ? "linear-gradient(90deg,#EF4444,#F87171)"
                  : "linear-gradient(90deg,#22C55E,#4ADE80)",
              }} />
            </div>
          </div>

          {/* Details grid */}
          <div style={{ padding:"4px 24px 8px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>

            {/* Left column */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--gray-400)",
                            textTransform:"uppercase", letterSpacing:1, padding:"12px 0 4px" }}>
                Pricing
              </div>
              <Row label="Cost Price"     value={`$${fmt(cost)}`} />
              <Row label="Selling Price"  value={`$${fmt(sell)}`} />
              {margin !== null && (
                <Row label="Margin"
                  value={
                    <span style={{ color: Number(margin) >= 0 ? "#16A34A" : "#DC2626" }}>
                      {margin}% &nbsp;(+${profit})
                    </span>
                  }
                />
              )}
            </div>

            {/* Right column */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--gray-400)",
                            textTransform:"uppercase", letterSpacing:1, padding:"12px 0 4px" }}>
                Details
              </div>
              <Row label="Unit"       value={part.unit} />
              <Row label="Supplier"   value={part.supplier} />
              <Row label="Min. Stock" value={`${min} ${part.unit}s`} />
              <Row label="Status"     value={part.active !== false ? "Active" : "Inactive"} />
            </div>

          </div>

          {/* Stock value callout */}
          <div style={{ margin:"4px 24px 20px", borderRadius:10, padding:"12px 16px",
                        background:"linear-gradient(135deg,#F0F9FF,#E0F2FE)",
                        border:"1px solid #BAE6FD", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, color:"#0369A1", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>
                Total Stock Value
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:"#0C4A6E", marginTop:2 }}>
                ${fmt(qty * sell)}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"#0369A1", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>
                At Cost
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:"#075985", marginTop:2 }}>
                ${fmt(qty * cost)}
              </div>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main InventoryModule ──────────────────────────────────────────────────────
function InventoryModule({ inventory, setInventory }) {
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showAdd,   setShowAdd]   = useState(false);
  const [viewPart,  setViewPart]  = useState(null);   // ← view popup state
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [fieldErrors,     setFieldErrors]     = useState(EMPTY_ERRORS);
  const [touched,         setTouched]         = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [newPart, setNewPart] = useState({
    partNumber: "", name: "", category: "Fluids", stockQuantity: "",
    minimumStock: "", unitCost: "", sellingPrice: "", unit: "piece",
    brand: "", supplier: "",
  });

  useEffect(() => {
    if (submitAttempted || Object.keys(touched).length > 0) {
      setFieldErrors(validatePart(newPart));
    }
  }, [newPart, submitAttempted, touched]);

  const cats = ["all", ...Array.from(new Set(inventory.map(p => p.category)))];

  const normalize = (p) => ({
    ...p,
    qty:   p.qty   ?? p.stockQuantity ?? 0,
    min:   p.min   ?? p.minimumStock  ?? 5,
    price: p.price ?? p.sellingPrice  ?? 0,
  });

  const filtered = inventory.map(normalize).filter(p => {
    const matchC = catFilter === "all" || p.category === catFilter;
    const matchS = !search
      || p.name.toLowerCase().includes(search.toLowerCase())
      || (p.partNumber || p.id || "").toString().includes(search);
    return matchC && matchS;
  });

  const lowStock = inventory.filter(
    p => (p.qty ?? p.stockQuantity ?? 0) <= (p.min ?? p.minimumStock ?? 5)
  ).length;

  const handleBlur = field => setTouched(prev => ({ ...prev, [field]: true }));
  const showError  = field => (submitAttempted || touched[field]) && !!fieldErrors[field];
  const inputStyle = (field, extra = {}) => ({
    ...extra,
    borderColor: showError(field)
      ? "#DC2626"
      : (touched[field] || submitAttempted) && !fieldErrors[field]
        ? "#16A34A"
        : extra.borderColor || undefined,
    boxShadow: showError(field) ? "0 0 0 2px #FEE2E2" : undefined,
  });

  const openAdd = () => {
    setError(null); setFieldErrors(EMPTY_ERRORS);
    setTouched({}); setSubmitAttempted(false); setImageFile(null);
    setNewPart({ partNumber:"", name:"", category:"Fluids", stockQuantity:"",
                 minimumStock:"", unitCost:"", sellingPrice:"", unit:"piece", brand:"", supplier:"" });
    setShowAdd(true);
  };

  const savePart = async () => {
    setSubmitAttempted(true);
    const errors = validatePart(newPart);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;
    setSaving(true); setError(null);
    try {
      const payload = {
        partNumber:    newPart.partNumber.trim() || `P${Date.now()}`,
        name:          newPart.name.trim(),
        category:      newPart.category,
        stockQuantity: parseInt(newPart.stockQuantity),
        minimumStock:  parseInt(newPart.minimumStock),
        unitCost:      parseFloat(newPart.unitCost),
        sellingPrice:  parseFloat(newPart.sellingPrice),
        unit:          newPart.unit.trim(),
        brand:         newPart.brand.trim(),
        supplier:      newPart.supplier.trim(),
        active:        true,
      };
      const res = await partAPI.create(payload, imageFile);
      setInventory(p => [...p, res.data]);
      setShowAdd(false);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save part. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const adjust = async (part, delta) => {
    try {
      const res = await partAPI.adjustStock(part.id, delta);
      setInventory(p => p.map(i => i.id === part.id ? res.data : i));
    } catch {
      setInventory(p => p.map(i =>
        i.id === part.id
          ? { ...i,
              stockQuantity: Math.max(0, (i.stockQuantity || i.qty || 0) + delta),
              qty:           Math.max(0, (i.qty || i.stockQuantity || 0) + delta) }
          : i
      ));
    }
  };

  const deletePart = async (id) => {
    if (!window.confirm("Deactivate this part?")) return;
    try {
      await partAPI.delete(id);
      setInventory(p => p.filter(i => i.id !== id));
    } catch { alert("Delete failed. Please try again."); }
  };

  const errorCount = Object.values(fieldErrors).filter(Boolean).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Inventory</div>
          <div className="page-sub">{inventory.length} SKUs · {lowStock} low stock</div>
        </div>
        <button className="btn btn-accent" onClick={openAdd}>
          <Icon name="plus" size={15} /> Add Part
        </button>
      </div>

      {lowStock > 0 && (
        <div className="alert alert-warning">
          <Icon name="alert" size={16} />
          <strong>{lowStock} item{lowStock > 1 ? "s" : ""} below minimum stock level.</strong> Please reorder soon.
        </div>
      )}

      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <div className="search-bar">
          <Icon name="search" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts..." />
        </div>
        <div className="filter-chips">
          {cats.map(c => (
            <span key={c} className={`chip ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>
              {c === "all" ? "All" : c}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width:52 }}></th>
                <th>Part ID</th><th>Name</th><th>Category</th><th>Stock</th>
                <th>Min. Level</th><th>Status</th><th>Unit Price</th><th>Adjust</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const isLow = p.qty <= p.min;
                const pct   = Math.min(100, (p.qty / (p.min * 2)) * 100);
                return (
                  <tr key={p.id}>
                    <td><PartImage part={p} size={40} /></td>
                    <td><span className="td-mono">{p.partNumber || p.id}</span></td>
                    <td><span className="td-bold">{p.name}</span></td>
                    <td>{p.category}</td>
                    <td>
                      <strong style={{ color: isLow ? "var(--red)" : "var(--gray-800)" }}>{p.qty}</strong>
                      <span style={{ fontSize:11, color:"var(--gray-400)" }}> {p.unit}s</span>
                    </td>
                    <td>{p.min}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div className="progress-bar" style={{ width:60 }}>
                          <div className="progress-fill" style={{ width:`${pct}%`, background: isLow ? "var(--red)" : "var(--green)" }} />
                        </div>
                        <span className={`badge badge-${isLow ? "low-stock" : "ok"}`}>{isLow ? "Low" : "OK"}</span>
                      </div>
                    </td>
                    <td>
                      <strong>${fmt(p.price)}</strong>
                      <span style={{ fontSize:11, color:"var(--gray-400)" }}> / {p.unit}</span>
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => adjust(p, -1)} style={{ padding:"4px 10px", fontWeight:700 }}>−</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => adjust(p,  1)} style={{ padding:"4px 10px", fontWeight:700 }}>+</button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:6 }}>
                        {/* ── View button ── */}
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setViewPart(p)}
                          title="View details"
                          style={{ color:"var(--accent)" }}
                        >
                          <Icon name="eye" size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => deletePart(p.id)}>
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10}><div className="empty"><div className="empty-text">No parts found</div></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── View Part Modal ── */}
      <ViewPartModal part={viewPart} onClose={() => setViewPart(null)} />

      {/* ── Add Part Modal ── */}
      {showAdd && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Part / Product</span>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowAdd(false)}>
                <Icon name="x" />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8,
                              padding:"10px 14px", marginBottom:16, color:"#DC2626", fontSize:13,
                              display:"flex", alignItems:"flex-start", gap:8 }}>
                  <span style={{ fontSize:15, marginTop:1 }}>⛔</span><span>{error}</span>
                </div>
              )}
              {submitAttempted && hasErrors(fieldErrors) && (
                <div style={{ background:"#FFFBEB", border:"1px solid #FCD34D", borderRadius:8,
                              padding:"10px 14px", marginBottom:16, color:"#92400E", fontSize:12,
                              display:"flex", alignItems:"flex-start", gap:8 }}>
                  <span style={{ fontSize:14, marginTop:1 }}>⚠️</span>
                  <span>{errorCount} field{errorCount !== 1 ? "s need" : " needs"} attention before saving.</span>
                </div>
              )}
              {!fieldErrors.sellingPrice && newPart.unitCost && newPart.sellingPrice &&
               Number(newPart.sellingPrice) > Number(newPart.unitCost) && (
                <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8,
                              padding:"10px 14px", marginBottom:16, fontSize:12, color:"#15803D",
                              display:"flex", alignItems:"center", gap:8 }}>
                  <span>💰</span>
                  <span>Margin: <strong>
                    {(((Number(newPart.sellingPrice) - Number(newPart.unitCost)) / Number(newPart.unitCost)) * 100).toFixed(1)}%
                  </strong> (${(Number(newPart.sellingPrice) - Number(newPart.unitCost)).toFixed(2)} per unit)</span>
                </div>
              )}

              <ImageUpload imageFile={imageFile} setImageFile={setImageFile} existingBase64={null} existingType={null} />

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Part Number</label>
                  <input className="form-input" value={newPart.partNumber} placeholder="P-0001"
                    style={inputStyle("partNumber")}
                    onChange={e => setNewPart(p => ({ ...p, partNumber: e.target.value }))}
                    onBlur={() => handleBlur("partNumber")} />
                  <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:4 }}>Optional — auto-generated if left blank</div>
                  <FieldError msg={showError("partNumber") ? fieldErrors.partNumber : ""} />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-input" value={newPart.brand} placeholder="Bosch, NGK..."
                    onChange={e => setNewPart(p => ({ ...p, brand: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Part Name <span style={{ color:"var(--red)" }}>*</span></label>
                <input className="form-input" value={newPart.name} placeholder="e.g. Brake Disc - Front"
                  style={inputStyle("name")}
                  onChange={e => setNewPart(p => ({ ...p, name: e.target.value }))}
                  onBlur={() => handleBlur("name")} />
                <div style={{ fontSize:11, color: newPart.name.length > 90 ? "#DC2626" : "var(--gray-400)", marginTop:4 }}>
                  {newPart.name.length} / 100 characters</div>
                <FieldError msg={showError("name") ? fieldErrors.name : ""} />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category <span style={{ color:"var(--red)" }}>*</span></label>
                  <select className="form-select" value={newPart.category} style={inputStyle("category")}
                    onChange={e => setNewPart(p => ({ ...p, category: e.target.value }))}
                    onBlur={() => handleBlur("category")}>
                    <option value="">Select category...</option>
                    <option>Fluids</option><option>Filters</option><option>Brakes</option>
                    <option>Engine</option><option>Accessories</option><option>Tyres</option>
                  </select>
                  <FieldError msg={showError("category") ? fieldErrors.category : ""} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit <span style={{ color:"var(--red)" }}>*</span></label>
                  <input className="form-input" value={newPart.unit} placeholder="piece, bottle, set..."
                    style={inputStyle("unit")}
                    onChange={e => setNewPart(p => ({ ...p, unit: e.target.value }))}
                    onBlur={() => handleBlur("unit")} />
                  <FieldError msg={showError("unit") ? fieldErrors.unit : ""} />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Quantity <span style={{ color:"var(--red)" }}>*</span></label>
                  <input className="form-input" type="number" min="0" value={newPart.stockQuantity}
                    style={inputStyle("stockQuantity")}
                    onChange={e => setNewPart(p => ({ ...p, stockQuantity: e.target.value }))}
                    onBlur={() => handleBlur("stockQuantity")} />
                  <FieldError msg={showError("stockQuantity") ? fieldErrors.stockQuantity : ""} />
                </div>
                <div className="form-group">
                  <label className="form-label">Min. Level <span style={{ color:"var(--red)" }}>*</span></label>
                  <input className="form-input" type="number" min="1" value={newPart.minimumStock}
                    style={inputStyle("minimumStock")}
                    onChange={e => setNewPart(p => ({ ...p, minimumStock: e.target.value }))}
                    onBlur={() => handleBlur("minimumStock")} />
                  <FieldError msg={showError("minimumStock") ? fieldErrors.minimumStock : ""} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost Price ($) <span style={{ color:"var(--red)" }}>*</span></label>
                  <input className="form-input" type="number" min="0" step="0.01" value={newPart.unitCost}
                    style={inputStyle("unitCost")}
                    onChange={e => setNewPart(p => ({ ...p, unitCost: e.target.value }))}
                    onBlur={() => handleBlur("unitCost")} />
                  <FieldError msg={showError("unitCost") ? fieldErrors.unitCost : ""} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Selling Price ($) <span style={{ color:"var(--red)" }}>*</span></label>
                <input className="form-input" type="number" min="0" step="0.01" value={newPart.sellingPrice}
                  style={inputStyle("sellingPrice")}
                  onChange={e => setNewPart(p => ({ ...p, sellingPrice: e.target.value }))}
                  onBlur={() => handleBlur("sellingPrice")} />
                <FieldError msg={showError("sellingPrice") ? fieldErrors.sellingPrice : ""} />
              </div>

              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input className="form-input" value={newPart.supplier} placeholder="Supplier name..."
                  onChange={e => setNewPart(p => ({ ...p, supplier: e.target.value }))} />
              </div>
            </div>

            <div className="modal-footer">
              <span style={{ fontSize:11, color:"var(--gray-400)", marginRight:"auto" }}>
                <span style={{ color:"var(--red)" }}>*</span> Required fields
              </span>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={savePart} disabled={saving}>
                {saving ? "Saving..." : "Add Part"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryModule;