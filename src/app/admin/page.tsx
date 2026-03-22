"use client";

import { useState, useCallback } from "react";
import styles from "./admin.module.css";

type WebhookInfo = {
  url?: string;
  has_custom_certificate?: boolean;
  pending_update_count?: number;
  last_error_date?: number;
  last_error_message?: string;
};

type Log = {
  time: string;
  type: "info" | "success" | "error" | "warn";
  msg: string;
};

function timestamp() {
  return new Date().toLocaleTimeString("vi-VN", { hour12: false });
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<Log[]>([]);
  const [broadcast, setBroadcast] = useState("");
  const [chatIds, setChatIds] = useState("");
  const [activeTab, setActiveTab] = useState<"webhook" | "broadcast" | "send">(
    "webhook",
  );
  const [sendTo, setSendTo] = useState("");
  const [sendMsg, setSendMsg] = useState("");

  const log = useCallback((msg: string, type: Log["type"] = "info") => {
    setLogs((prev) => [{ time: timestamp(), type, msg }, ...prev].slice(0, 50));
  }, []);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      "x-admin-password": password,
    }),
    [password],
  );

  const fetchWebhook = useCallback(async () => {
    setLoading((l) => ({ ...l, webhook: true }));
    try {
      const res = await fetch("/api/bot/setup", { headers: headers() });
      const data = await res.json();
      if (data.result) {
        setWebhookInfo(data.result);
        log("Webhook info loaded", "success");
      } else {
        log(data.error || "Failed to fetch webhook info", "error");
      }
    } catch {
      log("Network error", "error");
    } finally {
      setLoading((l) => ({ ...l, webhook: false }));
    }
  }, [headers, log]);

  const setWebhook = async () => {
    setLoading((l) => ({ ...l, set: true }));
    log("Setting webhook...", "info");
    try {
      const res = await fetch("/api/bot/setup", {
        method: "POST",
        headers: headers(),
      });
      const data = await res.json();
      if (data.ok) {
        log(`Webhook set → ${data.webhook_url}`, "success");
        fetchWebhook();
      } else {
        log(data.description || data.error || "Failed", "error");
      }
    } catch {
      log("Network error", "error");
    } finally {
      setLoading((l) => ({ ...l, set: false }));
    }
  };

  const deleteWebhook = async () => {
    setLoading((l) => ({ ...l, delete: true }));
    log("Deleting webhook...", "warn");
    try {
      const res = await fetch("/api/bot/setup", {
        method: "DELETE",
        headers: headers(),
      });
      const data = await res.json();
      if (data.ok) {
        log("Webhook deleted", "success");
        setWebhookInfo(null);
      } else {
        log(data.description || "Failed", "error");
      }
    } catch {
      log("Network error", "error");
    } finally {
      setLoading((l) => ({ ...l, delete: false }));
    }
  };

  const sendBroadcast = async () => {
    const ids = chatIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!ids.length || !broadcast) {
      log("Cần nhập Chat IDs và nội dung tin nhắn", "warn");
      return;
    }
    setLoading((l) => ({ ...l, broadcast: true }));
    log(`Broadcasting to ${ids.length} users...`, "info");
    try {
      const res = await fetch("/api/bot/broadcast", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ chatIds: ids, message: broadcast }),
      });
      const data = await res.json();
      if (data.ok) {
        log(`✓ ${data.success} sent, ✗ ${data.failed} failed`, "success");
        setBroadcast("");
      } else {
        log(data.error || "Failed", "error");
      }
    } catch {
      log("Network error", "error");
    } finally {
      setLoading((l) => ({ ...l, broadcast: false }));
    }
  };

  const sendDirect = async () => {
    if (!sendTo || !sendMsg) {
      log("Cần nhập Chat ID và nội dung", "warn");
      return;
    }
    setLoading((l) => ({ ...l, send: true }));
    log(`Sending to ${sendTo}...`, "info");
    try {
      const res = await fetch("/api/bot/broadcast", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ chatIds: [sendTo], message: sendMsg }),
      });
      const data = await res.json();
      if (data.ok && data.success > 0) {
        log(`Message sent to ${sendTo}`, "success");
        setSendMsg("");
      } else {
        log(`Failed to send to ${sendTo}`, "error");
      }
    } catch {
      log("Network error", "error");
    } finally {
      setLoading((l) => ({ ...l, send: false }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((l) => ({ ...l, login: true }));
    try {
      const res = await fetch("/api/bot/setup", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        setAuthed(true);
        log("Authenticated successfully", "success");
        fetchWebhook();
      } else {
        setAuthError("Sai mật khẩu");
      }
    } catch {
      setAuthError("Network error");
    } finally {
      setLoading((l) => ({ ...l, login: false }));
    }
  };

  if (!authed) {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginBox}>
          <div className={styles.loginLogo}>
            <span className={styles.logoIcon}>⌬</span>
            <h1>BOT ADMIN</h1>
          </div>
          <p className={styles.loginSub}>Enter admin password to continue</p>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className={styles.input}
              autoFocus
            />
            {authError && <span className={styles.error}>{authError}</span>}
            <button
              type="submit"
              className={styles.btn}
              disabled={loading.login}
            >
              {loading.login ? "checking..." : "→ login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logoIcon}>⌬</span>
          <span className={styles.headerTitle}>BOT ADMIN</span>
          <span className={styles.headerBadge}>● LIVE</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.text2}>
            {new Date().toLocaleDateString("vi-VN")}
          </span>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {(["webhook", "broadcast", "send"] as const).map((tab) => (
              <button
                key={tab}
                className={`${styles.navItem} ${activeTab === tab ? styles.navActive : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <span className={styles.navIcon}>
                  {tab === "webhook" ? "◈" : tab === "broadcast" ? "◎" : "◆"}
                </span>
                {tab === "webhook"
                  ? "Webhook"
                  : tab === "broadcast"
                    ? "Broadcast"
                    : "Direct Send"}
              </button>
            ))}
          </nav>

          {/* Webhook status mini */}
          <div className={styles.statusCard}>
            <div className={styles.statusLabel}>WEBHOOK</div>
            <div
              className={styles.statusDot}
              style={{
                color: webhookInfo?.url ? "var(--green)" : "var(--red)",
              }}
            >
              ● {webhookInfo?.url ? "ACTIVE" : "INACTIVE"}
            </div>
            {webhookInfo?.pending_update_count !== undefined && (
              <div className={styles.statusSub}>
                pending: {webhookInfo.pending_update_count}
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          {/* Webhook Tab */}
          {activeTab === "webhook" && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Webhook Management</h2>
                <span className={styles.panelSub}>
                  Quản lý kết nối bot với Telegram
                </span>
              </div>

              {webhookInfo && (
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>URL</span>
                    <span
                      className={styles.infoValue}
                      style={{ wordBreak: "break-all" }}
                    >
                      {webhookInfo.url || "—"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>PENDING</span>
                    <span className={styles.infoValue}>
                      {webhookInfo.pending_update_count ?? 0}
                    </span>
                  </div>
                  {webhookInfo.last_error_message && (
                    <div className={styles.infoItem}>
                      <span
                        className={styles.infoLabel}
                        style={{ color: "var(--red)" }}
                      >
                        LAST ERROR
                      </span>
                      <span
                        className={styles.infoValue}
                        style={{ color: "var(--red)" }}
                      >
                        {webhookInfo.last_error_message}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.btnRow}>
                <button
                  onClick={fetchWebhook}
                  className={styles.btn}
                  disabled={loading.webhook}
                >
                  {loading.webhook ? "loading..." : "◎ refresh info"}
                </button>
                <button
                  onClick={setWebhook}
                  className={`${styles.btn} ${styles.btnGreen}`}
                  disabled={loading.set}
                >
                  {loading.set ? "setting..." : "▲ set webhook"}
                </button>
                <button
                  onClick={deleteWebhook}
                  className={`${styles.btn} ${styles.btnRed}`}
                  disabled={loading.delete}
                >
                  {loading.delete ? "deleting..." : "✕ delete webhook"}
                </button>
              </div>

              <div className={styles.hint}>
                <span className={styles.hintTitle}>ℹ HOW TO DEPLOY</span>
                <ol className={styles.hintList}>
                  <li>Push code lên GitHub</li>
                  <li>Connect repo với Vercel</li>
                  <li>
                    Thêm các biến môi trường từ <code>.env.example</code>
                  </li>
                  <li>
                    Deploy xong → bấm <strong>set webhook</strong> ở trên
                  </li>
                  <li>Test bot bằng cách nhắn /start</li>
                </ol>
              </div>
            </div>
          )}

          {/* Broadcast Tab */}
          {activeTab === "broadcast" && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Broadcast</h2>
                <span className={styles.panelSub}>
                  Gửi tin nhắn đến nhiều users
                </span>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  CHAT IDs (cách nhau bằng dấu phẩy)
                </label>
                <input
                  className={styles.input}
                  value={chatIds}
                  onChange={(e) => setChatIds(e.target.value)}
                  placeholder="123456789, 987654321, ..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>NỘI DUNG (hỗ trợ HTML)</label>
                <textarea
                  className={styles.textarea}
                  value={broadcast}
                  onChange={(e) => setBroadcast(e.target.value)}
                  placeholder="Gõ tin nhắn ở đây...&#10;Hỗ trợ <b>bold</b>, <i>italic</i>, <code>code</code>"
                  rows={5}
                />
              </div>
              <button
                className={`${styles.btn} ${styles.btnAccent}`}
                onClick={sendBroadcast}
                disabled={loading.broadcast}
              >
                {loading.broadcast ? "sending..." : "◎ send broadcast"}
              </button>
            </div>
          )}

          {/* Direct Send Tab */}
          {activeTab === "send" && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Direct Send</h2>
                <span className={styles.panelSub}>
                  Gửi tin nhắn đến 1 user cụ thể
                </span>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>CHAT ID</label>
                <input
                  className={styles.input}
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="123456789"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>TIN NHẮN</label>
                <textarea
                  className={styles.textarea}
                  value={sendMsg}
                  onChange={(e) => setSendMsg(e.target.value)}
                  placeholder="Nội dung tin nhắn..."
                  rows={5}
                />
              </div>
              <button
                className={`${styles.btn} ${styles.btnAccent}`}
                onClick={sendDirect}
                disabled={loading.send}
              >
                {loading.send ? "sending..." : "◆ send message"}
              </button>
            </div>
          )}
        </main>

        {/* Log Panel */}
        <aside className={styles.logPanel}>
          <div className={styles.logHeader}>
            <span>CONSOLE</span>
            <button className={styles.logClear} onClick={() => setLogs([])}>
              clear
            </button>
          </div>
          <div className={styles.logBody}>
            {logs.length === 0 && (
              <div className={styles.logEmpty}>{"// no logs yet"}</div>
            )}
            {logs.map((l, i) => (
              <div
                key={i}
                className={`${styles.logLine} ${styles[`log_${l.type}`]}`}
              >
                <span className={styles.logTime}>{l.time}</span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
