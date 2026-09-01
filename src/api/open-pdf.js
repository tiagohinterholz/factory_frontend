// Abre um Blob de PDF numa nova aba (a rota é autenticada, então o arquivo
// vem pelo axios como blob — não dá pra apontar window.open direto pra URL).
// O object URL é revogado depois pra não vazar memória.
export function openPdfBlob(blob) {
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank", "noopener")
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
