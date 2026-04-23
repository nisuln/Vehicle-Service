// src/components/BookingsModule.jsx
import { useState, useEffect } from "react";
import Icon from "./Icon";
import { bookingAPI, vehicleAPI, userAPI, loyaltyAPI } from "../services/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","13:00","13:30","14:00",
  "14:30","15:00","15:30","16:00","16:30","17:00",
];
const SERVICES = [
  "Oil Change","Tire Rotation","Brake Inspection","Full Service",
  "Engine Diagnostics","AC Service","Battery Replacement",
  "Wheel Alignment","Transmission Service","Suspension Check",
];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function todayStr() { return new Date().toISOString().split("T")[0]; }
function maxDateStr() {
  const d = new Date(); d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
}
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOfMonth(y, m) { return new Date(y, m, 1).getDay(); }
function toDisplayDate(ds) {
  if (!ds) return "—";
  const [y, m, d] = ds.split("-");
  return `${d} ${MONTHS[parseInt(m) - 1].slice(0, 3)} ${y}`;
}

// Normalise API booking to consistent shape
function normBk(b) {
  return {
    ...b,
    date:     b.bookingDate  || b.date     || "",
    time:     b.bookingTime  ? String(b.bookingTime).slice(0, 5) : (b.time || ""),
    owner:    b.customerName || b.owner    || b.ownerUsername || "Customer",
    vehicle:  b.vehicleInfo  || b.vehicle  || "Vehicle",
    service:  b.serviceType  || b.service  || "",
    mechanic: b.mechanicName || b.mechanic || "",
    status:   (b.status || "CONFIRMED").toLowerCase(),
  };
}

// ── Calendar Event Pill ───────────────────────────────────────────────────────
function Pill({ bk, onClick, isAdmin, isOwn }) {
  const colour = bk.status === "cancelled" ? "var(--red)"
               : bk.status === "pending"   ? "var(--amber)"
               : "var(--green)";

  // Admin sees customer name; user sees "Mine" / "Booked" / "Cancelled"
  const label = isAdmin
    ? `${bk.time} ${bk.owner.split(" ")[0]}`
    : bk.status === "cancelled"
      ? `${bk.time} Cancelled`
      : isOwn
        ? `${bk.time} Mine`
        : `${bk.time} Booked`;

  const clickable = isAdmin || isOwn;

  return (
    <div
      onClick={e => { e.stopPropagation(); if (clickable) onClick(bk); }}
      style={{
        background: colour, color: "white", borderRadius: 4, padding: "2px 5px",
        fontSize: 10, fontWeight: 600, marginBottom: 2, whiteSpace: "nowrap",
        overflow: "hidden", textOverflow: "ellipsis",
        cursor: clickable ? "pointer" : "default",
        opacity: (!isAdmin && !isOwn && bk.status !== "cancelled") ? 0.8 : 1,
      }}
    >
      {label}
    </div>
  );
}

