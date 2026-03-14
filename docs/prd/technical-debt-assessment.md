# Technical Debt Assessment - FINAL

## Executive Summary
O projeto **Gestor de Tarefas** apresenta uma base sólida em termos de funcionalidade, mas possui riscos estruturais significativos que podem comprometer a manutenibilidade e a segurança a longo prazo. O principal gargalo reside na complexidade do frontend (monólito no Dashboard) e na lógica acoplada do backend (WhatsApp).

- **Total de débitos identificados:** 8
- **Críticos:** 2 | **Altos:** 3 | **Médios:** 3
- **Esforço total estimado:** ~46 horas de desenvolvimento.

---

## Inventário Completo de Débitos

### Sistema (Validado por @architect)
| ID | Débito | Severidade | Horas | Prioridade |
|----|--------|------------|-------|------------|
| SYS-01 | Ausência de Suite de Testes | Alta | 6h | Alta |
| SYS-02 | Lógica de Conversação Acoplada | Média | 8h | Média |
| SYS-03 | Gestão manual de CORS/Headers | Baixa | 2h | Baixa |

### Database (Baseado em Auditoria Técnica)
| ID | Débito | Severidade | Horas | Prioridade |
|----|--------|------------|-------|------------|
| DB-01 | Desincronização de Schema (Tasks) | Crítica | 2h | Crítica |
| DB-02 | Ausência de ORM/Migrations Formal | Alta | 8h | Alta |

### Frontend/UX (Baseado em Fluxos e Codebase)
| ID | Débito | Severidade | Horas | Prioridade |
|----|--------|------------|-------|------------|
| UI-01 | Monólito Dashboard.jsx (1.4k lines) | Crítica | 14h | Crítica |
| UI-02 | CSS Centralizado e não-modular | Média | 4h | Média |
| UI-03 | Dependência de LocalStorage para Estado | Média | 2h | Média |

---

## Matriz de Priorização Final

| ID | Impacto | Esforço | Prioridade Final | Ação Recomendada |
|----|---------|---------|-----------------|------------------|
| **DB-01** | Crítico | Baixo | **1 - Imediata** | Corrigir colunas da tabela `tasks` |
| **UI-01** | Crítico | Alto | **2 - Alta** | Shatter do Dashboard em componentes menores |
| **DB-02** | Alto | Médio | **3 - Alta** | Introduzir Prisma ou Sequelize |
| **SYS-01** | Alto | Médio | **4 - Alta** | Configuração de Vitest/Jest |
| **SYS-02** | Médio | Médio | **5 - Média** | Refatorar Webhooks para um State Manager |

---

## Plano de Resolução

### Fase 1: Fundação e Segurança (Semana 1)
- Correção de schema e normalização de nomes de colunas.
- Implementação de um sistema de migrations para evitar scripts `migrate-*.js` manuais.

### Fase 2: Refatoração de Arquitetura (Semanas 2-3)
- Decomposição do `Dashboard.jsx` em:
    - `Sidebar.jsx`, `TaskBoard.jsx`, `UserLinkModal.jsx`, `CompanyGrid.jsx`.
- Extração da lógica de WhatsApp para um serviço dedicado (`WhatsAppConversationService.js`).

### Fase 3: Qualidade e Otimização (Semana 4)
- Introdução de testes unitários para a lógica de permissões e cálculo de datas.
- Modularização do CSS (Tailwind ou CSS Modules).

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| **Regressão no Dashboard** | Alto | Realizar o shatter de componentes um a um, testando o estado global após cada alteração. |
| **Interrupção do Webhook** | Médio | Manter a versão antiga do webhook rodando em paralelo durante a refatoração para validação. |
| **Perda de Dados (Migration)** | Alto | Realizar backup completo via `mysqldump` antes de rodar a primeira migration formal. |

---

## Critérios de Sucesso
1. **Redução de SLoC**: O componente `Dashboard.jsx` deve ser reduzido para menos de 300 linhas.
2. **Cobertura**: Pelo menos o core da lógica de tasks (visibilidade e status) deve estar coberto por testes.
3. **Consistência**: O schema do banco deve ser capaz de ser recriado do zero via comando de migration.
4. **Performance**: Redução do bundle size inicial através do split de componentes e CSS modular.

---
*Relatório final gerado e consolidado pelo Agente Orion.*
