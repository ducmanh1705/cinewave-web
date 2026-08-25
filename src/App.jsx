import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { getMe, logout, setOnAuthExpired } from "./api.js";
import AuthPage from "./AuthPage.jsx";
import MoviePage from "./MoviePage.jsx";
import PaymentPage from "./PaymentPage.jsx";
import HistoryPage from "./HistoryPage.jsx";
import AdminPage from "./AdminPage.jsx";
import SeatMapPage from "./SeatMapPage.jsx";
import "./index.css";

function Navigation({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar__brand" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
        <span>CINE</span>
        <span className="navbar__brand-wave">WAVE</span>
      </div>

      <div className="navbar__menu">
        <button
          className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
          onClick={() => navigate("/")}
        >
          Trang chủ
        </button>
        <button
          className={`navbar__link ${location.pathname === '/history' ? 'navbar__link--active' : ''}`}
          onClick={() => navigate("/history")}
        >
          Lịch sử vé
        </button>
        {user.role === "ADMIN" && (
          <button
            className={`navbar__link ${location.pathname.startsWith('/admin') ? 'navbar__link--active' : ''}`}
            onClick={() => navigate("/admin")}
          >
            Quản trị
          </button>
        )}
        <div className="navbar__user">
          <div className="navbar__avatar">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="navbar__user-name">{user.fullName}</span>
          <button className="navbar__logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setOnAuthExpired(() => setUser(null));
  }, []);

  useEffect(() => {
    getMe()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setCheckingAuth(false));
  }, []);

  if (checkingAuth) return null;
  if (!user) return <AuthPage onAuthenticated={(u) => setUser(u)} />;

  return (
    <div className="app-container">
      <Navigation user={user} onLogout={() => { logout(); setUser(null); }} />

      <Routes>
        <Route path="/" element={<MoviePage />} />
        <Route path="/history" element={<HistoryPage />} />
        {user.role === "ADMIN" && <Route path="/admin/*" element={<AdminPage currentUser={user} />} />}
        <Route path="/booking/:showtimeId" element={<SeatMapPage />} />
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
      </Routes>
    </div>
  );
}
