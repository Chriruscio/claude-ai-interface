// Claude AI Interface - Complete Frontend Logic with New Features
let currentUser = null;
let currentProject = null;
let currentConversation = null;
let apiKey = localStorage.getItem('claude-api-key') || '';
let isConnected = false;
let uploadedFiles = [];
let conversations = [];
let projectDocuments = [];
let artifacts = [];

// Statistics tracking
let sessionStats = {
    tokensUsed: 0,
    messagesSent: 0,
    estimatedCost: 0
};

// User settings
let userSettings = {
    apiSpendingLimit: 10.00,
    apiWarningThreshold: 8.00
};

// Theme management
let isDarkMode = localStorage.getItem('dark-mode') === 'true';

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Inizializzazione Claude AI Interface...');
    
    // Apply theme
    applyTheme();
    
    // Setup event listeners
    setupEventListeners();
    
    // Test API key se presente
    if (apiKey) {
        document.getElementById('apiKeyInput').value = apiKey;
        await testConnection();
    } else {
        updateConnectionStatus(false);
    }
    
    // Setup file upload
    setupFileUpload();
    
    // Check for existing session
    setTimeout(async () => {
        if (window.supabase) {
            const { data, error } = await window.supabase.auth.getSession();
            if (data?.session?.user) {
                console.log('✅ Sessione esistente:', data.session.user.email);
                currentUser = data.session.user;
                showUserInterface(data.session.user);
                await loadUserData();
            } else {
                showWelcomeState();
            }
        } else {
            showWelcomeState();
        }
    }, 1000);

    // Auth state listener
    if (window.supabase) {
        window.supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth event:', event, session?.user?.email);
            if (event === 'SIGNED_IN' && session?.user) {
                currentUser = session.user;
                showUserInterface(session.user);
                loadUserData();
            } else if (event === 'SIGNED_OUT') {
                handleLogout();
            }
        });
    }
}

function setupEventListeners() {
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', collapseSidebar);
    
    // Send message
    document.getElementById('sendButton').addEventListener('click', sendMessage);
    
    // Message input
    const textarea = document.getElementById('messageInput');
    textarea.addEventListener('input', autoResize);
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Theme toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = isDarkMode;
        darkModeToggle.addEventListener('change', toggleTheme);
    }

    // Close modals on backdrop click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });

    // Close user menu when clicking outside
    document.addEventListener('click', function(e) {
        const userMenu = document.getElementById('userMenu');
        const userInfo = document.getElementById('userInfo');
        
        if (userMenu && !userInfo.contains(e.target)) {
            userMenu.style.display = 'none';
        }
    });
}

// Theme management
function applyTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('dark-mode', isDarkMode.toString());
    applyTheme();
}

// Authentication
async function googleLogin() {
    if (!window.supabase) {
        alert('❌ Errore: Supabase non inizializzato');
        return;
    }

    try {
        console.log('🔐 Avvio login Google...');
        const { error } = await window.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) {
            console.error('Login error:', error);
            alert('❌ Errore nel login: ' + error.message);
        }
    } catch (error) {
        console.error('Login exception:', error);
        alert('❌ Errore nel login');
    }
}

