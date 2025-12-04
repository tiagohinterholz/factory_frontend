import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getState, updateState, deleteState } from "../services/state"

export function useStateEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [abbreviation, setAbbreviation] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getState(id)
        setName(data.name)
        setAbbreviation(data.abbreviation)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleUpdate(e) {
    e.preventDefault()
    await updateState(id, { name, abbreviation })
    navigate("/estados")
  }

  async function handleDelete() {
    if (!confirm("Deseja realmente deletar?")) return
    await deleteState(id)
    navigate("/estados")
  }

  return {
    name,
    setName,
    abbreviation,
    setAbbreviation,
    loading,
    handleUpdate,
    handleDelete,
  }
}