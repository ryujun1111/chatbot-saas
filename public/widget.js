(function() {
  'use strict';

  // 위젯 설정 가져오기
  const script = document.currentScript;
  const chatbotId = script.getAttribute('data-chatbot-id');
  const primaryColor = script.getAttribute('data-color') || '#3B82F6';
  const position = script.getAttribute('data-position') || 'bottom-right'; // bottom-right, bottom-left
  
  if (!chatbotId) {
    console.error('ChatBot Widget: data-chatbot-id is required');
    return;
  }

  // 스타일 주입
  const style = document.createElement('style');
  style.textContent = `
    .chatbot-widget-container {
      position: fixed;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    }
    
    .chatbot-widget-container.bottom-right {
      bottom: 20px;
      right: 20px;
    }
    
    .chatbot-widget-container.bottom-left {
      bottom: 20px;
      left: 20px;
    }
    
    .chatbot-toggle-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      color: white;
      font-size: 24px;
    }
    
    .chatbot-toggle-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
    
    .chatbot-toggle-button:active {
      transform: scale(0.95);
    }
    
    .chatbot-window {
      position: fixed;
      z-index: 999998;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 100px);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      overflow: hidden;
      background: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: bottom right;
    }
    
    .chatbot-window.bottom-right {
      bottom: 100px;
      right: 20px;
    }
    
    .chatbot-window.bottom-left {
      bottom: 100px;
      left: 20px;
      transform-origin: bottom left;
    }
    
    .chatbot-window.hidden {
      opacity: 0;
      transform: scale(0.8);
      pointer-events: none;
    }
    
    .chatbot-window.visible {
      opacity: 1;
      transform: scale(1);
    }
    
    .chatbot-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    
    .chatbot-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.1);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      z-index: 10;
      color: white;
      font-size: 18px;
    }
    
    .chatbot-close-button:hover {
      background: rgba(0, 0, 0, 0.2);
    }
    
    @media (max-width: 480px) {
      .chatbot-window {
        width: calc(100vw - 20px);
        height: calc(100vh - 20px);
        bottom: 10px !important;
        right: 10px !important;
        left: 10px !important;
        border-radius: 12px;
      }
      
      .chatbot-toggle-button {
        width: 56px;
        height: 56px;
        font-size: 22px;
      }
    }
  `;
  document.head.appendChild(style);

  // 위젯 컨테이너 생성
  const container = document.createElement('div');
  container.className = `chatbot-widget-container ${position}`;
  
  // 토글 버튼 생성
  const toggleButton = document.createElement('button');
  toggleButton.className = 'chatbot-toggle-button';
  toggleButton.innerHTML = '💬';
  toggleButton.setAttribute('aria-label', 'Open chat');
  
  // 채팅 윈도우 생성
  const chatWindow = document.createElement('div');
  chatWindow.className = `chatbot-window ${position} hidden`;
  
  // iframe 생성
  const iframe = document.createElement('iframe');
  iframe.className = 'chatbot-iframe';
  const baseUrl = script.src.replace('/widget.js', '');
  iframe.src = `${baseUrl}/widget/${chatbotId}?color=${encodeURIComponent(primaryColor)}`;
  iframe.setAttribute('title', 'Chatbot');
  iframe.allow = 'clipboard-write';
  
  chatWindow.appendChild(iframe);
  
  // DOM에 추가
  container.appendChild(toggleButton);
  document.body.appendChild(container);
  document.body.appendChild(chatWindow);
  
  // 상태 관리
  let isOpen = false;
  
  // 토글 함수
  function toggleChat() {
    isOpen = !isOpen;
    
    if (isOpen) {
      chatWindow.classList.remove('hidden');
      chatWindow.classList.add('visible');
      toggleButton.innerHTML = '✕';
      toggleButton.setAttribute('aria-label', 'Close chat');
    } else {
      chatWindow.classList.remove('visible');
      chatWindow.classList.add('hidden');
      toggleButton.innerHTML = '💬';
      toggleButton.setAttribute('aria-label', 'Open chat');
    }
  }
  
  // 이벤트 리스너
  toggleButton.addEventListener('click', toggleChat);
  
  // ESC 키로 닫기
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) {
      toggleChat();
    }
  });
  
  // iframe에서 메시지 수신 (필요시 확장)
  window.addEventListener('message', function(event) {
    if (event.data.type === 'chatbot-close') {
      if (isOpen) toggleChat();
    }
  });
  
  console.log('ChatBot Widget loaded successfully');
})();
