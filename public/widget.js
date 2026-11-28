/**
 * ChatBot AI Widget - Production Ready
 * XSS Protected, Session Management, Rate Limit
 */
(function() {
  'use strict';
  if (window.ChatBotWidget) return;

  const ChatBotWidget = {
    config: {
      chatbotId: null,
      primaryColor: '#667eea',
      apiEndpoint: 'https://chatbot-saas-tau-sandy.vercel.app',
      maxMessagesPerSession: 50,
    },
    state: { isOpen: false, sessionId: null, messageCount: 0, isLoading: false },
    elements: {},

    init: function(options) {
      if (!options?.chatbotId) {
        console.error('[ChatBot] chatbotId required');
        return;
      }
      Object.assign(this.config, options);
      this.state.sessionId = this.getSessionId();
      this.createWidget();
      this.attachEventListeners();
    },

    getSessionId: function() {
      const key = `chatbot_session_${this.config.chatbotId}`;
      let id = localStorage.getItem(key);
      if (!id) {
        id = 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(key, id);
      }
      return id;
    },

    createWidget: function() {
      const btn = document.createElement('button');
      btn.id = 'cb-btn';
      btn.textContent = '💬';
      btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:30px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;font-size:28px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:999999;';
      this.elements.button = btn;

      const win = document.createElement('div');
      win.id = 'cb-win';
      win.style.cssText = 'position:fixed;bottom:90px;right:20px;width:380px;height:600px;background:white;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.3);z-index:999999;display:none;flex-direction:column;overflow:hidden;';
      win.innerHTML = `<div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:20px;display:flex;justify-content:space-between;align-items:center;"><div><h3 style="margin:0;font-size:18px;">💬 ChatBot AI</h3><p style="margin:5px 0 0;font-size:12px;opacity:0.9;">Ask me anything!</p></div><button id="cb-close" style="background:none;border:none;color:white;font-size:24px;cursor:pointer;">×</button></div><div id="cb-msgs" style="flex:1;overflow-y:auto;padding:20px;background:#f8f9fa;"></div><div style="padding:20px;background:white;border-top:1px solid #eee;"><div style="display:flex;gap:10px;"><input id="cb-input" type="text" placeholder="Type..." maxlength="500" style="flex:1;padding:12px;border:1px solid #ddd;border-radius:25px;outline:none;" /><button id="cb-send" style="background:#667eea;color:white;border:none;padding:12px 24px;border-radius:25px;cursor:pointer;font-weight:bold;">Send</button></div></div>`;
      this.elements.window = win;

      document.body.append(btn, win);
      this.elements.msgs = win.querySelector('#cb-msgs');
      this.elements.input = win.querySelector('#cb-input');
      this.addBotMessage('Hello! How can I help you? 👋');
    },

    attachEventListeners: function() {
      this.elements.button.onclick = () => {
        this.elements.window.style.display = this.state.isOpen ? 'none' : 'flex';
        this.state.isOpen = !this.state.isOpen;
        if (this.state.isOpen) this.elements.input.focus();
      };
      this.elements.window.querySelector('#cb-close').onclick = () => {
        this.elements.window.style.display = 'none';
        this.state.isOpen = false;
      };
      this.elements.window.querySelector('#cb-send').onclick = () => this.sendMessage();
      this.elements.input.onkeypress = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage();
        }
      };
    },

    sendMessage: function() {
      if (this.state.isLoading) return;
      const msg = this.elements.input.value.trim();
      if (!msg) return;
      if (this.state.messageCount >= this.config.maxMessagesPerSession) {
        this.addBotMessage('Maximum messages reached. Refresh to continue.');
        return;
      }
      this.addUserMessage(msg);
      this.elements.input.value = '';
      this.state.messageCount++;
      this.callAPI(msg);
    },

    addUserMessage: function(msg) {
      const div = document.createElement('div');
      div.style.cssText = 'background:#667eea;color:white;padding:15px;border-radius:15px;margin-bottom:10px;text-align:right;word-wrap:break-word;';
      const strong = document.createElement('strong');
      strong.textContent = 'You: ';
      const span = document.createElement('span');
      span.textContent = msg; // XSS safe
      div.append(strong, span);
      this.elements.msgs.appendChild(div);
      this.elements.msgs.scrollTop = this.elements.msgs.scrollHeight;
    },

    addBotMessage: function(msg) {
      const div = document.createElement('div');
      div.style.cssText = 'background:white;padding:15px;border-radius:15px;margin-bottom:10px;word-wrap:break-word;';
      const strong = document.createElement('strong');
      strong.textContent = 'Bot: ';
      const span = document.createElement('span');
      span.textContent = msg; // XSS safe
      div.append(strong, span);
      this.elements.msgs.appendChild(div);
      this.elements.msgs.scrollTop = this.elements.msgs.scrollHeight;
    },

    callAPI: async function(msg) {
      this.state.isLoading = true;
      const loading = document.createElement('div');
      loading.id = 'cb-loading';
      loading.style.cssText = 'background:white;padding:15px;border-radius:15px;margin-bottom:10px;';
      loading.innerHTML = '<strong>Bot: </strong><span>Thinking...</span>';
      this.elements.msgs.appendChild(loading);
      this.elements.msgs.scrollTop = this.elements.msgs.scrollHeight;

      try {
        const res = await fetch(`${this.config.apiEndpoint}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatbotId: this.config.chatbotId,
            message: msg,
            sessionId: this.state.sessionId
          })
        });
        const data = await res.json();
        loading.remove();
        if (res.ok && data.answer) {
          this.addBotMessage(data.answer);
        } else {
          this.addBotMessage('Sorry, an error occurred. Please try again.');
        }
      } catch (err) {
        console.error('[ChatBot] API Error:', err);
        loading.remove();
        this.addBotMessage('Connection error. Please try again.');
      } finally {
        this.state.isLoading = false;
      }
    }
  };

  window.ChatBotWidget = ChatBotWidget;
})();
