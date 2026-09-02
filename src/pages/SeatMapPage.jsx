import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { getSeatMap, holdSeats, createBooking } from "../services/api.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const POLL_INTERVAL_MS = 5000;
const COLUMNS = 5;

export default function SeatMapPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePrice = location.state?.basePrice || 0;

  const [seatMap, setSeatMap] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const pollRef = useRef(null);

  async function refreshSeatMap() {
    try {
      const data = await getSeatMap(showtimeId);
      setSeatMap(data);
    } catch (err) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    refreshSeatMap();
    pollRef.current = setInterval(refreshSeatMap, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [showtimeId]);

  function toggleSeat(seatId, status) {
    if (status !== "AVAILABLE") return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId],
    );
  }

  async function handleBook() {
    if (selectedSeats.length === 0) return;
    
    setIsBooking(true);
    try {
      const holdResult = await holdSeats(showtimeId, selectedSeats);
      const totalAmount = basePrice * holdResult.seatIds.length;
      const bookingResult = await createBooking(
        holdResult.holdId,
        showtimeId,
        totalAmount,
      );
      navigate(`/payment/${bookingResult.bookingId}`);
    } catch (err) {
      setErrorMessage(
        err.conflictSeatIds?.length
          ? `${err.message} — ghế: ${err.conflictSeatIds.join(", ")}`
          : err.message,
      );
      refreshSeatMap();
    } finally {
      setIsBooking(false);
    }
  }

  const seatIds = Object.keys(seatMap)
    .map(Number)
    .sort((a, b) => a - b);
  const rows = [];
  for (let i = 0; i < seatIds.length; i += COLUMNS)
    rows.push(seatIds.slice(i, i + COLUMNS));

  function seatClass(seatId) {
    const status = seatMap[seatId];
    if (selectedSeats.includes(seatId)) return "seat-cell seat-cell--selected";
    if (status === "HELD") return "seat-cell seat-cell--held";
    if (status === "BOOKED") return "seat-cell seat-cell--booked";
    return "seat-cell seat-cell--available";
  }

  return (
    <div className="page animate-fade-in">
      <button className="btn btn--secondary" onClick={() => navigate(-1)} style={{ marginBottom: "24px" }}>
        ← Chọn suất chiếu khác
      </button>

      <div className="seat-map-layout">
        <div className="panel-new" style={{ padding: "40px 20px" }}>
          <div className="screen-container">
            <div className="screen-curved" />
            <span className="screen-label">MÀN HÌNH CHÍNH</span>
          </div>

          <div className="seat-matrix">
            {rows.map((row, rowIdx) => (
              <div className="seat-row" key={rowIdx}>
                {row.map((seatId) => (
                  <button
                    key={seatId}
                    className={seatClass(seatId)}
                    disabled={
                      seatMap[seatId] !== "AVAILABLE" &&
                      !selectedSeats.includes(seatId)
                    }
                    onClick={() => toggleSeat(seatId, seatMap[seatId])}
                    title={`Ghế ${seatId} — ${seatMap[seatId]}`}
                  >
                    {seatId}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="seat-legend">
            <div className="seat-legend__item">
              <div className="seat-legend__swatch seat-legend__swatch--available" />
              <span>Trống</span>
            </div>
            <div className="seat-legend__item">
              <div className="seat-legend__swatch seat-legend__swatch--selected" />
              <span>Đang chọn</span>
            </div>
            <div className="seat-legend__item">
              <div className="seat-legend__swatch seat-legend__swatch--held" />
              <span>Đang giữ</span>
            </div>
            <div className="seat-legend__item">
              <div className="seat-legend__swatch seat-legend__swatch--booked" />
              <span>Đã bán</span>
            </div>
          </div>
        </div>

        <div className="booking-summary-card">
          <h3 className="booking-summary-card__title">Thông tin vé</h3>
          
          <div className="booking-summary-card__row">
            <span className="booking-summary-card__label">Mã suất chiếu:</span>
            <span className="booking-summary-card__value">#{showtimeId}</span>
          </div>
          
          <div className="booking-summary-card__row">
            <span className="booking-summary-card__label">Giá vé cơ bản:</span>
            <span className="booking-summary-card__value">{basePrice.toLocaleString("vi-VN")}đ</span>
          </div>

          <div className="booking-summary-card__divider" />

          <div className="booking-summary-card__row" style={{ flexDirection: "column", gap: "8px" }}>
            <span className="booking-summary-card__label">Ghế đã chọn:</span>
            <div className="booking-summary-card__seats">
              {selectedSeats.length > 0 ? (
                selectedSeats.map((id) => (
                  <span key={id} className="booking-summary-card__seat-tag">Ghế {id}</span>
                ))
              ) : (
                <span className="booking-summary-card__value" style={{ fontWeight: "normal", color: "var(--color-text-muted)" }}>
                  Chưa chọn ghế
                </span>
              )}
            </div>
          </div>

          <div className="booking-summary-card__divider" />

          <div className="booking-summary-card__row" style={{ alignItems: "center" }}>
            <span className="booking-summary-card__label">Tổng cộng:</span>
            <span className="booking-summary-card__value booking-summary-card__value--highlight">
              {(basePrice * selectedSeats.length).toLocaleString("vi-VN")}đ
            </span>
          </div>

          

          <button
            className="btn btn--primary"
            style={{ width: "100%", marginTop: "20px" }}
            disabled={selectedSeats.length === 0 || isBooking}
            onClick={handleBook}
          >
            {isBooking ? "Đang đặt..." : "Tiến hành đặt vé"}
          </button>
        </div>
      </div>
    </div>
  );
}
