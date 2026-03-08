// ========================================
// EmailJS - Simplified Unified Version
// Works with EmailJS Free Plan (2 templates max)
// ========================================

// Load EmailJS SDK (v4 - @emailjs/browser)
(function() {
    // Check if already loaded
    if (window.emailjs) return;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;
    script.onload = () => {
        // Initialize with your Public Key
        window.emailjs.init('L0NtKLz9yesxFlY3C');
        console.log('EmailJS initialized');
    };
    document.head.appendChild(script);
})();

// ========================================
// Unified Send Function
// ========================================

/**
 * Send email from any form
 * @param {string} formType - 'contact' or 'quote'
 * @param {object} formData - Form data object
 * @returns {Promise} - EmailJS response
 */
window.sendFormEmail = async function(formType, formData) {
    // Configuration
    const SERVICE_ID = 'service_rfpr649';
    const CONTACT_TEMPLATE = 'template_fmugcu6';    // Replace with your contact template ID
    const QUOTE_TEMPLATE = 'template_fmugcu6';        // Replace with your quote template ID
    
    // Determine template ID based on form type
    const templateId = formType === 'quote' ? QUOTE_TEMPLATE : CONTACT_TEMPLATE;
    
    // Dynamic parameters based on form type
    const dynamicParams = formType === 'quote' ? {
        // Quote/Quick Quote styles (Green/Orange)
        header_color: '#FF9800',
        header_color_dark: '#F57C00',
        header_icon: '📊',
        header_title: 'New Quote Request',
        intro_text: 'A visitor has requested a quote:',
        theme_color: '#FF9800',
        cta_bg: '#fff3e0',
        cta_color: '#e65100',
        cta_text: '🚀 Call NOW for instant quote!'
    } : {
        // Contact form styles (Blue)
        header_color: '#0066CC',
        header_color_dark: '#004999',
        header_icon: '🏥',
        header_title: 'New Insurance Inquiry',
        intro_text: 'You have received a new inquiry:',
        theme_color: '#0066CC',
        cta_bg: '#e8f5e9',
        cta_color: '#2e7d32',
        cta_text: '💡 Contact the customer for more details!'
    };
    
    // Build complete template params
    const templateParams = {
        // Dynamic styling
        ...dynamicParams,
        
        // Common params
        to_name: 'Buggaram Linganna',
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        
        // Form data (spread first so dynamic params can override if needed)
        ...formData
    };
    
    // Add insurance type mapping for quote forms
    if (formType === 'quote' && formData.insuranceType) {
        const insuranceMap = {
            'health': 'Health Insurance',
            'life': 'Life Insurance',
            'vehicle': 'Vehicle Insurance',
            'health-insurance': 'Health Insurance',
            'life-insurance': 'Life Insurance',
            'jeevan-labh': 'LIC Jeevan Labh',
            'smart-pension': 'LIC Smart Pension'
        };
        templateParams.insurance_type = insuranceMap[formData.insuranceType] || formData.insuranceType;
    }
    
    try {
        const response = await window.emailjs.send(
            SERVICE_ID,
            templateId,
            templateParams
        );
        
        console.log('✅ Email sent successfully!', response);
        return { success: true, response };
        
    } catch (error) {
        console.error('❌ Email send failed:', error);
        return { success: false, error };
    }
};

// ========================================
// Usage Examples
// ========================================

/*
// Example 1: Contact Form
const contactData = {
    from_name: 'John Doe',
    from_email: 'john@example.com',
    phone: '9876543210',
    interest: 'Health Insurance',
    age_group: '26-35',
    family_members: '4',
    message: 'Interested in family health plan'
};
await sendFormEmail('contact', contactData);

// Example 2: Quote Form
const quoteData = {
    from_name: 'Jane Smith',
    from_email: 'jane@example.com',
    phone: '9876543210',
    interest: 'Life Insurance',
    age_group: '36-45',
    family_members: '3'
};
await sendFormEmail('quote', quoteData);

// Example 3: Quick Quote (just phone + type)
const quickQuoteData = {
    phone: '9876543210',
    insuranceType: 'health'
};
await sendFormEmail('quote', quickQuoteData);
*/

console.log('📧 EmailJS unified function loaded');
console.log('💡 Use: sendFormEmail("contact" or "quote", formData)');

