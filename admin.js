/* ============================================================
   PAJAKONE ADMIN LOGIC
   Version: 1.0.0
   Last Updated: 2026-07-18
   
   Dependencies: session.js, design-system.css, admin.css
   ============================================================ */


const AdminManager = {
    currentPage: 'overview',
    
    // Mock data
    users: [],
    articles: [],
    invoices: [],
    
    init() {
        // 1. PROTECT ROUTE: Only admin can access
        if (!SessionManager.isAuthenticated()) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            return;
        }
        
        const user = SessionManager.getUser();
        if (!user || user.role !== 'admin') {
            alert(' Akses Ditolak\n\nHanya administrator yang dapat mengakses halaman ini.');
            window.location.href = 'dashboard.html';
            return;
        }
        
        // 2. Load mock data
        this.loadMockData();
        
        // 3. Bind events
        this.bindNavigation();
        this.bindThemeToggle();
        this.bindUserMenu();
        this.bindSearch();
        this.bindModals();
        
        // 4. Render initial page
        this.renderUsers();
        this.renderArticles();
        this.renderInvoices();
        this.renderCharts();
        
        // 5. Handle hash route
        this.handleHashRoute();
    },
    
    loadMockData() {
        // Load users from localStorage or use mock data
        const storedUsers = JSON.parse(localStorage.getItem('pajakone_users') || '[]');
        
        // Add some mock users if empty
        if (storedUsers.length === 0) {
            this.users = [
                { id: '1', name: 'Budi Santoso', email: 'budi@example.com', role: 'premium', business: 'umkm', status: 'active', createdAt: '2026-01-15' },
                { id: '2', name: 'Anita Rahmawati', email: 'anita@example.com', role: 'enterprise', business: 'consultant', status: 'active', createdAt: '2026-02-20' },
                { id: '3', name: 'Hendra Wijaya', email: 'hendra@example.com', role: 'free', business: 'doctor', status: 'active', createdAt: '2026-03-10' },
                { id: '4', name: 'Siti Aminah', email: 'siti@example.com', role: 'starter', business: 'freelancer', status: 'inactive', createdAt: '2026-04-05' },
                { id: '5', name: 'Agus Pratama', email: 'agus@example.com', role: 'premium', business: 'notary', status: 'active', createdAt: '2026-05-12' },
                { id: '6', name: 'Dewi Lestari', email: 'dewi@example.com', role: 'free', business: 'umkm', status: 'pending', createdAt: '2026-06-18' }
            ];
            localStorage.setItem('pajakone_users', JSON.stringify(this.users));
        } else {
            this.users = storedUsers;
        }
        
        // Mock articles
        this.articles = [
            { id: '1', title: 'Panduan Lengkap PPh Final UMKM 0,5%', category: 'UMKM', views: 1250, status: 'published', date: '2026-07-10' },
            { id: '2', title: 'Koreksi Fiskal: Apa yang Boleh dan Tidak Boleh', category: 'Fiskal', views: 890, status: 'published', date: '2026-07-08' },
            { id: '3', title: 'Kalender Pajak 2026', category: 'Kepatuhan', views: 2100, status: 'published', date: '2026-07-05' },
            { id: '4', title: 'NPPN untuk Dokter dan Notaris', category: 'Profesi Bebas', views: 670, status: 'draft', date: '2026-07-03' }
        ];
        
        // Mock invoices
        this.invoices = [
            { id: 'INV-001', user: 'Budi Santoso', amount: 299000, status: 'paid', date: '2026-07-01' },
            { id: 'INV-002', user: 'Anita Rahmawati', amount: 2500000, status: 'paid', date: '2026-07-01' },
            { id: 'INV-003', user: 'Agus Pratama', amount: 799000, status: 'pending', date: '2026-07-15' },
            { id: 'INV-004', user: 'Siti Aminah', amount: 299000, status: 'failed', date: '2026-07-10' }
        ];
    },
    
    bindNavigation() {
        document.querySelectorAll('.admin-menu a[data-page], .admin-menu button[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToPage(item.dataset.page);
            });
        });
    },
    
    navigateToPage(page) {
        this.currentPage = page;
        
        // Update sidebar active state
        document.querySelectorAll('.admin-menu a, .admin-menu button').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Show/hide pages
        document.querySelectorAll('.admin-page').forEach(p => {
            p.classList.toggle('active', p.id === `admin-page-${page}`);
        });
        
        // Update topbar title
        this.updateTopbarTitle(page);
        
        // Update URL hash
        window.location.hash = page;
    },
    
    updateTopbarTitle(page) {
        const titles = {
            'overview': ['Dashboard Admin', 'Ringkasan metrik dan statistik'],
            'users': ['Manajemen User', 'Kelola semua pengguna'],
            'articles': ['Manajemen Artikel', 'Kelola konten edukasi'],
            'invoices': ['Manajemen Invoice', 'Kelola pembayaran'],
            'settings': ['Pengaturan Sistem', 'Konfigurasi aplikasi']
        };
        
        const titleEl = document.getElementById('adminTopbarTitle');
        const subtitleEl = document.getElementById('adminTopbarSubtitle');
        
        if (titles[page]) {
            if (titleEl) titleEl.textContent = titles[page][0];
            if (subtitleEl) subtitleEl.textContent = titles[page][1];
        }
    },
    
    handleHashRoute() {
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById(`admin-page-${hash}`)) {
            this.navigateToPage(hash);
        } else {
            this.navigateToPage('overview');
        }
        
        window.addEventListener('hashchange', () => {
            const newHash = window.location.hash.replace('#', '');
            if (newHash && newHash !== this.currentPage) {
                this.navigateToPage(newHash);
            }
        });
    },
    
    bindThemeToggle() {
        const themeToggle = document.getElementById('adminThemeToggle');
        if (!themeToggle) return;
        
        const savedTheme = localStorage.getItem('pajakone_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('pajakone_theme', next);
        });
    },
    
    bindUserMenu() {
        const userMenuBtn = document.getElementById('adminUserMenuBtn');
        const userDropdown = document.getElementById('adminUserDropdown');
        
        if (!userMenuBtn || !userDropdown) return;
        
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
        
        // Logout
        const logoutBtn = document.getElementById('adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin logout?')) {
                    SessionManager.clearSession();
                    window.location.href = 'index.html';
                }
            });
        }
        
        // Back to dashboard
        const backBtn = document.getElementById('backToDashboardBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }
    },
    
    bindSearch() {
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderUsers(e.target.value);
            });
        }
    },
    
    bindModals() {
        // Close modal on overlay click
        document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        });
        
        // Close modal buttons
        document.querySelectorAll('.admin-modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.admin-modal-overlay').classList.remove('active');
            });
        });
    },
    
    renderUsers(search = '') {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        const filtered = this.users.filter(u => 
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        );
        
        tbody.innerHTML = filtered.map(user => `
            <tr>
                <td>
                    <div class="admin-user-cell">
                        <div class="admin-user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                        <div class="admin-user-info">
                            <strong>${user.name}</strong>
                            <span>${user.email}</span>
                        </div>
                    </div>
                </td>
                <td><span class="status-badge ${user.role}">${user.role}</span></td>
                <td>${user.business}</td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td>${user.createdAt}</td>
                <td>
                    <div class="admin-action-btns">
                        <button class="icon-btn" title="Edit" onclick="AdminManager.editUser('${user.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="icon-btn danger" title="Delete" onclick="AdminManager.deleteUser('${user.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Update count
        const countEl = document.getElementById('usersCount');
        if (countEl) countEl.textContent = this.users.length;
    },
    
    renderArticles() {
        const tbody = document.getElementById('articlesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = this.articles.map(article => `
            <tr>
                <td>
                    <div class="admin-user-info">
                        <strong>${article.title}</strong>
                        <span>${article.category}</span>
                    </div>
                </td>
                <td>${article.views.toLocaleString()}</td>
                <td><span class="status-badge ${article.status === 'published' ? 'active' : 'pending'}">${article.status}</span></td>
                <td>${article.date}</td>
                <td>
                    <div class="admin-action-btns">
                        <button class="icon-btn" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="icon-btn danger" title="Delete" onclick="AdminManager.deleteArticle('${article.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    renderInvoices() {
        const tbody = document.getElementById('invoicesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = this.invoices.map(inv => `
            <tr>
                <td><strong>${inv.id}</strong></td>
                <td>${inv.user}</td>
                <td>Rp ${inv.amount.toLocaleString('id-ID')}</td>
                <td><span class="status-badge ${inv.status}">${inv.status}</span></td>
                <td>${inv.date}</td>
                <td>
                    <div class="admin-action-btns">
                        <button class="icon-btn" title="View">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    renderCharts() {
        // Mock chart data
        const chartData = [
            { label: 'Jan', value: 65 },
            { label: 'Feb', value: 78 },
            { label: 'Mar', value: 90 },
            { label: 'Apr', value: 81 },
            { label: 'Mei', value: 95 },
            { label: 'Jun', value: 110 },
            { label: 'Jul', value: 125 }
        ];
        
        const chartContainer = document.getElementById('revenueChart');
        if (!chartContainer) return;
        
        const maxValue = Math.max(...chartData.map(d => d.value));
        
        chartContainer.innerHTML = `
            <div class="chart-bars">
                ${chartData.map(d => `
                    <div class="chart-bar-wrapper">
                        <div class="chart-bar" style="height: ${(d.value / maxValue) * 100}%">
                            <span class="chart-bar-value">${d.value}</span>
                        </div>
                        <span class="chart-bar-label">${d.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        const modal = document.getElementById('editUserModal');
        const nameInput = document.getElementById('editUserName');
        const emailInput = document.getElementById('editUserEmail');
        const roleInput = document.getElementById('editUserRole');
        
        if (nameInput) nameInput.value = user.name;
        if (emailInput) emailInput.value = user.email;
        if (roleInput) roleInput.value = user.role;
        
        if (modal) {
            modal.classList.add('active');
            modal.dataset.userId = userId;
        }
    },
    
    saveUser() {
        const modal = document.getElementById('editUserModal');
        const userId = modal?.dataset.userId;
        if (!userId) return;
        
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        const nameInput = document.getElementById('editUserName');
        const emailInput = document.getElementById('editUserEmail');
        const roleInput = document.getElementById('editUserRole');
        
        if (nameInput) user.name = nameInput.value;
        if (emailInput) user.email = emailInput.value;
        if (roleInput) user.role = roleInput.value;
        
        localStorage.setItem('pajakone_users', JSON.stringify(this.users));
        this.renderUsers();
        
        modal.classList.remove('active');
        alert('✅ User berhasil diperbarui!');
    },
    
    deleteUser(userId) {
        if (!confirm('⚠️ Apakah Anda yakin ingin menghapus user ini?\n\nTindakan ini tidak dapat dibatalkan.')) return;
        
        this.users = this.users.filter(u => u.id !== userId);
        localStorage.setItem('pajakone_users', JSON.stringify(this.users));
        this.renderUsers();
        
        alert('✅ User berhasil dihapus!');
    },
    
    deleteArticle(articleId) {
        if (!confirm('⚠️ Apakah Anda yakin ingin menghapus artikel ini?')) return;
        
        this.articles = this.articles.filter(a => a.id !== articleId);
        this.renderArticles();
        
        alert('✅ Artikel berhasil dihapus!');
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminManager.init());
} else {
    AdminManager.init();
}

window.AdminManager = AdminManager;