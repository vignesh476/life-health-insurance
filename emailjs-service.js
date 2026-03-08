
// ========================================
// EmailJS Service - Send emails in background
// ========================================

// EmailJS Configuration
// IMPORTANT: For production, use environment variables or a secure config
// Get these from https://www.emailjs.com/
// - Create account
// - Add Email Service (Gmail, Outlook, etc.)
// - Create Email Template
// - Get your Public Key

// Production credentials - Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'L0NtKLz9yesxFlY3C',      // Replace with your EmailJS Public Key
    SERVICE_ID: 'service_rfpr649',       // Replace with your EmailJS Service ID
    TEMPLATE_ID: 'template_fmugcu6',     // Your EmailJS Template ID
    TEMPLATE_IDS: {
        contact: 'template_fmugcu6',     // Contact form template
        quote: 'template_fmugcu6'        // Quote form template (same as contact)
    }
};

// ========================================
// Activity Logging System
// ========================================

const EmailJSLogger = {
    logs: [],
    maxLogs: 50,
    
    log: function(type, message, data = {}) {
        const entry = {
            type: type,
            message: message,
            data: data,
            timestamp: new Date().toISOString()
        };
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        console.log(`[EmailJS ${type}] ${message}`, data);
        return entry;
    },
    
    info: function(message, data) { return this.log('INFO', message, data); },
    warn: function(message, data) { return this.log('WARN', message, data); },
    error: function(message, data) { return this.log('ERROR', message, data); },
    success: function(message, data) { return this.log('SUCCESS', message, data); },
    
    getLogs: function() { return [...this.logs]; },
    clearLogs: function() { this.logs = []; }
};

// ========================================
// Configuration Validation
// ========================================

function isEmailJSConfigured() {
    const isConfigured = Boolean(
        EMAILJS_CONFIG.PUBLIC_KEY && 
        EMAILJS_CONFIG.SERVICE_ID && 
        EMAILJS_CONFIG.TEMPLATE_ID &&
        EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' &&
        EMAILJS_CONFIG.PUBLIC_KEY.length > 5
    );
    
    if (!isConfigured) {
        EmailJSLogger.warn('EmailJS is not properly configured. Check your credentials.');
    }
    return isConfigured;
}

// ========================================
// Loading State Management
// ========================================

const EmailJSLoader = {
    isLoading: false,
    isLoaded: false,
    loadPromise: null,
    
    getLoadingState: function() {
        return { isLoading: this.isLoading, isLoaded: this.isLoaded };
    }
};

// ========================================
// Load EmailJS SDK
// ========================================

function loadEmailJS() {
    // Return cached promise if already loading
    if (EmailJSLoader.loadPromise) {
        return EmailJSLoader.loadPromise;
    }
    
    // Return resolved promise if already loaded
    if (window.emailjs && window.emailjs.init) {
        EmailJSLoader.isLoaded = true;
        EmailJSLogger.info('EmailJS already loaded');
        return Promise.resolve(window.emailjs);
    }
    
    EmailJSLoader.isLoading = true;
    EmailJSLogger.info('Loading EmailJS SDK...');
    
    EmailJSLoader.loadPromise = new Promise((resolve, reject) => {
        // Check if script is already in DOM
        const existingScript = document.querySelector('script[src*="emailjs"]');
        if (existingScript) {
            if (window.emailjs) {
                EmailJSLoader.isLoading = false;
                EmailJSLoader.isLoaded = true;
                window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
                EmailJSLogger.info('EmailJS initialized from existing script');
                resolve(window.emailjs);
                return;
            }
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.async = true;
        
        script.onload = () => {
            EmailJSLoader.isLoading = false;
            EmailJSLoader.isLoaded = true;
            
            if (window.emailjs) {
                window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
                EmailJSLogger.success('EmailJS SDK loaded and initialized successfully');
                resolve(window.emailjs);
            } else {
                EmailJSLogger.error('EmailJS SDK loaded but window.emailjs is undefined');
                reject(new Error('EmailJS SDK failed to initialize'));
            }
        };
        
        script.onerror = () => {
            EmailJSLoader.isLoading = false;
            EmailJSLogger.error('Failed to load EmailJS SDK', { src: script.src });
            reject(new Error('Failed to load EmailJS SDK'));
        };
        
        document.head.appendChild(script);
    });
    
    return EmailJSLoader.loadPromise;
}

// ========================================
// Send Contact Form Email
// ========================================

async function sendContactEmail(formData) {
    // Validate configuration first
    if (!isEmailJSConfigured()) {
        EmailJSLogger.warn('Attempted to send email but EmailJS is not configured');
        return { success: false, error: 'EmailJS not configured' };
    }
    
    const templateParams = {
        to_name: 'Buggaram Linganna',
        from_name: formData.name || 'Website Visitor',
        from_email: formData.email || 'Not provided',
        phone: formData.phone || 'Not provided',
        interest: formData.interest || 'General Inquiry',
        age_group: formData.age || 'Not specified',
        family_members: formData.members || 'Not specified',
        message: formData.message || 'No message',
        subject: `New ${formData.interest || 'Insurance'} Inquiry from Website`,
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        
        // Dynamic template styling for contact form
        header_color: '#0066CC',
        header_color_dark: '#004999',
        header_icon: '🏥',
        header_title: 'New Insurance Inquiry',
        intro_text: 'You have received a new inquiry from your website:',
        theme_color: '#0066CC',
        cta_bg: '#e8f5e9',
        cta_color: '#2e7d32',
        cta_text: '💡 Contact the customer for more details!'
    };

    EmailJSLogger.info('Sending contact form email', { 
        to: templateParams.to_name, 
        from: templateParams.from_name 
    });

    try {
        // Load EmailJS SDK
        await loadEmailJS();
        
        // Verify emailjs is available
        if (!window.emailjs || !window.emailjs.send) {
            throw new Error('EmailJS send function not available');
        }
        
        // Send the email using contact template
        const response = await window.emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_IDS.contact,
            templateParams
        );
        
        EmailJSLogger.success('Contact form email sent successfully', { 
            response: response.status,
            messageId: response.text
        });
        
        return { success: true, response };
    } catch (error) {
        EmailJSLogger.error('Failed to send contact form email', { 
            error: error.message,
            status: error.status
        });
        
        return { success: false, error: error };
    }
}

