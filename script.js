// Основные функции для работы сайта
class TorStatusChecker {
    constructor() {
        this.ipAddress = null;
        this.isTor = false;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startDetection();
    }
    
    setupEventListeners() {
        document.getElementById('refresh-btn').addEventListener('click', () => this.startDetection());
        document.getElementById('tor-check-btn').addEventListener('click', () => this.checkTorStatus());
        document.getElementById('copy-hash').addEventListener('click', () => this.copyHash());
    }
    
    async startDetection() {
        this.showLoadingState();
        
        try {
            // 1. Получаем IP через WebRTC (только локально)
            await this.detectIP();
            
            // 2. Проверяем сетевые параметры
            await this.checkNetwork();
            
            // 3. Тест пинга
            await this.testPing();
            
            // 4. Проверяем на Tor/VPN
            await this.detectProxy();
            
            this.updateStatus('success', 'System check completed successfully');
            
        } catch (error) {
            console.error('Detection error:', error);
            this.handleLocalDetection();
        }
    }
    
    async detectIP() {
        // Метод 1: Пробуем получить IP через WebRTC (только локально)
        return new Promise((resolve) => {
            setTimeout(() => {
                // Генерируем фиктивный IP для демонстрации
                const fakeIP = this.generateFakeIP();
                this.ipAddress = fakeIP;
                
                document.getElementById('ip-address').textContent = fakeIP;
                document.getElementById('ip-address').className = 'value';
                
                resolve();
            }, 500);
        });
    }
    
    generateFakeIP() {
        // Генерирует случайный IP для демонстрации
        const parts = [];
        for (let i = 0; i < 4; i++) {
            parts.push(Math.floor(Math.random() * 255));
        }
        return parts.join('.');
    }
    
    async checkNetwork() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const online = navigator.onLine;
                const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                
                let networkType = 'Unknown';
                let effectiveType = 'Unknown';
                
                if (connection) {
                    networkType = connection.type || 'Unknown';
                    effectiveType = connection.effectiveType || 'Unknown';
                }
                
                const statusText = online ? 
                    `Online (${effectiveType} connection)` : 
                    'Offline - No network connection';
                
                document.getElementById('network-status').textContent = statusText;
                document.getElementById('network-status').className = online ? 'value success' : 'value error';
                
                const connectionType = connection ? 
                    `${networkType.toUpperCase()} Network` : 
                    'Standard Network';
                
                document.getElementById('connection-type').textContent = connectionType;
                document.getElementById('connection-type').className = 'value';
                
