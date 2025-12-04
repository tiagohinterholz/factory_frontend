import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createBusiness } from "../services/business"

export default function BusinessCreate() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    corporate_name: "",
    trade_name: "",
    cnpj: "",
    state_id: "",
    city_id: "",
    address: "",
    number: "",
    complement: "",
    phone: "",
    email: "",
  })

  function handleChange(ev) {
    setForm({ ...form, [ev.target.name]: ev.target.value })
  }

  async function handleSubmit(ev) {
    ev.preventDefault()

    try {
      await createBusiness({
        ...form,
        state_id: Number(form.state_id),
        city_id: Number(form.city_id),
        is_active: true
      })

      navigate("/empreendimentos")
    } catch (error) {
      console.log(error)
      alert("Erro ao criar empreendimento")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Novo Empreendimento</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="block mb-1">Razão Social</label>
          <input
            name="corporate_name"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Nome Fantasia</label>
          <input
            name="trade_name"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block mb-1">CNPJ</label>
          <input
            name="cnpj"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Estado</label>
          <input
            type="number"
            name="state_id"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Cidade</label>
          <input
            type="number"
            name="city_id"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Endereço</label>
          <input
            name="address"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Número</label>
          <input
            name="number"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Complemento</label>
          <input
            name="complement"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Telefone</label>
          <input
            name="phone"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <button
          type="submit"
          className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white rounded p-2"
        >
          Criar
        </button>

      </form>
    </div>
  )
}
