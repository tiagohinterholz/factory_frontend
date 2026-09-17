import { useQuery } from "@tanstack/react-query"
import { LicenseService } from "@/modules/license/services/license"

// Cobrança de renovação de licença (4.4.2): enquanto pendente e sem
// checkout_url/error_message, a cobrança ainda está sendo criada no gateway
// (create_payment_charge, assíncrona) — refaz a cada 3s até aparecer um dos
// dois. Mesmo padrão do useSignupStatus.
export function useLicenseRenewalPayment(paymentId) {
  const query = useQuery({
    queryKey: ["license-renewal-payment", paymentId],
    enabled: Boolean(paymentId),
    queryFn: () => LicenseService.getPaymentStatus(paymentId),
    refetchInterval: (currentQuery) => {
      const data = currentQuery.state.data
      if (!data) return 3000
      if (data.status === "pendente" && !data.checkout_url && !data.error_message) {
        return 3000
      }
      return false
    },
  })

  return {
    payment: query.data ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
  }
}