async function logoutUser() {
    if (!window.supabase) return;
    
    try {
        await window.supabase.auth.signOut();
        handleLogout();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function handleLogout() {
    console.log('👋 Logout completato');
    currentUser = null;
    currentProject = null;
    currentConversation = null;
    conversations = [];
    uploadedFiles = [];
    projectDocuments = [];
    artifacts = [];
    showLoginInterface();
}

function showUserInterface(user) {
    console.log('👤 Mostra interfaccia per:', user.email);
    
    // Update UI visibility
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('newChatBtn').style.display = 'flex';
    document.getElementById('conversationsSection').style.display = 'block';
    document.getElementById('projectsSection').style.display = 'block';
    document.getElementById('projectDocumentsSection').style.display = 'block';
    
    // Update user info
    document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
    const avatar = document.getElementById('userAvatar');
    if (user.user_metadata?.picture || user.user_metadata?.avatar_url) {
        avatar.src = user.user_metadata.picture || user.user_metadata.avatar_url;
    }
    
    // Enable input
    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = false;
    messageInput.placeholder = 'Scrivi un messaggio a Claude...';
    
    if (apiKey && isConnected) {
        document.getElementById('sendButton').disabled = false;
    }
    
    // Hide welcome state, show chat interface
    hideWelcomeState();
    
    // Show statistics when user logs in
    document.getElementById('tokenStats').style.display = 'block';
    updateStatsDisplay();
}

function showLoginInterface() {
    console.log('🔐 Mostra interfaccia login');
    
    // Update UI visibility
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('newChatBtn').style.display = 'none';
    document.getElementById('conversationsSection').style.display = 'none';
    document.getElementById('projectsSection').style.display = 'none';
    document.getElementById('projectDocumentsSection').style.display = 'none';
    
    // Disable input
    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = true;
    messageInput.placeholder = 'Accedi per iniziare...';
    document.getElementById('sendButton').disabled = true;
    
    // Show welcome state
    showWelcomeState();
    
    // Hide statistics when logged out
    document.getElementById('tokenStats').style.display = 'none';
}

function showWelcomeState() {
    const welcomeState = document.getElementById('welcomeState');
    const messagesContainer = document.getElementById('messagesContainer');
    
    if (welcomeState) welcomeState.style.display = 'flex';
    if (messagesContainer) messagesContainer.style.display = 'none';
}

function hideWelcomeState() {
    const welcomeState = document.getElementById('welcomeState');
    const messagesContainer = document.getElementById('messagesContainer');
    
    if (welcomeState) welcomeState.style.display = 'none';
    if (messagesContainer) messagesContainer.style.display = 'block';
}

// User menu management
function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const isVisible = userMenu.style.display === 'block';
    userMenu.style.display = isVisible ? 'none' : 'block';
}

// Sidebar management
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function collapseSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Suggestions
function sendSuggestion(text) {
    if (!currentUser) {
        alert('⚠️ Accedi prima per utilizzare i suggerimenti');
        return;
    }
    
    document.getElementById('messageInput').value = text;
    sendMessage();
}

// Project management
function createProject() {
    document.getElementById('createProjectModal').style.display = 'block';
    document.getElementById('projectNameInput').focus();
}

function closeCreateProject() {
    document.getElementById('createProjectModal').style.display = 'none';
    document.getElementById('projectNameInput').value = '';
    document.getElementById('projectDescInput').value = '';
}

async function saveProject() {
    const name = document.getElementById('projectNameInput').value.trim();
    const description = document.getElementById('projectDescInput').value.trim();
    
    if (!name) {
        alert('❌ Inserisci un nome per il progetto');
        return;
    }
    
    if (!currentUser || !window.supabase) {
        alert('❌ Devi essere connesso per creare un progetto');
        return;
    }

    try {
        console.log('📁 Creazione progetto:', name);
        
        const { data, error } = await window.supabase
            .from('projects')
            .insert([{
                name: name,
                description: description || null,
                user_id: currentUser.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating project:', error);
            alert('❌ Errore nella creazione del progetto');
            return;
        }

        console.log('✅ Progetto creato:', data);
        closeCreateProject();
        await loadUserData();
        
    } catch (error) {
        console.error('Exception creating project:', error);
        alert('❌ Errore nella creazione del progetto');
    }
}

// NEW: Delete project function
async function deleteProject(projectId, projectName) {
    if (!confirm(`Sei sicuro di voler eliminare il progetto "${projectName}"? Questa azione eliminerà anche tutte le conversazioni e documenti associati.`)) {
        return;
    }
    
    if (!window.supabase) return;
    
    try {
        console.log('🗑️ Eliminazione progetto:', projectId);
        
        const { error } = await window.supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) {
            console.error('Error deleting project:', error);
            alert('❌ Errore nell\'eliminare il progetto');
            return;
        }

        // If this was the active project, clear it
        if (currentProject === projectId) {
            currentProject = null;
            showWelcomeState();
        }

        await loadUserData();
        console.log('✅ Progetto eliminato');
        
    } catch (error) {
        console.error('Exception deleting project:', error);
        alert('❌ Errore nell\'eliminare il progetto');
    }
}

// NEW: Rename project function
async function renameProject(projectId) {
    const newName = prompt('Nuovo nome per il progetto:');
    if (!newName || !window.supabase) return;
    
    try {
        const { error } = await window.supabase
            .from('projects')
            .update({ 
                name: newName.trim(),
                updated_at: new Date().toISOString() 
            })
            .eq('id', projectId);

        if (error) {
            console.error('Error renaming project:', error);
            alert('❌ Errore nel rinominare il progetto');
            return;
        }

        await loadUserData();
        console.log('✅ Progetto rinominato');
        
    } catch (error) {
        console.error('Exception renaming project:', error);
    }
}

async function loadUserData() {
    if (!currentUser || !window.supabase) return;

    try {
        console.log('📊 Caricamento dati utente...');
        
        // Load user settings
        const { data: settings, error: settingsError } = await window.supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
            console.error('Error loading settings:', settingsError);
        } else if (settings) {
            userSettings = {
                apiSpendingLimit: parseFloat(settings.api_spending_limit),
                apiWarningThreshold: parseFloat(settings.api_warning_threshold)
            };
            console.log('✅ Impostazioni caricate:', userSettings);
        }
        
        // Load projects
        const { data: projects, error: projectsError } = await window.supabase
            .from('projects')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('updated_at', { ascending: false });

        if (projectsError) {
            console.error('Error loading projects:', projectsError);
        } else {
            console.log('✅ Progetti caricati:', projects?.length || 0);
            renderProjects(projects || []);
        }
        
        // Load conversations
        const { data: convs, error: convsError } = await window.supabase
            .from('conversations')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('updated_at', { ascending: false })
            .limit(50);

        if (convsError) {
            console.error('Error loading conversations:', convsError);
        } else {
            conversations = convs || [];
            console.log('✅ Conversazioni caricate:', conversations.length);
            renderConversations();
        }

        // Load project documents if a project is selected
        if (currentProject) {
            await loadProjectDocuments();
        }
        
    } catch (error) {
        console.error('Exception loading user data:', error);
    }
}

function renderProjects(projects) {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;
    
    projectsList.innerHTML = '';

    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div style="text-align: center; padding: 16px; color: var(--text-tertiary); font-size: 12px;">
                Nessun progetto
            </div>
        `;
        return;
    }

    projects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'project-item';
        projectDiv.dataset.id = project.id;
        
        if (currentProject === project.id) {
            projectDiv.classList.add('active');
        }
        
        projectDiv.innerHTML = `
            <i class="fas fa-folder project-icon"></i>
            <div class="project-details">
                <div class="project-title">${project.name}</div>
                <div class="project-meta">0 conversazioni</div>
            </div>
            <div class="project-actions">
                <button class="project-action" onclick="renameProject(${project.id})" title="Rinomina">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="project-action" onclick="deleteProject(${project.id}, '${project.name}')" title="Elimina">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        projectDiv.addEventListener('click', function(e) {
            if (!e.target.closest('.project-actions')) {
                selectProject(project.id, project.name);
            }
        });
        
        projectsList.appendChild(projectDiv);
    });
}

function selectProject(projectId, projectName) {
    currentProject = projectId;
    console.log('📁 Progetto selezionato:', projectName);
    
    // Update UI
    document.querySelectorAll('.project-item').forEach(el => {
        el.classList.remove('active');
    });
    
    const selectedElement = document.querySelector(`[data-id="${projectId}"]`);
    if (selectedElement) {
        selectedElement.classList.add('active');
    }
    
    // Show project documents section
    document.getElementById('projectDocumentsSection').style.display = 'block';
    
    // Load project documents
    loadProjectDocuments();
    
    // Filter conversations by project
    renderConversations();
}

