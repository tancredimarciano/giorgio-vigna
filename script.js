// Giorgio Vigna website - Secure implementation with best practices

(function() {
    'use strict';
    
    // DOM Elements - cached for performance with null checks
    const elements = {
        navToggle: document.querySelector('.nav-toggle'),
        navMenu: document.querySelector('.nav-menu'),
        navLinks: document.querySelectorAll('.nav-link'),
        langButtons: document.querySelectorAll('.lang-btn'),
        galleryItems: document.querySelectorAll('.gallery-item'),
        lightbox: document.getElementById('lightbox'),
        lightboxImg: document.getElementById('lightbox-img'),
        lightboxClose: document.querySelector('.lightbox-close'),
        lightboxCaption: document.querySelector('.lightbox-caption'),
        heroTitle: document.querySelector('.hero-title'),
        navBrand: document.querySelector('.nav-brand'),
        pageTitle: document.querySelector('.page-title'),
        biographyHome: document.getElementById('biografia-home')
    };
    
    // Validate critical elements exist
    function validateElements() {
        const criticalElements = ['navToggle', 'navMenu'];
        for (const key of criticalElements) {
            if (!elements[key]) {
                console.warn(`Critical element missing: ${key}`);
            }
        }
    }
    
    // State
    let currentLang = 'it';
    const VALID_LANGUAGES = ['it', 'en'];
    const STORAGE_KEY = 'giorgio-vigna-lang';

    // Language translations - immutable configuration
    const translations = Object.freeze({
        it: Object.freeze({
            nav: Object.freeze(['Opere', 'Musei', 'Esposizioni', 'Rassegna Stampa', 'Collaborazioni', 'Pubblicazioni', 'Cataloghi']),
            biography: Object.freeze({
                text1: 'Giorgio Vigna è un artista che esplora i confini tra realtà e immaginazione attraverso sculture, gioielli, installazioni e lavori su carta. La sua ricerca è una costante indagine sulla trasformazione della materia, in cui gli elementi primari della natura – terra, acqua, fuoco, aria – vengono esplorati e trasfigurati fino a rivelarne possibilità nascoste.',
                text2: 'Utilizza materiali diversi – vetro, metallo, carta, inchiostro – sperimentandone i limiti e trasformandoli in forme inedite: paesaggi fluidi negli acquatipi su carta, solidificazioni immaginarie del vetro, sculture che evocano geodi e minerali, gioielli che diventano vere e proprie sculture da indossare. In ciascun ambito mantiene una cifra rigorosa e coerente, in cui opposti come micro e macro, solido e liquido, povero e prezioso, memoria e invenzione si incontrano e si illuminano reciprocamente.',
                text3: 'Per Vigna fare arte significa attraversare confini, sperimentare oltre il noto, usare la materia come strumento per dare forma a un\'essenza primordiale e simbolica, capace di raccontare l\'origine e il centro stesso della vita.'
            }),
            titles: Object.freeze({
                biografia: 'Biografia',
                opere: 'Opere', 
                musei: 'Musei',
                esposizioni: 'Esposizioni',
                'rassegna-stampa': 'Rassegna Stampa',
                collaborazioni: 'Collaborazioni',
                pubblicazioni: 'Pubblicazioni',
                cataloghi: 'Cataloghi'
            }),
            exhibitions: Object.freeze({
                personal: 'Mostre Personali',
                group: 'Mostre Collettive'
            }),
            footer: Object.freeze({
                country: 'Italia'
            })
        }),
        en: Object.freeze({
            nav: Object.freeze(['Works', 'Museums', 'Exhibitions', 'Press Review', 'Collaborations', 'Publications', 'Catalogues']),
            biography: Object.freeze({
                text1: 'Giorgio Vigna is an artist who explores the boundaries between reality and imagination through sculptures, jewelry, installations and works on paper. His research is a constant investigation into the transformation of matter, in which the primary elements of nature – earth, water, fire, air – are explored and transfigured to reveal hidden possibilities.',
                text2: 'He uses different materials – glass, metal, paper, ink – experimenting with their limits and transforming them into unprecedented forms: fluid landscapes in watercolors on paper, imaginary solidifications of glass, sculptures that evoke geodes and minerals, jewelry that becomes true sculptures to wear. In each field he maintains a rigorous and coherent style, in which opposites such as micro and macro, solid and liquid, poor and precious, memory and invention meet and illuminate each other.',
                text3: 'For Vigna, making art means crossing boundaries, experimenting beyond the known, using matter as an instrument to give form to a primordial and symbolic essence, capable of telling the origin and the very center of life.'
            }),
            titles: Object.freeze({
                biografia: 'Biography',
                opere: 'Works',
                musei: 'Museums', 
                esposizioni: 'Exhibitions',
                'rassegna-stampa': 'Press Review',
                collaborazioni: 'Collaborations',
                pubblicazioni: 'Publications',
                cataloghi: 'Catalogues'
            }),
            exhibitions: Object.freeze({
                personal: 'Personal Exhibitions',
                group: 'Group Exhibitions'
            }),
            footer: Object.freeze({
                country: 'Italy'
            }),
            museums: Object.freeze({
                intro: 'Giorgio Vigna\'s works are present in the permanent collections of important international museum institutions:',
                locations: Object.freeze({
                    'Venezia (Italia)': 'Venice (Italy)',
                    'Verona (Italia)': 'Verona (Italy)', 
                    'Murano, Venezia (Italia)': 'Murano, Venice (Italy)',
                    'Firenze (Italia)': 'Florence (Italy)',
                    'Torino (Italia)': 'Turin (Italy)',
                    'Parigi (Francia)': 'Paris (France)',
                    'Helsinki (Finlandia)': 'Helsinki (Finland)',
                    'Castello Sforzesco, Milano (Italia)': 'Castello Sforzesco, Milan (Italy)',
                    'Ginevra (Svizzera)': 'Geneva (Switzerland)',
                    'San Felice del Benaco (BS, Italia)': 'San Felice del Benaco (BS, Italy)'
                })
            })
        })
    });
    
    // Utility functions
    function isValidLanguage(lang) {
        return typeof lang === 'string' && VALID_LANGUAGES.includes(lang);
    }
    
    function sanitizeText(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function getCurrentPage() {
        try {
            const path = window.location.pathname;
            const page = path.split('/').pop().replace('.html', '');
            return page || 'index';
        } catch (error) {
            console.warn('Error getting current page:', encodeURIComponent(error.message));
            return 'index';
        }
    }

    // Language Switch with validation
    function initLanguageSwitch() {
        // Re-query elements since navbar was loaded dynamically
        const langButtons = document.querySelectorAll('.lang-btn');
        if (!langButtons || langButtons.length === 0) return;
        
        langButtons.forEach(btn => {
            btn.addEventListener('click', handleLanguageSwitch);
        });
    }
    
    function handleLanguageSwitch(event) {
        try {
            event.preventDefault();
            event.stopPropagation();
            const lang = event.target.dataset.lang;
            if (isValidLanguage(lang) && lang !== currentLang) {
                switchLanguage(lang);
            }
        } catch (error) {
            console.error('Error switching language:', encodeURIComponent(error.message));
        }
    }

    function updateContent(lang) {
        // Update nav links - re-query since navbar is loaded dynamically
        const navLinks = document.querySelectorAll('.nav-link');
        if (navLinks && translations[lang].nav) {
            navLinks.forEach((link, index) => {
                if (index < translations[lang].nav.length) {
                    const text = translations[lang].nav[index];
                    if (text) {
                        link.textContent = sanitizeText(text);
                    }
                }
            });
        }
        
        // Update biography content
        updateBiographyContent();
        
        // Update page title
        if (elements.pageTitle) {
            const currentPage = getCurrentPage();
            const title = translations[lang].titles?.[currentPage];
            if (title) {
                elements.pageTitle.textContent = sanitizeText(title);
            }
        }
        
        // Update footer
        const footerCountry = document.querySelector('.footer-country');
        if (footerCountry && translations[lang].footer) {
            footerCountry.textContent = sanitizeText(translations[lang].footer.country);
        }
        
        // Update museums page
        if (lang === 'en' && translations[lang].museums) {
            const museumIntro = document.querySelector('[data-original="Le opere di Giorgio Vigna sono presenti nelle collezioni permanenti di importanti istituzioni museali internazionali:"]');
            if (museumIntro) {
                museumIntro.textContent = sanitizeText(translations[lang].museums.intro);
            }
            
            document.querySelectorAll('[data-original]').forEach(element => {
                const original = element.dataset.original;
                if (translations[lang].museums.locations && translations[lang].museums.locations[original]) {
                    element.textContent = sanitizeText(translations[lang].museums.locations[original]);
                }
            });
        } else if (lang === 'it') {
            // Restore Italian text
            document.querySelectorAll('[data-original]').forEach(element => {
                element.textContent = sanitizeText(element.dataset.original);
            });
        }
        
        // Update exhibition tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabBtns.length > 0 && translations[lang].exhibitions) {
            tabBtns.forEach(btn => {
                const tabType = btn.dataset.tab;
                if (tabType === 'personali' && translations[lang].exhibitions.personal) {
                    btn.textContent = sanitizeText(translations[lang].exhibitions.personal);
                } else if (tabType === 'collettive' && translations[lang].exhibitions.group) {
                    btn.textContent = sanitizeText(translations[lang].exhibitions.group);
                }
            });
        }
    }
    
    function switchLanguage(lang) {
        try {
            // Validate input
            if (!isValidLanguage(lang)) {
                console.warn('Invalid language code:', lang);
                return;
            }
            
            // Check if translations exist
            if (!translations[lang]) {
                console.warn('No translations found for language:', lang);
                return;
            }
            
            currentLang = lang;
            document.documentElement.lang = lang;
            
            // Save language preference
            try {
                localStorage.setItem(STORAGE_KEY, lang);
            } catch (e) {
                console.warn('Could not save language preference:', e);
            }
            
            // Update language buttons (both desktop and mobile)
            const langButtons = document.querySelectorAll('.lang-btn');
            const langSwitches = document.querySelectorAll('.language-switch, .language-switch-mobile');
            
            langButtons.forEach(btn => {
                if (btn.dataset.lang === lang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Animate the sliding pill
            langSwitches.forEach(switchEl => {
                if (lang === 'en') {
                    switchEl.classList.add('en');
                } else {
                    switchEl.classList.remove('en');
                }
            });
            
            updateContent(lang);
            
            // Update URL parameter
            const url = new URL(window.location);
            if (lang === 'en') {
                url.searchParams.set('lang', 'en');
            } else {
                url.searchParams.delete('lang');
            }
            window.history.replaceState({}, '', url);
        } catch (error) {
            console.error('Error in switchLanguage:', error);
        }
    }



    // Mobile Navigation
    function initMobileNavigation() {
        // Re-query elements since navbar was loaded dynamically
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (!navToggle || !navMenu) return;
        
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Add click handler to nav links with smooth transition
        if (navLinks) {
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    
                    // Add visual feedback
                    link.classList.add('clicked');
                    
                    // Close menu with original slide animation
                    setTimeout(() => {
                        navToggle.classList.remove('active');
                        navMenu.classList.remove('active');
                        document.body.style.overflow = '';
                        
                        // Navigate after menu slides out
                        setTimeout(() => {
                            window.location.href = href;
                        }, 300);
                    }, 150);
                });
            });
        }
    }
    
    function handleNavToggle() {
        try {
            elements.navToggle.classList.toggle('active');
            elements.navMenu.classList.toggle('active');
            document.body.style.overflow = elements.navMenu.classList.contains('active') ? 'hidden' : '';
        } catch (error) {
            console.error('Error toggling navigation:', error);
        }
    }
    
    function closeMobileMenu() {
        try {
            if (elements.navToggle && elements.navMenu) {
                elements.navToggle.classList.remove('active');
                elements.navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        } catch (error) {
            console.error('Error closing mobile menu:', error);
        }
    }
    
    // Gallery Lightbox with security fixes
    function initGalleryLightbox() {
        if (!elements.galleryItems) return;
        if (!elements.lightbox) {
            console.warn('Lightbox not found, skipping gallery initialization');
            return;
        }
        
        elements.galleryItems.forEach(item => {
            item.addEventListener('click', handleGalleryClick);
        });
    }
    
    function handleGalleryClick(event) {
        try {
            const item = event.currentTarget;
            const img = item.querySelector('img');
            const overlay = item.querySelector('.gallery-overlay');
            
            if (!img || !overlay || !elements.lightboxImg || !elements.lightboxCaption) {
                return;
            }
            
            const title = overlay.querySelector('h3')?.textContent || '';
            const description = overlay.querySelector('p')?.textContent || '';
            
            // Validate image source
            if (!img.src || !isValidImageUrl(img.src)) {
                console.warn('Invalid image source');
                return;
            }
            
            elements.lightboxImg.src = sanitizeText(img.src);
            elements.lightboxImg.alt = sanitizeText(img.alt || '');
            
            // Use safe DOM manipulation instead of innerHTML
            elements.lightboxCaption.textContent = '';
            const titleEl = document.createElement('h3');
            titleEl.textContent = sanitizeText(title);
            const descEl = document.createElement('p');
            descEl.textContent = sanitizeText(description);
            
            elements.lightboxCaption.appendChild(titleEl);
            elements.lightboxCaption.appendChild(descEl);
            
            elements.lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Error opening lightbox:', error);
        }
    }
    
    function isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
        } catch {
            return false;
        }
    }
    
    function isValidImageUrl(url) {
        if (!isValidUrl(url)) return false;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const urlLower = url.toLowerCase();
        return imageExtensions.some(ext => urlLower.includes(ext)) || url.includes('unsplash.com');
    }

    
    // Lightbox controls
    function initLightboxControls() {
        if (!elements.lightbox) return;
        
        if (elements.lightboxClose) {
            elements.lightboxClose.addEventListener('click', closeLightbox);
        }
        
        elements.lightbox.addEventListener('click', handleLightboxClick);
    }
    
    function closeLightbox() {
        try {
            if (elements.lightbox) {
                elements.lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        } catch (error) {
            console.error('Error closing lightbox:', error);
        }
    }
    
    function handleLightboxClick(event) {
        if (event.target === elements.lightbox) {
            closeLightbox();
        }
    }
    
    function handleKeydown(event) {
        if (event.key === 'Escape' && elements.lightbox?.classList.contains('active')) {
            closeLightbox();
        }
    }

    
    // Cleanup function for event listeners
    function cleanup() {
        document.removeEventListener('keydown', handleKeydown);
        // Additional cleanup can be added here if needed
    }
    
    // Navigation functionality
    function initNavigation() {
        const navBrand = document.querySelector('.nav-brand');
        if (navBrand) {
            navBrand.addEventListener('click', handleNavBrandClick);
        }
    }
    
    function handleNavBrandClick(event) {
        event.preventDefault();
        // Preserve language when navigating to home
        const langParam = currentLang !== 'it' ? `?lang=${currentLang}` : '';
        window.location.href = `index.html${langParam}`;
    }
    
    function updateBiographyContent() {
        try {
            if (!elements.biographyHome || !translations[currentLang]?.biography) return;
            
            const biographyContent = elements.biographyHome.querySelector('.biography-content');
            if (!biographyContent) return;
            
            const bio = translations[currentLang].biography;
            const paragraphs = biographyContent.querySelectorAll('p');
            
            if (paragraphs.length >= 3) {
                paragraphs[0].textContent = sanitizeText(bio.text1);
                paragraphs[1].textContent = sanitizeText(bio.text2);
                paragraphs[2].textContent = sanitizeText(bio.text3);
            }
        } catch (error) {
            console.error('Error updating biography content:', error);
        }
    }
    
    // Get saved language preference or from URL
    function getSavedLanguage() {
        try {
            // Check URL parameter first
            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('lang');
            if (isValidLanguage(urlLang)) {
                return urlLang;
            }
            
            // Fallback to localStorage
            const saved = localStorage.getItem(STORAGE_KEY);
            return isValidLanguage(saved) ? saved : 'it';
        } catch (e) {
            console.warn('Could not load language preference:', e);
            return 'it';
        }
    }
    

    


    // Initialize components that don't need navbar
    function initCore() {
        try {
            validateElements();
            
            // Set initial language from saved preference
            const savedLang = getSavedLanguage();
            currentLang = savedLang;
            document.documentElement.lang = savedLang;
            
            initGalleryLightbox();
            initLightboxControls();
            
            // Add global event listeners
            document.addEventListener('keydown', handleKeydown);
            
            // Expose cleanup function for potential use
            window.GiorgioVignaCleanup = cleanup;
        } catch (error) {
            console.error('Error during core initialization:', encodeURIComponent(error.message));
        }
    }
    
    // Mobile language switch drag functionality
    function initMobileDrag() {
        const mobileSwitch = document.querySelector('.language-switch-mobile');
        if (!mobileSwitch) return;
        
        let isDragging = false;
        let startX = 0;
        let currentLang = getSavedLanguage();
        
        function handleStart(e) {
            isDragging = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            mobileSwitch.classList.add('dragging');
        }
        
        function handleMove(e) {
            if (!isDragging) return;
            e.preventDefault();
        }
        
        function handleEnd(e) {
            if (!isDragging) return;
            isDragging = false;
            mobileSwitch.classList.remove('dragging');
            
            const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const diff = endX - startX;
            
            if (Math.abs(diff) > 20) {
                const newLang = (currentLang === 'it' && diff > 0) || (currentLang === 'en' && diff < 0) 
                    ? (currentLang === 'it' ? 'en' : 'it') 
                    : currentLang;
                
                if (newLang !== currentLang) {
                    switchLanguage(newLang);
                    currentLang = newLang;
                }
            }
        }
        
        mobileSwitch.addEventListener('touchstart', handleStart, { passive: false });
        mobileSwitch.addEventListener('touchmove', handleMove, { passive: false });
        mobileSwitch.addEventListener('touchend', handleEnd, { passive: false });
        mobileSwitch.addEventListener('mousedown', handleStart);
        mobileSwitch.addEventListener('mousemove', handleMove);
        mobileSwitch.addEventListener('mouseup', handleEnd);
    }

    // Initialize navbar-dependent components
    function initNavbar() {
        try {
            initLanguageSwitch();
            initMobileNavigation();
            initNavigation();
            initMobileDrag();
            
            // Apply language content
            const savedLang = getSavedLanguage();
            updateContent(savedLang);
        } catch (error) {
            console.error('Error during navbar initialization:', encodeURIComponent(error.message));
        }
    }
    
    // Initialize when DOM is ready
    function init() {
        initCore();
        initNavbar();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
    
    // Add loaded class when everything is loaded
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        // Ensure admin state is properly initialized
        initAdminState();
    }, { once: true });
    
})();

