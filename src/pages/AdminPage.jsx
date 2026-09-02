import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import * as api from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Film, Ticket, DollarSign, Calendar, TrendingUp } from "lucide-react";

export default function AdminPage({ currentUser }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="page animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 className="section-title">Hệ thống quản trị</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Quản lý phim, rạp, phòng chiếu, lịch chiếu, người dùng và đơn đặt vé của CINEWAVE
          </p>
        </div>
        <button className="btn btn--secondary" onClick={() => navigate("/")}>
          ← Về trang chủ
        </button>
      </div>

      <div className="admin-tab-container">
        {[
          { key: "dashboard", label: "Tổng quan" },
          { key: "movies", label: "Phim ảnh" },
          { key: "cinemas", label: "Rạp chiếu" },
          { key: "rooms", label: "Phòng chiếu" },
          { key: "showtimes", label: "Suất chiếu" },
          { key: "users", label: "Người dùng" },
          { key: "bookings", label: "Đơn đặt vé" },
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
        {tab === "dashboard" && <DashboardTab />}
        {tab === "movies" && <MovieTab />}
        {tab === "cinemas" && <CinemaTab />}
        {tab === "rooms" && <RoomTab />}
        {tab === "showtimes" && <ShowtimeTab />}
        {tab === "users" && <UserTab currentUser={currentUser} />}
        {tab === "bookings" && <BookingsTab />}
      </div>
    </div>
  );
}

// ---------- Movie ----------
function MovieTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // null = ẩn form, {} = tạo mới, {...} = sửa
  function refresh() {
    api
      .adminListMovies()
      .then(setItems)
      .catch((err) => toast.error(err.message));
  }
  useEffect(refresh, []);

  async function handleSubmit(form) {
    try {
      if (editing.id) await api.adminUpdateMovie(editing.id, form);
      else await api.adminCreateMovie(form);
      setEditing(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Xoá phim này?")) return;
    try {
      await api.adminDeleteMovie(id);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      

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
  function refresh() {
    api
      .adminListCinemas()
      .then(setItems)
      .catch((err) => toast.error(err.message));
  }
  useEffect(refresh, []);

  async function handleSubmit(form) {
    try {
      if (editing.id) await api.adminUpdateCinema(editing.id, form);
      else await api.adminCreateCinema(form);
      setEditing(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Xoá rạp này?")) return;
    try {
      await api.adminDeleteCinema(id);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      

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
  function refresh() {
    api
      .adminListRooms()
      .then(setItems)
      .catch((err) => toast.error(err.message));
    api
      .adminListCinemas()
      .then(setCinemas)
      .catch((err) => toast.error(err.message));
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
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Xoá phòng này?")) return;
    try {
      await api.adminDeleteRoom(id);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function cinemaName(cinemaId) {
    return cinemas.find((c) => c.id === cinemaId)?.name || cinemaId;
  }

  return (
    <div>
      

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
  function refresh() {
    api
      .adminListShowtimes()
      .then(setItems)
      .catch((err) => toast.error(err.message));
    api
      .adminListMovies()
      .then(setMovies)
      .catch((err) => toast.error(err.message));
    api
      .adminListRooms()
      .then(setRooms)
      .catch((err) => toast.error(err.message));
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
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Xoá suất chiếu này?")) return;
    try {
      await api.adminDeleteShowtime(id);
      refresh();
    } catch (err) {
      toast.error(err.message);
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

// ---------- User Management ----------
function UserTab({ currentUser }) {
  const [items, setItems] = useState([]);
  function refresh() {
    api
      .adminListUsers()
      .then(setItems)
      .catch((err) => toast.error(err.message));
  }
  useEffect(refresh, []);

  async function handleRoleChange(userId, newRole) {
    if (!confirm(`Xác nhận đổi vai trò người dùng thành ${newRole}?`)) {
      refresh(); // Reset selection if cancelled
      return;
    }
    try {
      
      await api.adminUpdateUserRole(userId, newRole);
      refresh();
    } catch (err) {
      toast.error(err.message);
      refresh();
    }
  }

  async function handleDelete(userId) {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")) return;
    try {
      
      await api.adminDeleteUser(userId);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function formatTime(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      

      <div className="admin-table-container">
        <table className="admin-table-new">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên người dùng</th>
              <th>Email</th>
              <th>Vai trò (Role)</th>
              <th>Ngày đăng ký</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td style={{ fontWeight: 600, color: "var(--color-text-main)" }}>{u.fullName}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === currentUser?.id}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: "var(--color-bg-dark)",
                      color: "var(--color-text-main)",
                      border: "1px solid var(--color-border)",
                      cursor: u.id === currentUser?.id ? "not-allowed" : "pointer"
                    }}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  {u.id === currentUser?.id && (
                    <span style={{ fontSize: "11px", color: "var(--color-accent)", marginLeft: "8px" }}>
                      (Đang đăng nhập)
                    </span>
                  )}
                </td>
                <td>{formatTime(u.createdAt)}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="admin-table-action-btn admin-table-action-btn--danger"
                    disabled={u.id === currentUser?.id}
                    onClick={() => handleDelete(u.id)}
                    style={{
                      opacity: u.id === currentUser?.id ? 0.5 : 1,
                      cursor: u.id === currentUser?.id ? "not-allowed" : "pointer"
                    }}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "20px" }}>
                  Chưa có dữ liệu người dùng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Dashboard Tab ----------
function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  useEffect(() => {
    api.adminGetDashboardStats()
      .then(setStats)
      .catch((err) => toast.error(err.message));

    api.adminListAllBookings(0, 5)
      .then((data) => setRecentBookings(data.content))
      .catch((err) => toast.error(err.message));
  }, []);

  function formatPrice(val) {
    return (val || 0).toLocaleString("vi-VN") + "đ";
  }

  function getStatusLabel(status) {
    switch (status) {
      case "CONFIRMED": return "Đã thanh toán";
      case "PENDING": return "Chờ thanh toán";
      case "CANCELLED": return "Đã huỷ";
      case "EXPIRED": return "Hết hạn";
      default: return status;
    }
  }

  function getStatusStyle(status) {
    const baseStyle = {
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
      textAlign: "center",
      width: "fit-content",
    };
    switch (status) {
      case "CONFIRMED":
        return { ...baseStyle, backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" };
      case "PENDING":
        return { ...baseStyle, backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" };
      case "CANCELLED":
        return { ...baseStyle, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444" };
      default: // EXPIRED
        return { ...baseStyle, backgroundColor: "rgba(148, 163, 184, 0.15)", color: "#94a3b8" };
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
        <div className="panel-new" style={{ display: "flex", flexDirection: "column", gap: "8px", borderLeft: "4px solid var(--color-accent)" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "13px", fontWeight: 500 }}>TỔNG DOANH THU</span>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text-main)" }}>
            {formatPrice(stats?.totalRevenue)}
          </span>
        </div>

        <div className="panel-new" style={{ display: "flex", flexDirection: "column", gap: "8px", borderLeft: "4px solid #10b981" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "13px", fontWeight: 500 }}>VÉ ĐÃ ĐẶT (TẤT CẢ)</span>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text-main)" }}>
            {stats?.totalBookings || 0}
          </span>
        </div>

        <div className="panel-new" style={{ display: "flex", flexDirection: "column", gap: "8px", borderLeft: "4px solid #3b82f6" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "13px", fontWeight: 500 }}>NGƯỜI DÙNG</span>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text-main)" }}>
            {stats?.totalUsers || 0}
          </span>
        </div>

        <div className="panel-new" style={{ display: "flex", flexDirection: "column", gap: "8px", borderLeft: "4px solid #f59e0b" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "13px", fontWeight: 500 }}>PHIM ĐANG CHIẾU</span>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text-main)" }}>
            {stats?.totalMovies || 0}
          </span>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="panel-new">
        <h3 className="panel-new__title" style={{ marginBottom: "20px" }}>Đơn đặt vé mới nhất</h3>
        <div className="admin-table-container">
          <table className="admin-table-new">
            <thead>
              <tr>
                <th>Mã đặt vé</th>
                <th>Khách hàng</th>
                <th>Phim</th>
                <th>Rạp / Phòng</th>
                <th>Ghế</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.paymentCode || `#${b.id}`}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: "var(--color-text-main)" }}>{b.userFullName}</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{b.userEmail}</div>
                  </td>
                  <td style={{ fontWeight: 500, color: "var(--color-text-main)" }}>{b.movieTitle}</td>
                  <td>{b.cinemaName} — <span style={{ color: "var(--color-accent)" }}>{b.roomName}</span></td>
                  <td>
                    {b.seatIds.map((id) => (
                      <span key={id} className="booking-summary-card__seat-tag" style={{ margin: "2px", fontSize: "11px" }}>Ghế {id}</span>
                    ))}
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--color-text-main)" }}>{formatPrice(b.totalAmount)}</td>
                  <td>
                    <span style={getStatusStyle(b.status)}>{getStatusLabel(b.status)}</span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "20px" }}>
                    Chưa có giao dịch nào gần đây.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- Bookings Management Tab ----------
function BookingsTab() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  function loadBookings() {
    setLoading(true);
    api.adminListAllBookings(page, 10, status, search)
      .then((data) => {
        setItems(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadBookings, [page, status]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(0);
    loadBookings();
  }

  async function handleCancel(id) {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này và giải phóng các ghế liên quan?")) return;
    try {
      
      await api.adminCancelBooking(id);
      loadBookings();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function formatPrice(val) {
    return (val || 0).toLocaleString("vi-VN") + "đ";
  }

  function formatTime(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusLabel(status) {
    switch (status) {
      case "CONFIRMED": return "Đã thanh toán";
      case "PENDING": return "Chờ thanh toán";
      case "CANCELLED": return "Đã huỷ";
      case "EXPIRED": return "Hết hạn";
      default: return status;
    }
  }

  function getStatusStyle(status) {
    const baseStyle = {
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
      textAlign: "center",
      width: "fit-content",
    };
    switch (status) {
      case "CONFIRMED":
        return { ...baseStyle, backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" };
      case "PENDING":
        return { ...baseStyle, backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" };
      case "CANCELLED":
        return { ...baseStyle, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444" };
      default: // EXPIRED
        return { ...baseStyle, backgroundColor: "rgba(148, 163, 184, 0.15)", color: "#94a3b8" };
    }
  }

  return (
    <div>
      

      {/* Filter and Search controls */}
      <div className="panel-new" style={{ marginBottom: "24px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="input-field" style={{ flex: 1, minWidth: "240px", marginBottom: 0 }}>
            <span className="input-field__label">Tìm kiếm đơn đặt vé</span>
            <input
              className="input-field__input"
              placeholder="Nhập mã đặt vé, email hoặc tên khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="input-field" style={{ width: "200px", marginBottom: 0 }}>
            <span className="input-field__label">Trạng thái</span>
            <select
              className="input-field__select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="CONFIRMED">Đã thanh toán</option>
              <option value="CANCELLED">Đã huỷ</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
          </div>

          <button type="submit" className="btn btn--primary" disabled={loading} style={{ height: "42px" }}>
            {loading ? "Đang tải..." : "Tìm kiếm"}
          </button>
        </form>
      </div>

      <div className="admin-table-container">
        <table className="admin-table-new">
          <thead>
            <tr>
              <th>Mã đặt vé</th>
              <th>Khách hàng</th>
              <th>Phim</th>
              <th>Rạp / Phòng</th>
              <th>Ghế</th>
              <th>Ngày tạo</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>{b.paymentCode || `#${b.id}`}</td>
                <td>
                  <div style={{ fontWeight: 500, color: "var(--color-text-main)" }}>{b.userFullName}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{b.userEmail}</div>
                </td>
                <td style={{ fontWeight: 500, color: "var(--color-text-main)" }}>{b.movieTitle}</td>
                <td>{b.cinemaName} — <span style={{ color: "var(--color-accent)" }}>{b.roomName}</span></td>
                <td>
                  {b.seatIds.map((id) => (
                    <span key={id} className="booking-summary-card__seat-tag" style={{ margin: "2px", fontSize: "11px" }}>Ghế {id}</span>
                  ))}
                </td>
                <td style={{ fontSize: "12px" }}>{formatTime(b.createdAt)}</td>
                <td style={{ fontWeight: 600, color: "var(--color-text-main)" }}>{formatPrice(b.totalAmount)}</td>
                <td>
                  <span style={getStatusStyle(b.status)}>{getStatusLabel(b.status)}</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  {b.status === "PENDING" && (
                    <button
                      className="admin-table-action-btn admin-table-action-btn--danger"
                      onClick={() => handleCancel(b.id)}
                    >
                      Huỷ vé
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "20px" }}>
                  Không tìm thấy đơn đặt vé nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
          <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
            Hiển thị trang {page + 1} / {totalPages} (Tổng cộng {totalElements} đơn)
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn--secondary"
              disabled={page === 0 || loading}
              onClick={() => setPage(page - 1)}
              style={{ padding: "8px 16px", minWidth: "auto" }}
            >
              ← Trước
            </button>
            <button
              className="btn btn--secondary"
              disabled={page === totalPages - 1 || loading}
              onClick={() => setPage(page + 1)}
              style={{ padding: "8px 16px", minWidth: "auto" }}
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


