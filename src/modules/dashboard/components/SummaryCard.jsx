export default function SummaryCard({ title, value, icon, color }) {
  return (
    <div className={`flex items-center gap-4 bg-white rounded-xl shadow-sm p-4`}>
      <div className={`w-10 h-10 flex items-center justify-center rounded-full ${color} text-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  )
}