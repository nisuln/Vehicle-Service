import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

// ─── Banner slides ────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3",
    heading: "Your Car Deserves",
    highlight: "Expert Care",
    sub: "Precision servicing by certified mechanics — every time.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&q=80&auto=format&fit=crop",
    heading: "Book a Service",
    highlight: "In Seconds",
    sub: "Choose your slot, pick your service, and leave the rest to us.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80&auto=format&fit=crop",
    heading: "Transparent Pricing,",
    highlight: "Zero Surprises",
    sub: "Detailed invoices and real-time job updates — always in the loop.",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1600&q=80&auto=format&fit=crop",
    heading: "Earn Rewards",
    highlight: "Every Visit",
    sub: "Complete 5 services, get your 6th absolutely free.",
  },
];

// ─── Services list ────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: "🔧",
    title: "Full Service",
    desc: "Engine tune-up, oil change, filter replacements, and a complete vehicle health check.",
    time: "2–3 hrs",
    color: "#FFF0EB",
    accent: "#E84C1E",
  },
  {
    icon: "🛞",
    title: "Tyre & Wheel",
    desc: "Rotation, balancing, alignment, and replacement with premium tyre brands.",
    time: "1 hr",
    color: "#EFF6FF",
    accent: "#2563EB",
  },
  {
    icon: "🔋",
    title: "Battery & Electrics",
    desc: "Diagnostics, battery testing & replacement, wiring repairs, and sensor calibration.",
    time: "1–2 hrs",
    color: "#ECFDF5",
    accent: "#18A05B",
  },
  {
    icon: "🛑",
    title: "Brake Service",
    desc: "Pad replacements, rotor resurfacing, brake fluid flush, and full brake system inspection.",
    time: "2 hrs",
    color: "#FEF9C3",
    accent: "#D97706",
  },
  {
    icon: "❄️",
    title: "AC & Climate",
    desc: "Re-gas, leak detection, compressor service, and cabin filter replacement.",
    time: "1–2 hrs",
    color: "#F0F9FF",
    accent: "#0284C7",
  },
  {
    icon: "🧰",
    title: "Diagnostics",
    desc: "OBD-II scanning, fault code analysis, and a detailed report on your vehicle's condition.",
    time: "45 min",
    color: "#FDF4FF",
    accent: "#9333EA",
  },
];

// ─── How it works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    title: "Create an Account",
    desc: "Sign up in seconds. No credit card required to get started.",
  },
  {
    num: "02",
    title: "Add Your Vehicle",
    desc: "Register your car with make, model, VIN and we handle the rest.",
  },
  {
    num: "03",
    title: "Book a Service",
    desc: "Pick a date, time, and service type that works for you.",
  },
  {
    num: "04",
    title: "Track & Pay",
    desc: "Follow your job in real-time and receive a clear digital invoice.",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { val: "5,000+", label: "Happy Customers" },
  { val: "12,000+", label: "Services Completed" },
  { val: "98%", label: "Satisfaction Rate" },
  { val: "15+", label: "Years Experience" },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Amara Silva",
    role: "Regular Customer",
    text: "The online booking is so smooth. I booked a full service on my lunch break and the car was ready by 5pm — incredible.",
    stars: 5,
    initials: "AS",
    color: "#0F1B2D",
  },
  {
    name: "Rajesh Perera",
    role: "Fleet Manager",
    text: "Managing 8 company vehicles was a nightmare before AutoFix Pro. Now I get live updates and consolidated invoices. Game-changer.",
    stars: 5,
    initials: "RP",
    color: "#E84C1E",
  },
  {
    name: "Nadia Fernando",
    role: "First-time Customer",
    text: "Loved how transparent everything was — I could see exactly what work was done and why. No hidden costs, no pressure.",
    stars: 5,
    initials: "NF",
    color: "#18A05B",
  },
];

