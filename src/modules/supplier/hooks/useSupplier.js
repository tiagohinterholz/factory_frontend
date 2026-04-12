import { useEffect, useState, useCallback } from 'react'
import { getSupplier } from '@/modules/supplier/services/supplier'

export function useSupplier() {
  const [data, setData] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const load = useCallback(async (search = '', page = 1) => {
    setLoading(true)
    try {
      const response = await getSupplier({ search, page })
      setData(response)
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
    supplier: data.results, 
    totalItems: data.count,
    loading, 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage 
  }
}