// ── Day Detail Panel ──────────────────────────────────────────────────────────
function DayPanel({ dateStr, bookings, onAdd, onCancel, onDetail, isAdmin, currentUserVehicleIds }) {
  if (!dateStr) return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-header"><span style={{ fontWeight: 700 }}>Bookings</span></div>
      <div className="empty" style={{ paddingTop: 60 }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: .25 }}>📅</div>
        <div className="empty-text">Click a date to view bookings</div>
      </div>
    </div>
  );

  const dayBks = bookings
    .filter(b => b.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));
  const isPast = dateStr < todayStr();

  const isOwnBooking = (bk) =>
    isAdmin || (currentUserVehicleIds && currentUserVehicleIds.includes(bk.vehicleId));

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <div className="card-header">
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{toDisplayDate(dateStr)}</div>
          <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>
            {dayBks.length} booking{dayBks.length !== 1 ? "s" : ""}
          </div>
        </div>
        {!isPast && (
          <button className="btn btn-accent btn-sm" onClick={() => onAdd(dateStr)}>
            <Icon name="plus" size={13} /> Add
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {dayBks.length === 0 && (
          <div className="empty" style={{ padding: "32px 16px" }}>
            <div className="empty-text" style={{ fontSize: 13 }}>No bookings this day</div>
            {!isPast && (
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}
                onClick={() => onAdd(dateStr)}>
                <Icon name="plus" size={13} /> Book a slot
              </button>
            )}
          </div>
        )}

        {dayBks.map(bk => {
          const own = isOwnBooking(bk);
          const cancelled = bk.status === "cancelled";
          const clickable = isAdmin || own;

          return (
            <div key={bk.id}
              onClick={() => clickable && onDetail(bk)}
              style={{
                padding: "14px 20px", borderBottom: "1px solid var(--gray-100)",
                cursor: clickable ? "pointer" : "default",
                opacity: cancelled ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (clickable) e.currentTarget.style.background = "var(--gray-50)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{
                    display: "inline-flex", alignItems: "center",
                    background: cancelled ? "var(--gray-300)" : "var(--navy)",
                    color: "white", fontSize: 11,
                    fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                    marginBottom: 7, fontFamily: "var(--mono)",
                  }}>{bk.time}</div>

                  {isAdmin ? (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{bk.owner}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{bk.vehicle}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 3 }}>
                        {bk.service}{bk.mechanic ? ` · ${bk.mechanic}` : ""}
                      </div>
                    </>
                  ) : own ? (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--navy)" }}>My Booking</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{bk.vehicle}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 3 }}>
                        {bk.service}{bk.mechanic ? ` · ${bk.mechanic}` : ""}
                      </div>
                    </>
                  ) : (
                    /* Other users' bookings — time only, no personal info */
                    <div style={{ fontWeight: 600, fontSize: 13, color: cancelled ? "var(--gray-400)" : "var(--gray-600)" }}>
                      {cancelled ? "Cancelled — slot available" : "Booked"}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span className={`badge badge-${bk.status}`}>
                    {bk.status.charAt(0).toUpperCase() + bk.status.slice(1)}
                  </span>
                  {/* Cancel: admin only */}
                  {isAdmin && !cancelled && (
                    <button className="btn btn-danger btn-sm" style={{ fontSize: 11 }}
                      onClick={e => { e.stopPropagation(); onCancel(bk.id); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slot availability strip — always visible so users know what's free */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--gray-100)", background: "var(--gray-50)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "var(--gray-400)", marginBottom: 8 }}>
          Slot Availability
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {TIME_SLOTS.map(slot => {
            // Only taken if there's an active (non-cancelled) booking
            const taken = dayBks.some(b => b.time === slot && b.status !== "cancelled");
            return (
              <span key={slot}
                onClick={() => !taken && !isPast && onAdd(dateStr, slot)}
                style={{
                  padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  fontFamily: "var(--mono)",
                  background: taken ? "var(--red-light)" : "var(--green-light)",
                  color: taken ? "var(--red)" : "var(--green)",
                  cursor: taken || isPast ? "default" : "pointer",
                  border: `1px solid ${taken ? "#FECACA" : "#BBF7D0"}`,
                }}
              >
                {slot}{taken ? " · Booked" : ""}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ bk, onClose, onCancel, isAdmin }) {
  if (!bk) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <span className="modal-title">Booking Detail</span>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <span className={`badge badge-${bk.status}`} style={{ fontSize: 13, padding: "5px 14px" }}>
              {bk.status.charAt(0).toUpperCase() + bk.status.slice(1)}
            </span>
            <span className="td-mono" style={{ fontSize: 12, color: "var(--accent)" }}>#{bk.id}</span>
          </div>
          {[
            ...(isAdmin ? [["Customer", bk.owner]] : []),
            ["Vehicle",  bk.vehicle],
            ["Date",     toDisplayDate(bk.date)],
            ["Time",     bk.time],
            ["Service",  bk.service],
            ["Mechanic", bk.mechanic || "—"],
            ["Notes",    bk.notes    || "—"],
          ].map(([label, val]) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "9px 0",
              borderBottom: "1px solid var(--gray-100)", fontSize: 13,
            }}>
              <span style={{ color: "var(--gray-400)", fontWeight: 600 }}>{label}</span>
              <span style={{ fontWeight: 600, color: "var(--gray-800)", textAlign: "right", maxWidth: 220 }}>{val}</span>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {/* Cancel button: admin only */}
          {isAdmin && bk.status !== "cancelled" && (
            <button className="btn btn-danger" onClick={() => { onCancel(bk.id); onClose(); }}>
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main BookingsModule ───────────────────────────────────────────────────────
export default function BookingsModule({ isAdmin }) {
  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const [bookings,  setBookings]  = useState([]);
  const [vehicles,  setVehicles]  = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [myVehicleIds, setMyVehicleIds] = useState([]);
  const [loyalty,      setLoyalty]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [detailBk,     setDetailBk]     = useState(null);
  const [showNew,      setShowNew]      = useState(false);
  const [newBk, setNewBk] = useState({
    vehicleId: "", date: "", time: "09:00",
    service: SERVICES[0], mechanic: "", notes: "",
  });

  // ── Fetch everything from API ────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      bookingAPI.getAll(),
      vehicleAPI.getAll(),
      userAPI.getMechanics(),
      !isAdmin ? vehicleAPI.getMy().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ])
      .then(([bRes, vRes, mRes, myVRes]) => {
        setBookings((bRes.data || []).map(normBk));
        setVehicles(vRes.data  || []);
        setMechanics((mRes.data || []).map(u => u.fullName || u.username));
        if (!isAdmin) {
          setMyVehicleIds((myVRes.data || []).map(v => v.id));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  // Fetch loyalty status for non-admin users
  useEffect(() => {
    if (!isAdmin) {
      loyaltyAPI.getStatus().then(r => setLoyalty(r.data)).catch(() => {});
    }
  }, [isAdmin]);

  // ── Calendar nav ─────────────────────────────────────────────────────────────
  const curMonth = today.getMonth();
  const curYear  = today.getFullYear();
  const maxDate  = new Date(today); maxDate.setMonth(maxDate.getMonth() + 3);
  const maxYear  = maxDate.getFullYear();
  const maxMonth = maxDate.getMonth();

  const canGoPrev = !(calYear === curYear  && calMonth === curMonth);
  const canGoNext = !(calYear === maxYear  && calMonth === maxMonth);

  const goPrev = () => {
    if (!canGoPrev) return;
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setSelectedDate(null);
  };
  const goNext = () => {
    if (!canGoNext) return;
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setSelectedDate(null);
  };

  // ── Build cells ───────────────────────────────────────────────────────────────
  const totalDays = daysInMonth(calYear, calMonth);
  const firstDay  = firstDayOfMonth(calYear, calMonth);
  const calCells  = [];
  for (let i = 0; i < firstDay; i++) calCells.push(null);
  for (let d = 1; d <= totalDays; d++) calCells.push(d);

  const toDateStr = d =>
    `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const getBkForDay  = d => bookings.filter(b => b.date === toDateStr(d));
  const isPastDay    = d => toDateStr(d) < todayStr();
  const isOwnBooking = (bk) => isAdmin || myVehicleIds.includes(bk.vehicleId);

  // ── Open new form ─────────────────────────────────────────────────────────────
  const openNew = (dateStr = "", time = "09:00") => {
    setNewBk({ vehicleId: "", date: dateStr, time, service: SERVICES[0], mechanic: "", notes: "" });
    setSaveError(null);
    setShowNew(true);
  };

  // ── Save to API ───────────────────────────────────────────────────────────────
  const saveBk = async () => {
    if (!newBk.vehicleId || !newBk.date || !newBk.time) {
      setSaveError("Vehicle, date and time are required.");
      return;
    }
    // Cancelled slots are FREE — only block active bookings
    const slotTaken = bookings.some(
      b => b.date === newBk.date && b.time === newBk.time && b.status !== "cancelled"
    );
    if (slotTaken) {
      setSaveError("That time slot is already booked. Please choose another time.");
      return;
    }
    setSaving(true); setSaveError(null);
    try {
      const payload = {
        vehicleId:    parseInt(newBk.vehicleId),
        bookingDate:  newBk.date,
        bookingTime:  newBk.time.length === 5 ? newBk.time + ":00" : newBk.time,
        serviceType:  newBk.service,
        mechanicName: newBk.mechanic || null,
        notes:        newBk.notes    || null,
      };
      const { data } = await bookingAPI.create(payload);
      setBookings(p => [...p, normBk(data)]);
      if (!isAdmin && !myVehicleIds.includes(parseInt(newBk.vehicleId))) {
        setMyVehicleIds(p => [...p, parseInt(newBk.vehicleId)]);
      }
      setShowNew(false);
      const [y, m] = newBk.date.split("-").map(Number);
      setCalYear(y); setCalMonth(m - 1);
      setSelectedDate(newBk.date);
    } catch (e) {
      setSaveError(e.response?.data?.message || "Failed to create booking.");
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel booking ─────────────────────────────────────────────────────────────
  const cancelBk = async id => {
    try {
      await bookingAPI.cancel(id);
      setBookings(p => p.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
      setDetailBk(d => d?.id === id ? { ...d, status: "cancelled" } : d);
    } catch (e) {
      alert(e.response?.data?.message || "Could not cancel booking.");
    }
  };

  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const pending   = bookings.filter(b => b.status === "pending").length;

  if (loading) return (
    <div className="page">
      <div style={{ textAlign: "center", padding: 60, color: "var(--gray-400)" }}>
        Loading bookings...
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">
            {isAdmin ? "Service Bookings" : "My Bookings"}
          </div>
          <div className="page-sub">
            {bookings.length} total · {confirmed} confirmed · {pending} pending
          </div>
        </div>
        <button className="btn btn-accent" onClick={() => openNew()}>
          <Icon name="plus" size={15} /> New Booking
        </button>
      </div>

      {/* ── Loyalty Notification Banner (user only) ── */}
      {!isAdmin && loyalty && (
        <div style={{
          marginBottom: 18,
          borderRadius: 12,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          background: loyalty.freeServiceReady
            ? "linear-gradient(135deg, #FFFBEB, #FEF3C7)"
            : "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
          border: loyalty.freeServiceReady
            ? "2px solid #D97706"
            : "1px solid #BFDBFE",
          boxShadow: loyalty.freeServiceReady ? "0 0 0 3px #FEF3C7" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 26 }}>{loyalty.freeServiceReady ? "🎁" : "⭐"}</span>
            <div>
              <div style={{
                fontWeight: 700, fontSize: 13,
                color: loyalty.freeServiceReady ? "#92400E" : "var(--navy)",
              }}>
                {loyalty.freeServiceReady ? "🎉 Free Service Ready!" : "Loyalty Reward"}
              </div>
              <div style={{ fontSize: 12, color: loyalty.freeServiceReady ? "#B45309" : "var(--gray-500)", marginTop: 1 }}>
                {loyalty.message}
              </div>
            </div>
          </div>
          {/* Mini progress dots */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: 22, height: 22, borderRadius: "50%",
                background: (loyalty.freeServiceReady || i <= loyalty.cycleProgress)
                  ? (loyalty.freeServiceReady ? "#D97706" : "var(--navy)")
                  : "var(--gray-100)",
                color: (loyalty.freeServiceReady || i <= loyalty.cycleProgress) ? "white" : "var(--gray-400)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
                border: (loyalty.freeServiceReady || i <= loyalty.cycleProgress) ? "none" : "1.5px solid var(--gray-200)",
              }}>
                {(loyalty.freeServiceReady || i <= loyalty.cycleProgress) ? "✓" : i}
              </div>
            ))}
            <span style={{ fontSize: 18, marginLeft: 2 }}>🎁</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 12, color: "var(--gray-500)", alignItems: "center", flexWrap: "wrap" }}>
        {[["var(--green)","Confirmed"],["var(--amber)","Pending"],["var(--red)","Cancelled"]].map(([c,l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: "inline-block" }} />{l}
          </span>
        ))}
        {!isAdmin && (
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--gray-300)", display: "inline-block" }} />
            Others (time only)
          </span>
        )}
        <span style={{ marginLeft: "auto", color: "var(--gray-400)", fontStyle: "italic" }}>
          💡 Cancelled slots are available to book again
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* Calendar */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="btn btn-ghost btn-sm" onClick={goPrev} disabled={!canGoPrev}
                style={{ opacity: canGoPrev ? 1 : .3, fontSize: 18, padding: "2px 10px" }}>‹</button>
              <span style={{ fontWeight: 700, minWidth: 160, textAlign: "center" }}>
                {MONTHS[calMonth]} {calYear}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={goNext} disabled={!canGoNext}
                style={{ opacity: canGoNext ? 1 : .3, fontSize: 18, padding: "2px 10px" }}>›</button>
            </div>
            <span style={{ fontSize: 12, color: "var(--gray-400)" }}>
              {selectedDate ? toDisplayDate(selectedDate) : "No date selected"}
            </span>
          </div>

          <div className="card-body">
            <div className="cal-grid">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="cal-header-cell">{d}</div>
              ))}
              {calCells.map((day, idx) => {
                const dateStr    = day ? toDateStr(day) : null;
                const dayBks     = day ? getBkForDay(day) : [];
                const isToday    = dateStr === todayStr();
                const isSelected = dateStr === selectedDate;
                const isPast     = day ? isPastDay(day) : false;
                const hasActive  = dayBks.some(b => b.status !== "cancelled");

                return (
                  <div key={idx}
                    onClick={() => day && setSelectedDate(isSelected ? null : dateStr)}
                    className={`cal-cell ${!day ? "other-month" : ""} ${isToday ? "today" : ""}`}
                    style={{
                      cursor: day ? "pointer" : "default",
                      opacity: isPast ? 0.45 : 1,
                      outline: isSelected ? "2.5px solid var(--accent)" : undefined,
                      outlineOffset: isSelected ? "-2px" : undefined,
                      background: isSelected ? "#FFF5F2" : undefined,
                    }}
                    onMouseEnter={e => { if (day && !isSelected) e.currentTarget.style.background = "var(--gray-50)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = ""; }}
                  >
                    {day && (
                      <>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <div className={`cal-day-num ${isToday ? "today-num" : ""}`}>{day}</div>
                          {hasActive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />}
                        </div>
                        {dayBks.map(b => (
                          <Pill
                            key={b.id}
                            bk={b}
                            onClick={setDetailBk}
                            isAdmin={isAdmin}
                            isOwn={isOwnBooking(b)}
                          />
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day Panel */}
        <DayPanel
          dateStr={selectedDate}
          bookings={bookings}
          onAdd={openNew}
          onCancel={cancelBk}
          onDetail={setDetailBk}
          isAdmin={isAdmin}
          currentUserVehicleIds={myVehicleIds}
        />
      </div>

      {/* Detail Modal */}
      {detailBk && (
        <DetailModal bk={detailBk} onClose={() => setDetailBk(null)} onCancel={cancelBk} isAdmin={isAdmin} />
      )}

      {/* New Booking Modal */}
      {showNew && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">New Booking</span>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowNew(false)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              {saveError && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#DC2626", fontSize: 13 }}>
                  {saveError}
                </div>
              )}
              {newBk.date && (
                <div style={{ background: "var(--accent-light)", border: "1px solid #FBBCAB", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--accent)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="calendar" size={14} /> Date pre-filled: <strong>{toDisplayDate(newBk.date)}</strong>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Vehicle *</label>
                <select className="form-select" value={newBk.vehicleId}
                  onChange={e => setNewBk(p => ({ ...p, vehicleId: e.target.value }))}>
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.customerName || v.owner || "Owner"} — {v.year} {v.make} {v.model} ({v.licensePlate || "No plate"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input className="form-input" type="date"
                    value={newBk.date} min={todayStr()} max={maxDateStr()}
                    onChange={e => setNewBk(p => ({ ...p, date: e.target.value }))}
                    style={newBk.date ? { borderColor: "var(--accent)", background: "#FFF5F2" } : {}}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <select className="form-select" value={newBk.time}
                    onChange={e => setNewBk(p => ({ ...p, time: e.target.value }))}>
                    {TIME_SLOTS.map(t => {
                      const taken = newBk.date && bookings.some(
                        b => b.date === newBk.date && b.time === t && b.status !== "cancelled"
                      );
                      return <option key={t} value={t} disabled={taken}>{t}{taken ? " — Booked" : ""}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Service Type</label>
                  <select className="form-select" value={newBk.service}
                    onChange={e => setNewBk(p => ({ ...p, service: e.target.value }))}>
                    {SERVICES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" rows={2} value={newBk.notes}
                  onChange={e => setNewBk(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any special instructions..." />
              </div>

              {/* Slot picker */}
              {newBk.date && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "var(--gray-400)", marginBottom: 8 }}>
                    Slot Availability — {toDisplayDate(newBk.date)}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {TIME_SLOTS.map(slot => {
                      const taken = bookings.some(
                        b => b.date === newBk.date && b.time === slot && b.status !== "cancelled"
                      );
                      const isSel = newBk.time === slot;
                      return (
                        <span key={slot}
                          onClick={() => !taken && setNewBk(p => ({ ...p, time: slot }))}
                          style={{
                            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                            fontFamily: "var(--mono)", cursor: taken ? "not-allowed" : "pointer",
                            background: taken ? "var(--red-light)" : isSel ? "var(--navy)" : "var(--green-light)",
                            color:      taken ? "var(--red)"       : isSel ? "white"       : "var(--green)",
                            border: `1.5px solid ${taken ? "#FECACA" : isSel ? "var(--navy)" : "#BBF7D0"}`,
                          }}
                        >
                          {slot}{taken ? " · Booked" : ""}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 8, fontStyle: "italic" }}>
                    ✅ Green = available &nbsp;·&nbsp; 🔴 Red = taken &nbsp;·&nbsp; Cancelled slots are available again
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={saveBk}
                disabled={saving || !newBk.vehicleId || !newBk.date}>
                {saving ? "Saving..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}