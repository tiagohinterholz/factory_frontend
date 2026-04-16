import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, User } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AppointmentCalendar({ appointments, loading }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }, [currentDate])

  const hours = Array.from({ length: 14 }).map((_, i) => i + 7) // 7h até 20h

  const nextWeek = () => {
    const next = new Date(currentDate)
    next.setDate(currentDate.getDate() + 7)
    setCurrentDate(next)
  }

  const prevWeek = () => {
    const prev = new Date(currentDate)
    prev.setDate(currentDate.getDate() - 7)
    setCurrentDate(prev)
  }

  const today = () => {
    setCurrentDate(new Date())
  }

  const formatMonth = (date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  const isToday = (date) => {
    const now = new Date()
    return date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
  }

  const getAppointmentsForDay = (date) => {
    return appointments.filter(app => {
      const appDate = new Date(app.date + 'T00:00:00')
      return appDate.getDate() === date.getDate() &&
        appDate.getMonth() === date.getMonth() &&
        appDate.getFullYear() === date.getFullYear()
    })
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {formatMonth(currentDate)}
          </h2>
          <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            <button onClick={prevWeek} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={today} className="px-3 py-1.5 text-xs font-bold hover:bg-slate-50 rounded-lg text-slate-600 transition-colors">
              Hoje
            </button>
            <button onClick={nextWeek} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        <Link 
          to="/agendamentos/novo" 
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus size={18} />
          <span>Novo Agendamento</span>
        </Link>
      </div>

      {/* Grid */}
      <div className="relative overflow-x-auto">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="text-slate-500 font-bold text-sm">Atualizando...</p>
            </div>
          </div>
        )}
        <div className="min-w-[800px]">
          {/* Days labels */}
          <div className="grid grid-cols-8 border-b border-slate-100 bg-white">
            <div className="p-4 border-r border-slate-50"></div>
            {weekDays.map((date, i) => (
              <div key={i} className={`p-4 text-center border-r border-slate-50 last:border-r-0 ${isToday(date) ? 'bg-indigo-50/30' : ''}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${isToday(date) ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </p>
                <p className={`text-2xl font-black mt-1 ${isToday(date) ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {date.getDate()}
                </p>
                {isToday(date) && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-auto mt-1"></div>}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="relative h-[700px] overflow-y-auto">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 min-h-[60px] border-b border-slate-50 group">
                <div className="p-2 text-right text-[10px] font-bold text-slate-400 border-r border-slate-50">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map((date, i) => (
                  <div key={i} className={`relative border-r border-slate-50 last:border-r-0 group-hover:bg-slate-50/30 transition-colors ${isToday(date) ? 'bg-indigo-50/10' : ''}`}>
                    {/* Appointments for this day and hour */}
                    {getAppointmentsForDay(date)
                      .filter(app => parseInt(app.time.split(':')[0]) === hour)
                      .map((app) => (
                        <Link
                          key={app.id}
                          to={`/agendamentos/${app.id}`}
                          className="absolute inset-x-1 top-1 bottom-1 bg-white border-l-4 border-indigo-500 rounded-lg shadow-md p-2 hover:shadow-indigo-100 hover:scale-[1.02] transition-all z-10 group/item flex flex-col justify-between overflow-hidden"
                        >
                          <div>
                            <p className="text-[10px] font-black text-indigo-600 truncate uppercase flex items-center gap-1">
                              <User size={10} />
                              {app.client?.first_name || 'Cliente'}
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <Clock size={10} />
                              {app.time}
                            </p>
                          </div>
                          <div className="w-full h-1 bg-indigo-100 rounded-full mt-1 overflow-hidden">
                             <div className="h-full bg-indigo-500 w-full animate-pulse-slow"></div>
                          </div>
                        </Link>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
