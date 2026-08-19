import { useEffect, useState } from "react";
import { listMyBookings } from "./api.js";

const STATUS_LABEL = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
};

export default function HistoryPage({ onBack }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function formatTime(iso) {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) return null;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h2 className="section-title">Lịch sử đặt vé</h2>
        <button className="btn btn--secondary" onClick={onBack}>
          ← Về trang chủ
        </button>
      </div>

      {error && <div className="panel-new__error">{error}</div>}

      <div className="ticket-list">
        {bookings.map((b) => (
          <div key={b.bookingId} className="cinema-ticket">
            <div className="cinema-ticket__left">
              <h3 className="cinema-ticket__title">{b.movieTitle}</h3>
              
              <div className="cinema-ticket__meta" style={{ marginTop: "12px" }}>
                <span className="cinema-ticket__label">Rạp / Phòng:</span>
                <span className="cinema-ticket__value">
                  {b.cinemaName} — {b.roomName}
                </span>
              </div>

              <div className="cinema-ticket__meta">
                <span className="cinema-ticket__label">Suất chiếu:</span>
                <span className="cinema-ticket__value">{formatTime(b.startTime)}</span>
              </div>

              <div className="cinema-ticket__meta" style={{ alignItems: "center" }}>
                <span className="cinema-ticket__label">Danh sách ghế:</span>
                <div className="cinema-ticket__seats">
                  {b.seatIds.map((id) => (
                    <span key={id} className="cinema-ticket__seat-badge">
                      Ghế {id}
                    </span>
                  ))}
                </div>
              </div>

              <div className="cinema-ticket__meta" style={{ marginTop: "12px", fontSize: "11px", color: "var(--color-text-muted)" }}>
                <span>Đặt vé ngày: {formatTime(b.createdAt)}</span>
                <span>·</span>
                <span>Đơn: <code>{b.paymentCode || b.bookingId}</code></span>
              </div>
            </div>

            <div className="cinema-ticket__right">
              <div className="cinema-ticket__price">
                {b.totalAmount.toLocaleString("vi-VN")}đ
              </div>
              <span className={`cinema-ticket__status cinema-ticket__status--${b.status.toLowerCase()}`}>
                {STATUS_LABEL[b.status] || b.status}
              </span>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="panel-new" style={{ textAlign: "center", padding: "40px" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Bạn chưa thực hiện giao dịch đặt vé nào.</span>
          </div>
        )}
      </div>
    </div>
  );
}