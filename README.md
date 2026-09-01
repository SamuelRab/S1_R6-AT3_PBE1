# 🚚 Rápido & Seguro Logística — API Back-end

API REST em **Node.js + Express**, seguindo o padrão **MVC**, para cadastro de clientes, registro de pedidos e **cálculo automático do valor das entregas**.

## ⚙️ Funcionalidades

- **Clientes:** cadastrar, listar, buscar por ID, atualizar e excluir.
- **Pedidos:** cadastrar (com cálculo automático), listar, buscar por ID, atualizar (recalculando) e excluir.
- **Entregas:** geradas automaticamente a partir do pedido, com valores calculados e status.
- Criação/atualização de Pedido + Entrega em **transação única** (commit/rollback).

## 🧮 Regras de cálculo do frete

1. Valor da distância = distância (km) × valor base por km.
2. Valor do peso = peso (kg) × valor base por kg.
3. Valor base = valor da distância + valor do peso.
4. Entrega **"urgente"** → acréscimo de 20% sobre o valor base ("normal" não tem acréscimo).
5. Valor parcial = valor base + acréscimo.
6. Se o valor parcial for **> R$ 500,00** → desconto de 10%.
7. Se o peso for **> 50 kg** → taxa extra fixa de R$ 15,00.
8. Valor final = valor parcial − desconto + taxa extra (2 casas decimais).

## 🗄️ Modelagem do banco de dados

3 tabelas relacionais: **Cliente** (1) → **Pedido** (N) → **Entrega** (1:1 por pedido).

![DER](docs/der-diagrama.png)

| Cliente | Pedido | Entrega |
|---|---|---|
| ID_cliente (PK) | ID_pedido (PK) | ID_entrega (PK) |
| nomeCompleto | ID_cliente (FK) | ID_pedido (FK) |
| cpf (único) | dataDoPedido | valorDaDistancia |
| telefone | tipoDeEntrega | valorDoPeso |
| email | distancia | acrescimo / desconto |
| endereco | pesoDeCarga | taxaExtra / valorFinal |
| | valorDaBasePorKm/Kg | statusEntrega |

## 🧱 Arquitetura (MVC)

```
config/db.js          # Conexão com o banco (pool MySQL)
controllers/          # clienteController.js, pedidoController.js
functions/functions.js # Cálculo do valor da entrega
models/                # clienteModel.js, pedidoModel.js, entregaModel.js
routes/                # clienteRoutes.js, pedidoRoutes.js, routes.js
docs/der-diagrama.png
app.js                 # Ponto de entrada do servidor Express
```

## 🛠️ Tecnologias

Node.js · Express · MySQL (mysql2, pool + Promises) · Insomnia (testes)

## 🚀 Como executar

```bash
git clone <url-do-repositorio>
cd rapido-seguro-logistica
npm install

# Configure o .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=rapido_seguro_logistica
DB_PORT=3306

# Crie o banco com o script SQL em /docs, depois:
node app.js
```

## 🔌 Endpoints

### Clientes — `/clientes`
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/clientes` | Lista todos |
| GET | `/clientes/:id_cliente` | Busca por ID |
| POST | `/clientes` | Cadastra |
| PUT | `/clientes/:id_cliente` | Atualiza |
| DELETE | `/clientes/:id_cliente` | Exclui |

```json
{
  "nome_completo": "João da Silva",
  "cpf": "12345678900",
  "telefone": "19999999999",
  "email": "joao@email.com",
  "endereco": "Rua das Flores, 123 - Centro - Sumaré/SP"
}
```

### Pedidos — `/pedidos`
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/pedidos` | Cria e calcula a entrega |
| GET | `/pedidos` | Lista todos |
| GET | `/pedidos/:id_pedido` | Busca por ID |
| PUT | `/pedidos/:id_pedido` | Atualiza e recalcula |
| DELETE | `/pedidos/:id_pedido` | Exclui |

```json
{
  "ID_cliente": 1,
  "data_do_pedido": "2026-09-01",
  "tipo_de_entrega": "urgente",
  "distancia": 35.5,
  "peso_de_carga": 60,
  "valor_da_base_por_km": 2.5,
  "valor_da_base_por_kg": 1.8
}
```

## 🧪 Testando com Insomnia

Importe/crie no Insomnia uma requisição para cada endpoint acima, com `base URL = http://localhost:3000`. Fluxo sugerido: cadastrar cliente → criar pedido → conferir cálculo → listar/atualizar registros.

## ⚠️ Observações técnicas

- `endereco` está como string única (não separado em logradouro/número/bairro/cidade/estado/CEP).
- `POST /pedidos` espera os campos do pedido diretamente no corpo da requisição.

## 👨‍💻 Autoria

Projeto desenvolvido por **Samuel Rabelo** e **Isabella**, com arquitetura MVC em Node.js, Express e MySQL.
