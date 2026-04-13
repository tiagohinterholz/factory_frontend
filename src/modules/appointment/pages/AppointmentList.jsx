import { useAppointment } from "../hooks/useAppointment"
import ListHeader from "@/modules/core/components/ListHeader"
import ListGrid from "@/modules/core/components/ListGrid"
import ListCard from "@/modules/core/components/ListCard"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function AppointmentList() {
  const { 
    appointments, 
    totalItems, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage 
  } = useAppointment()

  const itemsPerPage = 10
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="p-6 space-y-6">
      <ListHeader
        title='Agendamentos'
        buttonText='Novo Agendamento'
        buttonLink='/agendamentos/novo'
      />

      <div className='relative max-w-md'>
        <span className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search className='h-5 w-5 text-slate-400' />
        </span>
        <input 
          type='text' 
          className='input-premium pl-10' 
          placeholder='Pesquisar agendamentos...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>
      
      {loading && appointments.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl border border-slate-50" />
          ))}
        </div>
      ) : appointments.length > 0 ? (
        <>
          <ListGrid>
            {appointments.map((appointment) => (
              <ListCard
                key={appointment.id}
                to={`/agendamentos/${appointment.id}`}
                title={appointment.client?.name || "Cliente não informado"}
                subtitle={`${appointment.date} às ${appointment.time}`}
              />
            ))}
          </ListGrid>

          {totalPages > 1 && (
            <div className='flex items-center justify-between pt-4'>
              <div className='text-sm text-slate-500'>
                  Mostrando <span className='font-medium'>{((currentPage - 1) * itemsPerPage) + 1}</span> a <span className='font-medium'>{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className='font-medium'>{totalItems}</span>
              </div>
              <div className='flex gap-2 text-slate-600'>
                <button 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors'
                >
                  <ChevronLeft size={20}/>
                </button>
                <span className='flex items-center px-4 text-sm font-bold'>
                    {currentPage} / {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className='p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors'
                >
                  <ChevronRight size={20}/>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-dotted border-slate-300 p-12 text-center">
          <p className="text-slate-400 font-medium">Nenhum agendamento encontrado.</p>
        </div>
      )}
    </div>
  )
}
