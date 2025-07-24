// Claude AI Interface - Frontend Logic
// Variabili globali
let currentUser = null;
let currentProject = null;
let currentConversation = null;
let apiKey = localStorage.getItem('claude-api-key') || '';
let isConnected = false;

// Inizializzazione app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Inizializzazione app...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Test API key se presente
    if (apiKey) {
        document.getElementById('apiKeyInput').value = apiKey;
        await testConnection();
    }
    
    // Controlla sessione Supabase esistente
    setTimeout(async () => {
        if (window.supabase) {
            const { data, error } = await window.supabase.auth.getSession();
            if (data?.session?.user) {
                console.log('✅ Sessione esistente trovata:', data.session.user.email);
                currentUser = data.session.user;
                showUserInterface(data.session.user);
                await loadUserData();
            }
        }
    }, 1000);

    // Auth state listener
    if (window.supabase) {
        window.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event, session?.user?.email);
            if (event === 'SIGNED_IN' && session?.user) {
                console.log('✅ Login completato!');
                currentUser = session.user;
                showUserInterface(session.user);
                loadUserData();
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 Logout completato');
                currentUser = null;
                currentProject = null;
                currentConversation = null;
                showLoginInterface();
            }
        });
    }
}

function setupEventListeners() {
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
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

    // Modal close listeners
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Authentication functions
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
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function showUserInterface(user) {
    console.log('👤 Mostra interfaccia utente per:', user.email);
    
    // Hide login, show user info
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('newChatBtn').style.display = 'flex';
    document.getElementById('projectsSection').style.display = 'block';
    
    // Update user info
    document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
    const avatar = document.getElementById('userAvatar');
    if (user.user_metadata?.picture || user.user_metadata?.avatar_url) {
        avatar.src = user.user_metadata.picture || user.user_metadata.avatar_url;
    }
    
    // Enable input if API key is connected
    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = false;
    messageInput.placeholder = 'Scrivi un messaggio a Claude...';
    
    if (apiKey && isConnected) {
        document.getElementById('sendButton').disabled = false;
    }
    
    // Clear welcome message
    clearWelcomeMessage();
}

function showLoginInterface() {
    console.log('🔐 Mostra interfaccia login');
    
    // Show login, hide user interface
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('newChatBtn').style.display = 'none';
    document.getElementById('projectsSection').style.display = 'none';
    
    // Disable input
    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = true;
    messageInput.placeholder = 'Accedi per iniziare...';
    document.getElementById('sendButton').disabled = true;
    
    // Show welcome message
    showWelcomeMessage();
    
    // Clear project info
    document.getElementById('currentProject').textContent = '';
}

function showWelcomeMessage() {
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = `
        <div class="welcome-message">
            <div class="claude-avatar">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </div>
            <h1>Ciao, sono Claude</h1>
            <p>Accedi con Google per iniziare una conversazione</p>
        </div>
    `;
}

function clearWelcomeMessage() {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer.querySelector('.welcome-message')) {
        chatContainer.innerHTML = '';
    }
}

// Project management
function createProject() {
    document.getElementById('createProjectModal').style.display = 'block';
    document.getElementById('projectNameInput').focus();
}

function closeCreateProject() {
    document.getElementById('createProjectModal').style.display = 'none';
    document.getElementById('projectNameInput').value = '';
}

async function saveProject() {
    const name = document.getElementById('projectNameInput').value.trim();
    
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

async function loadUserData() {
    if (!currentUser || !window.supabase) return;

    try {
        console.log('📊 Caricamento dati utente...');
        
        const { data: projects, error } = await window.supabase
            .from('projects')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error loading projects:', error);
            return;
        }

        console.log('✅ Progetti caricati:', projects?.length || 0);
        renderProjects(projects || []);
        
    } catch (error) {
        console.error('Exception loading user data:', error);
    }
}

