document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.querySelector('.space-y-6'); // Main chat area
    const inputHeight = document.querySelector('textarea').scrollHeight;
    const messageInput = document.querySelector('textarea');
    const sendButton = document.querySelector('.material-icons:contains("arrow_upward")')?.parentElement || document.querySelector('button > .material-icons:contains("arrow_upward")')?.parentElement;

    // Add logic to find specific elements if classes are generic
    // Using more specific selectors based on the HTML structure I saw earlier
    const sendBtn = document.querySelector('button .material-icons:contains("arrow_upward")')?.closest('button') || document.querySelectorAll('button')[document.querySelectorAll('button').length - 1];
    const inputArea = document.querySelector('textarea');
    const messagesDiv = document.querySelector('section .space-y-6');

    let chatHistory = [];

    // Function to append message
    function appendMessage(role, text) {
        const isUser = role === 'user';

        const msgHTML = isUser ? `
            <div class="flex justify-end">
                <div class="max-w-[80%] bg-neutral-dark border border-primary/10 rounded-2xl rounded-tr-sm px-5 py-3 text-slate-100 shadow-xl">
                    ${text}
                </div>
            </div>
        ` : `
            <div class="flex gap-4">
                <div class="w-8 h-8 rounded-lg bg-background-dark border border-primary/50 flex items-center justify-center shrink-0 ai-glow-avatar">
                    <span class="material-icons text-primary text-xl">bolt</span>
                </div>
                <div class="flex-1 space-y-4">
                    <div class="text-slate-200 leading-relaxed markdown-body">
                        ${marked.parse(text)}
                    </div>
                </div>
            </div>
        `;

        messagesDiv.insertAdjacentHTML('beforeend', msgHTML);
        messagesDiv.scrollTo(0, messagesDiv.scrollHeight);
    }

    // Function to show/hide typing indicator
    function showTyping() {
        const id = 'typing-' + Date.now();
        const html = `
            <div id="${id}" class="flex gap-4 typing-indicator">
                <div class="w-8 h-8 rounded-lg bg-background-dark border border-primary/50 flex items-center justify-center shrink-0 ai-glow-avatar">
                   <span class="material-icons text-primary text-xl">bolt</span>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-1">
                        <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0s"></span>
                        <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                        <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                    </div>
                    <span class="text-xs text-slate-500 font-medium italic">Hunna is thinking...</span>
                </div>
            </div>
        `;
        messagesDiv.insertAdjacentHTML('beforeend', html);
        messagesDiv.scrollTo(0, messagesDiv.scrollHeight);
        return id;
    }

    function removeTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // Send Message Logic
    async function sendMessage() {
        const text = inputArea.value.trim();
        if (!text) return;

        // Clear input
        inputArea.value = '';
        inputArea.style.height = 'auto'; // Reset height

        // Append User Message
        appendMessage('user', text);

        // Show Typing
        const typingId = showTyping();

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory.slice(-10) // Keep last 10 messages context
                })
            });

            const data = await response.json();

            removeTyping(typingId);

            if (response.ok) {
                appendMessage('assistant', data.reply);
                // Update History
                chatHistory.push({ role: 'user', content: text });
                chatHistory.push({ role: 'assistant', content: data.reply });
            } else {
                appendMessage('assistant', 'Sorry, I encountered an error: ' + (data.error || data.msg));
            }

        } catch (error) {
            removeTyping(typingId);
            appendMessage('assistant', 'Network error. Please try again.');
            console.error(error);
        }
    }

    // Event Listeners
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (inputArea) {
        inputArea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});
