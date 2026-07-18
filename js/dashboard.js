/* ============================================================
   PAJAKONE DASHBOARD LOGIC
   Version: 1.0.0
   Last Updated: 2026-07-18
   
   This file handles:
   - Dashboard Navigation (Sidebar)
   - Page Routing (SPA-style)
   - Role-Based Access Control
   - Paywall Logic
   - User Profile Management
   - Subscription Management
   - Theme Toggle
   - Mobile Sidebar Toggle
   - Chat Functionality
   - Document Upload (Mock)
   - Settings Toggles
   
   Dependencies: session.js, design-system.css, dashboard.css
   ============================================================ */


const DashboardManager = {
    // Current active page
    currentPage: 'overview',
    
    // Premium features that require subscription
    PREMIUM_FEATURES: ['consultation', 'spt', 'documents', 'history'],
    
    /**
     * Initialize dashboard
     */
    init() {
        // 1. PROTECT ROUTE: Check authentication
        if (!SessionManager.isAuthenticated()) {
            const returnUrl = encodeURIComponent(window.location.href);
            window.location.href = `login.html?redirect=${returnUrl}`;
            return;
        }
        
        // 2. Load user data
        this.loadUserData();
        
        // 3. Bind events
        this.bindSidebarNavigation();
        this.bindUserMenu();
        this.bindThemeToggle();
        this.bindMobileSidebar();
        this.bindChat();
        this.bindSettings();
        this.bindSubscription();
        this.bindProfile();
        
        // 4. Apply role-based UI
        this.applyRoleBasedUI();
        
        // 5. Check URL hash for direct page access
        this.handleHashRoute();
    },
    
    /**
     * Load and display user data
     */
    loadUserData() {
        const user = SessionManager.getUser();
        if (!user) return;
        
        // Update user display in top bar
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userRoleDisplay = document.getElementById('userRoleDisplay');
        const userAvatarDisplay = document.getElementById('userAvatarDisplay');
        const userEmailDisplay = document.getElementById('userEmailDisplay');
        
        if (userNameDisplay) userNameDisplay.textContent = user.name;
        if (userRoleDisplay) userRoleDisplay.textContent = user.role || 'free';
        if (userAvatarDisplay) userAvatarDisplay.textContent = user.name.charAt(0).toUpperCase();
        if (userEmailDisplay) userEmailDisplay.textContent = user.email;
        
        // Update profile page
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileNameInput = document.getElementById('profileNameInput');
        const profileEmailInput = document.getElementById('profileEmailInput');
        
        if (profileName) profileName.textContent = user.name;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileAvatar) profileAvatar.textContent = user.name.charAt(0).toUpperCase();
        if (profileNameInput) profileNameInput.value = user.name;
        if (profileEmailInput) profileEmailInput.value = user.email;
        
        // Update subscription page
        this.updateSubscriptionPage();
    },
    
    /**
     * Bind sidebar navigation
     */
    bindSidebarNavigation() {
        document.querySelectorAll('.sidebar-menu a[data-page], .sidebar-menu button[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });
        
        // Also bind buttons with data-page attribute (like upgrade buttons)
        document.querySelectorAll('[data-page]').forEach(item => {
            if (!item.classList.contains('sidebar-menu')) {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = item.dataset.page;
                    this.navigateToPage(page);
                });
            }
        });
    },
    
    /**
     * Navigate to a page
     */
    navigateToPage(page) {
        // Check if page requires premium
        if (this.PREMIUM_FEATURES.includes(page) && !SessionManager.isPremium()) {
            // Show paywall instead
            this.navigateToPage('paywall-' + page);
            return;
        }
        
        this.currentPage = page;
        
        // Update sidebar active state
        document.querySelectorAll('.sidebar-menu a, .sidebar-menu button').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Show/hide pages
        document.querySelectorAll('.dashboard-page').forEach(p => {
            p.classList.toggle('active', p.id === `page-${page}`);
        });
        
        // Update top bar title
        this.updateTopBarTitle(page);
        
        // Update URL hash
        window.location.hash = page;
        
        // Close mobile sidebar
        this.closeMobileSidebar();
    },
    
    /**
     * Update top bar title based on current page
     */
    updateTopBarTitle(page) {
        const titles = {
            'overview': ['Dashboard', 'Ringkasan aktivitas dan deadline pajak Anda'],
            'consultation': ['Konsultasi', 'Chat langsung dengan konsultan pajak Anda'],
            'spt': ['SPT Tahunan', 'Kelola SPT Tahunan Anda'],
            'documents': ['Dokumen', 'Upload dan kelola dokumen pajak'],
            'articles': ['Artikel', 'Edukasi dan panduan pajak'],
            'history': ['Riwayat', 'Riwayat konsultasi dan laporan'],
            'profile': ['Profil', 'Kelola informasi pribadi Anda'],
            'subscription': ['Langganan', 'Kelola paket dan billing'],
            'settings': ['Pengaturan', 'Preferensi dan keamanan akun'],
            'paywall-consultation': ['Konsultasi', 'Fitur Premium'],
            'paywall-spt': ['SPT Tahunan', 'Fitur Premium'],
            'paywall-documents': ['Dokumen', 'Fitur Premium'],
            'paywall-history': ['Riwayat', 'Fitur Premium']
        };
        
        const titleEl = document.getElementById('topBarTitle');
        const subtitleEl = document.getElementById('topBarSubtitle');
        
        if (titles[page]) {
            if (titleEl) titleEl.textContent = titles[page][0];
            if (subtitleEl) subtitleEl.textContent = titles[page][1];
        }
    },
    
    /**
     * Handle URL hash for direct page access
     */
    handleHashRoute() {
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById(`page-${hash}`)) {
            this.navigateToPage(hash);
        } else {
            this.navigateToPage('overview');
        }
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const newHash = window.location.hash.replace('#', '');
            if (newHash && newHash !== this.currentPage) {
                this.navigateToPage(newHash);
            }
        });
    },
    
    /**
     * Bind user menu dropdown
     */
    bindUserMenu() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (!userMenuBtn || !userDropdown) return;
        
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
        
        // Bind dropdown links
        userDropdown.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.nav;
                userDropdown.classList.remove('active');
                this.navigateToPage(page);
            });
        });
        
        // Bind logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Apakah Anda yakin ingin keluar?')) {
                    SessionManager.clearSession();
                    window.location.href = 'index.html';
                }
            });
        }
        
        const sidebarLogout = document.getElementById('sidebarLogout');
        if (sidebarLogout) {
            sidebarLogout.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin keluar?')) {
                    SessionManager.clearSession();
                    window.location.href = 'index.html';
                }
            });
        }
    },
    
    /**
     * Bind theme toggle
     */
    bindThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        // Load saved theme
        const savedTheme = localStorage.getItem('pajakone_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('pajakone_theme', newTheme);
        });
    },
    
    /**
     * Bind mobile sidebar toggle
     */
    bindMobileSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
            });
        }
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
    },
    
    /**
     * Close mobile sidebar
     */
    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    },
    
    /**
     * Apply role-based UI (show/hide upgrade card, etc.)
     */
    applyRoleBasedUI() {
        const isPremium = SessionManager.isPremium();
        const sidebarUpgrade = document.getElementById('sidebarUpgrade');
        
        if (sidebarUpgrade) {
            sidebarUpgrade.style.display = isPremium ? 'none' : 'block';
        }
    },
    
    /**
     * Update subscription page with current plan info
     */
    updateSubscriptionPage() {
        const user = SessionManager.getUser();
        if (!user) return;
        
        const currentPlanTag = document.getElementById('currentPlanTag');
        const currentPlanFeatures = document.getElementById('currentPlanFeatures');
        
        if (currentPlanTag) {
            currentPlanTag.textContent = user.role || 'free';
            currentPlanTag.className = 'plan-tag ' + (user.role || 'free');
        }
        
        // Update features list based on role
        if (currentPlanFeatures) {
            const features = this.getFeaturesForRole(user.role || 'free');
            currentPlanFeatures.innerHTML = features.map(f => `
                <div class="plan-feature">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    ${f}
                </div>
            `).join('');
        }
    },
    
    /**
     * Get features list for a specific role
     */
    getFeaturesForRole(role) {
        const features = {
            'free': ['Kalkulator Pajak', 'Simulasi What-If', 'Artikel & Edukasi'],
            'starter': ['1 Konsultan Dedicated', 'Review Pembukuan Bulanan', 'Koreksi Fiskal Otomatis', 'Persiapan SPT Tahunan', 'Reminder Deadline'],
            'premium': ['Semua fitur Starter', 'Live Chat Prioritas (2 jam)', 'Review SPT sebelum Lapor', 'Tax Planning Tahunan', 'Generator Bukti Potong', 'Garansi Kepatuhan'],
            'enterprise': ['Semua fitur Premium', 'Multi-entity (10 PT/CV)', 'Dedicated Account Manager', 'API Integrasi', 'Audit Trail', 'Priority Support 24/7']
        };
        
        return features[role] || features['free'];
    },
    
    /**
     * Bind chat functionality
     */
    bindChat() {
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');
        const chatMessages = document.getElementById('chatMessages');
        
        if (!chatInput || !chatSendBtn || !chatMessages) return;
        
        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;
            
            // Add user message
            const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const userMsg = document.createElement('div');
            userMsg.className = 'chat-message user';
            userMsg.innerHTML = `${message}<span class="time">${time}</span>`;
            chatMessages.appendChild(userMsg);
            
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simulate consultant reply after 1 second
            setTimeout(() => {
                const replies = [
                    'Baik, saya akan review dan segera berikan feedback.',
                    'Terima kasih informasinya. Saya cek dulu ya.',
                    'Noted. Untuk kasus ini, saya sarankan kita lakukan koreksi fiskal positif.',
                    'Siap, saya buatkan draftnya dan kirim untuk review Anda.',
                    'Pertanyaan bagus. Berdasarkan PMK terbaru, biayanya memang tidak deductible.'
                ];
                const randomReply = replies[Math.floor(Math.random() * replies.length)];
                const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                
                const replyMsg = document.createElement('div');
                replyMsg.className = 'chat-message consultant';
                replyMsg.innerHTML = `${randomReply}<span class="time">${replyTime}</span>`;
                chatMessages.appendChild(replyMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        };
        
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    },
    
    /**
     * Bind settings toggles
     */
    bindSettings() {
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                const setting = toggle.dataset.toggle;
                console.log(`Setting ${setting} toggled:`, toggle.classList.contains('active'));
            });
        });
        
        // Delete account button
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                if (confirm('⚠️ PERINGATAN: Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus permanen. Apakah Anda yakin?')) {
                    if (confirm('Konfirmasi sekali lagi: Hapus akun permanen?')) {
                        SessionManager.clearSession();
                        alert('Akun Anda telah dihapus.');
                        window.location.href = 'index.html';
                    }
                }
            });
        }
    },
    
    /**
     * Bind subscription buttons
     */
    bindSubscription() {
        const upgradeButtons = {
            'upgradeStarterBtn': 'starter',
            'upgradeProBtn': 'premium',
            'upgradeEntBtn': 'enterprise'
        };
        
        Object.entries(upgradeButtons).forEach(([btnId, plan]) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.handleUpgrade(plan);
                });
            }
        });
    },
    
    /**
     * Handle upgrade flow (mock payment)
     */
    handleUpgrade(plan) {
        const planNames = {
            'starter': 'Starter (Rp 299rb/bulan)',
            'premium': 'Professional (Rp 799rb/bulan)',
            'enterprise': 'Enterprise (Rp 2,5jt/bulan)'
        };
        
        if (confirm(`Anda akan upgrade ke paket ${planNames[plan]}.\n\nDalam versi production, ini akan mengarahkan ke payment gateway.\n\nLanjutkan simulasi upgrade?`)) {
            // Simulate successful upgrade
            const user = SessionManager.getUser();
            if (user) {
                user.role = plan;
                SessionManager.updateUser(user);
                
                alert(`✅ Upgrade berhasil!\n\nAkun Anda sekarang menggunakan paket ${planNames[plan]}.\n\nSilakan refresh halaman untuk melihat perubahan.`);
                
                // Reload to apply changes
                window.location.reload();
            }
        }
    },
    
    /**
     * Bind profile save button
     */
    bindProfile() {
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (!saveProfileBtn) return;
        
        saveProfileBtn.addEventListener('click', () => {
            const name = document.getElementById('profileNameInput').value.trim();
            const email = document.getElementById('profileEmailInput').value.trim();
            
            if (!name || !email) {
                alert('Nama dan email harus diisi.');
                return;
            }
            
            const user = SessionManager.getUser();
            if (user) {
                user.name = name;
                user.email = email;
                SessionManager.updateUser(user);
                
                // Update UI
                this.loadUserData();
                
                alert('✅ Profil berhasil diperbarui!');
            }
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DashboardManager.init());
} else {
    DashboardManager.init();
}

// Export for use in other modules
window.DashboardManager = DashboardManager;