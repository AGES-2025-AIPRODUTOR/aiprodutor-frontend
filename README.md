# Ai Produtor - Frontend

> Interface do usuário para o sistema de cadastro e gestão de produtores de hortifrúti, desenvolvido para a disciplina de AGES.

Este projeto contém todo o código relacionado à experiência do usuário, construído com Next.js e TypeScript. Ele se comunica com a API do [aiprodutor-backend](https://tools.ages.pucrs.br/ai-produtor-sistema-de-cadastro-e-gestao-de-produtores-de-hortifrutie/aiprodutor-backend.git) para buscar e salvar dados.

## ✨ Funcionalidades

* Mapeamento interativo e visualização de áreas de plantio.
* Registro e acompanhamento de safras.
* Visualização de dados de produtividade.

## 🛠️ Tecnologias Utilizadas

* **Framework:** [Next.js](https://nextjs.org/) (com App Router)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Biblioteca de UI:** [React](https://react.dev/)
* **Estilização:** [TailwindCSS](https://tailwindcss.com/)
* **Cliente HTTP:** [Axios](https://axios-http.com/)
* **Qualidade de Código:** [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/)

## 🚀 Começando

Siga os passos abaixo para configurar e rodar o projeto em seu ambiente de desenvolvimento local.

### Pré-requisitos

* [Node.js](https://nodejs.org/) (versão LTS, ex: 20.x ou superior)
* [npm](https://www.npmjs.com/)
* [Git](https://git-scm.com/)
* [Docker](https://www.docker.com/products/docker-desktop/) (necessário para rodar o backend)

### Instalação (Feita apenas uma vez)

1.  **Clone o repositório:**
    ```bash
    git clone [https://tools.ages.pucrs.br/ai-produtor-sistema-de-cadastro-e-gestao-de-produtores-de-hortifrutie/aiprodutor-frontend.git](https://tools.ages.pucrs.br/ai-produtor-sistema-de-cadastro-e-gestao-de-produtores-de-hortifrutie/aiprodutor-frontend.git)
    cd aiprodutor-frontend
    ```

2.  **Configure as Variáveis de Ambiente:**
    Copie o arquivo de exemplo `.env.local.example` para um novo arquivo chamado `.env.local`.
    ```bash
    cp .env.local.example .env.local
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

### Como Rodar a Aplicação no Dia a Dia

1.  **Inicie o Backend:**
    **Importante:** Para que o frontend funcione, o projeto `aiprodutor-backend` precisa estar rodando. Siga as instruções do `README.md` do backend e execute `docker compose up`.

2.  **Inicie o Servidor de Desenvolvimento do Frontend:**
    Em um novo terminal, na pasta `aiprodutor-frontend`, execute:
    ```bash
    npm run dev
    ```

3.  Abra **[http://localhost:3001](http://localhost:3001)** no seu navegador para ver a aplicação.

## ⚙️ Variáveis de Ambiente

As variáveis de ambiente são gerenciadas através do arquivo `.env.local`.

* `NEXT_PUBLIC_API_URL`: A URL base da API do backend. Para o ambiente de desenvolvimento, o valor padrão é `http://localhost:3000`.

## 📜 Scripts Disponíveis

* `npm run dev`: Inicia o servidor em modo de desenvolvimento na porta **3001**.
* `npm run build`: Compila a aplicação para produção.
* `npm run start`: Inicia um servidor de produção (requer um `build` prévio).
* `npm run lint`: Executa o ESLint para analisar o código em busca de erros e inconsistências.
