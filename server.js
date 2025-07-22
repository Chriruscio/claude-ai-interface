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
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
        import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
        import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

        const firebaseConfig = {
            apiKey: "AIzaSyCfPL-PvUpQ5pN1lmz3VoELeyzKZfSu5qQ",
            authDomain: "claude-ai-interface.firebaseapp.com",
            projectId: "claude-ai-interface",
            storageBucket: "claude-ai-interface.firebasestorage.app",
            messagingSenderId: "896187447055",
            appId: "1:896187447055:web:23cc1e986d77d38cac07a"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const provider = new GoogleAuthProvider();

        window.firebase = { auth, db, provider, signInWithPopup, signOut, onAuthStateChanged, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy };
    </script>
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a1a; color: #e5e5e5; height: 100vh; overflow: hidden; }
        .app-container { display: flex; height: 100vh; }
        .sidebar { width: 260px; background: #171717; border-right: 1px solid #333; display: flex; flex-direction: column; transition: all 0.3s ease; }
        .sidebar.collapsed { width: 60px; }
        .sidebar-header { padding: 16px; border-bottom: 1px solid #333; display: flex; align-items: center; justify-content: space-between; }
        .user-info { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #333; font-size: 14px; }
        .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: #2563eb; }
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
        .projects-header { padding: 8px 16px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .project-item { padding: 12px 16px; border-radius: 8px; cursor: pointer; margin-bottom: 4px; transition: all 0.2s; font-size: 14px; }
        .project-item:hover { background: #333; }
        .project-item.active { background: #16a34a; }
        .project-title { font-weight: 500; margin-bottom: 4px; }
        .project-chat-count { font-size: 12px; color: #888; }
        .conversation-item { padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-bottom: 2px; transition: all 0.2s; font-size: 13px; margin-left: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .conversation-item:hover { background: #2a2a2a; }
        .conversation-item.active { background: #2563eb; }
        .main-content { flex: 1; display: flex; flex-direction: column; background: #1a1a1a; }
        .chat-header { padding: 16px 24px; border-bottom: 1px solid #333; display: flex; align-items: center; justify-content: space-between; }
        .header-info { display: flex; align-items: center; gap: 16px; }
        .model-selector { background: #333; border: none; color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; }
        .chat-container { flex: 1; overflow-y: auto; padding: 20px; }
        .message { margin-bottom: 24px; display: flex; gap: 16px; max-width: 1000px; margin-left: auto; margin-right: auto; }
        .message-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0; }
        .user-avatar-msg { background: #2563eb; color: white; }
        .assistant-avatar { background: #16a34a; color: white; }
        .message-content { flex: 1; line-height: 1.6; }
        .message-content pre { background: #2a2a2a; border: 1px solid #444; border-radius: 8px; padding: 16px; overflow-x: auto; margin: 12px 0; }
        .message-content code { background: #2a2a2a; padding: 2px 6px; border-radius: 4px; font-family: Monaco, Menlo, monospace; }
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
        @media (max-width: 768px) { .sidebar { position: fixed; left: -260px; z-index: 100; height: 100vh; } .sidebar.open { left: 0; } .main-content { width: 100%; } }
    </style>
</head>
<body>
    <div class="app-container">
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <button class="sidebar-toggle" id="sidebarToggle"><i class="fas fa-bars"></i></button>
                <button class="settings-btn" onclick="openSettings()"><i class="fas fa-cog"></i></button>
            </div>
            
            <div class="login-section" id="loginSection">
                <button class="google-login-btn" onclick="googleLogin()">
                    <i class="fab fa-google"></i><span>Accedi con Google</span>
                </button>
            </div>

            <div class="user-info" id="userInfo" style="display: none;">
                <img class="user-avatar" id="userAvatar" src="" alt="User">
                <div>
                    <div id="userName" style="font-weight: 500;"></div>
                    <button class="logout-btn" onclick="logoutUser()">Esci</button>
                </div>
            </div>
            
            <button class="new-project-btn" onclick="createProject()" style="display: none;" id="newProjectBtn">
                <i class="fas fa-folder-plus"></i><span>Nuovo Progetto</span>
            </button>
            
            <button class="new-chat-btn" onclick="newChat()" style="display: none;" id="newChatBtn">
                <i class="fas fa-plus"></i><span>Nuova Chat</span>
            </button>
            
            <div class="projects-section" id="projectsSection" style="display: none;">
                <div class="projects-header">Progetti</div>
                <div id="projectsList"></div>
            </div>
        </div>

        <div class="main-content">
            <div class="chat-header">
                <div class="header-info">
                    <h2 id="headerTitle">Claude AI Pro <span class="status-indicator status-disconnected" id="statusIndicator"></span></h2>
                    <span id="currentProject" style="color: #888; font-size: 14px;"></span>
                </div>
                <select class="model-selector" id="modelSelector">
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                    <option value="claude-opus-4">Claude Opus 4</option>
                </select>
            </div>
            
            <div class="chat-container" id="chatContainer">
                <div class="message">
                    <div class="message-avatar assistant-avatar">C</div>
                    <div class="message-content">
                        <p><strong>🚀 Benvenuto in Claude AI Interface Pro!</strong></p>
                        <p>Funzionalità disponibili:</p>
                        <ul style="margin: 12px 0; padding-left: 20px;">
                            <li><strong>🔄 Sync universale:</strong> Chat sincronizzate su tutti i dispositivi</li>
                            <li><strong>📁 Progetti:</strong> Organizza le conversazioni in cartelle</li>
                            <li><strong>🧠 Memory:</strong> Claude ricorda tutto il contesto</li>
                            <li><strong>🎨 Interface avanzata:</strong> Design professionale</li>
                        </ul>
                        <p><em>🔐 Accedi con Google per iniziare!</em></p>
                    </div>
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
                <small style="color: #888; font-size: 12px;">Ottieni la tua API key su <a href="https://console.anthropic.com" target="_blank" style="color: #2563eb;">console.anthropic.com</a></small>
            </div>
            <button class="test-button" onclick="testConnection()">🧪 Test Connessione</button>
            <button class="save-button" onclick="saveSettings()">💾 Salva</button>
        </div>
    </div>

    <div class="modal" id="createProjectModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>📁 Crea Nuovo Progetto</h3>
                <button class="modal-close" onclick="closeCreateProject()">&times;</button>
            </div>
            <div class="form-group">
                <label class="form-label">Nome Progetto:</label>
                <input type="text" class="form-input" id="projectNameInput" placeholder="es. Bot MetaTrader EURUSD">
            </div>
            <div class="form-group">
                <label class="form-label">Descrizione (opzionale):</label>
                <textarea class="form-input" id="projectDescInput" placeholder="Descrizione del progetto..." rows="3"></textarea>
            </div>
            <button class="create-button" onclick="saveProject()">📁 Crea Progetto</button>
        </div>
    </div>

    <script>
        let currentUser = null;
        let currentProject = null;
        let currentConversation = null;
        let apiKey = localStorage.getItem('claude-api-key') || '';
        let isConnected = false;

        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        function initializeApp() {
            setupEventListeners();
            if (apiKey) {
                document.getElementById('apiKeyInput').value = apiKey;
                testConnection();
            }
            if (window.firebase) {
                window.firebase.onAuthStateChanged(window.firebase.auth, (user) => {
                    if (user) {
                        currentUser = user;
                        showUserInterface(user);
                        loadUserData();
                    } else {
                        currentUser = null;
                        showLoginInterface();
                    }
                });
            }
        }

        function setupEventListeners() {
            document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
            document.getElementById('modalClose').addEventListener('click', closeSettings);
            document.getElementById('sendButton').addEventListener('click', sendMessage);
            
            const textarea = document.getElementById('messageInput');
            textarea.addEventListener('input', autoResize);
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            window.addEventListener('click', function(e) {
                if (e.target === document.getElementById('settingsModal')) {
                    closeSettings();
                }
                if (e.target === document.getElementById('createProjectModal')) {
                    closeCreateProject();
                }
            });
        }

        async function googleLogin() {
            try {
                const result = await window.firebase.signInWithPopup(window.firebase.auth, window.firebase.provider);
                console.log('Login successful:', result.user);
            } catch (error) {
                console.error('Login error:', error);
                alert('❌ Errore nel login: ' + error.message);
            }
        }

        async function logoutUser() {
            try {
                await window.firebase.signOut(window.firebase.auth);
                console.log('Logout successful');
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        function showUserInterface(user) {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('userInfo').style.display = 'flex';
            document.getElementById('newProjectBtn').style.display = 'flex';
            document.getElementById('newChatBtn').style.display = 'flex';
            document.getElementById('projectsSection').style.display = 'block';
            
            document.getElementById('userName').textContent = user.displayName;
            document.getElementById('userAvatar').src = user.photoURL;
            
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = false;
            messageInput.placeholder = 'Scrivi un messaggio... (es: "Crea un bot MetaTrader per EURUSD")';
            
            if (apiKey && isConnected) {
                document.getElementById('sendButton').disabled = false;
            }
        }

        function showLoginInterface() {
            document.getElementById('loginSection').style.display = 'block';
            document.getElementById('userInfo').style.display = 'none';
            document.getElementById('newProjectBtn').style.display = 'none';
            document.getElementById('newChatBtn').style.display = 'none';
            document.getElementById('projectsSection').style.display = 'none';
            
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = true;
            messageInput.placeholder = '🔐 Accedi con Google per iniziare...';
            
            document.getElementById('sendButton').disabled = true;
        }

        function createProject() {
            document.getElementById('createProjectModal').style.display = 'block';
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

            if (!currentUser) {
                alert('❌ Devi essere loggato per creare un progetto');
                return;
            }

            try {
                const projectData = {
                    name: name,
                    description: description,
                    userId: currentUser.uid,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    conversationCount: 0
                };

                const docRef = await window.firebase.addDoc(
                    window.firebase.collection(window.firebase.db, 'projects'), 
                    projectData
                );

                console.log('Project created with ID:', docRef.id);
                closeCreateProject();
                loadUserData();
                selectProject(docRef.id, name);
                
            } catch (error) {
                console.error('Error creating project:', error);
                alert('❌ Errore nella creazione del progetto');
            }
        }

        async function loadUserData() {
            if (!currentUser) return;

            try {
                const projectsQuery = window.firebase.query(
                    window.firebase.collection(window.firebase.db, 'projects'),
                    window.firebase.where('userId', '==', currentUser.uid),
                    window.firebase.orderBy('updatedAt', 'desc')
                );
                
                const projectsSnapshot = await window.firebase.getDocs(projectsQuery);
                const projects = [];
                
                projectsSnapshot.forEach((doc) => {
                    projects.push({ id: doc.id, ...doc.data() });
                });

                renderProjects(projects);
                
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }

        function renderProjects(projects) {
            const projectsList = document.getElementById('projectsList');
            projectsList.innerHTML = '';

            projects.forEach(project => {
                const projectDiv = document.createElement('div');
                projectDiv.className = 'project-item';
                projectDiv.dataset.id = project.id;
                
                const titleDiv = document.createElement('div');
                titleDiv.className = 'project-title';
                titleDiv.textContent = project.name;
                
                const countDiv = document.createElement('div');
                countDiv.className = 'project-chat-count';
                countDiv.textContent = (project.conversationCount || 0) + ' conversazioni';
                
                projectDiv.appendChild(titleDiv);
                projectDiv.appendChild(countDiv);
                
                projectDiv.addEventListener('click', () => selectProject(project.id, project.name));
                projectsList.appendChild(projectDiv);
            });
        }

        function selectProject(projectId, projectName) {
            currentProject = projectId;
            
            document.querySelectorAll('.project-item').forEach(el => el.classList.remove('active'));
            const targetElement = document.querySelector('[data-id="' + projectId + '"]');
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            document.getElementById('currentProject').textContent = '📁 ' + projectName;
            loadProjectConversations(projectId);
        }

        async function loadProjectConversations(projectId) {
            if (!currentUser) return;

            try {
                const conversationsQuery = window.firebase.query(
                    window.firebase.collection(window.firebase.db, 'conversations'),
                    window.firebase.where('userId', '==', currentUser.uid),
                    window.firebase.where('projectId', '==', projectId),
                    window.firebase.orderBy('updatedAt', 'desc')
                );
                
                const conversationsSnapshot = await window.firebase.getDocs(conversationsQuery);
                const conversations = [];
                
                conversationsSnapshot.forEach((doc) => {
                    conversations.push({ id: doc.id, ...doc.data() });
                });

                renderConversations(conversations);
                
            } catch (error) {
                console.error('Error loading conversations:', error);
            }
        }

        function renderConversations(conversations) {
            document.querySelectorAll('.conversation-item').forEach(el => el.remove());
            
            conversations.forEach(conv => {
                const convDiv = document.createElement('div');
                convDiv.className = 'conversation-item';
                convDiv.dataset.id = conv.id;
                
                const span = document.createElement('span');
                span.textContent = conv.title;
                convDiv.appendChild(span);
                
                convDiv.addEventListener('click', () => selectConversation(conv.id));
                
                const currentProjectEl = document.querySelector('.project-item.active');
                if (currentProjectEl) {
                    currentProjectEl.insertAdjacentElement('afterend', convDiv);
                }
            });
        }

        async function selectConversation(conversationId) {
            currentConversation = conversationId;
            
            document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
            const targetElement = document.querySelector('[data-id="' + conversationId + '"]');
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            await loadConversationMessages(conversationId);
        }

        async function loadConversationMessages(conversationId) {
            try {
                const messagesQuery = window.firebase.query(
                    window.firebase.collection(window.firebase.db, 'messages'),
                    window.firebase.where('conversationId', '==', conversationId),
                    window.firebase.orderBy('timestamp', 'asc')
                );
                
                const messagesSnapshot = await window.firebase.getDocs(messagesQuery);
                const messages = [];
                
                messagesSnapshot.forEach((doc) => {
                    messages.push({ id: doc.id, ...doc.data() });
                });

                document.getElementById('chatContainer').innerHTML = '';
                messages.forEach(msg => {
                    addMessageToChat(msg.content, msg.role);
                });
                
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        }

        async function newChat() {
            if (!currentProject) {
                alert('⚠️ Seleziona prima un progetto!');
                return;
            }

            if (!currentUser) {
                alert('⚠️ Devi essere loggato!');
                return;
            }

            try {
                const conversationData = {
                    title: 'Nuova conversazione',
                    userId: currentUser.uid,
                    projectId: currentProject,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    messageCount: 0
                };

                const docRef = await window.firebase.addDoc(
                    window.firebase.collection(window.firebase.db, 'conversations'), 
                    conversationData
                );

                currentConversation = docRef.id;
                
                document.getElementById('chatContainer').innerHTML = '';
                addWelcomeMessage();
                
                loadProjectConversations(currentProject);
                
            } catch (error) {
                console.error('Error creating conversation:', error);
                alert('❌ Errore nella creazione della chat');
            }
        }

        function addWelcomeMessage() {
            addMessageToChat(
                '🚀 Nuova conversazione avviata! Come posso aiutarti oggi?\\n\\n💡 Suggerimenti:\\n- Chiedi di creare codice HTML/CSS/JS\\n- Fai domande tecniche\\n- Organizza tutto nei tuoi progetti',
                'assistant'
            );
        }

        async function sendMessage() {
            if (!apiKey || !isConnected) {
                alert('⚠️ Configura prima la tua API key!');
                openSettings();
                return;
            }

            if (!currentUser) {
                alert('⚠️ Accedi prima con Google!');
                return;
            }

            if (!currentConversation) {
                alert('⚠️ Crea prima una conversazione!');
                return;
            }

            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message) return;

            try {
                addMessageToChat(message, 'user');
                await saveMessageToFirebase(message, 'user');

                input.value = '';
                input.style.height = 'auto';
                showTypingIndicator();

                const response = await callClaudeAPI(message);
                hideTypingIndicator();
                
                if (response) {
                    addMessageToChat(response, 'assistant');
                    await saveMessageToFirebase(response, 'assistant');
                }
                
            } catch (error) {
                hideTypingIndicator();
                addMessageToChat('❌ Errore nella comunicazione con Claude. Verifica le impostazioni.', 'assistant');
                console.error('Error:', error);
            }
        }

        async function saveMessageToFirebase(content, role) {
            try {
                const messageData = {
                    conversationId: currentConversation,
                    userId: currentUser.uid,
                    content: content,
                    role: role,
                    timestamp: new Date()
                };

                await window.firebase.addDoc(
                    window.firebase.collection(window.firebase.db, 'messages'), 
                    messageData
                );

                if (role === 'user') {
                    await updateConversationTitle(content);
                }
                
            } catch (error) {
                console.error('Error saving message:', error);
            }
        }

        async function updateConversationTitle(firstMessage) {
            try {
                const title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
                const conversationRef = window.firebase.doc(window.firebase.db, 'conversations', currentConversation);
                
                await window.firebase.updateDoc(conversationRef, {
                    title: title,
                    updatedAt: new Date()
                });
                
                if (currentProject) {
                    loadProjectConversations(currentProject);
                }
                
            } catch (error) {
                console.error('Error updating conversation title:', error);
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
            contentDiv.innerHTML = formatMessage(content);
            
            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(contentDiv);
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function formatMessage(content) {
            return content
                .replace(/\\n/g, '<br>')
                .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code>$1</code>');
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
                    }
                } else {
                    alert('❌ ' + (result.error || 'Connessione fallita'));
                }
            } catch (error) {
                updateConnectionStatus(false);
                alert('❌ Errore di rete: ' + error.message);
            }
        }

        function updateConnectionStatus(connected) {
            isConnected = connected;
            const indicator = document.getElementById('statusIndicator');
            indicator.className = 'status-indicator ' + (connected ? 'status-connected' : 'status-disconnected');
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
                throw new Error('HTTP error! status: ' + response.status);
            }
            
            const data = await response.json();
            return data.content;
        }
    </script>
</body>
</html>`);
});

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

        console.log(`📤 Richiesta a Claude ${selectedModel} - ${messages.length} messaggi`);

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
            const errorData = await anthropicResponse.text();
            console.error('❌ Errore API Anthropic:', errorData);
            
            let errorMessage = 'Errore nella chiamata API';
            try {
                const parsedError = JSON.parse(errorData);
                if (parsedError.error && parsedError.error.message) {
                    errorMessage = parsedError.error.message;
                }
            } catch (e) {}
            
            return res.status(anthropicResponse.status).json({ 
                error: errorMessage,
                details: errorData 
            });
        }

        const data = await anthropicResponse.json();
        
        if (data.content && data.content[0] && data.content[0].text) {
            console.log('✅ Risposta ricevuta da Claude');
            res.json({ 
                content: data.content[0].text,
                model: selectedModel,
                usage: data.usage 
            });
        } else {
            console.error('❌ Formato risposta inaspettato:', data);
            res.status(500).json({ error: 'Formato di risposta API inaspettato' });
        }

    } catch (error) {
        console.error('❌ Errore server:', error);
        res.status(500).json({ 
            error: 'Errore interno del server',
            details: error.message 
        });
    }
});

app.post('/api/test', async (req, res) => {
    try {
        const { apiKey } = req.body;

        if (!apiKey) {
            return res.status(400).json({ success: false, error: 'API key richiesta' });
        }

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
            const errorData = await testResponse.text();
            console.log('❌ Test API fallito:', errorData);
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
        version: '3.0.0-ultra-clean'
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
    console.log('🔥 ========================================');
    console.log('🔥     CLAUDE AI INTERFACE - CLEAN       🔥');  
    console.log('🔥 ========================================');
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/chat`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('🔥 ✅ Firebase Auth + Projects + Zero Errors');
    console.log('🔥 ========================================');
});