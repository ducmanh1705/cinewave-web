const fs = require('fs');

const path = './src/pages/AdminPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Also inject imports for Recharts and Lucide at the top if they are missing
if (!content.includes('lucide-react')) {
  content = content.replace(
    'import { useNavigate } from "react-router-dom";',
    'import { useNavigate } from "react-router-dom";\nimport { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";\nimport { Users, Film, Ticket, DollarSign, Calendar, TrendingUp } from "lucide-react";'
  );
}

const newDashboardTab = `function DashboardTab() {
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
      case "CANCELLED": return "Đã hủy";
      case "EXPIRED": return "Hết hạn";
      default: return status;
    }
  }

  function getStatusStyle(status) {
    const baseClass = "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ";
    switch (status) {
      case "CONFIRMED": return baseClass + "bg-emerald-500/15 text-emerald-500";
      case "PENDING": return baseClass + "bg-amber-500/15 text-amber-500";
      case "CANCELLED": return baseClass + "bg-red-500/15 text-red-500";
      default: return baseClass + "bg-slate-500/15 text-slate-400";
    }
  }

  // Dummy chart data since backend doesn't provide it yet
  const chartData = [
    { name: "T2", revenue: 4000000 },
    { name: "T3", revenue: 3000000 },
    { name: "T4", revenue: 2000000 },
    { name: "T5", revenue: 2780000 },
    { name: "T6", revenue: 1890000 },
    { name: "T7", revenue: 2390000 },
    { name: "CN", revenue: 3490000 },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-brand-surface border border-white/5 rounded-xl p-5 shadow-lg flex items-center justify-between transition-transform hover:-translate-y-1">
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</p>
        <p className="text-white text-3xl font-bold">{value}</p>
      </div>
      <div className={\`p-4 rounded-full \${colorClass}\`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng doanh thu" 
          value={formatPrice(stats?.totalRevenue)} 
          icon={DollarSign}
          colorClass="bg-blue-500/10 text-blue-500"
        />
        <StatCard 
          title="Tổng vé đặt" 
          value={stats?.totalBookings || 0} 
          icon={Ticket}
          colorClass="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard 
          title="Thành viên" 
          value={stats?.totalUsers || 0} 
          icon={Users}
          colorClass="bg-purple-500/10 text-purple-500"
        />
        <StatCard 
          title="Phim chiếu" 
          value={stats?.totalMovies || 0} 
          icon={Film}
          colorClass="bg-amber-500/10 text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-brand-surface border border-white/5 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <TrendingUp className="text-brand-primary" />
            <h3 className="text-lg font-bold text-white">Doanh thu tuần này</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickFormatter={(value) => \`\${value / 1000000}M\`} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#172033', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#00e5ff', fontWeight: 'bold' }}
                  formatter={(value) => formatPrice(value)}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings Section */}
        <div className="bg-brand-surface border border-white/5 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-brand-accent" />
              <h3 className="text-lg font-bold text-white">Giao dịch mới</h3>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {recentBookings.map(b => (
              <div key={b.id} className="flex flex-col gap-2 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-brand-primary/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-white">{b.userFullName}</div>
                  <span className={getStatusStyle(b.status)}>{getStatusLabel(b.status)}</span>
                </div>
                <div className="text-sm text-gray-400">{b.movieTitle}</div>
                <div className="flex justify-between items-center mt-1 pt-2 border-t border-white/5">
                  <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-gray-300">
                    {b.paymentCode || \`#\${b.id}\`}
                  </span>
                  <span className="font-bold text-brand-primary">{formatPrice(b.totalAmount)}</span>
                </div>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <div className="text-center text-gray-500 py-8">Chưa có giao dịch nào gần đây.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}`;

content = content.replace(/function DashboardTab\(\) \{[\s\S]*?\n\}\n\n\/\/ ---------- Bookings Management/, newDashboardTab + '\n\n// ---------- Bookings Management');

fs.writeFileSync(path, content);
console.log('Dashboard replaced!');
