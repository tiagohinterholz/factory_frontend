import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BusinessService } from "@/modules/business/services/business"
import { businessKeys } from "@/modules/business/domain/query-keys"

export function useBusinessCertificate({ enabled = true } = {}) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: businessKeys.certificate,
    queryFn: () => BusinessService.getCertificate(),
    enabled,
  })

  const mutation = useMutation({
    mutationFn: ({ file, password }) => BusinessService.uploadCertificate(file, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.certificate }),
  })

  return {
    certificate: query.data ?? null,
    loading: query.isPending,
    error: query.error ?? null,
    upload: (file, password) => mutation.mutateAsync({ file, password }),
    uploading: mutation.isPending,
  }
}
