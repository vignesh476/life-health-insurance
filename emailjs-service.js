
// ========================================
// EmailJS Service - Send emails in background
// ========================================

// EmailJS Configuration
// Get these from https://www.emailjs.com/
// - Create account
// - Add Email Service (Gmail, Outlook, etc.)
// - Create Email Template
// - Get your Public Key

const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY',      // Replace with your EmailJS Public Key
    SERVICE_ID: 'YOUR_SERVICE_ID',       // Replace with your EmailJS Service ID
    TEMPLATE_ID: 'YOUR_TEMPLATE_ID'      // Replace with your EmailJS Template ID
};

// Check if EmailJS is properly configured
function isEmailJSConfigured() {
    return Boolean(
        EMAILJS_CONFIG.PUBLIC_KEY && 
        EMAILJS_CONFIG.SERVICE_ID && 
        EMAILJS_CONFIG.TEMPLATE_ID &&
        EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
    );
}

// Load EmailJS SDK dynamically
function loadEmailJS() {
    return new Promise((resolve, reject) => {
        if (window.emailjs) {
            resolve(window.emailjs);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = () => {
            window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            resolve(window.emailjs);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Send contact form email
async function sendContactEmail(formData) {
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
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    try {
        await loadEmailJS();
        const response = await window.emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams
        );
        console.log('Email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('EmailJS Error:', error);
        return { success: false, error };
    }
}

// Send quick quote email
async function sendQuickQuoteEmail(formData) {
    const insuranceText = {
        'health': 'Health Insurance',
        'life': 'Life Insurance',
        'vehicle': 'Vehicle Insurance'
    };

    const templateParams = {
        to_name: 'Buggaram Linganna',
        from_name: 'Website Visitor',
        phone: formData.phone,
        insurance_type: insuranceText[formData.insuranceType] || formData.insuranceType,
        subject: `New Quick Quote Request - ${insuranceText[formData.insuranceType] || formData.insuranceType}`,
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    try {
        await loadEmailJS();
        const response = await window.emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams
        );
        console.log('Email sent successfully:', response);
        return { success: true, response };
    } catch (error) {
        console.error('EmailJS Error:', error);
        return { success: false, error };
    }
}

// Export functions for use in other scripts
window.EmailJSService = {
    isConfigured: isEmailJSConfigured,
    sendContactEmail,
    sendQuickQuoteEmail,
    config: EMAILJS_CONFIG
};

console.log('%c📧 EmailJS Service Loaded', 'color: #4CAF50; font-size: 14px;');
console.log('%cConfigure EmailJS in emailjs-service.js to enable email notifications', 'color: #666; font-size: 12px;');

