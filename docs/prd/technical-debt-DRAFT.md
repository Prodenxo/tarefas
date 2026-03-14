# Technical Debt Assessment - DRAFT
## Para Revisão dos Especialistas

Este documento consolida os achados iniciais do workflow de Discovery Brownfield para o projeto **Gestor de Tarefas**.

### 1. Débitos de Sistema (Validado por @architect)
- **Monólito no Frontend**: O arquivo `Dashboard.jsx` (1300+ linhas) é um gargalo de manutenção e dificulta a escalabilidade.
- **Express 5 Beta (?)**: O backend usa `express: ^5.2.1`. Versões beta podem introduzir instabilidades não documentadas.
- **Ausência de Testes**: Não há suite de testes unitários ou de integração, aumentando o risco de regressões.
- **CORS Manual**: A lógica de CORS está hardcoded no `server.js`, o que dificulta a gestão de ambientes.
- **Gestão de Dependências**: Há muitos scripts de migração soltos na raiz do backend (`migrate-*.js`) em vez de um sistema formal de migrations (como Sequelize ou Prisma).

### 2. Débitos de Database (Pendente Revisão @data-engineer)
- **Falta de Constraints**: Algumas foreign keys podem estar ausentes no banco real apesar de citadas no código.
- **Raw SQL Everywhere**: A falta de um Query Builder ou ORM torna o código propenso a injeção SQL se não houver sanitização rigorosa (embora use `mysql2` placeholders).
- **Schema Outdated**: O script `migrate-tasks.js` não bate 100% com o código em produção (ex: falta `assigned_to_user_id`).
- **Performance**: Falta auditoria de índices em tabelas que podem crescer rápido (como `tasks` e `webhooks`).

### 3. Débitos de Frontend/UX (Pendente Revisão @ux-design-expert)
- **CSS Monolítico**: O `index.css` de 21KB centraliza tudo. Recomenda-se migrar para CSS Modules ou Tailwind para melhor isolamento.
- **Estado no LocalStorage**: A dependência excessiva do `localStorage` para estado da aplicação pode causar inconsistências entre abas.
- **Componentização Insuficiente**: Muitos componentes (como os Selects customizados) estão definidos dentro do `Dashboard.jsx`.
- **Acessibilidade**: Os componentes customizados (Selects) precisam de validação de ARIA e navegação por teclado.

### 4. Matriz Preliminar de Débitos

| ID | Débito | Área | Impacto | Esforço | Prioridade |
|----|--------|------|---------|---------|------------|
| DT01 | Refatorar Dashboard.jsx | Frontend | Alto | Alto | Crítica |
| DT02 | Implementar Migrations | Database | Médio | Médio | Alta |
| DT03 | Adicionar Testes Core | Sistema | Alto | Médio | Alta |
| DT04 | Sincronizar Schema Tasks | Database | Alto | Baixo | Crítica |
| DT05 | Modularizar CSS | Frontend | Médio | Médio | Média |

### 5. Perguntas para Especialistas

**@data-engineer:**
1. Você recomenda a adoção do Prisma ou Sequelize para este projeto agora, ou manter raw SQL com um sistema de migration simples?
2. Existem índices compostos que deveríamos adicionar para as queries de visibilidade de tarefas (por `company_id` e `user_id`)?

**@ux-design-expert:**
1. A estrutura de abas no `Dashboard.jsx` atende bem ao crescimento futuro, ou deveríamos mover para rotas separadas (`/dashboard`, `/tasks`, `/users`)?
2. O design system atual tem tokens claros para variáveis CSS ou é maioritariamente ad-hoc?

---
*Draft gerado automaticamente pelo Workflow de Discovery.*
