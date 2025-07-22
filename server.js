const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://*.railway.app', 'https://*.vercel.app'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Frontend integrato con tutte le funzioni JavaScript corrette
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude AI Interface</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
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

        .new-chat-btn {
            background: #2563eb;
            border: none;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }

        .new-chat-btn:hover {
            background: #1d4ed8;
        }

        .sidebar.collapsed .new-chat-btn span {
            display: none;
        }

        .conversations {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }

        .conversation-item {
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 4px;
            transition: all 0.2s;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .conversation-item:hover {
            background: #333;
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

        .user-avatar {
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

        .message-input {
            width: 100%;
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 24px;
            padding: 16px 60px 16px 20px;
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

        .send-button {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
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

        .save-button, .test-button {
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
                <button class="settings-btn" onclick="document.getElementById('settingsModal').style.display='block'">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
            
            <button class="new-chat-btn" id="newChatBtn">
                <i class="fas fa-plus"></i>
                <span>Nuova chat</span>
            </button>
            
            <div class="conversations" id="conversations">
                <div class="conversation-item active">
                    <span>Nuova conversazione</span>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="chat-header">
                <h2>Claude AI <span class="status-indicator status-disconnected" id="statusIndicator"></span></h2>
                <select class="model-selector" id="modelSelector">
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                    <option value="claude-opus-4">Claude Opus 4</option>
                </select>
            </div>
            
            <div class="chat-container" id="chatContainer">
                <div class="message">
                    <div class="message-avatar assistant-avatar">C</div>
                    <div class="message-content">
                        <p>Ciao! Sono Claude, il tuo assistente AI personalizzato. Come posso aiutarti oggi?</p>
                        <p><em>💡 Perfetto per sviluppare bot MetaTrader e siti web!</em></p>
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
                    <textarea 
                        class="message-input" 
                        id="messageInput" 
                        placeholder="Scrivi un messaggio... (es: 'Crea un bot MetaTrader per EURUSD')"
                        rows="1"
                    ></textarea>
                    <button class="send-button" id="sendButton">
                        <i class="fas fa-paper-plane"></i>
                    </button>
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
            <button class="test-button" id="testBtn">🧪 Test Connessione</button>
            <button class="save-button" id="saveBtn">💾 Salva</button>
        </div>
    </div>

    <script>
        // Variabili globali
        let conversations = [{ id: 1, title: "Nuova conversazione", messages: [] }];
        let currentConversationId = 1;
        let apiKey = localStorage.getItem('claude-api-key') || '';
        let isConnected = false;

        // Inizializzazione
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        function initializeApp() {
            // Carica API key salvata
            if (apiKey) {
                document.getElementById('apiKeyInput').value = apiKey;
                testConnection();
            } else {
                openSettings();
            }
            
            // Event listeners
            document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
            document.getElementById('settingsBtn').addEventListener('click', openSettings);
            document.getElementById('modalClose').addEventListener('click', closeSettings);
            document.getElementById('newChatBtn').addEventListener('click', newChat);
            document.getElementById('testBtn').addEventListener('click', testConnection);
            document.getElementById('saveBtn').addEventListener('click', saveSettings);
            document.getElementById('sendButton').addEventListener('click', sendMessage);
            
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
            });
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

        function newChat() {
            const newId = Math.max(...conversations.map(c => c.id)) + 1;
            conversations.push({ id: newId, title: "Nuova conversazione", messages: [] });
            currentConversationId = newId;
            updateConversationsList();
            clearChat();
        }

        function selectConversation(id) {
            currentConversationId = id;
            document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
            document.querySelector(\`[data-id="\${id}"]\`).classList.add('active');
            loadConversation();
        }

        function updateConversationsList() {
            const container = document.getElementById('conversations');
            container.innerHTML = '';
            conversations.forEach(conv => {
                const div = document.createElement('div');
                div.className = \`conversation-item \${conv.id === currentConversationId ? 'active' : ''}\`;
                div.dataset.id = conv.id;
                div.innerHTML = \`<span>\${conv.title}</span>\`;
                div.addEventListener('click', () => selectConversation(conv.id));
                container.appendChild(div);
            });
        }

        function loadConversation() {
            const conversation = conversations.find(c => c.id === currentConversationId);
            const chatContainer = document.getElementById('chatContainer');
            chatContainer.innerHTML = '';
            
            if (conversation.messages.length === 0) {
                chatContainer.innerHTML = \`
                    <div class="message">
                        <div class="message-avatar assistant-avatar">C</div>
                        <div class="message-content">
                            <p>Ciao! Sono Claude, il tuo assistente AI personalizzato. Come posso aiutarti oggi?</p>
                            <p><em>💡 Perfetto per sviluppare bot MetaTrader e siti web!</em></p>
                        </div>
                    </div>
                \`;
            } else {
                conversation.messages.forEach(msg => {
                    addMessageToChat(msg.content, msg.role);
                });
            }
        }

        function clearChat() {
            loadConversation();
        }

        async function sendMessage() {
            if (!apiKey || !isConnected) {
                alert('⚠️ Configura prima la tua API key!');
                openSettings();
                return;
            }

            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message) return;

            addMessageToChat(message, 'user');
            const conversation = conversations.find(c => c.id === currentConversationId);
            conversation.messages.push({ role: 'user', content: message });

            if (conversation.messages.length === 1) {
                conversation.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
                updateConversationsList();
            }

            input.value = '';
            input.style.height = 'auto';
            showTypingIndicator();

            try {
                const response = await callClaudeAPI(conversation.messages);
                hideTypingIndicator();
                if (response) {
                    addMessageToChat(response, 'assistant');
                    conversation.messages.push({ role: 'assistant', content: response });
                }
            } catch (error) {
                hideTypingIndicator();
                addMessageToChat('❌ Errore nella comunicazione con Claude. Verifica le impostazioni.', 'assistant');
                console.error('Error:', error);
            }
        }

        function addMessageToChat(content, role) {
            const chatContainer = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            
            const isUser = role === 'user';
            const avatarClass = isUser ? 'user-avatar' : 'assistant-avatar';
            const avatarText = isUser ? 'U' : 'C';
            
            messageDiv.innerHTML = \`
                <div class="message-avatar \${avatarClass}">\${avatarText}</div>
                <div class="message-content">\${formatMessage(content)}</div>
            \`;
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function formatMessage(content) {
            return content.replace(/\n/g, '<br>');
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
                body: JSON.stringify({ messages, model, apiKey })
            });
            
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }
            
            const data = await response.json();
            return data.content;
        }
    </script>
</body>
</html>`);
});

// API endpoint per chat
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
        version: '1.0.0'
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
    console.log('🚀 ========================================');
    console.log('🚀  Claude AI Interface Server AVVIATO  🚀');
    console.log('🚀 ========================================');
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/chat`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('🚀 ========================================');
});