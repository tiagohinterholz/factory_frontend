import { useEffect, useState, useCallback } from "react"
import { getCities } from "@/modules/location/city/services/city"
import { getCitiesByState } from "@/modules/location/state/services/state"

export function useCities() {
  const [data, setData] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const load = useCallback(async (search = '', page = 1) => {
    setLoading(true)
    try {
      const response = await getCities({ search, page })
      if (Array.isArray(response)) {
        setData({ results: response, count: response.length })
      } else if (response && response.results) {
        setData(response)
      } else {
        setData({ results: [], count: 0 })
      }
    } catch (error) {
      console.error('Erro ao carregar cidades:', error)
      setData({ results: [], count: 0 })
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
    cities: data?.results || [], 
    totalItems: data?.count || 0,
    loading, 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage 
  }
}

export function useCitiesByState(stateId) {
  const [citiesByState, setCitiesByState] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!stateId) return

    async function load() {
      setLoading(true)
      try {
        const response = await getCitiesByState(stateId)
        const citiesArray = Array.isArray(response) 
          ? response 
          : response?.results || []
          
        const sorted = [...citiesArray].sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        )
        setCitiesByState(sorted)
      } catch (error) {
        console.error('Erro ao carregar cidades por estado:', error)
        setCitiesByState([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [stateId])

  return { citiesByState, loading }
}