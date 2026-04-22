import { useEffect, useState, useCallback } from "react"
import { AppointmentService } from "@/modules/appointment/services/appointment"

export function useAppointment() {
  const [appointments, setAppointments] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const load = useCallback(async (search='', page=1) => {
    setLoading(true)
    try {
      const response = await AppointmentService.getAppointment({ search, page })
      if (Array.isArray(response)) {
        setAppointments({ results: response, count: response.length })
      } else if (response && response.results) {
        setAppointments(response)
      } else {
        setAppointments({ results: [], count: 0 })
      }
    } catch (error) {
      console.error('Erro ao carregar Agendamentos:', error)
      setAppointments({ results: [], count: 0 })
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    const handler = setTimeout(() => {
      load(searchTerm, currentPage)
    }, 300)

    return () => clearTimeout(handler)
  }, [searchTerm, currentPage, load])

  return { 
    appointments: appointments?.results || [], 
    totalItems: appointments?.count || 0, 
    loading,
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage 
  }
}
