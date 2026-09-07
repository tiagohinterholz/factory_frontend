import { useAppointment } from "../hooks/useAppointment"
import AppointmentCalendar from "../components/AppointmentCalendar"

export default function AppointmentList() {
  const { appointments, loading } = useAppointment()

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Agendamentos</h1>
        <p className="text-slate-500 font-medium">Gerencie seus compromissos e horários</p>
      </div>

      <AppointmentCalendar appointments={appointments} loading={loading} />

      {loading && appointments.length === 0 && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      )}

      {appointments.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-dotted border-slate-300 p-12 text-center">
          <p className="text-slate-400 font-medium">Nenhum agendamento encontrado.</p>
        </div>
      )}
    </div>
  )
}