// NEW: Project Documents Management
async function loadProjectDocuments() {
    if (!currentProject || !window.supabase) return;
    
    try {
        const { data: docs, error } = await window.supabase
            .from('project_documents')
            .select('*')
            .eq('project_id', currentProject)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading project documents:', error);
            return;
        }

        projectDocuments = docs || [];
        console.log('📄 Documenti progetto caricati:', projectDocuments.length);
        renderProjectDocuments();
        
    } catch (error) {
        console.error('Exception loading project documents:', error);
    }
}

function renderProjectDocuments() {
    const docsList = document.getElementById('projectDocumentsList');
    if (!docsList) return;
    
    docsList.innerHTML = '';

    if (projectDocuments.length === 0) {
        docsList.innerHTML = `
            <div style="text-align: center; padding: 16px; color: var(--text-tertiary); font-size: 12px;">
                Nessun documento nel progetto
            </div>
        `;
        return;
    }

    projectDocuments.forEach(doc => {
        const docDiv = document.createElement('div');
        docDiv.className = 'document-item';
        
        docDiv.innerHTML = `
            <div class="document-icon">
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="document-details">
                <div class="document-title">${doc.name}</div>
                <div class="document-meta">${formatFileSize(doc.size || 0)} • ${new Date(doc.created_at).toLocaleDateString()}</div>
            </div>
            <div class="document-actions">
                <button class="document-action" onclick="downloadDocument('${doc.id}')" title="Scarica">
                    <i class="fas fa-download"></i>
                </button>
                <button class="document-action" onclick="deleteDocument('${doc.id}')" title="Elimina">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        docsList.appendChild(docDiv);
    });
}

async function uploadProjectDocument() {
    if (!currentProject) {
        alert('⚠️ Seleziona prima un progetto');
        return;
    }
    
    document.getElementById('projectFileUploadModal').style.display = 'block';
}

function closeProjectFileUpload() {
    document.getElementById('projectFileUploadModal').style.display = 'none';
    // Reset file input
    document.getElementById('projectFileInput').value = '';
}

async function handleProjectFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert(`File ${file.name} è troppo grande (max 10MB)`);
            continue;
        }
        
        try {
            await uploadFileToProject(file);
        } catch (error) {
            console.error('Error uploading file:', file.name, error);
            alert(`Errore nel caricare ${file.name}`);
        }
    }
    
    closeProjectFileUpload();
    await loadProjectDocuments();
}

async function uploadFileToProject(file) {
    if (!currentProject || !currentUser || !window.supabase) return;
    
    try {
        // Read file content
        const content = await readFileContent(file);
        
        // Upload to Supabase Storage
        const fileName = `${currentUser.id}/${currentProject}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await window.supabase.storage
            .from('project-documents')
            .upload(fileName, file);

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw uploadError;
        }

        // Save metadata to database
        const { error: dbError } = await window.supabase
            .from('project_documents')
            .insert([{
                project_id: currentProject,
                user_id: currentUser.id,
                name: file.name,
                content: content,
                file_path: fileName,
                size: file.size,
                mime_type: file.type,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);

        if (dbError) {
            console.error('Database insert error:', dbError);
            throw dbError;
        }

        console.log('✅ Documento caricato:', file.name);
        
    } catch (error) {
        console.error('Exception uploading file:', error);
        throw error;
    }
}

async function downloadDocument(docId) {
    const doc = projectDocuments.find(d => d.id === parseInt(docId));
    if (!doc || !window.supabase) return;
    
    try {
        const { data, error } = await window.supabase.storage
            .from('project-documents')
            .download(doc.file_path);

        if (error) {
            console.error('Download error:', error);
            alert('❌ Errore nel download del documento');
            return;
        }

        // Create download link
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Exception downloading document:', error);
        alert('❌ Errore nel download del documento');
    }
}

async function deleteDocument(docId) {
    const doc = projectDocuments.find(d => d.id === parseInt(docId));
    if (!doc || !confirm(`Sei sicuro di voler eliminare "${doc.name}"?`)) return;
    
    if (!window.supabase) return;
    
    try {
        // Delete from storage
        const { error: storageError } = await window.supabase.storage
            .from('project-documents')
            .remove([doc.file_path]);

        if (storageError) {
            console.error('Storage delete error:', storageError);
        }

        // Delete from database
        const { error: dbError } = await window.supabase
            .from('project_documents')
            .delete()
            .eq('id', docId);

        if (dbError) {
            console.error('Database delete error:', dbError);
            alert('❌ Errore nell\'eliminare il documento');
            return;
        }

        await loadProjectDocuments();
        console.log('✅ Documento eliminato');
        
    } catch (error) {
        console.error('Exception deleting document:', error);
        alert('❌ Errore nell\'eliminare il documento');
    }
}

function renderConversations() {
    const todayChats = document.getElementById('todayChats');
    const previousChats = document.getElementById('previousChats');
    
    if (!todayChats || !previousChats) return;
    
    // Filter conversations by current project
    const projectConversations = currentProject 
        ? conversations.filter(conv => conv.project_id === currentProject)
        : conversations;
    
    // Separate today and previous
    const today = new Date().toDateString();
    const todayConvs = projectConversations.filter(conv => 
        new Date(conv.updated_at).toDateString() === today
    );
    const previousConvs = projectConversations.filter(conv => 
        new Date(conv.updated_at).toDateString() !== today
    );
    
    // Render today's conversations
    todayChats.innerHTML = '';
    todayConvs.forEach(conv => {
        const convDiv = createConversationElement(conv);
        todayChats.appendChild(convDiv);
    });
    
    if (todayConvs.length === 0) {
        todayChats.innerHTML = '<div style="padding: 8px; color: var(--text-tertiary); font-size: 12px;">Nessuna conversazione oggi</div>';
    }
    
    // Render previous conversations
    previousChats.innerHTML = '';
    previousConvs.slice(0, 20).forEach(conv => {
        const convDiv = createConversationElement(conv);
        previousChats.appendChild(convDiv);
    });
    
    if (previousConvs.length === 0) {
        previousChats.innerHTML = '<div style="padding: 8px; color: var(--text-tertiary); font-size: 12px;">Nessuna conversazione precedente</div>';
    }
}

function createConversationElement(conversation) {
    const convDiv = document.createElement('div');
    convDiv.className = 'conversation-item';
    convDiv.dataset.id = conversation.id;
    
    if (currentConversation === conversation.id) {
        convDiv.classList.add('active');
    }
    
    convDiv.innerHTML = `
        <div class="conversation-title">${conversation.title}</div>
        <div class="conversation-actions">
            <button class="conversation-action" onclick="renameConversation('${conversation.id}')" title="Rinomina">
                <i class="fas fa-edit"></i>
            </button>
            <button class="conversation-action" onclick="deleteConversation('${conversation.id}')" title="Elimina">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    convDiv.addEventListener('click', function(e) {
        if (!e.target.closest('.conversation-actions')) {
            loadConversation(conversation.id);
        }
    });
    
    return convDiv;
}

// Chat management
async function newChat() {
    if (!currentUser || !window.supabase) {
        alert('⚠️ Devi essere connesso');
        return;
    }

    try {
        console.log('💬 Nuova conversazione...');
        
        const { data, error } = await window.supabase
            .from('conversations')
            .insert([{
                title: 'Nuova conversazione',
                user_id: currentUser.id,
                project_id: currentProject,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating conversation:', error);
            alert('❌ Errore nella creazione della conversazione');
            return;
        }

        currentConversation = data.id;
        console.log('✅ Conversazione creata:', currentConversation);
        
        // Clear chat and hide welcome
        clearMessages();
        hideWelcomeState();
        
        // Update conversations list
        await loadUserData();
        
    } catch (error) {
        console.error('Exception creating conversation:', error);
        alert('❌ Errore nella creazione della conversazione');
    }
}

async function loadConversation(conversationId) {
    if (!window.supabase) return;
    
    try {
        currentConversation = conversationId;
        console.log('📖 Caricamento conversazione:', conversationId);
        
        // Update UI
        document.querySelectorAll('.conversation-item').forEach(el => {
            el.classList.remove('active');
        });
        
        const selectedElement = document.querySelector(`[data-id="${conversationId}"]`);
        if (selectedElement) {
            selectedElement.classList.add('active');
        }
        
        // Load messages
        const { data: messages, error } = await window.supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading messages:', error);
            return;
        }

        // Clear and display messages
        clearMessages();
        hideWelcomeState();
        
        messages.forEach(message => {
            addMessageToChat(message.content, message.role, false);
        });

        // Load artifacts for this conversation
        await loadConversationArtifacts(conversationId);
        
        console.log('✅ Messaggi caricati:', messages.length);
        
    } catch (error) {
        console.error('Exception loading conversation:', error);
    }
}

async function renameConversation(conversationId) {
    const newTitle = prompt('Nuovo nome per la conversazione:');
    if (!newTitle || !window.supabase) return;
    
    try {
        const { error } = await window.supabase
            .from('conversations')
            .update({ title: newTitle, updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        if (error) {
            console.error('Error renaming conversation:', error);
            alert('❌ Errore nel rinominare la conversazione');
            return;
        }

        await loadUserData();
        
    } catch (error) {
        console.error('Exception renaming conversation:', error);
    }
}

async function deleteConversation(conversationId) {
    if (!confirm('Sei sicuro di voler eliminare questa conversazione?')) return;
    if (!window.supabase) return;
    
    try {
        // Delete messages first
        await window.supabase
            .from('messages')
            .delete()
            .eq('conversation_id', conversationId);
        
        // Delete artifacts
        await window.supabase
            .from('artifacts')
            .delete()
            .eq('conversation_id', conversationId);
        
        // Delete conversation
        const { error } = await window.supabase
            .from('conversations')
            .delete()
            .eq('id', conversationId);

        if (error) {
            console.error('Error deleting conversation:', error);
            alert('❌ Errore nell\'eliminare la conversazione');
            return;
        }

        // If this was the active conversation, clear it
        if (currentConversation === conversationId) {
            currentConversation = null;
            showWelcomeState();
        }

        await loadUserData();
        
    } catch (error) {
        console.error('Exception deleting conversation:', error);
    }
}

// NEW: Artifacts Management
async function loadConversationArtifacts(conversationId) {
    if (!window.supabase) return;
    
    try {
        const { data: arts, error } = await window.supabase
            .from('artifacts')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading artifacts:', error);
            return;
        }

        artifacts = arts || [];
        console.log('🎨 Artifacts caricati:', artifacts.length);
        
        // Render existing artifacts in chat
        artifacts.forEach(artifact => {
            renderArtifactInChat(artifact);
        });
        
    } catch (error) {
        console.error('Exception loading artifacts:', error);
    }
}

function detectArtifactInMessage(content) {
    // Detect if Claude wants to create an artifact
    const artifactPatterns = [
        /```html/i,
        /```javascript/i,
        /```python/i,
        /```json/i,
        /```css/i,
        /```react/i,
        /I'll create.*for you/i,
        /Here's.*code/i,
        /Let me create/i
    ];
    
    return artifactPatterns.some(pattern => pattern.test(content));
}

function extractArtifactFromMessage(content) {
    // Extract code blocks and determine type
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];
    
    if (matches.length === 0) return null;
    
    const match = matches[0];
    const language = match[1] || 'text';
    const code = match[2].trim();
    
    // Determine artifact type
    let type = 'code';
    let title = 'Code Snippet';
    
    if (language.toLowerCase() === 'html' || code.includes('<html>')) {
        type = 'html';
        title = 'HTML Document';
    } else if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'js') {
        type = 'javascript';
        title = 'JavaScript Code';
    } else if (language.toLowerCase() === 'python' || language.toLowerCase() === 'py') {
        type = 'python';
        title = 'Python Script';
    } else if (language.toLowerCase() === 'json') {
        type = 'json';
        title = 'JSON Data';
    } else if (language.toLowerCase() === 'css') {
        type = 'css';
        title = 'CSS Styles';
    } else if (language.toLowerCase() === 'react' || code.includes('React') || code.includes('jsx')) {
        type = 'react';
        title = 'React Component';
    }
    
    return {
        type: type,
        title: title,
        content: code
    };
}

async function saveArtifact(artifactData) {
    if (!currentConversation || !window.supabase) return null;
    
    try {
        const { data, error } = await window.supabase
            .from('artifacts')
            .insert([{
                conversation_id: currentConversation,
                user_id: currentUser.id,
                type: artifactData.type,
                title: artifactData.title,
                content: artifactData.content,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Error saving artifact:', error);
            return null;
        }

        console.log('✅ Artifact salvato:', data.id);
        return data;
        
    } catch (error) {
        console.error('Exception saving artifact:', error);
        return null;
    }
}

function renderArtifactInChat(artifact) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    const artifactDiv = document.createElement('div');
    artifactDiv.className = 'artifact-container';
    artifactDiv.innerHTML = `
        <div class="artifact-header">
            <div class="artifact-info">
                <i class="fas fa-code artifact-icon"></i>
                <div class="artifact-details">
                    <div class="artifact-title">${artifact.title}</div>
                    <div class="artifact-type">${artifact.type.toUpperCase()}</div>
                </div>
            </div>
            <div class="artifact-actions">
                <button class="artifact-action" onclick="viewArtifact(${artifact.id})" title="Visualizza">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="artifact-action" onclick="editArtifact(${artifact.id})" title="Modifica">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="artifact-action" onclick="downloadArtifact(${artifact.id})" title="Scarica">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
        <div class="artifact-preview" id="artifact-preview-${artifact.id}">
            ${renderArtifactPreview(artifact)}
        </div>
    `;
    
    messagesContainer.appendChild(artifactDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderArtifactPreview(artifact) {
    switch (artifact.type) {
        case 'html':
            return `<iframe class="artifact-iframe" srcdoc="${escapeHtml(artifact.content)}" sandbox="allow-scripts"></iframe>`;
        case 'javascript':
        case 'python':
        case 'json':
        case 'css':
            return `<pre class="artifact-code"><code class="language-${artifact.type}">${escapeHtml(artifact.content)}</code></pre>`;
        case 'react':
            return `<div class="artifact-react-info">React Component - Click "Visualizza" to render</div>`;
        default:
            return `<pre class="artifact-code"><code>${escapeHtml(artifact.content)}</code></pre>`;
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function viewArtifact(artifactId) {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (!artifact) return;
    
    document.getElementById('artifactViewerModal').style.display = 'block';
    document.getElementById('artifactViewerTitle').textContent = artifact.title;
    
    const viewer = document.getElementById('artifactViewer');
    
    switch (artifact.type) {
        case 'html':
            viewer.innerHTML = `<iframe class="artifact-viewer-iframe" srcdoc="${escapeHtml(artifact.content)}" sandbox="allow-scripts allow-same-origin"></iframe>`;
            break;
        case 'react':
            // For React components, we'd need a more complex setup
            viewer.innerHTML = `<div class="artifact-react-notice">React components require a development environment to render properly.</div><pre><code class="language-javascript">${escapeHtml(artifact.content)}</code></pre>`;
            break;
        default:
            viewer.innerHTML = `<pre><code class="language-${artifact.type}">${escapeHtml(artifact.content)}</code></pre>`;
    }
}

function editArtifact(artifactId) {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (!artifact) return;
    
    document.getElementById('artifactEditorModal').style.display = 'block';
    document.getElementById('artifactEditorTitle').value = artifact.title;
    document.getElementById('artifactEditorType').value = artifact.type;
    document.getElementById('artifactEditorContent').value = artifact.content;
    document.getElementById('artifactEditorModal').dataset.artifactId = artifactId;
}

async function saveEditedArtifact() {
    const modal = document.getElementById('artifactEditorModal');
    const artifactId = modal.dataset.artifactId;
    
    const title = document.getElementById('artifactEditorTitle').value.trim();
    const type = document.getElementById('artifactEditorType').value;
    const content = document.getElementById('artifactEditorContent').value.trim();
    
    if (!title || !content || !window.supabase) return;
    
    try {
        const { error } = await window.supabase
            .from('artifacts')
            .update({
                title: title,
                type: type,
                content: content,
                updated_at: new Date().toISOString()
            })
            .eq('id', artifactId);

        if (error) {
            console.error('Error updating artifact:', error);
            alert('❌ Errore nel salvare l\'artifact');
            return;
        }

        // Update local data
        const artifactIndex = artifacts.findIndex(a => a.id === parseInt(artifactId));
        if (artifactIndex !== -1) {
            artifacts[artifactIndex] = { ...artifacts[artifactIndex], title, type, content };
        }

        // Update preview
        const preview = document.getElementById(`artifact-preview-${artifactId}`);
        if (preview) {
            preview.innerHTML = renderArtifactPreview(artifacts[artifactIndex]);
        }

        closeArtifactEditor();
        console.log('✅ Artifact aggiornato');
        
    } catch (error) {
        console.error('Exception updating artifact:', error);
        alert('❌ Errore nel salvare l\'artifact');
    }
}

function downloadArtifact(artifactId) {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (!artifact) return;
    
    const filename = `${artifact.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${getFileExtension(artifact.type)}`;
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getFileExtension(type) {
    const extensions = {
        'html': 'html',
        'javascript': 'js',
        'python': 'py',
        'json': 'json',
        'css': 'css',
        'react': 'jsx'
    };
    return extensions[type] || 'txt';
}

function closeArtifactViewer() {
    document.getElementById('artifactViewerModal').style.display = 'none';
}

function closeArtifactEditor() {
    document.getElementById('artifactEditorModal').style.display = 'none';
}

// Message handling
async function sendMessage() {
    if (!apiKey || !isConnected) {
        alert('⚠️ Configura prima la tua API key nelle impostazioni');
        openSettings();
        return;
    }

    if (!currentUser) {
        alert('⚠️ Devi essere connesso');
        return;
    }

    // Check API spending limit
    if (sessionStats.estimatedCost >= userSettings.apiSpendingLimit) {
        alert(`⚠️ Hai raggiunto il limite di spesa di ${userSettings.apiSpendingLimit.toFixed(2)}. Aumenta il limite nelle impostazioni.`);
        return;
    }

    // Create conversation if none exists
    if (!currentConversation) {
        await newChat();
        if (!currentConversation) return;
    }

    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    try {
        console.log('📤 Invio messaggio:', message.substring(0, 50) + '...');
        
        // Add user message
        addMessageToChat(message, 'user', true);
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';
        
        // Show typing
        showTypingIndicator();

        // Prepare context with project documents
        let contextMessage = message;
        if (currentProject && projectDocuments.length > 0) {
            const docsContext = projectDocuments.map(doc => 
                `[Documento: ${doc.name}]\n${doc.content || '[Contenuto non disponibile]'}`
            ).join('\n\n');
            contextMessage = `${docsContext}\n\nUser message: ${message}`;
        }

        // Add uploaded files to context
        if (uploadedFiles.length > 0) {
            const filesContext = uploadedFiles.map(file => 
                `[File: ${file.name}]\n${file.content || '[File content not available]'}`
            ).join('\n\n');
            contextMessage = `${filesContext}\n\n${contextMessage}`;
        }

        // Call Claude API
        const response = await callClaudeAPI(contextMessage);
        
        hideTypingIndicator();
        
        if (response) {
            addMessageToChat(response, 'assistant', true);
            
            // Check if response contains an artifact
            if (detectArtifactInMessage(response)) {
                const artifactData = extractArtifactFromMessage(response);
                if (artifactData) {
                    const savedArtifact = await saveArtifact(artifactData);
                    if (savedArtifact) {
                        artifacts.push(savedArtifact);
                        renderArtifactInChat(savedArtifact);
                    }
                }
            }
            
            await saveMessages(message, response);
            // Update statistics
            updateStats(message, response);
            
            // Check spending warning
            if (sessionStats.estimatedCost >= userSettings.apiWarningThreshold && 
                sessionStats.estimatedCost < userSettings.apiSpendingLimit) {
                showSpendingWarning();
            }
            
            // Update conversation title if it's the first message
            await updateConversationTitle(message);
            
            console.log('✅ Messaggio inviato e salvato');
        }
        
    } catch (error) {
        console.error('Send message error:', error);
        hideTypingIndicator();
        addMessageToChat('❌ Errore nella comunicazione con Claude. Riprova.', 'assistant', true);
    }
}

function showSpendingWarning() {
    const notification = document.createElement('div');
    notification.className = 'spending-warning';
    notification.innerHTML = `
        <div class="warning-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Attenzione: hai raggiunto ${sessionStats.estimatedCost.toFixed(2)} di ${userSettings.apiSpendingLimit.toFixed(2)}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

async function callClaudeAPI(message) {
    const model = document.getElementById('modelSelector').value;
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: message }],
                model: model,
                apiKey: apiKey
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Fix per diversi formati di risposta
        if (data.content && Array.isArray(data.content) && data.content[0] && data.content[0].text) {
            return data.content[0].text;
        } else if (data.content && typeof data.content === 'string') {
            return data.content;
        } else if (data.content) {
            return String(data.content);
        } else {
            throw new Error('Formato risposta non valido');
        }
        
    } catch (error) {
        console.error('Claude API error:', error);
        throw error;
    }
}

async function saveMessages(userMessage, assistantMessage) {
    if (!currentConversation || !currentUser || !window.supabase) return;

    try {
        const { error } = await window.supabase
            .from('messages')
            .insert([
                {
                    conversation_id: currentConversation,
                    user_id: currentUser.id,
                    role: 'user',
                    content: userMessage,
                    created_at: new Date().toISOString()
                },
                {
                    conversation_id: currentConversation,
                    user_id: currentUser.id,
                    role: 'assistant',
                    content: assistantMessage,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) {
            console.error('Error saving messages:', error);
        }
        
        // Update conversation timestamp
        await window.supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', currentConversation);
            
    } catch (error) {
        console.error('Exception saving messages:', error);
    }
}

async function updateConversationTitle(firstMessage) {
    if (!currentConversation || !window.supabase) return;
    
    try {
        // Generate title from first message (first 50 chars)
        const title = firstMessage.substring(0, 50).trim();
        if (title) {
            await window.supabase
                .from('conversations')
                .update({ 
                    title: title,
                    updated_at: new Date().toISOString() 
                })
                .eq('id', currentConversation);
                
            // Refresh conversations list
            await loadUserData();
        }
    } catch (error) {
        console.error('Error updating conversation title:', error);
    }
}

function addMessageToChat(content, role, animate = true) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    if (animate) messageDiv.classList.add('fade-in');
    
    const isUser = role === 'user';
    const avatarContent = isUser ? 'U' : `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
    `;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatarContent}
        </div>
        <div class="message-content">
            ${formatMessageContent(content)}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatMessageContent(content) {
    let formatted = content;
    
    // Basic markdown formatting
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

function clearMessages() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
}

// File upload functionality
function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    const projectFileInput = document.getElementById('projectFileInput');
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    if (projectFileInput) {
        projectFileInput.addEventListener('change', handleProjectFileSelect);
    }
    
    if (uploadZone) {
        // Drag and drop
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            processFiles(files);
        });
        
        uploadZone.addEventListener('click', function() {
            document.getElementById('fileInput').click();
        });
    }
}

