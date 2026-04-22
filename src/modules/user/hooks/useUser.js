import { useEffect, useState, useCallback } from 'react'
import { UserService } from '@/modules/user/services/user'

export function useUser() {
  const [data, setData] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const load = useCallback(async (search = '', page = 1) => {
    setLoading(true)
    try {
      const response = await UserService.getUser({ search, page })
      if (Array.isArray(response)) {
        setData({ results: response, count: response.length })
      } else if (response && response.results) {
        setData(response)
      } else {
        setData({ results: [], count: 0 })
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
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

  const handleDelete = async (id) => {
    try {
      setData(prev => ({
        ...prev,
        results: prev.results.filter(u => u.id !== id),
        count: prev.count - 1
      }))

      await UserService.deleteUser(id)
      await load(searchTerm, currentPage)
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert("Erro ao excluir usuário. A lista será atualizada.")
      await load(searchTerm, currentPage)
    }
  }

  return { 
    user: data?.results || [], 
    totalItems: data?.count || 0,
    loading, 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage,
    handleDelete
  }
}
