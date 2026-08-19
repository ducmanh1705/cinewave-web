import { useState } from "react";
import { login, register } from "./api.js";

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user =
        mode === "login"
          ? await login(email, password)
          : await register(email, password, fullName);

      if (mode === "register") {
        // đăng ký xong tự động chuyển sang login
        setMode("login");
        setPassword("");
        setError("Đăng ký thành công — hãy đăng nhập để tiếp tục.");
      } else {
        onAuthenticated(user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="auth-bg" />
      <div className="page page--narrow">
        <div className="auth-header">
          <div className="auth-header__logo">
            CINE<span style={{ color: "var(--color-accent)" }}>WAVE</span>
          </div>
        </div>

        <div className="panel-new">
          <h2 className="auth-header__title" style={{ marginBottom: "24px", textAlign: "center" }}>
            {mode === "login" ? "Đăng nhập" : "Tạo tài khoản mới"}
          </h2>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="input-field">
                <span className="input-field__label">Họ tên</span>
                <input
                  className="input-field__input"
                  placeholder="Nhập họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="input-field">
              <span className="input-field__label">Email</span>
              <input
                className="input-field__input"
                type="email"
                placeholder="Nhập địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <span className="input-field__label">Mật khẩu</span>
              <input
                className="input-field__input"
                type="password"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="panel-new__error" style={{ marginTop: "12px", marginBottom: "16px" }}>
                <span>{error}</span>
              </div>
            )}

            <button
              className="btn btn--primary"
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "12px", fontSize: "15px", marginTop: "10px" }}
            >
              {loading
                ? "Đang xử lý..."
                : mode === "login"
                ? "Đăng nhập"
                : "Đăng ký tài khoản"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <button
              type="button"
              className="btn btn--link"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login"
                ? "Bạn mới tham gia CINEWAVE? Đăng ký ngay"
                : "Đã có tài khoản CINEWAVE? Đăng nhập"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}