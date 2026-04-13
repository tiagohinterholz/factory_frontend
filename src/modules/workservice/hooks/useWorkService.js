import { useEffect, useState, useCallback } from 'react'
import { getWorkService } from '@/modules/workservice/services/workservice'

export function useWorkService() {
  const [data, setData] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const load = useCallback(async (search = '', page = 1) => {
    setLoading(true)
    try {
      const response = await getWorkService({ search, page })
      if (Array.isArray(response)) {
        setData({ results: response, count: response.length })
      } else if (response && response.results) {
        setData(response)
      } else {
        setData({ results: [], count: 0 })
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
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
    workservice: data?.results || [], 
    totalItems: data?.count || 0, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage 
  }
}
