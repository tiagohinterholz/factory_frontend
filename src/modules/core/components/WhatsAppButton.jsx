import { MessageCircle } from "lucide-react"
import { whatsappLink } from "@/modules/core/utils/whatsapp"

// Abre o WhatsApp Web numa aba nova pro número do cliente. Sem `label` vira
// um ícone compacto (ações de linha de tabela); com `label`, um botão com
// texto (cabeçalho de tela, ao lado de "Excluir"/"Finalizar" etc). Não
// renderiza nada sem telefone válido — quem usa não precisa checar antes.
export default function WhatsAppButton({ phone, label, className = "" }) {
  const link = whatsappLink(phone)
  if (!link) return null

  const baseClassName = label
    ? "flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition duration-300 font-bold text-sm"
    : "p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir conversa no WhatsApp"
      className={`${baseClassName} ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      {label}
    </a>
  )
}
