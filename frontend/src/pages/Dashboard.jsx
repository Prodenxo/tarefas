import { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutDashboard, Building2, Users, CheckSquare, LogOut, Plus, MapPin, Globe, X, ArrowLeft, Link as LinkIcon, Trash2, Clock, Pause, AlertCircle, CheckCircle2, Edit3, Calendar, ChevronDown, Check, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componente MultiSelect Customizado
function MultiSelect({ options, selected, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionId) => {
    const newSelected = selected.includes(optionId)
      ? selected.filter(id => id !== optionId)
      : [...selected, optionId];
    onChange(newSelected);
  };

  return (
    <div className="multi-select-container" ref={dropdownRef}>
      <div className="multi-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        {selected.length === 0 ? (
          <span className="multi-select-placeholder">{placeholder}</span>
        ) : (
          selected.map(id => {
            const option = options.find(o => o.id === id);
            return (
              <span key={id} className="selection-badge">
                {option?.name}
                <button onClick={(e) => { e.stopPropagation(); toggleOption(id); }}><X size={12} /></button>
              </span>
            );
          })
        )}
        <ChevronDown size={16} className="ml-auto text-secondary" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
      </div>

      {isOpen && (
        <div className="multi-select-dropdown glass-card">
          {options.map(option => (
            <div 
              key={option.id} 
              className={`multi-select-option ${selected.includes(option.id) ? 'selected' : ''}`}
              onClick={() => toggleOption(option.id)}
            >
              {option.name}
              {selected.includes(option.id) && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente SingleSelect Customizado com Busca
function SingleSelect({ options, selected, onChange, placeholder = 'Selecionar...', direction = 'down' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limpa a busca ao fechar
  useEffect(() => {
    if (!isOpen) setSearch('');
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === selected);
  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="single-select-container" ref={dropdownRef}>
      <div className={`single-select-trigger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
      </div>

      {isOpen && (
        <div className={`single-select-dropdown glass-card animate-in ${direction === 'up' ? 'upwards' : ''}`}>
          <div className="select-search-container">
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="select-search-input"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="select-options-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div 
                  key={option.value} 
                  className={`single-select-option ${selected === option.value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                  {selected === option.value && <Check size={14} />}
                </div>
              ))
            ) : (
              <div className="no-results" style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nenhum resultado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(() => {
    const saved = localStorage.getItem('selectedCompany');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'dashboard';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]); 
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedUserForLinks, setSelectedUserForLinks] = useState(null);
  const [showManageLinksModal, setShowManageLinksModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState({ title: '', message: '', onConfirm: () => {} });

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { name: 'Visitante', is_superadmin: 0 };
  const token = localStorage.getItem('token');

  // Lógica de Role dinâmica
  const currentRole = user.is_superadmin ? 'superadmin' : (selectedCompany?.user_role || 'user');

  const [newCompany, setNewCompany] = useState({ name: '', address: '', website: '' });
  const [newTask, setNewTask] = useState({ title: '', status: 'Iniciada', due_date: '' });
  const [selectedMemberForDashboard, setSelectedMemberForDashboard] = useState(user);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [waInstance, setWaInstance] = useState('');
  const [waNumber, setWaNumber] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      setCompanies(data);
      
      // Valida se a empresa selecionada ainda existe/usuário tem acesso
      setSelectedCompany(prev => {
        if (!prev) return null;
        const stillExists = data.find(c => c.id === prev.id);
        if (!stillExists) {
          localStorage.removeItem('selectedCompany');
          return null;
        }
        // Só atualiza se os dados mudaram para evitar re-renderizações infinitas
        if (JSON.stringify(stillExists) !== JSON.stringify(prev)) {
          return stillExists;
        }
        return prev;
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar empresas:", err);
      if (err.response?.status === 401 || err.response?.status === 403) handleLogout();
      setError("Não foi possível carregar as empresas.");
      setLoading(false);
    }
  }, [apiUrl, token]);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  const fetchTasks = useCallback(async (userIdProp = null) => {
    if (!selectedCompany) return;
    try {
      const filterUserId = userIdProp || 
        (activeTab === 'dashboard' ? selectedMemberForDashboard.id : null);
      
      let url = `${apiUrl}/tasks?company_id=${selectedCompany.id}`;
      if (filterUserId) url += `&user_id=${filterUserId}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
    }
  }, [apiUrl, token, selectedCompany, activeTab, selectedMemberForDashboard]);

  const [dashboardTasks, setDashboardTasks] = useState([]);

  const fetchDashboardTasks = useCallback(async () => {
    if (!selectedCompany) return;
    try {
      const url = `${apiUrl}/tasks?company_id=${selectedCompany.id}&user_id=${selectedMemberForDashboard.id}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardTasks(response.data);
    } catch (err) {
      console.error("Erro ao buscar tarefas do dashboard:", err);
    }
  }, [apiUrl, token, selectedCompany, selectedMemberForDashboard]);

  const fetchAllDataForSuperadmin = useCallback(async () => {
    if (!user.is_superadmin && currentRole !== 'gestor' && currentRole !== 'admin') return;
    try {
      const [usersRes, compRes] = await Promise.all([
        axios.get(`${apiUrl}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/companies`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      // Use linked_companies from backend
      const usersWithLinking = usersRes.data.map(u => ({ 
        ...u, 
        selectedCompanies: [],
        currentLinks: u.linked_companies || [] 
      }));
      setAllUsers(usersWithLinking);
      setAllCompanies(compRes.data);
      
      // Update selectedUserForLinks if it's currently being viewed (using functional update to avoid dependency)
      setSelectedUserForLinks(prev => {
        if (!prev) return null;
        const updated = usersWithLinking.find(u => u.id === prev.id);
        return updated || prev;
      });
    } catch (err) {
      console.error("Erro ao buscar dados globais:", err);
    }
  }, [apiUrl, token, user.is_superadmin, currentRole]);

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchCompanies();
  }, [token, navigate, fetchCompanies]);

  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
    } else {
      localStorage.removeItem('selectedCompany');
    }
  }, [selectedCompany]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedCompany && activeTab === 'tasks') fetchTasks();
  }, [selectedCompany, activeTab, fetchTasks]);

  useEffect(() => {
    if ((activeTab === 'dashboard' || activeTab === 'users') && selectedCompany) {
      if (activeTab === 'dashboard') fetchDashboardTasks();
      
      // Se for gestor ou admin, busca todos os usuários (backend filtrará o que o gestor pode ver)
      if (user.is_superadmin || currentRole === 'gestor' || currentRole === 'admin') {
        fetchAllDataForSuperadmin();
      }
    }
  }, [activeTab, selectedCompany, selectedMemberForDashboard, fetchDashboardTasks, fetchAllDataForSuperadmin]);

  useEffect(() => {
    if (activeTab === 'settings') {
      axios.get(`${apiUrl}/users/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setWaInstance(res.data.wa_instance || '');
          setWaNumber(res.data.whatsapp_number || '');
        })
        .catch(err => console.error(err));
    }
  }, [activeTab, user.id, apiUrl, token]);

  const handleUpdateWaInstance = async () => {
    try {
      await axios.put(`${apiUrl}/users/${user.id}`, 
        { ...user, wa_instance: waInstance, whatsapp_number: waNumber }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Configurações salvas com sucesso!");
    } catch (err) {
      showToast("Erro ao salvar configuração", "error");
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && !user.is_superadmin && currentRole !== 'gestor' && currentRole !== 'admin') {
      setActiveTab('dashboard');
    }
  }, [activeTab, user.is_superadmin, currentRole]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedCompany');
    localStorage.removeItem('activeTab');
    navigate('/login');
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/companies`, newCompany, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setNewCompany({ name: '', address: '', website: '' });
      fetchCompanies();
      showToast("Empresa cadastrada com sucesso!");
    } catch (err) {
      showToast("Erro ao cadastrar empresa.", "error");
    }
  };

  const handleLinkUserToCompanies = async (userId, companyIds) => {
    if (!companyIds || companyIds.length === 0) return showToast("Selecione pelo menos uma empresa.", "error");
    try {
      await Promise.all(companyIds.map(companyId => 
        axios.post(`${apiUrl}/companies/${companyId}/users`, { userId }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      showToast(`${companyIds.length} Vínculos realizados!`);
      fetchAllDataForSuperadmin(); // Refresh to show new links
    } catch (err) {
      showToast("Erro ao vincular.", "error");
    }
  };

  const handleUnlink = async (userId, companyId) => {
    try {
      await axios.delete(`${apiUrl}/companies/${companyId}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Vínculo removido com sucesso!");
      fetchAllDataForSuperadmin(); // Refresh
      setShowConfirmModal(false);
    } catch (err) {
      showToast("Erro ao desvincular.", "error");
    }
  };

  const openConfirmUnlink = (userId, companyId, companyName) => {
    setConfirmData({
      title: 'Confirmar Desvínculo',
      message: `Deseja realmente remover o vínculo com a empresa "${companyName}"?`,
      onConfirm: () => handleUnlink(userId, companyId)
    });
    setShowConfirmModal(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/tasks`, {
        ...newTask,
        company_id: selectedCompany.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTask({ title: '', status: 'Iniciada', due_date: '' });
      setIsTaskModalOpen(false);
      fetchTasks();
      fetchDashboardTasks();
      showToast("Tarefa criada com sucesso!");
    } catch (err) {
      showToast("Erro ao criar tarefa.", "error");
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/tasks/${editingTask.id}`, {
        title: editingTask.title,
        status: editingTask.status,
        due_date: editingTask.due_date
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingTask(null);
      setIsEditModalOpen(false);
      fetchTasks();
      fetchDashboardTasks();
      showToast("Tarefa atualizada!");
    } catch (err) {
      showToast("Erro ao atualizar tarefa.", "error");
    }
  };

  const handleUpdateUserRole = async (userId, newRole, companyId = null) => {
    const u = allUsers.find(user => user.id === userId);
    try {
      if (companyId) {
        // Atualiza cargo LOCAL (na empresa)
        await axios.put(`${apiUrl}/companies/${companyId}/users/${userId}/role`, { 
          role: newRole 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Atualiza cargo GLOBAL
        await axios.put(`${apiUrl}/users/${userId}`, { 
          name: u.name,
          email: u.email,
          active: u.active,
          role: newRole 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      showToast("Papel alterado com sucesso!");
      fetchAllDataForSuperadmin();
    } catch (err) {
      showToast("Erro ao alterar papel.", "error");
    }
  };

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleDeleteTask = async (taskId) => {
    setConfirmData({
      title: 'Excluir Tarefa',
      message: 'Tem certeza que deseja excluir esta tarefa permanentemente?',
      onConfirm: async () => {
        try {
          await axios.delete(`${apiUrl}/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          showToast("Tarefa excluída com sucesso!");
          fetchTasks();
          fetchDashboardTasks();
          setShowConfirmModal(false);
        } catch (err) {
          showToast("Erro ao excluir tarefa.", "error");
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    
    setConfirmData({
      title: 'Excluir Tarefas',
      message: `Deseja realmente excluir as ${selectedTasks.length} tarefas selecionadas? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        try {
          await axios.post(`${apiUrl}/tasks/bulk-delete`, { ids: selectedTasks }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          showToast(`${selectedTasks.length} tarefas excluídas!`);
          setSelectedTasks([]);
          setIsSelectionMode(false);
          fetchTasks();
          fetchDashboardTasks();
          setShowConfirmModal(false);
        } catch (err) {
          showToast("Erro ao excluir tarefas.", "error");
        }
      }
    });
    setShowConfirmModal(true);
  };

  const toggleSelectAll = () => {
    const allTaskIds = activeTab === 'tasks' ? tasks.map(t => t.id) : dashboardTasks.map(t => t.id);
    if (selectedTasks.length === allTaskIds.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(allTaskIds);
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleDragStart = (e, taskId) => {
    if (isSelectionMode) return; // Desabilita drag no modo seleção
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    setDraggedTaskId(null);

    setDragOverStatus(null);
    e.target.classList.remove('dragging');
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId') || draggedTaskId;
    setDragOverStatus(null);

    if (!taskId) return;

    const task = dashboardTasks.find(t => t.id.toString() === taskId.toString()) || 
                 tasks.find(t => t.id.toString() === taskId.toString());
    
    if (!task || task.status === newStatus) return;

    try {
      // Atualização otimista na UI
      const updateList = (list) => list.map(t => t.id.toString() === taskId.toString() ? { ...t, status: newStatus } : t);
      setDashboardTasks(prev => updateList(prev));
      setTasks(prev => updateList(prev));

      await axios.put(`${apiUrl}/tasks/${taskId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast("Tarefa movida com sucesso!");
    } catch (err) {
      console.error("Erro ao mover tarefa:", err);
      showToast("Erro ao mover tarefa.", "error");
      // Reverter em caso de erro
      fetchTasks();
      fetchDashboardTasks();
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Iniciada': return <Clock size={16} className="text-blue" />;
      case 'Pausada': return <Pause size={16} className="text-yellow" />;
      case 'Interrompida': return <AlertCircle size={16} className="text-red" />;
      case 'Concluída': return <CheckCircle2 size={16} className="text-green" />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sem data';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) return <div className="loading-screen"><h1 className="animate-pulse">Carregando...</h1></div>;

  if (!selectedCompany) {
    return (
      <div className="selection-container">
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              {t.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {t.message}
            </div>
          ))}
        </div>
        
        <header className="selection-header">
          <div className="selection-top-bar">
            <div className="logout-link-premium" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sair</span>
            </div>
          </div>
          
          <div className="selection-title-area">
            <h1>CoreTask</h1>
            <p className="subtitle">Bem-vindo, {user.name}! <span className="badge-role">{user.is_superadmin ? 'SuperAdmin' : 'Membro'}</span></p>
          </div>

          {user.is_superadmin && (
            <div className="selection-actions">
              <button className="btn-centered-premium" onClick={() => setIsModalOpen(true)}>
                <Plus size={22} />
                <span>Nova Empresa</span>
              </button>
            </div>
          )}
        </header>

        {companies.length === 0 ? (
          <div className="empty-state glass">
            <Building2 size={64} opacity={0.5} />
            <h3>Nenhuma empresa encontrada</h3>
            <p>{user.role === 'superadmin' ? "Cadastre uma nova empresa." : "Peça vínculo ao administrador."}</p>
          </div>
        ) : (
          <div className="grid">
            {companies.map(company => (
              <div key={company.id} className="company-card glass" onClick={() => setSelectedCompany(company)}>
                <h3>{company.name}</h3>
                <div className="company-info"><MapPin size={16} /> {company.address}</div>
                <div className="company-info"><Globe size={16} /> {company.website}</div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content glass max-w-sm">
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              <h2 className="flex items-center gap-3" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                <Building2 size={28} color="var(--secondary)" /> Nova Empresa
              </h2>
              <form onSubmit={handleAddCompany} className="mt-8">
                <div className="form-group">
                  <label>Nome da Empresa</label>
                  <input type="text" placeholder="Ex: Onety Solutions" required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Endereço</label>
                  <input type="text" placeholder="Ex: Av. Paulista, 1000" required value={newCompany.address} onChange={e => setNewCompany({...newCompany, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input type="url" placeholder="https://exemplo.com" required value={newCompany.website} onChange={e => setNewCompany({...newCompany, website: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary mt-6" style={{ height: '50px', borderRadius: '14px' }}>Salvar Empresa</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {t.message}
          </div>
        ))}
      </div>

      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>CoreTask</h1>
          <span className="company-name-badge"><Building2 size={12} /> {selectedCompany.name}</span>
        </div>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          {(user.is_superadmin || currentRole === 'gestor' || currentRole === 'admin') && (
            <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              <Users size={20} /> Usuários
            </div>
          )}
          <div className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
            <CheckSquare size={20} /> Tarefas
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> Configurações
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="nav-item" onClick={() => setSelectedCompany(null)}><ArrowLeft size={20} /> Trocar Empresa</div>
          <div className="nav-item text-red" onClick={handleLogout}><LogOut size={20} /> Sair</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="section-header">
          <div>
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p className="text-secondary">{selectedCompany.name} / {activeTab}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {activeTab === 'tasks' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`btn-secondary w-auto ${isSelectionMode ? 'active' : ''}`} 
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedTasks([]);
                  }}
                  style={{ background: isSelectionMode ? 'var(--secondary)' : 'rgba(255,255,255,0.05)', color: isSelectionMode ? 'white' : 'inherit' }}
                >
                  {isSelectionMode ? 'Cancelar Seleção' : 'Selecionar'}
                </button>
                {isSelectionMode && (
                  <button className="btn-secondary w-auto" onClick={toggleSelectAll}>
                    {selectedTasks.length === tasks.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                )}
                {isSelectionMode && selectedTasks.length > 0 && (
                  <button className="btn-primary w-auto bg-red" onClick={handleBulkDelete}>
                    <Trash2 size={18} className="mr-2" /> Excluir ({selectedTasks.length})
                  </button>
                )}
                <button className="btn-primary w-auto" onClick={() => setIsTaskModalOpen(true)}>
                  <Plus size={18} className="mr-2" /> Nova Tarefa
                </button>
              </div>
            )}
            {activeTab === 'users' && (user.is_superadmin || currentRole === 'gestor' || currentRole === 'admin') && (
              <>
                <div className="search-box" style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Pesquisar membros..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input-sm"
                    style={{ width: '250px', marginBottom: 0 }}
                  />
                  {searchTerm && (
                    <div className="search-suggestions glass" style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      right: 0, 
                      zIndex: 100, 
                      marginTop: '8px',
                      width: '300px',
                      maxHeight: '250px',
                      overflowY: 'auto',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                      padding: '8px',
                      backdropFilter: 'blur(20px)'
                    }}>
                      <div style={{ fontSize: '0.7rem', padding: '8px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        SUGESTÕES PARA VÍNCULO
                      </div>
                      {allUsers
                        .filter(u => !u.currentLinks.some(l => l.id === selectedCompany.id))
                        .filter(u => 
                          u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .slice(0, 5)
                        .map(u => (
                          <div 
                            key={u.id} 
                            style={{ 
                              padding: '10px', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              flexDirection: 'column',
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                              transition: '0.2s'
                            }}
                            className="suggestion-item"
                            onClick={() => {
                              setConfirmData({
                                title: 'Vincular Membro',
                                message: `Deseja vincular "${u.name}" (${u.email}) à empresa "${selectedCompany.name}"?`,
                                onConfirm: () => {
                                  handleLinkUserToCompanies(u.id, [selectedCompany.id]);
                                  setSearchTerm('');
                                  setShowConfirmModal(false);
                                }
                              });
                              setShowConfirmModal(true);
                            }}
                          >
                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{u.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                          </div>
                        ))}
                      {allUsers.filter(u => !u.currentLinks.some(l => l.id === selectedCompany.id) && (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                        <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Nenhum novo membro encontrado.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button 
                  className="btn-primary w-auto py-2 px-4 shadow-lg" 
                  onClick={() => setShowLinkModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'max-content' }}
                >
                  <Users size={18} /> Vincular Membro
                </button>
              </>
            )}
          </div>
        </header>

        {activeTab === 'tasks' ? (
          <div className="tasks-container">
            {tasks.length === 0 ? (
              <div className="empty-tasks glass">
                <CheckSquare size={48} opacity={0.3} />
                <p>Nenhuma tarefa nesta empresa.</p>
                <button className="btn-primary w-auto mt-4" onClick={() => setIsTaskModalOpen(true)}>Criar primeira tarefa</button>
              </div>
            ) : (
              <div className="grid">
                 {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`task-card glass ${selectedTasks.includes(task.id) ? 'selected-for-delete' : ''}`}
                    onClick={() => isSelectionMode && toggleTaskSelection(task.id)}
                    style={{ cursor: isSelectionMode ? 'pointer' : 'default' }}
                  >
                    <div className="task-header">
                      {isSelectionMode && (
                        <div className="task-checkbox-container" style={{ marginRight: '12px' }}>
                          <div className={`custom-checkbox ${selectedTasks.includes(task.id) ? 'checked' : ''}`}>
                            {selectedTasks.includes(task.id) && <Check size={12} />}
                          </div>
                        </div>
                      )}
                      <h4 style={{ flex: 1 }}>{task.title}</h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                         {!isSelectionMode && (
                           <>
                             <button 
                                className="icon-btn" 
                                onClick={() => {
                                  setEditingTask({...task, due_date: task.due_date ? task.due_date.split('T')[0] : ''});
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit3 size={16} />
                             </button>
                             <button 
                                className="icon-btn text-red" 
                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                              >
                                <Trash2 size={16} />
                             </button>
                           </>
                         )}
                         <span className={`task-badge ${task.status}`}>{task.status}</span>
                      </div>
                    </div>
                    <div className="task-info-row">
                       <Calendar size={14} /> <span>{formatDate(task.due_date)}</span>
                    </div>
                    <div className="task-footer">
                      <span className="task-creator"><Users size={14} /> {task.creator_name || 'Usuário'}</span>
                      {getStatusIcon(task.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'users' && (user.is_superadmin || currentRole === 'gestor' || currentRole === 'admin') ? (
          <div className="users-panel glass">
            <div className="panel-header" style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Membros - {selectedCompany?.name}</h3>
            </div>
            <div className="glass-table-container">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Email</th>
                    {user.is_superadmin && <th>Cargo (Role)</th>}
                    <th>Vínculos</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers
                    .filter(u => u.currentLinks.some(l => l.id === selectedCompany.id))
                    .filter(u => 
                      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      u.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar-placeholder">{u.name.charAt(0)}</div>
                            {u.name}
                          </div>
                        </td>
                        <td className="text-secondary">{u.email}</td>
                        
                          <td>
                            {(user.is_superadmin || currentRole === 'gestor' || currentRole === 'admin') && (u.id === user.id || u.is_superadmin) ? (
                              <div className="text-secondary flex items-center gap-2 p-2">
                                {u.is_superadmin ? <AlertCircle size={14} className="text-secondary" /> : <Clock size={14} className="text-secondary" />} 
                                {u.is_superadmin ? 'Superadmin' : 'Gestor/Admin'}
                              </div>
                            ) : (
                              <SingleSelect 
                                options={[
                                  { value: 'user', label: 'Colaborador' },
                                  { value: 'gestor', label: 'Gestor' },
                                  { value: 'admin', label: 'Admin Local' }
                                ]}
                                selected={u.currentLinks.find(l => l.id === selectedCompany.id)?.role || 'user'}
                                onChange={(newRole) => handleUpdateUserRole(u.id, newRole, selectedCompany.id)}
                              />
                            )}
                          </td>

                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {u.currentLinks
                              .filter(link => user.is_superadmin || link.id === selectedCompany.id)
                              .map(link => (
                              <span key={link.id} className="selection-badge">
                                {link.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {!(currentRole === 'gestor' && user.id === u.id) && (
                            <button 
                              className="icon-btn" 
                              style={{ 
                                color: 'var(--secondary)', 
                                background: 'rgba(var(--secondary-rgb), 0.1)',
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid rgba(var(--secondary-rgb), 0.2)'
                              }}
                              onClick={() => {
                                setSelectedUserForLinks(u);
                                setShowManageLinksModal(true);
                              }}
                              title="Gerenciar Vínculos"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Modal para Gerenciar Vínculos */}
            {showManageLinksModal && selectedUserForLinks && (
              <div className="modal-overlay" onClick={() => setShowManageLinksModal(false)}>
                <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                  <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Gerenciar Vínculos: {selectedUserForLinks.name}</h2>
                    <button onClick={() => { setShowManageLinksModal(false); setSelectedUserForLinks(null); }} className="icon-btn"><X /></button>
                  </div>
                  
                  <p className="text-secondary mb-4">Selecione uma empresa para remover o vínculo deste usuário.</p>

                  <div className="links-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedUserForLinks.currentLinks
                      .filter(link => user.is_superadmin || link.id === selectedCompany.id)
                      .map(link => (
                      <div key={link.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Building2 size={18} className="text-secondary" />
                          <span style={{ fontWeight: '500' }}>{link.name}</span>
                        </div>
                        {!(currentRole === 'gestor' && user.id === selectedUserForLinks.id) && (
                          <button 
                            className="icon-btn text-red" 
                            style={{ background: 'rgba(255, 59, 48, 0.1)', padding: '6px' }}
                            onClick={() => openConfirmUnlink(selectedUserForLinks.id, link.id, link.name)}
                            title="Remover Vínculo"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="modal-footer" style={{ marginTop: '24px', textAlign: 'right' }}>
                    <button className="btn-secondary w-auto" onClick={() => { setShowManageLinksModal(false); setSelectedUserForLinks(null); }}>Fechar</button>
                  </div>
                </div>
              </div>
            )}



            {/* Modal para Vincular Novo Membro */}
            {showLinkModal && (
              <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
                <div className="modal-content glass" onClick={e => e.stopPropagation()}>
                  <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Vincular a {selectedCompany.name}</h2>
                    <button onClick={() => setShowLinkModal(false)} className="icon-btn"><X /></button>
                  </div>
                  
                  <div className="form-group">
                    <label>Buscar usuário por nome ou email</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Ex: joao@email.com..." 
                        value={modalSearch}
                        onChange={(e) => setModalSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="user-selection-list" style={{ maxHeight: '300px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {allUsers
                      .filter(u => !u.is_superadmin)
                      .filter(u => !u.currentLinks.some(l => l.id === selectedCompany.id))
                      .filter(u => u.name.toLowerCase().includes(modalSearch.toLowerCase()) || u.email.toLowerCase().includes(modalSearch.toLowerCase()))
                      .map(u => (
                        <div key={u.id} className="user-selection-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>{u.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                          </div>
                          <button 
                            className="btn-primary w-auto py-1 px-3" 
                            style={{ fontSize: '0.8rem' }}
                            onClick={() => {
                              handleLinkUserToCompanies(u.id, [selectedCompany.id]);
                              // Não fecha o modal para permitir múltiplos vínculos rápidos
                            }}
                          >
                            Vincular
                          </button>
                        </div>
                      ))}
                    {(allUsers.filter(u => !u.is_superadmin && !u.currentLinks.some(l => l.id === selectedCompany.id)).length === 0) && (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum usuário disponível para vincular.</div>
                    )}
                  </div>

                  <div className="modal-footer" style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button className="icon-btn" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={() => setShowLinkModal(false)}>Fechar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'settings' ? (
          <div className="settings-container glass p-8" style={{ borderRadius: '16px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="mb-6 flex items-center gap-2">
              <Settings size={28} color="var(--secondary)" /> Configurações de Integração
            </h2>
            
            <div className="card-glass p-6 mb-6">
              <h3 className="mb-4" style={{ fontSize: '1.1rem' }}>WhatsApp & Automação</h3>
              <p className="text-secondary mb-6" style={{ fontSize: '0.9rem' }}>
                Vincule o nome da sua instância do WhatsApp para transformar mensagens recebidas em tarefas automáticas.
              </p>
              
              <div className="form-group">
                <label>Nome da Instância (Evolution API)</label>
                <input 
                  type="text" 
                  placeholder="Ex: Oficial" 
                  value={waInstance}
                  onChange={(e) => setWaInstance(e.target.value)}
                />
              </div>

              <div className="form-group mt-4">
                <label>Seu Número do WhatsApp (Com DDD)</label>
                <input 
                  type="text" 
                  placeholder="Ex: 11999999999" 
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Este número receberá avisos quando você criar novas tarefas.
                </p>
              </div>
              
              <button className="btn-primary w-full mt-6" onClick={handleUpdateWaInstance}>
                Salvar Configurações
              </button>
            </div>

            <div className="card-glass p-6" style={{ opacity: 0.7 }}>
              <h3 className="mb-2" style={{ fontSize: '1rem' }}>Status da Webhook</h3>
              <p style={{ fontSize: '0.8rem' }}>
                Endereço de destino: <br/>
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                  {window.location.origin.replace(':5173', ':3001')}/webhooks/whatsapp
                </code>
              </p>
            </div>
          </div>
        ) : (
          <div className="dashboard-content">
            <div className="dashboard-grid">
              {['Iniciada', 'Pausada', 'Interrompida', 'Concluída'].map(status => (
                <div 
                  key={status} 
                  className={`status-column glass ${dragOverStatus === status ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDrop={(e) => handleDrop(e, status)}
                  onDragLeave={() => setDragOverStatus(null)}
                >
                  <div className="column-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(status)}
                      <h3>{status}</h3>
                    </div>
                    <span className="count-badge">
                      {dashboardTasks.filter(t => t.status === status).length}
                    </span>
                  </div>
                  
                  <div className="column-tasks">
                     {dashboardTasks.filter(t => t.status === status).map(task => (
                      <div 
                        key={task.id} 
                        className={`task-item glass ${draggedTaskId === task.id ? 'dragging' : ''} ${selectedTasks.includes(task.id) ? 'selected-for-delete' : ''}`}
                        onClick={() => {
                          if (isSelectionMode) {
                            toggleTaskSelection(task.id);
                          } else {
                            setEditingTask({...task, due_date: task.due_date ? task.due_date.split('T')[0] : ''});
                            setIsEditModalOpen(true);
                          }
                        }}
                        draggable={!isSelectionMode}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        style={{ cursor: 'pointer', position: 'relative' }}
                      >
                        {isSelectionMode && (
                          <div className="task-item-checkbox" style={{ position: 'absolute', top: '8px', right: '8px' }}>
                            <div className={`custom-checkbox sm ${selectedTasks.includes(task.id) ? 'checked' : ''}`}>
                              {selectedTasks.includes(task.id) && <Check size={10} />}
                            </div>
                          </div>
                        )}
                        {!isSelectionMode && (
                          <button 
                            className="icon-btn text-red hover-only" 
                            style={{ position: 'absolute', top: '4px', right: '4px', opacity: 0, transition: '0.2s' }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <div style={{ fontWeight: '500', marginBottom: '8px', paddingRight: isSelectionMode ? '24px' : '0' }}>{task.title}</div>
                        <div className="task-item-footer">
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <Calendar size={12} style={{ marginRight: '4px' }} />
                            {formatDate(task.due_date)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {dashboardTasks.filter(t => t.status === status).length === 0 && (
                      <div className="empty-column">Nenhuma tarefa</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isTaskModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content glass max-w-sm">
              <button className="close-btn" onClick={() => setIsTaskModalOpen(false)}><X size={20} /></button>
              <h2 className="flex items-center gap-3" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                <CheckSquare size={28} color="var(--secondary)" /> Nova Tarefa
              </h2>
              <form onSubmit={handleCreateTask} className="mt-8">
                <div className="form-group">
                  <label>O que precisa ser feito?</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Finalizar relatório" 
                    required 
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Responsável</label>
                  <input type="text" value={user.name} disabled className="bg-dim" />
                </div>
                <div className="form-group">
                  <label>Data de Conclusão</label>
                  <input 
                    type="date" 
                    value={newTask.due_date} 
                    onChange={e => setNewTask({...newTask, due_date: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Status Inicial</label>
                  <SingleSelect 
                    options={[
                      { value: 'Iniciada', label: 'Iniciada' },
                      { value: 'Pausada', label: 'Pausada' },
                      { value: 'Interrompida', label: 'Interrompida' },
                      { value: 'Concluída', label: 'Concluída' }
                    ]}
                    selected={newTask.status}
                    onChange={(val) => setNewTask({...newTask, status: val})}
                  />
                </div>
                <button type="submit" className="btn-primary mt-6" style={{ height: '50px', borderRadius: '14px' }}>Criar Tarefa</button>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && editingTask && (
          <div className="modal-overlay">
            <div className="modal-content glass max-w-sm">
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
              <h2 className="flex items-center gap-3" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                <Edit3 size={28} color="var(--secondary)" /> Editar Tarefa
              </h2>
              <form onSubmit={handleUpdateTask} className="mt-8">
                <div className="form-group">
                  <label>Título da Tarefa</label>
                  <input 
                    type="text" 
                    required 
                    value={editingTask.title} 
                    onChange={e => setEditingTask({...editingTask, title: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Data de Conclusão</label>
                  <input 
                    type="date" 
                    value={editingTask.due_date} 
                    onChange={e => setEditingTask({...editingTask, due_date: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <SingleSelect 
                    options={[
                      { value: 'Iniciada', label: 'Iniciada' },
                      { value: 'Pausada', label: 'Pausada' },
                      { value: 'Interrompida', label: 'Interrompida' },
                      { value: 'Concluída', label: 'Concluída' }
                    ]}
                    selected={editingTask.status}
                    onChange={(val) => setEditingTask({...editingTask, status: val})}
                  />
                </div>
                <button type="submit" className="btn-primary mt-6" style={{ height: '50px', borderRadius: '14px' }}>Salvar Alterações</button>
              </form>
            </div>
          </div>
        )}

        {selectedCompany && (
          <div className="dashboard-floating-selector">
            <div className="floating-selector-group">
              <div className="selector-label">Empresa:</div>
              <SingleSelect 
                options={companies
                  .filter(c => !selectedMemberForDashboard.currentLinks || selectedMemberForDashboard.currentLinks.some(l => l.id === c.id))
                  .map(c => ({ value: c.id, label: c.name }))
                }
                selected={selectedCompany.id}
                onChange={(id) => {
                  const company = companies.find(c => c.id === id);
                  if (company) {
                    setSelectedCompany(company);
                    // Não resetamos o usuário aqui para permitir trocar de empresa e continuar vendo o mesmo usuário
                  }
                }}
                placeholder="Selecionar Empresa"
                direction="up"
              />
            </div>

            {(user.is_superadmin || currentRole === 'gestor' || currentRole === 'admin') && activeTab === 'dashboard' && (
              <div className="floating-selector-group">
                <div className="selector-label">Visualizando Membro:</div>
                <SingleSelect 
                  options={allUsers
                    .filter(u => user.is_superadmin || u.currentLinks.some(l => l.id === selectedCompany.id))
                    .map(u => ({ value: u.id, label: u.name }))
                  }
                  selected={selectedMemberForDashboard.id}
                  onChange={(id) => {
                    const member = allUsers.find(u => u.id === id);
                    if (member) setSelectedMemberForDashboard(member);
                  }}
                  placeholder="Selecionar Usuário"
                  direction="up"
                />
              </div>
            )}
          </div>
        )}

        {/* Modal de Confirmação Customizado */}
        {showConfirmModal && (
          <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-content glass" style={{ maxWidth: '400px', textAlign: 'center', padding: '32px' }}>
                <div style={{ background: 'rgba(255, 59, 48, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <AlertCircle size={32} color="#ff3b30" />
                </div>
                <h2 style={{ margin: '0 0 12px' }}>{confirmData.title}</h2>
                <p className="text-secondary" style={{ marginBottom: '24px' }}>{confirmData.message}</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn-secondary w-auto px-6" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
                  <button className="btn-primary w-auto px-6" style={{ background: '#ff3b30' }} onClick={confirmData.onConfirm}>Confirmar</button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
