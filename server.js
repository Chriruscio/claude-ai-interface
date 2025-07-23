<div class="projects-section" id="projectsSection" style="display: none;">
                <div class="projects-header">Projects</div>
                <div id="projectsList"></div>
                
                <div class="projects-header" style="margin-top: 20px;">Recents</div>
                <div id="recentChats"></div>
            </div>
        </div>

        <div class="main-content">
            <div class="chat-header">
                <div class="header-info">
                    <div>
                        <div class="chat-title" id="headerTitle">Claude</div>
                        <div id="currentProject" style="color: var(--text-muted); font-size: 14px;"></div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <select class="model-selector" id="modelSelector">
                        <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                        <option value="claude-opus-4">Claude Opus 4</option>
                    </select>
                    <span class="status-indicator status-disconnected" id="statusIndicator"></span>
                </div>
            </div>
            
            <div class="chat-container" id="chatContainer">
                <div class="messages-inner">
                    <div class="welcome-message">
                        <div class="welcome-title">How can I help you today?</div>
                        <div class="welcome-subtitle">
                            I'm Claude, an AI assistant created by Anthropic. I can help you with writing, analysis, math, coding, creative projects, and much more.
                        </div>
                    </div>
                </div>
            </div>

            <div class="typing-indicator" id="typingIndicator">
                <div class="typing-wrapper">
                    <div class="message-avatar assistant-avatar">C</div>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
            
            <div class="input-container">
                <div class="input-wrapper">
                    <textarea class="message-input" id="messageInput" placeholder="Message Claude..." rows="1" disabled></textarea>
                    <button class="send-button" id="sendButton" disabled><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal" id="settingsModal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">API Settings</div>
                <button class="modal-close" id="modalClose">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Anthropic API Key</label>
                    <input type="password" class="form-input" id="apiKeyInput" placeholder="sk-ant-...">
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">
                        Your API key is stored locally and never shared
                    </div>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button class="test-button" onclick="testConnection()">
                        <i class="fas fa-check"></i>
                        Test Connection
                    </button>
                    <button class="save-button" onclick="saveSettings()">
                        <i class="fas fa-save"></i>
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal" id="createProjectModal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">Create New Project</div>
                <button class="modal-close" onclick="closeCreateProject()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Project Name</label>
                    <input type="text" class="form-input" id="projectNameInput" placeholder="e.g. Market Analysis">
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;" onclick="closeCreateProject()">
                        Cancel
                    </button>
                    <button class="create-button" onclick="saveProject()">
                        <i class="fas fa-plus"></i>
                        Create Project
                    </button>
                </div>
            </div>
        </div>
    </div>const express = require('express');
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
        :root {
            --bg-primary: #0D0E10;
            --bg-secondary: #1A1B1E;
            --bg-tertiary: #2C2D30;
            --border-color: #3B3C40;
            --text-primary: #F5F5F5;
            --text-secondary: #B4B5B9;
            --text-muted: #86868B;
            --accent-orange: #FF6B35;
            --accent-orange-hover: #E55A2E;
            --accent-blue: #007AFF;
            --accent-green: #32D74B;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif; 
            background: var(--bg-primary); 
            color: var(--text-primary); 
            height: 100vh; 
            overflow: hidden;
            font-size: 14px;
        }

        .app-container { 
            display: flex; 
            height: 100vh; 
        }

        /* ========== SIDEBAR ========== */
        .sidebar { 
            width: 280px; 
            background: var(--bg-secondary); 
            border-right: 1px solid var(--border-color); 
            display: flex; 
            flex-direction: column; 
            transition: all 0.3s ease; 
        }

        .sidebar-header { 
            padding: 16px 20px; 
            border-bottom: 1px solid var(--border-color); 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            min-height: 64px;
        }

        .sidebar-toggle { 
            background: none; 
            border: none; 
            color: var(--text-secondary); 
            cursor: pointer; 
            padding: 8px; 
            border-radius: 6px; 
            transition: all 0.2s;
            font-size: 16px;
        }

        .sidebar-toggle:hover { 
            background: var(--bg-tertiary); 
            color: var(--text-primary); 
        }

        .claude-logo {
            font-size: 18px;
            font-weight: 600;
            color: var(--accent-orange);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .settings-btn {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            font-size: 16px;
            transition: all 0.2s;
        }

        .settings-btn:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }

        /* Auth Section */
        .login-section { 
            padding: 16px 20px; 
            border-bottom: 1px solid var(--border-color); 
        }

        .google-login-btn { 
            background: var(--accent-orange); 
            color: white; 
            border: none; 
            padding: 12px 16px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            width: 100%; 
            justify-content: center; 
            transition: all 0.2s; 
            font-weight: 500;
        }

        .google-login-btn:hover { 
            background: var(--accent-orange-hover); 
        }

        .user-info { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            padding: 12px 0;
        }

        .user-avatar { 
            width: 36px; 
            height: 36px; 
            border-radius: 50%; 
            object-fit: cover;
            border: 2px solid var(--border-color);
        }

        .logout-btn { 
            background: none; 
            border: 1px solid var(--border-color); 
            color: var(--text-secondary); 
            padding: 6px 12px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 12px;
            transition: all 0.2s;
        }

        .logout-btn:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }

        /* New Chat Button */
        .new-chat-btn { 
            background: var(--accent-orange); 
            border: none; 
            color: white; 
            padding: 12px 20px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 500; 
            margin: 16px 20px 8px; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            transition: all 0.2s; 
        }

        .new-chat-btn:hover { 
            background: var(--accent-orange-hover); 
        }

        .new-project-btn { 
            background: var(--accent-green); 
            border: none; 
            color: white; 
            padding: 12px 20px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 500; 
            margin: 8px 20px; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            transition: all 0.2s; 
        }

        .new-project-btn:hover { 
            background: #28C840; 
        }

        /* Projects Section */
        .projects-section { 
            flex: 1; 
            overflow-y: auto; 
            padding: 0 20px 20px; 
        }

        .projects-header { 
            padding: 16px 0 8px; 
            font-size: 12px; 
            color: var(--text-muted); 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            font-weight: 600;
        }

        .project-item { 
            padding: 10px 12px; 
            border-radius: 8px; 
            cursor: pointer; 
            margin-bottom: 2px; 
            transition: all 0.2s; 
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .project-item:hover { 
            background: var(--bg-tertiary); 
        }

        .project-item.active { 
            background: var(--accent-orange);
            color: white;
        }

        .project-icon {
            font-size: 16px;
            width: 20px;
            text-align: center;
            color: var(--text-secondary);
        }

        .project-item.active .project-icon {
            color: white;
        }

        .project-details {
            flex: 1;
            overflow: hidden;
        }

        .project-title { 
            font-weight: 500; 
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .project-chat-count { 
            font-size: 12px; 
            color: var(--text-muted); 
            margin-top: 2px;
        }

        .project-item.active .project-chat-count {
            color: rgba(255, 255, 255, 0.8);
        }

        /* ========== MAIN CONTENT ========== */
        .main-content { 
            flex: 1; 
            display: flex; 
            flex-direction: column; 
            background: var(--bg-primary); 
        }

        .chat-header { 
            padding: 16px 24px; 
            border-bottom: 1px solid var(--border-color); 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            min-height: 64px;
            background: var(--bg-primary);
        }

        .header-info {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .chat-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .model-selector { 
            background: var(--bg-secondary); 
            border: 1px solid var(--border-color); 
            color: var(--text-primary); 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-size: 14px; 
            cursor: pointer;
            transition: all 0.2s;
        }

        .model-selector:hover {
            background: var(--bg-tertiary);
        }

        /* ========== CHAT AREA ========== */
        .chat-container { 
            flex: 1; 
            overflow-y: auto; 
            padding: 0;
        }

        .messages-inner {
            max-width: 768px;
            margin: 0 auto;
            padding: 24px;
        }

        .welcome-message {
            text-align: center;
            padding: 60px 20px;
            max-width: 600px;
            margin: 0 auto;
        }

        .welcome-title {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 16px;
            background: linear-gradient(135deg, var(--accent-orange), #FFA726);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .welcome-subtitle {
            font-size: 18px;
            color: var(--text-secondary);
            margin-bottom: 32px;
            line-height: 1.5;
        }

        .message { 
            margin-bottom: 32px; 
            display: flex; 
            gap: 16px;
        }

        .message-avatar { 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 14px; 
            font-weight: 600; 
            flex-shrink: 0; 
            margin-top: 4px;
        }

        .user-avatar-msg { 
            background: var(--accent-blue); 
            color: white; 
        }

        .assistant-avatar { 
            background: var(--accent-orange); 
            color: white; 
        }

        .message-content { 
            flex: 1; 
            line-height: 1.6;
            font-size: 15px;
        }

        /* Typing Indicator */
        .typing-indicator { 
            display: none; 
            margin-bottom: 32px;
            max-width: 768px;
            margin-left: auto;
            margin-right: auto;
            padding: 0 24px;
        }

        .typing-wrapper {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .typing-dots { 
            display: flex; 
            gap: 4px; 
            align-items: center;
            background: var(--bg-secondary);
            padding: 16px 20px;
            border-radius: 16px;
        }

        .typing-dot { 
            width: 8px; 
            height: 8px; 
            background: var(--text-muted); 
            border-radius: 50%; 
            animation: typing 1.4s infinite; 
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing { 
            0%, 60%, 100% { 
                transform: translateY(0); 
                opacity: 0.4; 
            } 
            30% { 
                transform: translateY(-8px); 
                opacity: 1; 
            } 
        }

        /* ========== INPUT AREA ========== */
        .input-container { 
            padding: 20px 24px 24px; 
            border-top: 1px solid var(--border-color); 
            background: var(--bg-primary); 
        }

        .input-wrapper { 
            max-width: 768px; 
            margin: 0 auto; 
            position: relative; 
        }

        .message-input { 
            width: 100%; 
            background: var(--bg-secondary); 
            border: 1px solid var(--border-color); 
            border-radius: 12px; 
            padding: 16px 60px 16px 20px; 
            color: var(--text-primary); 
            font-size: 15px; 
            resize: none; 
            min-height: 56px; 
            max-height: 200px; 
            outline: none; 
            transition: all 0.2s; 
            font-family: inherit;
            line-height: 1.5;
        }

        .message-input:focus { 
            border-color: var(--accent-orange); 
            box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.1); 
        }

        .message-input::placeholder {
            color: var(--text-muted);
        }

        .send-button { 
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: var(--accent-orange); 
            border: none; 
            color: white; 
            width: 36px; 
            height: 36px; 
            border-radius: 8px; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            transition: all 0.2s; 
            font-size: 16px;
        }

        .send-button:hover { 
            background: var(--accent-orange-hover); 
        }

        .send-button:disabled { 
            background: var(--bg-tertiary); 
            color: var(--text-muted);
            cursor: not-allowed; 
        }

        /* ========== MODALS ========== */
        .modal { 
            display: none; 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0, 0, 0, 0.6); 
            z-index: 1000; 
            backdrop-filter: blur(4px);
        }

        .modal-content { 
            background: var(--bg-secondary); 
            margin: 8% auto; 
            padding: 0; 
            border-radius: 12px; 
            width: 90%; 
            max-width: 500px; 
            position: relative;
            border: 1px solid var(--border-color);
        }

        .modal-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color);
        }

        .modal-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .modal-close { 
            background: none; 
            border: none; 
            color: var(--text-secondary); 
            font-size: 24px; 
            cursor: pointer; 
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .modal-close:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }

        .modal-body {
            padding: 24px;
        }

        .form-group { 
            margin-bottom: 20px; 
        }

        .form-label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: 500; 
            color: var(--text-primary);
            font-size: 14px;
        }

        .form-input { 
            width: 100%; 
            background: var(--bg-primary); 
            border: 1px solid var(--border-color); 
            border-radius: 8px; 
            padding: 12px 16px; 
            color: var(--text-primary); 
            font-size: 14px; 
            outline: none;
            transition: all 0.2s;
            font-family: inherit;
        }

        .form-input:focus { 
            border-color: var(--accent-orange);
            box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.1);
        }

        .save-button, .test-button, .create-button { 
            border: none; 
            padding: 10px 20px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 500;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-right: 12px;
        }

        .save-button {
            background: var(--accent-orange); 
            color: white; 
        }

        .save-button:hover {
            background: var(--accent-orange-hover);
        }

        .test-button { 
            background: var(--accent-green); 
            color: white;
        }

        .test-button:hover {
            background: #28C840;
        }

        .create-button { 
            background: #f59e0b; 
            color: white;
        }

        .create-button:hover {
            background: #d97706;
        }

        .status-indicator { 
            display: inline-block; 
            width: 8px; 
            height: 8px; 
            border-radius: 50%; 
            margin-left: 8px; 
        }

        .status-connected { 
            background: var(--accent-green); 
        }

        .status-disconnected { 
            background: #dc2626; 
        }

        /* ========== CUSTOM SCROLLBAR ========== */
        ::-webkit-scrollbar {
            width: 6px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg-secondary);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--text-muted);
        }
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
            
            document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
            document.getElementById('userAvatar').src = user.user_metadata?.picture || user.user_metadata?.avatar_url || '';
            
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = false;
            messageInput.placeholder = 'Scrivi un messaggio...';
            
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
                    .select('*')
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
                
                const titleDiv = document.createElement('div');
                titleDiv.className = 'project-title';
                titleDiv.textContent = project.name;
                
                const countDiv = document.createElement('div');
                countDiv.className = 'project-chat-count';
                countDiv.textContent = '0 conversazioni';
                
                projectDiv.appendChild(titleDiv);
                projectDiv.appendChild(countDiv);
                
                projectDiv.addEventListener('click', function() {
                    selectProject(project.id, project.name);
                });
                projectsList.appendChild(projectDiv);
            });
        }

        function selectProject(projectId, projectName) {
            currentProject = projectId;
            
            document.querySelectorAll('.project-item').forEach(function(el) {
                el.classList.remove('active');
            });
            
            const targetElement = document.querySelector('[data-id="' + projectId + '"]');
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            document.getElementById('currentProject').textContent = '📁 ' + projectName;
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
                
                document.getElementById('chatContainer').innerHTML = '';
                addMessageToChat('🚀 Nuova conversazione avviata! Come posso aiutarti?', 'assistant');
                
            } catch (error) {
                console.error('Error creating chat:', error);
                alert('❌ Errore nella creazione della chat');
            }
        }

        async function sendMessage() {
            if (!apiKey || !isConnected) {
                alert('⚠️ Configura prima la tua API key!');
                openSettings();
                return;
            }

            if (!currentUser || !currentConversation) {
                alert('⚠️ Accedi e crea una conversazione!');
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
                    addMessageToChat(response, 'assistant');
                    
                    // Save messages to database
                    await saveMessages(message, response);
                }
                
            } catch (error) {
                hideTypingIndicator();
                addMessageToChat('❌ Errore nella comunicazione con Claude.', 'assistant');
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
            return data.content;
        }

        
    </script>
</body>
</html>`);
});

// Chat API endpoint - IDENTICO A PRIMA
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
                model: selectedModel
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

// Test API endpoint - IDENTICO A PRIMA
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
        version: '6.0.0-supabase-complete'
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
    console.log('🚀  CLAUDE AI INTERFACE PRO - SUPABASE    🚀');
    console.log('🚀 ==========================================');
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API Chat: http://localhost:${PORT}/api/chat`);
    console.log(`🧪 API Test: http://localhost:${PORT}/api/test`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('🔥 ✅ Supabase Auth + Google OAuth completi');
    console.log('🔥 ✅ Database integrato per progetti/chat');
    console.log('🚀 ==========================================');
});