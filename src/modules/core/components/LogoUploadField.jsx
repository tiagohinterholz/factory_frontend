import { useEffect, useMemo, useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import { resolveMediaUrl } from "@/api/media"

function objectUrl(file) {
  try {
    return URL.createObjectURL(file)
  } catch {
    return null // jsdom não implementa
  }
}

// Campo de upload de imagem (logo do empreendimento). `value` é a fonte única:
// um File (upload novo), a URL atual do registro (string, na edição) ou "".
// `onChange` recebe o File escolhido, ou "" ao remover a seleção.
export default function LogoUploadField({
  label = "Logo",
  value,
  currentUrl = "",
  onChange,
  error,
  hint = "PNG ou JPG, até 5MB. Usado nos relatórios.",
}) {
  const inputRef = useRef(null)

  // object URL do File escolhido, criado uma vez por File e revogado quando ele
  // troca/some (padrão recomendado, evita setState dentro de efeito).
  const previewUrl = useMemo(() => (value instanceof File ? objectUrl(value) : null), [value])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const isNewFile = value instanceof File
  // File -> preview local (blob:). String / currentUrl -> mídia do Django,
  // que vem relativa e precisa ser resolvida contra o host da API.
  const storedUrl = (typeof value === "string" && value) || currentUrl || ""
  const shownUrl = previewUrl ?? (storedUrl ? resolveMediaUrl(storedUrl) : null)

  function handlePick(event) {
    const file = event.target.files?.[0]
    if (file) onChange(file)
  }

  function handleClearSelection() {
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col">
      <span className="label-premium">{label}</span>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl border border-line bg-ground flex items-center justify-center overflow-hidden shrink-0">
          {shownUrl ? (
            <img
              src={shownUrl}
              alt="Pré-visualização do logo"
              className="w-full h-full object-contain"
            />
          ) : (
            <ImagePlus className="w-6 h-6 text-muted" />
          )}
        </div>

        <div className="flex flex-col items-start gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium rounded-lg border border-line px-3 py-1.5 text-muted hover:bg-ground hover:text-ink transition-colors"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            {shownUrl ? "Trocar imagem" : "Selecionar imagem"}
          </button>

          {isNewFile && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="inline-flex items-center gap-1 text-[12px] text-danger hover:underline"
            >
              <X className="w-3 h-3" />
              Remover seleção
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handlePick}
        className="hidden"
        aria-label={label}
      />

      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <span className="mt-1 text-xs text-danger">{error}</span>}
    </div>
  )
}
