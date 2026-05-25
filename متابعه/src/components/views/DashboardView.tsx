import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';

export default function DashboardView() {
  const { data } = useApp();
  const { students, subjects, teachers } = data;

  const stats = useMemo(() => {
    const uniqueNames = new Set(students.map((s) => s.Name)).size;
    const totalAbsences = students.reduce((a, r) => a + (Number(r.Absence) || 0), 0);
    return [
      { label: 'طلاب فريدون', value: uniqueNames, icon: 'fa-user-graduate', bg: '#fff3ea', color: '#F28749' },
      { label: 'مواد دراسية', value: subjects.length, icon: 'fa-book-open', bg: '#e8f7f7', color: '#51A3A3' },
      { label: 'معلمون', value: teachers.length, icon: 'fa-chalkboard-user', bg: '#eef2ff', color: '#4338ca' },
      { label: 'إجمالي الغياب', value: totalAbsences, icon: 'fa-calendar-xmark', bg: '#fee2e2', color: '#ef4444' },
    ];
  }, [students, subjects, teachers]);

  const topStudents = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((r) => {
      map[r.Name] = (map[r.Name] || 0) + (Number(r.Points) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [students]);

  const attnStudents = useMemo(() =>
    students.filter((r) => (Number(r.Absence) || 0) >= 4)
      .sort((a, b) => Number(b.Absence) - Number(a.Absence))
      .slice(0, 5),
    [students]
  );

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>لوحة التحكم</h2>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>نظرة عامة على أداء الأكاديمية</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((st) => (
          <div
            key={st.label}
            className="bg-white rounded-[1.25rem] p-5 flex items-center gap-4"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: st.bg }}
            >
              <i className={`fa-solid ${st.icon}`} style={{ color: st.color }} />
            </div>
            <div>
              <p className="num text-2xl font-bold" style={{ color: '#1a1a2e' }}>{st.value}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>{st.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Students */}
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
            <i className="fa-solid fa-ranking-star" style={{ color: '#F28749' }} />
            أعلى الطلاب نقاطاً
          </h3>
          {topStudents.length ? (
            topStudents.map(([name, pts], i) => (
              <div
                key={name}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: '#f0f0e8' }}
              >
                <span className="text-sm font-semibold">{medals[i]} {name}</span>
                <span
                  className="num inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: '#e8f7f7', color: '#2d7a7a' }}
                >
                  {pts} نقطة
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-center py-4" style={{ color: '#6b7280' }}>لا توجد بيانات بعد</p>
          )}
        </div>

        {/* Attention Students */}
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1a1a2e' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }} />
            طلاب يحتاجون متابعة
          </h3>
          {attnStudents.length ? (
            attnStudents.map((r) => (
              <div
                key={`${r.Name}-${r.Subject}`}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: '#f0f0e8' }}
              >
                <div>
                  <span className="text-sm font-semibold">{r.Name}</span>
                  <span className="text-xs ms-2" style={{ color: '#6b7280' }}>{r.Subject}</span>
                </div>
                <span className="num inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                  {r.Absence} غياب
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-center py-4" style={{ color: '#6b7280' }}>لا يوجد طلاب في خطر</p>
          )}
        </div>
      </div>
    </div>
  );
}
