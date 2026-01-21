// Connection Checker Module
const ConnectionChecker = {
    // Check if connected via Tor
    async checkTorConnection() {
        try {
            const response = await fetch('https://check.torproject.org/api/ip');
            const data = await response.json();
            return {
                isTor: data.IsTor === true,
                ip: data.IP,
                country: data.Country
            };
        } catch (error) {
            console.error('Tor check failed:', error);
            return { isTor: false, ip: null, country: null };
        }
    },

    // Get connection latency
    async getLatency() {
        const start = performance.now();
        try {
            await fetch('https://www.google.com/favicon.ico', {
                cache: 'no-store',
                mode: 'no-cors'
            });
            return Math.round(performance.now() - start);
        } catch {
            return null;
        }
    },

    // Detect VPN/proxy
    async detectVPN() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            return {
                usingVPN: data.vpn === true || data.proxy === true,
                isp: data.org,
                country: data.country_name
            };
        } catch {
            return { usingVPN: false, isp: null, country: null };
        }
    }
};