function triggerFileUpload() {
    document.getElementById('fileUploadModal').style.display = 'block';
}

function closeFileUpload() {
    document.getElementById('fileUploadModal').style.display = 'none';
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

async function processFiles(files) {
    for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert(`File ${file.name} è troppo grande (max 10MB)`);
            continue;
        }
        
        try {
            const content = await readFileContent(file);
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                content: content
            };
            
            uploadedFiles.push(fileData);
            renderUploadedFiles();
            
        } catch (error) {
            console.error('Error processing file:', file.name, error);
            alert(`Errore nel processare ${file.name}`);
        }
    }
    
    // Clear input
    document.getElementById('fileInput').value = '';
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        
        reader.onerror = function() {
            reject(new Error('Errore nella lettura del file'));
        };
        
        if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
            reader.readAsText(file);
        } else {
            reader.readAsText(file); // Try as text for now
        }
    });
}

function renderUploadedFiles() {
    const uploadedFilesList = document.getElementById('uploadedFilesList');
    const uploadedFilesDisplay = document.getElementById('uploadedFiles');
    const fileUploadArea = document.getElementById('fileUploadArea');
    
    // Render in modal
    if (uploadedFilesList) {
        uploadedFilesList.innerHTML = '';
        
        uploadedFiles.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'uploaded-file-item';
            
            fileDiv.innerHTML = `
                <div class="uploaded-file-info">
                    <i class="fas fa-file-alt file-icon"></i>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="remove-file-btn" onclick="removeFile('${file.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            uploadedFilesList.appendChild(fileDiv);
        });
    }
    
    // Render in input area
    if (uploadedFilesDisplay && fileUploadArea) {
        if (uploadedFiles.length > 0) {
            fileUploadArea.style.display = 'block';
            uploadedFilesDisplay.innerHTML = '';
            
            uploadedFiles.forEach(file => {
                const fileSpan = document.createElement('span');
                fileSpan.className = 'uploaded-file';
                fileSpan.innerHTML = `
                    <i class="fas fa-file-alt"></i>
                    ${file.name}
                    <button class="remove-file" onclick="removeFile('${file.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                uploadedFilesDisplay.appendChild(fileSpan);
            });
        } else {
            fileUploadArea.style.display = 'none';
        }
    }
}

