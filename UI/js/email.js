document.addEventListener('DOMContentLoaded', () => {
    // Quick Replies
    const replyButtons = document.querySelectorAll('button p:contains("Quick Reply")')?.closest('button') ||
        document.querySelectorAll('aside button'); // Broader selector

    // Specifically looking for the AI Quick Replies side panel buttons
    const aiPanel = document.querySelector('aside .space-y-4'); // Right panel
    if (aiPanel) {
        const buttons = aiPanel.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const context = document.querySelector('.space-y-6.text-slate-700')?.innerText || "Email context";
                const typeText = btn.querySelector('p.font-bold')?.innerText || "Reply";

                // Show loading on button
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span class="animate-spin material-icons text-xs">refresh</span> Generating...';

                try {
                    const response = await fetch('/api/ai/email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ context, type: typeText })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Open a reply modal or fill a textarea - assuming a reply area exists or alerting for now
                        // Check for reply button to "open" reply box
                        const replyActionBtn = document.querySelector('button:has(.material-icons-round:contains("reply"))');
                        if (replyActionBtn) replyActionBtn.click();

                        // Find textarea
                        setTimeout(() => {
                            const composer = document.querySelector('textarea'); // Assuming one appears
                            if (composer) {
                                composer.value = data.reply;
                            } else {
                                // Alert if no composer found
                                alert("Draft Generated:\n\n" + data.reply);
                            }
                        }, 500);

                    } else {
                        alert('Error: ' + data.msg);
                    }

                } catch (e) {
                    console.error(e);
                    alert('Network error');
                } finally {
                    btn.innerHTML = originalText;
                }
            });
        });
    }
});
