export default function StatsCard({ label, value, icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6
  shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_4px_6px_2px_rgba(0,0,0,0.08),0_-2px_6px_2px_rgba(0,0,0,0.04),2px_0_6px_2px_rgba(0,0,0,0.04),-2px_0_6px_2px_rgba(0,0,0,0.04)]
  hover:-translate-y-0.5
  hover:shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_6px_10px_3px_rgba(0,0,0,0.1),0_-3px_8px_2px_rgba(0,0,0,0.05),3px_0_8px_2px_rgba(0,0,0,0.05),-3px_0_8px_2px_rgba(0,0,0,0.05)]
  active:translate-y-0.5
  transition-all duration-150 cursor-default">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}