// Shared logic for Hunna AI UI

const APP_CONFIG = {
    pages: {
        landing: '/UI/index.html',
        dashboard: '/UI/dashboard.html',
        login: '/UI/login.html',
        chat: '/UI/chat.html',
        email: '/UI/email.html',
        resume: '/UI/resume.html',
        code: '/UI/code_assistant.html',
        image: '/UI/image_generator.html',
        analytics: '/UI/analytics.html',
        settings: '/UI/settings.html',
        api: '/UI/api_management.html'
    },
    user: {
        name: 'Alex Rivera',
        plan: 'Pro Member',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6EbJ0hoS6yQZQv7cF9Pnm7bMNiFxZv5adZrOsIr8jJZjfwbFMAkPVNQW7-WA_G7ojDWlM_UVlsCxK4heEIx61aq1OBs3az3-PtylgeSQu2lTKPi7bzwJqfwZNNdQ40MujycFu4QnImuM6_SsGPmW5Wb4Y-JCNa8JpSe1YrtmPQMUZ333_phfnN0uTgVg80t3b5EEOgda_tozU42XanNe_VLHRXQRetZcV9eoUh5sYoyBPJHNH-cO-PHYcQD91uT7x7r-1dUzXr-R1'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    checkAuth();
    highlightActiveLink();
    initMockData();
});

function initNavigation() {
    // Attach click handlers to common navigation elements if they exist
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && href.startsWith('/')) {
            // Ensure links work with the file system structure if needed
            // For now, we assume paths in APP_CONFIG match the file system relative to root
        }
    });

    // Handle Login Button
    const loginBtns = document.querySelectorAll('button:contains("Log In")'); // Pseudo-selector, implementing manually
    document.querySelectorAll('button').forEach(btn => {
        if (btn.innerText.includes('Log In')) {
            btn.addEventListener('click', () => {
                window.location.href = APP_CONFIG.pages.login;
            });
        }
    });
}

async function checkAuth() {
    const isLoginPage = window.location.pathname.includes('login.html');
    const isLandingPage = window.location.pathname.endsWith('/UI/index.html') || window.location.pathname.endsWith('/UI/');

    try {
        const response = await fetch('/auth/current_user');
        const user = await response.json();

        if (!user && !isLoginPage && !isLandingPage) {
            // Not logged in and trying to access protected page
            window.location.href = APP_CONFIG.pages.login;
        } else if (user && isLoginPage) {
            // Logged in and trying to access login page
            window.location.href = APP_CONFIG.pages.dashboard;
        }

        if (user) {
            updateUserUI(user);
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        // Fallback to local storage for dev/demo if backend fails
        const isLoggedIn = localStorage.getItem('hunna_is_logged_in') === 'true';
        if (!isLoggedIn && !isLoginPage && !isLandingPage) {
            window.location.href = APP_CONFIG.pages.login;
        }
    }
}

function updateUserUI(user) {
    // Update avatar and name if elements exist
    const avatar = document.querySelector('img[data-alt="User profile avatar male"]');
    if (avatar && user.avatar) avatar.src = user.avatar;

    // Update other UI elements as needed
}

function highlightActiveLink() {
    const currentPath = window.location.pathname.replace(/\\/g, '/'); // Normalize slashes
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        // Simple heuristic to check if link matches current page
        const href = link.getAttribute('href');
        // Match filename (e.g. dashboard.html)
        if (href && currentPath.endsWith(href.replace('./', ''))) {
            link.classList.add('sidebar-active', 'text-primary');
            link.classList.remove('text-slate-400');
        }
    });
}

// Mock logout
function logout() {
    // localStorage.removeItem('hunna_is_logged_in'); // Backend handles session now
    window.location.href = '/auth/logout';
}

async function initMockData() {
    try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();

        // Update Dashboard Metrics
        if (document.getElementById('total-revenue')) {
            document.getElementById('total-revenue').textContent = `$${data.revenue.toLocaleString()}`;
        }
        if (document.getElementById('active-users')) {
            document.getElementById('active-users').textContent = data.activeUsers.toLocaleString();
        }
        if (document.getElementById('api-success-rate')) {
            document.getElementById('api-success-rate').textContent = `${data.apiSuccessRate}%`;
        }
        if (document.getElementById('avg-latency')) {
            document.getElementById('avg-latency').textContent = `${data.avgLatency}ms`;
        }
    } catch (error) {
        console.error('Error fetching mock data:', error);
    }
}

