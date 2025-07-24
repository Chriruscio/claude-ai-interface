const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('/app/public'));

// Debug middleware (opzionale - per vedere le richieste)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// API ENDPOINTS - DEVONO ESSERE PRIMA DEI FILE STATICI!

// API test endpoint
app.post('/api/test', async (req, res) => {
    const { apiKey } = req.body;
    
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
        return res.json({ success: false, error: 'API key non valida' });
    }
    
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hi' }]
            })
        });

        if (response.ok) {
            res.json({ success: true });
        } else {
            const error = await response.json();
            res.json({ success: false, error: error.error?.message || 'API Error' });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// API chat endpoint  
app.post('/api/chat', async (req, res) => {
    const { messages, model, apiKey } = req.body;
    
    if (!apiKey) {
        return res.status(400).json({ error: 'API key mancante' });
    }
    
    const modelMap = {
        'claude-sonnet-4-20250514': 'claude-3-sonnet-20240229',
        'claude-opus-4': 'claude-3-opus-20240229'
    };
    
    const claudeModel = modelMap[model] || 'claude-3-sonnet-20240229';
    
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: claudeModel,
                max_tokens: 4000,
                messages: messages
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({ 
                error: error.error?.message || 'API Error' 
            });
        }

        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ROUTES PER FILE STATICI - DEVONO ESSERE ALLA FINE!

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.resolve('/app/public', 'index.html'));
});

// Fallback per tutti gli altri percorsi (DEVE ESSERE L'ULTIMO!)
app.get('*', (req, res) => {
    res.sendFile(path.resolve('/app/public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Serving static files from: /app/public`);
    console.log(`🔗 API endpoints: /api/test, /api/chat`);
});