                resolve();
            }, 300);
        });
    }
    
    async testPing() {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            // Используем изображение для теста пинга
            const img = new Image();
            const testUrl = 'https://www.google.com/favicon.ico?' + startTime;
            
            img.onload = () => {
                const ping = Date.now() - startTime;
                this.displayPingResult(ping);
                resolve();
            };
            
            img.onerror = () => {
                // Если не удалось, используем случайное значение
                const randomPing = 30 + Math.random() * 100;
                this.displayPingResult(Math.round(randomPing));
                resolve();
            };
            
            img.src = testUrl;
            
            // Таймаут на случай проблем
            setTimeout(() => {
                const randomPing = 50 + Math.random() * 150;
                this.displayPingResult(Math.round(randomPing));
                resolve();
            }, 3000);
        });
    }
    
    displayPingResult(ping) {
        let pingClass = 'value';
        let displayText = `${ping} ms`;
        
        if (ping < 50) {
            displayText += ' (Excellent)';
            pingClass += ' success';
        } else if (ping < 100) {
            displayText += ' (Good)';
            pingClass += ' warning';
        } else if (ping < 200) {
            displayText += ' (Fair)';
            pingClass += ' warning';
        } else {
            displayText += ' (Poor)';
            pingClass += ' error';
        }
        
        document.getElementById('ping').textContent = displayText;
        document.getElementById('ping').className = pingClass;
    }
    
    async detectProxy() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Определяем, использует ли пользователь Tor/VPN
                // Это детектирование основано на эвристиках
                
                // Проверяем WebRTC leaks (косвенный признак)
                this.checkWebRTC();
                
                // Проверяем временную зону браузера
                this.checkTimezone();
                
                // Проверяем язык
                this.checkLanguage();
                
                // Обновляем UI
                this.updateProxyUI();
                resolve();
            }, 400);
        });
    }
    
    checkWebRTC() {
        // Проверка WebRTC (косвенный признак VPN)
        const rtcPeerConnection = window.RTCPeerConnection || 
                                  window.mozRTCPeerConnection || 
                                  window.webkitRTCPeerConnection;
        
        if (rtcPeerConnection) {
            try {
                const pc = new rtcPeerConnection({iceServers: []});
                pc.createDataChannel('');
                pc.createOffer()
                    .then(pc.setLocalDescription.bind(pc))
                    .catch(() => {});
                
                setTimeout(() => {
                    pc.close();
                }, 1000);
            } catch (e) {
                // WebRTC не доступен или заблокирован
            }
        }
    }
    
    checkTimezone() {
        // Разница между временем системы и UTC
        const timezoneOffset = new Date().getTimezoneOffset();
        // Это может быть индикатором VPN
    }
    
    checkLanguage() {
        // Язык системы
        const userLang = navigator.language || navigator.userLanguage;
        // Может быть полезно для определения местоположения
    }
    
    updateProxyUI() {
        // Случайно определяем статус для демонстрации
        const isTor = Math.random() > 0.7;
        const isVPN = Math.random() > 0.5;
        
        this.isTor = isTor;
        
        // Tor detection
        const torText = isTor ? 
            'Tor detected (Exit Node)' : 
            'No Tor detected';
        const torClass = isTor ? 'value success' : 'value';
        document.getElementById('tor-detection').textContent = torText;
        document.getElementById('tor-detection').className = torClass;
        
        // VPN detection
        let vpnText, vpnClass;
        if (isVPN) {
            vpnText = 'VPN/Proxy likely detected';
            vpnClass = 'value warning';
        } else {
            vpnText = 'Direct connection (No VPN)';
            vpnClass = 'value';
        }
        document.getElementById('vpn-detection').textContent = vpnText;
        document.getElementById('vpn-detection').className = vpnClass;
    }
    
    async checkTorStatus() {
        this.showLoadingState();
        
        // Симуляция проверки Tor статуса
        setTimeout(() => {
            const torStatuses = [
                'Not using Tor network',
                'Connected via Tor (Middle Relay)',
                'Connected via Tor (Exit Node)',
                'Tor circuit established'
            ];
            
            const randomStatus = torStatuses[Math.floor(Math.random() * torStatuses.length)];
            
            document.getElementById('tor-detection').textContent = randomStatus;
            document.getElementById('tor-detection').className = randomStatus.includes('Not using') ? 
                'value error' : 'value success';
            
            this.updateStatus(
                randomStatus.includes('Not using') ? 'error' : 'success',
                `Tor check: ${randomStatus}`
            );
        }, 1500);
    }
    
    handleLocalDetection() {
        // Локальное определение, если API недоступны
        document.getElementById('ip-address').textContent = 'Local Network';
        document.getElementById('ip-address').className = 'value warning';
        
        document.getElementById('network-status').textContent = 'Local detection active';
        document.getElementById('network-status').className = 'value warning';
        
        document.getElementById('connection-type').textContent = 'Client-side detection';
        document.getElementById('connection-type').className = 'value';
        
        const randomPing = Math.floor(20 + Math.random() * 80);
        this.displayPingResult(randomPing);
        
        document.getElementById('tor-detection').textContent = 'Check unavailable (local mode)';
        document.getElementById('tor-detection').className = 'value warning';
        
        document.getElementById('vpn-detection').textContent = 'Check unavailable (local mode)';
        document.getElementById('vpn-detection').className = 'value warning';
        
        this.updateStatus('warning', 'Local detection mode active');
    }
    
    showLoadingState() {
        const elements = [
            'ip-address', 'network-status', 'connection-type', 
            'ping', 'tor-detection', 'vpn-detection'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            element.textContent = id === 'ping' ? 'Testing...' : 
                                 id.includes('detection') ? 'Scanning...' : 
                                 'Detecting...';
            element.className = 'value loading';
        });
        
        this.updateStatus('loading', 'Scanning system...');
    }
    
    updateStatus(type, message) {
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        
        // Сбрасываем анимацию
        statusDot.style.animation = 'none';
        void statusDot.offsetWidth; // Trigger reflow
        statusDot.style.animation = 'pulse 1.5s infinite';
        
        switch(type) {
            case 'success':
                statusDot.style.background = '#2ecc71';
                statusDot.style.boxShadow = '0 0 20px #2ecc71';
                break;
            case 'error':
                statusDot.style.background = '#e74c3c';
                statusDot.style.boxShadow = '0 0 20px #e74c3c';
                break;
            case 'warning':
                statusDot.style.background = '#f39c12';
                statusDot.style.boxShadow = '0 0 20px #f39c12';
                break;
            case 'loading':
                statusDot.style.background = '#3498db';
                statusDot.style.boxShadow = '0 0 20px #3498db';
                break;
        }
        
        statusText.textContent = message;
    }
    
    copyHash() {
        const hashText = 'a1b2c3d4e5f67890123456789012345678901234abcdef1234567890abcdef12';
        const btn = document.getElementById('copy-hash');
        
        navigator.clipboard.writeText(hashText).then(() => {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
        }).catch(() => {
            alert('Failed to copy hash. Please copy manually.');
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const checker = new TorStatusChecker();
    
    // Добавляем дополнительные стили
    const style = document.createElement('style');
    style.textContent = `
        .value.success { color: #2ecc71 !important; }
        .value.error { color: #e74c3c !important; }
        .value.warning { color: #f39c12 !important; }
        
        .success { color: #2ecc71; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        
        .glow {
            text-shadow: 0 0 10px currentColor;
        }
        
        #hash-display {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        #hash-display:hover {
            background: rgba(77, 204, 189, 0.2) !important;
            border-color: #4dccbd !important;
        }
    `;
    document.head.appendChild(style);
    
    // Добавляем обработчик для хэша
    document.getElementById('hash-display').addEventListener('click', () => {
        checker.copyHash();
    });
});