function removeFile(fileId) {
    uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
    renderUploadedFiles();
}

function confirmFileUpload() {
    closeFileUpload();
    // Files are already processed and ready to use
    console.log('📎 File pronti per l\'uso:', uploadedFiles.length);
}

function formatFileSize(bytes) {
    if (bytes === 0 || !bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// UI utilities
function autoResize() {
    const textarea = document.getElementById('messageInput');
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = newHeight + 'px';
}

function showTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

// Settings management
function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
    document.getElementById('apiKeyInput').focus();
    
    // Load current settings
    document.getElementById('spendingLimitInput').value = userSettings.apiSpendingLimit;
    document.getElementById('warningThresholdInput').value = userSettings.apiWarningThreshold;
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

async function testConnection() {
    const testKey = document.getElementById('apiKeyInput').value.trim() || apiKey;
    if (!testKey) {
        updateConnectionStatus(false);
        alert('❌ Inserisci prima una API key');
        return;
    }

    try {
        console.log('🧪 Test connessione API...');
        
        const response = await fetch('/api/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ apiKey: testKey })
        });

        const result = await response.json();
        updateConnectionStatus(result.success);
        
        if (result.success) {
            console.log('✅ Connessione API riuscita');
            if (currentUser) {
                document.getElementById('sendButton').disabled = false;
            }
            alert('✅ Connessione riuscita!');
        } else {
            console.log('❌ Connessione API fallita');
            alert('❌ API key non valida: ' + (result.error || 'Errore sconosciuto'));
        }
    } catch (error) {
        console.error('Test connection error:', error);
        updateConnectionStatus(false);
        alert('❌ Errore di rete durante il test');
    }
}

function updateConnectionStatus(connected) {
    isConnected = connected;
    const statusDot = document.getElementById('statusDot');
    
    if (statusDot) {
        if (connected) {
            statusDot.classList.add('connected');
            statusDot.title = 'API connessa';
        } else {
            statusDot.classList.remove('connected');
            statusDot.title = 'API disconnessa';
        }
    }
    
    // Update send button
    const sendButton = document.getElementById('sendButton');
    if (sendButton && currentUser) {
        sendButton.disabled = !connected;
    }
}

async function saveSettings() {
    const newApiKey = document.getElementById('apiKeyInput').value.trim();
    const spendingLimit = parseFloat(document.getElementById('spendingLimitInput').value) || 10.00;
    const warningThreshold = parseFloat(document.getElementById('warningThresholdInput').value) || 8.00;
    
    if (!newApiKey) {
        alert('❌ Inserisci una API key valida');
        return;
    }

    if (warningThreshold >= spendingLimit) {
        alert('❌ La soglia di avviso deve essere inferiore al limite di spesa');
        return;
    }

    // Save API key locally
    apiKey = newApiKey;
    localStorage.setItem('claude-api-key', apiKey);
    
    // Save user settings to database
    if (currentUser && window.supabase) {
        try {
            const { error } = await window.supabase
                .from('user_settings')
                .upsert([{
                    user_id: currentUser.id,
                    api_spending_limit: spendingLimit,
                    api_warning_threshold: warningThreshold,
                    updated_at: new Date().toISOString()
                }]);

            if (error) {
                console.error('Error saving settings:', error);
            } else {
                userSettings = {
                    apiSpendingLimit: spendingLimit,
                    apiWarningThreshold: warningThreshold
                };
                console.log('✅ Impostazioni salvate');
            }
        } catch (error) {
            console.error('Exception saving settings:', error);
        }
    }
    
    testConnection();
    closeSettings();
}

// Statistics functions
function estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
}

