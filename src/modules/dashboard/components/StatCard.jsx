export default function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} text-white rounded-xl shadow-md p-5 flex items-center justify-between`}>
      <div>
        <p className="text-sm uppercase tracking-wide opacity-80">{title}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
      <div className="text-4xl opacity-80">
        {icon}
      </div>
    </div>
  )
}