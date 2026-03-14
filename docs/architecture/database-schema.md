# Gestor de Tarefas - Database Schema

## Overview
The database is a MySQL instance using raw SQL for queries. It manages users, companies, their relationships (many-to-many), tasks, and WhatsApp conversational sessions.

## Entity Relationship Summary
- **Users** can belong to multiple **Companies** via `user_companies`.
- **Companies** have many **Tasks**.
- **Tasks** are created by a **User** and assigned to a **User**.
- **User WhatsApp Sessions** track the current step of a user interacting via WhatsApp.

---

## Table Schemas

### 1. `users`
Stores user identity and global configuration.

| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | bigint unsigned | NO | PRI | NULL | auto_increment |
| name | varchar(120) | NO | | NULL | |
| email | varchar(190) | NO | UNI | NULL | |
| password_hash | varchar(255) | NO | | NULL | |
| is_superadmin | tinyint(1) | YES | | 0 | |
| active | tinyint(1) | NO | MUL | 1 | |
| wa_instance | varchar(100) | YES | | NULL | |
| whatsapp_number | varchar(20) | YES | | NULL | |
| created_at | timestamp | NO | | CURRENT_TIMESTAMP | |
| updated_at | timestamp | NO | | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### 2. `companies`
Stores organization details.

| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | bigint unsigned | NO | PRI | NULL | auto_increment |
| name | varchar(190) | NO | | NULL | |
| address | text | YES | | NULL | |
| website | varchar(190) | YES | | NULL | |
| active | tinyint(1) | NO | MUL | 1 | |
| created_at | timestamp | NO | | CURRENT_TIMESTAMP | |
| updated_at | timestamp | NO | | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### 3. `user_companies`
Pivot table for the Many-to-Many relationship between Users and Companies.

| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | bigint unsigned | NO | PRI | NULL | auto_increment |
| user_id | bigint unsigned | NO | MUL | NULL | |
| company_id | bigint unsigned | YES | MUL | NULL | |
| role | varchar(50) | YES | MUL | 'user' | |
| active | tinyint(1) | NO | MUL | 1 | |
| created_at | timestamp | NO | | CURRENT_TIMESTAMP | |

### 4. `tasks`
Core task entity.

| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| id | bigint unsigned | NO | PRI | NULL | auto_increment |
| company_id | bigint unsigned | NO | MUL | NULL | |
| created_by_user_id | bigint unsigned | NO | MUL | NULL | |
| assigned_to_user_id | bigint unsigned | NO | MUL | NULL | |
| title | varchar(255) | NO | | NULL | |
| status | enum(...) | YES | | 'Iniciada' | |
| due_date | date | YES | | NULL | |
| created_at | timestamp | YES | | CURRENT_TIMESTAMP | |
| updated_at | timestamp | YES | | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

### 5. `user_whatsapp_sessions`
State management for the WhatsApp conversational flow.

| Field | Type | Null | Key | Default | Extra |
|-------|------|------|-----|---------|-------|
| user_id | bigint unsigned | NO | PRI | NULL | |
| step | varchar(50) | NO | | 'NONE' | |
| data | json | YES | | NULL | |
| updated_at | timestamp | NO | | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

---

## Indices and Performance
- `users`: Unique index on `email`.
- `user_companies`: Indices on `user_id`, `company_id`, `role`, and `active`.
- `tasks`: Foreign keys (with indices) on `company_id`, `created_by_user_id`, and `assigned_to_user_id`.
