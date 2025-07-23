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
        
        :root {
            --bg-main: #f7f7f8;
            --bg-sidebar: #ffffff;
            --bg-chat: #ffffff;
            --bg-message-user: #f4f4f4;
            --bg-message-assistant: #ffffff;
            --bg-input: #ffffff;
            --border-color: #e5e5e5;
            --text-primary: #2d333a;
            --text-secondary: #656b73;
            --text-tertiary: #9ca3af;
            --accent-color: #d97706;
            --hover-color: #f3f4f6;
            --focus-color: #d97706;
            --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
            background: var(--bg-main); 
            color: var(--text-primary); 
            height: 100vh; 
            overflow: hidden; 
            font-size: 14px;
        }
        
        .app-container { 
            display: flex; 
            height: 100vh; 
        }
        
        .sidebar { 
            width: 280px; 
            background: var(--bg-sidebar); 
            border-right: 1px solid var(--border-color); 
            display: flex; 
            flex-direction: column; 
            transition: all 0.2s ease;
        }
        
        .sidebar-header { 
            padding: 16px 20px; 
            border-bottom: 1px solid var(--border-color); 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
        }
        
        .claude-logo { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            font-weight: 600; 
            color: var(--text-primary); 
            font-size: 16px; 
        }
        
        .claude-icon { 
            width: 24px; 
            height: 24px; 
            background: linear-gradient(135deg, #d97706, #f59e0b); 
            border-radius: 6px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold; 
            font-size: 12px; 
        }
        
        .sidebar-actions { 
            display: flex; 
            gap: 8px; 
        }
        
        .btn-icon { 
            width: 32px; 
            height: 32px; 
            border: none; 
            background: none; 
            border-radius: 6px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            color: var(--text-secondary); 
            transition: all 0.2s; 
            font-size: 16px; 
        }
        
        .btn-icon:hover { 
            background: var(--hover-color); 
            color: var(--text-primary); 
        }
        
        .user-section { 
            padding: 16px 20px; 
            border-bottom: 1px solid var(--border-color); 
        }
        
        .login-button { 
            width: 100%; 
            background: var(--accent-color); 
            color: white; 
            border: none; 
            padding: 12px 16px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 500; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 8px; 
            transition: all 0.2s; 
        }
        
        .login-button:hover { 
            background: #c2690f; 
        }
        
        .user-info { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
        }
        
        .user-avatar { 
            width: 36px; 
            height: 36px; 
            border-radius: 50%; 
            object-fit: cover; 
        }
        
        .user-details { 
            flex: 1; 
        }
        
        .user-name { 
            font-weight: 500; 
            font-size: 14px; 
            margin-bottom: 2px; 
        }
        
        .user-email { 
            font-size: 12px; 
            color: var(--text-secondary); 
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
            background: var(--hover-color); 
        }
        
        .new-chat-section { 
            padding: 16px 20px; 
            border-bottom: 1px solid var(--border-color); 
        }
        
        .new-chat-btn { 
            width: 100%; 
            background: var(--bg-input); 
            border: 1px solid var(--border-color); 
            color: var(--text-primary); 
            padding: 12px 16px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 500; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            transition: all 0.2s; 
        }
        
        .new-chat-btn:hover { 
            background: var(--hover-color); 
        }
        
        .projects-section { 
            flex: 1; 
            overflow-y: auto; 
            padding: 8px 0; 
        }
        
        .section-header { 
            padding: 12px 20px 8px 20px; 
            font-size: 12px; 
            font-weight: 600; 
            color: var(--text-tertiary); 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
        }
        
        .add-project-btn { 
            background: none; 
            border: none; 
            color: var(--text-tertiary); 
            cursor: pointer; 
            padding: 4px; 
            border-radius: 4px; 
            transition: all 0.2s; 
        }
        
        .add-project-btn:hover { 
            background: var(--hover-color); 
            color: var(--text-primary); 
        }
        
        .project-list { 
            padding: 0 8px; 
        }
        
        .project-item { 
            padding: 8px 12px; 
            margin: 2px 0; 
            border-radius: 6px; 
            cursor: pointer; 
            transition: all 0.2s; 
            font-size: 14px; 
            color: var(--text-secondary); 
            display: flex; 
            align-items: center; 
            gap: 8px; 
        }
        
        .project-item:hover { 
            background: var(--hover-color); 
            color: var(--text-primary); 
        }
        
        .project-item.active { 
            background: #fef3e2; 
            color: var(--accent-color); 
            font-weight: 500; 
        }
        
        .project-icon { 
            width: 16px; 
            height: 16px; 
            opacity: 0.7; 
        }
        
        .main-content { 
            flex: 1; 
            display: flex; 
            flex-direction: column; 
            background: var(--bg-chat); 
        }
        
        .chat-header { 
            padding: 16px 20px; 
            border-bottom: 1px solid var(--border-color); 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            background: var(--bg-chat); 
        }
        
        .chat-title { 
            font-size: 16px; 
            font-weight: 600; 
            color: var(--text-primary); 
            display: flex; 
            align-items: center; 
            gap: 8px; 
        }
        
        .status-dot { 
            width: 8px; 
            height: 8px; 
            border-radius: 50%; 
            background: #10b981; 
        }
        
        .model-selector { 
            background: var(--bg-input); 
            border: 1px solid var(--border-color); 
            color: var(--text-primary); 
            padding: 6px 12px; 
            border-radius: 6px; 
            font-size: 13px; 
            cursor: pointer; 
        }
        
        .chat-container { 
            flex: 1; 
            overflow-y: auto; 
            padding: 0; 
            background: var(--bg-chat); 
        }
        
        .message-group { 
            max-width: 768px; 
            margin: 0 auto; 
            padding: 24px 20px; 
        }
        
        .message { 
            display: flex; 
            gap: 16px; 
            margin-bottom: 20px; 
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
        }
        
        .user-avatar-msg { 
            background: #e5e7eb; 
            color: var(--text-primary); 
        }
        
        .assistant-avatar-msg { 
            background: linear-gradient(135deg, #d97706, #f59e0b); 
            color: white; 
        }
        
        .message-content { 
            flex: 1; 
            line-height: 1.6; 
            font-size: 15px; 
        }
        
        .message-content p { 
            margin-bottom: 12px; 
        }
        
        .message-content ul, .message-content ol { 
            margin: 12px 0; 
            padding-left: 20px; 
        }
        
        .message-content li { 
            margin-bottom: 4px; 
        }
        
        .message-content code { 
            background: #f3f4f6; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-family: 'Courier New', monospace; 
            font-size: 13px; 
        }
        
        .typing-indicator { 
            display: none; 
            max-width: 768px; 
            margin: 0 auto; 
            padding: 0 20px; 
        }
        
        .typing-message { 
            display: flex; 
            gap: 16px; 
            align-items: center; 
        }
        
        .typing-dots { 
            display: flex; 
            gap: 4px; 
            padding: 16px 0; 
        }
        
        .typing-dot { 
            width: 8px; 
            height: 8px; 
            background: var(--text-tertiary); 
            border-radius: 50%; 
            animation: typing 1.4s infinite; 
        }
        
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing { 
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 
            30% { transform: translateY(-8px); opacity: 1; } 
        }
        
        .input-section { 
            padding: 20px; 
            border-top: 1px solid var(--border-color); 
            background: var(--bg-chat); 
        }
        
        .input-container { 
            max-width: 768px; 
            margin: 0 auto; 
            position: relative; 
        }
        
        .input-wrapper { 
            position: relative; 
            background: var(--bg-input); 
            border: 1px solid var(--border-color); 
            border-radius: 12px; 
            transition: all 0.2s; 
        }
        
        .input-wrapper:focus-within { 
            border-color: var(--focus-color); 
            box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.1); 
        }
        
        .input-controls { 
            display: flex; 
            align-items: flex-end; 
            padding: 8px; 
            gap: 8px; 
        }
        
        .attachment-btn { 
            width: 32px; 
            height: 32px; 
            border: none; 
            background: none; 
            border-radius: 6px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            color: var(--text-secondary); 
            transition: all 0.2s; 
            font-size: 16px; 
        }
        
        .attachment-btn:hover { 
            background: var(--hover-color); 
            color: var(--text-primary); 
        }
        
        .message-input { 
            flex: 1; 
            background: none; 
            border: none; 
            padding: 12px 16px; 
            color: var(--text-primary); 
            font-size: 15px; 
            resize: none; 
            outline: none; 
            min-height: 24px; 
            max-height: 200px; 
            line-height: 1.5; 
            font-family: inherit; 
        }
        
        .message-input::placeholder { 
            color: var(--text-tertiary); 
        }
        
        .send-button { 
            width: 32px; 
            height: 32px; 
            border: none; 
            background: var(--accent-color); 
            color: white; 
            border-radius: 6px; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            transition: all 0.2s; 
            font-size: 14px; 
        }
        
        .send-button:hover:not(:disabled) { 
            background: #c2690f; 
        }
        
        .send-button:disabled { 
            background: var(--text-tertiary); 
            cursor: not-allowed; 
        }
        
        .modal { 
            display: none; 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0, 0, 0, 0.5); 
            z-index: 1000; 
        }
        
        .modal-content { 
            background: var(--bg-sidebar); 
            margin: 5% auto; 
            padding: 24px; 
            border-radius: 12px; 
            width: 90%; 
            max-width: 400px; 
            position: relative; 
            box-shadow: var(--shadow); 
        }
        
        .modal-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 20px; 
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
            font-size: 20px; 
            cursor: pointer; 
            padding: 4px; 
            border-radius: 4px; 
            transition: all 0.2s; 
        }
        
        .modal-close:hover { 
            background: var(--hover-color); 
        }
        
        .form-group { 
            margin-bottom: 16px; 
        }
        
        .form-label { 
            display: block; 
            margin-bottom: 6px; 
            font-weight: 500; 
            color: var(--text-primary); 
            font-size: 14px; 
        }
        
        .form-input { 
            width: 100%; 
            background: var(--bg-input); 
            border: 1px solid var(--border-color); 
            border-radius: 8px; 
            padding: 10px 12px; 
            color: var(--text-primary); 
            font-size: 14px; 
            outline: none; 
            transition: all 0.2s; 
        }
        
        .form-input:focus { 
            border-color: var(--focus-color); 
            box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.1); 
        }
        
        .modal-actions { 
            display: flex; 
            gap: 12px; 
            justify-content: flex-end; 
        }
        
        .btn-secondary { 
            background: var(--bg-input); 
            border: 1px solid var(--border-color); 
            color: var(--text-primary); 
            padding: 10px 16px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 500; 
            transition: all 0.2s; 
        }
        
        .btn-secondary:hover { 
            background: var(--hover-color); 
        }
        
        .btn-primary { 
            background: var(--accent-color); 
            border: none; 
            color: white; 
            padding: 10px 16px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 500; 
            transition: all 0.2s; 
        }
        
        .btn-primary:hover { 
            background: #c2690f; 
        }
        
        .file-upload { 
            display: none; 
        }
        
        .upload-zone { 
            border: 2px dashed var(--border-color); 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            transition: all 0.2s; 
            cursor: pointer; 
        }
        
        .upload-zone:hover { 
            border-color: var(--focus-color); 
            background: #fef7ed; 
        }
        
        .upload-zone.dragover { 
            border-color: var(--focus-color); 
            background: #fef7ed; 
        }
        
        .upload-text { 
            color: var(--text-secondary); 
            font-size: 14px; 
        }
        
        .file-list { 
            margin-top: 12px; 
        }
        
        .file-item { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            padding: 8px 12px; 
            background: var(--hover-color); 
            border-radius: 6px; 
            margin-bottom: 4px; 
            font-size: 13px; 
        }
        
        .file-remove { 
            background: none; 
            border: none; 
            color: var(--text-secondary); 
            cursor: pointer; 
            font-size: 16px; 
            padding: 2px; 
        }
        
        .sidebar.collapsed { 
            width: 0; 
            min-width: 0; 
            border-right: none; 
        }
        
        .sidebar.collapsed > * { 
            display: none; 
        }
        
        @media (max-width: 768px) { 
            .sidebar { 
                position: absolute; 
                z-index: 100; 
                height: 100%; 
                transform: translateX(-100%); 
            }
            
            .sidebar.open { 
                transform: translateX(0); 
            }
            
            .main-content { 
                width: 100%; 
            }
        }
    </style>
