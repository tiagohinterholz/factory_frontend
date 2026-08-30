import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { StateService } from "../services/state"

export function useStateEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()

  const [name, setName] = useState("")
  const [abbreviation, setAbbreviation] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await StateService.getState(id)
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
    await StateService.updateState(id, { name, abbreviation })
    navigate("/estados")
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir estado?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await StateService.deleteState(id)
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
