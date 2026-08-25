import { useEffect, useState } from "react";
import { listMyBookings } from "./api.js";
import { useNavigate } from "react-router-dom";

const STATUS_LABEL = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listMyBookings(0, 10)
      .then((res) => {
        setBookings(res.content);
        setTotalPages(res.totalPages);
        setPage(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const res = await listMyBookings(page + 1, 10);
      setBookings((prev) => [...prev, ...res.content]);
      setPage(page + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <h2 className="section-title">Lịch sử đặt vé</h2>
        <button className="btn btn--secondary" onClick={() => navigate("/")}>
          ← Về trang chủ
        </button>
      </div>

      {error && <div className="panel-new__error">{error}</div>}

      <div className="ticket-list">
        {bookings.map((b) => (
          <div key={b.bookingId} className="cinema-ticket">
            <div className="cinema-ticket__left">
              <h3 className="cinema-ticket__title">{b.movieTitle}</h3>
              <div className="cinema-ticket__meta">
                <span className="cinema-ticket__value">
                  {b.cinemaName} · {formatTime(b.startTime)} · Ghế{" "}
                  {b.seatIds.join(", ")}
                </span>
              </div>
              <div className="cinema-ticket__meta">
                <span className="cinema-ticket__label">
                  Đơn {b.paymentCode || b.bookingId} · {formatTime(b.createdAt)}
                </span>
              </div>
            </div>

            <div className="cinema-ticket__right">
              <div className="cinema-ticket__price">
                {b.totalAmount.toLocaleString("vi-VN")}đ
              </div>
              <span
                className={`cinema-ticket__status cinema-ticket__status--${b.status.toLowerCase()}`}
              >
                {STATUS_LABEL[b.status] || b.status}
              </span>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div
            className="panel-new"
            style={{ textAlign: "center", padding: "40px" }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>
              Bạn chưa thực hiện giao dịch đặt vé nào.
            </span>
          </div>
        )}
      </div>
      {page + 1 < totalPages && (
        <button
          className="btn btn--secondary"
          style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
          disabled={loadingMore}
          onClick={handleLoadMore}
        >
          {loadingMore ? "Đang tải..." : "Xem thêm"}
        </button>
      )}
    </div>
  );
}
