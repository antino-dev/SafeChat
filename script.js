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
    // ── National Parks Debate: A prefers Yellowstone, B prefers Yosemite ──
    'example': [
      { type: 'chatbot', text: "Which national park do you think is the best in the US?" },
      { type: 'user',    text: "That’s tough, but I’d say Yosemite. The scenery there is hard to beat." },
      { type: 'chatbot', text: "Yosemite is amazing, but I think Yellowstone stands out more. It has geysers, wildlife, and huge variety." },
      { type: 'user',    text: "True, Yellowstone is diverse, but Yosemite’s granite cliffs and waterfalls feel more iconic and dramatic." },
      { type: 'chatbot', text: "But Yellowstone has things you can’t really see anywhere else, like Old Faithful and all those geothermal features." },
      { type: 'user',    text: "That’s fair, but Yosemite feels more visually cohesive. Everything from El Capitan to Half Dome just fits together beautifully." },
      { type: 'chatbot', text: "I get that, but Yellowstone also has wildlife like bison and wolves roaming around. That adds a whole different experience." },
      { type: 'user',    text: "Wildlife is a big plus, but Yosemite’s hiking and climbing opportunities are world-class." },
      { type: 'chatbot', text: "Yellowstone has great hiking too, plus it’s massive. You can explore for days and still not see everything." },
      { type: 'user',    text: "That size can be overwhelming though. Yosemite is a bit more focused, which makes it easier to experience the highlights." },
      { type: 'chatbot', text: "Maybe, but that sense of scale in Yellowstone makes it feel more like a true wilderness." },
      { type: 'user',    text: "I guess it depends on what you want. Yosemite is about stunning landscapes, while Yellowstone is more about variety and uniqueness." },
      { type: 'chatbot', text: "Yeah, that sounds right. Both are incredible, just in different ways." },
      { type: 'user',    text: "Exactly. Picking the best probably comes down to personal preference." }
    ],

    
    // ── Pro-immigration: A is pro, B is anti ──
    'pro-immigration': [
      { type: 'chatbot', text: "Why are some people against immigration?" },
      { type: 'user',    text: "It comes up a lot in politics these days. People who oppose immigration usually focus on how it affects jobs, public resources, and communities." },
      { type: 'chatbot', text: "I think immigration can help the economy. Businesses often need workers, and immigrants can help fill those gaps." },
      { type: 'user',    text: "That can happen, but some people worry about job competition. When the labor supply grows, it can affect wages or job opportunities." },
      { type: 'chatbot', text: "But with aging populations, we actually need more workers. Immigration can help maintain the number of working-age people." },
      { type: 'user',    text: "That's one argument supporters make. Critics usually say immigration alone cannot solve demographic problems in the long run." },
      { type: 'chatbot', text: "True, it probably can't be the only solution. But immigrants can still contribute to the economy in the long run. They can bring innovation, start businesses, and introduce new skills." },
      { type: 'user',    text: "That can happen, but critics also point out that rapid population growth can put pressure on resources like housing, healthcare, and infrastructure." },
      { type: 'chatbot', text: "So it sounds like the main concern is how quickly immigration happens." },
      { type: 'user',    text: "That's part of it. There's also the cultural side. Critics say that when newcomers and locals have very different expectations about social behavior or public rules, it can sometimes create tension." },
      { type: 'chatbot', text: "Integration takes time though. But cultures have always changed and influenced each other." },
      { type: 'user',    text: "That's true. I just think the pace matters. If communities have time to adapt and understand each other, it probably works better." },
      { type: 'chatbot', text: "That makes sense. I guess the real debate is about finding the right balance." },
      { type: 'user',    text: "Yeah, pretty much. It's less about whether immigration exists and more about how it's managed." }
    ],

    // ── Anti-immigration: A is anti, B is pro ──
    'anti-immigration': [
      { type: 'chatbot', text: "Why do some people support immigration so much?" },
      { type: 'user',    text: "It comes up a lot in politics these days. People who support immigration usually focus on how it can help the economy, the workforce, and innovation." },
      { type: 'chatbot', text: "I'm more concerned about job competition. When more workers enter the labor market, it can affect wages or job opportunities." },
      { type: 'user',    text: "That concern comes up often. Supporters usually argue that immigrants fill gaps in the labor market where businesses struggle to find workers." },
      { type: 'chatbot', text: "But immigration can also increase the overall labor supply. That can make it harder for some local workers to find stable jobs." },
      { type: 'user',    text: "Supporters say that with aging populations, we actually need immigration to increase the number of working-age people in the economy." },
      { type: 'chatbot', text: "Maybe partly, but immigration alone can't solve demographic problems in the long run." },
      { type: 'user',    text: "That's true. Many supporters see it as just one part of a larger solution. Immigrants can still contribute to the economy in the long run. They can bring innovation, start businesses, and introduce new skills." },
      { type: 'chatbot', text: "They could. But even with new businesses, immigration can still put pressure on resources. Rapid population growth can affect housing, healthcare, and infrastructure." },
      { type: 'user',    text: "Pressure can happen, but they often say better planning and policy can help communities keep up with population changes." },
      { type: 'chatbot', text: "There's also the cultural side. When communities change quickly, it can create tension if people have different expectations about social norms." },
      { type: 'user',    text: "That's something people talk about. Supporters usually say cultural exchange can also strengthen communities and bring new perspectives." },
      { type: 'chatbot', text: "Maybe, but adaptation still takes time for both newcomers and locals." },
      { type: 'user',    text: "That's fair. Many would agree that integration works best when communities have time and support to adjust." },
      { type: 'chatbot', text: "That makes sense. I guess the real debate is about finding the right balance." },
      { type: 'user',    text: "Yeah, pretty much. It's less about whether immigration exists and more about how it's managed." }
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

  /* ── A: show "..." indicator, then reveal text all at once ── */

  function showChatbotMessage(msg, done) {
    // Show typing indicator bubble
    const { row: indicatorRow, contentEl: indicatorEl } = createMessageRow('chatbot');
    indicatorEl.classList.add('typing-indicator');
    indicatorEl.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Delay scales with text length: 1s base + 1ms per char, capped at 2s
    const delay = Math.min(1000 + msg.text.length, 2000);

    isTyping = true;
    if (sendIconBtn) sendIconBtn.disabled = true;

    setTimeout(() => {
      // Remove indicator row, insert real bubble
      indicatorRow.remove();
      const { contentEl } = createMessageRow('chatbot');
      contentEl.innerHTML = msg.text.replace(/\n/g, '<br>');
      chatMessages.scrollTop = chatMessages.scrollHeight;

      isTyping = false;
      if (sendIconBtn) sendIconBtn.disabled = false;
      removeLegacyCheck();
      if (done) done();
    }, delay);
  }

  /* ── B: character-by-character into the textarea (scrollable) ── */

  function typeUserPrompt(msg) {
    userInput.value = '';
    // Allow textarea to scroll for long responses
    userInput.style.height = '80px';
    userInput.style.overflowY = 'auto';
    awaitingUserSend = true;
    isTyping = true;
    if (sendIconBtn) sendIconBtn.disabled = true;
    charIndex = 0;

    // Scroll chat to bottom immediately so A's last message stays visible
    // above the expanded textarea
    chatMessages.scrollTop = chatMessages.scrollHeight;

    typingInterval = setInterval(() => {
      if (charIndex < msg.text.length) {
        userInput.value += msg.text.charAt(charIndex);
        charIndex++;
        // Keep textarea text scrolled to bottom and chat pinned to bottom
        userInput.scrollTop = userInput.scrollHeight;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } else {
        clearInterval(typingInterval);
        typingInterval = null;
        isTyping = false;
        if (sendIconBtn) sendIconBtn.disabled = false;
      }
    }, 35);
  }

  /* ── Disable input when conversation is over ── */

  function disableInput() {
    userInput.disabled = true;
    userInput.placeholder = 'Conversation ended.';
    if (sendIconBtn) sendIconBtn.disabled = true;
    const wrap = document.querySelector('.chat-input .input-wrap');
    if (wrap) wrap.style.opacity = '0.45';
  }

  /* ── Conversation flow ── */

  function nextStep() {
    if (messageIndex >= conversation.length) {
      disableInput();
      return;
    }
    const msg = conversation[messageIndex];
    if (msg.type === 'chatbot') {
      showChatbotMessage(msg, () => {
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

    // Reset textarea to auto-sizing, non-scrollable state
    userInput.value = '';
    userInput.style.overflowY = 'hidden';
    autosize();

    if (awaitingUserSend && conversation[messageIndex]?.type === 'user') {
      awaitingUserSend = false;
      messageIndex++;
      // Check if anything remains after this user turn
      const hasMore = conversation.slice(messageIndex).some(m => m.type === 'chatbot' || m.type === 'user');
      if (hasMore) {
        setTimeout(nextStep, 250);
      } else {
        disableInput();
      }
    } else {
      while (conversation[messageIndex]?.type === 'user') messageIndex++;
      if (messageIndex < conversation.length) {
        setTimeout(nextStep, 250);
      } else {
        disableInput();
      }
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
