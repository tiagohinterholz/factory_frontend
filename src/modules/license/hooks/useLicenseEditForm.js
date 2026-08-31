import { useState } from "react"
import { useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { idOf } from "@/api/dto"
import { LicenseService } from "@/modules/license/services/license"
import { licenseSchema, licenseDefaults, toLicensePayload } from "../license.schema"

// dto da API -> shape do form
function toLicenseForm(data) {
  return {
    business_id: idOf(data.business),
    period: data.period ?? "MENSAL",
    max_users: String(data.max_users ?? 1),
    activation_date: data.activation_date ? data.activation_date.split("T")[0] : "",
  }
}

export function useLicenseEditForm() {
  const { id } = useParams()
  const [meta, setMeta] = useState({ status: "", businessName: "" })

  const { form, onSubmit, loading } = useResourceForm({
    schema: licenseSchema,
    defaultValues: licenseDefaults,
    load: async () => {
      const data = await LicenseService.getLicenseById(id)
      setMeta({
        status: data.status ?? "",
        businessName: data.business?.trade_name || data.business?.corporate_name || "",
      })
      return toLicenseForm(data)
    },
    submit: (values) =>
      LicenseService.getLicenseRenew(values.business_id, toLicensePayload(values)),
    redirectTo: "/empreendimentos/licencas",
    errorFallback: "Erro ao processar renovação",
  })

  return { form, onSubmit, loading, status: meta.status, businessName: meta.businessName }
}
