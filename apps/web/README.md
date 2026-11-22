# NaRégua — Aplicação Web

Painel administrativo da plataforma **Na Régua**, destinado a administradores e
funcionários da barbearia (RF49–RF51).

## Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript
- [Biome](https://biomejs.dev/) + [Ultracite](https://github.com/haydenbleasel/ultracite) para lint/format

## Configuração

O painel precisa da API em execução. Copie o arquivo de exemplo e configure
`VITE_API_URL` com o endereço do back-end.

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Scripts

```bash
npm install      # instala as dependências
npm run dev      # ambiente de desenvolvimento
npm run build    # typecheck + build de produção
npm run typecheck
npm run check    # lint/format (Biome)
```

## Estrutura

```
src/
  components/   # componentes reutilizáveis (ui e layout)
  features/     # lógica por domínio (ex.: auth)
  pages/        # telas montadas a partir dos componentes
  services/     # integração com a API e armazenamento da sessão
  theme/        # tokens de design compartilhados
  utils/        # funções utilitárias
```
