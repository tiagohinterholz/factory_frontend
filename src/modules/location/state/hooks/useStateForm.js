import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { StateService } from "../services/state"

export function useStateForm() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [abbreviation, setAbbreviation] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      await StateService.createState({ name, abbreviation })
      navigate("/estados")
    } catch (error) {
      console.log(error)
      alert("Erro ao criar estado")
    }
  }

  return {
    name,
    setName,
    abbreviation,
    setAbbreviation,
    handleSubmit
  }
}


