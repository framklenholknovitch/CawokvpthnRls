// Main Application Controller
const App = {
    // Initialize all components
    init() {
        console.log('App initialized');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize components
        this.initComponents();
        
        // Start connection check
        this.startConnectionCheck();
    },

    // Setup event listeners
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshConnectionInfo());
        }

        // Tor check button
        const torCheckBtn = document.getElementById('tor-check-btn');
        if (torCheckBtn) {
            torCheckBtn.addEventListener('click', () => this.checkTorStatus());
        }

        // Footer translate button
        const footerTranslateBtn = document.querySelector('.footer-section .text-btn');
        if (footerTranslateBtn) {
            footerTranslateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                TranslateManager.toggleTranslate();
            });
        }
    },

    // Initialize components
    initComponents() {
        // Hide Google elements periodically
        setInterval(() => TranslateManager.hideGoogleElements(), 1000);
    },

    // Start connection check
    startConnectionCheck() {
        // Simulate loading
        setTimeout(() => {
            this.updateStatus('Checking connection...', 'warning');
            
            // Fetch IP address
            this.fetchIPAddress();
            
            // Check Tor status
            this.checkTorStatus();
            
            // Update other statuses
            setTimeout(() => {
                this.updateStatus('Connection established', 'success');
                this.updateNetworkInfo();
            }, 2000);
        }, 500);
    },

    // Refresh connection information
    refreshConnectionInfo() {
        NotificationManager.show('Refreshing connection information...');
        this.startConnectionCheck();
    },

    // Fetch IP address
    fetchIPAddress() {
        const ipElement = document.getElementById('ip-address');
        if (!ipElement) return;

        // Try multiple IP services
        const ipServices = [
            'https://api.ipify.org?format=json',
            'https://api.my-ip.io/ip.json',
            'https://ipapi.co/json/'
        ];

        const tryService = (index) => {
            if (index >= ipServices.length) {
                ipElement.textContent = 'Unable to detect';
                ipElement.className = 'value error';
                return;
            }

            fetch(ipServices[index])
                .then(response => response.json())
                .then(data => {
                    const ip = data.ip || data.ip_address || data.query;
                    ipElement.textContent = ip || 'Unknown';
                    ipElement.className = 'value success';
                })
                .catch(() => {
                    tryService(index + 1);
                });
        };

        tryService(0);
    },

    // Check Tor status
    checkTorStatus() {
        const torElement = document.getElementById('tor-detection');
        if (!torElement) return;

        torElement.textContent = 'Checking...';
        torElement.className = 'value loading';

        // Simulate Tor detection (replace with actual check)
        setTimeout(() => {
            const isTor = Math.random() > 0.5;
            torElement.textContent = isTor ? 'Connected via Tor' : 'Not using Tor';
            torElement.className = isTor ? 'value success' : 'value warning';
        }, 1500);
    },

    // Update network information
    updateNetworkInfo() {
        const elements = {
            'network-status': { value: 'Online', type: 'success' },
            'connection-type': { value: 'Secure', type: 'success' },
            'ping': { value: '45ms', type: 'success' },
            'vpn-detection': { value: 'No VPN detected', type: 'warning' }
        };

        Object.entries(elements).forEach(([id, data]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = data.value;
                element.className = `value ${data.type}`;
            }
        });
    },

    // Update status indicator
    updateStatus(text, type = 'info') {
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        
        if (statusDot) {
            statusDot.className = 'status-dot';
            if (type) statusDot.classList.add(type);
        }
        
        if (statusText) {
            statusText.textContent = text;
            statusText.className = '';
            if (type) statusText.classList.add(type);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for debugging
window.App = App;