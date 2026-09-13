import { z } from "zod"
import { requiredText, requiredId } from "@/modules/core/schemas/br-fields"

// Backend (VehicleModel model / /modelos-veiculo/): name + manufacturer_id
// obrigatórios.
export const vehicleModelSchema = z.object({
  name: requiredText("Informe o nome do modelo"),
  manufacturer_id: requiredId("Selecione a marca"),
})

export const vehicleModelDefaults = {
  name: "",
  manufacturer_id: "",
}
