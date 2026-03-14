# Gestor de Tarefas - Frontend Specification

## Design System Overview
The application uses a "Elite Premium" design language characterized by:
- **Glassmorphism**: Transparent cards with background blur (`glass-card`, `glass`).
- **Dark Mode First**: Deep dark backgrounds with glowing accents.
- **Micro-animations**: Subtle transitions and hover effects (`animate-in`, `hover-scale`).
- **Typography**: System-wide sans-serif with strong hierarchy.

## Color Palette (Functional)
- **Primary**: Variable `--primary` (often a deep blue/cyan glow).
- **Secondary**: Variable `--secondary` (often a gold/yellow contrast).
- **Status Colors**:
  - `Iniciada`: Blue
  - `Pausada`: Yellow
  - `Interrompida`: Red
  - `Concluída`: Green
- **Background**: Deep neutral/black with gradients.

## Core Components

### 1. Navigation Shell (Sidebar)
- Fixed vertical navigation on the left.
- Logo/System Name at the top.
- Company switcher and Logout at the bottom.
- Tabs: Dashboard, Users (Admin only), Tasks, Settings.

### 2. Dashboard View
- Multi-column layout for task status (Kanban-like but styled as cards).
- Drag-and-drop support for status updates.
- User selection to filter tasks.
- Responsive grid for company selection.

### 3. Task Management
- Specialized modals for Create/Edit task.
- Date persistence for due dates.
- Bulk selection and delete functionality.

### 4. Custom Selects
- `MultiSelect`: Custom selection badge with search and dropdown.
- `SingleSelect`: Custom searchable dropdown with glassmorphism styling.

## User Experience Flows

### Authentication
1. **Login**: Simple glassmorphism form with email/password.
2. **Register**: Includes initial user setup.

### Company Selection
- After login, the user must select a company from a grid of "Glass Cards".
- Superadmins can create new companies from this view.

### Task Flow
- **Creation**: Accessible via "Nova Tarefa" button. Requires title, status, and due date.
- **Movement**: Tasks can be dragged between columns or updated via the edit modal.
- **Bulk Operations**: Users can enter "Selection Mode" to delete multiple tasks at once.

### Admin/Manager Controls
- **User Management**: Search for global users and link them to the current company.
- **Role Management**: Change user roles within the company (User, Gestor, Admin).

## Performance and Technical Patterns
- **Monolithic Views**: The `Dashboard.jsx` component is currently a monolith containing multiple internal components and state logic.
- **State Persistence**: Uses `localStorage` to remember the active company and tab across reloads.
- **Asynchronous Data**: Axios used for all API calls with standard error handling and "Toasts" for user feedback.

## Responsive Design
- Mobile-friendly grid systems.
- Sidebar collapses or adjusts for smaller screens.
- Modals scale to fit the viewport.
