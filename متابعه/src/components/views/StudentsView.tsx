import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiPost } from '../../api';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';
import type { Student } from '../../types';

export default function StudentsView() {
  const { data, role, teacher, showToast, reloadData, setLoading } = useApp();
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [searchName, setSearchName] = useState('');
  const [modalData, setModalData] = useState<Student | null | 'new'>(null);

  const grades = useMemo(
    () => [...new Set(data.students.map((s) => s.Grade).filter(Boolean))].sort(),
    [data.students]
  );
  const subjects = useMemo(
    () => [...new Set(data.students.map((s) => s.Subject).filter(Boolean))].sort(),
    [data.students]
  );

  const filtered = useMemo(() => {
    let rows = data.students;
    if (role === 'teacher' && teacher) {
      const assigned = teacher.subject.split(',').map((s) => s.trim().toLowerCase());
      rows = rows.filter((r) => assigned.includes((r.Subject || '').trim().toLowerCase()));
    }
    if (filterGrade) rows = rows.filter((r) => r.Grade === filterGrade);
    if (filterSubject) rows = rows.filter((r) => r.Subject === filterSubject);
    if (searchName) rows = rows.filter((r) => (r.Name || '').toLowerCase().includes(searchName.toLowerCase()));
    return rows;
  }, [data.students, role, teacher, filterGrade, filterSubject, searchName]);

  const handleDelete = async (row: number) => {
    if (!confirm('هل تريد حذف هذا الطالب؟')) return;
    setLoading(true);
    try {
      const res = await apiPost<{ status: string; message?: string }>({ action: 'deleteStudent', row });
      if (res.status === 'success') {
        showToast('تم الحذف بنجاح', 'success');
        await reloadData();
      } else showToast(res.message || 'حدث خطأ', 'error');
    } catch { showToast('تعذر الاتصال بالخادم', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>
            {role === 'teacher' ? 'طلابي' : 'الطلاب'}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            {role === 'teacher' && teacher ? `مادة: ${teacher.subject}` : 'جميع الطلاب'}
          </p>
        </div>
        <button
          onClick={() => setModalData('new')}
          className="px-5 py-2.5 rounded-xl font-bold text-white text-sm flex items-center gap-2 hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#F28749,#e07030)', boxShadow: '0 4px 15px rgba(242,135,73,0.3)' }}
        >
          <i className="fa-solid fa-plus" /> إضافة طالب
        </button>
      </div>

      {/* Filters */}
      <div
        className="bg-white rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold" style={{ color: '#374151' }}>الصف:</label>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
            style={{ borderColor: '#e5e7eb' }}
          >
            <option value="">الكل</option>
            {grades.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        {role !== 'teacher' && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold" style={{ color: '#374151' }}>المادة:</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
              style={{ borderColor: '#e5e7eb' }}
            >
              <option value="">الكل</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className="ms-auto">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="بحث بالاسم..."
            className="border rounded-lg px-3 py-1.5 text-sm"
            style={{ borderColor: '#e5e7eb', minWidth: 180 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState icon="fa-users" title="لا يوجد طلاب مسجلون" subtitle="ابدأ بإضافة طالب جديد" />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-right">#</th>
                  <th className="text-right">الاسم</th>
                  <th className="text-right">الصف</th>
                  <th className="text-right">المادة</th>
                  <th className="text-right">الغياب</th>
                  <th className="text-right">بدون واجب</th>
                  <th className="text-right">النقاط</th>
                  <th className="text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const abs = Number(r.Absence) || 0;
                  const nohw = Number(r.NoHomework) || 0;
                  return (
                    <tr key={`${r._row}-${r.Subject}`}>
                      <td className="num text-gray-400">{i + 1}</td>
                      <td className="font-semibold">{r.Name}</td>
                      <td>{r.Grade}</td>
                      <td>
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: '#e8f7f7', color: '#2d7a7a' }}>
                          {r.Subject}
                        </span>
                      </td>
                      <td>
                        <span className={`num inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${abs > 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                          {abs}
                        </span>
                      </td>
                      <td>
                        <span className={`num inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${nohw > 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                          {nohw}
                        </span>
                      </td>
                      <td>
                        <span className="num font-bold" style={{ color: '#51A3A3' }}>{r.Points || 0}</span>
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

      {/* Modal */}
      {modalData !== null && (
        <StudentModal
          student={modalData === 'new' ? null : modalData}
          subjects={data.subjects.map((s) => s['Subject Name'])}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
}

// ─── Student Modal ─────────────────────────────────────────────────────────────
interface StudentModalProps {
  student: Student | null;
  subjects: string[];
  onClose: () => void;
}

function StudentModal({ student, subjects, onClose }: StudentModalProps) {
  const { showToast, reloadData, setLoading } = useApp();
  const isEdit = !!student;

  const [name, setName] = useState(student?.Name ?? '');
  const [grade, setGrade] = useState(student?.Grade ?? '');
  const [absence, setAbsence] = useState(String(student?.Absence ?? 0));
  const [noHw, setNoHw] = useState(String(student?.NoHomework ?? 0));
  const [points, setPoints] = useState(String(student?.Points ?? 0));
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());

  const toggleSubject = (s: string) =>
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });

  const handleSave = async () => {
    if (!name.trim()) { showToast('اسم الطالب مطلوب', 'error'); return; }
    if (!isEdit && selectedSubjects.size === 0) { showToast('اختر مادة واحدة على الأقل', 'error'); return; }

    setLoading(true);
    try {
      const base = { name: name.trim(), grade: grade.trim(), absence, noHomework: noHw, points };
      let res: { status: string; message?: string };
      if (isEdit) {
        res = await apiPost({
          action: 'updateStudent', row: student!._row,
          subject: student!.Subject, ...base,
        });
      } else {
        res = await apiPost({
          action: 'saveStudent',
          subjects: JSON.stringify([...selectedSubjects]),
          ...base,
        });
      }
      if (res.status === 'success') {
        showToast(isEdit ? 'تم التعديل بنجاح' : 'تم الإضافة بنجاح', 'success');
        onClose();
        await reloadData();
      } else showToast(res.message || 'حدث خطأ', 'error');
    } catch { showToast('تعذر الاتصال بالخادم', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
    >
      <div className="space-y-4">
        <Field label="اسم الطالب *">
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="اسم الطالب كاملاً"
            className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#e5e7eb' }}
          />
        </Field>

        <Field label="الصف">
          <input
            type="text" value={grade} onChange={(e) => setGrade(e.target.value)}
            placeholder="مثال: أول إعدادي"
            className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#e5e7eb' }}
          />
        </Field>

        {!isEdit ? (
          <Field label="المواد الدراسية *" hint="اختر مادة أو أكثر">
            {subjects.length ? (
              <div className="subject-checkbox-grid">
                {subjects.map((s) => (
                  <label key={s} className="subject-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.has(s)}
                      onChange={() => toggleSubject(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm p-3 rounded-xl text-center" style={{ background: '#fef3c7', color: '#92400e' }}>
                <i className="fa-solid fa-triangle-exclamation me-1" />
                لا توجد مواد. أضف مادة أولاً من قسم "المواد".
              </p>
            )}
          </Field>
        ) : (
          <Field label="المادة">
            <input
              type="text" value={student?.Subject ?? ''} readOnly
              className="w-full border rounded-xl px-4 py-2.5 text-sm bg-gray-50"
              style={{ borderColor: '#e5e7eb' }}
            />
          </Field>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Field label="الغياب">
            <input type="number" min="0" value={absence} onChange={(e) => setAbsence(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm num" style={{ borderColor: '#e5e7eb' }} />
          </Field>
          <Field label="بدون واجب">
            <input type="number" min="0" value={noHw} onChange={(e) => setNoHw(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm num" style={{ borderColor: '#e5e7eb' }} />
          </Field>
          <Field label="النقاط">
            <input type="number" min="0" value={points} onChange={(e) => setPoints(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm num" style={{ borderColor: '#e5e7eb' }} />
          </Field>
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
          style={{ background: 'linear-gradient(135deg,#F28749,#e07030)' }}
        >
          <i className="fa-solid fa-check me-1" />
          {isEdit ? 'حفظ التعديلات' : 'إضافة الطالب'}
        </button>
      </div>
    </Modal>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
        {label}
        {hint && <span className="text-xs font-normal ms-1" style={{ color: '#6b7280' }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}
