import { useAppointment } from "../hooks/useAppointment"
import ListHeader from "@/modules/core/components/ListHeader"
import ListGrid from "@/modules/core/components/ListGrid"
import ListCard from "@/modules/core/components/ListCard"


export default function AppointmentList() {
  const { appointment, loading } = useAppointment()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">

      <ListHeader
        title='agendamentos'
        buttonText='Novo Agendamento'
        buttonLink='/agendamentos/novo'
      />
      
      <ListGrid>
        {appointment.map((appointment) => (
          <ListCard
            key={appointment.id}
            to={`/agendamentos/${appointment.id}`}
            title={appointment.client.name}
            subtitle={appointment.date + " " + appointment.time}
          />
        ))}
      </ListGrid>
    </div>
  )
}
