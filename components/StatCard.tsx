interface StatCardProps {
  label: string;
  value: number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 text-center p-4">
      <p className="text-xs text-blue-700 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-blue-900 mt-2">{value}</p>
    </div>
  );
}
