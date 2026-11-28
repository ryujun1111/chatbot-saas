/**
 * ChatBot AI Widget
 * Embed:  <script src="https://YOUR-APP/widget.js" data-chatbot-id="CHATBOT_ID" defer></script>
 * All text is rendered with textContent (XSS safe). Works cross-origin via the CORS-enabled /api/chat.
 */
(function () {
  "use strict";
  if (window.ChatBotWidget) return;

  var script = document.currentScript;
  // API lives on the same origin the script was loaded from
  var apiBase = script && script.src ? new URL(script.src).origin : "";

  var ChatBotWidget = {
    config: {
      chatbotId: null,
      color: "#667eea",
      name: "ChatBot AI",
      greeting: "Hello! How can I help you? 👋",
    },
    state: { isOpen: false, sessionId: null, isLoading: false, history: [] },
    el: {},

    init: function (options) {
      if (!options || !options.chatbotId) {
        console.error("[ChatBot] data-chatbot-id is required");
        return;
      }
      if (this.el.button) return; // already initialised
      this.config.chatbotId = options.chatbotId;
      if (options.color) this.config.color = options.color;
      this.state.sessionId = this.getSessionId();

      var self = this;
      // Load the chatbot's name, color and welcome message; render with defaults if this fails
      fetch(
        apiBase +
          "/api/chat?chatbotId=" +
          encodeURIComponent(options.chatbotId),
      )
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (cfg) {
          if (cfg) {
            self.config.name = cfg.name || self.config.name;
            if (/^#[0-9a-f]{6}$/i.test(cfg.color || ""))
              self.config.color = cfg.color;
            self.config.greeting = cfg.initialMessage || self.config.greeting;
          } else {
            console.error(
              "[ChatBot] Chatbot not found or inactive:",
              options.chatbotId,
            );
            return;
          }
          self.render();
        })
        .catch(function (e) {
          console.error("[ChatBot] Failed to load config", e);
        });
    },

    getSessionId: function () {
      var key = "chatbot_session_" + this.config.chatbotId;
      var id = null;
      try {
        id = localStorage.getItem(key);
      } catch (e) {
        /* storage blocked */
      }
      if (!id) {
        id = "w_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11);
        try {
          localStorage.setItem(key, id);
        } catch (e) {
          /* ignore */
        }
      }
      return id;
    },

    render: function () {
      var c = this.config.color;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Open chat");
      btn.textContent = "💬";
      btn.style.cssText =
        "position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:30px;background:" +
        c +
        ";color:#fff;border:none;font-size:28px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:2147483646;";

      var win = document.createElement("div");
      win.setAttribute("role", "dialog");
      win.setAttribute("aria-label", "Chat");
      win.style.cssText =
        'position:fixed;bottom:90px;right:20px;width:380px;max-width:calc(100vw - 40px);height:600px;max-height:calc(100vh - 120px);background:#fff;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.3);z-index:2147483647;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#111;text-align:left;';

      var header = document.createElement("div");
      header.style.cssText =
        "background:" +
        c +
        ";color:#fff;padding:20px;display:flex;justify-content:space-between;align-items:center;";
      var titleWrap = document.createElement("div");
      var title = document.createElement("h3");
      title.style.cssText =
        "margin:0;font-size:18px;font-weight:600;color:#fff;";
      title.textContent = "💬 " + this.config.name;
      var subtitle = document.createElement("p");
      subtitle.style.cssText =
        "margin:5px 0 0;font-size:12px;opacity:0.9;color:#fff;";
      subtitle.textContent = "Ask me anything!";
      titleWrap.append(title, subtitle);
      var close = document.createElement("button");
      close.type = "button";
      close.setAttribute("aria-label", "Close chat");
      close.textContent = "×";
      close.style.cssText =
        "background:none;border:none;color:#fff;font-size:24px;cursor:pointer;";
      header.append(titleWrap, close);

      var msgs = document.createElement("div");
      msgs.style.cssText =
        "flex:1;overflow-y:auto;padding:20px;background:#f8f9fa;";

      var footer = document.createElement("div");
      footer.style.cssText =
        "padding:16px 20px;background:#fff;border-top:1px solid #eee;";
      var row = document.createElement("div");
      row.style.cssText = "display:flex;gap:10px;";
      var input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Type your message...";
      input.maxLength = 1000;
      input.setAttribute("aria-label", "Message");
      input.style.cssText =
        "flex:1;padding:12px;border:1px solid #ddd;border-radius:25px;outline:none;font-size:14px;color:#111;background:#fff;";
      var send = document.createElement("button");
      send.type = "button";
      send.textContent = "Send";
      send.style.cssText =
        "background:" +
        c +
        ";color:#fff;border:none;padding:12px 20px;border-radius:25px;cursor:pointer;font-weight:bold;";
      row.append(input, send);
      var powered = document.createElement("a");
      powered.href = apiBase || "#";
      powered.target = "_blank";
      powered.rel = "noopener";
      powered.textContent = "Powered by ChatBot AI";
      powered.style.cssText =
        "display:block;text-align:center;margin-top:8px;font-size:11px;color:#999;text-decoration:none;";
      footer.append(row, powered);

      win.append(header, msgs, footer);
      document.body.append(btn, win);
      this.el = { button: btn, window: win, msgs: msgs, input: input };

      var self = this;
      btn.onclick = function () {
        self.toggle(!self.state.isOpen);
      };
      close.onclick = function () {
        self.toggle(false);
      };
      send.onclick = function () {
        self.sendMessage();
      };
      input.onkeydown = function (e) {
        if (e.key === "Enter" && !e.isComposing) {
          e.preventDefault();
          self.sendMessage();
        }
      };

      this.addMessage("assistant", this.config.greeting);
    },

    toggle: function (open) {
      this.state.isOpen = open;
      this.el.window.style.display = open ? "flex" : "none";
      if (open) this.el.input.focus();
    },

    addMessage: function (role, text) {
      var div = document.createElement("div");
      var isUser = role === "user";
      div.style.cssText =
        "padding:12px 15px;border-radius:15px;margin-bottom:10px;word-wrap:break-word;white-space:pre-wrap;font-size:14px;line-height:1.5;max-width:85%;" +
        (isUser
          ? "background:" + this.config.color + ";color:#fff;margin-left:auto;"
          : "background:#fff;color:#111;box-shadow:0 1px 2px rgba(0,0,0,0.06);");
      div.textContent = text; // XSS safe
      this.el.msgs.appendChild(div);
      this.el.msgs.scrollTop = this.el.msgs.scrollHeight;
      return div;
    },

    sendMessage: function () {
      if (this.state.isLoading) return;
      var msg = this.el.input.value.trim();
      if (!msg) return;
      this.el.input.value = "";
      this.addMessage("user", msg);
      this.callAPI(msg);
    },

    callAPI: function (msg) {
      var self = this;
      this.state.isLoading = true;
      var thinking = this.addMessage("assistant", "Thinking...");
      thinking.style.opacity = "0.6";

      fetch(apiBase + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbotId: this.config.chatbotId,
          message: msg,
          sessionId: this.state.sessionId,
          history: this.state.history.slice(-6),
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (r) {
          thinking.remove();
          if (r.ok && r.data.answer) {
            self.addMessage("assistant", r.data.answer);
            self.state.history.push(
              { role: "user", content: msg },
              { role: "assistant", content: r.data.answer },
            );
          } else {
            self.addMessage(
              "assistant",
              (r.data && r.data.error) ||
                "Sorry, an error occurred. Please try again.",
            );
          }
        })
        .catch(function (err) {
          console.error("[ChatBot] API Error:", err);
          thinking.remove();
          self.addMessage("assistant", "Connection error. Please try again.");
        })
        .then(function () {
          self.state.isLoading = false;
        });
    },
  };

  window.ChatBotWidget = ChatBotWidget;

  // Auto-init from the embed tag (data-chatbot-id), or the legacy window.chatbotConfig snippet
  var autoId =
    (script && script.getAttribute("data-chatbot-id")) ||
    (window.chatbotConfig && window.chatbotConfig.chatbotId);
  if (autoId) {
    var start = function () {
      ChatBotWidget.init({
        chatbotId: autoId,
        color: script && script.getAttribute("data-color"),
      });
    };
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})();
