document.addEventListener('DOMContentLoaded', () => {
    // Find elements based on image_generator.html structure
    // There isn't a clear "Generate" button in the provided snippet, so I'll look for the input area and add a listener
    // or assume there is a main input area at the bottom like chat.

    // Looking at the file content earlier, it seems to have a sidebar history and main area.
    // I'll assume there's an input at the bottom similar to chat.

    const inputArea = document.querySelector('textarea, input[type="text"][placeholder*="describe"]');
    const generateBtn = document.querySelector('button:has(.material-icons, .material-icons-round)'); // Fallback selector

    // Only proceed if we find input. If not, I'll attach to body and log warning
    if (!inputArea) {
        console.warn('Image Gen: Input area not found');
        return;
    }

    // Try to find the specific generate button, usually near the input
    let btn = generateBtn;
    // refined selector:
    const potentialBtns = document.querySelectorAll('button');
    potentialBtns.forEach(b => {
        if (b.innerText.toLowerCase().includes('generate') || b.innerHTML.includes('arrow_upward')) {
            btn = b;
        }
    });

    const mainDisplay = document.querySelector('.flex-1.p-8.overflow-y-auto'); // Middle area

    async function generateImage() {
        const prompt = inputArea.value.trim();
        if (!prompt) return;

        // UI Feedback
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons-round animate-spin">refresh</span> Generating...';
        btn.disabled = true;

        // Show loading placeholder in main area
        const loadingId = 'loading-' + Date.now();
        const loadingHTML = `
            <div id="${loadingId}" class="image-card relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900/40 animate-pulse aspect-square flex items-center justify-center">
                <div class="text-center">
                    <span class="material-icons-round text-4xl text-slate-500 animate-spin">auto_awesome</span>
                    <p class="text-slate-400 mt-2">Dreaming up your image...</p>
                </div>
            </div>
        `;
        // Insert at top of grid
        const grid = document.querySelector('.grid');
        if (grid) {
            grid.insertAdjacentHTML('afterbegin', loadingHTML);
        }

        try {
            const response = await fetch('/api/ai/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();

            // Remove loader
            const loader = document.getElementById(loadingId);
            if (loader) loader.remove();

            if (response.ok) {
                const imgSrc = data.imageBase64 ? `data:image/png;base64,${data.imageBase64}` : data.imageUrl;

                const imgHTML = `
                    <div class="image-card relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900/40">
                        <img class="w-full h-auto object-cover aspect-[4/3]" data-alt="${prompt}" src="${imgSrc}" />
                        <div class="card-overlay absolute inset-0 bg-black/40 opacity-0 transition-opacity flex flex-col justify-between p-4 group-hover:opacity-100">
                             <div class="flex justify-end gap-2">
                                <button class="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white hover:bg-primary transition-colors">
                                    <span class="material-icons-round">favorite</span>
                                </button>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-white bg-black/50 px-2 py-1 rounded line-clamp-1">${prompt}</span>
                                <a href="${imgSrc}" download="hunna-ai-gen.png" class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                                    <span class="material-icons-round">download</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `;

                if (grid) {
                    grid.insertAdjacentHTML('afterbegin', imgHTML);
                }

                // Add to history sidebar (optional/mock)
                const sidebar = document.querySelector('aside .space-y-4');
                if (sidebar) {
                    const historyHTML = `
                        <div class="group cursor-pointer">
                            <div class="relative rounded-lg overflow-hidden aspect-square mb-2 border border-slate-200 dark:border-slate-800">
                                <img class="w-full h-full object-cover" src="${imgSrc}" />
                            </div>
                        </div>
                    `;
                    sidebar.insertAdjacentHTML('afterbegin', historyHTML);
                }

            } else {
                alert('Generation failed: ' + (data.msg || 'Unknown error'));
            }

        } catch (error) {
            console.error(error);
            alert('Error connecting to image generation service');
            const loader = document.getElementById(loadingId);
            if (loader) loader.remove();
        } finally {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
            inputArea.value = '';
        }
    }

    if (btn) {
        btn.addEventListener('click', generateImage);
    }
});
