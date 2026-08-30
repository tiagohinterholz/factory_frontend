import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { StateService } from "../services/state"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

export function useStateForm() {
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState("")
  const [abbreviation, setAbbreviation] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      await StateService.createState({ name, abbreviation })
      navigate("/estados")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao criar estado").message)
    }
  }

  return {
    name,
    setName,
    abbreviation,
    setAbbreviation,
    handleSubmit,
  }
}
