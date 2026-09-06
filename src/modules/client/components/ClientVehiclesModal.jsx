import { Car } from "lucide-react"
import Modal from "@/modules/core/components/Modal"
import { useClientVehicles } from "@/modules/client/hooks/useClientVehicles"
import { fuelOptions } from "@/modules/vehicle/constants/vehicle"

const fuelLabel = (value) => fuelOptions.find((option) => option.id === value)?.name ?? value ?? "—"

// Modal só-leitura com os veículos de um cliente. `client` nulo = fechado.
export default function ClientVehiclesModal({ client, onClose }) {
  const { vehicles, loading, error } = useClientVehicles(client?.id)
  const name = client ? `${client.first_name} ${client.last_name}` : ""

  return (
    <Modal
      open={Boolean(client)}
      onClose={onClose}
      title={name ? `Veículos de ${name}` : "Veículos do cliente"}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Fechar
        </button>
      }
    >
      {loading ? (
        <p className="py-6 text-center text-sm text-slate-500">Carregando veículos…</p>
      ) : error ? (
        <p className="py-6 text-center text-sm text-danger">
          Não foi possível carregar os veículos.
        </p>
      ) : vehicles.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Este cliente não tem veículos cadastrados.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className="flex items-start gap-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
                <Car className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {vehicle.manufacturer} {vehicle.model}
                </p>
                <p className="text-[12.5px] text-muted">
                  {vehicle.plate} · {vehicle.year}
                  {vehicle.year_model ? `/${vehicle.year_model}` : ""} · {fuelLabel(vehicle.fuel)}
                  {vehicle.color ? ` · ${vehicle.color}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