// 1. Platform Analytics - Active Users & Revenue
const activeUsersEl = document.getElementById('active-users-count');
if (activeUsersEl) {
    setInterval(() => {
        const currentText = activeUsersEl.innerText.replace(/,/g, '');
        const current = parseInt(currentText);
        const change = Math.floor(Math.random() * 20) - 10;
        const newCount = current + change;
        activeUsersEl.innerText = newCount.toLocaleString();
    }, 3000);
}

// Revenue Fluctuation
const revenueEl = document.getElementById('total-revenue');
if (revenueEl) {
    setInterval(() => {
        // Simple fluctuation logic
        const current = parseFloat(revenueEl.innerText.replace(/[$,]/g, ''));
        const change = (Math.random() * 100) - 30;
        const newRev = current + change;
        revenueEl.innerText = '$' + newRev.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }, 5000);
}

// 2. API Console - RPS & Token Usage
const rpsBar = document.getElementById('rps-bar');
const rpsText = document.getElementById('rps-text');
if (rpsBar && rpsText) {
    setInterval(() => {
        const rps = Math.floor(Math.random() * 30) + 10; // 10-40
        const max = 50;
        const width = (rps / max) * 100;
        rpsBar.style.width = `${width}%`;
        rpsText.innerText = `${rps} / ${max}`;
    }, 2000);
}

const tokenBar = document.getElementById('token-usage-bar');
const tokenText = document.getElementById('token-usage-text');
if (tokenBar && tokenText) {
    setInterval(() => {
        // Incremental growth
        let current = parseFloat(tokenText.innerText.split('M')[0]);
        current += 0.01;
        if (current > 5.0) current = 1.2;
        const percentage = (current / 5.0) * 100;
        tokenBar.style.width = `${percentage}%`;
        tokenText.innerText = `${current.toFixed(2)}M / 5.0M`;
    }, 1000);
}

// 3. API Console - Logs type effect
const apiLogsBody = document.getElementById('api-logs-body');
if (apiLogsBody) {
    setInterval(() => {
        const methods = ['POST', 'GET'];
        const statuses = ['200 OK', '404 NOT FOUND', '500 ERROR'];
        const statusColors = { '200 OK': 'text-green-500 glow-green', '404 NOT FOUND': 'text-red-500 glow-red', '500 ERROR': 'text-red-500 glow-red' };

        const method = methods[Math.floor(Math.random() * methods.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group animate-pulse";
        row.innerHTML = `
                <td class="px-6 py-3 text-slate-400">${timestamp}</td>
                <td class="px-6 py-3"><span class="px-1.5 py-0.5 bg-blue-100 dark:bg-primary/20 text-primary rounded text-[10px] font-bold">${method}</span></td>
                <td class="px-6 py-3 text-slate-900 dark:text-slate-300">/v1/chat/completions</td>
                <td class="px-6 py-3 font-bold ${statusColors[status]}">${status}</td>
                <td class="px-6 py-3 text-slate-500">${Math.floor(Math.random() * 200) + 20}ms</td>
                <td class="px-6 py-3 text-slate-400">Prod-Main</td>
                <td class="px-6 py-3 text-right"><button class="material-icons-round text-sm text-slate-400 hover:text-primary transition-colors">launch</button></td>
             `;
        apiLogsBody.insertBefore(row, apiLogsBody.firstChild);
        if (apiLogsBody.children.length > 10) apiLogsBody.lastChild.remove();

        setTimeout(() => row.classList.remove('animate-pulse'), 1000);
    }, 3000);
}

// 4. Dashboard - Recent Activity
const activityList = document.getElementById('recent-activity-list');
if (activityList) {
    setInterval(() => {
        const activities = [
            { title: 'Project_Alpha_Specs.docx', type: 'Document Reader', icon: 'picture_as_pdf' },
            { title: 'Refactored auth_module.py', type: 'Code Assistant', icon: 'data_object' },
            { title: 'Marketing Campaign V2', type: 'AI Chat', icon: 'auto_awesome' },
            { title: 'Logo_Concepts_Final.png', type: 'Image Generator', icon: 'image' }
        ];
        const item = activities[Math.floor(Math.random() * activities.length)];

        const div = document.createElement('div');
        div.className = "p-4 flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer group animate-pulse";
        div.innerHTML = `
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded bg-slate-800 flex items-center justify-center">
                    <span class="material-icons-outlined text-sm text-slate-400">$\{item.icon}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-200">$\{item.title}</p>
                    <p class="text-xs text-slate-500">$\{item.type} • Just now</p>
                  </div>
                </div>
                <span class="material-icons-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
             `;
        activityList.insertBefore(div, activityList.firstChild);
        if (activityList.children.length > 5) activityList.lastChild.remove();
        setTimeout(() => div.classList.remove('animate-pulse'), 1000);
    }, 4000);
}
