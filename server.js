const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione multer per file upload
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://*.railway.app', 'https://*.vercel.app'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Frontend completo con Firebase e tutte le funzionalità
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude AI Interface Pro</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- Firebase SDK -->
    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
        import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
        import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
        import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

        // Firebase config
        const firebaseConfig = {
            apiKey: "AIzaSyCfPL-PvUpQ5pN1lmz3VoELeyzKZfSu5qQ",
            authDomain: "claude-ai-interface.firebaseapp.com",
            projectId: "claude-ai-interface",
            storageBucket: "claude-ai-interface.firebasestorage.app",
            messagingSenderId: "896187447055",
            appId: "1:896187447055:web:23cc1e986d77d38cac07a"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);
        const provider = new GoogleAuthProvider();

        // Make Firebase available globally
        window.firebase = { auth, db, storage, provider, signInWithPopup, signOut, onAuthStateChanged, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, ref, uploadBytes, getDownloadURL };
    </script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            color: #e5e5e5;
            height: 100vh;
            overflow: hidden;
        }

        .app-container {
            display: flex;
            height: 100vh;
        }

        .sidebar {
            width: 260px;
            background: #171717;
            border-right: 1px solid #333;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
        }

        .sidebar.collapsed {
            width: 60px;
        }

        .sidebar-header {
            padding: 16px;
            border-bottom: 1px solid #333;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border-bottom: 1px solid #333;
            font-size: 14px;
        }

        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #2563eb;
        }

        .login-section {
            padding: 16px;
            text-align: center;
            border-bottom: 1px solid #333;
        }

        .google-login-btn {
            background: #4285f4;
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
        }

        .google-login-btn:hover {
            background: #3367d6;
        }

        .logout-btn {
            background: #dc2626;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
        }

        .sidebar-toggle, .settings-btn {
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
            font-size: 18px;
            padding: 8px;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .sidebar-toggle:hover, .settings-btn:hover {
            background: #333;
            color: #fff;
        }

        .new-chat-btn, .new-project-btn {
            background: #2563eb;
            border: none;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin: 8px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }

        .new-project-btn {
            background: #16a34a;
        }

        .new-chat-btn:hover {
            background: #1d4ed8;
        }

        .new-project-btn:hover {
            background: #15803d;
        }

        .sidebar.collapsed .new-chat-btn span,
        .sidebar.collapsed .new-project-btn span {
            display: none;
        }

        .projects-section {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }

        .projects-header {
            padding: 8px 16px;
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .project-item {
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 4px;
            transition: all 0.2s;
            font-size: 14px;
            position: relative;
        }

        .project-item:hover {
            background: #333;
        }

        .project-item.active {
            background: #16a34a;
        }

        .project-title {
            font-weight: 500;
            margin-bottom: 4px;
        }

        .project-chat-count {
            font-size: 12px;
            color: #888;
        }

        .conversation-item {
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 2px;
            transition: all 0.2s;
            font-size: 13px;
            margin-left: 16px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .conversation-item:hover {
            background: #2a2a2a;
        }

        .conversation-item.active {
            background: #2563eb;
        }

        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #1a1a1a;
        }

        .chat-header {
            padding: 16px 24px;
            border-bottom: 1px solid #333;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .header-info {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .model-selector {
            background: #333;
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
        }

        .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }

        .message {
            margin-bottom: 24px;
            display: flex;
            gap: 16px;
            max-width: 1000px;
            margin-left: auto;
            margin-right: auto;
        }

        .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            flex-shrink: 0;
        }

        .user-avatar-msg {
            background: #2563eb;
            color: white;
        }

        .assistant-avatar {
            background: #16a34a;
            color: white;
        }

        .message-content {
            flex: 1;
            line-height: 1.6;
        }

        .message-content pre {
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 16px;
            overflow-x: auto;
            margin: 12px 0;
        }

        .message-content code {
            background: #2a2a2a;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
        }

        .artifact-container {
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 8px;
            margin: 12px 0;
            overflow: hidden;
        }

        .artifact-header {
            background: #333;
            padding: 12px 16px;
            border-bottom: 1px solid #444;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .artifact-content {
            padding: 16px;
        }

        .artifact-iframe {
            width: 100%;
            height: 400px;
            border: none;
            background: white;
            border-radius: 4px;
        }

        .download-btn {
            background: #2563eb;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }

        .input-container {
            padding: 20px;
            border-top: 1px solid #333;
            background: #1a1a1a;
        }

        .input-wrapper {
            max-width: 1000px;
            margin: 0 auto;
            position: relative;
        }

        .file-upload-area {
            margin-bottom: 12px;
            display: none;
        }

        .file-upload-area.show {
            display: block;
        }

        .uploaded-files {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 12px;
        }

        .uploaded-file {
            background: #333;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .file-remove {
            cursor: pointer;
            color: #999;
        }

        .message-input {
            width: 100%;
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 24px;
            padding: 16px 110px 16px 20px;
            color: white;
            font-size: 16px;
            resize: none;
            min-height: 56px;
            max-height: 200px;
            outline: none;
            transition: all 0.2s;
        }

        .message-input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .input-actions {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .file-upload-btn {
            background: #333;
            border: none;
            color: #888;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .file-upload-btn:hover {
            background: #444;
            color: white;
        }

        .send-button {
            background: #2563eb;
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .send-button:hover {
            background: #1d4ed8;
        }

        .send-button:disabled {
            background: #444;
            cursor: not-allowed;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
        }

        .modal-content {
            background: #2a2a2a;
            margin: 5% auto;
            padding: 30px;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            position: relative;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .modal-close {
            background: none;
            border: none;
            color: #888;
            font-size: 24px;
            cursor: pointer;
            padding: 8px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #e5e5e5;
        }

        .form-input {
            width: 100%;
            background: #1a1a1a;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 12px 16px;
            color: white;
            font-size: 14px;
            outline: none;
        }

        .form-input:focus {
            border-color: #2563eb;
        }

        .save-button, .test-button, .create-button {
            background: #2563eb;
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-right: 10px;
        }

        .test-button {
            background: #16a34a;
        }

        .create-button {
            background: #f59e0b;
        }

        .typing-indicator {
            display: none;
            align-items: center;
            gap: 8px;
            margin-bottom: 24px;
            max-width: 1000px;
            margin-left: auto;
            margin-right: auto;
        }

        .typing-dots {
            display: flex;
            gap: 4px;
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            background: #888;
            border-radius: 50%;
            animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-10px); opacity: 1; }
        }

        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-left: 8px;
        }

        .status-connected {
            background: #16a34a;
        }

        .status-disconnected {
            background: #dc2626;
        }

        .file-input {
            display: none;
        }

        @media (max-width: 768px) {
            .sidebar {
                position: fixed;
                left: -260px;
                z-index: 100;
                height: 100vh;
            }
            
            .sidebar.open {
                left: 0;
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
                <button class="sidebar-toggle" id="sidebarToggle">
                    <i class="fas fa-bars"></i>
                </button>
                <button class="settings-btn" onclick="openSettings()">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
            
            <!-- User Login Section -->
            <div class="login-section" id="loginSection">
                <button class="google-login-btn" onclick="googleLogin()">
                    <i class="fab fa-google"></i>
                    <span>Accedi con Google</span>
                </button>
            </div>

            <!-- User Info (hidden by default) -->
            <div class="user-info" id="userInfo" style="display: none;">
                <img class="user-avatar" id="userAvatar" src="" alt="User">
                <div>
                    <div id="userName" style="font-weight: 500;"></div>
                    <button class="logout-btn" onclick="logoutUser()">Esci</button>
                </div>
            </div>
            
            <button class="new-project-btn" onclick="createProject()" style="display: none;" id="newProjectBtn">
                <i class="fas fa-folder-plus"></i>
                <span>Nuovo Progetto</span>
            </button>
            
            <button class="new-chat-btn" onclick="newChat()" style="display: none;" id="newChatBtn">
                <i class="fas fa-plus"></i>
                <span>Nuova Chat</span>
            </button>
            
            <div class="projects-section" id="projectsSection" style="display: none;">
                <div class="projects-header">Progetti</div>
                <div id="projectsList"></div>
            </div>
        </div>

        <div class="main-content">
            <div class="chat-header">
                <div class="header-info">
                    <h2 id="headerTitle">Claude AI <span class="status-indicator status-disconnected" id="statusIndicator"></span></h2>
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
                        <p>🚀 Benvenuto in Claude AI Interface Pro!</p>
                        <p><strong>Funzionalità disponibili:</strong></p>
                        <ul>
                            <li>🔄 <strong>Sync universale</strong>: Chat sincronizzate su tutti i dispositivi</li>
                            <li>📁 <strong>Progetti</strong>: Organizza le conversazioni in cartelle</li>
                            <li>📤 <strong>Upload file</strong>: Carica PDF, immagini e documenti</li>
                            <li>🛠️ <strong>Artifacts</strong>: Esegui e scarica codice HTML/CSS/JS</li>
                            <li>🧠 <strong>Memory</strong>: Claude ricorda tutto il contesto</li>
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
                    <div class="file-upload-area" id="fileUploadArea">
                        <div class="uploaded-files" id="uploadedFiles"></div>
                    </div>
                    
                    <textarea 
                        class="message-input" 
                        id="messageInput" 
                        placeholder="Accedi con Google per iniziare... 🔐"
                        rows="1"
                        disabled
                    ></textarea>
                    
                    <div class="input-actions">
                        <button class="file-upload-btn" id="fileUploadBtn" onclick="document.getElementById('fileInput').click()" disabled>
                            <i class="fas fa-paperclip"></i>
                        </button>
                        <button class="send-button" id="sendButton" disabled>
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    
                    <input type="file" id="fileInput" class="file-input" multiple accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.js,.py,.html,.css,.json,.csv,.xlsx,.docx">
                </div>
            </div>
        </div>
    </div>

    <!-- Settings Modal -->
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

    <!-- Create Project Modal -->
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
        // Variabili globali
        let currentUser = null;
        let currentProject = null;
        let currentConversation = null;
        let apiKey = localStorage.getItem('claude-api-key') || '';
        let isConnected = false;
        let uploadedFiles = [];

        // Inizializzazione
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        function initializeApp() {
            // Event listeners
            setupEventListeners();
            
            // Carica API key salvata
            if (apiKey) {
                document.getElementById('apiKeyInput').value = apiKey;
                testConnection();
            }

            // Firebase Auth State Listener
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
            document.getElementById('fileInput').addEventListener('change', handleFileUpload);
            
            // Textarea auto-resize e invio
            const textarea = document.getElementById('messageInput');
            textarea.addEventListener('input', autoResize);
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Click fuori modal per chiudere
            window.addEventListener('click', function(e) {
                if (e.target === document.getElementById('settingsModal')) {
                    closeSettings();
                }
                if (e.target === document.getElementById('createProjectModal')) {
                    closeCreateProject();
                }
            });
        }

        // Authentication Functions
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
            
            // Enable input
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = false;
            messageInput.placeholder = 'Scrivi un messaggio... (es: "Crea un bot MetaTrader per EURUSD")';
            
            document.getElementById('fileUploadBtn').disabled = false;
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
            
            // Disable input
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = true;
            messageInput.placeholder = 'Accedi con Google per iniziare... 🔐';
            
            document.getElementById('fileUploadBtn').disabled = true;
            document.getElementById('sendButton').disabled = true;
        }

        // Project Management
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
                // Load projects
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
                
                projectDiv.innerHTML = `
                    <div class="project-title">${project.name}</div>
                    <div class="project-chat-count">${project.conversationCount || 0} conversazioni</div>
                `;
                
                projectDiv.addEventListener('click', () => selectProject(project.id, project.name));
                projectsList.appendChild(projectDiv);
            });
        }

        function selectProject(projectId, projectName) {
            currentProject = projectId;
            
            // Update UI
            document.querySelectorAll('.project-item').forEach(el => el.classList.remove('active'));
            document.querySelector(`[data-id="${projectId}"]`).classList.add('active');
            
            document.getElementById('currentProject').textContent = `📁 ${projectName}`;
            
            // Load project conversations
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
            const projectsList = document.getElementById('projectsList');
            
            // Remove existing conversations
            document.querySelectorAll('.conversation-item').forEach(el => el.remove());
            
            // Add conversations to current project
            conversations.forEach(conv => {
                const convDiv = document.createElement('div');
                convDiv.className = 'conversation-item';
                convDiv.dataset.id = conv.id;
                convDiv.innerHTML = `<span>${conv.title}</span>`;
                convDiv.addEventListener('click', () => selectConversation(conv.id));
                
                // Insert after current project
                const currentProjectEl = document.querySelector('.project-item.active');
                if (currentProjectEl) {
                    currentProjectEl.insertAdjacentElement('afterend', convDiv);
                }
            });
        }

        async function selectConversation(conversationId) {
            currentConversation = conversationId;
            
            // Update UI
            document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
            document.querySelector(`[data-id="${conversationId}"]`).classList.add('active');
            
            // Load conversation messages
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

                // Clear chat and render messages
                document.getElementById('chatContainer').innerHTML = '';
                messages.forEach(msg => {
                    addMessageToChat(msg.content, msg.role, msg.artifacts, msg.files);
                });
                
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        }

        // Chat Functions
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
                
                // Clear chat
                document.getElementById('chatContainer').innerHTML = '';
                addWelcomeMessage();
                
                // Reload conversations
                loadProjectConversations(currentProject);
                
            } catch (error) {
                console.error('Error creating conversation:', error);
                alert('❌ Errore nella creazione della chat');
            }
        }

        function addWelcomeMessage() {
            addMessageToChat(
                '🚀 Nuova conversazione avviata! Come posso aiutarti oggi?\n\n💡 **Suggerimenti:**\n- Carica file con 📎\n- Chiedi di creare artifacts HTML/CSS/JS\n- Organizza tutto nei tuoi progetti',
                'assistant'
            );
        }

        // File Upload Functions
        function handleFileUpload(event) {
            const files = Array.from(event.target.files);
            
            files.forEach(file => {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    alert(`❌ Il file ${file.name} è troppo grande (max 10MB)`);
                    return;
                }
                
                uploadedFiles.push(file);
                displayUploadedFile(file);
            });
            
            // Show upload area
            document.getElementById('fileUploadArea').classList.add('show');
        }

        function displayUploadedFile(file) {
            const uploadedFilesDiv = document.getElementById('uploadedFiles');
            
            const fileDiv = document.createElement('div');
            fileDiv.className = 'uploaded-file';
            fileDiv.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <span class="file-remove" onclick="removeUploadedFile(this, '${file.name}')">&times;</span>
            `;
            
            uploadedFilesDiv.appendChild(fileDiv);
        }

        function removeUploadedFile(element, fileName) {
            uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
            element.parentElement.remove();
            
            if (uploadedFiles.length === 0) {
                document.getElementById('fileUploadArea').classList.remove('show');
            }
        }

        async function uploadFilesToFirebase(files) {
            const uploadedUrls = [];
            
            for (const file of files) {
                try {
                    const storageRef = window.firebase.ref(
                        window.firebase.storage, 
                        `uploads/${currentUser.uid}/${Date.now()}_${file.name}`
                    );
                    
                    const snapshot = await window.firebase.uploadBytes(storageRef, file);
                    const downloadURL = await window.firebase.getDownloadURL(snapshot.ref);
                    
                    uploadedUrls.push({
                        name: file.name,
                        url: downloadURL,
                        type: file.type,
                        size: file.size
                    });
                    
                } catch (error) {
                    console.error('Error uploading file:', error);
                    alert(`❌ Errore caricamento ${file.name}`);
                }
            }
            
            return uploadedUrls;
        }

        // Message Functions
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
            if (!message && uploadedFiles.length === 0) return;

            try {
                // Upload files first if any
                let fileData = [];
                if (uploadedFiles.length > 0) {
                    fileData = await uploadFilesToFirebase(uploadedFiles);
                    uploadedFiles = [];
                    document.getElementById('fileUploadArea').classList.remove('show');
                    document.getElementById('uploadedFiles').innerHTML = '';
                }

                // Add user message to chat
                const fullMessage = message + (fileData.length > 0 ? `\n\n📁 File caricati: ${fileData.map(f => f.name).join(', ')}` : '');
                addMessageToChat(fullMessage, 'user', null, fileData);

                // Save user message to Firebase
                await saveMessageToFirebase(message, 'user', fileData);

                input.value = '';
                input.style.height = 'auto';
                showTypingIndicator();

                // Call Claude API
                const response = await callClaudeAPI(message, fileData);
                hideTypingIndicator();
                
                if (response) {
                    // Check for artifacts in response
                    const artifacts = extractArtifacts(response);
                    addMessageToChat(response, 'assistant', artifacts);
                    
                    // Save assistant message
                    await saveMessageToFirebase(response, 'assistant', null, artifacts);
                }
                
            } catch (error) {
                hideTypingIndicator();
                addMessageToChat('❌ Errore nella comunicazione con Claude. Verifica le impostazioni.', 'assistant');
                console.error('Error:', error);
            }
        }

        async function saveMessageToFirebase(content, role, files = null, artifacts = null) {
            try {
                const messageData = {
                    conversationId: currentConversation,
                    userId: currentUser.uid,
                    content: content,
                    role: role,
                    timestamp: new Date(),
                    files: files || [],
                    artifacts: artifacts || []
                };

                await window.firebase.addDoc(
                    window.firebase.collection(window.firebase.db, 'messages'), 
                    messageData
                );

                // Update conversation title from first message
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
                
                // Reload conversations to update UI
                if (currentProject) {
                    loadProjectConversations(currentProject);
                }
                
            } catch (error) {
                console.error('Error updating conversation title:', error);
            }
        }

        function extractArtifacts(response) {
            // Extract HTML/CSS/JS artifacts from Claude response
            const artifacts = [];
            const codeBlockRegex = /```(html|css|javascript|js)\n([\s\S]*?)```/gi;
            let match;
            
            while ((match = codeBlockRegex.exec(response)) !== null) {
                const language = match[1].toLowerCase();
                const code = match[2].trim();
                
                if (language === 'html' || (language === 'javascript' || language === 'js')) {
                    artifacts.push({
                        id: uuidv4(),
                        type: language,
                        code: code,
                        title: `${language.toUpperCase()} Artifact`
                    });
                }
            }
            
            return artifacts;
        }

        function addMessageToChat(content, role, artifacts = null, files = null) {
            const chatContainer = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            
            const isUser = role === 'user';
            const avatarClass = isUser ? 'user-avatar-msg' : 'assistant-avatar';
            const avatarText = isUser ? 'U' : 'C';
            
            let messageHTML = `
                <div class="message-avatar ${avatarClass}">${avatarText}</div>
                <div class="message-content">${formatMessage(content)}`;
            
            // Add files if present
            if (files && files.length > 0) {
                messageHTML += '<div style="margin-top: 12px;">';
                files.forEach(file => {
                    messageHTML += `<div style="background: #333; padding: 8px 12px; border-radius: 6px; margin-bottom: 4px; display: inline-block; margin-right: 8px;">
                        <i class="fas fa-file"></i> <a href="${file.url}" target="_blank" style="color: #2563eb; text-decoration: none;">${file.name}</a>
                    </div>`;
                });
                messageHTML += '</div>';
            }
            
            // Add artifacts if present
            if (artifacts && artifacts.length > 0) {
                artifacts.forEach(artifact => {
                    messageHTML += `
                        <div class="artifact-container">
                            <div class="artifact-header">
                                <span>${artifact.title}</span>
                                <button class="download-btn" onclick="downloadArtifact('${artifact.id}', '${artifact.type}')">
                                    <i class="fas fa-download"></i> Download
                                </button>
                            </div>
                            <div class="artifact-content">
                                ${artifact.type === 'html' ? 
                                    `<iframe class="artifact-iframe" srcdoc="${artifact.code.replace(/"/g, '&quot;')}"></iframe>` :
                                    `<pre><code>${artifact.code}</code></pre>`
                                }
                            </div>
                        </div>
                    `;
                });
            }
            
            messageHTML += '</div>';
            messageDiv.innerHTML = messageHTML;
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function downloadArtifact(artifactId, type) {
            // Find the artifact code in the current conversation
            const artifactContainer = event.target.closest('.artifact-container');
            const codeElement = artifactContainer.querySelector('code') || artifactContainer.querySelector('iframe');
            
            let content = '';
            let filename = '';
            
            if (type === 'html') {
                content = codeElement.getAttribute('srcdoc');
                filename = `artifact_${artifactId}.html`;
            } else {
                content = codeElement.textContent;
                filename = `artifact_${artifactId}.${type}`;
            }
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        function formatMessage(content) {
            // Simple markdown-like formatting
            return content
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code>$1</code>');
        }

        // UI Helper Functions
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

        async function callClaudeAPI(message, files = []) {
            const model = document.getElementById('modelSelector').value;
            
            // Prepare message with file context
            let fullMessage = message;
            if (files.length > 0) {
                fullMessage += '\n\nFile caricati:\n';
                files.forEach(file => {
                    fullMessage += `- ${file.name} (${file.type})\n`;
                });
            }
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: [{ role: 'user', content: fullMessage }], 
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

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file caricato' });
        }

        // Here you would typically save to Firebase Storage
        // For now, we'll just return file info
        res.json({
            success: true,
            file: {
                name: req.file.originalname,
                size: req.file.size,
                type: req.file.mimetype,
                // In a real implementation, you'd save to Firebase and return the URL
                url: `/uploads/${req.file.originalname}`
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Errore caricamento file' });
    }
});

// API endpoint per chat (aggiornato)
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

// Test connessione API
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: '✅ OK', 
        timestamp: new Date().toISOString(),
        version: '2.0.0-firebase'
    });
});

// Error handlers
app.use((req, res) => {
    res.status(404).json({ error: '❌ Endpoint non trovato' });
});

app.use((error, req, res, next) => {
    console.error('❌ Errore non gestito:', error);
    res.status(500).json({ error: 'Errore interno del server' });
});

app.listen(PORT, () => {
    console.log('🔥 ========================================');
    console.log('🔥  CLAUDE AI INTERFACE PRO - FIREBASE   🔥');  
    console.log('🔥 ========================================');
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/chat`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('🔥 ✅ Google Auth, Projects, Upload attivi');
    console.log('🔥 ========================================');
});