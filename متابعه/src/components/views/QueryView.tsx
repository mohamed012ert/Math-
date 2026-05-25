import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchAllData } from '../../api';
import EmptyState from '../ui/EmptyState';
import type { Student } from '../../types';

interface GroupedStudent {
  grade: string;
  subjects: Student[];
}

export default function QueryView() {
  const { setLoading, data } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Record<string, GroupedStudent> | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    setLoading(true);
    // Refresh data on every search for freshest results
    const fresh = await fetchAllData();
    setLoading(false);

    const matches = fresh.students.filter((r) =>
      (r.Name || '').toLowerCase().includes(q)
    );
    setSearched(true);

    if (!matches.length) { setResults({}); return; }

    const grouped: Record<string, GroupedStudent> = {};
    matches.forEach((r) => {
      if (!grouped[r.Name]) grouped[r.Name] = { grade: r.Grade, subjects: [] };
      grouped[r.Name].subjects.push(r);
    });
    setResults(grouped);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>استعلام عن الطالب</h2>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>ابحث باسم الطالب لعرض تقرير أداءه الكامل</p>
      </div>

      <div className="bg-white rounded-3xl p-6 mb-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="اكتب اسم الطالب..."
            className="flex-1 border rounded-xl px-4 py-3"
            style={{ borderColor: '#e5e7eb', fontSize: '.95rem' }}
          />
          <button
            onClick={search}
            className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#F28749,#e07030)', boxShadow: '0 4px 15px rgba(242,135,73,0.3)' }}
          >
            <i className="fa-solid fa-search me-1" /> بحث
          </button>
        </div>
      </div>

      {/* Results */}
      {results !== null && (
        Object.keys(results).length === 0 ? (
          <EmptyState icon="fa-user-xmark" title="لم يُعثر على طالب" subtitle="تأكد من الاسم وحاول مرة أخرى" />
        ) : (
          Object.entries(results).map(([name, info]) => (
            <StudentCard key={name} name={name} info={info} />
          ))
        )
      )}

      {!searched && data.students.length === 0 && (
        <div className="text-center py-12">
          <i className="fa-solid fa-magnifying-glass text-4xl mb-3 block" style={{ color: '#d1cfc4' }} />
          <p className="text-sm" style={{ color: '#9ca3af' }}>ابحث عن طالب لعرض بياناته</p>
        </div>
      )}
    </div>
  );
}

function StudentCard({ name, info }: { name: string; info: GroupedStudent }) {
  return (
    <div className="bg-white rounded-3xl p-6 mb-4 animate-fade-in" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#F28749,#e07030)' }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#1a1a2e' }}>{name}</h3>
          <p className="text-sm" style={{ color: '#6b7280' }}>الصف: {info.grade}</p>
        </div>
        <span
          className="ms-auto num inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: '#f0f0e8', color: '#6b7280' }}
        >
          {info.subjects.length} {info.subjects.length === 1 ? 'مادة' : 'مواد'}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {info.subjects.map((subj) => {
          const abs = Number(subj.Absence) || 0;
          const nohw = Number(subj.NoHomework) || 0;
          const pts = Number(subj.Points) || 0;
          const absColor = abs === 0 ? '#d1fae5' : abs <= 2 ? '#fef3c7' : '#fee2e2';
          const absText = abs === 0 ? '#065f46' : abs <= 2 ? '#92400e' : '#991b1b';
          const absLabel = abs === 0 ? 'لا غياب ✓' : `${abs} أيام`;

          return (
            <div key={subj.Subject} className="score-band">
              <p className="font-bold text-sm mb-3" style={{ color: '#1a1a2e' }}>{subj.Subject}</p>
              <div className="grid grid-cols-3 gap-2">
                <Metric value={absLabel} label="الغياب" bg={absColor} color={absText} />
                <Metric
                  value={String(nohw)} label="بدون واجب"
                  bg={nohw > 2 ? '#fee2e2' : '#f5f3eb'}
                  color={nohw > 2 ? '#991b1b' : '#1a1a2e'}
                />
                <Metric value={String(pts)} label="النقاط" bg="#e8f7f7" color="#2d7a7a" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ value, label, bg, color }: { value: string; label: string; bg: string; color: string }) {
  return (
    <div className="text-center p-2 rounded-xl" style={{ background: bg }}>
      <p className="num font-bold text-lg leading-tight" style={{ color }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color }}>{label}</p>
    </div>
  );
}
