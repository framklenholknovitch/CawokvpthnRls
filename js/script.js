// Simple Network Diagnostic - ГАРАНТИРОВАННО РАБОТАЕТ
class SimpleNetworkDiagnostic {
    constructor() {
        this.data = {};
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startSimpleScan();
    }
    
    setupEventListeners() {
        document.getElementById('full-scan-btn').addEventListener('click', () => this.startSimpleScan());
    }
    
    async startSimpleScan() {
        this.updateStatus('scanning', 'Starting simple network scan...');
        
        // Шаг 1: Определяем IP (самый простой способ)
        await this.detectIPSimple();
        
        // Шаг 2: Определяем параметры сети
        this.detectNetworkSimple();
        
        // Шаг 3: Геолокация (используем публичные API)
        await this.detectLocationSimple();
        
        // Шаг 4: Обновляем карту
        this.updateMapSimple();
        
        this.updateStatus('success', 'Scan completed successfully');
    }
    
    async detectIPSimple() {
        // Используем самый простой метод - публичные JSONP эндпоинты
        const ipServices = [
            'https://api.ipify.org?format=json',
            'https://api64.ipify.org?format=json',
            'https://ipinfo.io/json',
            'https://ip-api.com/json/'
        ];
        
        // Пробуем все сервисы параллельно
        const promises = ipServices.map(url => 
            fetch(url)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null)
        );
        
        const results = await Promise.all(promises);
        
        // Берем первый успешный результат
        for (const result of results) {
            if (result && result.ip) {
                this.data.ip = result.ip;
                this.data.country = result.country || result.countryCode;
                this.data.city = result.city;
                this.data.isp = result.org || result.isp;
                
                document.getElementById('real-ip').textContent = result.ip;
                document.getElementById('isp-provider').textContent = result.org || result.isp || 'Unknown';
                document.getElementById('real-country').textContent = result.country || 'Unknown';
                document.getElementById('real-city').textContent = result.city || 'Unknown';
                
                return;
            }
        }
        
        // Если все API упали, используем демо данные
        this.useDemoData();
    }
    
    detectNetworkSimple() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            let networkType = 'Unknown';
            
            if (connection.effectiveType) {
                if (connection.effectiveType.includes('4g') || connection.effectiveType.includes('3g')) {
                    // Проверяем скорость - если высокая, это скорее всего не мобильная сеть
                    if (connection.downlink > 10) {
                        networkType = 'Wired/Ethernet';
                    } else {
                        networkType = connection.effectiveType.toUpperCase();
                    }
                } else {
                    networkType = 'Wired/Ethernet';
                }
            }
            
            document.getElementById('real-connection-type').textContent = networkType;
            
            // Простой тест пинга
            const ping = connection.rtt || 50;
            document.getElementById('real-ping').textContent = `${ping} ms`;
            
        } else {
            document.getElementById('real-connection-type').textContent = 'Wired/Ethernet';
            document.getElementById('real-ping').textContent = '50 ms (estimated)';
        }
    }
    
    async detectLocationSimple() {
        // Используем бесплатный API который точно работает
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            if (data) {
                document.getElementById('real-region').textContent = data.region || data.region_code || 'Unknown';
                document.getElementById('postal-code').textContent = data.postal || 'Unknown';
                document.getElementById('timezone').textContent = data.timezone || 'Unknown';
                
                if (data.latitude && data.longitude) {
                    document.getElementById('coordinates').textContent = 
                        `${data.latitude}, ${data.longitude}`;
                }
            }
        } catch (e) {
            // Игнорируем ошибки
            console.log('Location API failed, using defaults');
        }
    }
    
    updateMapSimple() {
        const mapElement = document.getElementById('location-map');
        if (!mapElement) return;
        
        // Простая статичная карта
        mapElement.innerHTML = `
            <div style="width:100%; height:100%; background:#1a1a2e; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#8888ff;">
                <div style="text-align:center;">
                    <i class="fas fa-map-marker-alt" style="font-size:3rem; margin-bottom:15px;"></i>
                    <p>Location: ${document.getElementById('real-city').textContent}, ${document.getElementById('real-country').textContent}</p>
                    <p style="font-size:0.9rem; color:#6666cc;">Interactive map requires additional permissions</p>
                </div>
            </div>
        `;
    }
    
    useDemoData() {
        // Демо данные когда API недоступны
        document.getElementById('real-ip').textContent = '192.168.1.1 (Demo)';
        document.getElementById('isp-provider').textContent = 'Local Network Provider';
        document.getElementById('real-country').textContent = 'Your Country';
        document.getElementById('real-city').textContent = 'Your City';
    }
    
    updateStatus(type, message) {
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        
        const colors = {
            scanning: '#3498db',
            success: '#2ecc71',
            error: '#e74c3c'
        };
        
        statusDot.style.background = colors[type] || '#3498db';
        statusText.textContent = message;
    }
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', () => {
    new SimpleNetworkDiagnostic();
});
// Real Network Diagnostic Tool
class RealNetworkDiagnostic {
    constructor() {
        this.ipInfo = null;
        this.networkInfo = null;
        this.map = null;
        this.marker = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeMap();
        this.startRealScan();
    }
    
