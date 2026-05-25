import { useApp } from '../context/AppContext';
import type { ViewId } from '../types';

interface NavTab {
  id: ViewId;
  icon: string;
  label: string;
}

const TABS: Record<string, NavTab[]> = {
  public: [{ id: 'query', icon: 'fa-magnifying-glass', label: 'استعلام' }],
  admin: [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'الرئيسية' },
    { id: 'students', icon: 'fa-users', label: 'الطلاب' },
    { id: 'teachers', icon: 'fa-chalkboard-user', label: 'المعلمون' },
    { id: 'subjects', icon: 'fa-book-open', label: 'المواد' },
    { id: 'query', icon: 'fa-magnifying-glass', label: 'استعلام' },
  ],
  teacher: [
    { id: 'students', icon: 'fa-users', label: 'طلابي' },
    { id: 'query', icon: 'fa-magnifying-glass', label: 'استعلام' },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'مدير النظام',
  teacher: '',
  public: 'زائر',
};

export default function Navbar() {
  const { role, teacher, currentView, setView, logout } = useApp();
  if (!role) return null;

  const tabs = TABS[role] ?? TABS.public;
  const roleLabel = role === 'teacher' ? (teacher?.name ?? 'معلم') : ROLE_LABELS[role];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Brand */}
        <div className="flex items-center gap-2 me-auto">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#F28749,#e07030)' }}
          >
            <i className="fa-solid fa-brain text-white text-sm" />
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-sm leading-none" style={{ color: '#1a1a2e' }}>Mr Brain Academy</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>{roleLabel}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={
                currentView === t.id
                  ? { background: '#F28749', color: 'white', boxShadow: '0 4px 15px rgba(242,135,73,0.4)' }
                  : { color: '#6b7280' }
              }
            >
              <i className={`fa-solid ${t.icon} text-xs`} />
              <span className="nav-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="خروج"
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:bg-red-50 hover:border-red-300"
          style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-sm" />
        </button>
      </div>
    </nav>
  );
}
