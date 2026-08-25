import { useEffect, useState } from "react";
import { getBooking, cancelBooking } from "./api.js";

import { useParams, useNavigate } from "react-router-dom";

const POLL_INTERVAL_MS = 3000;

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await getBooking(bookingId);
        if (!cancelled) setBooking(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    poll();
    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [bookingId]);

  if (error) {
    return (
      <div className="page page--narrow">
        <div className="panel-new" style={{ textAlign: "center" }}>
          <div className="panel-new__error">
            <span>{error}</span>
          </div>
          <button className="btn btn--secondary" style={{ width: "100%" }} onClick={() => navigate("/")}>
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  if (booking.status === "CONFIRMED") {
    return (
      <div className="page page--narrow">
        <div className="panel-new" style={{ textAlign: "center", padding: "40px 30px" }}>
          <div style={{ fontSize: "50px", marginBottom: "16px" }}>🎉</div>
          <h2 className="section-title" style={{ fontSize: "22px", marginBottom: "12px" }}>
            Đặt vé thành công!
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            Cảm ơn bạn đã lựa chọn CINEWAVE. Chúc bạn có những phút giây xem phim tuyệt vời!
          </p>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", marginBottom: "24px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Mã hóa đơn:</span>
              <code style={{ color: "var(--color-accent)", fontWeight: 700 }}>{booking.paymentCode}</code>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Tổng tiền:</span>
              <span style={{ color: "var(--color-text-main)", fontWeight: 700 }}>
                {booking.totalAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <button className="btn btn--primary" style={{ width: "100%" }} onClick={() => navigate("/")}>
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (booking.status === "CANCELLED" || booking.status === "EXPIRED") {
    return (
      <div className="page page--narrow">
        <div className="panel-new" style={{ textAlign: "center", padding: "30px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
          <h3 className="section-title" style={{ fontSize: "18px", marginBottom: "12px" }}>
            Đơn hàng đã bị hủy
          </h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "13.5px", lineHeight: "1.6", marginBottom: "24px" }}>
            Đơn hàng đã {booking.status === "EXPIRED" ? "hết hạn giữ chỗ" : "bị hủy"} trước khi thanh
            toán được hệ thống xác nhận. Ghế trống đã được mở lại cho người dùng khác.
          </p>
          <button className="btn btn--primary" style={{ width: "100%" }} onClick={() => navigate("/")}>
            Thực hiện đặt vé lại
          </button>
        </div>
      </div>
    );
  }

  async function handleCancel() {
    setIsCancelling(true);
    try {
      await cancelBooking(bookingId);
      if (booking && booking.showtimeId) {
        navigate(`/booking/${booking.showtimeId}`);
      } else {
        navigate(-1);
      }
    } catch (err) {
      setError("Không thể hủy đặt vé: " + err.message);
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="page page--narrow">
      <div className="panel-new" style={{ padding: "30px 24px" }}>
        <h2 className="section-title" style={{ fontSize: "20px", display: "block", textAlign: "center", marginBottom: "8px" }}>
          Thanh toán vé
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "13px", textAlign: "center", marginBottom: "20px" }}>
          Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán
        </p>

        <div className="qr-container">
          <div className="qr-box-new">
            <div className="qr-box-new__scan-line" />
            <img src={booking.qrUrl} alt="QR thanh toán" className="qr-box-new__image" />
          </div>
          <div className="payment-status-badge">Đang chờ quét mã thanh toán...</div>
        </div>

        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13.5px" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Mã đơn hàng:</span>
            <code style={{ color: "var(--color-text-main)", fontWeight: 600 }}>{booking.paymentCode}</code>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Số tiền thanh toán:</span>
            <span style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "16px" }}>
              {booking.totalAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <button
          className="btn btn--secondary"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={handleCancel}
          disabled={isCancelling}
        >
          {isCancelling ? "Đang hủy giao dịch..." : "Hủy giao dịch & Chọn lại ghế"}
        </button>
      </div>
    </div>
  );
}