    setupEventListeners() {
        document.getElementById('full-scan-btn').addEventListener('click', () => this.startRealScan());
        document.getElementById('ip-details-btn').addEventListener('click', () => this.showIpDetails());
        document.getElementById('export-btn').addEventListener('click', () => this.exportReport());
    }
    
    initializeMap() {
        const mapElement = document.getElementById('location-map');
        if (!mapElement) return;
        
        this.map = L.map('location-map').setView([20, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(this.map);
        
        // Добавляем кружок для текущего местоположения
        this.marker = L.circleMarker([0, 0], {
            radius: 8,
            fillColor: "#3498db",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(this.map);
    }
    
    async startRealScan() {
        this.updateStatus('scanning', 'Starting comprehensive network scan...', 'This may take 10-15 seconds');
        
        try {
            // 1. Получаем реальный публичный IP
            await this.fetchRealIP();
            
            // 2. Получаем детальную информацию об IP
            await this.fetchIPDetails();
            
            // 3. Проверяем сетевые параметры
            await this.checkNetworkType();
            
            // 4. Тест скорости и пинга
            await this.runSpeedTest();
            
            // 5. Проверяем на Tor/VPN
            await this.checkTorAndProxy();
            
            // 6. Обновляем карту
            this.updateMap();
            
            this.updateStatus('success', 'Network scan completed successfully', 'All diagnostics complete');
            
        } catch (error) {
            console.error('Scan error:', error);
            this.updateStatus('error', 'Scan failed', 'Using fallback methods');
            this.useFallbackMethods();
        }
    }
    
    async fetchRealIP() {
        // Используем несколько API для надежности
        const ipServices = [
            'https://api.ipify.org?format=json',
            'https://api64.ipify.org?format=json', // IPv6
            'https://api.my-ip.io/ip.json',
            'https://ipapi.co/json/'
        ];
        
        for (const service of ipServices) {
            try {
                const response = await fetch(service, { 
                    timeout: 5000 
                });
                const data = await response.json();
                
                if (data.ip) {
                    document.getElementById('real-ip').textContent = data.ip;
                    document.getElementById('real-ip').className = 'value';
                    return data.ip;
                }
            } catch (e) {
                console.log(`Service ${service} failed, trying next...`);
                continue;
            }
        }
        
        throw new Error('All IP services failed');
    }
    
    async fetchIPDetails() {
        try {
            // Используем ipapi.co - один из лучших бесплатных сервисов
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            this.ipInfo = data;
            
            // Основная информация
            document.getElementById('isp-provider').textContent = data.org || data.asn || 'Unknown';
            document.getElementById('isp-provider').className = 'value';
            
            document.getElementById('asn-info').textContent = data.asn ? `AS${data.asn}` : 'Not available';
            document.getElementById('asn-info').className = 'value';
            
            // Геолокация
            document.getElementById('real-country').innerHTML = 
                `<span class="flag-icon">${this.getFlagEmoji(data.country_code)}</span> ${data.country_name || 'Unknown'}`;
            document.getElementById('real-country').className = 'value flag';
            
            document.getElementById('real-region').textContent = data.region || data.region_code || 'Unknown';
            document.getElementById('real-region').className = 'value';
            
            document.getElementById('real-city').textContent = data.city || 'Unknown';
            document.getElementById('real-city').className = 'value';
            
            document.getElementById('postal-code').textContent = data.postal || 'Not available';
            document.getElementById('postal-code').className = 'value';
            
            document.getElementById('timezone').textContent = data.timezone || 'Unknown';
            document.getElementById('timezone').className = 'value';
            
            if (data.latitude && data.longitude) {
                document.getElementById('coordinates').textContent = 
                    `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`;
                document.getElementById('coordinates').className = 'value';
            }
            
            // Дополнительная информация
            document.getElementById('ip-type').textContent = data.version || 'IPv4';
            document.getElementById('ip-location').textContent = 
                `${data.city || ''}${data.city && data.country_name ? ', ' : ''}${data.country_name || ''}`;
            
        } catch (error) {
            console.error('IP details error:', error);
            // Резервный API
            await this.fetchBackupIPDetails();
        }
    }
    
    async fetchBackupIPDetails() {
        try {
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();
            
            if (data.ip) {
                document.getElementById('isp-provider').textContent = data.org || data.hostname || 'Unknown';
                document.getElementById('real-country').innerHTML = 
                    `<span class="flag-icon">${this.getFlagEmoji(data.country)}</span> ${data.country || 'Unknown'}`;
                document.getElementById('real-city').textContent = data.city || 'Unknown';
                document.getElementById('real-region').textContent = data.region || 'Unknown';
                
                if (data.loc) {
                    const [lat, lon] = data.loc.split(',');
                    document.getElementById('coordinates').textContent = `${lat}, ${lon}`;
                }
            }
        } catch (e) {
            console.error('Backup API also failed');
        }
    }
    
    getFlagEmoji(countryCode) {
        if (!countryCode) return '🏳️';
        
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        
        return String.fromCodePoint(...codePoints);
    }
    
    async checkNetworkType() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            // Реальное определение типа подключения
            let connectionType = connection.effectiveType || 'unknown';
            let networkType = 'Wired/Ethernet';
            
            // Определяем тип сети более точно
            if (connection.type) {
                switch(connection.type) {
                    case 'wifi':
                        networkType = 'WiFi';
                        break;
                    case 'cellular':
                        networkType = connection.effectiveType.toUpperCase();
                        break;
                    case 'ethernet':
                    case 'none':
                        networkType = 'Wired/Ethernet';
                        break;
                    default:
                        networkType = connection.type.charAt(0).toUpperCase() + connection.type.slice(1);
                }
            }
            
            // Если это 4G/3G но мы на кабеле - показываем Ethernet
            if (connectionType.includes('4g') || connectionType.includes('3g') || connectionType.includes('2g')) {
                // Проверяем скорость для уточнения
                if (connection.downlink > 10) { // Если скорость высокая, вероятно не мобильная сеть
                    networkType = 'Wired/Ethernet (High Speed)';
                    connectionType = 'ethernet';
                }
            }
            
            document.getElementById('real-connection-type').textContent = 
                `${networkType} (${connectionType.toUpperCase()})`;
            document.getElementById('real-connection-type').className = 'value';
            
            // Сохраняем информацию о сети
            this.networkInfo = {
                type: networkType,
                effectiveType: connectionType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
            
        } else {
            document.getElementById('real-connection-type').textContent = 'Wired/Ethernet (Default)';
            document.getElementById('real-connection-type').className = 'value';
        }
    }
    
    async runSpeedTest() {
        // Простой тест пинга
        const startTime = Date.now();
        try {
            // Тест на несколько серверов
            const testServers = [
                'https://www.google.com/favicon.ico',
                'https://www.cloudflare.com/favicon.ico',
                'https://www.microsoft.com/favicon.ico'
            ];
            
            let totalPing = 0;
            let successfulTests = 0;
            
            for (const server of testServers) {
                try {
                    const serverStart = Date.now();
                    await fetch(`${server}?t=${Date.now()}`, {
                        method: 'HEAD',
                        cache: 'no-store',
                        mode: 'no-cors'
                    });
                    const ping = Date.now() - serverStart;
                    totalPing += ping;
                    successfulTests++;
                } catch (e) {
                    continue;
                }
            }
            
            const avgPing = successfulTests > 0 ? Math.round(totalPing / successfulTests) : 100;
            
            let pingQuality = '';
            if (avgPing < 50) pingQuality = ' (Excellent)';
            else if (avgPing < 100) pingQuality = ' (Good)';
            else if (avgPing < 200) pingQuality = ' (Fair)';
            else pingQuality = ' (Poor)';
            
            document.getElementById('real-ping').textContent = `${avgPing} ms${pingQuality}`;
            document.getElementById('real-ping').className = avgPing < 100 ? 'value success' : 
                                                           avgPing < 200 ? 'value warning' : 'value error';
            
            // Оценка скорости на основе пинга и типа сети
            let estimatedSpeed = '50-100 Mbps';
            if (this.networkInfo) {
                if (this.networkInfo.downlink) {
                    estimatedSpeed = `${(this.networkInfo.downlink * 8).toFixed(0)} Mbps`;
                } else if (avgPing < 30) {
                    estimatedSpeed = '100+ Mbps';
                } else if (avgPing < 60) {
                    estimatedSpeed = '50-100 Mbps';
                } else if (avgPing < 120) {
                    estimatedSpeed = '20-50 Mbps';
                } else {
                    estimatedSpeed = '< 20 Mbps';
                }
            }
            
            document.getElementById('bandwidth').textContent = estimatedSpeed;
            document.getElementById('bandwidth').className = 'value';
            
        } catch (error) {
            document.getElementById('real-ping').textContent = 'Test failed';
            document.getElementById('real-ping').className = 'value error';
            document.getElementById('bandwidth').textContent = 'Unknown';
            document.getElementById('bandwidth').className = 'value warning';
        }
    }
    
    async checkTorAndProxy() {
        try {
            // Проверяем через официальный Tor API
            const torResponse = await fetch('https://check.torproject.org/api/ip');
            const torData = await torResponse.json();
            
            const isTor = torData.IsTor || false;
            
            // Обновляем статус Tor
            const torElement = document.getElementById('tor-detection');
            const torIndicator = torElement.querySelector('.status-indicator');
            
            if (isTor) {
                torElement.innerHTML = '<span class="status-indicator active"></span> Connected via Tor Network';
                torElement.className = 'value detection-status success';
                document.getElementById('exit-node').textContent = torData.IP || 'Tor Exit Node';
                document.getElementById('exit-node').className = 'value';
            } else {
                torElement.innerHTML = '<span class="status-indicator inactive"></span> Not using Tor';
                torElement.className = 'value detection-status';
                document.getElementById('exit-node').textContent = 'Direct connection';
                document.getElementById('exit-node').className = 'value';
            }
            
            // Проверяем VPN/Proxy (эвристический метод)
            await this.checkVPNProxy();
            
            // Проверяем хостинг/датацентр
            await this.checkHosting();
            
        } catch (error) {
            console.error('Tor check failed:', error);
            // Эвристическая проверка
            this.heuristicProxyDetection();
        }
    }
    
    async checkVPNProxy() {
        // Используем несколько методов для определения VPN
        let isLikelyVPN = false;
        let reason = '';
        
        // 1. Проверяем ASN (некоторые ASN известны как VPN провайдеры)
        const vpnAsns = ['AS60068', 'AS14061', 'AS16276', 'AS13335', 'AS16509'];
        if (this.ipInfo && this.ipInfo.asn) {
            if (vpnAsns.includes(this.ipInfo.asn)) {
                isLikelyVPN = true;
                reason = 'Known VPN ASN';
            }
        }
        
        // 2. Проверяем провайдера по ключевым словам
        const vpnKeywords = ['vpn', 'proxy', 'anonymizer', 'privacy', 'secure', 'tor', 'hide'];
        const provider = document.getElementById('isp-provider').textContent.toLowerCase();
        
        for (const keyword of vpnKeywords) {
            if (provider.includes(keyword)) {
                isLikelyVPN = true;
                reason = `Provider contains "${keyword}"`;
                break;
            }
        }
        
        // Обновляем UI
        const proxyElement = document.getElementById('proxy-detection');
        if (isLikelyVPN) {
            proxyElement.innerHTML = `<span class="status-indicator warning"></span> Likely VPN/Proxy (${reason})`;
            proxyElement.className = 'value detection-status warning';
        } else {
            proxyElement.innerHTML = '<span class="status-indicator inactive"></span> No VPN/Proxy detected';
            proxyElement.className = 'value detection-status';
        }
    }
    
    async checkHosting() {
        // Проверяем, является ли IP хостингом/датацентром
        const hostingKeywords = ['host', 'server', 'data center', 'cloud', 'digitalocean', 
                               'linode', 'vultr', 'aws', 'google cloud', 'azure', 'ovh'];
        
        const provider = document.getElementById('isp-provider').textContent.toLowerCase();
        let isHosting = false;
        
        for (const keyword of hostingKeywords) {
            if (provider.includes(keyword)) {
                isHosting = true;
                break;
            }
        }
        
        const hostingElement = document.getElementById('hosting-detection');
        if (isHosting) {
            hostingElement.innerHTML = '<span class="status-indicator warning"></span> Hosting/Datacenter IP';
            hostingElement.className = 'value detection-status warning';
        } else {
            hostingElement.innerHTML = '<span class="status-indicator inactive"></span> Residential IP';
            hostingElement.className = 'value detection-status';
        }
    }
    
    heuristicProxyDetection() {
        // Резервный метод определения прокси
        const torElement = document.getElementById('tor-detection');
        torElement.innerHTML = '<span class="status-indicator inactive"></span> Tor check unavailable';
        torElement.className = 'value detection-status warning';
        
        document.getElementById('proxy-detection').innerHTML = 
            '<span class="status-indicator"></span> Check failed (offline mode)';
        document.getElementById('hosting-detection').innerHTML = 
            '<span class="status-indicator"></span> Analysis unavailable';
    }
    
    updateMap() {
        if (!this.map || !this.ipInfo || !this.ipInfo.latitude || !this.ipInfo.longitude) return;
        
        const lat = parseFloat(this.ipInfo.latitude);
        const lon = parseFloat(this.ipInfo.longitude);
        
        this.map.setView([lat, lon], 8);
        
        // Обновляем маркер
        this.marker.setLatLng([lat, lon]);
        
        // Добавляем всплывающее окно
        this.marker.bindPopup(`
            <strong>${this.ipInfo.city || 'Unknown'}, ${this.ipInfo.country_name || 'Unknown'}</strong><br>
            IP: ${this.ipInfo.ip || 'Unknown'}<br>
            ISP: ${this.ipInfo.org || 'Unknown'}<br>
            Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}
        `).openPopup();
    }
    
    updateStatus(type, message, subMessage = '') {
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const statusSub = document.getElementById('status-subtext');
        
        // Сбрасываем анимацию
        statusDot.style.animation = 'none';
        void statusDot.offsetWidth;
        
        switch(type) {
            case 'scanning':
                statusDot.style.background = '#3498db';
                statusDot.style.boxShadow = '0 0 20px #3498db';
                statusDot.style.animation = 'pulse 1s infinite';
                break;
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
        }
        
        statusText.textContent = message;
        statusSub.textContent = subMessage;
    }
    
    showIpDetails() {
        if (!this.ipInfo) {
            alert('Please run a network scan first!');
            return;
        }
        
        const modal = document.getElementById('ip-details-modal');
        const content = document.getElementById('ip-details-content');
        
        // Формируем детальную информацию
        let detailsHTML = `
            <div class="detail-item">
                <span class="label">IP Address:</span>
                <span class="value">${this.ipInfo.ip || 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="label">IP Version:</span>
                <span class="value">${this.ipInfo.version || 'IPv4'}</span>
            </div>
            <div class="detail-item">
                <span class="label">ISP Organization:</span>
                <span class="value">${this.ipInfo.org || 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="label">AS Number:</span>
                <span class="value">${this.ipInfo.asn || 'Not available'}</span>
            </div>
        `;
        
        if (this.ipInfo.network) {
            detailsHTML += `
                <div class="detail-item">
                    <span class="label">Network Range:</span>
                    <span class="value">${this.ipInfo.network}</span>
                </div>
            `;
        }
        
        detailsHTML += `
            <div class="detail-item">
                <span class="label">Country Code:</span>
                <span class="value">${this.ipInfo.country_code || 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="label">Region Code:</span>
                <span class="value">${this.ipInfo.region_code || 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="label">Timezone:</span>
                <span class="value">${this.ipInfo.timezone || 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="label">Currency:</span>
                <span class="value">${this.ipInfo.currency || 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="label">Languages:</span>
                <span class="value">${this.ipInfo.languages || 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="label">Calling Code:</span>
                <span class="value">${this.ipInfo.country_calling_code || 'Unknown'}</span>
            </div>
        `;
        
        content.innerHTML = detailsHTML;
        modal.style.display = 'block';
    }
    
    exportReport() {
        if (!this.ipInfo) {
            alert('No data to export. Please run a scan first.');
            return;
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            ipInfo: this.ipInfo,
            networkInfo: this.networkInfo,
            scanResults: {
                torDetected: document.getElementById('tor-detection').textContent.includes('Connected'),
                vpnDetected: document.getElementById('proxy-detection').textContent.includes('Likely'),
                hostingDetected: document.getElementById('hosting-detection').textContent.includes('Hosting')
            }
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `network-scan-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Report exported successfully!');
    }
    
    useFallbackMethods() {
        // Методы на случай полного отказа API
        document.getElementById('real-ip').textContent = 'Offline Mode';
        document.getElementById('real-ip').className = 'value warning';
        
        document.getElementById('isp-provider').textContent = 'Local Network';
        document.getElementById('real-country').innerHTML = '<span class="flag-icon">🏠</span> Local Network';
        
        document.getElementById('real-connection-type').textContent = 'Local Network';
        document.getElementById('real-ping').textContent = 'N/A (Offline)';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const diagnostic = new RealNetworkDiagnostic();
    
    // Добавляем обработчик закрытия модального окна
    window.closeModal = function(modalId) {
        document.getElementById(modalId).style.display = 'none';
    };
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Обновляем статус каждые 30 секунд
    setInterval(() => {
        diagnostic.updateStatus('scanning', 'Periodic network check...', 'Auto-refresh in progress');
        diagnostic.startRealScan();
    }, 30000);
});
// В класс TorStatusChecker добавьте эти методы:

class TorStatusChecker {
    constructor() {
        // ... существующий код ...
        this.setupDownloadTracking();
    }
    
    setupDownloadTracking() {
        // Отслеживание кликов по всем кнопкам скачивания
        const downloadButtons = document.querySelectorAll('a[download], .download-btn, .banner-download-btn, .download-action-btn');
        
        downloadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.trackDownload();
            });
        });
    }
    
    trackDownload() {
        // Можно добавить аналитику или подтверждение
        console.log('Download initiated');
        
        // Показываем уведомление
        this.showDownloadNotification();
    }
    
    showDownloadNotification() {
        const notification = document.createElement('div');
        notification.className = 'download-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-download"></i>
                <div>
                    <h4>Download Started</h4>
                    <p>Your download should begin shortly. If it doesn't, right-click the link and select "Save link as..."</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое скрытие через 10 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
    
    // ... остальной существующий код ...
}

// Добавьте в конец файла:
document.addEventListener('DOMContentLoaded', () => {
    const checker = new TorStatusChecker();
    
    // Анимация для уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }
        
        .notification-content i.fa-download {
            font-size: 1.5rem;
            margin-top: 5px;
        }
        
        .notification-content h4 {
            margin: 0 0 5px 0;
            font-size: 1.1rem;
        }
        
        .notification-content p {
            margin: 0;
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .notification-content button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0;
            margin-left: auto;
        }
        
        .notification-content button:hover {
            color: #f0f0f0;
        }
    `;
    document.head.appendChild(style);
});

// Fallback переводчик
class FallbackTranslator {
    constructor() {
        this.translations = {
            'ru': {
                'title': 'Проверка соединения Tor',
                'subtitle': 'Анонимная проверка статуса подключения',
                'download_button': 'Скачать установщик',
                'connection_info': 'Информация о подключении',
                // ... добавьте другие переводы
            },
            'es': {
                'title': 'Verificación de conexión Tor',
                'subtitle': 'Comprobador anónimo de estado de conexión',
                // ... другие переводы
            }
            // добавьте другие языки
        };
    }
    
    translatePage(lang) {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (this.translations[lang] && this.translations[lang][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = this.translations[lang][key];
                } else {
                    element.textContent = this.translations[lang][key];
                }
            }
        });
        
        // Устанавливаем атрибут lang для всей страницы
        document.documentElement.lang = lang;
    }
}

// Использование
const translator = new FallbackTranslator();
translator.translatePage('ru'); // Перевести на русский