function updateStats(userMessage, assistantMessage) {
    const userTokens = estimateTokens(userMessage);
    const assistantTokens = estimateTokens(assistantMessage);
    const totalTokens = userTokens + assistantTokens;
    
    sessionStats.tokensUsed += totalTokens;
    sessionStats.messagesSent += 1;
    
    // Cost estimation (Claude pricing: ~$0.0015 per 1000 tokens for input, ~$0.0075 for output)
    const inputCost = (userTokens / 1000) * 0.0015;
    const outputCost = (assistantTokens / 1000) * 0.0075;
    sessionStats.estimatedCost += inputCost + outputCost;
    
    updateStatsDisplay();
    console.log('📊 Stats updated:', sessionStats);
}

function updateStatsDisplay() {
    document.getElementById('tokensUsed').textContent = sessionStats.tokensUsed.toLocaleString();
    document.getElementById('messagesSent').textContent = sessionStats.messagesSent;
    document.getElementById('estimatedCost'document.getElementById('estimatedCost').textContent = '$' + sessionStats.estimatedCost.toFixed(4);).textContent = ' + sessionStats.estimatedCost.toFixed(4);
    
    // Update progress bar if close to limit
    const progressBar = document.getElementById('spendingProgress');
    if (progressBar) {
        const percentage = (sessionStats.estimatedCost / userSettings.apiSpendingLimit) * 100;
        progressBar.style.width = Math.min(percentage, 100) + '%';
        
        if (percentage >= 80) {
            progressBar.classList.add('warning');
        } else if (percentage >= 95) {
            progressBar.classList.add('danger');
        }
    }
}

