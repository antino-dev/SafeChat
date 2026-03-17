document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');           // hidden legacy
  const sendIconBtn = document.getElementById('send-icon-btn');        // visible icon btn

  const autosize = () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
  };

  const removeLegacyCheck = () => {
    document.querySelectorAll('.check-answer').forEach(el => el.remove());
  };

  const SCENARIOS = {
    'baseline-simple': [
      { type: 'chatbot', text: "Hi, I am your BMV assistant. How can I help you?" },
      { type: 'user',    text: "I live in Indiana and want to renew my driver's license. When should I renew my license?" },
      { type: 'chatbot', text: "You can renew an Indiana driver's license up to 24 months before it expires if you are a U.S. citizen. If you are non-citizen with temporary lawful status, renewal is usually allowed up to 30 days before expiration." },
      { type: 'user',    text: "What documents do I need to have?" },
      { type: 'chatbot', text: "You typically need:\nYour current driver's license\nProof of identity (e.g., passport or birth certificate)\nProof of Social Security number\nTwo documents proving Indiana residency" }
    ],
    'baseline-complex': [
      { type: 'chatbot', text: "Hi, I am your BMV assistant. How can I help you?" },
      { type: 'user',    text: "I moved from Illinois to Indiana, but I just found out my Illinois license is suspended. What should I do?" },
      { type: 'chatbot', text: "Indiana cannot issue or transfer your license while there is an active suspension in another state. You must first resolve the Illinois suspension before Indiana can process your application." },
      { type: 'user',    text: "What should I do to clear the suspension?" },
      { type: 'chatbot', text: "Here are the usual steps:\nContact the Illinois court or Secretary of State to confirm the reason for the suspension.\nResolve the ticket (pay fines, attend court, or set up a payment plan).\nPay any Illinois reinstatement fees, if required.\nWait until Illinois updates your driving record to show the suspension is cleared." },
      { type: 'user',    text: "What should I do once it's cleared?" },
      { type: 'chatbot', text: "You can then apply for an Indiana driver's license at a BMV branch with your reinstatement documentation." }
    ],
    'followup-simple': [
      { type: 'chatbot', text: "Hi, I am your BMV assistant. How can I help you?" },
      { type: 'user',    text: "I live in Indiana and want to renew my driver's license." },
      { type: 'chatbot', text: "Would you like to know when you should renew your license?" },
      { type: 'user',    text: "Yes." },
      { type: 'chatbot', text: "You can renew an Indiana driver's license up to 24 months before it expires if you are a U.S. citizen. If you are non-citizen with temporary lawful status, renewal is usually allowed up to 30 days before expiration. Would you like to know what documents you need to have?" },
      { type: 'user',    text: "I need my current driver's license with me, right?" },
      { type: 'chatbot', text: "Correct, but you need additional documents as follows:\nProof of identity (e.g., passport or birth certificate)\nProof of Social Security number\nTwo documents proving Indiana residency\nWould you like to know the typical time and cost that the process takes?" },
      { type: 'user',    text: "Yes, please." },
      { type: 'chatbot', text: "The renewal fee for most drivers under age 75 is $17.50. Your permanent license is usually mailed within about 14 days. If needed, you'll receive a temporary credential." }
    ],
    'followup-complex': [
      { type: 'chatbot', text: "Hi, I am your BMV assistant. How can I help you?" },
      { type: 'user',    text: "I moved from Illinois to Indiana, but I just found out my Illinois license is suspended." },
      { type: 'chatbot', text: "Indiana cannot issue or transfer your license while there is an active suspension in another state. You must first resolve the Illinois suspension before Indiana can process your application. Would you like to know how to clear the suspension?" },
      { type: 'user',    text: "Yes." },
      { type: 'chatbot', text: "Here are the usual steps:\nContact the Illinois court or Secretary of State to confirm the reason for the suspension.\nResolve the ticket (pay fines, attend court, or set up a payment plan).\nPay any Illinois reinstatement fees, if required.\nWait until Illinois updates your driving record to show the suspension is cleared.\nWould you want to know what you should do once it's cleared?" },
      { type: 'user',    text: "Yes, please." },
      { type: 'chatbot', text: "You can then apply for an Indiana driver's license at a BMV branch with your reinstatement documentation." }
    ],
    'oneshot-simple': [
      { type: 'chatbot', text: "Hi, I am your BMV assistant. How can I help you?" },
      { type: 'user',    text: "I live in Indiana and want to renew my driver's license." },
      { type: 'chatbot', text: "You can renew an Indiana driver's license up to 24 months before it expires if you are a U.S. citizen. If you are non-citizen with temporary lawful status, renewal is usually allowed up to 30 days before expiration. \nYou typically need:\nYour current driver's license\nProof of identity (e.g., passport or birth certificate)\nProof of Social Security number\nTwo documents proving Indiana residency\nThe renewal fee for most drivers under age 75 is $17.50. Your permanent license is usually mailed within about 14 days. If needed, you'll receive a temporary credential." }
    ],
    'oneshot-complex': [
      { type: 'chatbot', text: "Hi, I am your BMV assistant. How can I help you?" },
      { type: 'user',    text: "I moved from Illinois to Indiana, but I just found out my Illinois license is suspended." },
      { type: 'chatbot', text: "Indiana cannot issue or transfer your license while there is an active suspension in another state. You must first resolve the Illinois suspension before Indiana can process your application.\nHere are the usual steps to clear the suspension:\nContact the Illinois court or Secretary of State to confirm the reason for the suspension.\nResolve the ticket (pay fines, attend court, or set up a payment plan).\nPay any Illinois reinstatement fees, if required.\nWait until Illinois updates your driving record to show the suspension is cleared.\nYou can then apply for an Indiana driver's license at a BMV branch with your reinstatement documentation." }
    ]
  };

  const key = (window.SCRIPT_SCENARIO || 'baseline-simple');
  const conversation = SCENARIOS[key];

  let messageIndex = 0;
  let charIndex = 0;
  let typingInterval = null;
  let awaitingUserSend = false;
  let isTyping = false;

  /* ── DOM helpers ── */

  function createAvatar(type) {
    const el = document.createElement('div');
    el.classList.add('avatar', type === 'chatbot' ? 'avatar-a' : 'avatar-b');
    el.textContent = type === 'chatbot' ? 'A' : 'B';
    return el;
  }

  /**
   * Creates a full message row: avatar + bubble.
   * Returns { row, contentEl } where contentEl is where text is typed.
   */
  function createMessageRow(type) {
    const row = document.createElement('div');
    row.classList.add('message-row', type === 'user' ? 'user-row' : 'bot-row');

    const avatar = createAvatar(type);

    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble', type === 'chatbot' ? 'chatbot-message' : 'user-message');

    if (type === 'chatbot') {
      row.appendChild(avatar);
      row.appendChild(bubble);
    } else {
      row.appendChild(bubble);
      row.appendChild(avatar);
    }

    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return { row, contentEl: bubble };
  }

  /* ── Typing engine ── */

  function typeIntoElement(el, fullText, onDone) {
    isTyping = true;
    if (sendIconBtn) sendIconBtn.disabled = true;
    charIndex = 0;
    const isTextArea = (el === userInput);
    if (isTextArea) autosize();

    typingInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        const ch = fullText.charAt(charIndex);
        if (isTextArea) {
          userInput.value += ch;
          autosize();
        } else {
          el.innerHTML += (ch === '\n' ? '<br>' : ch);
        }
        charIndex++;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } else {
        clearInterval(typingInterval);
        typingInterval = null;
        isTyping = false;
        if (sendIconBtn) sendIconBtn.disabled = false;
        if (typeof onDone === 'function') onDone();
      }
    }, 35);
  }

  function typeChatbotMessage(msg, done) {
    const { contentEl } = createMessageRow('chatbot');
    typeIntoElement(contentEl, msg.text, () => { removeLegacyCheck(); if (done) done(); });
  }

  function typeUserPrompt(msg) {
    userInput.value = '';
    autosize();
    awaitingUserSend = true;
    typeIntoElement(userInput, msg.text, () => {});
  }

  /* ── Conversation flow ── */

  function nextStep() {
    if (messageIndex >= conversation.length) return;
    const msg = conversation[messageIndex];
    if (msg.type === 'chatbot') {
      typeChatbotMessage(msg, () => {
        messageIndex++;
        setTimeout(nextStep, 350);
      });
    } else {
      typeUserPrompt(msg);
    }
  }

  function sendMessage() {
    const text = userInput.value.trim();
    if (!text || isTyping) return;

    const { contentEl } = createMessageRow('user');
    contentEl.innerHTML = text.replace(/\n/g, '<br>');

    userInput.value = '';
    autosize();

    if (awaitingUserSend && conversation[messageIndex]?.type === 'user') {
      awaitingUserSend = false;
      messageIndex++;
      setTimeout(nextStep, 250);
    } else {
      while (conversation[messageIndex]?.type === 'user') messageIndex++;
      if (messageIndex < conversation.length) setTimeout(nextStep, 250);
    }
  }

  /* ── Event listeners ── */
  if (sendIconBtn) sendIconBtn.addEventListener('click', sendMessage);
  sendButton.addEventListener('click', sendMessage);   // legacy (hidden)
  userInput.addEventListener('input', autosize);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  /* ── Boot ── */
  removeLegacyCheck();
  autosize();
  nextStep();
});