</head>
<body>
    <div class="app-container">
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="claude-logo">
                    <div class="claude-icon">C</div>
                    Claude
                </div>
                <div class="sidebar-actions">
                    <button class="btn-icon" id="settingsBtn" onclick="openSettings()">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="btn-icon" id="sidebarToggle">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
            
            <div class="user-section">
                <div class="login-section" id="loginSection">
                    <button class="login-button" onclick="googleLogin()">
                        <i class="fab fa-google"></i>
                        Accedi con Google
                    </button>
                </div>

                <div class="user-info" id="userInfo" style="display: none;">
                    <img class="user-avatar" id="userAvatar" src="" alt="User">
                    <div class="user-details">
                        <div class="user-name" id="userName"></div>
                        <div class="user-email" id="userEmail"></div>
                    </div>
                    <button class="logout-btn" onclick="logoutUser()">Esci</button>
                </div>
            </div>
            
            <div class="new-chat-section" id="newChatSection" style="display: none;">
                <button class="new-chat-btn" onclick="newChat()">
                    <i class="fas fa-plus"></i>
                    Nuova conversazione
                </button>
            </div>
            
            <div class="projects-section" id="projectsSection" style="display: none;">
                <div class="section-header">
                    Progetti
                    <button class="add-project-btn" onclick="createProject()">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="project-list" id="projectsList"></div>
            </div>
        </div>

        <div class="main-content">
            <div class="chat-header">
                <div class="chat-title">
                    <span id="chatTitle">Claude</span>
                    <div class="status-dot" id="statusDot"></div>
                </div>
                <select class="model-selector" id="modelSelector">
                    <option value="claude-sonnet-4-20250514">Claude 3.5 Sonnet</option>
                    <option value="claude-opus-4">Claude 3 Opus</option>
                </select>
            </div>
            
            <div class="chat-container" id="chatContainer">
                <div class="message-group">
                    <div class="message">
                        <div class="message-avatar assistant-avatar-msg">C</div>
                        <div class="message-content">
                            <p><strong>Ciao! Sono Claude, il tuo assistente AI.</strong></p>
                            <p>Posso aiutarti con:</p>
                            <ul>
                                <li>Rispondere a domande e fornire spiegazioni</li>
                                <li>Aiutarti con attività di scrittura e editing</li>
                                <li>Analizzare documenti e testi</li>
                                <li>Assistenza con codice e programmazione</li>
                                <li>Brainstorming e risoluzione creativa dei problemi</li>
                            </ul>
                            <p>Accedi con Google per salvare le tue conversazioni e organizzarle in progetti!</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="typing-indicator" id="typingIndicator">
                <div class="typing-message">
                    <div class="message-avatar assistant-avatar-msg">C</div>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
            
            <div class="input-section">
                <div class="input-container">
                    <div class="input-wrapper">
                        <div class="input-controls">
                            <button class="attachment-btn" onclick="triggerFileUpload()">
                                <i class="fas fa-paperclip"></i>
                            </button>
                            <textarea class="message-input" id="messageInput" placeholder="Scrivi un messaggio..." rows="1" disabled></textarea>
                            <button class="send-button" id="sendButton" disabled>
                                <i class="fas fa-arrow-up"></i>
                            </button>
                        </div>
                    </div>
                    <input type="file" class="file-upload" id="fileUpload" multiple accept=".txt,.md,.pdf,.doc,.docx,.csv,.json">
                    <div class="file-list" id="fileList"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modali -->
    <div class="modal" id="settingsModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Impostazioni API</h3>
                <button class="modal-close" onclick="closeSettings()">&times;</button>
            </div>
            <div class="form-group">
                <label class="form-label">Chiave API Anthropic</label>
                <input type="password" class="form-input" id="apiKeyInput" placeholder="sk-ant-...">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="testConnection()">Test connessione</button>
                <button class="btn-primary" onclick="saveSettings()">Salva</button>
            </div>
        </div>
    </div>

    <div class="modal" id="createProjectModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Nuovo progetto</h3>
                <button class="modal-close" onclick="closeCreateProject()">&times;</button>
            </div>
            <div class="form-group">
                <label class="form-label">Nome progetto</label>
                <input type="text" class="form-input" id="projectNameInput" placeholder="es. Assistente di programmazione">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeCreateProject()">Annulla</button>
                <button class="btn-primary" onclick="saveProject()">Crea progetto</button>
            </div>
        </div>
    </div>

    <script>
        let currentUser = null;
        let currentProject = null;
        let currentConversation = null;
        let apiKey = localStorage.getItem('claude-api-key') || '';
        let isConnected = false;
        let uploadedFiles = [];

        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        async function initializeApp() {
            setupEventListeners();
            setupFileUpload();
            
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
            document.getElementById('sendButton').addEventListener('click', sendMessage);
            
            const textarea = document.getElementById('messageInput');
            textarea.addEventListener('input', autoResize);
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Close modals when clicking outside
            window.addEventListener('click', function(e) {
                if (e.target.classList.contains('modal')) {
                    e.target.style.display = 'none';
                }
            });
        }

        function setupFileUpload() {
            const fileUpload = document.getElementById('fileUpload');
            const inputWrapper = document.querySelector('.input-wrapper');

            fileUpload.addEventListener('change', handleFileSelect);

            // Drag and drop
            inputWrapper.addEventListener('dragover', function(e) {
                e.preventDefault();
                inputWrapper.classList.add('dragover');
            });

            inputWrapper.addEventListener('dragleave', function(e) {
                e.preventDefault();
                inputWrapper.classList.remove('dragover');
            });

            inputWrapper.addEventListener('drop', function(e) {
                e.preventDefault();
                inputWrapper.classList.remove('dragover');
                const files = Array.from(e.dataTransfer.files);
                handleFiles(files);
            });
        }

        function triggerFileUpload() {
            document.getElementById('fileUpload').click();
        }

        function handleFileSelect(e) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }

        function handleFiles(files) {
            files.forEach(file => {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    alert('File troppo grande: ' + file.name);
                    return;
                }
                
                uploadedFiles.push(file);
                displayFile(file);
            });
        }

        function displayFile(file) {
            const fileList = document.getElementById('fileList');
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileName = document.createElement('span');
            fileName.textContent = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'file-remove';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = () => removeFile(file, fileItem);
            
            fileItem.appendChild(fileName);
            fileItem.appendChild(removeBtn);
            fileList.appendChild(fileItem);
        }

        function removeFile(file, element) {
            uploadedFiles = uploadedFiles.filter(f => f !== file);
            element.remove();
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
                    alert('Errore nel login: ' + error.message);
                    console.error('Login error:', error);
                }
            } catch (error) {
                alert('Errore nel login');
                console.error('Login error:', error);
            }
        }

        async function logoutUser() {
            try {
                await window.supabase.auth.signOut();
                showLoginInterface();
                currentUser = null;
                currentProject = null;
                currentConversation = null;
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        function showUserInterface(user) {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('userInfo').style.display = 'flex';
            document.getElementById('newChatSection').style.display = 'block';
            document.getElementById('projectsSection').style.display = 'block';
            
            document.getElementById('userName').textContent = user.user_metadata?.full_name || 'Utente';
            document.getElementById('userEmail').textContent = user.email;
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
            document.getElementById('newChatSection').style.display = 'none';
            document.getElementById('projectsSection').style.display = 'none';
            
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = true;
            messageInput.placeholder = 'Accedi per iniziare...';
            
            document.getElementById('sendButton').disabled = true;
        }

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
            
            if (!name || !currentUser) {
                alert('Nome progetto richiesto');
                return;
            }

            try {
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
                    alert('Errore nella creazione del progetto');
                    return;
                }

                closeCreateProject();
                loadUserData();
                selectProject(data.id, data.name);
                
            } catch (error) {
                console.error('Error creating project:', error);
                alert('Errore nella creazione del progetto');
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
                
                const icon = document.createElement('i');
                icon.className = 'fas fa-folder project-icon';
                
                const name = document.createElement('span');
                name.textContent = project.name;
                
                projectDiv.appendChild(icon);
                projectDiv.appendChild(name);
                
                projectDiv.addEventListener('click', function() {
                    selectProject(project.id, project.name);
                });
                
                projectsList.appendChild(projectDiv);
            });
        }

        function selectProject(projectId, projectName) {
            currentProject = projectId;
            
            document.querySelectorAll('.project-item').forEach(el => {
                el.classList.remove('active');
            });
            
            const targetElement = document.querySelector(`[data-id="${projectId}"]`);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            document.getElementById('chatTitle').textContent = projectName;
        }

        async function newChat() {
            if (!currentProject || !currentUser) {
                alert('Seleziona prima un progetto!');
                return;
            }

            try {
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
                    alert('Errore nella creazione della chat');
                    return;
                }

                currentConversation = data.id;
                clearChat();
                addWelcomeMessage();
                
            } catch (error) {
                console.error('Error creating chat:', error);
                alert('Errore nella creazione della chat');
            }
        }

        function clearChat() {
            document.getElementById('chatContainer').innerHTML = '';
        }

        function addWelcomeMessage() {
            const chatContainer = document.getElementById('chatContainer');
            const messageGroup = document.createElement('div');
            messageGroup.className = 'message-group';
            
            const message = document.createElement('div');
            message.className = 'message';
            
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar assistant-avatar-msg';
            avatar.textContent = 'C';
            
            const content = document.createElement('div');
            content.className = 'message-content';
            content.innerHTML = '<p>Nuova conversazione avviata! Come posso aiutarti?</p>';
            
            message.appendChild(avatar);
            message.appendChild(content);
            messageGroup.appendChild(message);
            chatContainer.appendChild(messageGroup);
        }

        async function sendMessage() {
            if (!apiKey || !isConnected) {
                alert('Configura prima la tua API key!');
                openSettings();
                return;
            }

            if (!currentUser || !currentConversation) {
                alert('Accedi e crea una conversazione!');
                return;
            }

            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message && uploadedFiles.length === 0) return;

            try {
                // Process uploaded files
                let fileContents = '';
                if (uploadedFiles.length > 0) {
                    fileContents = await processUploadedFiles();
                }

                const fullMessage = fileContents + (fileContents && message ? '\n\n' : '') + message;
                
                addMessageToChat(message, 'user');
                input.value = '';
                input.style.height = 'auto';
                clearUploadedFiles();
                showTypingIndicator();

                const response = await callClaudeAPI(fullMessage);
                hideTypingIndicator();
                
                if (response) {
                    addMessageToChat(response, 'assistant');
                    await saveMessages(fullMessage, response);
                }
                
            } catch (error) {
                hideTypingIndicator();
                addMessageToChat('Errore nella comunicazione con Claude.', 'assistant');
                console.error('Send message error:', error);
            }
        }

        async function processUploadedFiles() {
            let contents = '';
            
            for (const file of uploadedFiles) {
                try {
                    const text = await readFileAsText(file);
                    contents += `[File: ${file.name}]\n${text}\n\n`;
                } catch (error) {
                    console.error('Error reading file:', error);
                    contents += `[File: ${file.name}] - Errore nella lettura del file\n\n`;
                }
            }
            
            return contents;
        }

        function readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }

        function clearUploadedFiles() {
            uploadedFiles = [];
            document.getElementById('fileList').innerHTML = '';
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
            
            let messageGroup = chatContainer.lastElementChild;
            if (!messageGroup || !messageGroup.classList.contains('message-group')) {
                messageGroup = document.createElement('div');
                messageGroup.className = 'message-group';
                chatContainer.appendChild(messageGroup);
            }
            
            const message = document.createElement('div');
            message.className = 'message';
            
            const isUser = role === 'user';
            const avatarClass = isUser ? 'user-avatar-msg' : 'assistant-avatar-msg';
            const avatarText = isUser ? 'U' : 'C';
            
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar ' + avatarClass;
            avatar.textContent = avatarText;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.innerHTML = formatMessage(content);
            
            message.appendChild(avatar);
            message.appendChild(messageContent);
            messageGroup.appendChild(message);
            
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function formatMessage(content) {
            // Basic markdown-like formatting
            return content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
        }

        function openSettings() {
            document.getElementById('settingsModal').style.display = 'block';
            document.getElementById('apiKeyInput').focus();
        }

        function closeSettings() {
            document.getElementById('settingsModal').style.display = 'none';
        }

        async function testConnection() {
            const testKey = document.getElementById('apiKeyInput').value || apiKey;
            if (!testKey) {
                updateConnectionStatus(false);
                alert('Inserisci prima una API key');
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
                    alert('Connessione riuscita!');
                    if (currentUser) {
                        document.getElementById('sendButton').disabled = false;
                    }
                } else {
                    alert('Connessione fallita: ' + (result.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                updateConnectionStatus(false);
                alert('Errore di rete');
                console.error('Test connection error:', error);
            }
        }

        function updateConnectionStatus(connected) {
            isConnected = connected;
            const statusDot = document.getElementById('statusDot');
            if (connected) {
                statusDot.style.background = '#10b981';
            } else {
                statusDot.style.background = '#ef4444';
            }
        }

        function saveSettings() {
            const newApiKey = document.getElementById('apiKeyInput').value.trim();
            if (newApiKey) {
                apiKey = newApiKey;
                localStorage.setItem('claude-api-key', apiKey);
                testConnection();
                closeSettings();
            } else {
                alert('Inserisci una API key valida');
            }
        }

        function autoResize() {
            const textarea = document.getElementById('messageInput');
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }

        function showTypingIndicator() {
            document.getElementById('typingIndicator').style.display = 'block';
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'HTTP error');
            }
            
            const data = await response.json();
            return data.content;
        }
    </script>
</body>
</html>`);
});

// Chat API endpoint - same as before
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
        version: '7.0.0-claude-ui-complete'
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
    console.log('🚀  CLAUDE AI INTERFACE - CLAUDE.AI UI   🚀');
    console.log('🚀 ==========================================');
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API Chat: http://localhost:${PORT}/api/chat`);
    console.log(`🧪 API Test: http://localhost:${PORT}/api/test`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('🔥 ✅ Claude.ai UI + Supabase + Google OAuth');
    console.log('🔥 ✅ Upload documenti + Gestione progetti');
    console.log('🚀 ==========================================');
});