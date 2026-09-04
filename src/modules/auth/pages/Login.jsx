import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState(import.meta.env.DEV ? "tiago@gmail.com" : "")
  const [password, setPassword] = useState(import.meta.env.DEV ? "tiago123" : "")

  async function handleLogin(ev) {
    ev.preventDefault()

    try {
      await login({ email, password })
      navigate("/dashboard")
    } catch {
      toast.error("Credenciais inválidas")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Entrar no Sistema</h2>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Email</label>
            <input
              type="email"
              autoComplete="username"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Digite seu email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Digite sua senha"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <a href="#forgot" className="block text-blue-600 hover:underline text-sm">
            Esqueceu a senha?
          </a>
          <a href="#register" className="block text-gray-700 hover:underline text-sm">
            Criar uma conta
          </a>
          <Link to="/privacidade" className="block text-gray-500 hover:underline text-xs pt-2">
            Aviso de Privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}
