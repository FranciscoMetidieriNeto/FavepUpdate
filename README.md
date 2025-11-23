# 🌾 FAVEP: Plataforma de Gerenciamento Agrícola

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/seu-usuario/seu-repo/blob/main/LICENSE)
[![Frontend: Angular](https://img.shields.io/badge/Frontend-Angular-red?logo=angular)](https://angular.io/)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=nodedotjs)](https://nodejs.org/en/)
[![Database: SQLite](https://img.shields.io/badge/Database-SQLite-074463?logo=sqlite)](https://www.sqlite.org/index.html)

## 🎯 Visão Geral do Projeto

**FAVEP** é uma aplicação web **full-stack** desenvolvida para a gestão completa de atividades agrícolas. A plataforma visa simplificar a administração rural, oferecendo ferramentas para:

* **Gerenciar** propriedades e seus respectivos dados. 🏡
* **Controlar** produções, safras e culturas. 🌱
* **Acompanhar** detalhadamente as finanças (receitas e despesas). 💰
* **Visualizar** estatísticas e relatórios gráficos para auxiliar na tomada de decisões estratégicas. 📊

---

## 🚀 Funcionalidades Principais

| Ícone | Funcionalidade | Descrição |
| :---: | :--- | :--- |
| 🔑 | **Autenticação Segura** | Sistema de registro e login de usuários. |
| 🏡 | **Gerenciamento de Propriedades** | Cadastro, edição e visualização de todas as suas propriedades rurais. |
| 🌱 | **Controle de Produção** | Registro de safras, culturas, insumos e produtividade. |
| 💵 | **Gestão Financeira** | Lançamento e acompanhamento de receitas e despesas. |
| 📈 | **Visualização de Dados** | Geração de gráficos, estatísticas e relatórios em tempo real. |
| 🤝 | **Interação com Parceiros** | Seção dedicada para exibir parceiros estratégicos do agronegócio. |

---

## 🛠️ Tecnologias Utilizadas

O projeto é dividido em duas partes principais: Frontend (Aplicação Web) e Backend (Servidor API).

### 🎨 Frontend (FAVEP/)

| Tecnologia | Descrição |
| :--- | :--- |
| **Framework:** Angular | Framework de desenvolvimento web. |
| **Linguagem:** TypeScript | Superset do JavaScript para desenvolvimento em escala. |
| **Estilização:** CSS | Linguagem de folha de estilos. |
| **Componentes:** Angular Material | Biblioteca de componentes de UI. |

### ⚙️ Backend (ServerBackup/)

| Tecnologia | Descrição |
| :--- | :--- |
| **Framework:** Express.js | Framework minimalista e flexível para Node.js. |
| **Linguagem:** JavaScript (Node.js) | Ambiente de execução. |
| **ORM:** Prisma | ORM moderno para Node.js. |
| **Banco de Dados:** SQLite | Banco de dados leve e integrado (para desenvolvimento). |
| **Autenticação:** JWT com bcrypt | JSON Web Tokens para segurança e bcrypt para hashing de senhas. |

---

## 🖥️ Comandos para Execução

Siga os passos abaixo para colocar o projeto FAVEP em execução na sua máquina local.

### 1. ⚙️ Executando o Backend (Servidor Node.js)

1.  Navegue até o diretório do servidor:
    ```bash
    cd ServerBackup/
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Gere os arquivos do Prisma Client (necessário para interagir com o DB):
    ```bash
    npx prisma generate
    ```
4.  Inicie o servidor. **Recomendado para desenvolvimento:**
    ```bash
    npx nodemon index.js
    ```
    (Ou `node index.js` para uma execução simples).

> ℹ️ **O servidor estará em execução em:** `http://localhost:5050`

### 2. 🅰️ Executando o Frontend (Aplicação Angular)

1.  Navegue até o diretório da aplicação Angular:
    ```bash
    cd FAVEP/
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    ng serve
    ```
    Para build de produção:
    ```bash
    ng build
    ```

> ℹ️ **A aplicação estará disponível em:** `http://localhost:4200/`

---

## 💳 Configuração de Pagamentos (Mercado Pago)

Para que o módulo de pagamentos e assinaturas funcione corretamente em ambiente de desenvolvimento, é necessário realizar a integração com o Mercado Pago e utilizar o **ngrok** para expor seu servidor local e receber notificações (Webhooks).

### 1. 🌐 Instalação e Configuração do ngrok
O **ngrok** é necessário para criar um túnel seguro para o seu `localhost`, permitindo que o Mercado Pago notifique seu sistema sobre o status dos pagamentos.

1.  Baixe e instale o [ngrok](https://ngrok.com/download).
2.  Inicie o ngrok apontando para a porta do seu backend (padrão 5050):
    ```bash
    ngrok http 5050
    ```
3.  Copie a URL HTTPS gerada pelo ngrok (ex: `https://a1b2-c3d4.ngrok-free.app`).

### 2. 🛍️ Configuração no Mercado Pago Developers
1.  Acesse o [Mercado Pago Developers](https://www.mercadopago.com.br/developers).
2.  Crie uma nova aplicação e selecione a opção **Checkout Pro**.
3.  No painel da aplicação, obtenha as credenciais:
    * **Public Key**
    * **Access Token**
4.  Vá até a aba **Notificações Webhooks**.
5.  Configure a URL de notificação utilizando a URL do ngrok copiada anteriormente:
    * Formato: `https://sua-url-ngrok.ngrok-free.app/webhook` (Verifique a rota exata definida no arquivo `routes` do backend).
6.  Ative os eventos necessários (ex: `payment`, `subscription_authorized`).

### 3. 🔐 Variáveis de Ambiente (.env)
Navegue até a pasta `ServerBackup/` e adicione as credenciais no arquivo `.env`:

```env
#MERCADO PAGO
MERCADOPAGO_PUBLIC_KEY="sua-public-key"
MERCADOPAGO_ACCESS_TOKEN="seu-acess-token"
MERCADOPAGO_NOTIFICATION_URL="url-gerada-pelo-ngok/api/mercado-pago/webhook"

# URL do ngrok (necessária para definir o callback de retorno)
