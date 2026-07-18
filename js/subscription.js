/**
 * PAJAKONE SUBSCRIPTION MANAGER
 * Version: 1.0.0
 * Last Updated: 2026-07-18
 * 
 * Handles subscription management, billing, and payment methods
 */

const SubscriptionManager = {
    // Mock data for development
    plans: {
        free: { name: 'Free', price: 0, features: ['Kalkulator Pajak', 'Artikel & Edukasi'] },
        starter: { name: 'Starter', price: 299000, features: ['1 Konsultan', 'Review Bulanan', 'Koreksi Fiskal'] },
        premium: { name: 'Professional', price: 799000, features: ['Semua Starter', 'Chat Prioritas', 'Tax Planning'] },
        enterprise: { name: 'Enterprise', price: 2500000, features: ['Semua Premium', 'Multi-entity', 'Dedicated Manager'] }
    },
    
    currentPlan: null,
    selectedPlan: null,
    paymentMethods: [],
    invoices: [],
    
    init() {
        // Check authentication
        if (!SessionManager.isAuthenticated()) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            return;
        }
        
        // Load user data
        this.loadSubscriptionData();
        
        // Bind events
        this.bindEvents();
        
        // Render UI
        this.renderSubscriptionStatus();
        this.renderStats();
        this.renderPaymentMethods();
        this.renderBillingHistory();
    },
    
    loadSubscriptionData() {
        const user = SessionManager.getCurrentUser();
        if (!user) return;
        
        // Set current plan
        this.currentPlan = user.role || 'free';
        
        // Load payment methods from localStorage
        this.paymentMethods = JSON.parse(localStorage.getItem('pajakone_payment_methods') || '[]');
        
        // Load invoices from localStorage
        this.invoices = JSON.parse(localStorage.getItem('pajakone_invoices') || '[]');
        
        // Generate mock data if empty
        if (this.invoices.length === 0) {
            this.generateMockInvoices();
        }
    },
    
    generateMockInvoices() {
        const user = SessionManager.getCurrentUser();
        const now = new Date();
        
        this.invoices = [
            {
                id: 'INV-2026-001',
                date: new Date(now.getFullYear(), now.getMonth() - 2, 15).toISOString(),
                plan: 'starter',
                amount: 299000,
                status: 'paid',
                method: 'Bank Transfer - BCA'
            },
            {
                id: 'INV-2026-002',
                date: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString(),
                plan: 'starter',
                amount: 299000,
                status: 'paid',
                method: 'Bank Transfer - BCA'
            },
            {
                id: 'INV-2026-003',
                date: new Date(now.getFullYear(), now.getMonth(), 15).toISOString(),
                plan: 'starter',
                amount: 299000,
                status: 'pending',
                method: 'Bank Transfer - BCA'
            }
        ];
        
        localStorage.setItem('pajakone_invoices', JSON.stringify(this.invoices));
    },
    
    bindEvents() {
        // Billing filter
        const billingFilter = document.getElementById('billingFilter');
        if (billingFilter) {
            billingFilter.addEventListener('change', (e) => {
                this.renderBillingHistory(e.target.value);
            });
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('pajakone_theme', next);
            });
        }
        
        // Load saved theme
        const savedTheme = localStorage.getItem('pajakone_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // User menu
        this.bindUserMenu();
        
        // Sidebar logout
        const sidebarLogout = document.getElementById('sidebarLogout');
        if (sidebarLogout) {
            sidebarLogout.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin logout?')) {
                    SessionManager.destroySession();
                    window.location.href = 'index.html';
                }
            });
        }
    },
    
    bindUserMenu() {
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        
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
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin logout?')) {
                    SessionManager.destroySession();
                    window.location.href = 'index.html';
                }
            });
        }
    },
    
    renderSubscriptionStatus() {
        const user = SessionManager.getCurrentUser();
        if (!user) return;
        
        const plan = this.plans[this.currentPlan] || this.plans.free;
        
        // Update current plan display
        document.getElementById('currentPlanName').textContent = plan.name;
        document.getElementById('currentPlanDesc').textContent = 
            this.currentPlan === 'free' ? 'Akses dasar ke fitur kalkulator dan artikel' : 
            `Akses penuh ke fitur ${plan.name}`;
        
        // Update badges
        const statusBadge = document.getElementById('planStatusBadge');
        const typeBadge = document.getElementById('planTypeBadge');
        
        if (this.currentPlan === 'free') {
            statusBadge.textContent = 'Aktif';
            statusBadge.className = 'plan-status-badge';
        } else {
            statusBadge.textContent = 'Aktif';
            statusBadge.className = 'plan-status-badge';
        }
        
        typeBadge.textContent = plan.name;
        
        // Update dates
        const startDate = user.subscriptionStart || new Date().toISOString();
        const endDate = user.subscriptionEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const nextBilling = user.nextBilling || endDate;
        
        document.getElementById('planStartDate').textContent = this.formatDate(startDate);
        document.getElementById('planEndDate').textContent = this.formatDate(endDate);
        document.getElementById('nextBillingDate').textContent = this.formatDate(nextBilling);
        document.getElementById('subscriptionStatus').textContent = 'Aktif';
        
        // Update user display
        document.getElementById('userNameDisplay').textContent = user.name;
        document.getElementById('userRoleDisplay').textContent = this.currentPlan;
        document.getElementById('userAvatarDisplay').textContent = user.name.charAt(0).toUpperCase();
        document.getElementById('dropdownName').textContent = user.name;
        document.getElementById('dropdownEmail').textContent = user.email;
        
        // Show/hide upgrade card in sidebar
        const sidebarUpgrade = document.getElementById('sidebarUpgrade');
        if (sidebarUpgrade) {
            sidebarUpgrade.style.display = this.currentPlan === 'free' ? 'block' : 'none';
        }
    },
    
    renderStats() {
        const totalPaid = this.invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + inv.amount, 0);
        
        const totalInvoices = this.invoices.length;
        
        const pendingAmount = this.invoices
            .filter(inv => inv.status === 'pending')
            .reduce((sum, inv) => sum + inv.amount, 0);
        
        const user = SessionManager.getCurrentUser();
        const endDate = user.subscriptionEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const daysRemaining = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        document.getElementById('totalPaid').textContent = this.formatRupiah(totalPaid);
        document.getElementById('totalInvoices').textContent = totalInvoices;
        document.getElementById('pendingAmount').textContent = this.formatRupiah(pendingAmount);
        document.getElementById('daysRemaining').textContent = daysRemaining > 0 ? daysRemaining : 0;
    },
    
    renderPaymentMethods() {
        const container = document.getElementById('paymentMethodsList');
        if (!container) return;
        
        if (this.paymentMethods.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                    <p>Belum ada metode pembayaran</p>
                    <button class="btn btn-secondary btn-sm" onclick="SubscriptionManager.addPaymentMethod()" style="margin-top: 12px;">
                        + Tambah Metode
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.paymentMethods.map((method, index) => `
            <div class="payment-method-card">
                <div class="payment-method-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                </div>
                <div class="payment-method-info">
                    <strong>${method.name}</strong>
                    <span>${method.bank.toUpperCase()} • ${method.number}</span>
                </div>
                <div class="payment-method-actions">
                    <button class="icon-btn" onclick="SubscriptionManager.editPaymentMethod(${index})" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="icon-btn danger" onclick="SubscriptionManager.deletePaymentMethod(${index})" title="Hapus">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    renderBillingHistory(filter = 'all') {
        const tbody = document.getElementById('billingTableBody');
        if (!tbody) return;
        
        let filteredInvoices = this.invoices;
        if (filter !== 'all') {
            filteredInvoices = this.invoices.filter(inv => inv.status === filter);
        }
        
        if (filteredInvoices.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                        Tidak ada invoice
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filteredInvoices.map(inv => `
            <tr>
                <td><span class="invoice-id">${inv.id}</span></td>
                <td>${this.formatDate(inv.date)}</td>
                <td>${this.plans[inv.plan]?.name || inv.plan}</td>
                <td>${this.formatRupiah(inv.amount)}</td>
                <td><span class="billing-status ${inv.status}">${inv.status}</span></td>
                <td>
                    <div class="billing-actions">
                        <button class="icon-btn" onclick="SubscriptionManager.viewInvoice('${inv.id}')" title="Lihat Detail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="icon-btn" onclick="SubscriptionManager.downloadInvoice('${inv.id}')" title="Download">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    selectPlan(planKey) {
        if (planKey === this.currentPlan) {
            this.showNotification('Anda sudah menggunakan paket ini', 'info');
            return;
        }
        
        this.selectedPlan = planKey;
        const plan = this.plans[planKey];
        
        document.getElementById('selectedPlanName').textContent = plan.name;
        document.getElementById('selectedPlanPrice').textContent = this.formatRupiah(plan.price);
        document.getElementById('selectedPlanTotal').textContent = this.formatRupiah(plan.price);
        
        // Populate payment method selector
        const selector = document.getElementById('paymentMethodSelector');
        if (this.paymentMethods.length > 0) {
            selector.innerHTML = this.paymentMethods.map((method, index) => 
                `<option value="${index}">${method.bank.toUpperCase()} - ${method.number}</option>`
            ).join('');
        } else {
            selector.innerHTML = '<option value="">Belum ada metode pembayaran</option>';
        }
        
        this.openModal('planSelectionModal');
    },
    
    confirmUpgrade() {
        const paymentMethodIndex = document.getElementById('paymentMethodSelector').value;
        
        if (!paymentMethodIndex && this.paymentMethods.length > 0) {
            this.showNotification('Pilih metode pembayaran', 'error');
            return;
        }
        
        // Simulate payment processing
        this.showNotification('Memproses pembayaran...', 'info');
        
        setTimeout(() => {
            // Update user plan
            const user = SessionManager.getCurrentUser();
            user.role = this.selectedPlan;
            user.subscriptionStart = new Date().toISOString();
            user.subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            user.nextBilling = user.subscriptionEnd;
            
            SessionManager.updateUser(user);
            
            // Save to localStorage
            const users = JSON.parse(localStorage.getItem('pajakone_users') || '[]');
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex] = user;
                localStorage.setItem('pajakone_users', JSON.stringify(users));
            }
            
            // Create invoice
            const newInvoice = {
                id: `INV-${Date.now()}`,
                date: new Date().toISOString(),
                plan: this.selectedPlan,
                amount: this.plans[this.selectedPlan].price,
                status: 'paid',
                method: this.paymentMethods[paymentMethodIndex] ? 
                    `${this.paymentMethods[paymentMethodIndex].bank} - ${this.paymentMethods[paymentMethodIndex].number}` : 
                    'Manual Payment'
            };
            
            this.invoices.push(newInvoice);
            localStorage.setItem('pajakone_invoices', JSON.stringify(this.invoices));
            
            this.closeModal('planSelectionModal');
            this.showNotification('✅ Upgrade berhasil! Paket Anda telah diperbarui.', 'success');
            
            // Refresh data
            this.loadSubscriptionData();
            this.renderSubscriptionStatus();
            this.renderStats();
            this.renderBillingHistory();
        }, 1500);
    },
    
    addPaymentMethod() {
        document.getElementById('paymentMethodType').value = 'bank_transfer';
        document.getElementById('paymentMethodName').value = '';
        document.getElementById('paymentMethodNumber').value = '';
        document.getElementById('paymentMethodBank').value = 'bca';
        
        this.openModal('paymentMethodModal');
    },
    
    savePaymentMethod() {
        const type = document.getElementById('paymentMethodType').value;
        const name = document.getElementById('paymentMethodName').value.trim();
        const number = document.getElementById('paymentMethodNumber').value.trim();
        const bank = document.getElementById('paymentMethodBank').value;
        
        if (!name || !number) {
            this.showNotification('Lengkapi semua field', 'error');
            return;
        }
        
        const method = { type, name, number, bank };
        this.paymentMethods.push(method);
        localStorage.setItem('pajakone_payment_methods', JSON.stringify(this.paymentMethods));
        
        this.closeModal('paymentMethodModal');
        this.renderPaymentMethods();
        this.showNotification('✅ Metode pembayaran berhasil ditambahkan', 'success');
    },
    
    editPaymentMethod(index) {
        const method = this.paymentMethods[index];
        if (!method) return;
        
        document.getElementById('paymentMethodType').value = method.type;
        document.getElementById('paymentMethodName').value = method.name;
        document.getElementById('paymentMethodNumber').value = method.number;
        document.getElementById('paymentMethodBank').value = method.bank;
        
        this.openModal('paymentMethodModal');
        
        // Override save to update instead of add
        const saveBtn = document.querySelector('#paymentMethodModal .btn-primary');
        saveBtn.onclick = () => {
            this.paymentMethods[index] = {
                type: document.getElementById('paymentMethodType').value,
                name: document.getElementById('paymentMethodName').value.trim(),
                number: document.getElementById('paymentMethodNumber').value.trim(),
                bank: document.getElementById('paymentMethodBank').value
            };
            localStorage.setItem('pajakone_payment_methods', JSON.stringify(this.paymentMethods));
            this.closeModal('paymentMethodModal');
            this.renderPaymentMethods();
            this.showNotification('✅ Metode pembayaran berhasil diperbarui', 'success');
            
            // Restore original onclick
            saveBtn.onclick = () => this.savePaymentMethod();
        };
    },
    
    deletePaymentMethod(index) {
        if (confirm('Hapus metode pembayaran ini?')) {
            this.paymentMethods.splice(index, 1);
            localStorage.setItem('pajakone_payment_methods', JSON.stringify(this.paymentMethods));
            this.renderPaymentMethods();
            this.showNotification('Metode pembayaran dihapus', 'success');
        }
    },
    
    viewInvoice(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;
        
        const content = document.getElementById('invoiceDetailContent');
        content.innerHTML = `
            <div class="plan-summary">
                <div class="plan-summary-item">
                    <span class="label">Invoice ID:</span>
                    <span class="value">${invoice.id}</span>
                </div>
                <div class="plan-summary-item">
                    <span class="label">Tanggal:</span>
                    <span class="value">${this.formatDate(invoice.date)}</span>
                </div>
                <div class="plan-summary-item">
                    <span class="label">Paket:</span>
                    <span class="value">${this.plans[invoice.plan]?.name || invoice.plan}</span>
                </div>
                <div class="plan-summary-item">
                    <span class="label">Metode:</span>
                    <span class="value">${invoice.method}</span>
                </div>
                <div class="plan-summary-item">
                    <span class="label">Status:</span>
                    <span class="value"><span class="billing-status ${invoice.status}">${invoice.status}</span></span>
                </div>
                <div class="plan-summary-item total">
                    <span class="label">Total:</span>
                    <span class="value">${this.formatRupiah(invoice.amount)}</span>
                </div>
            </div>
        `;
        
        this.openModal('invoiceDetailModal');
    },
    
    downloadInvoice(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;
        
        // Generate simple invoice text
        const user = SessionManager.getCurrentUser();
        const invoiceText = `
INVOICE PAJAKONE
