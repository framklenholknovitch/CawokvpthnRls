// Troubleshooting Data
const TroubleshootingData = {
    issues: [
        {
            id: 1,
            icon: 'fa-database',
            title: 'Country/Onion.db Error',
            description: 'If you see errors related to countries or onion database:',
            steps: [
                'Download the onion.db file: ',
                {
                    type: 'link',
                    text: 'onion.db',
                    url: 'https://github.com/framklenholknovitch/CawokvpthnRls/releases/download/rels/onion.db',
                    icon: 'fa-download'
                },
                'Place it in: ',
                {
                    type: 'code',
                    text: 'C:\\Users\\[YourUsername]\\AppData\\Local\\Cawokvpthn\\'
                },
                'Restart Cawokvpthn VPN'
            ]
        },
        {
            id: 2,
            icon: 'fa-tachometer-alt',
            title: 'Slow Internet Connection',
            description: 'If Tor connection is slow:',
            steps: [
                'Go to <strong>SETTINGS → BRIDGES</strong>',
                'In <strong>Bridge type</strong> select: ',
                {
                    type: 'code',
                    text: 'snowflake'
                },
                'Check the box as shown in the guide',
                'Reconnect to Tor',
                {
                    type: 'alternative',
                    title: 'If still slow, try:',
                    options: [
                        {
                            type: 'code',
                            text: 'obfs4',
                            instructions: [
                                'Get bridges from ',
                                {
                                    type: 'link',
                                    text: '@GetBridgesBot',
                                    url: 'https://t.me/GetBridgesBot',
                                    class: 'bot-link'
                                },
                                ' or Tor website',
                                'Paste bridges below and click <strong>Add</strong>',
                                'Reconnect'
                            ]
                        },
                        {
                            type: 'code',
                            text: 'webtunnel',
                            instructions: [
                                'Get webtunnel bridges from ',
                                {
                                    type: 'link',
                                    text: '@GetBridgesBot',
                                    url: 'https://t.me/GetBridgesBot',
                                    class: 'bot-link'
                                },
                                'Paste and click <strong>Add</strong>',
                                'Reconnect'
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 3,
            icon: 'fa-browser',
            title: 'Browser Landing Page Issue',
            description: 'If browser opens with stub page after connection:',
            steps: [
                'Go to <strong>Settings → Landing Pages</strong>',
                'In <strong>Connected page</strong> enter:',
                {
                    type: 'code',
                    text: 'https://framklenholknovitch.github.io/CawokvpthnRls/'
                },
                'Or disable analytics by turning off the toggle',
                'Close settings and reconnect to Tor'
            ]
        },
        {
            id: 4,
            icon: 'fa-globe',
            title: 'DNS & Connection Issues',
            description: 'If Tor won\'t connect or connection is unstable:',
            steps: [
                '<strong>Enable DNS in settings</strong> - Tor often requires DNS to work',
                'Recommended DNS settings:',
                {
                    type: 'list',
                    items: [
                        'Google DNS: ',
                        {
                            type: 'code',
                            text: '8.8.8.8'
                        },
                        ' and ',
                        {
                            type: 'code',
                            text: '8.8.4.4'
                        },
                        'Cloudflare DNS: ',
                        {
                            type: 'code',
                            text: '1.1.1.1'
                        },
                        ' and ',
                        {
                            type: 'code',
                            text: '1.0.0.1'
                        }
                    ]
                },
                'Other DNS providers may be unstable',
                'This also improves connection speed'
            ]
        },
        {
            id: 5,
            icon: 'fa-lightbulb',
            title: 'General Tips',
            description: '',
            tips: [
                {
                    icon: 'fa-redo',
                    text: 'Always <strong>restart the application</strong> after changing settings'
                },
                {
                    icon: 'fa-network-wired',
                    text: 'Check your <strong>firewall/antivirus</strong> settings'
                },
                {
                    icon: 'fa-power-off',
                    text: 'Try <strong>disconnecting and reconnecting</strong>'
                },
                {
                    icon: 'fa-history',
                    text: 'Clear Tor cache if problems persist'
                },
                {
                    icon: 'fa-download',
                    text: 'Ensure you have the <strong>latest version</strong>'
                }
            ]
        }
    ],

    // Render troubleshooting cards
    render() {
        const container = document.getElementById('troubleshooting-grid');
        if (!container) return;

        container.innerHTML = this.issues.map(issue => this.renderCard(issue)).join('');
    },

    // Render single card
    renderCard(issue) {
        return `
            <div class="trouble-card">
                <div class="trouble-header">
                    <i class="fas ${issue.icon}"></i>
                    <h3>${issue.title}</h3>
                </div>
                <div class="trouble-content">
                    ${issue.description ? `<p class="trouble-desc">${issue.description}</p>` : ''}
                    ${issue.tips ? this.renderTips(issue.tips) : this.renderSteps(issue.steps)}
                </div>
            </div>
        `;
    },

    // Render steps
    renderSteps(steps) {
        if (!steps) return '';
        
        return `
            <ol class="trouble-steps">
                ${steps.map((step, index) => this.renderStep(step, index)).join('')}
            </ol>
        `;
    },

    // Render single step
    renderStep(step, index) {
        if (typeof step === 'string') {
            return `<li>${step}</li>`;
        }
        
        if (step.type === 'link') {
            return `
                <li>
                    ${step.text || ''}
                    <a href="${step.url}" ${step.download ? 'download' : ''} class="file-link ${step.class || ''}">
                        <i class="fas ${step.icon || 'fa-download'}"></i> ${step.text}
                    </a>
                </li>
            `;
        }
        
        if (step.type === 'code') {
            return `<li><code>${step.text}</code></li>`;
        }
        
        if (step.type === 'list') {
            return `
                <li>
                    ${step.text || ''}
                    <ul>
                        ${step.items ? step.items.map(item => 
                            typeof item === 'string' ? `<li>${item}</li>` : 
                            item.type === 'code' ? `<li><code>${item.text}</code></li>` : ''
                        ).join('') : ''}
                    </ul>
                </li>
            `;
        }
        
        if (step.type === 'alternative') {
            return `
                <li class="alternative">
                    ${step.title || ''}
                    <ul>
                        ${step.options ? step.options.map(option => `
                            <li>Try ${option.type === 'code' ? `<code>${option.text}</code>` : option.text}:
                                ${option.instructions ? `
                                    <ul>
                                        ${option.instructions.map(inst => 
                                            typeof inst === 'string' ? `<li>${inst}</li>` : 
                                            inst.type === 'link' ? `
                                                <li>${inst.text || ''}
                                                    <a href="${inst.url}" class="${inst.class || ''}">${inst.text}</a>
                                                </li>
                                            ` : ''
                                        ).join('')}
                                    </ul>
                                ` : ''}
                            </li>
                        `).join('') : ''}
                    </ul>
                </li>
            `;
        }
        
        return `<li>${step}</li>`;
    },

    // Render tips
    renderTips(tips) {
        return `
            <ul class="trouble-tips">
                ${tips.map(tip => `
                    <li>
                        <i class="fas ${tip.icon}"></i> ${tip.text}
                    </li>
                `).join('')}
            </ul>
        `;
    }
};

// Initialize troubleshooting on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    TroubleshootingData.render();
});