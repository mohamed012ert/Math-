import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiPost } from '../../api';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';
import type { Teacher } from '../../types';

export default function TeachersView() {
  const { data, showToast, reloadData, setLoading } = useApp();
  const [modalData, setModalData] = useState<Teacher | null | 'new'>(null);
  const [visiblePwds, setVisiblePwds] = useState<Set<number>>(new Set());

  const togglePwd = (row: number) =>
    setVisiblePwds((prev) => {
      const next = new Set(prev);
      next.has(row) ? next.delete(row) : next.add(row);
      return next;
    });

  const handleDelete = async (row: number) => {
    if (!confirm('هل تريد حذف هذا المعلم؟')) return;
    setLoading(true);
    try {
      const res = await apiPost<{ status: string; message?: string }>({ action: 'deleteTeacher', row });
      if (res.status === 'success') { showToast('تم الحذف', 'success'); await reloadData(); }
      else showToast(res.message || 'حدث خطأ', 'error');
    } catch { showToast('تعذر الاتصال بالخادم', 'error'); }
    finally { setLoading(false); }
  };

  const rows = data.teachers;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>المعلمون</h2>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>إدارة حسابات المعلمين وتوزيع المواد</p>
        </div>
        <button
          onClick={() => setModalData('new')}
          className="px-5 py-2.5 rounded-xl font-bold text-white text-sm flex items-center gap-2 hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#51A3A3,#3d8a8a)', boxShadow: '0 4px 15px rgba(81,163,163,0.3)' }}
        >
          <i className="fa-solid fa-plus" /> إضافة معلم
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          {!rows.length ? (
            <EmptyState icon="fa-chalkboard-user" title="لا يوجد معلمون" subtitle="ابدأ بإضافة معلم جديد" />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-right">#</th>
                  <th className="text-right">اسم المعلم</th>
                  <th className="text-right">المادة المُسندة</th>
                  <th className="text-right">كلمة المرور</th>
                  <th className="text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const shown = visiblePwds.has(r._row);
                  const pwLen = Math.min((r.Password || '').length, 8);
                  return (
                    <tr key={r._row}>
                      <td className="num text-gray-400">{i + 1}</td>
                      <td className="font-semibold">{r['Teacher Name']}</td>
                      <td>
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: '#fff3ea', color: '#c4621e' }}>
                          {r['Assigned Subject']}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {shown ? (
                            <span className="num font-mono text-gray-700 text-sm px-2 py-1 rounded"
                              style={{ background: '#e8f7f7' }}>
                              {r.Password}
                            </span>
                          ) : (
                            <span className="num font-mono text-gray-500 text-xs px-2 py-1 rounded select-none"
                              style={{ background: '#f5f3eb' }}>
                              {'•'.repeat(pwLen)}
                            </span>
                          )}
                          <button
                            onClick={() => togglePwd(r._row)}
                            className="text-gray-400 hover:text-teal-600 transition-colors"
                          >
                            <i className={`fa-solid ${shown ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setModalData(r)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                            style={{ background: '#e8f7f7', color: '#51A3A3' }}
                            title="تعديل"
                          >
                            <i className="fa-solid fa-pen text-xs" />
                          </button>
                          <button
                            onClick={() => handleDelete(r._row)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                            style={{ background: '#fee2e2', color: '#ef4444' }}
                            title="حذف"
                          >
                            <i className="fa-solid fa-trash text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalData !== null && (
        <TeacherModal
          teacher={modalData === 'new' ? null : modalData}
          subjects={data.subjects.map((s) => s['Subject Name'])}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
}

// ─── Teacher Modal ─────────────────────────────────────────────────────────────
interface TeacherModalProps {
  teacher: Teacher | null;
  subjects: string[];
  onClose: () => void;
}

function TeacherModal({ teacher, subjects, onClose }: TeacherModalProps) {
  const { showToast, reloadData, setLoading } = useApp();
  const [name, setName] = useState(teacher?.['Teacher Name'] ?? '');
  const [subject, setSubject] = useState(teacher?.['Assigned Subject'] ?? subjects[0] ?? '');
  const [password, setPassword] = useState(teacher?.Password ?? '');
  const [showPw, setShowPw] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !subject || !password.trim()) {
      showToast('جميع الحقول مطلوبة', 'error'); return;
    }
    setLoading(true);
    try {
      const res = await apiPost<{ status: string; message?: string }>({
        action: 'saveTeacher',
        teacherName: name.trim(),
        assignedSubject: subject,
        password: password.trim(),
        ...(teacher ? { row: teacher._row } : {}),
      });
      if (res.status === 'success') {
        showToast(teacher ? 'تم التعديل بنجاح' : 'تم الإضافة بنجاح', 'success');
        onClose();
        await reloadData();
      } else showToast(res.message || 'حدث خطأ', 'error');
    } catch { showToast('تعذر الاتصال بالخادم', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} title={teacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>اسم المعلم *</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="الاسم الكامل للمعلم"
            className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#e5e7eb' }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>المادة المُسندة *</label>
          <select
            value={subject} onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#e5e7eb' }}
          >
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {!subjects.length && (
            <p className="text-xs mt-1" style={{ color: '#ef4444' }}>أضف مادة أولاً</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>كلمة المرور *</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة مرور يختارها المعلم"
              className="w-full border rounded-xl ps-4 pe-10 py-2.5 text-sm num"
              style={{ borderColor: '#e5e7eb' }}
            />
            <button
              type="button" onClick={() => setShowPw((p) => !p)}
              className="absolute inset-y-0 left-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
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
          <i className="fa-solid fa-check me-1" />
          {teacher ? 'حفظ التعديلات' : 'إضافة المعلم'}
        </button>
      </div>
    </Modal>
  );
}
