/* ============================================================
   PAJAKONE MAIN JAVASCRIPT
   Version: 1.0.0
   Last Updated: 2026-07-18
   
   This file handles:
   - Theme Management (Dark/Light Mode)
   - Navigation (Mobile Menu, Scroll Effects)
   - FAQ Accordion
   - Tax Calculator (PPh UMKM, OP, Badan, PPN)
   - Scroll Reveal Animations
   - Form Validation
   - Utility Functions
   
   Dependencies: design-system.css, landing.css
   ============================================================ */


/* ============================================================
   1. UTILITY FUNCTIONS
   ============================================================ */

/**
 * Format number to Indonesian Rupiah format
 * @param {number} num - Number to format
 * @returns {string} Formatted Rupiah string
 */
const formatRupiah = (num) => {
    if (isNaN(num) || num === null || num === undefined) return 'Rp 0';
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
};

/**
 * Parse Rupiah string to number
 * @param {string} str - Rupiah string to parse
 * @returns {number} Parsed number
 */
const parseRupiah = (str) => {
    if (!str) return 0;
    const cleaned = str.toString().replace(/[^0-9]/g, '');
    return parseInt(cleaned) || 0;
};

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (func, limit = 100) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};


/* ============================================================
   2. THEME MANAGEMENT
   ============================================================ */

const ThemeManager = {
    STORAGE_KEY: 'pajakone_theme',
    
    init() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        this.setTheme(initialTheme);
        this.bindEvents();
    },
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
    },
    
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },
    
    bindEvents() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggle());
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
};


/* ============================================================
   3. NAVIGATION MANAGEMENT
   ============================================================ */

const NavigationManager = {
    init() {
        this.bindScrollEffect();
        this.bindMobileMenu();
        this.bindSmoothScroll();
    },
    
    bindScrollEffect() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        const handleScroll = throttle(() => {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 100);
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
    },
    
    bindMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (!navToggle || !mobileMenu) return;
        
        navToggle.addEventListener('click', () => {
            const isActive = mobileMenu.classList.contains('active');
            mobileMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', !isActive);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? '' : 'hidden';
        });
        
        // Close menu when clicking links
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    },
    
    bindSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#/') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });
    }
};


/* ============================================================
   4. FAQ ACCORDION
   ============================================================ */

const FAQManager = {
    init() {
        this.bindAccordion();
    },
    
    bindAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return;
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
                question.setAttribute('aria-expanded', !isActive);
            });
        });
    }
};


/* ============================================================
   5. TAX CALCULATOR
   ============================================================ */

