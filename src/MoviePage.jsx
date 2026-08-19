import { useEffect, useState } from "react";
import { listMovies, listShowtimes } from "./api.js";

export default function MoviePage({ onSelectShowtime }) {
  const [movies, setMovies] = useState([]);
  const [activeMovieForModal, setActiveMovieForModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listMovies()
      .then(setMovies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const heroMovie = movies.length > 0 ? movies[0] : null;

  return (
    <div className="page">
      {error && <div className="panel-new__error">{error}</div>}

      {heroMovie && (
        <div className="hero-banner">
          <div className="hero-banner__image-placeholder" />
          <div className="hero-banner__content">
            <span className="hero-banner__badge">Phim nổi bật</span>
            <h2 className="hero-banner__title">{heroMovie.title}</h2>
            <div className="hero-banner__meta">
              <span>{heroMovie.durationMinutes} phút</span>
              <span>·</span>
              <span style={{ color: "var(--color-accent)" }}>IMAX 3D</span>
            </div>
            <p className="hero-banner__desc">
              {heroMovie.description ||
                "Hãy trải nghiệm bộ phim bom tấn đỉnh cao cùng hệ thống âm thanh vòm sống động và màn hình IMAX cực rộng tại CINEWAVE ngay hôm nay."}
            </p>
            <div className="hero-banner__actions">
              <button
                className="btn btn--primary"
                onClick={() => setActiveMovieForModal(heroMovie)}
              >
                Đặt vé ngay
              </button>
              <button
                className="btn btn--secondary"
                onClick={() => setActiveMovieForModal(heroMovie)}
              >
                Thông tin chi tiết
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="section-title">Phim đang chiếu</h3>

      <div className="movie-grid" style={{ marginTop: "20px" }}>
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="movie-card-new"
            onClick={() => setActiveMovieForModal(movie)}
          >
            <div className="movie-card-new__poster">
              <div className="movie-card-new__poster-glow" />
              <div className="movie-card-new__poster-icon">🎬</div>
              <span style={{ fontSize: "12px", letterSpacing: "1px", fontWeight: 700 }}>
                {movie.posterUrl ? "POSTER" : "CINEWAVE"}
              </span>
            </div>
            <div className="movie-card-new__content">
              <h4 className="movie-card-new__title">{movie.title}</h4>
              <div className="movie-card-new__meta">
                <span className="movie-card-new__duration">
                  {movie.durationMinutes} phút
                </span>
                <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>Đặt vé</span>
              </div>
            </div>
          </div>
        ))}
        {movies.length === 0 && (
          <div className="panel-new" style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Chưa có phim nào đang chiếu.</span>
          </div>
        )}
      </div>

      {activeMovieForModal && (
        <MovieDetailsModal
          movie={activeMovieForModal}
          onClose={() => setActiveMovieForModal(null)}
          onSelectShowtime={onSelectShowtime}
        />
      )}
    </div>
  );
}

function MovieDetailsModal({ movie, onClose, onSelectShowtime }) {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listShowtimes(movie.id)
      .then(setShowtimes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [movie.id]);

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  }

  // Group showtimes by cinemaName and roomName
  const groupedShowtimes = {};
  showtimes.forEach((st) => {
    if (!groupedShowtimes[st.cinemaName]) {
      groupedShowtimes[st.cinemaName] = {};
    }
    if (!groupedShowtimes[st.cinemaName][st.roomName]) {
      groupedShowtimes[st.cinemaName][st.roomName] = [];
    }
    groupedShowtimes[st.cinemaName][st.roomName].push(st);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} title="Đóng">
          ✕
        </button>

        <div className="modal-hero">
          <div className="modal-hero__gradient" />
          <h2 className="modal-hero__title">{movie.title}</h2>
        </div>

        <div className="modal-body">
          {error && <div className="panel-new__error">{error}</div>}

          <div className="modal-info-grid">
            <div>
              <h4 className="modal-description__label">Mô tả phim</h4>
              <p className="modal-description__text">
                {movie.description ||
                  "Hãy trải nghiệm bộ phim bom tấn đỉnh cao cùng hệ thống âm thanh vòm sống động và màn hình IMAX cực rộng tại CINEWAVE ngay hôm nay."}
              </p>
            </div>

            <div className="modal-sidebar">
              <div className="modal-sidebar__item">
                <div className="modal-sidebar__label">Thời lượng</div>
                <div className="modal-sidebar__value">{movie.durationMinutes} phút</div>
              </div>
              <div className="modal-sidebar__item">
                <div className="modal-sidebar__label">Trạng thái</div>
                <div className="modal-sidebar__value" style={{ color: "var(--color-accent)" }}>
                  Đang chiếu
                </div>
              </div>
            </div>
          </div>

          <div className="showtimes-section">
            <h3 className="section-title" style={{ fontSize: "18px", marginBottom: "16px" }}>
              Suất chiếu hiện có
            </h3>

            {loading ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                Đang tải suất chiếu...
              </div>
            ) : showtimes.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                Hiện chưa có suất chiếu nào cho phim này.
              </div>
            ) : (
              Object.keys(groupedShowtimes).map((cinemaName) => (
                <div key={cinemaName} className="cinema-group">
                  <h4 className="cinema-group__title">{cinemaName}</h4>
                  {Object.keys(groupedShowtimes[cinemaName]).map((roomName) => (
                    <div key={roomName} className="room-group">
                      <div className="room-group__name">{roomName}</div>
                      <div className="showtime-grid">
                        {groupedShowtimes[cinemaName][roomName].map((st) => (
                          <button
                            key={st.id}
                            className="showtime-btn"
                            onClick={() =>
                              onSelectShowtime({ id: st.id, basePrice: st.basePrice })
                            }
                          >
                            <span className="showtime-btn__time">{formatTime(st.startTime)}</span>
                            <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                              Ngày {formatDate(st.startTime)}
                            </span>
                            <span className="showtime-btn__price">
                              {st.basePrice.toLocaleString("vi-VN")}đ
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}