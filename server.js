const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://*.railway.app', 'https://*.vercel.app'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude AI Interface Pro</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <script type="module">
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
        
        const supabaseUrl = 'https://rxfnuxhwuigmtdysfhnb.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4Zm51eGh3dWlnbXRkeXNmaG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTUyNjAsImV4cCI6MjA2ODc3MTI2MH0.zRmoouFtGUGvnScS_WSGgMWZon80SG7pxTIRDLQcBMY';
        
        window.supabase = createClient(supabaseUrl, supabaseKey);

        // GESTIONE FORZATA DEI TOKEN OAUTH
        if (window.location.hash.includes('access_token')) {
            console.log('Access token detected in URL');
            
            // Estrai i token dall'URL IMMEDIATAMENTE
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            
            if (accessToken && refreshToken) {
                console.log('🔧 Forcing session with extracted tokens...');
                
                // FORZA il set della sessione SUBITO
                window.supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                }).then(({ data, error }) => {
                    if (error) {
                        console.error('❌ Error forcing session:', error);
                    } else if (data?.session?.user) {
                        console.log('✅ Session forced successfully:', data.session.user.email);
                        // Pulisci l'URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                        // Ricarica per attivare l'interfaccia
                        window.location.reload();
                    } else {
                        console.log('❌ No user data in forced session');
                    }
                }).catch(error => {
                    console.error('❌ Exception forcing session:', error);
                });
            }
        } else {
            // Se non c'è callback OAuth, controlla sessione esistente
            setTimeout(async () => {
                const { data, error } = await window.supabase.auth.getSession();
                if (data?.session?.user) {
                    console.log('✅ Existing session found:', data.session.user.email);
                }
            }, 1000);
        }

        // Auth state listener
        window.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event, session?.user?.email);
            if (event === 'SIGNED_IN' && session?.user) {
                console.log('✅ Successfully signed in!');
                // Non ricaricare qui per evitare loop
            }
        });
    </script>
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a1a; color: #e5e5e5; height: 100vh; overflow: hidden; }
        .app-container { display: flex; height: 100vh; }
        .sidebar { width: 280px; background: #171717; border-right: 1px solid #333; display: flex; flex-direction: column; transition: all 0.3s ease; }
        .sidebar-header { padding: 16px; border-bottom: 1px solid #333; display: flex; align-items: center; justify-content: space-between; }
        .user-info { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #333; font-size: 14px; }
        .user-avatar { width: 32px; height: 32px; border-radius: 50%; }
        .login-section { padding: 16px; text-align: center; border-bottom: 1px solid #333; }
        .google-login-btn { background: #4285f4; color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center; transition: all 0.2s; }
        .google-login-btn:hover { background: #3367d6; }
        .logout-btn { background: #dc2626; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
        .sidebar-toggle, .settings-btn { background: none; border: none; color: #888; cursor: pointer; font-size: 18px; padding: 8px; border-radius: 6px; transition: all 0.2s; }
        .sidebar-toggle:hover, .settings-btn:hover { background: #333; color: #fff; }
        .new-chat-btn, .new-project-btn { background: #2563eb; border: none; color: white; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin: 8px 16px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .new-project-btn { background: #16a34a; }
        .new-chat-btn:hover { background: #1d4ed8; }
        .new-project-btn:hover { background: #15803d; }
        .projects-section { flex: 1; overflow-y: auto; padding: 8px; }
        .projects-header { padding: 8px 16px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: space-between; }
        .project-item { margin-bottom: 4px; }
        .project-header { padding: 12px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 14px; display: flex; align-items: center; justify-content: between; }
        .project-header:hover { background: #333; }
        .project-header.active { background: #16a34a; }
        .project-title { font-weight: 500; flex: 1; }
        .project-expand-btn { background: none; border: none; color: #888; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 12px; transition: all 0.2s; }
        .project-expand-btn:hover { background: #444; color: #fff; }
        .project-expand-btn.expanded { transform: rotate(90deg); }
        .chats-list { display: none; padding-left: 16px; margin-top: 4px; }
        .chats-list.expanded { display: block; }
        .chat-item { padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; margin-bottom: 2px; color: #ccc; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; }
        .chat-item:hover { background: #333; color: #fff; }
        .chat-item.active { background: #2563eb; color: white; }
        .chat-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .chat-delete-btn { background: none; border: none; color: #888; cursor: pointer; padding: 2px 4px; border-radius: 3px; font-size: 10px; opacity: 0; transition: all 0.2s; }
        .chat-item:hover .chat-delete-btn { opacity: 1; }
        .chat-delete-btn:hover { background: #dc2626; color: white; }
        .main-content { flex: 1; display: flex; flex-direction: column; background: #1a1a1a; }
        .chat-header { padding: 16px 24px; border-bottom: 1px solid #333; display: flex; align-items: center; justify-content: space-between; }
        .header-info { display: flex; align-items: center; gap: 16px; }
        .model-selector { background: #333; border: none; color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; }
        .api-stats { display: flex; align-items: center; gap: 16px; font-size: 13px; color: #888; }
        .stat-item { display: flex; align-items: center; gap: 4px; }
        .chat-container { flex: 1; overflow-y: auto; padding: 20px; }
        .message { margin-bottom: 24px; display: flex; gap: 16px; max-width: 1000px; margin-left: auto; margin-right: auto; }
        .message-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0; }
        .user-avatar-msg { background: #2563eb; color: white; }
        .assistant-avatar { background: #16a34a; color: white; }
        .message-content { flex: 1; line-height: 1.6; }
        .input-container { padding: 20px; border-top: 1px solid #333; background: #1a1a1a; }
        .input-wrapper { max-width: 1000px; margin: 0 auto; position: relative; }
        .message-input { width: 100%; background: #2a2a2a; border: 1px solid #444; border-radius: 24px; padding: 16px 60px 16px 20px; color: white; font-size: 16px; resize: none; min-height: 56px; max-height: 200px; outline: none; transition: all 0.2s; }
        .message-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
        .send-button { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: #2563eb; border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .send-button:hover { background: #1d4ed8; }
        .send-button:disabled { background: #444; cursor: not-allowed; }
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 1000; }
        .modal-content { background: #2a2a2a; margin: 5% auto; padding: 30px; border-radius: 12px; width: 90%; max-width: 500px; position: relative; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-close { background: none; border: none; color: #888; font-size: 24px; cursor: pointer; padding: 8px; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; margin-bottom: 8px; font-weight: 500; color: #e5e5e5; }
        .form-input { width: 100%; background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 12px 16px; color: white; font-size: 14px; outline: none; }
        .form-input:focus { border-color: #2563eb; }
        .save-button, .test-button, .create-button { background: #2563eb; border: none; color: white; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px; }
        .test-button { background: #16a34a; }
        .create-button { background: #f59e0b; }
        .typing-indicator { display: none; align-items: center; gap: 8px; margin-bottom: 24px; max-width: 1000px; margin-left: auto; margin-right: auto; }
        .typing-dots { display: flex; gap: 4px; }
        .typing-dot { width: 8px; height: 8px; background: #888; border-radius: 50%; animation: typing 1.4s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-10px); opacity: 1; } }
        .status-indicator { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-left: 8px; }
        .status-connected { background: #16a34a; }
        .status-disconnected { background: #dc2626; }
        .welcome-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px; }
        .welcome-screen h2 { margin-bottom: 16px; font-size: 24px; }
        .welcome-screen p { color: #888; margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="app-container">
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <button class="sidebar-toggle" id="sidebarToggle"><i class="fas fa-bars"></i></button>
                <button class="settings-btn" id="settingsBtn"><i class="fas fa-cog"></i></button>
            </div>
            
            <div class="login-section" id="loginSection">
                <button class="google-login-btn" id="googleLoginBtn">
                    <i class="fab fa-google"></i><span>Accedi con Google</span>
                </button>
            </div>

            <div class="user-info" id="userInfo" style="display: none;">
                <img class="user-avatar" id="userAvatar" src="" alt="User">
                <div>
                    <div id="userName" style="font-weight: 500;"></div>
                    <button class="logout-btn" id="logoutBtn">Esci</button>
                </div>
            </div>
            
            <button class="new-project-btn" style="display: none;" id="newProjectBtn">
                <i class="fas fa-folder-plus"></i><span>Nuovo Progetto</span>
            </button>
            
            <div class="projects-section" id="projectsSection" style="display: none;">
                <div class="projects-header">
                    <span>Progetti</span>
                </div>
                <div id="projectsList"></div>
            </div>
        </div>

        <div class="main-content">
            <div class="chat-header">
                <div class="header-info">
                    <h2 id="headerTitle">Claude AI Pro <span class="status-indicator status-disconnected" id="statusIndicator"></span></h2>
                    <span id="currentProject" style="color: #888; font-size: 14px;"></span>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div class="api-stats" id="apiStats" style="display: none;">
                        <div class="stat-item">
                            <i class="fas fa-coins"></i>
                            <span>Token: <span id="tokenCount">0</span></span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-dollar-sign"></i>
                            <span>Costo: $<span id="costAmount">0.00</span></span>
                        </div>
                    </div>
                    <select class="model-selector" id="modelSelector">
                        <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                        <option value="claude-opus-4">Claude Opus 4</option>
                    </select>
                </div>
            </div>
            
            <div class="chat-container" id="chatContainer">
                <div class="welcome-screen" id="welcomeScreen">
                    <h2>🚀 Benvenuto in Claude AI Interface Pro!</h2>
                    <p><strong>Funzionalità disponibili:</strong></p>
                    <p>🔄 Sync universale: Chat sincronizzate su tutti i dispositivi</p>
                    <p>📁 Progetti: Organizza le conversazioni in cartelle</p>
                    <p>💬 Chat multiple: Più conversazioni per progetto</p>
                    <p>📊 Statistiche API: Monitoraggio token e costi</p>
                    <p>🧠 Memory: Claude ricorda tutto il contesto</p>
                    <br>
                    <p><em>🔐 Accedi con Google e crea un progetto per iniziare!</em></p>
                </div>
            </div>

            <div class="typing-indicator" id="typingIndicator">
                <div class="message-avatar assistant-avatar">C</div>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
            
            <div class="input-container">
                <div class="input-wrapper">
                    <textarea class="message-input" id="messageInput" placeholder="🔐 Accedi con Google per iniziare..." rows="1" disabled></textarea>
                    <button class="send-button" id="sendButton" disabled><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal" id="settingsModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>⚙️ Impostazioni API</h3>
                <button class="modal-close" id="modalClose">&times;</button>
            </div>
            <div class="form-group">
                <label class="form-label">🔑 API Key di Anthropic:</label>
                <input type="password" class="form-input" id="apiKeyInput" placeholder="sk-ant-...">
            </div>
            <button class="test-button" id="testBtn">🧪 Test Connessione</button>
            <button class="save-button" id="saveBtn">💾 Salva</button>
        </div>
    </div>

    <div class="modal" id="createProjectModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>📁 Crea Nuovo Progetto</h3>
                <button class="modal-close" id="createProjectClose">&times;</button>
            </div>
            <div class="form-group">
                <label class="form-label">Nome Progetto:</label>
                <input type="text" class="form-input" id="projectNameInput" placeholder="es. Bot MetaTrader EURUSD">
            </div>
            <button class="create-button" id="createProjectSaveBtn">📁 Crea Progetto</button>
        </div>
    </div>

    <script>
        let currentUser = null;
        let currentProject = null;
        let currentConversation = null;
        let apiKey = localStorage.getItem('claude-api-key') || '';
        let isConnected = false;
        let sessionStats = {
            totalTokens: 0,
            totalCost: 0.00
        };

        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        async function initializeApp() {
            setupEventListeners();
            if (apiKey) {
                document.getElementById('apiKeyInput').value = apiKey;
                testConnection();
                showApiStats();
            }
            
            // Handle OAuth callback
            const { data, error } = await window.supabase.auth.getSession();
            if (data?.session) {
                currentUser = data.session.user;
                showUserInterface(data.session.user);
                loadUserData();
            }
        }

        function setupEventListeners() {
            document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
            document.getElementById('modalClose').addEventListener('click', closeSettings);
            document.getElementById('sendButton').addEventListener('click', sendMessage);
            
            // Nuovi event listeners
            document.getElementById('googleLoginBtn').addEventListener('click', googleLogin);
            document.getElementById('logoutBtn').addEventListener('click', logoutUser);
            document.getElementById('settingsBtn').addEventListener('click', openSettings);
            document.getElementById('newProjectBtn').addEventListener('click', createProject);
            document.getElementById('testBtn').addEventListener('click', testConnection);
            document.getElementById('saveBtn').addEventListener('click', saveSettings);
            document.getElementById('createProjectClose').addEventListener('click', closeCreateProject);
            document.getElementById('createProjectSaveBtn').addEventListener('click', saveProject);
            
            const textarea = document.getElementById('messageInput');
            textarea.addEventListener('input', autoResize);
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        async function googleLogin() {
            try {
                const { error } = await window.supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: 'https://claude-ai-interface-production.up.railway.app'
                    }
                });
                
                if (error) {
                    alert('❌ Errore nel login: ' + error.message);
                    console.error('Login error:', error);
                }
            } catch (error) {
                alert('❌ Errore nel login');
                console.error('Login error:', error);
            }
        }

        async function logoutUser() {
            try {
                await window.supabase.auth.signOut();
                showLoginInterface();
                resetApp();
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        function resetApp() {
            currentUser = null;
            currentProject = null;
            currentConversation = null;
            sessionStats = { totalTokens: 0, totalCost: 0.00 };
            updateApiStats();
            document.getElementById('chatContainer').innerHTML = '';
            document.getElementById('projectsList').innerHTML = '';
            showWelcomeScreen();
        }

        function showUserInterface(user) {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('userInfo').style.display = 'flex';
            document.getElementById('newProjectBtn').style.display = 'flex';
            document.getElementById('projectsSection').style.display = 'block';
            
            document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
            document.getElementById('userAvatar').src = user.user_metadata?.picture || user.user_metadata?.avatar_url || '';
            
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = false;
            messageInput.placeholder = 'Scrivi un messaggio...';
            
            if (apiKey && isConnected) {
                document.getElementById('sendButton').disabled = false;
            }
            
            hideWelcomeScreen();
        }

        function showLoginInterface() {
            document.getElementById('loginSection').style.display = 'block';
            document.getElementById('userInfo').style.display = 'none';
            document.getElementById('newProjectBtn').style.display = 'none';
            document.getElementById('projectsSection').style.display = 'none';
            
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = true;
            messageInput.placeholder = '🔐 Accedi con Google per iniziare...';
            
            document.getElementById('sendButton').disabled = true;
            showWelcomeScreen();
        }

        function showWelcomeScreen() {
            document.getElementById('welcomeScreen').style.display = 'flex';
        }

        function hideWelcomeScreen() {
            document.getElementById('welcomeScreen').style.display = 'none';
        }

        function showApiStats() {
            document.getElementById('apiStats').style.display = 'flex';
            updateApiStats();
        }

        function updateApiStats() {
            document.getElementById('tokenCount').textContent = sessionStats.totalTokens.toLocaleString();
            document.getElementById('costAmount').textContent = sessionStats.totalCost.toFixed(4);
        }

        function createProject() {
            document.getElementById('createProjectModal').style.display = 'block';
        }

        function closeCreateProject() {
            document.getElementById('createProjectModal').style.display = 'none';
            document.getElementById('projectNameInput').value = '';
        }

        async function saveProject() {
            const name = document.getElementById('projectNameInput').value.trim();
            
            if (!name || !currentUser) {
                alert('❌ Nome progetto richiesto');
                return;
            }

            try {
                const { data, error } = await window.supabase
                    .from('projects')
                    .insert([
                        {
                            name: name,
                            user_id: currentUser.id,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ]);

                if (error) {
                    console.error('Error creating project:', error);
                    alert('❌ Errore nella creazione del progetto');
                    return;
                }

                closeCreateProject();
                loadUserData();
                
            } catch (error) {
                console.error('Error creating project:', error);
                alert('❌ Errore nella creazione del progetto');
            }
        }

        async function loadUserData() {
            if (!currentUser) return;

            try {
                const { data: projects, error } = await window.supabase
                    .from('projects')
                    .select(\`
                        *,
                        conversations!inner(
                            id,
                            title,
                            created_at,
                            updated_at
                        )
                    \`)
                    .eq('user_id', currentUser.id)
                    .order('updated_at', { ascending: false });

                if (error) {
                    console.error('Error loading projects:', error);
                    return;
                }

                renderProjects(projects || []);
                
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        function renderProjects(projects) {
            const projectsList = document.getElementById('projectsList');
            projectsList.innerHTML = '';

            projects.forEach(project => {
                const projectDiv = document.createElement('div');
                projectDiv.className = 'project-item';
                projectDiv.dataset.id = project.id;
                
                const headerDiv = document.createElement('div');
                headerDiv.className = 'project-header';
                
                const titleDiv = document.createElement('div');
                titleDiv.className = 'project-title';
                titleDiv.textContent = project.name;
                
                const expandBtn = document.createElement('button');
                expandBtn.className = 'project-expand-btn';
                expandBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                expandBtn.onclick = function(e) {
                    e.stopPropagation();
                    toggleProjectChats(project.id);
                };
                
                headerDiv.appendChild(titleDiv);
                headerDiv.appendChild(expandBtn);
                headerDiv.onclick = function() {
                    selectProject(project.id, project.name);
                };
                
                const chatsDiv = document.createElement('div');
                chatsDiv.className = 'chats-list';
                chatsDiv.id = 'chats-' + project.id;
                
                // Render conversations
                if (project.conversations && project.conversations.length > 0) {
                    project.conversations.forEach(conv => {
                        const chatItem = document.createElement('div');
                        chatItem.className = 'chat-item';
                        chatItem.dataset.id = conv.id;
                        
                        const chatTitle = document.createElement('span');
                        chatTitle.className = 'chat-title';
                        chatTitle.textContent = conv.title || 'Nuova conversazione';
                        
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'chat-delete-btn';
                        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                        deleteBtn.onclick = function(e) {
                            e.stopPropagation();
                            deleteChat(conv.id);
                        };
                        
                        chatItem.appendChild(chatTitle);
                        chatItem.appendChild(deleteBtn);
                        chatItem.onclick = function() {
                            selectChat(conv.id, conv.title);
                        };
                        
                        chatsDiv.appendChild(chatItem);
                    });
                } else {
                    const emptyMsg = document.createElement('div');
                    emptyMsg.style.padding = '8px 12px';
                    emptyMsg.style.color = '#666';
                    emptyMsg.style.fontSize = '12px';
                    emptyMsg.textContent = 'Nessuna chat';
                    chatsDiv.appendChild(emptyMsg);
                }
                
                projectDiv.appendChild(headerDiv);
                projectDiv.appendChild(chatsDiv);
                projectsList.appendChild(projectDiv);
            });
        }

        function toggleProjectChats(projectId) {
            const chatsDiv = document.getElementById('chats-' + projectId);
            const expandBtn = document.querySelector('[data-id="' + projectId + '"] .project-expand-btn');
            
            if (chatsDiv.classList.contains('expanded')) {
                chatsDiv.classList.remove('expanded');
                expandBtn.classList.remove('expanded');
            } else {
                chatsDiv.classList.add('expanded');
                expandBtn.classList.add('expanded');
            }
        }

        function selectProject(projectId, projectName) {
            currentProject = projectId;
            
            document.querySelectorAll('.project-header').forEach(function(el) {
                el.classList.remove('active');
            });
            
            const targetElement = document.querySelector('[data-id="' + projectId + '"] .project-header');
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            document.getElementById('currentProject').textContent = '📁 ' + projectName;
            
            // Auto-espandi le chat del progetto selezionato
            const chatsDiv = document.getElementById('chats-' + projectId);
            const expandBtn = document.querySelector('[data-id="' + projectId + '"] .project-expand-btn');
            if (chatsDiv && !chatsDiv.classList.contains('expanded')) {
                chatsDiv.classList.add('expanded');
                expandBtn.classList.add('expanded');
            }
            
            // Reset current conversation
            currentConversation = null;
            document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
            showProjectWelcome(projectName);
        }

        function showProjectWelcome(projectName) {
            const chatContainer = document.getElementById('chatContainer');
            chatContainer.innerHTML = '<div class="welcome-screen" style="display: flex;"><h2>📁 Progetto: ' + projectName + '</h2>                    <p>Crea una nuova chat per iniziare la conversazione!</p><br><button onclick="newChat()" style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;"><i class="fas fa-plus"></i> Nuova Chat</button></div>';
        }

        async function selectChat(chatId, chatTitle) {
            currentConversation = chatId;
            
            document.querySelectorAll('.chat-item').forEach(function(el) {
                el.classList.remove('active');
            });
            
            const targetElement = document.querySelector('[data-id="' + chatId + '"]');
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            // Carica i messaggi della chat
            await loadChatMessages(chatId);
        }

        async function loadChatMessages(chatId) {
            if (!currentUser) return;

            try {
                const { data: messages, error } = await window.supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', chatId)
                    .order('created_at', { ascending: true });

                if (error) {
                    console.error('Error loading messages:', error);
                    return;
                }

                const chatContainer = document.getElementById('chatContainer');
                chatContainer.innerHTML = '';
                
                if (messages && messages.length > 0) {
                    messages.forEach(message => {
                        addMessageToChat(message.content, message.role);
                    });
                } else {
                    addMessageToChat('🚀 Chat avviata! Come posso aiutarti?', 'assistant');
                }
                
            } catch (error) {
                console.error('Error loading messages:', error);
                addMessageToChat('❌ Errore nel caricamento dei messaggi', 'assistant');
            }
        }

        async function newChat() {
            if (!currentProject || !currentUser) {
                alert('⚠️ Seleziona prima un progetto!');
                return;
            }

            try {
                const { data, error } = await window.supabase
                    .from('conversations')
                    .insert([
                        {
                            title: 'Nuova conversazione',
                            user_id: currentUser.id,
                            project_id: currentProject,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ])
                    .select()
                    .single();

                if (error) {
                    console.error('Error creating conversation:', error);
                    alert('❌ Errore nella creazione della chat');
                    return;
                }

                currentConversation = data.id;
                
                // Ricarica i progetti per mostrare la nuova chat
                await loadUserData();
                
                // Seleziona automaticamente la nuova chat
                setTimeout(() => {
                    selectChat(data.id, data.title);
                }, 100);
                
            } catch (error) {
                console.error('Error creating chat:', error);
                alert('❌ Errore nella creazione della chat');
            }
        }

        async function deleteChat(chatId) {
            if (!confirm('Sei sicuro di voler eliminare questa chat?')) return;

            try {
                // Elimina prima i messaggi
                await window.supabase
                    .from('messages')
                    .delete()
                    .eq('conversation_id', chatId);

                // Poi elimina la conversazione
                const { error } = await window.supabase
                    .from('conversations')
                    .delete()
                    .eq('id', chatId);

                if (error) {
                    console.error('Error deleting chat:', error);
                    alert('❌ Errore nell\'eliminazione della chat');
                    return;
                }

                // Se la chat eliminata era quella corrente, reset
                if (currentConversation === chatId) {
                    currentConversation = null;
                    const chatContainer = document.getElementById('chatContainer');
                    chatContainer.innerHTML = '';
                    showProjectWelcome(document.getElementById('currentProject').textContent.replace('📁 ', ''));
                }

                // Ricarica i progetti
                loadUserData();
                
            } catch (error) {
                console.error('Error deleting chat:', error);
                alert('❌ Errore nell\'eliminazione della chat');
            }
        }

        async function sendMessage() {
            if (!apiKey || !isConnected) {
                alert('⚠️ Configura prima la tua API key!');
                openSettings();
                return;
            }

            if (!currentUser || !currentConversation) {
                alert('⚠️ Seleziona una chat per inviare messaggi!');
                return;
            }

            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message) return;

            try {
                addMessageToChat(message, 'user');
                input.value = '';
                input.style.height = 'auto';
                showTypingIndicator();

                const response = await callClaudeAPI(message);
                hideTypingIndicator();
                
                if (response) {
                    addMessageToChat(response.content, 'assistant');
                    
                    // Aggiorna le statistiche
                    if (response.usage) {
                        sessionStats.totalTokens += response.usage.input_tokens + response.usage.output_tokens;
                        sessionStats.totalCost += calculateCost(response.usage, document.getElementById('modelSelector').value);
                        updateApiStats();
                    }
                    
                    // Salva messaggi nel database
                    await saveMessages(message, response.content);
                    
                    // Aggiorna il titolo della chat se è la prima conversazione
                    await updateChatTitle(message);
                }
                
            } catch (error) {
                hideTypingIndicator();
                addMessageToChat('❌ Errore nella comunicazione con Claude.', 'assistant');
            }
        }

        function calculateCost(usage, model) {
            // Prezzi approssimativi per i modelli Claude (in dollari per 1K token)
            const prices = {
                'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 },
                'claude-opus-4': { input: 0.015, output: 0.075 }
            };
            
            const modelPrices = prices[model] || prices['claude-sonnet-4-20250514'];
            const inputCost = (usage.input_tokens / 1000) * modelPrices.input;
            const outputCost = (usage.output_tokens / 1000) * modelPrices.output;
            
            return inputCost + outputCost;
        }

        async function updateChatTitle(firstMessage) {
            if (!currentConversation) return;

            try {
                // Genera un titolo basato sul primo messaggio (primi 50 caratteri)
                const title = firstMessage.length > 50 ? 
                    firstMessage.substring(0, 50) + '...' : 
                    firstMessage;

                const { error } = await window.supabase
                    .from('conversations')
                    .update({ 
                        title: title,
                        updated_at: new Date().toISOString() 
                    })
                    .eq('id', currentConversation);

                if (!error) {
                    // Aggiorna l'UI
                    const chatElement = document.querySelector('[data-id="' + currentConversation + '"] .chat-title');
                    if (chatElement) {
                        chatElement.textContent = title;
                    }
                }
                
            } catch (error) {
                console.error('Error updating chat title:', error);
            }
        }

        async function saveMessages(userMessage, assistantMessage) {
            if (!currentConversation || !currentUser) return;

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
                console.error('Error saving messages:', error);
            }
        }

        function addMessageToChat(content, role) {
            const chatContainer = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            
            const isUser = role === 'user';
            const avatarClass = isUser ? 'user-avatar-msg' : 'assistant-avatar';
            const avatarText = isUser ? 'U' : 'C';
            
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar ' + avatarClass;
            avatarDiv.textContent = avatarText;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.innerHTML = content.replace(/\n/g, '<br>');
            
            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(contentDiv);
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('collapsed');
        }

        function openSettings() {
            document.getElementById('settingsModal').style.display = 'block';
        }

        function closeSettings() {
            document.getElementById('settingsModal').style.display = 'none';
        }

        async function testConnection() {
            const testKey = document.getElementById('apiKeyInput').value || apiKey;
            if (!testKey) {
                updateConnectionStatus(false);
                alert('❌ Inserisci prima una API key');
                return;
            }

            try {
                const response = await fetch('/api/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: testKey })
                });

                const result = await response.json();
                updateConnectionStatus(result.success);
                
                if (result.success) {
                    alert('✅ Connessione riuscita!');
                    if (currentUser) {
                        document.getElementById('sendButton').disabled = false;
                        showApiStats();
                    }
                } else {
                    alert('❌ Connessione fallita');
                }
            } catch (error) {
                updateConnectionStatus(false);
                alert('❌ Errore di rete');
            }
        }

        function updateConnectionStatus(connected) {
            isConnected = connected;
            const indicator = document.getElementById('statusIndicator');
            if (connected) {
                indicator.className = 'status-indicator status-connected';
            } else {
                indicator.className = 'status-indicator status-disconnected';
            }
        }

        function saveSettings() {
            const newApiKey = document.getElementById('apiKeyInput').value;
            if (newApiKey) {
                apiKey = newApiKey;
                localStorage.setItem('claude-api-key', apiKey);
                testConnection();
                closeSettings();
            } else {
                alert('❌ Inserisci una API key valida');
            }
        }

        function autoResize() {
            const textarea = document.getElementById('messageInput');
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }

        function showTypingIndicator() {
            document.getElementById('typingIndicator').style.display = 'flex';
            document.getElementById('chatContainer').scrollTop = document.getElementById('chatContainer').scrollHeight;
        }

        function hideTypingIndicator() {
            document.getElementById('typingIndicator').style.display = 'none';
        }

        async function callClaudeAPI(message) {
            const model = document.getElementById('modelSelector').value;
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: [{ role: 'user', content: message }], 
                    model, 
                    apiKey 
                })
            });
            
            if (!response.ok) {
                throw new Error('HTTP error');
            }
            
            const data = await response.json();
            return data;
        }
    </script>
</body>
</html>`);
});

// Chat API endpoint - MODIFICATO per includere statistiche
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model, apiKey } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key richiesta' });
        }

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Array di messaggi richiesto' });
        }

        const validModels = ['claude-sonnet-4-20250514', 'claude-opus-4'];
        const selectedModel = validModels.includes(model) ? model : 'claude-sonnet-4-20250514';

        console.log('📤 Richiesta a Claude:', selectedModel);

        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: selectedModel,
                max_tokens: 4000,
                messages: messages,
                temperature: 0.7
            })
        });

        if (!anthropicResponse.ok) {
            console.error('❌ Errore API Anthropic');
            return res.status(anthropicResponse.status).json({ 
                error: 'Errore chiamata API'
            });
        }

        const data = await anthropicResponse.json();
        
        if (data.content && data.content[0] && data.content[0].text) {
            console.log('✅ Risposta ricevuta da Claude');
            res.json({ 
                content: data.content[0].text,
                model: selectedModel,
                usage: data.usage || { input_tokens: 0, output_tokens: 0 }
            });
        } else {
            console.error('❌ Formato risposta inaspettato');
            res.status(500).json({ error: 'Formato risposta inaspettato' });
        }

    } catch (error) {
        console.error('❌ Errore server:', error);
        res.status(500).json({ 
            error: 'Errore interno del server'
        });
    }
});

// Test API endpoint - same as before
app.post('/api/test', async (req, res) => {
    try {
        const { apiKey } = req.body;

        if (!apiKey) {
            return res.status(400).json({ success: false, error: 'API key richiesta' });
        }

        console.log('🧪 Test connessione API...');

        const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 20,
                messages: [{ role: 'user', content: 'Test' }]
            })
        });

        if (testResponse.ok) {
            console.log('✅ Test API riuscito');
            res.json({ success: true, message: 'API key valida!' });
        } else {
            console.log('❌ Test API fallito');
            res.status(testResponse.status).json({ 
                success: false, 
                error: 'API key non valida'
            });
        }

    } catch (error) {
        console.error('❌ Errore test API:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Errore nel test API'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: '✅ OK', 
        timestamp: new Date().toISOString(),
        version: '7.0.0-multiple-chats-complete'
    });
});

app.use((req, res) => {
    res.status(404).json({ error: '❌ Endpoint non trovato' });
});

app.use((error, req, res, next) => {
    console.error('❌ Errore non gestito:', error);
    res.status(500).json({ error: 'Errore interno del server' });
});

app.listen(PORT, () => {
    console.log('🚀 ==========================================');
    console.log('🚀  CLAUDE AI INTERFACE PRO - COMPLETE    🚀');
    console.log('🚀 ==========================================');
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API Chat: http://localhost:${PORT}/api/chat`);
    console.log(`🧪 API Test: http://localhost:${PORT}/api/test`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('🔥 ✅ Multiple Chat per progetto implementate');
    console.log('🔥 ✅ Statistiche API con token e costi');
    console.log('🔥 ✅ Interface stile Claude Web completa');
    console.log('🚀 ==========================================');
});