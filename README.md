# 📄 order-orchestrator API - Documentação Técnica

## 🔹 Visão Geral

**order-orchestrator** foi desenvolvido em **NestJS**, com banco de dados **PostgreSQL** e **Prisma** como ORM.

API desenvolvida em NestJS para receber, validar, enriquecer e processar pedidos de forma assíncrona, utilizando filas e mecanismos de retry em caso de falhas.

## 📌 Requisitos do Sistema

- Docker e Docker Compose
- Node.js >= 20 (se for rodar local)
- npm >= 10 (se for rodar local)

---

## 📌 Tecnologias utilizadas

- **Nest.js**
- **Clean Architecture & DDD (Domain-Driven Design)** – Organização do código por domínios e responsabilidades.
- **Princípios SOLID**
- **Redis** – Implementado para cache-aside e filas de processamento assíncrono.
- **BullMQ** – Gestão de filas para tarefas assíncronas.
- **Prisma ORM**.
- **PostgreSQL**
- **Testes unitários e E2E** – Cobertura de testes em push e pull requests, garantindo qualidade do código.
- **Docker**.
- **OpenTelemetry (OTel) com Jaeger**.
- **Sentry**
- **GitHub Actions** – CI/CD, incluindo execução de testes automatizados.
- **Rate Limiting** – Implementado para controlar o número de requisições permitidas em um intervalo de tempo, protegendo a API contra abuso e sobrecarga.

---

## Instalação e execução

## Opção 1: Rodar tudo via Docker

```bash
# 1️⃣ Clonar o repositório
git clone https://github.com/Dioneprey/order-orchestrator.git

# 2️⃣ Copiar variáveis de ambiente
cp .env.example .env

# 3️⃣ Build e execução de todos os containers
docker compose --profile api up --build -d
```

## Opção 2: Rodar localmente (Node + NPM)

```bash
# 1️⃣ Clonar o repositório
git clone https://github.com/Dioneprey/order-orchestrator.git

# 2️⃣ Copiar variáveis de ambiente
cp .env.example .env

# 3️⃣ Subir api em modo desenvolvimento
docker compose up --build -d

npm install           # Instalar dependências
npm run db:deploy     # Aplicar migrations e gerar Prisma Client
npm run start:dev     # Rodar a API
```

# 🔐 Autenticação da API

A API utiliza autenticação simples baseada em API key.

A chave pode ser informada via variável de ambiente e tem o seguinte valor padrão:
```
API_KEY=order-orchestrator-inbazz
```

# 🌐 URLs

## 📘 API

- Endpoint: [http://localhost:3333/api](http://localhost:3333/api)
- Swagger: [http://localhost:3333/api/docs](http://localhost:3333/api/docs)

---

## 🔍 Observabilidade

- **Jaeger (Tracing):** [http://localhost:16686](http://localhost:16686)
- **Bull Board (Filas):** [http://localhost:3333/api/queues](http://localhost:3333/api/queues)

---

## Rotas

#### Autenticação
Todos os endpoints requerem o **header** `x-api-key` com o valor da chave:

### Receber Pedido (Webhook)

POST /webhooks/orders - Recebe dados de um pedido

**Exemplo de payload:**

```json
{
  "order_id": "ext-123",
  "customer": { "email": "user@example.com", "name": "Ana" },
  "items": [{ "sku": "ABC123", "qty": 2, "unit_price": 59.9 }],
  "currency": "USD",
  "idempotency_key": "uuid-or-hash"
}
```

### Consulta e Administração

GET /orders — Lista pedidos (com filtro opcional por status)

GET /orders/:id — Detalhes de um pedido

DELETE /orders/:id — Deleta um pedido

GET /queue/metrics — Informações gerais da fila (jobs em processamento, sucesso e falhas)

