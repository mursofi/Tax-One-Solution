/* ============================================================
   PAJAKONE AUTHENTICATION LOGIC
   Version: 1.0.0
   Last Updated: 2026-07-18
   
   This file handles:
   - Login Form Processing
   - Register Form Processing
   - Forgot Password Flow
   - Form Validation
   - Error Handling
   - Success Messages
   
   Dependencies: session.js
   ============================================================ */


const AuthManager = {
    // Mock user database (in production, this would be server-side)
    users: JSON.parse(localStorage.getItem('pajakone_users') || '[]'),
    
    /**
     * Initialize authentication
     */
    init() {
        // Redirect if already authenticated
        SessionManager.redirectIfAuthenticated();
        
        // Bind form events based on current page
        this.bindLoginForm();
        this.bindRegisterForm();
        this.bindForgotPasswordForm();
        this.bindPasswordToggle();
        this.bindPasswordStrength();
    },
    
    /**
     * Bind login form
     */
    bindLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    },
    
    /**
     * Bind register form
     */
    bindRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;
        
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    },
    
    /**
     * Bind forgot password form
     */
    bindForgotPasswordForm() {
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (!forgotForm) return;
        
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });
    },
    
    /**
     * Bind password visibility toggle
     */
    bindPasswordToggle() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const input = toggle.previousElementSibling;
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                    `;
                } else {
                    input.type = 'password';
                    toggle.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    `;
                }
            });
        });
    },
    
    /**
     * Bind password strength checker
     */
    bindPasswordStrength() {
        const passwordInput = document.getElementById('registerPassword');
        if (!passwordInput) return;
        
        passwordInput.addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });
    },
    
    /**
     * Handle login
     */
    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const remember = document.getElementById('rememberMe').checked;
        
        // Clear previous errors
        this.clearErrors();
        
        // Validation
        let isValid = true;
        
        if (!this.validateEmail(email)) {
            this.showError('loginEmail', 'Email tidak valid');
            isValid = false;
        }
        
        if (password.length < 6) {
            this.showError('loginPassword', 'Password minimal 6 karakter');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Find user
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            this.showAlert('error', 'Login Gagal', 'Email atau password salah. Silakan coba lagi.');
            return;
        }
        
        // Save session
        SessionManager.saveSession(user, remember);
        
        // Show success
        this.showAlert('success', 'Login Berhasil', `Selamat datang kembali, ${user.name}!`);
        
        // Redirect after delay
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');
            window.location.href = redirect || 'dashboard.html';
        }, 1000);
    },
    
    /**
     * Handle register
     */
    handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const business = document.getElementById('registerBusiness').value;
        
        // Clear previous errors
        this.clearErrors();
        
        // Validation
        let isValid = true;
        
        if (name.length < 3) {
            this.showError('registerName', 'Nama minimal 3 karakter');
            isValid = false;
        }
        
        if (!this.validateEmail(email)) {
            this.showError('registerEmail', 'Email tidak valid');
            isValid = false;
        }
        
        if (password.length < 8) {
            this.showError('registerPassword', 'Password minimal 8 karakter');
            isValid = false;
        }
        
        if (!business) {
            this.showError('registerBusiness', 'Pilih jenis usaha');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Check if email already exists
        if (this.users.find(u => u.email === email)) {
            this.showAlert('error', 'Registrasi Gagal', 'Email sudah terdaftar. Silakan gunakan email lain atau login.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // In production, hash this!
            business,
            role: 'free',
            createdAt: new Date().toISOString()
        };
        
        // Save to "database"
        this.users.push(newUser);
        localStorage.setItem('pajakone_users', JSON.stringify(this.users));
        
        // Save session
        SessionManager.saveSession(newUser, false);
        
        // Show success
        this.showAlert('success', 'Registrasi Berhasil', `Selamat datang di PajakOne, ${name}!`);
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    },
    
    /**
     * Handle forgot password
     */
    handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value.trim();
        
        // Clear previous errors
        this.clearErrors();
        
        // Validation
        if (!this.validateEmail(email)) {
            this.showError('forgotEmail', 'Email tidak valid');
            return;
        }
        
        // Check if email exists
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            this.showAlert('error', 'Email Tidak Ditemukan', 'Email ini tidak terdaftar di sistem kami.');
            return;
        }
        
        // In production, send password reset email
        // For demo, show success message
        this.showAlert('success', 'Email Terkirim', `Link reset password telah dikirim ke ${email}. Silakan cek inbox Anda.`);
        
        // Clear form
        document.getElementById('forgotPasswordForm').reset();
    },
    
    /**
     * Validate email format
     * @param {string} email
     * @returns {boolean}
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    /**
     * Check password strength
     * @param {string} password
     */
    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.password-strength-fill');
        const strengthText = document.querySelector('.password-strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Remove all strength classes
        strengthBar.className = 'password-strength-fill';
        strengthText.className = 'password-strength-text';
        
        if (password.length === 0) {
            strengthText.textContent = '';
        } else if (strength <= 2) {
            strengthBar.classList.add('weak');
            strengthText.classList.add('weak');
            strengthText.textContent = 'Lemah';
        } else if (strength <= 3) {
            strengthBar.classList.add('medium');
            strengthText.classList.add('medium');
            strengthText.textContent = 'Sedang';
        } else {
            strengthBar.classList.add('strong');
            strengthText.classList.add('strong');
            strengthText.textContent = 'Kuat';
        }
    },
    
    /**
     * Show error on input field
     * @param {string} fieldId - Input field ID
     * @param {string} message - Error message
     */
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        field.classList.add('error');
        
        // Find or create error message element
        let errorEl = field.parentElement.querySelector('.form-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'form-error';
            errorEl.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>${message}</span>
            `;
            field.parentElement.appendChild(errorEl);
        } else {
            errorEl.querySelector('span').textContent = message;
        }
        
        errorEl.classList.add('visible');
    },
    
    /**
     * Clear all errors
     */
    clearErrors() {
        document.querySelectorAll('.form-input.error').forEach(input => {
            input.classList.remove('error');
        });
        
        document.querySelectorAll('.form-error.visible').forEach(error => {
            error.classList.remove('visible');
        });
        
        // Clear alerts
        const alert = document.querySelector('.alert');
        if (alert) alert.remove();
    },
    
    /**
     * Show alert message
     * @param {string} type - Alert type (success, error, warning, info)
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     */
    showAlert(type, title, message) {
        // Remove existing alert
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) existingAlert.remove();
        
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        
        alert.innerHTML = `
            ${icons[type]}
            <div>
                <strong>${title}</strong>
                <p style="margin: 4px 0 0; font-size: 13px;">${message}</p>
            </div>
        `;
        
        // Insert at top of form
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(alert, form.firstChild);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.style.opacity = '0';
                alert.style.transition = 'opacity 0.3s';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);
    }
};

// Initialize auth manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthManager.init());
} else {
    AuthManager.init();
}

// Export for use in other modules
window.AuthManager = AuthManager;