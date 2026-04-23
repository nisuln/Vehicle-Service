import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SpeechRecognitionCtor =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const QUICK_ACTIONS = [
  { label: "Go to Dashboard", route: "/dashboard" },
  { label: "Book a Service", route: "/bookings" },
  { label: "My Vehicles", route: "/myvehicles" },
];

function replyFor(prompt) {
  const text = (prompt || "").toLowerCase().trim();

  if (!text) return "Please ask me something.";
  if (text.includes("hello") || text.includes("hi")) {
    return "Hello! I can help you with booking, vehicles, invoices and job status.";
  }
  if (text.includes("book")) {
    return "I can open the bookings page now. Use Book a Service to continue.";
  }
  if (text.includes("invoice") || text.includes("payment")) {
    return "Invoices are available in the invoices module after service completion.";
  }
  if (text.includes("vehicle") || text.includes("car")) {
    return "You can manage vehicle details inside the my vehicles section.";
  }
  if (text.includes("job") || text.includes("status")) {
    return "Track service progress in dashboard and job cards based on your role.";
  }
  return "I am ready to help. Try asking about bookings, invoices, vehicles, or job status.";
}

export default function VoiceChatAssistant() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I am your AutoFix voice assistant." },
  ]);

  const micSupported = useMemo(() => Boolean(SpeechRecognitionCtor), []);
  const ttsSupported = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    [],
  );

  const speak = (text) => {
    if (!ttsSupported || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = (rawPrompt) => {
    const prompt = (rawPrompt || "").trim();
    if (!prompt) return;

    const reply = replyFor(prompt);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: prompt },
      { role: "assistant", text: reply },
    ]);
    setInput("");
    speak(reply);
  };

  useEffect(() => {
    if (!micSupported) return undefined;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [micSupported]);

  const toggleMic = () => {
    if (!micSupported || !recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      return;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <>
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <strong>Voice Assistant</strong>
            <button style={styles.iconButton} onClick={() => setOpen(false)}>
              x
            </button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                style={{
                  ...styles.message,
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user" ? "#16365a" : "#f3f4f6",
                  color: msg.role === "user" ? "#ffffff" : "#111827",
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div style={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                style={styles.quickButton}
                onClick={() => navigate(action.route)}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage(input);
              }}
            />
            <button style={styles.sendButton} onClick={() => sendMessage(input)}>
              Send
            </button>
          </div>

          <div style={styles.footer}>
            <button
              style={{
                ...styles.micButton,
                background: listening ? "#dc2626" : "#0f766e",
                opacity: micSupported ? 1 : 0.6,
              }}
              onClick={toggleMic}
              disabled={!micSupported}
            >
              {micSupported
                ? listening
                  ? "Stop Listening"
                  : "Start Voice Input"
                : "Voice Input Not Supported"}
            </button>
          </div>
        </div>
      )}

      <button style={styles.floatingButton} onClick={() => setOpen((v) => !v)}>
        Chat + Voice
      </button>
    </>
  );
}

const styles = {
  floatingButton: {
    position: "fixed",
    right: 20,
    bottom: 20,
    zIndex: 9999,
    border: "none",
    borderRadius: 999,
    padding: "12px 18px",
    background: "#0f1b2d",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  panel: {
    position: "fixed",
    right: 20,
    bottom: 72,
    width: 340,
    maxHeight: 520,
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    boxShadow: "0 12px 24px rgba(0,0,0,.2)",
    overflow: "hidden",
    zIndex: 9999,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  iconButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxHeight: 260,
    overflowY: "auto",
    padding: 12,
  },
  message: {
    maxWidth: "85%",
    padding: "8px 10px",
    borderRadius: 10,
    fontSize: 13,
    lineHeight: 1.4,
  },
  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    padding: "0 12px 8px 12px",
  },
  quickButton: {
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    cursor: "pointer",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid #e5e7eb",
  },
  input: {
    flex: 1,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
  },
  sendButton: {
    border: "none",
    borderRadius: 8,
    background: "#0f1b2d",
    color: "#ffffff",
    padding: "8px 12px",
    cursor: "pointer",
  },
  footer: {
    padding: "0 12px 12px 12px",
  },
  micButton: {
    width: "100%",
    border: "none",
    borderRadius: 8,
    color: "#ffffff",
    fontWeight: 600,
    padding: "9px 12px",
    cursor: "pointer",
  },
};
