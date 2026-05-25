export default function Loader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: 'rgba(250,248,240,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="animate-spin-custom mb-4 rounded-full"
        style={{
          width: 50, height: 50,
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #51A3A3',
        }}
      />
      <p className="text-sm font-semibold text-gray-500 animate-pulse">جاري تحميل البيانات...</p>
    </div>
  );
}
