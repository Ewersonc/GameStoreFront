# GameStore

Loja de jogos desenvolvida como projeto acadêmico. O frontend é uma aplicação Angular e o backend é uma API REST em Java com Spring Boot, que guarda os dados em um banco MongoDB.

O usuário se cadastra, entra no sistema, vê um catálogo de 12 jogos em cards com as capas, monta um carrinho e finaliza o pedido, que é gravado no banco.

## 1. Funcionalidades

- Cadastro de usuários e login com e-mail e senha.
- Senhas armazenadas com hash BCrypt.
- Autenticação por token JWT, enviado em todas as chamadas protegidas.
- Página Loja com os jogos em cards: capa, gênero, nome, desenvolvedora, ano, sinopse e preço.
- Carrinho lateral com o total e a opção de remover itens ou esvaziar o carrinho.
- Finalização de pedido, gravado na coleção de pedidos do MongoDB.
- Botão Sair, que encerra a sessão e volta para a tela inicial.
- Rotas protegidas: a Loja só abre para quem está logado, e o token vencido derruba a sessão.
- Capas dos jogos servidas pelo próprio backend, com uma capa de reserva caso algum arquivo falte.

## 2. Tecnologias

| Camada | Tecnologia | Versão |
| --- | --- | --- |
| Frontend | Angular (componentes standalone e signals) | 21.2 |
| Frontend | TypeScript e RxJS | 5.9 e 7.8 |
| Frontend | Vitest (testes unitários) | 4 |
| Backend | Java | 21 |
| Backend | Spring Boot (Web MVC, Security, Validation, Data MongoDB) | 4.1.1 |
| Backend | Spring Security OAuth2 Resource Server (JWT, biblioteca Nimbus) | incluído no Spring Boot |
| Backend | Lombok | gerenciado pelo Spring Boot |
| Banco de dados | MongoDB | 7 (via Docker Compose) |
| Build | Maven Wrapper e npm | incluídos no projeto |

## 3. Pré-requisitos

- Java 21.
- Node.js 20.19 ou superior, ou 22.12 ou superior (exigência do Angular 21), com npm.
- Um MongoDB acessível na porta 27017. A forma mais simples é o Docker. Também servem o MongoDB Community instalado na máquina ou um cluster do MongoDB Atlas.

O Maven não precisa ser instalado, porque o projeto inclui o Maven Wrapper.

## 4. Catálogo de jogos

A API já possui uma lista de jogos pré-definida. Ao iniciar, o backend cadastra automaticamente os 12 jogos do catálogo no banco, sem duplicar os que já existem.

## 5. Autenticação e segurança

- **Senhas:** guardadas como hash BCrypt, nunca em texto puro. O campo `senha` é aceito na entrada, mas nunca é devolvido pela API.
- **Login:** `POST /auth/login` confere o e-mail e a senha e devolve um token JWT.
- **Token:** assinado com HS256, com validade de 120 minutos. Contém o e-mail (subject), o id e o nome do usuário. Depois que vence, o usuário precisa entrar de novo.
- **Envio do token:** o frontend anexa o header `Authorization: Bearer <token>` em todas as chamadas ao backend, exceto as de login.
- **Rotas públicas:** login, cadastro de usuário, consulta de jogos e imagens de capa.
- **Rotas protegidas:** todas as demais. Sem token válido, o backend responde 401.
- **Sessão:** o backend não mantém sessão (stateless). O CSRF fica desligado, porque a API usa token no header e não cookie.
- **CORS:** só as origens listadas em `app.cors.allowed-origins` são aceitas.
- **Chave do JWT:** se `JWT_SECRET` tiver menos de 32 caracteres, a aplicação não inicia.

## 6. API

O backend responde em `http://localhost:8080`.

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/login` | Pública | Corpo com e-mail e senha. Responde 200 com id, nome, e-mail e token, ou 401 se as credenciais forem inválidas. |
| POST | `/usuarios` | Pública | Cadastra um usuário. Responde 201, 400 (dados inválidos) ou 409 (e-mail já cadastrado). |
| GET | `/usuarios` e `/usuarios/{id}` | Token | Lista ou busca usuários, sem a senha. |
| PUT | `/usuarios/{id}` | Token | Atualiza um usuário. Responde 404 se não existir. |
| DELETE | `/usuarios/{id}` | Token | Remove um usuário. |
| GET | `/jogos` e `/jogos/{id}` | Pública | Lista ou busca jogos. |
| POST | `/jogos` | Token | Cadastra um jogo. |
| PUT | `/jogos/{id}` | Token | Atualiza um jogo. |
| DELETE | `/jogos/{id}` | Token | Remove um jogo. |
| GET | `/capas/{arquivo}` | Pública | Imagem de capa. |
| GET | `/pedidos` e `/pedidos/{id}` | Token | Lista ou busca pedidos. |
| POST | `/pedidos` | Token | Cria um pedido. Se o status não for informado, fica como `PENDENTE`. |
| PUT | `/pedidos/{id}` | Token | Atualiza um pedido. |
| DELETE | `/pedidos/{id}` | Token | Remove um pedido. |


## 7. Observações

- Projeto desenvolvido para fins acadêmicos.
- Os preços dos jogos são fictícios.
- As imagens de capa são de propriedade dos respectivos publicadores.
