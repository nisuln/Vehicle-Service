// src/components/UserDashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { bookingAPI, serviceOrderAPI, loyaltyAPI } from "../services/api";
import { fmt } from "../utils/helpers";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function toDisplayDate(ds) {
  if (!ds) return "—";
  const [y, m, d] = ds.split("-");
  return `${d} ${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

function StatusDot({ status }) {
  const map = {
    PENDING: { color: "var(--amber)", label: "Pending" },
    IN_PROGRESS: { color: "var(--blue)", label: "In Progress" },
    COMPLETED: { color: "var(--green)", label: "Completed" },
    CANCELLED: { color: "var(--red)", label: "Cancelled" },
    confirmed: { color: "var(--green)", label: "Confirmed" },
    pending: { color: "var(--amber)", label: "Pending" },
    cancelled: { color: "var(--red)", label: "Cancelled" },
  };
  const s = map[status] || { color: "var(--gray-300)", label: status };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: s.color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>
        {s.label}
      </span>
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color = "var(--navy)",
  bg = "var(--gray-50)",
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        padding: "20px 22px",
        boxShadow: "0 1px 3px rgba(0,0,0,.07)",
        border: "1px solid var(--gray-100)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          marginBottom: 8,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color,
          letterSpacing: -1,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--gray-500)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Section Card wrapper ──────────────────────────────────────────────────────
function Section({
  title,
  action,
  children,
  empty,
  emptyText = "Nothing here yet",
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,.07)",
        border: "1px solid var(--gray-100)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--gray-100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-800)" }}
        >
          {title}
        </span>
        {action}
      </div>
      {empty ? (
        <div style={{ padding: "36px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>📭</div>
          <div
            style={{ fontSize: 13, color: "var(--gray-400)", fontWeight: 500 }}
          >
            {emptyText}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ── Main UserDashboard ────────────────────────────────────────────────────────
export default function UserDashboard({ vehicles, bookings, jobs }) {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loadingBk, setLoadingBk] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loyalty, setLoyalty] = useState(null);

  const today = todayStr();
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  // Load user's own bookings from backend
  useEffect(() => {
    bookingAPI
      .getAll()
      .then((r) => setMyBookings(r.data || []))
      .catch(() => setMyBookings(bookings || [])) // fallback to prop
      .finally(() => setLoadingBk(false));
  }, []);

  // Load user's service orders from backend
  useEffect(() => {
    serviceOrderAPI
      .getAll()
      .then((r) => setMyJobs(r.data || []))
      .catch(() => setMyJobs(jobs || [])) // fallback to prop
      .finally(() => setLoadingJobs(false));
  }, []);

  // Load loyalty status
  useEffect(() => {
    loyaltyAPI
      .getStatus()
      .then((r) => setLoyalty(r.data))
      .catch(() => {});
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const upcoming = [...myBookings]
    .filter((b) => {
      const ds = b.bookingDate || b.date;
      return (
        ds >= today && !["CANCELLED", "cancelled"].includes(b.status || "")
      );
    })
    .sort((a, b) =>
      (a.bookingDate || a.date || "").localeCompare(
        b.bookingDate || b.date || "",
      ),
    )
    .slice(0, 5);

  const activeJobs = myJobs.filter(
    (j) =>
      !["COMPLETED", "DELIVERED", "CANCELLED"].includes(
        (j.status || "").toUpperCase(),
      ),
  );

  const completedJobs = myJobs.filter((j) =>
    ["COMPLETED", "DELIVERED"].includes((j.status || "").toUpperCase()),
  );

  const recentJobs = [...myJobs]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 5);

  return (
    <div className="page">
      {/* ── Welcome header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--navy) 0%, #1C3354 100%)",
          borderRadius: 14,
          padding: "28px 32px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 20px rgba(15,27,45,.18)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.55)",
              fontWeight: 500,
              marginBottom: 6,
            }}
          >
            {greeting()},
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "white",
              letterSpacing: -0.5,
            }}
          >
            {user?.fullName || user?.username} 👋
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.5)",
              marginTop: 6,
            }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,.08)",
            borderRadius: 12,
            padding: "16px 24px",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>
            {upcoming.length}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.55)",
              marginTop: 2,
              fontWeight: 600,
            }}
          >
            Upcoming
            <br />
            Booking{upcoming.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* ── Loyalty Banner ── */}
      {loyalty && (
        <div
          style={{
            marginBottom: 20,
            borderRadius: 14,
            overflow: "hidden",
            border: loyalty.freeServiceReady
              ? "2px solid #D97706"
              : "1px solid var(--gray-100)",
            boxShadow: loyalty.freeServiceReady
              ? "0 0 0 4px #FEF3C7"
              : "0 1px 3px rgba(0,0,0,.07)",
            background: loyalty.freeServiceReady
              ? "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
              : "white",
          }}
        >
          <div style={{ padding: "16px 22px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: loyalty.freeServiceReady
                      ? "#D97706"
                      : "var(--navy)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {loyalty.freeServiceReady ? "🎁" : "⭐"}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: loyalty.freeServiceReady
                        ? "#92400E"
                        : "var(--gray-800)",
                      marginBottom: 2,
                    }}
                  >
                    {loyalty.freeServiceReady
                      ? "Free Service Ready to Claim!"
                      : "Loyalty Reward Progress"}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: loyalty.freeServiceReady
                        ? "#B45309"
                        : "var(--gray-500)",
                    }}
                  >
                    {loyalty.message}
                  </div>
                </div>
              </div>

              {/* Progress dots */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((i) => {
                  const filled = loyalty.freeServiceReady
                    ? true // all filled when reward ready
                    : i <= loyalty.cycleProgress;
                  return (
                    <div
                      key={i}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        background: filled
                          ? loyalty.freeServiceReady
                            ? "#D97706"
                            : "var(--navy)"
                          : "var(--gray-100)",
                        color: filled ? "white" : "var(--gray-400)",
                        border: filled ? "none" : "1.5px solid var(--gray-200)",
                        transition: "all .2s",
                      }}
                    >
                      {filled ? "✓" : i}
                    </div>
                  );
                })}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    background: loyalty.freeServiceReady
                      ? "#FEF3C7"
                      : "var(--gray-50)",
                    border: loyalty.freeServiceReady
                      ? "2px dashed #D97706"
                      : "2px dashed var(--gray-300)",
                  }}
                >
                  🎁
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {!loyalty.freeServiceReady && (
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "var(--gray-400)",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  <span>Service {loyalty.cycleProgress} of 5</span>
                  <span>{loyalty.servicesUntilFree} more to free service</span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 99,
                    background: "var(--gray-100)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      width: `${(loyalty.cycleProgress / 5) * 100}%`,
                      background:
                        "linear-gradient(90deg, var(--navy) 0%, var(--accent) 100%)",
                      transition: "width .5s ease",
                    }}
                  />
                </div>
              </div>
            )}

            {loyalty.totalFreeServicesEarned > 0 && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "var(--gray-400)",
                  fontStyle: "italic",
                }}
              >
                🏆 You've earned {loyalty.totalFreeServicesEarned} free service
                {loyalty.totalFreeServicesEarned !== 1 ? "s" : ""} so far —
                thank you for your loyalty!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Stats row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon="🚗"
          label="My Vehicles"
          value={vehicles.length}
          sub={
            vehicles.length === 0
              ? "Register your first vehicle"
              : `${vehicles.length} registered`
          }
          color="var(--navy)"
          bg="#EFF6FF"
        />
        <StatCard
          icon="📅"
          label="Total Bookings"
          value={myBookings.length}
          sub={`${upcoming.length} upcoming`}
          color="var(--blue)"
          bg="#EFF6FF"
        />
        <StatCard
          icon="🔧"
          label="Active Jobs"
          value={loadingJobs ? "—" : activeJobs.length}
          sub={loadingJobs ? "Loading..." : `${completedJobs.length} completed`}
          color="var(--amber)"
          bg="var(--amber-light)"
        />
        <StatCard
          icon="✅"
          label="Completed"
          value={loadingJobs ? "—" : completedJobs.length}
          sub="Service orders"
          color="var(--green)"
          bg="var(--green-light)"
        />
      </div>

      {/* ── Main grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Upcoming Bookings */}
        <Section
          title="📅 Upcoming Bookings"
          empty={!loadingBk && upcoming.length === 0}
          emptyText="No upcoming bookings — head to My Bookings to schedule one"
        >
          {loadingBk ? (
            <div
              style={{
                padding: "24px 20px",
                textAlign: "center",
                color: "var(--gray-400)",
                fontSize: 13,
              }}
            >
              Loading...
            </div>
          ) : (
            upcoming.map((b, i) => {
              const date = b.bookingDate || b.date;
              const time = b.bookingTime || b.time;
              const service = b.serviceType || b.service;
              const vehicle = b.vehicleInfo || b.vehicle;
              return (
                <div
                  key={b.id || i}
                  style={{
                    padding: "14px 20px",
                    borderBottom:
                      i < upcoming.length - 1
                        ? "1px solid var(--gray-100)"
                        : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Date block */}
                    <div
                      style={{
                        background: "var(--navy)",
                        color: "white",
                        borderRadius: 8,
                        padding: "6px 10px",
                        textAlign: "center",
                        minWidth: 46,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}
                      >
                        {date ? date.split("-")[2] : "—"}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          opacity: 0.7,
                          marginTop: 2,
                          fontWeight: 600,
                        }}
                      >
                        {date
                          ? MONTH_NAMES[parseInt(date.split("-")[1]) - 1]
                          : ""}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: "var(--gray-800)",
                        }}
                      >
                        {service || "Service"}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--gray-400)",
                          marginTop: 2,
                        }}
                      >
                        {vehicle || "Vehicle"}
                      </div>
                      {time && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--accent)",
                            fontWeight: 600,
                            marginTop: 3,
                            fontFamily: "var(--mono)",
                          }}
                        >
                          ⏰{" "}
                          {typeof time === "string" ? time.slice(0, 5) : time}
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusDot status={b.status} />
                </div>
              );
            })
          )}
        </Section>

        {/* My Vehicles */}
        <Section
          title="🚗 My Vehicles"
          empty={vehicles.length === 0}
          emptyText="No vehicles registered — go to My Vehicles to add one"
        >
          {vehicles.slice(0, 5).map((v, i) => (
            <div
              key={v.id || i}
              style={{
                padding: "14px 20px",
                borderBottom:
                  i < Math.min(vehicles.length, 5) - 1
                    ? "1px solid var(--gray-100)"
                    : "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "var(--gray-50)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    border: "1px solid var(--gray-100)",
                    flexShrink: 0,
                  }}
                >
                  🚗
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "var(--gray-800)",
                    }}
                  >
                    {v.year} {v.make} {v.model}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--gray-400)",
                      marginTop: 2,
                    }}
                  >
                    {v.licensePlate || v.plate || "No plate"}
                    {v.color ? ` · ${v.color}` : ""}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {v.mileage && (
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--gray-600)",
                    }}
                  >
                    {Number(v.mileage).toLocaleString()} km
                  </div>
                )}
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--gray-400)",
                    marginTop: 2,
                  }}
                >
                  {v.fuelType || ""}
                  {v.transmissionType ? ` · ${v.transmissionType}` : ""}
                </div>
              </div>
            </div>
          ))}
          {vehicles.length > 5 && (
            <div
              style={{
                padding: "10px 20px",
                fontSize: 12,
                color: "var(--gray-400)",
                borderTop: "1px solid var(--gray-100)",
                textAlign: "center",
              }}
            >
              +{vehicles.length - 5} more vehicles
            </div>
          )}
        </Section>
      </div>

      {/* ── Service History ── */}
      <Section
        title="🔧 Recent Service History"
        empty={!loadingJobs && recentJobs.length === 0}
        emptyText="No service history yet"
      >
        {loadingJobs ? (
          <div
            style={{
              padding: "24px 20px",
              textAlign: "center",
              color: "var(--gray-400)",
              fontSize: 13,
            }}
          >
            Loading...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Order #",
                    "Vehicle",
                    "Service",
                    "Date In",
                    "Status",
                    "Est. Cost",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        color: "var(--gray-400)",
                        background: "var(--gray-50)",
                        borderBottom: "1px solid var(--gray-100)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((j, i) => (
                  <tr
                    key={j.id || i}
                    style={{ borderBottom: "1px solid var(--gray-100)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--gray-50)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 12,
                          color: "var(--gray-500)",
                        }}
                      >
                        {j.orderNumber || `#${j.id}`}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "var(--gray-700)",
                      }}
                    >
                      {j.vehicleInfo || j.vehicle || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "var(--gray-700)",
                      }}
                    >
                      {j.serviceType || j.customerComplaint || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 12,
                          color: "var(--gray-500)",
                        }}
                      >
                        {toDisplayDate(j.dateIn || j.date)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusDot status={j.status} />
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--gray-700)",
                      }}
                    >
                      {j.totalCost ? `$${fmt(j.totalCost)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── Quick actions banner ── */}
      <div
        style={{
          marginTop: 20,
          background: "var(--accent-light)",
          borderRadius: 12,
          padding: "18px 24px",
          border: "1px solid #FBBCAB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)" }}
          >
            Need a service?
          </div>
          <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>
            Register your vehicle and book a service appointment in minutes.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div
            style={{
              padding: "8px 18px",
              background: "white",
              border: "1.5px solid var(--accent)",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent)",
              cursor: "default",
            }}
          >
            🚗 My Vehicles tab
          </div>
          <div
            style={{
              padding: "8px 18px",
              background: "var(--accent)",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              cursor: "default",
            }}
          >
            📅 My Bookings tab
          </div>
        </div>
      </div>
    </div>
  );
}
