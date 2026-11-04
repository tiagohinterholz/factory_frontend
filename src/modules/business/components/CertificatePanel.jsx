import { useRef, useState } from "react"
import { FileKey, Loader2, Upload } from "lucide-react"
import { useBusinessCertificate } from "@/modules/business/hooks/useBusinessCertificate"
import { parseApiError } from "@/api/parse-api-error"
import { formatDate } from "@/modules/core/utils/format"

const STATUS_STYLES = {
  valid: "bg-ok-subtle text-ok",
  expiring: "bg-warn-subtle text-warn",
  expired: "bg-danger-subtle text-danger",
}

function formatCnpj(value) {
  const digits = (value ?? "").replace(/\D/g, "")
  if (digits.length !== 14) return value ?? ""
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
}

function statusLabel(certificate) {
  if (certificate.status === "expired") return "Vencido — emissão bloqueada"
  if (certificate.status === "expiring") {
    const days = certificate.days_until_expiry
    if (days <= 0) return "Vence hoje"
    return days === 1 ? "Vence em 1 dia" : `Vence em ${days} dias`
  }
  return "Válido"
}

function Detail({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm text-ink">{children}</p>
    </div>
  )
}

function CertificateDetails({ certificate }) {
  const uploadedAt = formatDate(certificate.uploaded_at)

  return (
    <div className="rounded-xl border border-line bg-ground px-4 py-4">
      <span
        className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
          STATUS_STYLES[certificate.status] ?? STATUS_STYLES.valid
        }`}
      >
        {statusLabel(certificate)}
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Detail label="Titular">{certificate.holder_name}</Detail>
        <Detail label="CNPJ">{formatCnpj(certificate.cnpj)}</Detail>
        <Detail label="Validade">
          {`${formatDate(certificate.valid_from)} a ${formatDate(certificate.valid_until)}`}
        </Detail>
        <Detail label="Enviado por">
          {certificate.uploaded_by_name
            ? `${certificate.uploaded_by_name} em ${uploadedAt}`
            : `Em ${uploadedAt}`}
        </Detail>
      </div>
    </div>
  )
}

function UploadForm({ installed, uploading, onUpload }) {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    try {
      await onUpload(file, password)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (uploadError) {
      setError(parseApiError(uploadError, "Não foi possível enviar o certificado.").message)
    } finally {
      setPassword("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label htmlFor="certificate-file" className="label-premium">
            Arquivo do certificado (.pfx ou .p12)
          </label>
          <input
            id="certificate-file"
            ref={fileInputRef}
            type="file"
            accept=".pfx,.p12"
            className="input-premium"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="certificate-password" className="label-premium">
            Senha do certificado
          </label>
          <input
            id="certificate-password"
            type="password"
            autoComplete="off"
            className="input-premium"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={!file || !password || uploading}
          className="btn-primary disabled:opacity-60 disabled:pointer-events-none"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {installed ? "Substituir certificado" : "Enviar certificado"}
        </button>
      </div>
    </form>
  )
}

export default function CertificatePanel({ canManage }) {
  const { certificate, loading, error, upload, uploading } = useBusinessCertificate()
  const installed = Boolean(certificate?.installed)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
          <FileKey className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 tracking-tight">Certificado Digital</h3>
          <p className="text-xs text-muted mt-0.5">
            Certificado A1 usado para assinar as notas fiscais da empresa.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
        </div>
      ) : error ? (
        <p className="text-sm text-danger">Não foi possível carregar o certificado.</p>
      ) : installed ? (
        <CertificateDetails certificate={certificate} />
      ) : (
        <p className="rounded-xl border border-line bg-ground px-4 py-4 text-sm text-muted">
          Nenhum certificado instalado
        </p>
      )}

      {canManage && !loading && (
        <UploadForm installed={installed} uploading={uploading} onUpload={upload} />
      )}
    </div>
  )
}
