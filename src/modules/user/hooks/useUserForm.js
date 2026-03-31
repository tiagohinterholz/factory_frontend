import { useState } from "react"
import { createUser } from "@/modules/user/services/user"
import { useNavigate } from "react-router-dom"

export function useUserForm() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [business, setBusiness] = useState("")
  const [role, setRole] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")


  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      email: email,  
      name: name,
      business_id: business ? business : undefined,
      role: role,
      password: password,
      confirm_password: confirmPassword,
    }

    try {
      await createUser(payload)
      navigate("/usuarios")
    } catch (error) {
      console.log(error)
      alert("Erro ao criar usuário")
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