function resetStats() {
    if (confirm('Vuoi resettare le statistiche della sessione?')) {
        sessionStats = {
            tokensUsed: 0,
            messagesSent: 0,
            estimatedCost: 0
        };
        updateStatsDisplay();
        console.log('📊 Stats reset');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for new chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (currentUser) {
            newChat();
        }
    }
    
    // Ctrl/Cmd + Shift + O for settings
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        openSettings();
    }
    
    // Ctrl/Cmd + U for upload
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        if (currentProject) {
            uploadProjectDocument();
        } else {
            triggerFileUpload();
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
        
        const userMenu = document.getElementById('userMenu');
        if (userMenu && userMenu.style.display === 'block') {
            userMenu.style.display = 'none';
        }
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('❌ JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ Promise Rejection:', e.reason);
});

// Performance monitoring
let performanceMetrics = {
    messagesSent: 0,
    averageResponseTime: 0,
    errors: 0
};

function trackPerformance(action, startTime) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    switch (action) {
        case 'sendMessage':
            performanceMetrics.messagesSent++;
            performanceMetrics.averageResponseTime = 
                (performanceMetrics.averageResponseTime + duration) / 2;
            break;
        case 'error':
            performanceMetrics.errors++;
            break;
    }
    
    console.log('📊 Performance:', performanceMetrics);
}

