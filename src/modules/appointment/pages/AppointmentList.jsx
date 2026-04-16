import { useAppointment } from "../hooks/useAppointment"
import AppointmentCalendar from "../components/AppointmentCalendar"
import { Search } from "lucide-react"

export default function AppointmentList() {
  const { 
    appointments, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    setCurrentPage 
  } = useAppointment()

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Agendamentos</h1>
          <p className="text-slate-500 font-medium">Gerencie seus compromissos e horários</p>
        </div>
        
        <div className='relative max-w-md w-full'>
          <span className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <Search className='h-5 w-5 text-slate-400' />
          </span>
          <input 
            type='text' 
            className='input-premium pl-10 w-full' 
            placeholder='Pesquisar agendamentos...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>
      
      <AppointmentCalendar 
        appointments={appointments} 
        loading={loading} 
      />
      
      {loading && appointments.length === 0 && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {appointments.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-dotted border-slate-300 p-12 text-center">
          <p className="text-slate-400 font-medium">Nenhum agendamento encontrado para esta pesquisa.</p>
        </div>
      )}
    </div>
  )
}
