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
    console.log('🧪 TEST API HIT!', req.body);
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
                model: 'claude-3-5-sonnet-20241022',
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
    console.log('🎯 CHAT API HIT!', {
        method: req.method,
        path: req.path,
        hasBody: !!req.body,
        bodyKeys: Object.keys(req.body || {})
    });
    
    const { messages, model, apiKey } = req.body;
    
    console.log('📝 Parsed data:', { 
        hasMessages: !!messages, 
        model, 
        hasApiKey: !!apiKey 
    });
    
    if (!apiKey) {
        console.log('❌ No API key');
        return res.status(400).json({ error: 'API key mancante' });
    }
    
    const modelMap = {
        'claude-sonnet-4-20250514': 'claude-sonnet-4-20250514',
        'claude-opus-4': 'claude-opus-4-20250514'
    };
    
    const claudeModel = modelMap[model] || 'claude-3-5-sonnet-20241022';
    console.log('🤖 Using model:', claudeModel);
    
    try {
        console.log('🚀 Starting API call...');
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

        console.log('📡 API response status:', response.status);

        if (!response.ok) {
            console.log('❌ API error response');
            const error = await response.json();
            return res.status(response.status).json({ 
                error: error.error?.message || 'API Error' 
            });
        }

        console.log('✅ API success, parsing data...');
        const data = await response.json();
        console.log('📤 Sending response to client');
        res.json(data);
        
    } catch (error) {
        console.error('💥 Exception in API call:', error);
        res.status(500).json({ error: error.message });
    }
});

// ROUTES PER FILE STATICI - DEVONO ESSERE ALLA FINE!

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.resolve('/app/public', 'index.html'));
});

// Fallback SOLO per le richieste GET che non matchano (DEVE ESSERE L'ULTIMO!)
app.get('*', (req, res) => {
    // Non intercettare le API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.resolve('/app/public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Serving static files from: /app/public`);
    console.log(`🔗 API endpoints: /api/test, /api/chat`);
});