const TaxCalculator = {
    // Tax rates and constants (2026)
    RATES: {
        PPN: 0.11,
        UMKM_FINAL: 0.005,
        BADAN: 0.22,
        FASILITAS_UMZ_OP: 500000000, // Rp 500 juta
    },
    
    // PPh OP Progresif brackets (UU HPP)
    PROGRESSIVE_BRACKETS: [
        { limit: 60000000, rate: 0.05 },
        { limit: 250000000, rate: 0.15 },
        { limit: 500000000, rate: 0.25 },
        { limit: 5000000000, rate: 0.30 },
        { limit: Infinity, rate: 0.35 }
    ],
    
    // PTKP values (2026)
    PTKP_VALUES: {
        'TK/0': 54000000,
        'K/0': 58500000,
        'K/1': 63000000,
        'K/2': 67500000,
        'K/3': 72000000
    },
    
    init() {
        this.bindFormVisibility();
        this.bindInputFormatting();
        this.bindFormSubmission();
        this.bindReset();
    },
    
    bindFormVisibility() {
        const wpInputs = document.querySelectorAll('input[name="wpType"]');
        const bebanGroup = document.getElementById('bebanGroup');
        const koreksiGroup = document.getElementById('koreksiGroup');
        const koreksiNegGroup = document.getElementById('koreksiNegGroup');
        const ptkpGroup = document.getElementById('ptkpGroup');
        const ppnGroup = document.getElementById('ppnGroup');
        const isPKP = document.getElementById('isPKP');
        
        if (!wpInputs.length) return;
        
        const updateVisibility = () => {
            const wpType = document.querySelector('input[name="wpType"]:checked').value;
            const isNonUmkm = wpType === 'op_non_umkm' || wpType === 'badan';
            
            // Show/hide fields based on WP type
            if (bebanGroup) bebanGroup.style.display = isNonUmkm ? 'block' : 'none';
            if (koreksiGroup) koreksiGroup.style.display = isNonUmkm ? 'block' : 'none';
            if (koreksiNegGroup) koreksiNegGroup.style.display = isNonUmkm ? 'block' : 'none';
            if (ptkpGroup) ptkpGroup.style.display = wpType === 'op_non_umkm' ? 'block' : 'none';
            
            // Clear values when hidden
            if (!isNonUmkm) {
                const beban = document.getElementById('beban');
                const koreksiPos = document.getElementById('koreksiPos');
                const koreksiNeg = document.getElementById('koreksiNeg');
                if (beban) beban.value = '';
                if (koreksiPos) koreksiPos.value = '';
                if (koreksiNeg) koreksiNeg.value = '';
            }
        };
        
        wpInputs.forEach(input => input.addEventListener('change', updateVisibility));
        
        if (isPKP) {
            isPKP.addEventListener('change', () => {
                if (ppnGroup) {
                    ppnGroup.style.display = isPKP.checked ? 'block' : 'none';
                }
                const ppnMasukan = document.getElementById('ppnMasukan');
                if (ppnMasukan && !isPKP.checked) ppnMasukan.value = '';
            });
        }
        
        updateVisibility(); // Initial call
    },
    
    bindInputFormatting() {
        const inputs = document.querySelectorAll('.input-prefix input');
        
        inputs.forEach(input => {
            input.addEventListener('input', debounce((e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                if (raw) {
                    e.target.value = parseInt(raw).toLocaleString('id-ID');
                }
            }, 100));
        });
    },
    
    bindFormSubmission() {
        const form = document.getElementById('taxForm');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculate();
        });
    },
    
    bindReset() {
        const resetBtn = document.getElementById('resetBtn');
        if (!resetBtn) return;
        
        resetBtn.addEventListener('click', () => {
            const form = document.getElementById('taxForm');
            if (form) form.reset();
            
            const resultContent = document.getElementById('resultContent');
            if (resultContent) {
                resultContent.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        <p>Isi form di sebelah kiri, lalu klik <strong>"Hitung Pajak"</strong> untuk melihat hasil perhitungan.</p>
                    </div>
                `;
            }
            
            // Reset visibility
            this.bindFormVisibility();
        });
    },
    
    calculate() {
        const wpType = document.querySelector('input[name="wpType"]:checked').value;
        const omzet = parseRupiah(document.getElementById('omzet').value);
        const beban = parseRupiah(document.getElementById('beban')?.value || '0');
        const koreksiPos = parseRupiah(document.getElementById('koreksiPos')?.value || '0');
        const koreksiNeg = parseRupiah(document.getElementById('koreksiNeg')?.value || '0');
        const ptkpSelect = document.getElementById('ptkp');
        const ptkp = ptkpSelect ? parseFloat(ptkpSelect.value) || 0 : 0;
        const isPKP = document.getElementById('isPKP')?.checked || false;
        const ppnMasukan = parseRupiah(document.getElementById('ppnMasukan')?.value || '0');
        
        // Validation
        if (omzet <= 0) {
            this.showToast('error', 'Input Tidak Valid', 'Mohon isi omzet terlebih dahulu.');
            return;
        }
        
        // Initialize result object
        const result = {
            wpType,
            omzet,
            pphTerutang: 0,
            ppnTerutang: 0,
            totalPajak: 0,
            breakdown: [],
            notes: []
        };
        
        // Calculate PPh based on WP type
        switch (wpType) {
            case 'umkm_op':
                this.calculateUMKMOP(result, omzet);
                break;
            case 'umkm_badan':
                this.calculateUMKMBadan(result, omzet);
                break;
            case 'op_non_umkm':
                this.calculateOPNonUMKM(result, omzet, beban, koreksiPos, koreksiNeg, ptkp);
                break;
            case 'badan':
                this.calculateBadan(result, omzet, beban, koreksiPos, koreksiNeg);
                break;
        }
        
        // Calculate PPN if PKP
        if (isPKP) {
            this.calculatePPN(result, omzet, ppnMasukan);
        }
        
        // Calculate total
        result.totalPajak = result.pphTerutang + Math.max(0, result.ppnTerutang);
        
        // Render result
        this.renderResult(result);
    },
    
    calculateUMKMOP(result, omzet) {
        const omzetKenaPajak = Math.max(0, omzet - this.RATES.FASILITAS_UMZ_OP);
        const pph = omzetKenaPajak * this.RATES.UMKM_FINAL;
        
        result.pphTerutang = pph;
        result.breakdown.push(
            { label: 'Omzet Bruto', value: formatRupiah(omzet), type: 'normal' },
            { label: 'Fasilitas OMOP (Rp 500 juta pertama)', value: '- ' + formatRupiah(Math.min(omzet, this.RATES.FASILITAS_UMZ_OP)), type: 'negative' },
            { label: 'Omzet Kena Pajak', value: formatRupiah(omzetKenaPajak), type: 'normal' },
            { label: `PPh Final (0,5% × ${formatRupiah(omzetKenaPajak)})`, value: formatRupiah(pph), type: 'total' }
        );
        
        if (omzet <= this.RATES.FASILITAS_UMZ_OP) {
            result.notes.push('Omzet Anda di bawah Rp 500 juta — <strong>GRATIS PPh Final</strong> (fasilitas OMOP).');
        }
        result.notes.push('Dasar hukum: <strong>PP 55 Tahun 2022</strong> — PPh Final UMKM 0,5%.');
    },
    
    calculateUMKMBadan(result, omzet) {
        const pph = omzet * this.RATES.UMKM_FINAL;
        
        result.pphTerutang = pph;
        result.breakdown.push(
            { label: 'Omzet Bruto', value: formatRupiah(omzet), type: 'normal' },
            { label: `PPh Final (0,5% × ${formatRupiah(omzet)})`, value: formatRupiah(pph), type: 'total' }
        );
        result.notes.push('Dasar hukum: <strong>PP 55 Tahun 2022</strong>. Badan usaha TIDAK mendapat fasilitas Rp 500 juta.');
    },
    
    calculateOPNonUMKM(result, omzet, beban, koreksiPos, koreksiNeg, ptkp) {
        const labaKomersial = omzet - beban;
        const labaFiskal = labaKomersial + koreksiPos - koreksiNeg;
        const pkp = Math.max(0, labaFiskal - ptkp);
        const { total: pph, breakdown: layerBreakdown } = this.calculateProgressiveTax(pkp);
        
        result.pphTerutang = pph;
        
        result.breakdown.push(
            { label: 'Omzet Bruto', value: formatRupiah(omzet), type: 'normal' },
            { label: 'Total Beban Usaha (3M)', value: '- ' + formatRupiah(beban), type: 'negative' },
            { label: 'Laba Komersial', value: formatRupiah(labaKomersial), type: 'normal' },
            { label: 'Koreksi Fiskal Positif', value: '+ ' + formatRupiah(koreksiPos), type: 'danger' },
            { label: 'Koreksi Fiskal Negatif', value: '- ' + formatRupiah(koreksiNeg), type: 'negative' },
            { label: 'Laba Fiskal', value: formatRupiah(labaFiskal), type: 'normal' },
            { label: 'PTKP', value: '- ' + formatRupiah(ptkp), type: 'negative' },
            { label: 'Penghasilan Kena Pajak (PKP)', value: formatRupiah(pkp), type: 'normal' }
        );
        
        if (layerBreakdown.length > 0) {
            result.breakdown.push({ label: 'Rincian Tarif Progresif', value: '', type: 'normal' });
            layerBreakdown.forEach(layer => {
                result.breakdown.push({
                    label: `   ${layer.layer}`,
                    value: formatRupiah(layer.amount),
                    type: 'normal'
                });
            });
        }
        
        result.breakdown.push({ label: 'PPh Terutang', value: formatRupiah(pph), type: 'total' });
        result.notes.push('Dasar hukum: <strong>UU HPP (UU No. 7/2021)</strong> — Tarif progresif 5%-35%.');
    },
    
    calculateBadan(result, omzet, beban, koreksiPos, koreksiNeg) {
        const labaKomersial = omzet - beban;
        const labaFiskal = labaKomersial + koreksiPos - koreksiNeg;
        const pph = Math.max(0, labaFiskal) * this.RATES.BADAN;
        
        result.pphTerutang = pph;
        
        result.breakdown.push(
            { label: 'Omzet Bruto', value: formatRupiah(omzet), type: 'normal' },
            { label: 'Total Beban Usaha (3M)', value: '- ' + formatRupiah(beban), type: 'negative' },
            { label: 'Laba Komersial', value: formatRupiah(labaKomersial), type: 'normal' },
            { label: 'Koreksi Fiskal Positif', value: '+ ' + formatRupiah(koreksiPos), type: 'danger' },
            { label: 'Koreksi Fiskal Negatif', value: '- ' + formatRupiah(koreksiNeg), type: 'negative' },
            { label: 'Laba Fiskal', value: formatRupiah(labaFiskal), type: 'normal' },
            { label: `PPh Badan (22% × ${formatRupiah(Math.max(0, labaFiskal))})`, value: formatRupiah(pph), type: 'total' }
        );
        
        result.notes.push('Dasar hukum: <strong>UU HPP</strong> — Tarif PPh Badan umum 22%.');
    },
    
    calculatePPN(result, omzet, ppnMasukan) {
        // Assume omzet includes PPN
        const dpp = omzet / (1 + this.RATES.PPN);
        const ppnKeluaran = dpp * this.RATES.PPN;
        const ppnTerutang = ppnKeluaran - ppnMasukan;
        
        result.ppnTerutang = Math.max(0, ppnTerutang);
        
        result.breakdown.push(
            { label: 'Perhitungan PPN', value: '', type: 'normal' },
            { label: 'DPP (Dasar Pengenaan Pajak)', value: formatRupiah(dpp), type: 'normal' },
            { label: `PPN Keluaran (11% × DPP)`, value: formatRupiah(ppnKeluaran), type: 'normal' },
            { label: 'PPN Masukan (dikreditkan)', value: '- ' + formatRupiah(ppnMasukan), type: 'negative' },
            { label: 'PPN Kurang/Lebih Bayar', value: formatRupiah(Math.max(0, ppnTerutang)), type: 'total' }
        );
        
        result.notes.push('Tarif PPN: <strong>11%</strong> (berlaku sejak April 2022, dapat naik menjadi 12% sesuai UU HPP).');
    },
    
    calculateProgressiveTax(pkp) {
        let pajak = 0;
        let sisaPkp = pkp;
        let prevLimit = 0;
        const breakdown = [];
        
        for (const bracket of this.PROGRESSIVE_BRACKETS) {
            const layerSize = bracket.limit - prevLimit;
            const taxableInLayer = Math.min(sisaPkp, layerSize);
            
            if (taxableInLayer > 0) {
                const taxInLayer = taxableInLayer * bracket.rate;
                pajak += taxInLayer;
                breakdown.push({
                    layer: `${(bracket.rate * 100).toFixed(0)}% × ${formatRupiah(taxableInLayer)}`,
                    amount: taxInLayer
                });
                sisaPkp -= taxableInLayer;
            }
            
            prevLimit = bracket.limit;
            if (sisaPkp <= 0) break;
        }
        
        return { total: pajak, breakdown };
    },
    
    renderResult(result) {
        const container = document.getElementById('resultContent');
        if (!container) return;
        
        const wpLabels = {
            'umkm_op': 'UMKM Orang Pribadi',
            'umkm_badan': 'UMKM Badan Usaha',
            'op_non_umkm': 'OP Non-UMKM (Progresif)',
            'badan': 'Badan Usaha (PT/CV)'
        };
        
        let html = `
            <div class="result-summary">
                <div class="label">Total Pajak Terutang (${wpLabels[result.wpType]})</div>
                <div class="value">${formatRupiah(result.totalPajak)}</div>
                <div class="sublabel">PPh: ${formatRupiah(result.pphTerutang)}${result.ppnTerutang > 0 ? ' + PPN: ' + formatRupiah(result.ppnTerutang) : ''}</div>
            </div>
            <div class="result-breakdown">
        `;
        
        result.breakdown.forEach(row => {
            const typeClass = row.type === 'total' ? 'total' :
                             row.type === 'negative' ? 'negative' :
                             row.type === 'danger' ? 'danger' : '';
            html += `
                <div class="result-row ${typeClass}">
                    <span class="label">${row.label}</span>
                    <span class="value">${row.value}</span>
                </div>
            `;
        });
        
        html += '</div>';
        
        if (result.notes.length > 0) {
            html += '<div class="result-note">';
            html += '<strong>Catatan:</strong><br>';
            result.notes.forEach(note => {
                html += `• ${note}<br>`;
            });
            html += '</div>';
        }
        
        html += `
            <div class="result-actions">
                <button class="btn-export" onclick="TaxCalculator.exportResult()">Export CSV</button>
                <button class="btn-print" onclick="window.print()">Cetak</button>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Store for export
        window.lastTaxResult = result;
        
        // Show success toast
        this.showToast('success', 'Perhitungan Selesai', 'Hasil perhitungan pajak Anda sudah siap.');
    },
    
    exportResult() {
        const result = window.lastTaxResult;
        if (!result) {
            this.showToast('error', 'Tidak Ada Data', 'Silakan hitung pajak terlebih dahulu.');
            return;
        }
        
        let csv = 'LAPORAN PERHITUNGAN PAJAK - PajakOne\n';
        csv += `Tanggal,${new Date().toLocaleString('id-ID')}\n\n`;
        csv += 'Item,Nilai\n';
        
        result.breakdown.forEach(row => {
            if (row.value) {
                csv += `"${row.label}","${row.value}"\n`;
            }
        });
        
        csv += `\nTOTAL PAJAK TERUTANG,"${formatRupiah(result.totalPajak)}"\n`;
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `perhitungan-pajak-${Date.now()}.csv`;
        link.click();
        
        this.showToast('success', 'Export Berhasil', 'File CSV berhasil diunduh.');
    },
    
    showToast(type, title, message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <strong>${title}</strong>
                <span>${message}</span>
            </div>
        `;
        
        // Style inline for simplicity
        toast.style.cssText = `
            position: fixed;
            top: 88px;
            right: 24px;
            background: var(--bg-elevated);
            border: 1px solid var(--border-default);
            border-left: 4px solid ${type === 'success' ? 'var(--success-500)' : type === 'error' ? 'var(--danger-500)' : 'var(--brand-600)'};
            border-radius: 10px;
            padding: 16px 20px;
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};


/* ============================================================
   6. SCROLL REVEAL ANIMATIONS
   ============================================================ */

const ScrollRevealManager = {
    observer: null,
    
    init() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            document.querySelectorAll('.reveal').forEach(el => {
                el.classList.add('visible');
            });
            return;
        }
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('.reveal').forEach(el => {
            this.observer.observe(el);
        });
    },
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
};


/* ============================================================
   7. PRICING BUTTONS
   ============================================================ */

const PricingManager = {
    init() {
        this.bindPlanButtons();
    },
    
    bindPlanButtons() {
        document.querySelectorAll('[data-plan]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const plan = btn.dataset.plan;
                const planNames = {
                    'starter': 'Starter (Rp 299rb/bulan)',
                    'professional': 'Professional (Rp 799rb/bulan)',
                    'enterprise': 'Enterprise (Rp 2,5jt/bulan)'
                };
                
                // Show coming soon message
                alert(`Terima kasih atas minat Anda pada paket ${planNames[plan]}!\n\nFitur berlangganan akan segera tersedia. Silakan hubungi kami di info@pajakone.id untuk informasi lebih lanjut.`);
            });
        });
    }
};


/* ============================================================
   8. APPLICATION INITIALIZATION
   ============================================================ */

/**
 * Initialize all modules when DOM is ready
 */
const App = {
    init() {
        console.log('🚀 PajakOne Application Initializing...');
        
        // Initialize all managers
        ThemeManager.init();
        NavigationManager.init();
        FAQManager.init();
        TaxCalculator.init();
        ScrollRevealManager.init();
        PricingManager.init();
        
        console.log('✅ PajakOne Application Ready');
    }
};

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}


/* ============================================================
   9. GLOBAL ERROR HANDLER
   ============================================================ */

window.addEventListener('error', (e) => {
    console.error('Global Error:', e.error);
    // In production, you would send this to an error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});


/* ============================================================
   END OF MAIN JAVASCRIPT
   ============================================================ */