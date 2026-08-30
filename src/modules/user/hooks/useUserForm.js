import { useState } from "react"
import { UserService } from "@/modules/user/services/user"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

export function useUserForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const { businessId } = useAuth()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [business, setBusiness] = useState(businessId || "")
  const [role, setRole] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!")
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
      await UserService.createUser(payload)
      navigate("/usuarios")
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      toast.error(parseApiError(error, "Erro ao criar usuário").message)
    }
  }

  return {
    email,
    setEmail,
    name,
    setName,
    business,
    setBusiness,
    role,
    setRole,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleSubmit,
  }
}
