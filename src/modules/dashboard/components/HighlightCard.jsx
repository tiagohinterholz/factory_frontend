export default function HighlightCard({ title, icon, colorBar, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 flex flex-col justify-between"
         style={{ borderLeftWidth: '4px' }}>
      <div className={`flex items-center gap-2 ${colorBar.replace("border-", "text-")}`}>
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )
}