// ─── useInView hook ────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
function AnimatedCounter({ val }) {
  const num = parseInt(val.replace(/\D/g, ""), 10);
  const suffix = val.replace(/[\d,]/g, "");
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView(0.3);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(num / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, num]);

  return (
    <span ref={ref}>
      {visible ? count.toLocaleString() : "0"}
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // ── Redirect admin away from home ─────────────────────────────────────────
  useEffect(() => {
    if (isAdmin) navigate("/dashboard", { replace: true });
  }, [isAdmin, navigate]);

  // ── Banner slideshow ──────────────────────────────────────────────────────
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setSlide((s) => (s + 1) % SLIDES.length);
        setAnimating(false);
      }, 500);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const goSlide = (i) => {
    if (i === slide) return;
    setAnimating(true);
    setTimeout(() => { setSlide(i); setAnimating(false); }, 400);
  };

  // ── Scroll helpers ────────────────────────────────────────────────────────
  const servicesRef = useRef(null);
  const howRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  const [statsRef, statsVisible] = useInView(0.2);
  const [servicesInViewRef, servicesVisible] = useInView(0.1);
  const [stepsRef, stepsVisible] = useInView(0.1);
  const [testiRef, testiVisible] = useInView(0.1);

  // ── Navbar scroll state ───────────────────────────────────────────────────
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const USER_NAV = [
    { id: "dashboard", label: "Dashboard" },
    { id: "myvehicles", label: "My Vehicles" },
    { id: "bookings", label: "My Bookings" },
  ];

  const current = SLIDES[slide];

  return (
    <>
      {/* ── Global styles injected inline ─────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #FFFFFF; color: #1A1A1A; overflow-x: hidden; }

        :root {
          --navy: #0F1B2D;
          --navy-mid: #1C3354;
          --accent: #E84C1E;
          --accent-light: #FFF0EB;
          --accent-mid: #F97B52;
          --green: #18A05B;
          --gray-50: #F5F4F1;
          --gray-100: #EBEBEB;
          --gray-200: #D6D6D6;
          --gray-400: #8C8C8C;
          --gray-600: #454545;
          --gray-800: #1A1A1A;
          --radius: 12px;
          --shadow: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06);
          --shadow-md: 0 4px 16px rgba(0,0,0,.10);
          --shadow-lg: 0 12px 40px rgba(0,0,0,.14);
        }

        /* ── Navbar ── */
        .home-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; height: 64px; padding: 0 32px;
          transition: background .3s, box-shadow .3s, backdrop-filter .3s;
        }
        .home-nav.scrolled {
          background: rgba(15,27,45,0.96);
          backdrop-filter: blur(12px);
          box-shadow: 0 2px 20px rgba(0,0,0,.22);
        }
        .home-nav.top { background: transparent; }
        .nav-brand {
          display: flex; align-items: center; gap: 10px;
          color: white; font-weight: 700; font-size: 16px;
          letter-spacing: -.3px; margin-right: 40px; white-space: nowrap;
          text-decoration: none;
        }
        .nav-brand-icon {
          width: 34px; height: 34px; background: var(--accent);
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center; color: white; flex-shrink: 0;
        }
        .nav-links { display: flex; gap: 4px; }
        .nav-link {
          padding: 6px 14px; border-radius: 7px; color: rgba(255,255,255,.7);
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all .15s; white-space: nowrap;
          border: none; background: none; font-family: 'DM Sans', sans-serif;
        }
        .nav-link:hover { color: white; background: rgba(255,255,255,.1); }
        .nav-right {
          margin-left: auto; display: flex; align-items: center; gap: 12px;
        }
        .nav-user-badge {
          font-size: 11px; font-weight: 700; padding: 3px 10px;
          border-radius: 20px; background: #EFF6FF; color: #3B82F6;
          border: 1px solid #BFDBFE;
        }
        .nav-username {
          font-size: 12px; color: rgba(255,255,255,.6);
        }
        .btn-nav-ghost {
          background: transparent; color: rgba(255,255,255,.8);
          border: 1px solid rgba(255,255,255,.25);
          padding: 6px 14px; border-radius: 7px; font-size: 12px;
          font-weight: 600; cursor: pointer; transition: all .15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-nav-ghost:hover {
          background: rgba(255,255,255,.1); color: white;
        }
        .btn-nav-primary {
          background: var(--accent); color: white;
          border: none; padding: 8px 18px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all .15s; font-family: 'DM Sans', sans-serif;
        }
        .btn-nav-primary:hover { background: #C93F18; transform: translateY(-1px); }

        /* ── Hero Banner ── */
        .hero {
          position: relative; width: 100%; height: 100vh;
          min-height: 600px; overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: opacity .5s ease, transform 8s ease;
          transform-origin: center;
        }
        .hero-bg.active { opacity: 1; transform: scale(1.04); }
        .hero-bg.hidden { opacity: 0; transform: scale(1); }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            120deg,
            rgba(15,27,45,.82) 0%,
            rgba(15,27,45,.55) 50%,
            rgba(15,27,45,.2) 100%
          );
        }
        .hero-content {
          position: relative; z-index: 2;
          height: 100%; display: flex; flex-direction: column;
          justify-content: center; padding: 0 80px;
          max-width: 860px;
          transition: opacity .4s ease, transform .4s ease;
        }
        .hero-content.fade-out { opacity: 0; transform: translateY(12px); }
        .hero-content.fade-in { opacity: 1; transform: translateY(0); }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(232,76,30,.18); border: 1px solid rgba(232,76,30,.4);
          color: #F97B52; padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 600; letter-spacing: .5px;
          text-transform: uppercase; margin-bottom: 24px; width: fit-content;
        }
        .hero-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 6vw, 76px);
          font-weight: 800; color: white; line-height: 1.1;
          letter-spacing: -1.5px; margin-bottom: 12px;
        }
        .hero-heading .hl {
          color: var(--accent-mid);
          display: block;
        }
        .hero-sub {
          font-size: clamp(15px, 1.8vw, 18px);
          color: rgba(255,255,255,.75); margin-bottom: 40px;
          max-width: 480px; line-height: 1.7;
        }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-hero-primary {
          background: var(--accent); color: white;
          border: none; padding: 14px 32px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 700; cursor: pointer;
          transition: all .2s; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(232,76,30,.4);
        }
        .btn-hero-primary:hover {
          background: #C93F18; transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(232,76,30,.5);
        }
        .btn-hero-outline {
          background: transparent; color: white;
          border: 1.5px solid rgba(255,255,255,.4);
          padding: 14px 32px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 600; cursor: pointer;
          transition: all .2s;
        }
        .btn-hero-outline:hover {
          background: rgba(255,255,255,.1);
          border-color: rgba(255,255,255,.7);
          transform: translateY(-2px);
        }

        /* slide dots */
        .hero-dots {
          position: absolute; bottom: 32px; left: 80px; z-index: 3;
          display: flex; gap: 8px;
        }
        .hero-dot {
          width: 8px; height: 8px; border-radius: 4px;
          background: rgba(255,255,255,.35);
          border: none; cursor: pointer; transition: all .3s; padding: 0;
        }
        .hero-dot.active {
          width: 28px; background: var(--accent);
        }

        /* scroll cue */
        .scroll-cue {
          position: absolute; bottom: 36px; right: 60px; z-index: 3;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .scroll-cue span {
          font-size: 11px; color: rgba(255,255,255,.5);
          letter-spacing: 1px; text-transform: uppercase; font-weight: 600;
        }
        .scroll-arrow {
          width: 24px; height: 24px; border-right: 2px solid rgba(255,255,255,.4);
          border-bottom: 2px solid rgba(255,255,255,.4);
          transform: rotate(45deg);
          animation: bounce-down 1.8s ease-in-out infinite;
        }
        @keyframes bounce-down {
          0%, 100% { transform: rotate(45deg) translateY(0); opacity: .5; }
          50% { transform: rotate(45deg) translateY(5px); opacity: 1; }
        }

        /* ── Stats bar ── */
        .stats-bar {
          background: var(--navy); padding: 40px 80px;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
        }
        .stat-item {
          text-align: center; padding: 20px 24px;
          border-right: 1px solid rgba(255,255,255,.08);
          opacity: 0; transform: translateY(20px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .stat-item.visible { opacity: 1; transform: translateY(0); }
        .stat-item:nth-child(1) { transition-delay: 0s; }
        .stat-item:nth-child(2) { transition-delay: .12s; }
        .stat-item:nth-child(3) { transition-delay: .24s; }
        .stat-item:nth-child(4) { transition-delay: .36s; border-right: none; }
        .stat-val {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 800; color: white;
          letter-spacing: -1px; line-height: 1;
        }
        .stat-lbl {
          font-size: 13px; color: rgba(255,255,255,.5);
          margin-top: 6px; font-weight: 500;
        }

        /* ── Section commons ── */
        .section { padding: 100px 80px; }
        .section-alt { background: #F8F7F4; }
        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 12px;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 44px); font-weight: 800;
          color: var(--navy); line-height: 1.2; letter-spacing: -1px;
          margin-bottom: 16px;
        }
        .section-sub {
          font-size: 16px; color: var(--gray-400); max-width: 520px;
          line-height: 1.7;
        }
        .section-header { margin-bottom: 60px; }
        .section-header.centered { text-align: center; }
        .section-header.centered .section-sub { margin: 0 auto; }

        /* ── Services grid ── */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .service-card {
          background: white; border-radius: 16px;
          padding: 32px 28px; border: 1px solid var(--gray-100);
          box-shadow: var(--shadow);
          transition: all .3s ease;
          opacity: 0; transform: translateY(30px);
          cursor: default;
        }
        .service-card.visible {
          opacity: 1; transform: translateY(0);
        }
        .service-card:nth-child(1) { transition-delay: 0s; }
        .service-card:nth-child(2) { transition-delay: .08s; }
        .service-card:nth-child(3) { transition-delay: .16s; }
        .service-card:nth-child(4) { transition-delay: .24s; }
        .service-card:nth-child(5) { transition-delay: .32s; }
        .service-card:nth-child(6) { transition-delay: .40s; }
        .service-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: transparent;
        }
        .service-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 20px; flex-shrink: 0;
        }
        .service-title {
          font-size: 17px; font-weight: 700; color: var(--navy);
          margin-bottom: 10px; letter-spacing: -.3px;
        }
        .service-desc {
          font-size: 13px; color: var(--gray-400); line-height: 1.7;
          margin-bottom: 20px;
        }
        .service-time {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; padding: 4px 12px;
          border-radius: 20px;
        }

        /* ── How it works ── */
        .steps-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;
        }
        .step-card {
          position: relative; text-align: center;
          opacity: 0; transform: translateY(24px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .step-card.visible { opacity: 1; transform: translateY(0); }
        .step-card:nth-child(1) { transition-delay: 0s; }
        .step-card:nth-child(2) { transition-delay: .12s; }
        .step-card:nth-child(3) { transition-delay: .24s; }
        .step-card:nth-child(4) { transition-delay: .36s; }
        .step-connector {
          position: absolute; top: 26px; left: calc(50% + 32px);
          right: calc(-50% + 32px); height: 2px;
          background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
          opacity: .25;
        }
        .step-card:last-child .step-connector { display: none; }
        .step-num-wrap {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--navy); color: white;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
          margin: 0 auto 20px; position: relative; z-index: 1;
          box-shadow: 0 0 0 8px rgba(15,27,45,.08);
        }
        .step-title {
          font-size: 16px; font-weight: 700; color: var(--navy);
          margin-bottom: 10px; letter-spacing: -.2px;
        }
        .step-desc { font-size: 13px; color: var(--gray-400); line-height: 1.7; }

        /* ── Loyalty section ── */
        .loyalty-section {
          background: var(--navy);
          padding: 80px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
          align-items: center;
        }
        .loyalty-left .section-title { color: white; }
        .loyalty-left .section-sub { color: rgba(255,255,255,.55); }
        .loyalty-left .section-label { color: #F97B52; }
        .loyalty-circles {
          display: flex; gap: 12px; flex-wrap: wrap;
        }
        .loyalty-circle {
          width: 48px; height: 48px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; transition: all .3s;
        }
        .loyalty-circle.filled {
          background: var(--accent); box-shadow: 0 0 0 4px rgba(232,76,30,.2);
        }
        .loyalty-circle.empty {
          background: rgba(255,255,255,.08);
          border: 2px dashed rgba(255,255,255,.2);
        }
        .loyalty-free {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #F97B52, #E84C1E);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; box-shadow: 0 0 20px rgba(232,76,30,.4);
        }
        .loyalty-info {
          margin-top: 32px; padding: 24px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
        }
        .loyalty-info p {
          font-size: 14px; color: rgba(255,255,255,.7); line-height: 1.7;
        }
        .loyalty-info strong { color: white; }

        /* ── Testimonials ── */
        .testi-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .testi-card {
          background: white; border-radius: 16px;
          padding: 32px; border: 1px solid var(--gray-100);
          box-shadow: var(--shadow);
          opacity: 0; transform: translateY(24px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .testi-card.visible { opacity: 1; transform: translateY(0); }
        .testi-card:nth-child(1) { transition-delay: 0s; }
        .testi-card:nth-child(2) { transition-delay: .1s; }
        .testi-card:nth-child(3) { transition-delay: .2s; }
        .testi-stars {
          color: #F59E0B; font-size: 14px;
          margin-bottom: 16px; letter-spacing: 2px;
        }
        .testi-text {
          font-size: 14px; color: var(--gray-600);
          line-height: 1.8; margin-bottom: 24px;
          font-style: italic;
        }
        .testi-footer { display: flex; align-items: center; gap: 12px; }
        .testi-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: white; flex-shrink: 0;
        }
        .testi-name {
          font-size: 14px; font-weight: 700; color: var(--navy);
        }
        .testi-role { font-size: 12px; color: var(--gray-400); }

        /* ── CTA section ── */
        .cta-section {
          background: linear-gradient(135deg, #0F1B2D 0%, #1C3354 100%);
          padding: 100px 80px; text-align: center; position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle at 20% 50%, rgba(232,76,30,.12) 0%, transparent 50%),
                            radial-gradient(circle at 80% 50%, rgba(37,99,235,.08) 0%, transparent 50%);
        }
        .cta-content { position: relative; z-index: 1; }
        .cta-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 5vw, 52px); font-weight: 800;
          color: white; letter-spacing: -1px; line-height: 1.15;
          margin-bottom: 20px;
        }
        .cta-sub {
          font-size: 17px; color: rgba(255,255,255,.6);
          margin-bottom: 44px; line-height: 1.7; max-width: 480px; margin-inline: auto;
        }
        .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-cta-primary {
          background: var(--accent); color: white; border: none;
          padding: 16px 40px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: all .2s;
          box-shadow: 0 6px 24px rgba(232,76,30,.4);
        }
        .btn-cta-primary:hover {
          background: #C93F18; transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(232,76,30,.5);
        }
        .btn-cta-outline {
          background: transparent; color: white;
          border: 1.5px solid rgba(255,255,255,.3);
          padding: 16px 40px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .btn-cta-outline:hover {
          border-color: rgba(255,255,255,.7);
          background: rgba(255,255,255,.08);
          transform: translateY(-2px);
        }

        /* ── Footer ── */
        .footer {
          background: #080F1A; padding: 60px 80px 32px;
        }
        .footer-top {
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 60px;
          padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,.07);
          margin-bottom: 32px;
        }
        .footer-brand {
          display: flex; align-items: center; gap: 10px;
          color: white; font-weight: 700; font-size: 17px;
          margin-bottom: 16px; letter-spacing: -.3px;
        }
        .footer-brand-icon {
          width: 34px; height: 34px; background: var(--accent);
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center;
        }
        .footer-tagline {
          font-size: 13px; color: rgba(255,255,255,.4); line-height: 1.7;
          max-width: 260px;
        }
        .footer-col-title {
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: rgba(255,255,255,.3);
          margin-bottom: 16px;
        }
        .footer-link {
          display: block; font-size: 13px; color: rgba(255,255,255,.5);
          margin-bottom: 10px; cursor: pointer; transition: color .15s;
          background: none; border: none; text-align: left;
          font-family: 'DM Sans', sans-serif; padding: 0;
        }
        .footer-link:hover { color: white; }
        .footer-bottom {
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-copy {
          font-size: 12px; color: rgba(255,255,255,.25);
        }
        .footer-accent {
          font-size: 12px; color: rgba(255,255,255,.25);
        }
        .footer-accent span { color: var(--accent); }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .section, .loyalty-section, .cta-section, .footer { padding-inline: 48px; }
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .steps-grid { grid-template-columns: repeat(2, 1fr); gap: 40px; }
          .step-connector { display: none; }
          .loyalty-section { grid-template-columns: 1fr; gap: 48px; }
          .stats-bar { padding-inline: 48px; }
          .hero-content { padding: 0 48px; }
          .hero-dots { left: 48px; }
        }
        @media (max-width: 768px) {
          .section, .loyalty-section, .cta-section, .footer, .stats-bar { padding-inline: 24px; }
          .services-grid { grid-template-columns: 1fr; }
          .testi-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .hero-content { padding: 0 24px; }
          .hero-dots { left: 24px; }
          .footer-top { grid-template-columns: 1fr; gap: 40px; }
          .nav-links { display: none; }
        }
      `}</style>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className={`home-nav ${scrolled ? "scrolled" : "top"}`}>
        <button
          className="nav-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <div className="nav-brand-icon">
            <Icon name="wrench" size={16} />
          </div>
          AutoFix Pro
        </button>

        {/* Quick nav anchors */}
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollTo(servicesRef)}>Services</button>
          <button className="nav-link" onClick={() => scrollTo(howRef)}>How It Works</button>
          <button className="nav-link" onClick={() => scrollTo(testimonialsRef)}>Reviews</button>
        </div>

        <div className="nav-right">
          <span className="nav-user-badge">USER</span>
          <span className="nav-username">{user?.fullName || user?.username}</span>

          {/* Shortcut buttons for logged-in user */}
          {USER_NAV.map((t) => (
            <button
              key={t.id}
              className="nav-link"
              onClick={() => navigate(`/${t.id}`)}
            >
              {t.label}
            </button>
          ))}

          <button className="btn-nav-ghost" onClick={logout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <section className="hero">
        {/* Background images */}
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`hero-bg ${i === slide ? "active" : "hidden"}`}
            style={{ backgroundImage: `url(${s.image})` }}
          />
        ))}
        <div className="hero-overlay" />

        {/* Content */}
        <div className={`hero-content ${animating ? "fade-out" : "fade-in"}`}>
          <div className="hero-tag">
            <span>⚡</span>
            <span>Premium Auto Service</span>
          </div>
          <h1 className="hero-heading">
            {current.heading}
            <span className="hl">{current.highlight}</span>
          </h1>
          <p className="hero-sub">{current.sub}</p>
          <div className="hero-actions">
            <button
              className="btn-hero-primary"
              onClick={() => scrollTo(servicesRef)}
            >
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button
              className="btn-hero-outline"
              onClick={() => navigate("/bookings")}
            >
              Book a Service
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === slide ? "active" : ""}`}
              onClick={() => goSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Scroll cue */}
        <div className="scroll-cue" onClick={() => scrollTo(servicesRef)} style={{ cursor: "pointer" }}>
          <span>Scroll</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────────────────── */}
      <div className="stats-bar" ref={statsRef}>
        {STATS.map((s, i) => (
          <div key={i} className={`stat-item ${statsVisible ? "visible" : ""}`}>
            <div className="stat-val">
              {statsVisible ? <AnimatedCounter val={s.val} /> : "0"}
            </div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Services Section ─────────────────────────────────────────────────── */}
      <section className="section" id="services" ref={servicesRef}>
        <div className="section-header">
          <div className="section-label">What We Offer</div>
          <h2 className="section-title">Everything Your Car Needs</h2>
          <p className="section-sub">
            From routine maintenance to complex repairs — our certified mechanics handle it all with care and precision.
          </p>
        </div>
        <div className="services-grid" ref={servicesInViewRef}>
          {SERVICES.map((s, i) => (
            <div key={i} className={`service-card ${servicesVisible ? "visible" : ""}`}>
              <div className="service-icon" style={{ background: s.color }}>
                {s.icon}
              </div>
              <div className="service-title">{s.title}</div>
              <div className="service-desc">{s.desc}</div>
              <div
                className="service-time"
                style={{ background: s.color, color: s.accent }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {s.time}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <button
            className="btn-cta-primary"
            onClick={() => navigate("/bookings")}
            style={{ fontSize: 14, padding: "12px 32px" }}
          >
            Book a Service Now
          </button>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="section section-alt" id="how" ref={howRef}>
        <div className="section-header centered">
          <div className="section-label">Simple Process</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">
            Getting your car serviced has never been easier. Four simple steps is all it takes.
          </p>
        </div>
        <div className="steps-grid" ref={stepsRef}>
          {STEPS.map((s, i) => (
            <div key={i} className={`step-card ${stepsVisible ? "visible" : ""}`}>
              <div className="step-connector" />
              <div className="step-num-wrap">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Loyalty Section ──────────────────────────────────────────────────── */}
      <section className="loyalty-section">
        <div className="loyalty-left">
          <div className="section-label">Rewards Program</div>
          <h2 className="section-title">Service More,<br />Pay Less</h2>
          <p className="section-sub" style={{ marginBottom: 36 }}>
            Join our loyalty program and earn a free service for every 5 visits. Automatically tracked — no vouchers needed.
          </p>
          <button
            className="btn-hero-primary"
            onClick={() => navigate("/bookings")}
          >
            Start Earning Rewards
          </button>
        </div>
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 16, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
              Your Progress Tracker
            </div>
            <div className="loyalty-circles">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`loyalty-circle ${n <= 3 ? "filled" : "empty"}`}
                >
                  {n <= 3 ? "✓" : ""}
                </div>
              ))}
              <div className="loyalty-free">🎁</div>
            </div>
          </div>
          <div className="loyalty-info">
            <p>
              You've completed <strong>3 services</strong> in this cycle.
              Just <strong>2 more</strong> to unlock your <strong>free service reward</strong> — our way of saying thank you.
            </p>
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
            {[
              { label: "Services Done", val: "3" },
              { label: "Until Free", val: "2" },
              { label: "Total Earned", val: "1" },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  flex: 1, textAlign: "center",
                  background: "rgba(255,255,255,.06)",
                  borderRadius: 10, padding: "16px 12px",
                  border: "1px solid rgba(255,255,255,.08)"
                }}
              >
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: "white" }}>{m.val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="section" id="reviews" ref={testimonialsRef}>
        <div className="section-header centered">
          <div className="section-label">Customer Stories</div>
          <h2 className="section-title">Trusted By Thousands</h2>
          <p className="section-sub">
            Real experiences from real customers who trust AutoFix Pro to keep their vehicles running perfectly.
          </p>
        </div>
        <div className="testi-grid" ref={testiRef}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`testi-card ${testiVisible ? "visible" : ""}`}>
              <div className="testi-stars">{"★".repeat(t.stars)}</div>
              <p className="testi-text">"{t.text}"</p>
              <div className="testi-footer">
                <div className="testi-avatar" style={{ background: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────────────── */}
      <section className="cta-section" ref={ctaRef}>
        <div className="cta-content">
          <div className="section-label" style={{ color: "#F97B52", marginBottom: 16 }}>Ready to Start?</div>
          <h2 className="cta-title">
            Your Car is Waiting<br />for Expert Attention
          </h2>
          <p className="cta-sub">
            Book a service in under 2 minutes. Our team of certified mechanics is ready to help.
          </p>
          <div className="cta-actions">
            <button className="btn-cta-primary" onClick={() => navigate("/bookings")}>
              Book a Service
            </button>
            <button className="btn-cta-outline" onClick={() => navigate("/dashboard")}>
              View My Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <Icon name="wrench" size={16} color="white" />
              </div>
              AutoFix Pro
            </div>
            <p className="footer-tagline">
              Premium auto service you can trust. Certified mechanics, transparent pricing, and real-time updates for every job.
            </p>
          </div>
          <div>
            <div className="footer-col-title">My Account</div>
            {USER_NAV.map((t) => (
              <button key={t.id} className="footer-link" onClick={() => navigate(`/${t.id}`)}>
                {t.label}
              </button>
            ))}
          </div>
          <div>
            <div className="footer-col-title">Services</div>
            {SERVICES.map((s) => (
              <button key={s.title} className="footer-link" onClick={() => navigate("/bookings")}>
                {s.title}
              </button>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© {new Date().getFullYear()} AutoFix Pro. All rights reserved.</div>

        </div>
      </footer>
    </>
  );
}