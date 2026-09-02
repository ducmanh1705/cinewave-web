import { useNavigate, useLocation } from "react-router-dom";
import "../index.css";

export default function Navigation({ user, onLogout }) {
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
