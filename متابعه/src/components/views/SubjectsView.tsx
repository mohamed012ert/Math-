import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiPost } from '../../api';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';

const SUBJECT_COLORS = [
  { bg: '#e8f7f7', text: '#2d7a7a', icon: 'fa-atom' },
  { bg: '#fff3ea', text: '#c4621e', icon: 'fa-calculator' },
  { bg: '#eef2ff', text: '#4338ca', icon: 'fa-language' },
  { bg: '#fdf2f8', text: '#9d174d', icon: 'fa-flask' },
  { bg: '#f0fdf4', text: '#166534', icon: 'fa-globe' },
  { bg: '#fffbeb', text: '#92400e', icon: 'fa-landmark' },
  { bg: '#f0f4ff', text: '#1e40af', icon: 'fa-book' },
  { bg: '#fff1f2', text: '#be123c', icon: 'fa-music' },
];

export default function SubjectsView() {
  const { data, showToast, reloadData, setLoading } = useApp();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async (row: number) => {
    if (!confirm('هل تريد حذف هذه المادة؟')) return;
    setLoading(true);
    try {
      const res = await apiPost<{ status: string; message?: string }>({ action: 'deleteSubject', row });
      if (res.status === 'success') { showToast('تم الحذف', 'success'); await reloadData(); }
      else showToast(res.message || 'حدث خطأ', 'error');
    } catch { showToast('تعذر الاتصال بالخادم', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>المواد الدراسية</h2>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>إدارة المواد المتاحة في الأكاديمية</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-white text-sm flex items-center gap-2 hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#51A3A3,#3d8a8a)', boxShadow: '0 4px 15px rgba(81,163,163,0.3)' }}
        >
          <i className="fa-solid fa-plus" /> إضافة مادة
        </button>
      </div>

      {!data.subjects.length ? (
        <EmptyState icon="fa-book-open" title="لا توجد مواد دراسية" subtitle="ابدأ بإضافة مادة جديدة" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.subjects.map((r, i) => {
            const c = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
            const count = data.students.filter((s) => s.Subject === r['Subject Name']).length;
            return (
              <div
                key={r._row}
                className="bg-white rounded-2xl p-5 flex flex-col gap-3 animate-fade-in"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: c.bg }}
                  >
                    <i className={`fa-solid ${c.icon} text-lg`} style={{ color: c.text }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{r['Subject Name']}</p>
                    <p className="text-xs num" style={{ color: '#6b7280' }}>{count} طالب</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r._row)}
                  className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: '#fee2e2', color: '#ef4444' }}
                >
                  <i className="fa-solid fa-trash me-1" /> حذف
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <AddSubjectModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function AddSubjectModal({ onClose }: { onClose: () => void }) {
  const { showToast, reloadData, setLoading } = useApp();
  const [name, setName] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { showToast('اسم المادة مطلوب', 'error'); return; }
    setLoading(true);
    try {
      const res = await apiPost<{ status: string; message?: string }>({
        action: 'saveSubject', subjectName: name.trim(),
      });
      if (res.status === 'success') {
        showToast(res.message || 'تمت الإضافة', 'success');
        onClose();
        await reloadData();
      } else showToast(res.message || 'حدث خطأ', 'error');
    } catch { showToast('تعذر الاتصال بالخادم', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} title="إضافة مادة دراسية" maxWidth="380px">
      <div className="mb-5">
        <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>اسم المادة *</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="مثال: الرياضيات، اللغة العربية..."
          className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#e5e7eb' }}
          autoFocus
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
          style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
        >إلغاء</button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#51A3A3,#3d8a8a)' }}
        >
          <i className="fa-solid fa-plus me-1" /> إضافة
        </button>
      </div>
    </Modal>
  );
}
