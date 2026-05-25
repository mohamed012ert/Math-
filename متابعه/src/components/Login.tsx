import { useState } from 'react';
import { CONFIG } from '../config';
import { apiPost } from '../api';
import { useApp } from '../context/AppContext';

type Tab = 'public' | 'login';
type LoginRole = 'admin' | 'teacher';

export default function Login() {
  const { startApp } = useApp();
  const [tab, setTab] = useState<Tab>('public');
  const [role, setRole] = useState<LoginRole>('admin');
  const [adminPw, setAdminPw] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherPw, setTeacherPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (role === 'admin') {
      if (adminPw === CONFIG.ADMIN_PASSWORD) {
        setBusy(true);
        await startApp('admin', null);
        setBusy(false);
      } else {
        setError('كلمة المرور غير صحيحة.');
      }
    } else {
      if (!teacherName || !teacherPw) {
        setError('يرجى إدخال الاسم وكلمة المرور.');
        return;
      }
      try {
        setBusy(true);
        const res = await apiPost<{ status: string; message?: string; teacher?: { name: string; subject: string } }>({
          action: 'verifyTeacher',
          teacherName,
          password: teacherPw,
        });
        if (res.status === 'success' && res.teacher) {
          await startApp('teacher', res.teacher);
        } else {
          setError(res.message || 'بيانات غير صحيحة.');
        }
      } catch {
        setError('تعذر الاتصال بالخادم.');
      } finally {
        setBusy(false);
      }
    }
  };

  const enterPublic = async () => {
    setBusy(true);
    await startApp('public', null);
    setBusy(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full"
        style={{ background: 'rgba(242,135,73,0.12)' }} />
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full"
        style={{ background: 'rgba(81,163,163,0.12)' }} />

      <div
        className="bg-white rounded-[2rem] p-10 w-[92%] relative z-10"
        style={{ maxWidth: 440, boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-3"
            style={{ background: 'linear-gradient(135deg,#F28749,#e07030)' }}
          >
            <i className="fa-solid fa-brain text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Mr Brain Academy</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>نظام إدارة التعلم</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-5" style={{ background: '#f5f3eb' }}>
          {(['public', 'login'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={tab === t
                ? { background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', color: '#1a1a2e' }
                : { color: '#6b7280' }
              }
            >
              {t === 'public'
                ? <><i className="fa-solid fa-magnifying-glass me-1" /> استعلام الطالب</>
                : <><i className="fa-solid fa-lock me-1" /> تسجيل الدخول</>
              }
            </button>
          ))}
        </div>

        {/* Public Panel */}
        {tab === 'public' && (
          <div>
            <p className="text-sm text-center mb-4" style={{ color: '#6b7280' }}>
              يمكنك الاستعلام عن أداء الطالب بدون تسجيل دخول.
            </p>
            <button
              onClick={enterPublic}
              disabled={busy}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#51A3A3,#3d8a8a)', boxShadow: '0 4px 15px rgba(81,163,163,0.35)' }}
            >
              {busy
                ? <><i className="fa-solid fa-circle-notch fa-spin me-2" />جاري الدخول...</>
                : <><i className="fa-solid fa-arrow-left me-2" />الدخول كـ زائر</>
              }
            </button>
          </div>
        )}

        {/* Login Panel */}
        {tab === 'login' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>نوع الحساب</label>
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value as LoginRole); setError(''); }}
                className="w-full border rounded-xl px-4 py-2.5 text-sm"
                style={{ borderColor: '#e5e7eb' }}
              >
                <option value="admin">مدير النظام (Admin)</option>
                <option value="teacher">معلم (Teacher)</option>
              </select>
            </div>

            {role === 'admin' && (
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>كلمة المرور</label>
                <input
                  type="password"
                  value={adminPw}
                  onChange={(e) => setAdminPw(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="أدخل كلمة مرور المدير"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm"
                  style={{ borderColor: '#e5e7eb' }}
                />
              </div>
            )}

            {role === 'teacher' && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>اسم المعلم</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="الاسم كما أنشأه الأدمن"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm"
                    style={{ borderColor: '#e5e7eb' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={teacherPw}
                      onChange={(e) => setTeacherPw(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="كلمة المرور"
                      className="w-full border rounded-xl ps-4 pe-10 py-2.5 text-sm"
                      style={{ borderColor: '#e5e7eb' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute inset-y-0 left-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={busy}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#F28749,#e07030)', boxShadow: '0 4px 15px rgba(242,135,73,0.35)' }}
            >
              {busy
                ? <><i className="fa-solid fa-circle-notch fa-spin me-2" />جاري الدخول...</>
                : <><i className="fa-solid fa-right-to-bracket me-2" />دخول</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
