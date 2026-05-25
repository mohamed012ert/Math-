interface Props {
  icon: string;
  title: string;
  subtitle: string;
}
export default function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: '#f5f3eb' }}
      >
        <i className={`fa-solid ${icon} text-2xl`} style={{ color: '#d1cfc4' }} />
      </div>
      <p className="font-bold mb-1" style={{ color: '#9ca3af' }}>{title}</p>
      <p className="text-sm" style={{ color: '#d1d5db' }}>{subtitle}</p>
    </div>
  );
}
