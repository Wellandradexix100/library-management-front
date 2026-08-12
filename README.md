# 📚 Library Management - Frontend

Interface de usuário (SPA) completa para Sistema de Gerenciamento de Biblioteca, construída com **React**, **Vite** e **TypeScript**.

## 📸 Funcionalidades
- **Gestão de Acervo:** Painéis completos para visualização, cadastro, e edição de livros, autores e usuários.
- **Geração de Códigos:** Criação dinâmica de código de barras e QR Codes para facilitar a identificação e *bipagem* de exemplares.
- **Controle Operacional:** Mesas virtuais interativas para gerenciar empréstimos e efetivar ou cancelar reservas.
- **Dashboard Analítico:** Visão geral com métricas da biblioteca.
- **Experiência do Usuário (UX):** Feedbacks em tempo real com Toast notifications, modais de confirmação customizados e Skeleton Loaders em todas as tabelas e grids.

## 🚀 Tecnologias

- **React (v19)**
- **Vite** (Build tool de alta performance)
- **TypeScript** (Tipagem estática)
- **React Router DOM** (Roteamento de páginas)
- **Axios** (Comunicação HTTP com a API REST)
- **Lucide React** (Ícones minimalistas e consistentes)
- **Skeletons Loading** (Feedback visual com shimmer effect nativo durante chamadas assíncronas)
- **Toast Notifications & Confirm Modals** (Sistema customizado para feedback de UI, substituindo `alert` e `window.confirm`)
- **React Barcode & React QR Code** (Geração de códigos para identificação dos livros)

## 📦 Como Executar Localmente

### Pré-requisitos
- Node.js (v18+)
- Backend ([Library Management API](../library-management-api)) rodando localmente para consumo de dados.

### Passos

1. Instale as dependências do projeto:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse a aplicação no seu navegador (por padrão em `http://localhost:5173`).

## ⚙️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento local.
- `npm run build`: Compila o TypeScript e faz o build otimizado para produção.
- `npm run lint`: Executa a verificação de código usando ESLint.
- `npm run preview`: Inicia um servidor local focado em visualizar o build de produção gerado.

## 🏗️ Estrutura e Padrões

- Arquitetura focada na separação de componentes visuais, integrações e contexto de estado.
- Roteamento, formulários e chamadas assíncronas tipadas, espelhando os mesmos contratos e esquemas (`Zod`) definidos na API do back-end.

---
Feito com 💙 para fins de estudo e portfólio de desenvolvimento.
