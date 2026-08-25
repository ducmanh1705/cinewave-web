const BASE_URL = import.meta.env.VITE_API_URL || 'https://cinewave-api-oltx.onrender.com/api';

let refreshPromise = null; // gộp các request 401 đồng thời thành 1 lần refresh duy nhất
let onAuthExpired = null; // callback App.jsx đăng ký để biết khi nào phải quay về login

export function setOnAuthExpired(callback) {
  onAuthExpired = callback;
}

async function doRefresh() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Refresh token hết hạn');
        return true;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, options = {}, isRetry = false) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  // access token hết hạn -> thử refresh ngầm 1 lần, không hỏi ý user
  const isAuthEndpoint = path === '/auth/refresh' || path === '/auth/login';
  if (res.status === 401 && !isRetry && !isAuthEndpoint) {
    try {
      await doRefresh();
      return request(path, options, true); // retry đúng 1 lần sau khi refresh xong
    } catch {
      onAuthExpired?.(); // refresh cũng fail -> thật sự hết hạn, báo App.jsx quay về login
    }
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.message || `Lỗi ${res.status}`);
    error.status = res.status;
    error.conflictSeatIds = data?.conflictSeatIds || [];
    throw error;
  }
  return data;
}

export const register = (email, password, fullName) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, fullName }) });

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const logout = () => request('/auth/logout', { method: 'POST' });

export const getMe = () => request('/auth/me');

export const getSeatMap = (showtimeId) => request(`/showtimes/${showtimeId}/seats`);

export const holdSeats = (showtimeId, seatIds) =>
  request(`/showtimes/${showtimeId}/seats/hold`, { method: 'POST', body: JSON.stringify({ seatIds }) });

export const listMovies = () => request('/movies');

export const listShowtimes = (movieId) => request(`/movies/${movieId}/showtimes`);

export const createBooking = (holdId, showtimeId, totalAmount) =>
  request('/bookings', { method: 'POST', body: JSON.stringify({ holdId, showtimeId, totalAmount }) });

export const getBooking = (bookingId) => request(`/bookings/${bookingId}`);

export const cancelBooking = (bookingId) =>
  request(`/bookings/${bookingId}/cancel`, { method: 'POST' });

export const listMyBookings = (page = 0, size = 10) => request(`/bookings?page=${page}&size=${size}`);

export const adminListMovies = () => request('/movies');
export const adminCreateMovie = (data) => request('/admin/movies', { method: 'POST', body: JSON.stringify(data) });
export const adminUpdateMovie = (id, data) => request(`/admin/movies/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const adminDeleteMovie = (id) => request(`/admin/movies/${id}`, { method: 'DELETE' });

export const adminListCinemas = () => request('/admin/cinemas');
export const adminCreateCinema = (data) => request('/admin/cinemas', { method: 'POST', body: JSON.stringify(data) });
export const adminUpdateCinema = (id, data) => request(`/admin/cinemas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const adminDeleteCinema = (id) => request(`/admin/cinemas/${id}`, { method: 'DELETE' });

export const adminListRooms = (cinemaId) => request(`/admin/rooms${cinemaId ? `?cinemaId=${cinemaId}` : ''}`);
export const adminCreateRoom = (data) => request('/admin/rooms', { method: 'POST', body: JSON.stringify(data) });
export const adminUpdateRoom = (id, data) => request(`/admin/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const adminDeleteRoom = (id) => request(`/admin/rooms/${id}`, { method: 'DELETE' });

export const adminListShowtimes = () => request('/admin/showtimes');
export const adminCreateShowtime = (data) => request('/admin/showtimes', { method: 'POST', body: JSON.stringify(data) });
export const adminUpdateShowtime = (id, data) => request(`/admin/showtimes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const adminDeleteShowtime = (id) => request(`/admin/showtimes/${id}`, { method: 'DELETE' });

export const adminListUsers = () => request('/admin/users');
export const adminUpdateUserRole = (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
export const adminDeleteUser = (id) => request(`/admin/users/${id}`, { method: 'DELETE' });

export const adminGetDashboardStats = () => request('/admin/dashboard/stats');
export const adminListAllBookings = (page = 0, size = 10, status = '', search = '') =>
  request(`/admin/dashboard/bookings?page=${page}&size=${size}${status ? `&status=${status}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
export const adminCancelBooking = (bookingId) => request(`/admin/dashboard/bookings/${bookingId}/cancel`, { method: 'POST' });