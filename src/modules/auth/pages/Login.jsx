import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/http";

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin(ev) {
    ev.preventDefault()

    try {
      const response = await api.post('/usuarios/login/', {
        email: email,
        password: password
      })

      localStorage.setItem('access', response.data.access)
      localStorage.setItem('refresh', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      console.log("LOGIN OK, NAVEGANDO...")
      navigate('/dashboard')
    } catch (err) {
      alert('Credenciais Inválidas')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Entrar no Sistema
        </h2>

        <form className="space-y-5" onSubmit={handleLogin}>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Digite seu email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Senha
            </label>
            <input
              type="password"
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

          <a
            href="#forgot"
            className="block text-blue-600 hover:underline text-sm"
          >
            Esqueceu a senha?
          </a>

          <a
            href="#register"
            className="block text-gray-700 hover:underline text-sm"
          >
            Criar uma conta
          </a>

        </div>

      </div>
    </div>
  );
}
