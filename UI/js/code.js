document.addEventListener('DOMContentLoaded', () => {
    // Find input area for code query
    const inputArea = document.querySelector('textarea, .monaco-editor-like-input');
    // Find send button
    const sendBtn = document.querySelector('button .material-icons:contains("send")')?.closest('button') ||
        document.querySelector('button .material-icons:contains("arrow_upward")')?.closest('button') ||
        document.querySelectorAll('footer button')[document.querySelectorAll('footer button').length - 1]; // Heuristic

    const outputArea = document.querySelector('.flex-1.overflow-auto.p-8'); // Code display area

    async function generateCode() {
        const query = inputArea ? inputArea.value : '';
        if (!query) return;

        // Show loading in editor
        if (outputArea) {
            outputArea.innerHTML = `
                <div class="flex items-center justify-center h-full text-slate-500 gap-4">
                    <span class="material-icons animate-spin text-3xl">settings</span>
                    <span>Generating code solution...</span>
                </div>
            `;
        }

        try {
            const response = await fetch('/api/ai/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            const data = await response.json();

            if (response.ok) {
                // Determine language (heuristic)
                let lang = 'javascript';
                if (data.reply.includes('def ')) lang = 'python';
                if (data.reply.includes('public class')) lang = 'java';

                // Render code
                if (outputArea) {
                    // Simple syntax highlighting classes mapping (mocking Prism/HLJS behavior manually for now using generic colors)
                    // or just putting in pre tag.
                    const codeHTML = `
                        <div class="font-mono text-sm text-slate-300">
                            <pre><code class="language-${lang}">${data.reply.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                        </div>
                     `;
                    outputArea.innerHTML = codeHTML;

                    // Optional: Trigger syntax highlight lib if available
                    if (window.Prism) Prism.highlightAll();
                    if (window.hljs) hljs.highlightAll();
                }

            } else {
                if (outputArea) outputArea.innerText = '// Error generating code: ' + data.msg;
            }

        } catch (error) {
            console.error(error);
            if (outputArea) outputArea.innerText = '// Network Error';
        }
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', generateCode);
    }
});
