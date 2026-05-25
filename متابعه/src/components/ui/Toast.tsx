import { useApp } from '../../context/AppContext';

const icons = {
  success: 'fa-check-circle',
  error: 'fa-circle-xmark',
  info: 'fa-circle-info',
};

const colors = {
  success: '#51A3A3',
  error: '#ef4444',
  info: '#F28749',
};

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div
      className={toast.visible ? 'toast-in' : 'toast-out'}
      style={{
        position: 'fixed', bottom: '1.5rem', left: '50%',
        zIndex: 9999, pointerEvents: 'none',
      }}
    >
      <div
        className="px-5 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2 text-white"
        style={{
          background: colors[toast.type],
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        }}
      >
        <i className={`fa-solid ${icons[toast.type]}`} />
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}
