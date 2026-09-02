import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getMe, logout, setOnAuthExpired } from "./services/api.js";
import AuthPage from "./pages/AuthPage.jsx";
import MoviePage from "./pages/MoviePage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import SeatMapPage from "./pages/SeatMapPage.jsx";
import Navigation from "./components/Navigation.jsx";
import { Toaster } from "react-hot-toast";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
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