function renderProjects(projects) {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';

    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-tertiary); font-size: 14px;">
                Nessun progetto ancora.<br>
                <button onclick="createProject()" style="background: none; border: none; color: var(--accent-primary); cursor: pointer; text-decoration: underline; margin-top: 8px;">
                    Crea il tuo primo progetto
                </button>
            </div>
        `;
        return;
    }

    projects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'project-item';
        projectDiv.dataset.id = project.id;
        
        projectDiv.innerHTML = `
            <div class="project-title">${project.name}</div>
            <div class="project-chat-count">0 conversazioni</div>
        `;
        
        projectDiv.addEventListener('click', function() {
            selectProject(project.id, project.name);
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
    
    document.getElementById('currentProject').textContent = projectName;
}

// Chat management
async function newChat() {
    if (!currentProject) {
        alert('⚠️ Seleziona prima un progetto');
        return;
    }
    
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
        
        // Clear chat and show start message
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.innerHTML = '';
        addMessageToChat('Ciao! Come posso aiutarti oggi?', 'assistant');
        
    } catch (error) {
        console.error('Exception creating conversation:', error);
        alert('❌ Errore nella creazione della conversazione');
    }
}

async function sendMessage() {
    // Validation
    if (!apiKey || !isConnected) {
        alert('⚠️ Configura prima la tua API key nelle impostazioni');
        openSettings();
        return;
    }

    if (!currentUser || !currentConversation) {
        alert('⚠️ Crea prima una conversazione');
        return;
    }

    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    try {
        console.log('📤 Invio messaggio:', message.substring(0, 50) + '...');
        
        // Add user message to chat
        addMessageToChat(message, 'user');
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();

        // Call Claude API
        const response = await callClaudeAPI(message);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        if (response) {
            addMessageToChat(response, 'assistant');
            await saveMessages(message, response);
            console.log('✅ Messaggio inviato e salvato');
        }
        
    } catch (error) {
        console.error('Send message error:', error);
        hideTypingIndicator();
        addMessageToChat('❌ Errore nella comunicazione con Claude. Riprova.', 'assistant');
    }
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
        
        if (data.content && data.content[0] && data.content[0].text) {
            return data.content[0].text;
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
    } catch (error) {
        console.error('Exception saving messages:', error);
    }
}

function addMessageToChat(content, role) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message fade-in';
    
    const isUser = role === 'user';
    const avatarContent = isUser ? 'U' : `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
    `;
    
    messageDiv.innerHTML = `
        <div class="message-avatar ${isUser ? 'user-avatar-msg' : 'assistant-avatar'}">
            ${avatarContent}
        </div>
        <div class="message-content">
            ${formatMessageContent(content)}
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatMessageContent(content) {
    // Basic markdown-like formatting
    let formatted = content;
    
    // Bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Code blocks (basic)
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return formatted;
}

// UI utilities
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function autoResize() {
    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = newHeight + 'px';
}

function showTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'flex';
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'none';
}

// Settings
function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
    document.getElementById('apiKeyInput').focus();
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
    const indicator = document.getElementById('statusIndicator');
    
    if (connected) {
        indicator.classList.add('connected');
        indicator.title = 'API connessa';
    } else {
        indicator.classList.remove('connected');
        indicator.title = 'API disconnessa';
    }
}

function saveSettings() {
    const newApiKey = document.getElementById('apiKeyInput').value.trim();
    
    if (!newApiKey) {
        alert('❌ Inserisci una API key valida');
        return;
    }

    apiKey = newApiKey;
    localStorage.setItem('claude-api-key', apiKey);
    
    testConnection();
    closeSettings();
    
    console.log('💾 Impostazioni salvate');
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('❌ Errore JavaScript:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ Promise rejection:', e.reason);
});

// Debug helpers
window.debugApp = {
    currentUser,
    currentProject, 
    currentConversation,
    apiKey: apiKey ? 'SET' : 'NOT_SET',
    isConnected
};
