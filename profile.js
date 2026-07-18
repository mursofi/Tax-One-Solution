const ProfileManager = {
    init() {
        if (!SessionManager.isAuthenticated()) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            return;
        }
        
        this.loadProfile();
        this.bindEvents();
    },
    
    loadProfile() {
        const user = SessionManager.getCurrentUser();
        if (!user) return;
        
        // Populate form fields
        document.getElementById('fullName').value = user.name || '';
        document.getElementById('displayName2').value = user.displayName || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('npwp').value = user.npwp || '';
        document.getElementById('nik').value = user.nik || '';
        document.getElementById('businessType').value = user.business || '';
        
        // Update display
        document.getElementById('displayName').textContent = user.name;
        document.getElementById('displayEmail').textContent = user.email;
        document.getElementById('avatarInitial').textContent = user.name.charAt(0).toUpperCase();
        
        const badge = document.getElementById('userBadge');
        badge.textContent = user.role || 'free';
        badge.className = `badge badge-${user.role || 'free'}`;
    },
    
    bindEvents() {
        // Profile form submit
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });
        
        // Password form submit
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });
        
        // Avatar upload
        document.getElementById('avatarInput').addEventListener('change', (e) => {
            this.uploadAvatar(e.target.files[0]);
        });
    },
    
    saveProfile() {
        const updatedData = {
            name: document.getElementById('fullName').value,
            displayName: document.getElementById('displayName2').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            npwp: document.getElementById('npwp').value,
            nik: document.getElementById('nik').value,
            business: document.getElementById('businessType').value
        };
        
        // In production, send to API
        SessionManager.updateUser(updatedData);
        
        // Save to localStorage (mock database)
        const users = JSON.parse(localStorage.getItem('pajakone_users') || '[]');
        const userIndex = users.findIndex(u => u.email === SessionManager.getCurrentUser().email);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updatedData };
            localStorage.setItem('pajakone_users', JSON.stringify(users));
        }
        
        this.showNotification('✅ Profil berhasil diperbarui!', 'success');
        this.loadProfile();
    },
    
    changePassword() {
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;
        
        if (newPass.length < 8) {
            this.showNotification('❌ Password minimal 8 karakter', 'error');
            return;
        }
        
        if (newPass !== confirm) {
            this.showNotification('❌ Password konfirmasi tidak cocok', 'error');
            return;
        }
        
        // In production, verify current password with API
        // For demo, just update
        const users = JSON.parse(localStorage.getItem('pajakone_users') || '[]');
        const userIndex = users.findIndex(u => u.email === SessionManager.getCurrentUser().email);
        if (userIndex !== -1) {
            users[userIndex].password = newPass; // In production, hash this!
            localStorage.setItem('pajakone_users', JSON.stringify(users));
        }
        
        this.showNotification('✅ Password berhasil diubah', 'success');
        document.getElementById('passwordForm').reset();
    },
    
    uploadAvatar(file) {
        if (!file) return;
        
        // In production, upload to server
        const reader = new FileReader();
        reader.onload = (e) => {
            // Save to localStorage (not recommended for production)
            localStorage.setItem('pajakone_avatar', e.target.result);
            document.getElementById('avatarInitial').innerHTML = 
                `<img src="${e.target.result}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
        
        this.showNotification('✅ Foto profil berhasil diupload', 'success');
    },
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notif = document.createElement('div');
        notif.className = `notification notification-${type}`;
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? 'var(--success-500)' : type === 'error' ? 'var(--danger-500)' : 'var(--brand-600)'};
            color: white;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notif);
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
};

function confirmDeleteAccount() {
    if (confirm('⚠️ PERINGATAN KERAS!\n\nTindakan ini akan:\n- Menghapus semua data Anda\n- Membatalkan langganan\n- Tidak dapat dikembalikan\n\nKetik "HAPUS" untuk konfirmasi:')) {
        const confirmation = prompt('Ketik "HAPUS" untuk konfirmasi penghapusan akun:');
        if (confirmation === 'HAPUS') {
            // Delete account logic
            SessionManager.destroySession();
            alert('Akun Anda telah dihapus. Terima kasih telah menggunakan PajakOne.');
            window.location.href = 'index.html';
        }
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProfileManager.init());
} else {
    ProfileManager.init();
}

window.ProfileManager = ProfileManager;