// Auto-save functionality for unsent messages
function autoSaveDraft() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput && currentConversation) {
        const draft = messageInput.value.trim();
        if (draft) {
            localStorage.setItem(`draft_${currentConversation}`, draft);
        } else {
            localStorage.removeItem(`draft_${currentConversation}`);
        }
    }
}

function loadDraft() {
    if (currentConversation) {
        const draft = localStorage.getItem(`draft_${currentConversation}`);
        if (draft) {
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                messageInput.value = draft;
                autoResize();
            }
        }
    }
}

// Auto-save draft every 2 seconds
setInterval(autoSaveDraft, 2000);

// Connection monitoring
function monitorConnection() {
    if (navigator.onLine) {
        document.body.classList.remove('offline');
    } else {
        document.body.classList.add('offline');
        console.warn('🔌 Connessione offline');
    }
}

window.addEventListener('online', monitorConnection);
window.addEventListener('offline', monitorConnection);

// Initialize connection monitoring
monitorConnection();

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('✅ ServiceWorker registered:', registration.scope);
            })
            .catch(function(error) {
                console.log('❌ ServiceWorker registration failed:', error);
            });
    });
}

// Export for debugging
if (typeof window !== 'undefined') {
    window.claudeDebug = {
        currentUser,
        currentProject,
        currentConversation,
        conversations,
        uploadedFiles,
        projectDocuments,
        artifacts,
        apiKey: apiKey ? 'SET' : 'NOT_SET',
        isConnected,
        performanceMetrics,
        userSettings,
        sessionStats,
        
        // Debug functions
        clearAllData: function() {
            localStorage.clear();
            location.reload();
        },
        
        simulateError: function() {
            throw new Error('Test error for debugging');
        },
        
        logState: function() {
            console.log('🔍 Current State:', {
                user: currentUser?.email,
                project: currentProject,
                conversation: currentConversation,
                conversationsCount: conversations.length,
                filesCount: uploadedFiles.length,
                projectDocsCount: projectDocuments.length,
                artifactsCount: artifacts.length,
                connected: isConnected,
                settings: userSettings,
                stats: sessionStats
            });
        }
    };
}

console.log('🚀 Claude AI Interface initialized successfully!');