// ========================================
// Send Quick Quote Email
// ========================================

async function sendQuickQuoteEmail(formData) {
    // Validate configuration first
    if (!isEmailJSConfigured()) {
        EmailJSLogger.warn('Attempted to send email but EmailJS is not configured');
        return { success: false, error: 'EmailJS not configured' };
    }
    
    const insuranceText = {
        'health': 'Health Insurance',
        'life': 'Life Insurance',
        'vehicle': 'Vehicle Insurance'
    };

    const templateParams = {
        to_name: 'Buggaram Linganna',
        from_name: formData.name || 'Website Visitor',
        from_email: formData.email || '',
        phone: formData.phone,
        interest: formData.interest || '',
        insurance_type: insuranceText[formData.insuranceType] || formData.insuranceType,
        age_group: formData.age || '',
        family_members: formData.members || '',
        subject: `New Quick Quote Request - ${insuranceText[formData.insuranceType] || formData.insuranceType}`,
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        
        // Dynamic template styling for quote forms
        header_color: '#FF9800',
        header_color_dark: '#F57C00',
        header_icon: '⚡',
        header_title: 'Quick Quote Request',
        intro_text: 'A quick quote request from your website:',
        theme_color: '#FF9800',
        cta_bg: '#fff3e0',
        cta_color: '#e65100',
        cta_text: '🚀 Call the customer NOW for instant quote!'
    };

    EmailJSLogger.info('Sending quick quote email', { 
        insuranceType: formData.insuranceType,
        phone: formData.phone ? formData.phone.substring(0, 4) + '****' : 'Not provided'
    });

    try {
        // Load EmailJS SDK
        await loadEmailJS();
        
        // Verify emailjs is available
        if (!window.emailjs || !window.emailjs.send) {
            throw new Error('EmailJS send function not available');
        }
        
        // Send the email using quote template
        const response = await window.emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_IDS.quote,
            templateParams
        );
        
        EmailJSLogger.success('Quick quote email sent successfully', { 
            response: response.status,
            messageId: response.text
        });
        
        return { success: true, response };
    } catch (error) {
        EmailJSLogger.error('Failed to send quick quote email', { 
            error: error.message,
            status: error.status
        });
        
        return { success: false, error: error };
    }
}

// ========================================
// Export All Functions for External Use
// ========================================

window.EmailJSService = {
    // Configuration
    config: EMAILJS_CONFIG,
    isConfigured: isEmailJSConfigured,
    
    // Email sending functions
    sendContactEmail,
    sendQuickQuoteEmail,
    
    // Utility functions
    loadEmailJS,
    getLogger: function() { return EmailJSLogger; },
    getLoadingState: function() { return EmailJSLoader.getLoadingState(); },
    
    // Debug functions
    getLogs: function() { return EmailJSLogger.getLogs(); },
    clearLogs: function() { return EmailJSLogger.clearLogs(); },
    
    // Version info
    version: '2.0.0',
    lastUpdated: '2026-01-15'
};

// ========================================
// Console Welcome Message
// ========================================

console.log('%c📧 EmailJS Service Loaded v2.0.0', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
console.log('%c✅ Improvements: Activity logging, Error handling, Loading states', 'color: #666; font-size: 12px;');
console.log('%c💡 Use window.EmailJSService.getLogs() to view activity logs', 'color: #0066CC; font-size: 11px;');
console.log('%c⚠️ Configure EmailJS in emailjs-service.js to enable email notifications', 'color: #FF9800; font-size: 11px;');

// ========================================
// EmailJS Integration Complete
// ========================================