// Global admin functions
let isLoggedIn = false;

function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    const loggedInForm = document.getElementById('loggedInForm');
    
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
    } else {
        if (isLoggedIn) {
            loginForm.style.display = 'none';
            loggedInForm.style.display = 'block';
        } else {
            loginForm.style.display = 'block';
            loggedInForm.style.display = 'none';
        }
        panel.classList.add('active');
    }
}

function adminLogin() {
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    const errorMsg = document.getElementById('loginError');
    
    console.log('Login attempt:', user, pass);
    
    if (user === 'admin' && pass === 'admin') {
        console.log('Login successful');
        isLoggedIn = true;
        localStorage.setItem('admin-logged-in', 'true');
        
        const adminLock = document.querySelector('.admin-lock');
        if (adminLock) adminLock.classList.add('unlocked');
        
        let editControls = document.getElementById('editControls');
        console.log('Edit controls found:', editControls);
        
        if (!editControls) {
            // Create edit controls if they don't exist
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) {
                editControls = document.createElement('span');
                editControls.id = 'editControls';
                editControls.className = 'edit-controls';
                editControls.style.display = 'inline-block';
                editControls.style.marginLeft = '24px';
                editControls.style.verticalAlign = 'middle';
                editControls.innerHTML = `
                    <button class="edit-btn" id="editBtn" title="Modifica" style="background: none; border: none; cursor: pointer; padding: 12px; border-radius: 50%; opacity: 0.7; transition: opacity 0.3s ease;">
                        <img class="edit-icon" src="images/icon/pencil.svg" alt="Modifica" style="width: 20px; height: 20px;">
                    </button>
                `;
                
                // Add click event listener
                const editBtn = editControls.querySelector('#editBtn');
                console.log('Edit button found:', editBtn);
                if (editBtn) {
                    // Add hover effects
                    editBtn.addEventListener('mouseenter', function() {
                        this.style.opacity = '1';
                        this.style.backgroundColor = 'rgba(0,0,0,0.05)';
                    });
                    editBtn.addEventListener('mouseleave', function() {
                        this.style.opacity = '0.7';
                        this.style.backgroundColor = 'transparent';
                    });
                    
                    editBtn.addEventListener('click', function(e) {
                        console.log('Edit button clicked!');
                        e.preventDefault();
                        e.stopPropagation();
                        toggleEditMode();
                    });
                    console.log('Click listener added to edit button');
                }
                pageTitle.appendChild(editControls);
                console.log('Edit controls created and added');
            }
        } else {
            editControls.style.display = 'inline-block';
            console.log('Edit controls made visible after login');
        }
        
        document.getElementById('adminPanel').classList.remove('active');
        document.getElementById('adminUser').value = '';
        document.getElementById('adminPass').value = '';
        if (errorMsg) errorMsg.style.display = 'none';
        
        // Force check admin status on current page
        if (typeof checkAdminStatus === 'function') {
            checkAdminStatus();
        }
        
        // Add global toggleEditMode function if it doesn't exist
        if (typeof window.toggleEditMode !== 'function') {
            window.toggleEditMode = function() {
                console.log('toggleEditMode called!');
                const editControls = document.getElementById('editControls');
                console.log('editControls found:', editControls);
                if (!editControls) {
                    console.log('No editControls found, returning');
                    return;
                }
                
                let editActions = document.getElementById('editActions');
                if (!editActions) {
                    // Create edit actions menu
                    editActions = document.createElement('div');
                    editActions.id = 'editActions';
                    editActions.style.cssText = `
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        display: flex;
                        gap: 8px;
                        z-index: 1000;
                        margin-top: 10px;
                    `;
                    
                    // Add arrow pointing up to the pencil
                    editActions.innerHTML = `
                        <div style="position: absolute; top: -12px; right: 25px; width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-bottom: 12px solid #ddd; z-index: 999;"></div>
                        <div style="position: absolute; top: -10px; right: 27px; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 10px solid white; z-index: 1000;"></div>
                        <button onclick="addMuseum()" title="Aggiungi" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 4px; margin-top: 4px;">
                            <span style="font-size: 16px;">➕</span>
                        </button>
                        <button onclick="toggleDeleteMode()" title="Elimina" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 4px; margin-top: 4px;">
                            <span style="font-size: 16px;">🗑️</span>
                        </button>
                        <button onclick="toggleSortMode()" title="Riordina" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 4px; margin-top: 4px;">
                            <span style="font-size: 16px;">↕️</span>
                        </button>
                    `;
                    
                    editActions.innerHTML = `
                        <button onclick="addMuseum()" title="Aggiungi" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 4px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                            <img src="images/icon/plus.svg" alt="Aggiungi" style="width: 16px; height: 16px;">
                        </button>
                        <button onclick="toggleDeleteMode()" title="Elimina" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 4px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                            <img src="images/icon/trash.svg" alt="Elimina" style="width: 16px; height: 16px;">
                        </button>
                        <button onclick="toggleSortMode()" title="Riordina" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 4px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                            <img src="images/icon/list.number.svg" alt="Riordina" style="width: 16px; height: 16px;">
                        </button>
                    `;
                    
                    editControls.style.position = 'relative';
                    editControls.appendChild(editActions);
                } else {
                    // Toggle visibility
                    editActions.style.display = editActions.style.display === 'none' ? 'flex' : 'none';
                }
            };
        }
        
        // Add museum management functions
        if (typeof window.addMuseum !== 'function') {
            window.addMuseum = function() {
                const name = prompt('Nome del museo:');
                const location = prompt('Città e paese:');
                
                if (name && location) {
                    const museumsList = document.querySelector('.museums-list');
                    if (museumsList) {
                        const newMuseum = document.createElement('div');
                        newMuseum.className = 'museum-item';
                        newMuseum.innerHTML = `
                            <h3>${name}</h3>
                            <p>${location}</p>
                        `;
                        museumsList.appendChild(newMuseum);
                        alert('Museo aggiunto con successo!');
                    }
                }
            };
        }
        
        if (typeof window.toggleDeleteMode !== 'function') {
            window.toggleDeleteMode = function() {
                const museumItems = document.querySelectorAll('.museum-item');
                const isDeleteMode = document.body.classList.contains('delete-mode');
                
                if (!isDeleteMode) {
                    // Activate delete mode
                    document.body.classList.add('delete-mode');
                    museumItems.forEach(item => {
                        item.style.cursor = 'pointer';
                        item.style.border = '2px solid red';
                        item.title = 'Clicca per eliminare';
                        
                        item.addEventListener('click', function deleteMuseum() {
                            if (confirm('Sei sicuro di voler eliminare questo museo?')) {
                                item.remove();
                            }
                        });
                    });
                    alert('Modalità eliminazione attivata. Clicca sui musei per eliminarli.');
                } else {
                    // Deactivate delete mode
                    document.body.classList.remove('delete-mode');
                    museumItems.forEach(item => {
                        item.style.cursor = '';
                        item.style.border = '';
                        item.title = '';
                    });
                    alert('Modalità eliminazione disattivata.');
                }
            };
        }
        
        if (typeof window.toggleSortMode !== 'function') {
            window.toggleSortMode = function() {
                const museumsList = document.querySelector('.museums-list');
                if (!museumsList) return;
                
                const museums = Array.from(museumsList.children);
                const isSortMode = document.body.classList.contains('sort-mode');
                
                if (!isSortMode) {
                    // Activate sort mode
                    document.body.classList.add('sort-mode');
                    museums.forEach((item, index) => {
                        item.style.cursor = 'move';
                        item.style.border = '2px solid blue';
                        item.title = 'Trascina per riordinare';
                        item.draggable = true;
                        
                        item.addEventListener('dragstart', function(e) {
                            e.dataTransfer.setData('text/plain', index);
                        });
                        
                        item.addEventListener('dragover', function(e) {
                            e.preventDefault();
                        });
                        
                        item.addEventListener('drop', function(e) {
                            e.preventDefault();
                            const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                            const targetIndex = Array.from(museumsList.children).indexOf(this);
                            
                            if (draggedIndex !== targetIndex) {
                                const draggedItem = museums[draggedIndex];
                                if (targetIndex > draggedIndex) {
                                    museumsList.insertBefore(draggedItem, this.nextSibling);
                                } else {
                                    museumsList.insertBefore(draggedItem, this);
                                }
                            }
                        });
                    });
                    alert('Modalità riordino attivata. Trascina i musei per riordinarli.');
                } else {
                    // Deactivate sort mode
                    document.body.classList.remove('sort-mode');
                    museums.forEach(item => {
                        item.style.cursor = '';
                        item.style.border = '';
                        item.title = '';
                        item.draggable = false;
                    });
                    alert('Modalità riordino disattivata.');
                }
            };
        }
    } else {
        console.log('Login failed');
        if (errorMsg) {
            errorMsg.textContent = 'Password sbagliata';
            errorMsg.style.display = 'block';
        }
    }
}

function adminLogout() {
    isLoggedIn = false;
    localStorage.removeItem('admin-logged-in');
    document.querySelector('.admin-lock').classList.remove('unlocked');
    const editControls = document.getElementById('editControls');
    if (editControls) {
        editControls.style.display = 'none';
        const editActions = document.getElementById('editActions');
        if (editActions) editActions.style.display = 'none';
    }
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    toggleAdminPanel();
}

// Check login state on page load
function initAdminState() {
    if (localStorage.getItem('admin-logged-in') === 'true') {
        isLoggedIn = true;
        const adminLock = document.querySelector('.admin-lock');
        const editControls = document.getElementById('editControls');
        if (adminLock) adminLock.classList.add('unlocked');
        if (editControls) editControls.style.display = 'inline-block';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initAdminState();
    
    const adminPass = document.getElementById('adminPass');
    if (adminPass) {
        adminPass.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                adminLogin();
            }
        });
    }
});