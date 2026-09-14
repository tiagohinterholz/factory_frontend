// mine: a licença do próprio negócio (self, singular). all/lists/list/detail:
// navegação de licenças de outros negócios pelo superusuário (/licencas/).
export const licenseKeys = {
  mine: ["licenses", "mine"],
  all: ["licenses"],
  lists: () => [...licenseKeys.all, "list"],
  list: (params) => [...licenseKeys.lists(), params],
  detail: (id) => [...licenseKeys.all, "detail", id],
}
