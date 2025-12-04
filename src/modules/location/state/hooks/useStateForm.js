import { useState } from "react"
import { createState } from "@/modules/location/state/services/state"
import { useNavigate } from "react-router-dom"

export function useStateForm() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [abbreviation, setAbbreviation] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      await createState({ name, abbreviation })
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


