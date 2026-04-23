// src/components/LoginPage.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #E5E5E5",
  borderRadius: 8,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  color: "#1A1A1A",
  background: "white",
  boxSizing: "border-box",
};
const focusStyle = { borderColor: "#E84C1E" };

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "#636363",
          marginBottom: 5,
        }}
      >
        {label}
        {required && <span style={{ color: "#E84C1E" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...inputStyle, ...(focused ? focusStyle : {}) }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
    } catch (_) {}
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <Field
        label="Username"
        value={form.username}
        onChange={set("username")}
        placeholder="Enter your username"
        required
      />
      <Field
        label="Password"
        type="password"
        value={form.password}
        onChange={set("password")}
        placeholder="Enter your password"
        required
      />
      <button
        type="submit"
        disabled={loading || !form.username || !form.password}
        style={{
          width: "100%",
          padding: "11px",
          background: loading ? "#ccc" : "#E84C1E",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: 4,
        }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "#8C8C8C",
          marginTop: 20,
        }}
      >
        Don't have an account?{" "}
        <span
          onClick={onSwitch}
          style={{ color: "#E84C1E", fontWeight: 600, cursor: "pointer" }}
        >
          Create account
        </span>
      </p>
    </form>
  );
}

// ── Register Form (USER role only — customers registering vehicles & bookings) ─
function RegisterForm({ onSwitch }) {
  const { register, loading, error, setError } = useAuth();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
    phone: "",
  });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      // Role is always USER — ADMIN accounts are created by the system admin
      await register({ ...form, role: "USER" });
      setSuccess(true);
      setTimeout(() => onSwitch(), 2500);
    } catch (_) {}
  };

  if (success)
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#0F1B2D" }}>
          Account Created!
        </div>
        <div style={{ color: "#8C8C8C", fontSize: 13, marginTop: 8 }}>
          Redirecting to sign in...
        </div>
      </div>
    );

  return (
    <form onSubmit={handleSubmit}>
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

      {/* Account type info banner — no role dropdown, always USER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 18 }}>👤</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>
            Customer Account
          </div>
          <div style={{ fontSize: 11, color: "#3B82F6", marginTop: 1 }}>
            Register your vehicles and book service appointments
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 12px",
        }}
      >
        <Field
          label="Full Name"
          value={form.fullName}
          onChange={set("fullName")}
          placeholder="John Smith"
          required
        />
        <Field
          label="Phone"
          value={form.phone}
          onChange={set("phone")}
          placeholder="555-0100"
        />
      </div>

      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={set("email")}
        placeholder="you@email.com"
        required
      />

      <Field
        label="Username"
        value={form.username}
        onChange={set("username")}
        placeholder="johndoe"
        required
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 12px",
        }}
      >
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder="Min. 6 characters"
          required
        />
        <Field
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          placeholder="Repeat password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={
          loading ||
          !form.username ||
          !form.email ||
          !form.password ||
          !form.fullName
        }
        style={{
          width: "100%",
          padding: "11px",
          background: loading ? "#ccc" : "#E84C1E",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: 4,
        }}
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "#9CA3AF",
          marginTop: 14,
          lineHeight: 1.5,
        }}
      >
        🔒 Admin accounts are managed by the system administrator
      </p>

      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "#8C8C8C",
          marginTop: 10,
        }}
      >
        Already have an account?{" "}
        <span
          onClick={onSwitch}
          style={{ color: "#E84C1E", fontWeight: 600, cursor: "pointer" }}
        >
          Sign in
        </span>
      </p>
    </form>
  );
}

// ── Main LoginPage ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { setError } = useAuth();
  const [tab, setTab] = useState("login");

  const switchTab = (t) => {
    setError(null);
    setTab(t);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF8F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: "40px 36px",
          width: "100%",
          maxWidth: tab === "register" ? 480 : 420,
          boxShadow: "0 4px 32px rgba(0,0,0,.08)",
          transition: "max-width .2s",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 50,
              height: 50,
              background: "#0F1B2D",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              color: "white",
            }}
          >
            <Icon name="wrench" size={22} />
          </div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#0F1B2D",
              margin: 0,
            }}
          >
            AutoFix Pro
          </h1>
          <p style={{ color: "#8C8C8C", fontSize: 12, marginTop: 4 }}>
            Vehicle Service Management
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "#F5F4F1",
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
          }}
        >
          {[
            ["login", "Sign In"],
            ["register", "Create Account"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              style={{
                flex: 1,
                padding: "8px 0",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .15s",
                background: tab === key ? "white" : "transparent",
                color: tab === key ? "#0F1B2D" : "#8C8C8C",
                boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,.10)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "login" ? (
          <LoginForm onSwitch={() => switchTab("register")} />
        ) : (
          <RegisterForm onSwitch={() => switchTab("login")} />
        )}
      </div>
    </div>
  );
}
