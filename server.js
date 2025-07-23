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

// Chat API endpoint - updated to return usage info
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
            
            // Calculate approximate token usage
            const inputTokens = JSON.stringify(messages).length / 4;
            const outputTokens = data.content[0].text.length / 4;
            const totalTokens = Math.round(inputTokens + outputTokens);
            
            res.json({ 
                content: data.content[0].text,
                model: selectedModel,
                usage: {
                    input_tokens: Math.round(inputTokens),
                    output_tokens: Math.round(outputTokens),
                    total_tokens: totalTokens
                }
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
        version: '7.0.0-enhanced-features'
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
    console.log('🚀  CLAUDE AI INTERFACE PRO - ENHANCED    🚀');
    console.log('🚀 ==========================================');
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API Chat: http://localhost:${PORT}/api/chat`);
    console.log(`🧪 API Test: http://localhost:${PORT}/api/test`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('🔥 ✅ Interfaccia progetti stile Claude');
    console.log('🔥 ✅ Chat multiple per progetto');
    console.log('🔥 ✅ Gestione file per progetto');
    console.log('🔥 ✅ Statistiche API e token');
    console.log('🚀 ==========================================');
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
        .sidebar { width: 260px; background: #171717; border-right: 1px solid #333; display: flex; flex-direction: column; transition: all 0.3s ease; }
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
        
        /* Nuovi stili per progetti stile Claude */
        .projects-section { flex: 1; overflow-y: auto; padding: 0; }
        .project-group { margin-bottom: 20px; }
        .project-header { padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; }
        .project-header:hover { background: #333; }
        .project-header-content { display: flex; align-items: center; gap: 8px; flex: 1; }
        .project-arrow { transition: transform 0.2s; color: #888; }
        .project-arrow.open { transform: rotate(90deg); }
        .project-name { font-weight: 500; font-size: 14px; }
        .project-actions { display: flex; gap: 8px; opacity: 0; transition: opacity 0.2s; }
        .project-header:hover .project-actions { opacity: 1; }
        .project-action-btn { background: none; border: none; color: #888; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s; }
        .project-action-btn:hover { background: #444; color: #fff; }
        .project-chats { display: none; background: #0f0f0f; }
        .project-chats.open { display: block; }
        .chat-item { padding: 8px 16px 8px 40px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; font-size: 13px; }
        .chat-item:hover { background: #333; }
        .chat-item.active { background: #2563eb; }
        .chat-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .chat-date { font-size: 11px; color: #888; }
        .add-chat-btn { padding: 8px 16px 8px 40px; color: #888; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .add-chat-btn:hover { color: #fff; background: #333; }
        
        /* Stats section */
        .stats-section { padding: 16px; border-top: 1px solid #333; background: #0f0f0f; }
        .stats-title { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .stat-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; }
        .stat-label { color: #888; }
        .stat-value { font-weight: 500; }
        .stat-bar { height: 4px; background: #333; border-radius: 2px; margin-top: 4px; overflow: hidden; }
        .stat-bar-fill { height: 100%; background: #2563eb; border-radius: 2px; transition: width 0.3s; }
        
        /* File upload area */
        .file-upload-area { padding: 16px 20px; border-top: 1px solid #333; background: #0f0f0f; }
        .file-upload-btn { width: 100%; padding: 12px; border: 2px dashed #444; border-radius: 8px; background: none; color: #888; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .file-upload-btn:hover { border-color: #2563eb; color: #2563eb; }
        .file-list { margin-top: 12px; }
        .file-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #1a1a1a; border-radius: 6px; margin-bottom: 4px; font-size: 13px; }
        .file-name { display: flex; align-items: center; gap: 8px; flex: 1; }
        .file-remove { background: none; border: none; color: #888; cursor: pointer; padding: 4px; }
        .file-remove:hover { color: #dc2626; }
        
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
        .input-container { padding: 20px; border-top: 1px solid #333; background: #1a1a1a; }
        .input-wrapper { max-width: 1000px; margin: 0 auto; position: relative; }
        .message-input { width: 100%; background: #2a2a2a; border: 1px solid #444; border-radius: 24px; padding: 16px 60px 16px 20px; color: white; font-size: 16px; resize: none; min-height: 56px; max-height: 200px; outline: none; transition: all 0.2s; }
        .message-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
        .send-button { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: #2563eb; border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .send-button:hover { background: #1d4ed8; }
        .send-button:disabled { background: #444; cursor: not-allowed; }
        
        /* Modals */
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
            
            <div class="projects-section" id="projectsSection" style="display: none;">
                <div id="projectsList"></div>
            </div>
            
            <div class="stats-section" id="statsSection" style="display: none;">
                <div class="stats-title">Utilizzo API</div>
                <div class="stat-item">
                    <span class="stat-label">Token utilizzati oggi</span>
                    <span class="stat-value" id="tokensUsed">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Credito residuo</span>
                    <span class="stat-value" id="creditRemaining">$0.00</span>
                </div>
                <div class="stat-bar">
                    <div class="stat-bar-fill" id="usageBar" style="width: 0%"></div>
                </div>
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
                            <li><strong>📎 File:</strong> Condividi file nei progetti</li>
                            <li><strong>📊 Stats:</strong> Monitora l'utilizzo API</li>
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
            
            <div class="file-upload-area" id="fileUploadArea" style="display: none;">
                <button class="file-upload-btn" onclick="selectFiles()">
                    <i class="fas fa-paperclip"></i>
                    <span>Allega file al progetto</span>
                </button>
                <input type="file" id="fileInput" multiple style="display: none;">
                <div class="file-list" id="fileList"></div>
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
            <button class="create-button" onclick="saveProject()">📁 Crea Progetto</button>
        </div>
    </div>

    <script>
        let currentUser = null;
        let currentProject = null;
        let currentConversation = null;
        let apiKey = localStorage.getItem('claude-api-key') || '';
        let isConnected = false;
        let projectFiles = {};
        let apiStats = {
            tokensUsed: 0,
            creditRemaining: 100.00
        };

        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        async function initializeApp() {
            setupEventListeners();
            if (apiKey) {
                document.getElementById('apiKeyInput').value = apiKey;
                testConnection();
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
            document.getElementById('fileInput').addEventListener('change', handleFileSelect);
            
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
                currentUser = null;
                currentProject = null;
                currentConversation = null;
                showLoginInterface();
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        function showUserInterface(user) {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('userInfo').style.display = 'flex';
            document.getElementById('newProjectBtn').style.display = 'flex';
            document.getElementById('projectsSection').style.display = 'block';
            document.getElementById('statsSection').style.display = 'block';
            
            document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
            document.getElementById('userAvatar').src = user.user_metadata?.picture || user.user_metadata?.avatar_url || '';
            
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = false;
            messageInput.placeholder = 'Scrivi un messaggio...';
            
            if (apiKey && isConnected) {
                document.getElementById('sendButton').disabled = false;
            }
            
            updateAPIStats();
        }

        function showLoginInterface() {
            document.getElementById('loginSection').style.display = 'block';
            document.getElementById('userInfo').style.display = 'none';
            document.getElementById('newProjectBtn').style.display = 'none';
            document.getElementById('projectsSection').style.display = 'none';
            document.getElementById('statsSection').style.display = 'none';
            document.getElementById('fileUploadArea').style.display = 'none';
            
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
                    ])
                    .select()
                    .single();

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
                    .select('*, conversations(*)')
                    .eq('user_id', currentUser.id)
                    .order('updated_at', { ascending: false });

                if (error) {
                    console.error('Error loading projects:', error);
                    return;
                }

                renderProjects(projects || []);
                
                // Load API stats
                loadAPIStats();
                
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        function renderProjects(projects) {
            const projectsList = document.getElementById('projectsList');
            projectsList.innerHTML = '';

            projects.forEach(project => {
                const projectGroup = document.createElement('div');
                projectGroup.className = 'project-group';
                projectGroup.dataset.projectId = project.id;
                
                const projectHeader = document.createElement('div');
                projectHeader.className = 'project-header';
                projectHeader.innerHTML = `
                    <div class="project-header-content">
                        <i class="fas fa-chevron-right project-arrow"></i>
                        <i class="fas fa-folder"></i>
                        <span class="project-name">${project.name}</span>
                    </div>
                    <div class="project-actions">
                        <button class="project-action-btn" onclick="editProject('${project.id}')" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="project-action-btn" onclick="deleteProject('${project.id}')" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                projectHeader.addEventListener('click', function(e) {
                    if (!e.target.closest('.project-actions')) {
                        toggleProjectChats(project.id);
                    }
                });
                
                const projectChats = document.createElement('div');
                projectChats.className = 'project-chats';
                projectChats.id = `project-chats-${project.id}`;
                
                // Render conversations
                if (project.conversations && project.conversations.length > 0) {
                    project.conversations.forEach(conv => {
                        const chatItem = document.createElement('div');
                        chatItem.className = 'chat-item';
                        chatItem.dataset.conversationId = conv.id;
                        chatItem.innerHTML = \`
                            <span class="chat-title">\${conv.title || 'Chat senza titolo'}</span>
                            <span class="chat-date">\${new Date(conv.created_at).toLocaleDateString('it-IT')}</span>
                        \`;
                        chatItem.addEventListener('click', () => loadConversation(conv.id, project.id, project.name));
                        projectChats.appendChild(chatItem);
                    });
                }
                
                // Add new chat button
                const addChatBtn = document.createElement('div');
                addChatBtn.className = 'add-chat-btn';
                addChatBtn.innerHTML = \`
                    <i class="fas fa-plus"></i>
                    <span>Nuova chat</span>
                \`;
                addChatBtn.addEventListener('click', () => createNewChat(project.id, project.name));
                projectChats.appendChild(addChatBtn);
                
                projectGroup.appendChild(projectHeader);
                projectGroup.appendChild(projectChats);
                projectsList.appendChild(projectGroup);
            });
        }

        function toggleProjectChats(projectId) {
            const projectChats = document.getElementById(\`project-chats-\${projectId}\`);
            const arrow = document.querySelector(\`[data-project-id="\${projectId}"] .project-arrow\`);
            
            if (projectChats.classList.contains('open')) {
                projectChats.classList.remove('open');
                arrow.classList.remove('open');
            } else {
                // Close all other projects
                document.querySelectorAll('.project-chats').forEach(pc => pc.classList.remove('open'));
                document.querySelectorAll('.project-arrow').forEach(pa => pa.classList.remove('open'));
                
                projectChats.classList.add('open');
                arrow.classList.add('open');
            }
        }

        async function createNewChat(projectId, projectName) {
            if (!currentUser) return;
            
            try {
                const { data, error } = await window.supabase
                    .from('conversations')
                    .insert([
                        {
                            title: 'Nuova conversazione',
                            user_id: currentUser.id,
                            project_id: projectId,
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

                loadConversation(data.id, projectId, projectName);
                loadUserData(); // Reload to show new chat
                
            } catch (error) {
                console.error('Error creating chat:', error);
                alert('❌ Errore nella creazione della chat');
            }
        }

        async function loadConversation(conversationId, projectId, projectName) {
            currentConversation = conversationId;
            currentProject = projectId;
            
            // Update UI
            document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
            document.querySelector(\`[data-conversation-id="\${conversationId}"]\`)?.classList.add('active');
            document.getElementById('currentProject').textContent = \`📁 \${projectName}\`;
            document.getElementById('fileUploadArea').style.display = 'block';
            
            // Load messages
            try {
                const { data: messages, error } = await window.supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', conversationId)
                    .order('created_at', { ascending: true });

                if (error) {
                    console.error('Error loading messages:', error);
                    return;
                }

                // Clear chat and render messages
                document.getElementById('chatContainer').innerHTML = '';
                
                if (messages && messages.length > 0) {
                    messages.forEach(msg => {
                        addMessageToChat(msg.content, msg.role);
                    });
                } else {
                    addMessageToChat('🚀 Conversazione avviata! Come posso aiutarti?', 'assistant');
                }
                
                // Load project files
                loadProjectFiles(projectId);
                
            } catch (error) {
                console.error('Error loading conversation:', error);
            }
        }

        async function loadProjectFiles(projectId) {
            try {
                const { data: files, error } = await window.supabase
                    .from('project_files')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error loading files:', error);
                    return;
                }

                projectFiles[projectId] = files || [];
                renderFileList();
                
            } catch (error) {
                console.error('Error loading files:', error);
            }
        }

        function selectFiles() {
            document.getElementById('fileInput').click();
        }

        async function handleFileSelect(event) {
            const files = event.target.files;
            if (!files.length || !currentProject) return;
            
            for (let file of files) {
                try {
                    // Here you would upload to Supabase Storage
                    // For now, we'll just add to the UI
                    const fileData = {
                        id: Date.now().toString(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        project_id: currentProject
                    };
                    
                    if (!projectFiles[currentProject]) {
                        projectFiles[currentProject] = [];
                    }
                    projectFiles[currentProject].push(fileData);
                    
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            }
            
            renderFileList();
            event.target.value = '';
        }

        function renderFileList() {
            const fileList = document.getElementById('fileList');
            const files = projectFiles[currentProject] || [];
            
            fileList.innerHTML = '';
            
            files.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = \`
                    <div class="file-name">
                        <i class="fas fa-file"></i>
                        <span>\${file.name}</span>
                    </div>
                    <button class="file-remove" onclick="removeFile('\${file.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                \`;
                fileList.appendChild(fileItem);
            });
        }

        function removeFile(fileId) {
            if (!currentProject) return;
            
            projectFiles[currentProject] = projectFiles[currentProject].filter(f => f.id !== fileId);
            renderFileList();
        }

        async function loadAPIStats() {
            // In a real implementation, this would fetch from your backend
            // For now, we'll use localStorage
            const savedStats = localStorage.getItem('api-stats');
            if (savedStats) {
                apiStats = JSON.parse(savedStats);
                updateAPIStats();
            }
        }

        function updateAPIStats() {
            document.getElementById('tokensUsed').textContent = apiStats.tokensUsed.toLocaleString();
            document.getElementById('creditRemaining').textContent = `${apiStats.creditRemaining.toFixed(2)}`;
            
            const usagePercent = (apiStats.tokensUsed / 1000000) * 100; // Assuming 1M token limit
            document.getElementById('usageBar').style.width = \`\${Math.min(usagePercent, 100)}%\`;
        }

        function updateTokenUsage(tokens) {
            apiStats.tokensUsed += tokens;
            apiStats.creditRemaining = Math.max(0, apiStats.creditRemaining - (tokens * 0.00001)); // Example pricing
            
            localStorage.setItem('api-stats', JSON.stringify(apiStats));
            updateAPIStats();
        }

        async function sendMessage() {
            if (!apiKey || !isConnected) {
                alert('⚠️ Configura prima la tua API key!');
                openSettings();
                return;
            }

            if (!currentUser || !currentConversation) {
                alert('⚠️ Seleziona o crea una conversazione!');
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

                // Get conversation context
                const { data: recentMessages } = await window.supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', currentConversation)
                    .order('created_at', { ascending: false })
                    .limit(10);

                const messages = recentMessages?.reverse() || [];
                messages.push({ role: 'user', content: message });

                const response = await callClaudeAPI(messages);
                hideTypingIndicator();
                
                if (response) {
                    addMessageToChat(response.content, 'assistant');
                    
                    // Update token usage
                    if (response.usage) {
                        updateTokenUsage(response.usage.total_tokens);
                    }
                    
                    // Save messages to database
                    await saveMessages(message, response.content);
                    
                    // Update conversation title if it's the first message
                    if (messages.length <= 2) {
                        updateConversationTitle(message);
                    }
                }
                
            } catch (error) {
                hideTypingIndicator();
                addMessageToChat('❌ Errore nella comunicazione con Claude.', 'assistant');
            }
        }

        async function updateConversationTitle(firstMessage) {
            if (!currentConversation) return;
            
            const title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
            
            try {
                await window.supabase
                    .from('conversations')
                    .update({ title, updated_at: new Date().toISOString() })
                    .eq('id', currentConversation);
                    
                loadUserData(); // Reload to show updated title
            } catch (error) {
                console.error('Error updating title:', error);
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
            contentDiv.innerHTML = content.replace(/\\n/g, '<br>');
            
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

        async function callClaudeAPI(messages) {
            const model = document.getElementById('modelSelector').value;
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: messages.map(m => ({ role: m.role, content: m.content })), 
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

        // Placeholder functions for edit/delete
        window.editProject = function(projectId) {
            console.log('Edit project:', projectId);
            // TODO: Implement edit functionality
        };

        window.deleteProject = async function(projectId) {
            if (!confirm('Sei sicuro di voler eliminare questo progetto?')) return;
            
            try {
                const { error } = await window.supabase
                    .from('projects')
                    .delete()
                    .eq('id', projectId);
                    
                if (error) {
                    console.error('Error deleting project:', error);
                    alert('❌ Errore nell\'eliminazione del progetto');
                    return;
                }
                
                loadUserData();
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        };
    </script>
</body>
</html>`);