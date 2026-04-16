import { useState } from "react"
import { createUser } from "@/modules/user/services/user"
import { useNavigate } from "react-router-dom"

export function useUserForm() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [business, setBusiness] = useState(() => {
    const userStr = localStorage.getItem("user") || "{}"
    const loggedUser = JSON.parse(userStr)
    return loggedUser.business_id || ""
  })
  const [role, setRole] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("As senhas não coincidem!")
      return
    }

    const payload = {
      email: email,  
      name: name,
      business_id: business || undefined,
      role: role,
      password: password,
    }

    try {
      await createUser(payload)
      navigate("/usuarios")
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      const errorMsg = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : "Erro ao criar usuário"
      alert(errorMsg)
    }
  }

  return {
    email, setEmail,  
    name, setName,
    business, setBusiness,
    role, setRole,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    handleSubmit
  }
}


