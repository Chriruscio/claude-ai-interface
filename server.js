<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <script type="module">
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
        
        const supabaseUrl = 'https://rxfnuxhwuigmtdysfhnb.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4Zm51eGh3dWlnbXRkeXNmaG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTUyNjAsImV4cCI6MjA2ODc3MTI2MH0.zRmoouFtGUGvnScS_WSGgMWZon80SG7pxTIRDLQcBMY';
        
        window.supabase = createClient(supabaseUrl, supabaseKey);

        // OAuth handling
        if (window.location.hash.includes('access_token')) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            
            if (accessToken && refreshToken) {
                window.supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                }).then(({ data, error }) => {
                    if (data?.session?.user) {
                        window.history.replaceState({}, document.title, window.location.pathname);
                        window.location.reload();
                    }
                });
            }
        }

        window.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                console.log('✅ User signed in');
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
            --artifact-bg: #1E1F22;
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
            position: relative;
        }

        /* ========== SIDEBAR ========== */
        .sidebar { 
            width: 280px; 
            background: var(--bg-secondary); 
            border-right: 1px solid var(--border-color); 
            display: flex; 
            flex-direction: column; 
            transition: all 0.3s ease; 
            position: relative;
            z-index: 100;
        }

        .sidebar.collapsed { 
            width: 60px; 
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

        .claude-logo i {
            font-size: 20px;
        }

        .sidebar.collapsed .claude-logo {
            display: none;
        }

        /* Auth Section */
        .auth-section { 
            padding: 16px 20px; 
            border-bottom: 1px solid var(--border-color); 
        }

        .login-btn { 
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

        .login-btn:hover { 
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

        .user-details {
            flex: 1;
            overflow: hidden;
        }

        .user-name { 
            font-weight: 500; 
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .user-email { 
            font-size: 12px; 
            color: var(--text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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

        .sidebar.collapsed .auth-section {
            padding: 16px 10px;
        }

        .sidebar.collapsed .user-details,
        .sidebar.collapsed .logout-btn {
            display: none;
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

        .sidebar.collapsed .new-chat-btn {
            margin: 16px 10px 8px;
            padding: 12px;
            justify-content: center;
        }

        .sidebar.collapsed .new-chat-btn span {
            display: none;
        }

        /* Projects Section */
        .projects-section { 
            flex: 1; 
            overflow-y: auto; 
            padding: 0 20px 20px; 
        }

        .sidebar.collapsed .projects-section {
            padding: 0 10px 20px;
        }

        .section-header { 
            padding: 16px 0 8px; 
            font-size: 12px; 
            color: var(--text-muted); 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .sidebar.collapsed .section-header span {
            display: none;
        }

        .add-project-btn {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            font-size: 14px;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .add-project-btn:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
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
            position: relative;
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

        .project-meta { 
            font-size: 12px; 
            color: var(--text-muted); 
            margin-top: 2px;
        }

        .project-item.active .project-meta {
            color: rgba(255, 255, 255, 0.8);
        }

        .sidebar.collapsed .project-details {
            display: none;
        }

        .sidebar.collapsed .project-item {
            justify-content: center;
            padding: 10px;
        }

        /* ========== MAIN CONTENT ========== */
        .main-content { 
            flex: 1; 
            display: flex; 
            flex-direction: column; 
            background: var(--bg-primary); 
            position: relative;
        }

        .chat-header { 
            padding: 16px 24px; 
            border-bottom: 1px solid var(--border-color); 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            min-height: 64px;
            background: var(--bg-primary);
            position: relative;
            z-index: 50;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .chat-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .project-breadcrumb {
            font-size: 14px;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
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

        /* ========== CHAT AREA ========== */
        .chat-container { 
            flex: 1; 
            display: flex;
            overflow: hidden;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto; 
            padding: 0;
            position: relative;
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

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin-top: 32px;
        }

        .feature-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            text-align: left;
            transition: all 0.2s;
        }

        .feature-card:hover {
            background: var(--bg-tertiary);
            border-color: var(--accent-orange);
        }

        .feature-icon {
            font-size: 24px;
            color: var(--accent-orange);
            margin-bottom: 12px;
        }

        .feature-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .feature-desc {
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.4;
        }

        .message { 
            margin-bottom: 32px; 
            display: flex; 
            gap: 16px;
            position: relative;
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

        .message-content p {
            margin-bottom: 12px;
        }

        .message-content p:last-child {
            margin-bottom: 0;
        }

        .message-content ul, .message-content ol {
            margin: 12px 0;
            padding-left: 24px;
        }

        .message-content li {
            margin-bottom: 6px;
        }

        .message-content code {
            background: var(--bg-secondary);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 13px;
        }

        .message-content pre {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            overflow-x: auto;
            margin: 12px 0;
        }

        .message-content pre code {
            background: none;
            padding: 0;
        }

        /* Artifacts Panel */
        .artifacts-panel {
            width: 0;
            background: var(--artifact-bg);
            border-left: 1px solid var(--border-color);
            transition: all 0.3s ease;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .artifacts-panel.active {
            width: 50%;
            min-width: 400px;
        }

        .artifacts-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--artifact-bg);
        }

        .artifacts-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .artifacts-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .artifacts-close:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }

        .artifacts-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .artifact-item {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
        }

        .artifact-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .artifact-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .artifact-type {
            font-size: 12px;
            color: var(--text-muted);
            background: var(--bg-tertiary);
            padding: 2px 8px;
            border-radius: 4px;
        }

        .artifact-preview {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 12px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 13px;
            max-height: 200px;
            overflow-y: auto;
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

        .input-attachments {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }

        .attachment-item {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--text-primary);
        }

        .attachment-name {
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .attachment-remove {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 2px;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .attachment-remove:hover {
            color: var(--text-primary);
            background: var(--bg-tertiary);
        }

        .message-input { 
            width: 100%; 
            background: var(--bg-secondary); 
            border: 1px solid var(--border-color); 
            border-radius: 12px; 
            padding: 16px 120px 16px 20px; 
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

        .input-actions {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .attach-btn, .send-button { 
            background: none;
            border: none; 
            color: var(--text-secondary); 
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

        .attach-btn:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }

        .send-button { 
            background: var(--accent-orange); 
            color: white; 
        }

        .send-button:hover { 
            background: var(--accent-orange-hover); 
        }

        .send-button:disabled { 
            background: var(--bg-tertiary); 
            color: var(--text-muted);
            cursor: not-allowed; 
        }

        .file-input {
            display: none;
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

        .form-input, .form-textarea { 
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

        .form-input:focus, .form-textarea:focus { 
            border-color: var(--accent-orange);
            box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.1);
        }

        .form-textarea {
            resize: vertical;
            min-height: 80px;
            font-family: inherit;
        }

        .form-buttons {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
        }

        .btn-primary, .btn-secondary, .btn-success { 
            border: none; 
            padding: 10px 20px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: var(--accent-orange); 
            color: white; 
        }

        .btn-primary:hover {
            background: var(--accent-orange-hover);
        }

        .btn-secondary {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background: var(--bg-primary);
        }

        .btn-success {
            background: var(--accent-green);
            color: white;
        }

        .btn-success:hover {
            background: #28C840;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1024px) {
            .sidebar {
                width: 260px;
            }
            
            .artifacts-panel.active {
                width: 45%;
            }
        }

        @media (max-width: 768px) {
            .sidebar {
                position: fixed;
                left: -280px;
                width: 280px;
                height: 100vh;
                z-index: 200;
                transition: left 0.3s ease;
            }
            
            .sidebar.mobile-open {
                left: 0;
            }
            
            .main-content {
                margin-left: 0;
            }
            
            .artifacts-panel.active {
                width: 100%;
                position: fixed;
                top: 0;
                left: 0;
                height: 100vh;
                z-index: 150;
            }
            
            .messages-inner {
                padding: 16px;
            }
            
            .input-container {
                padding: 16px;
            }
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

        /* ========== UTILITY CLASSES ========== */
        .hidden { display: none !important; }
        .loading { opacity: 0.6; pointer-events: none; }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- ========== SIDEBAR ========== -->
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <button class="sidebar-toggle" id="sidebarToggle">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="claude-logo">
                    <i class="fas fa-brain"></i>
                    <span>Claude</span>
                </div>
            </div>
            
            <!-- Auth Section -->
            <div class="auth-section" id="authSection">
                <div id="loginView">
                    <button class="login-btn" onclick="googleLogin()">
                        <i class="fab fa-google"></i>
                        <span>Accedi con Google</span>
                    </button>
                </div>
                
                <div id="userView" class="hidden">
                    <div class="user-info">
                        <img class="user-avatar" id="userAvatar" src="" alt="User">
                        <div class="user-details">
                            <div class="user-name" id="userName"></div>
                            <div class="user-email" id="userEmail"></div>
                        </div>
                        <button class="logout-btn" onclick="logoutUser()">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- New Chat Button -->
            <button class="new-chat-btn" id="newChatBtn" onclick="newChat()" disabled>
                <i class="fas fa-plus"></i>
                <span>New chat</span>
            </button>
            
            <!-- Projects Section -->
            <div class="projects-section">
                <div class="section-header">
                    <span>Projects</span>
                    <button class="add-project-btn" onclick="showCreateProject()" id="addProjectBtn" disabled>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div id="projectsList">
                    <!-- Projects will be loaded here -->
                </div>
                
                <div class="section-header" style="margin-top: 20px;">
                    <span>Recents</span>
                </div>
                <div id="recentChats">
                    <!-- Recent chats will be loaded here -->
                </div>
            </div>
        </div>

        <!-- ========== MAIN CONTENT ========== -->
        <div class="main-content">
            <!-- Header -->
            <div class="chat-header">
                <div class="header-left">
                    <div>
                        <div class="chat-title" id="chatTitle">Claude</div>
                        <div class="project-breadcrumb" id="projectBreadcrumb"></div>
                    </div>
                </div>
                <div class="header-right">
                    <select class="model-selector" id="modelSelector">
                        <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                        <option value="claude-opus-4">Claude Opus 4</option>
                    </select>
                    <button class="settings-btn" onclick="showSettings()">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
            
            <!-- Chat Container -->
            <div class="chat-container">
                <!-- Messages Area -->
                <div class="chat-messages" id="chatMessages">
                    <div class="messages-inner" id="messagesInner">
                        <!-- Welcome Message -->
                        <div class="welcome-message" id="welcomeMessage">
                            <div class="welcome-title">Come posso aiutarti oggi?</div>
                            <div class="welcome-subtitle">
                                Sono Claude, un assistente AI creato da Anthropic. Posso aiutarti con scrittura, analisi, matematica, programmazione, scrittura creativa e molto altro.
                            </div>
                            
                            <div class="features-grid">
                                <div class="feature-card">
                                    <div class="feature-icon"><i class="fas fa-code"></i></div>
                                    <div class="feature-title">Programmazione</div>
                                    <div class="feature-desc">Scrivo, debug e spiego codice in qualsiasi linguaggio</div>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
                                    <div class="feature-title">Analisi</div>
                                    <div class="feature-desc">Analizzo dati, documenti e fornisco insights</div>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon"><i class="fas fa-pen-fancy"></i></div>
                                    <div class="feature-title">Scrittura</div>
                                    <div class="feature-desc">Aiuto con editing, copywriting e contenuti creativi</div>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon"><i class="fas fa-lightbulb"></i></div>
                                    <div class="feature-title">Problem Solving</div>
                                    <div class="feature-desc">Risolvo problemi complessi con ragionamento step-by-step</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Typing Indicator -->
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
                </div>
                
                <!-- Artifacts Panel -->
                <div class="artifacts-panel" id="artifactsPanel">
                    <div class="artifacts-header">
                        <div class="artifacts-title">Artifacts</div>
                        <button class="artifacts-close" onclick="closeArtifacts()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="artifacts-content" id="artifactsContent">
                        <!-- Artifacts will be displayed here -->
                    </div>
                </div>
            </div>
            
            <!-- Input Container -->
            <div class="input-container">
                <div class="input-wrapper">
                    <!-- File Attachments -->
                    <div class="input-attachments" id="inputAttachments"></div>
                    
                    <!-- Message Input -->
                    <textarea 
                        class="message-input" 
                        id="messageInput" 
                        placeholder="Scrivi un messaggio..." 
                        rows="1" 
                        disabled
                    ></textarea>
                    
                    <!-- Input Actions -->
                    <div class="input-actions">
                        <button class="attach-btn" onclick="triggerFileUpload()" id="attachBtn" disabled>
                            <i class="fas fa-paperclip"></i>
                        </button>
                        <button class="send-button" id="sendButton" onclick="sendMessage()" disabled>
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    
                    <!-- Hidden File Input -->
                    <input type="file" class="file-input" id="fileInput" multiple accept="image/*,.pdf,.txt,.doc,.docx,.json,.csv" onchange="handleFileSelect(event)">
                </div>
            </div>
        </div>
    </div>

    <!-- ========== MODALS ========== -->
    
    <!-- Settings Modal -->
    <div class="modal" id="settingsModal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">Impostazioni API</div>
                <button class="modal-close" onclick="closeSettings()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">API Key Anthropic</label>
                    <input type="password" class="form-input" id="apiKeyInput" placeholder="sk-ant-...">
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">
                        La tua API key è salvata localmente e mai condivisa
                    </div>
                </div>
                <div class="form-buttons">
                    <button class="btn-success" onclick="testConnection()">
                        <i class="fas fa-check"></i>
                        Test Connessione
                    </button>
                    <button class="btn-primary" onclick="saveSettings()">
                        <i class="fas fa-save"></i>
                        Salva
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Create Project Modal -->
    <div class="modal" id="createProjectModal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">Crea Nuovo Progetto</div>
                <button class="modal-close" onclick="closeCreateProject()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Nome Progetto</label>
                    <input type="text" class="form-input" id="projectNameInput" placeholder="es. Analisi di Mercato">
                </div>
                <div class="form-group">
                    <label class="form-label">Descrizione (opzionale)</label>
                    <textarea class="form-textarea" id="projectDescInput" placeholder="Breve descrizione del progetto..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Istruzioni Personalizzate (opzionale)</label>
                    <textarea class="form-textarea" id="projectInstructionsInput" placeholder="es. Rispondi sempre in tono professionale e fornisci esempi pratici..."></textarea>
                </div>
                <div class="form-buttons">
                    <button class="btn-secondary" onclick="closeCreateProject()">Annulla</button>
                    <button class="btn-primary" onclick="saveProject()">
                        <i class="fas fa-plus"></i>
                        Crea Progetto
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // ========== GLOBAL VARIABLES ==========
        let currentUser = null;
        let currentProject = null;
        let currentConversation = null;
        let apiKey = localStorage.getItem('claude-api-key') || '';
        let isConnected = false;
        let attachedFiles = [];

        // ========== INITIALIZATION ==========
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        async function initializeApp() {
            setupEventListeners();
            loadApiKey();
            
            // Check for existing session
            const { data, error } = await window.supabase.auth.getSession();
            if (data?.session) {
                currentUser = data.session.user;
                showUserInterface(data.session.user);
                await loadUserData();
            }
        }

        function setupEventListeners() {
            // Sidebar toggle
            document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
            
            // Message input
            const textarea = document.getElementById('messageInput');
            textarea.addEventListener('input', autoResize);
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Mobile responsive
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.add('mobile');
            }

            window.addEventListener('resize', function() {
                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.add('mobile');
                } else {
                    document.getElementById('sidebar').classList.remove('mobile', 'mobile-open');
                }
            });
        }

        // ========== AUTHENTICATION ==========
        async function googleLogin() {
            try {
                const { error } = await window.supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin
                    }
                });
                
                if (error) {
                    alert('❌ Errore nel login: ' + error.message);
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
                clearChat();
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        function showUserInterface(user) {
            document.getElementById('loginView').classList.add('hidden');
            document.getElementById('userView').classList.remove('hidden');
            
            document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email.split('@')[0];
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userAvatar').src = user.user_metadata?.picture || user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=FF6B35&color=fff`;
            
            // Enable controls
            document.getElementById('newChatBtn').disabled = false;
            document.getElementById('addProjectBtn').disabled = false;
            document.getElementById('attachBtn').disabled = false;
            
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = false;
            messageInput.placeholder = 'Scrivi un messaggio...';
            
            if (apiKey && isConnected) {
                document.getElementById('sendButton').disabled = false;
            }
        }

        function showLoginInterface() {
            document.getElementById('loginView').classList.remove('hidden');
            document.getElementById('userView').classList.add('hidden');
            
            // Disable controls
            document.getElementById('newChatBtn').disabled = true;
            document.getElementById('addProjectBtn').disabled = true;
            document.getElementById('attachBtn').disabled = true;
            document.getElementById('sendButton').disabled = true;
            
            const messageInput = document.getElementById('messageInput');
            messageInput.disabled = true;
            messageInput.placeholder = 'Accedi per iniziare a chattare...';
            
            // Clear UI
            document.getElementById('projectsList').innerHTML = '';
            document.getElementById('recentChats').innerHTML = '';
            document.getElementById('projectBreadcrumb').textContent = '';
        }

        // ========== API SETTINGS ==========
        function loadApiKey() {
            if (apiKey) {
                document.getElementById('apiKeyInput').value = apiKey;
                testConnection();
            }
        }

        function showSettings() {
            document.getElementById('settingsModal').style.display = 'block';
        }

        function closeSettings() {
            document.getElementById('settingsModal').style.display = 'none';
        }

        async function testConnection() {
            const testKey = document.getElementById('apiKeyInput').value || apiKey;
            if (!testKey) {
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
                
                if (result.success) {
                    isConnected = true;
                    alert('✅ Connessione riuscita!');
                    if (currentUser) {
                        document.getElementById('sendButton').disabled = false;
                    }
                } else {
                    isConnected = false;
                    alert('❌ Connessione fallita: API key non valida');
                }
            } catch (error) {
                isConnected = false;
                alert('❌ Errore di connessione');
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
                alert('❌ Inserisci una API key valida');
            }
        }

        // ========== PROJECT MANAGEMENT ==========
        function showCreateProject() {
            document.getElementById('createProjectModal').style.display = 'block';
        }

        function closeCreateProject() {
            document.getElementById('createProjectModal').style.display = 'none';
            document.getElementById('projectNameInput').value = '';
            document.getElementById('projectDescInput').value = '';
            document.getElementById('projectInstructionsInput').value = '';
        }

        async function saveProject() {
            const name = document.getElementById('projectNameInput').value.trim();
            const description = document.getElementById('projectDescInput').value.trim();
            const instructions = document.getElementById('projectInstructionsInput').value.trim();
            
            if (!name || !currentUser) {
                alert('❌ Nome progetto richiesto');
                return;
            }

            try {
                const { data, error } = await window.supabase
                    .from('projects')
                    .insert([{
                        name: name,
                        description: description || null,
                        instructions: instructions || null,
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

                closeCreateProject();
                await loadUserData();
                selectProject(data.id, data.name);
                
            } catch (error) {
                console.error('Error creating project:', error);
                alert('❌ Errore nella creazione del progetto');
            }
        }

        async function loadUserData() {
            if (!currentUser) return;

            try {
                // Load projects
                const { data: projects, error: projectsError } = await window.supabase
                    .from('projects')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('updated_at', { ascending: false });

                if (projectsError) {
                    console.error('Error loading projects:', projectsError);
                    return;
                }

                renderProjects(projects || []);
                
                // Load recent conversations
                const { data: conversations, error: conversationsError } = await window.supabase
                    .from('conversations')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('updated_at', { ascending: false })
                    .limit(5);

                if (!conversationsError) {
                    renderRecentChats(conversations || []);
                }
                
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
                    <div class="project-icon"><i class="fas fa-folder"></i></div>
                    <div class="project-details">
                        <div class="project-title">${escapeHtml(project.name)}</div>
                        <div class="project-meta">0 conversazioni</div>
                    </div>
                `;
                
                projectDiv.addEventListener('click', () => selectProject(project.id, project.name));
                projectsList.appendChild(projectDiv);
            });
        }

        function renderRecentChats(conversations) {
            const recentChats = document.getElementById('recentChats');
            recentChats.innerHTML = '';

            conversations.forEach(conv => {
                const chatDiv = document.createElement('div');
                chatDiv.className = 'project-item';
                chatDiv.dataset.id = conv.id;
                
                chatDiv.innerHTML = `
                    <div class="project-icon"><i class="fas fa-comment"></i></div>
                    <div class="project-details">
                        <div class="project-title">${escapeHtml(conv.title)}</div>
                        <div class="project-meta">${formatDate(conv.updated_at)}</div>
                    </div>
                `;
                
                chatDiv.addEventListener('click', () => loadConversation(conv.id));
                recentChats.appendChild(chatDiv);
            });
        }

        function selectProject(projectId, projectName) {
            currentProject = projectId;
            
            // Update UI
            document.querySelectorAll('.project-item').forEach(el => el.classList.remove('active'));
            const targetElement = document.querySelector(`[data-id="${projectId}"]`);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            document.getElementById('projectBreadcrumb').innerHTML = `<i class="fas fa-folder"></i> ${escapeHtml(projectName)}`;
            document.getElementById('chatTitle').textContent = projectName;
        }

        // ========== CHAT MANAGEMENT ==========
        async function newChat() {
            if (!currentProject || !currentUser) {
                alert('⚠️ Seleziona prima un progetto!');
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
                    alert('❌ Errore nella creazione della chat');
                    return;
                }

                currentConversation = data.id;
                clearChat();
                showWelcomeMessage();
                
            } catch (error) {
                console.error('Error creating chat:', error);
                alert('❌ Errore nella creazione della chat');
            }
        }

        async function loadConversation(conversationId) {
            if (!currentUser) return;

            try {
                // Load conversation details
                const { data: conversation, error: convError } = await window.supabase
                    .from('conversations')
                    .select('*, projects(name)')
                    .eq('id', conversationId)
                    .eq('user_id', currentUser.id)
                    .single();

                if (convError) {
                    console.error('Error loading conversation:', convError);
                    return;
                }

                currentConversation = conversationId;
                currentProject = conversation.project_id;
                
                // Update UI
                document.getElementById('chatTitle').textContent = conversation.title;
                if (conversation.projects) {
                    document.getElementById('projectBreadcrumb').innerHTML = `<i class="fas fa-folder"></i> ${escapeHtml(conversation.projects.name)}`;
                    selectProject(conversation.project_id, conversation.projects.name);
                }

                // Load messages
                const { data: messages, error: messagesError } = await window.supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', conversationId)
                    .order('created_at', { ascending: true });

                if (messagesError) {
                    console.error('Error loading messages:', messagesError);
                    return;
                }

                clearChat();
                messages.forEach(message => {
                    addMessageToChat(message.content, message.role, false);
                });
                
            } catch (error) {
                console.error('Error loading conversation:', error);
            }
        }

        function clearChat() {
            const messagesInner = document.getElementById('messagesInner');
            messagesInner.innerHTML = '';
            hideWelcomeMessage();
        }

        function showWelcomeMessage() {
            const welcomeMessage = document.getElementById('welcomeMessage');
            if (welcomeMessage) {
                welcomeMessage.classList.remove('hidden');
            }
        }

        function hideWelcomeMessage() {
            const welcomeMessage = document.getElementById('welcomeMessage');
            if (welcomeMessage) {
                welcomeMessage.classList.add('hidden');
            }
        }

        // ========== FILE HANDLING ==========
        function triggerFileUpload() {
            document.getElementById('fileInput').click();
        }

        function handleFileSelect(event) {
            const files = Array.from(event.target.files);
            files.forEach(file => {
                if (attachedFiles.length < 5) { // Limit to 5 files
                    attachedFiles.push(file);
                    addFileAttachment(file);
                } else {
                    alert('⚠️ Massimo 5 file per messaggio');
                }
            });
            event.target.value = ''; // Reset input
        }

        function addFileAttachment(file) {
            const attachmentsContainer = document.getElementById('inputAttachments');
            
            const attachmentDiv = document.createElement('div');
            attachmentDiv.className = 'attachment-item';
            attachmentDiv.dataset.filename = file.name;
            
            const icon = getFileIcon(file.type);
            attachmentDiv.innerHTML = `
                <i class="${icon}"></i>
                <span class="attachment-name">${escapeHtml(file.name)}</span>
                <button class="attachment-remove" onclick="removeAttachment('${file.name}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            attachmentsContainer.appendChild(attachmentDiv);
        }

        function removeAttachment(filename) {
            attachedFiles = attachedFiles.filter(f => f.name !== filename);
            const attachmentDiv = document.querySelector(`[data-filename="${filename}"]`);
            if (attachmentDiv) {
                attachmentDiv.remove();
            }
        }

        function getFileIcon(mimeType) {
            if (mimeType.startsWith('image/')) return 'fas fa-image';
            if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
            if (mimeType.includes('text')) return 'fas fa-file-alt';
            if (mimeType.includes('json')) return 'fas fa-code';
            if (mimeType.includes('csv')) return 'fas fa-table';
            if (mimeType.includes('word')) return 'fas fa-file-word';
            return 'fas fa-file';
        }

        // ========== MESSAGING ==========
        async function sendMessage() {
            if (!apiKey || !isConnected) {
                alert('⚠️ Configura prima la tua API key!');
                showSettings();
                return;
            }

            if (!currentUser || !currentConversation) {
                alert('⚠️ Accedi e crea una conversazione!');
                return;
            }

            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message && attachedFiles.length === 0) return;

            try {
                // Prepare message content
                let messageContent = message;
                if (attachedFiles.length > 0) {
                    messageContent += '\n\n[File allegati: ' + attachedFiles.map(f => f.name).join(', ') + ']';
                }

                // Add user message to chat
                addMessageToChat(messageContent, 'user');
                
                // Clear input
                input.value = '';
                input.style.height = 'auto';
                clearAttachments();
                hideWelcomeMessage();
                showTypingIndicator();

                // Call Claude API
                const response = await callClaudeAPI(message, attachedFiles);
                hideTypingIndicator();
                
                if (response) {
                    addMessageToChat(response, 'assistant');
                    await saveMessages(messageContent, response);
                }
                
            } catch (error) {
                hideTypingIndicator();
                addMessageToChat('❌ Errore nella comunicazione con Claude. Riprova.', 'assistant');
                console.error('Send message error:', error);
            }
        }

        function clearAttachments() {
            attachedFiles = [];
            document.getElementById('inputAttachments').innerHTML = '';
        }

        async function callClaudeAPI(message, files = []) {
            const model = document.getElementById('modelSelector').value;
            
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        messages: [{ role: 'user', content: message }], 
                        model, 
                        apiKey,
                        files: files.map(f => ({ name: f.name, type: f.type, size: f.size }))
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                return data.content;
                
            } catch (error) {
                console.error('API call error:', error);
                throw error;
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

                // Update conversation timestamp
                await window.supabase
                    .from('conversations')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', currentConversation);
                    
            } catch (error) {
                console.error('Error saving messages:', error);
            }
        }

        function addMessageToChat(content, role, saveToDb = true) {
            const messagesInner = document.getElementById('messagesInner');
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            
            const isUser = role === 'user';
            const avatarClass = isUser ? 'user-avatar-msg' : 'assistant-avatar';
            const avatarText = isUser ? (currentUser?.user_metadata?.full_name?.[0] || 'U') : 'C';
            
            messageDiv.innerHTML = `
                <div class="message-avatar ${avatarClass}">${avatarText}</div>
                <div class="message-content">${formatMessage(content)}</div>
            `;
            
            messagesInner.appendChild(messageDiv);
            scrollToBottom();
        }

        function formatMessage(content) {
            // Basic markdown-like formatting
            let formatted = escapeHtml(content);
            
            // Bold text
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Italic text
            formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Code blocks
            formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            
            // Inline code
            formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // Line breaks
            formatted = formatted.replace(/\n/g, '<br>');
            
            return formatted;
        }

        // ========== UI HELPERS ==========
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('mobile-open');
            } else {
                sidebar.classList.toggle('collapsed');
            }
        }

        function autoResize() {
            const textarea = document.getElementById('messageInput');
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }

        function showTypingIndicator() {
            document.getElementById('typingIndicator').style.display = 'block';
            scrollToBottom();
        }

        function hideTypingIndicator() {
            document.getElementById('typingIndicator').style.display = 'none';
        }

        function scrollToBottom() {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Oggi';
            if (diffDays === 2) return 'Ieri';
            if (diffDays <= 7) return `${diffDays} giorni fa`;
            
            return date.toLocaleDateString('it-IT', { 
                day: 'numeric', 
                month: 'short' 
            });
        }

        // ========== ARTIFACTS SYSTEM ==========
        let artifacts = [];

        function createArtifact(type, name, content) {
            const artifact = {
                id: Date.now().toString(),
                type,
                name,
                content,
                created_at: new Date().toISOString()
            };
            
            artifacts.push(artifact);
            renderArtifact(artifact);
            showArtifactsPanel();
        }

        function renderArtifact(artifact) {
            const artifactsContent = document.getElementById('artifactsContent');
            
            const artifactDiv = document.createElement('div');
            artifactDiv.className = 'artifact-item';
            artifactDiv.dataset.id = artifact.id;
            
            artifactDiv.innerHTML = `
                <div class="artifact-header">
                    <div class="artifact-name">${escapeHtml(artifact.name)}</div>
                    <div class="artifact-type">${artifact.type}</div>
                </div>
                <div class="artifact-preview">
                    ${artifact.type === 'code' ? 
                        `<pre><code>${escapeHtml(artifact.content)}</code></pre>` :
                        `<div>${formatMessage(artifact.content)}</div>`
                    }
                </div>
            `;
            
            artifactsContent.appendChild(artifactDiv);
        }

        function showArtifactsPanel() {
            document.getElementById('artifactsPanel').classList.add('active');
        }

        function closeArtifacts() {
            document.getElementById('artifactsPanel').classList.remove('active');
        }

        // ========== KEYBOARD SHORTCUTS ==========
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter to send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
            
            // Ctrl/Cmd + K to focus search/input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('messageInput').focus();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                closeSettings();
                closeCreateProject();
                closeArtifacts();
            }
        });

        // ========== ERROR HANDLING ==========
        window.addEventListener('error', function(e) {
            console.error('Global error:', e.error);
        });

        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
        });

        // ========== STARTUP ==========
        console.log('🚀 Claude Interface Inizializzata');
        console.log('🎨 UI Replica di claude.ai completa');
        console.log('✅ Tutte le funzionalità attive');
    </script>
</body>
</html>