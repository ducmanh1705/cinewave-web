import { useEffect, useState } from "react";
import * as api from "./api.js";

export default function AdminPage({ onBack }) {
  const [tab, setTab] = useState("movies");

  return (
    <div className="page animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 className="section-title">Hệ thống quản trị</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Quản lý phim, rạp, phòng chiếu và lịch chiếu của CINEWAVE
          </p>
        </div>
        <button className="btn btn--secondary" onClick={onBack}>
          ← Về trang chủ
        </button>
      </div>

      <div className="admin-tab-container">
        {[
          { key: "movies", label: "Phim ảnh" },
          { key: "cinemas", label: "Rạp chiếu" },
          { key: "rooms", label: "Phòng chiếu" },
          { key: "showtimes", label: "Suất chiếu" },
        ].map((t) => (
          <button
            key={t.key}
            className={`admin-tab-btn ${tab === t.key ? "admin-tab-btn--active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "24px" }}>
        {tab === "movies" && <MovieTab />}
        {tab === "cinemas" && <CinemaTab />}
        {tab === "rooms" && <RoomTab />}
        {tab === "showtimes" && <ShowtimeTab />}
      </div>
    </div>
  );
}

// ---------- Movie ----------
function MovieTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // null = ẩn form, {} = tạo mới, {...} = sửa
  const [error, setError] = useState("");

  function refresh() {
    api
      .adminListMovies()
      .then(setItems)
      .catch((err) => setError(err.message));
  }
  useEffect(refresh, []);

  async function handleSubmit(form) {
    try {
      if (editing.id) await api.adminUpdateMovie(editing.id, form);
      else await api.adminCreateMovie(form);
      setEditing(null);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Xoá phim này?")) return;
    try {
      await api.adminDeleteMovie(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      {error && <div className="panel-new__error">{error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button
          className="btn btn--primary"
          onClick={() =>
            setEditing({
              title: "",
              durationMinutes: "",
              description: "",
              posterUrl: "",
            })
          }
        >
          + Thêm phim mới
        </button>
      </div>

      {editing && (
        <div className="panel-new" style={{ marginBottom: "30px" }}>
          <h3 className="panel-new__title">
            {editing.id ? "Cập nhật thông tin phim" : "Thêm phim mới"}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="input-field">
              <span className="input-field__label">Tên phim</span>
              <input
                className="input-field__input"
                placeholder="Nhập tên phim"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="input-field">
              <span className="input-field__label">Thời lượng (phút)</span>
              <input
                className="input-field__input"
                type="number"
                placeholder="Ví dụ: 120"
                value={editing.durationMinutes}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    durationMinutes: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="input-field">
            <span className="input-field__label">Mô tả phim</span>
            <textarea
              className="input-field__input"
              style={{ fontFamily: "inherit", minHeight: "80px", resize: "vertical" }}
              placeholder="Nhập tóm tắt mô tả phim..."
              value={editing.description || ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </div>

          <div className="input-field">
            <span className="input-field__label">URL Poster ảnh (Tùy chọn)</span>
            <input
              className="input-field__input"
              placeholder="https://example.com/poster.jpg"
              value={editing.posterUrl || ""}
              onChange={(e) => setEditing({ ...editing, posterUrl: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button className="btn btn--primary" onClick={() => handleSubmit(editing)}>
              Lưu lại
            </button>
            <button className="btn btn--secondary" onClick={() => setEditing(null)}>
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table-new">
          <thead>
            <tr>
              <th>Tên phim</th>
              <th>Thời lượng</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600, color: "var(--color-text-main)" }}>{m.title}</td>
                <td>{m.durationMinutes} phút</td>
                <td style={{ textAlign: "right" }}>
                  <button className="admin-table-action-btn" onClick={() => setEditing(m)}>
                    Sửa
                  </button>
                  <button
                    className="admin-table-action-btn admin-table-action-btn--danger"
                    onClick={() => handleDelete(m.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "20px" }}>
                  Chưa có dữ liệu phim.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Cinema ----------
function CinemaTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  function refresh() {
    api
      .adminListCinemas()
      .then(setItems)
      .catch((err) => setError(err.message));
  }
  useEffect(refresh, []);

  async function handleSubmit(form) {
    try {
      if (editing.id) await api.adminUpdateCinema(editing.id, form);
      else await api.adminCreateCinema(form);
      setEditing(null);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Xoá rạp này?")) return;
    try {
      await api.adminDeleteCinema(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      {error && <div className="panel-new__error">{error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button className="btn btn--primary" onClick={() => setEditing({ name: "", address: "" })}>
          + Thêm rạp mới
        </button>
      </div>

      {editing && (
        <div className="panel-new" style={{ marginBottom: "30px" }}>
          <h3 className="panel-new__title">
            {editing.id ? "Cập nhật thông tin rạp" : "Thêm rạp chiếu mới"}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "16px" }}>
            <div className="input-field">
              <span className="input-field__label">Tên rạp</span>
              <input
                className="input-field__input"
                placeholder="Ví dụ: CINEWAVE Bà Triệu"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div className="input-field">
              <span className="input-field__label">Địa chỉ</span>
              <input
                className="input-field__input"
                placeholder="Nhập địa chỉ rạp chiếu..."
                value={editing.address}
                onChange={(e) => setEditing({ ...editing, address: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button className="btn btn--primary" onClick={() => handleSubmit(editing)}>
              Lưu lại
            </button>
            <button className="btn btn--secondary" onClick={() => setEditing(null)}>
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table-new">
          <thead>
            <tr>
              <th>Tên rạp</th>
              <th>Địa chỉ</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, color: "var(--color-text-main)" }}>{c.name}</td>
                <td>{c.address}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="admin-table-action-btn" onClick={() => setEditing(c)}>
                    Sửa
                  </button>
                  <button
                    className="admin-table-action-btn admin-table-action-btn--danger"
                    onClick={() => handleDelete(c.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "20px" }}>
                  Chưa có dữ liệu rạp chiếu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Room ----------
function RoomTab() {
  const [items, setItems] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  function refresh() {
    api
      .adminListRooms()
      .then(setItems)
      .catch((err) => setError(err.message));
    api
      .adminListCinemas()
      .then(setCinemas)
      .catch((err) => setError(err.message));
  }
  useEffect(refresh, []);

  async function handleSubmit(form) {
    try {
      if (editing.id)
        await api.adminUpdateRoom(editing.id, {
          name: form.name,
          totalSeats: form.totalSeats,
        });
      else await api.adminCreateRoom(form);
      setEditing(null);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Xoá phòng này?")) return;
    try {
      await api.adminDeleteRoom(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function cinemaName(cinemaId) {
    return cinemas.find((c) => c.id === cinemaId)?.name || cinemaId;
  }

  return (
    <div>
      {error && <div className="panel-new__error">{error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button
          className="btn btn--primary"
          onClick={() =>
            setEditing({
              cinemaId: cinemas[0]?.id || "",
              name: "",
              totalSeats: "",
            })
          }
        >
          + Thêm phòng mới
        </button>
      </div>

      {editing && (
        <div className="panel-new" style={{ marginBottom: "30px" }}>
          <h3 className="panel-new__title">
            {editing.id ? "Cập nhật thông tin phòng" : "Thêm phòng chiếu mới"}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div className="input-field">
              <span className="input-field__label">Thuộc rạp</span>
              <select
                className="input-field__select"
                value={editing.cinemaId}
                onChange={(e) =>
                  setEditing({ ...editing, cinemaId: Number(e.target.value) })
                }
                disabled={!!editing.id}
              >
                {cinemas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-field">
              <span className="input-field__label">Tên phòng</span>
              <input
                className="input-field__input"
                placeholder="Ví dụ: Phòng 01 VIP"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div className="input-field">
              <span className="input-field__label">Số lượng ghế</span>
              <input
                className="input-field__input"
                type="number"
                placeholder="Ví dụ: 25"
                value={editing.totalSeats}
                onChange={(e) =>
                  setEditing({ ...editing, totalSeats: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button className="btn btn--primary" onClick={() => handleSubmit(editing)}>
              Lưu lại
            </button>
            <button className="btn btn--secondary" onClick={() => setEditing(null)}>
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table-new">
          <thead>
            <tr>
              <th>Rạp chiếu</th>
              <th>Tên phòng</th>
              <th>Số lượng ghế</th>
              <th style={{ textAlgin: "right", textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, color: "var(--color-text-main)" }}>
                  {cinemaName(r.cinemaId)}
                </td>
                <td>{r.name}</td>
                <td>{r.totalSeats} ghế</td>
                <td style={{ textAlign: "right" }}>
                  <button className="admin-table-action-btn" onClick={() => setEditing(r)}>
                    Sửa
                  </button>
                  <button
                    className="admin-table-action-btn admin-table-action-btn--danger"
                    onClick={() => handleDelete(r.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "20px" }}>
                  Chưa có dữ liệu phòng chiếu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Showtime ----------
function ShowtimeTab() {
  const [items, setItems] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  function refresh() {
    api
      .adminListShowtimes()
      .then(setItems)
      .catch((err) => setError(err.message));
    api
      .adminListMovies()
      .then(setMovies)
      .catch((err) => setError(err.message));
    api
      .adminListRooms()
      .then(setRooms)
      .catch((err) => setError(err.message));
  }
  useEffect(refresh, []);

  async function handleSubmit(form) {
    try {
      if (editing.id) {
        await api.adminUpdateShowtime(editing.id, {
          startTime: form.startTime,
          basePrice: form.basePrice,
        });
      } else {
        await api.adminCreateShowtime(form);
      }
      setEditing(null);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Xoá suất chiếu này?")) return;
    try {
      await api.adminDeleteShowtime(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      {error && <div className="panel-new__error">{error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button
          className="btn btn--primary"
          onClick={() =>
            setEditing({
              movieId: movies[0]?.id || "",
              roomId: rooms[0]?.id || "",
              startTime: "",
              basePrice: "",
            })
          }
        >
          + Thêm suất chiếu mới
        </button>
      </div>

      {editing && (
        <div className="panel-new" style={{ marginBottom: "30px" }}>
          <h3 className="panel-new__title">
            {editing.id ? "Cập nhật suất chiếu" : "Thêm suất chiếu mới"}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="input-field">
              <span className="input-field__label">Chọn phim</span>
              <select
                className="input-field__select"
                value={editing.movieId}
                onChange={(e) => setEditing({ ...editing, movieId: Number(e.target.value) })}
                disabled={!!editing.id}
              >
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-field">
              <span className="input-field__label">Chọn phòng / rạp</span>
              <select
                className="input-field__select"
                value={editing.roomId}
                onChange={(e) => setEditing({ ...editing, roomId: Number(e.target.value) })}
                disabled={!!editing.id}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.totalSeats} ghế)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
            <div className="input-field">
              <span className="input-field__label">Thời gian bắt đầu</span>
              <input
                className="input-field__input"
                type="datetime-local"
                value={editing.startTime}
                onChange={(e) => setEditing({ ...editing, startTime: e.target.value })}
              />
            </div>
            <div className="input-field">
              <span className="input-field__label">Giá vé cơ bản (đ)</span>
              <input
                className="input-field__input"
                type="number"
                placeholder="Ví dụ: 85000"
                value={editing.basePrice}
                onChange={(e) => setEditing({ ...editing, basePrice: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8.5px" }}>
            <button className="btn btn--primary" onClick={() => handleSubmit(editing)}>
              Lưu lại
            </button>
            <button className="btn btn--secondary" onClick={() => setEditing(null)}>
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table-new">
          <thead>
            <tr>
              <th>Phim</th>
              <th>Rạp / Phòng</th>
              <th>Thời gian chiếu</th>
              <th>Giá vé</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600, color: "var(--color-text-main)" }}>{s.movieTitle}</td>
                <td>
                  {s.cinemaName} — <span style={{ color: "var(--color-accent)" }}>{s.roomName}</span>
                </td>
                <td>{formatTime(s.startTime)}</td>
                <td>{s.basePrice.toLocaleString("vi-VN")}đ</td>
                <td style={{ textAlign: "right" }}>
                  <button className="admin-table-action-btn" onClick={() => setEditing(s)}>
                    Sửa
                  </button>
                  <button
                    className="admin-table-action-btn admin-table-action-btn--danger"
                    onClick={() => handleDelete(s.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "20px" }}>
                  Chưa có dữ liệu suất chiếu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
