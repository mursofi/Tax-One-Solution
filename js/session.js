validateCurrentPage() {
    const currentPage = this.getCurrentPage();
    
    // Daftar halaman yang TIDAK perlu login (publik)
    const publicPages = [
        'index.html',
        'login.html', 
        'register.html',
        'forgot-password.html',
        ''  // Root directory
    ];
    
    // Jika halaman publik, jangan redirect
    if (publicPages.includes(currentPage)) {
        return;
    }
    
    // Cek authentication untuk halaman protected
    if (!this.isAuthenticated()) {
        const redirectUrl = encodeURIComponent(window.location.href);
        window.location.href = `login.html?redirect=${redirectUrl}`;
        return;
    }
    
    // Jika sudah login tapi akses halaman auth, redirect ke dashboard
    const authPages = ['login.html', 'register.html', 'forgot-password.html'];
    if (this.isAuthenticated() && authPages.includes(currentPage)) {
        window.location.href = 'dashboard.html';
        return;
    }
}