// Google Translate Manager
const TranslateManager = {
    // Supported languages with display names
    languages: {
        'ru': 'Russian',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ar': 'Arabic',
        'pt': 'Portuguese',
        'it': 'Italian',
        'hi': 'Hindi',
        'uk': 'Ukrainian',
        'pl': 'Polish'
    },

    // Initialize Google Translate
    initGoogleTranslate() {
        if (typeof google === 'undefined' || !google.translate) {
            console.error('Google Translate API not loaded');
            return;
        }

        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,ru,es,fr,de,zh-CN,ja,ko,ar,pt,it,hi,uk,pl',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true
        }, 'google_translate_element');

        // Auto-translate to system language
        setTimeout(() => this.translateToSystemLanguage(), 1500);
        
        // Setup UI
        this.setupUI();
    },

    // Translate to system language
    translateToSystemLanguage() {
        const userLang = (navigator.language || navigator.userLanguage).split('-')[0];
        const supportedLangs = Object.keys(this.languages);
        
        if (supportedLangs.includes(userLang) && userLang !== 'en') {
            const select = document.querySelector('.goog-te-combo');
            if (select) {
                select.value = userLang;
                select.dispatchEvent(new Event('change'));
                this.showTranslationNotice(userLang);
            }
        }
    },

    // Show translation notice
    showTranslationNotice(langCode) {
        // Remove existing notice
        const existingNotice = document.getElementById('translation-notice');
        if (existingNotice) existingNotice.remove();

        const langName = this.languages[langCode] || langCode;
        const notice = document.createElement('div');
        notice.id = 'translation-notice';
        notice.innerHTML = `
            <div class="notice-content">
                <i class="fas fa-language"></i>
                <div>
                    <strong>Page translated to ${langName}</strong>
                    <p>Click the translate button <i class="fas fa-arrow-up"></i> to change language</p>
                </div>
                <button onclick="TranslateManager.closeNotice()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notice);

        // Auto-remove after 8 seconds
        setTimeout(() => this.closeNotice(), 8000);
    },

    // Close translation notice
    closeNotice() {
        const notice = document.getElementById('translation-notice');
        if (notice) notice.remove();
    },

    // Toggle translate dropdown
    toggleTranslate() {
        const select = document.querySelector('.goog-te-combo');
        const translateBtn = document.querySelector('.translate-btn');
        
        if (!select) return;
        
        if (select.style.display === 'none' || select.style.display === '') {
            select.style.display = 'block';
            select.focus();
            translateBtn.classList.add('active');
            translateBtn.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            select.style.display = 'none';
            translateBtn.classList.remove('active');
            translateBtn.innerHTML = '<i class="fas fa-language"></i>';
        }
    },

    // Setup UI event listeners
    setupUI() {
        // Translate button
        const translateBtn = document.querySelector('.translate-btn');
        if (translateBtn) {
            translateBtn.addEventListener('click', () => this.toggleTranslate());
        }

        // Language change handler
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.addEventListener('change', () => {
                const langName = select.options[select.selectedIndex].text;
                NotificationManager.show(`Language changed to ${langName}`);
            });
        }

        // Hide Google elements
        this.hideGoogleElements();
    },

    // Hide Google Translate banners
    hideGoogleElements() {
        const elements = [
            '.goog-te-banner-frame',
            '.skiptranslate',
            '.goog-te-footer'
        ];
        
        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.style.display = 'none';
        });
    }
};

// Google Translate initialization callback (must be global)
function googleTranslateElementInit() {
    TranslateManager.initGoogleTranslate();
}