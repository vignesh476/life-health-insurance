
// ========================================
// Navigation Functionality
// ========================================

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Active link on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ========================================
// Policy Tabs Functionality
// ========================================

const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and panels
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Show corresponding panel
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// ========================================
// FAQ Accordion
// ========================================

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Close other open items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        item.classList.toggle('active');
    });
});

// ========================================
// Contact Form Handling - WhatsApp + EmailJS
// ========================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Check what fields exist in the form
        const hasEmail = contactForm.querySelector('input[name="email"]');
        const hasInterest = contactForm.querySelector('input[name="interest"]');
        const hasInterestSelect = contactForm.querySelector('select[name="interest"]');
        
        // Simple validation - check only name and phone (required in all forms)
        if (!data.name || !data.phone) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Email validation (only if email field exists)
        if (hasEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!data.email || !emailRegex.test(data.email)) {
                alert('Please enter a valid email address');
                return;
            }
        }
        
        // Phone validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }
        
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }
        
        try {
            // Determine interest type from hidden field, select, or default
            let interestValue = 'health-insurance'; // default
            if (hasInterest && data.interest) {
                interestValue = data.interest;
            } else if (hasInterestSelect) {
                const selectEl = contactForm.querySelector('select[name="interest"]');
                if (selectEl && selectEl.value) {
                    interestValue = selectEl.value;
                }
            }
            
            // Map interest to readable text
            const interestText = {
                'health': 'Health Insurance',
                'life': 'Life Insurance',
                'vehicle': 'Vehicle Insurance',
                'home': 'Home Insurance',
                'health-insurance': 'Health Insurance',
                'life-insurance': 'Life Insurance',
                'jeevan-labh': 'LIC Jeevan Labh',
                'smart-pension': 'LIC Smart Pension',
                'other': 'Other Insurance'
            };
            
            // Build WhatsApp message
            let message = `Hello Buggaram Linganna,%0A%0ANew inquiry from website:%0A%0A*Name:* ${data.name}%0A*Phone:* ${data.phone}`;
            
            if (hasEmail && data.email) {
                message += `%0A*Email:* ${data.email}`;
            }
            
            message += `%0A*Interested In:* ${interestText[interestValue] || interestValue}`;
            
            // Add additional fields if they exist
            if (data.age) {
                message += `%0A*Age of Eldest Member:* ${data.age}`;
            }
            if (data.members) {
                message += `%0A*Family Members:* ${data.members}`;
            }
            if (data.message) {
                message += `%0A*Message:* ${data.message}`;
            }
            
            message += `%0A%0APlease contact me.`;
            
            // Open WhatsApp
            const whatsappUrl = `https://wa.me/917702040476?text=${message}`;
            window.open(whatsappUrl, '_blank');
            
            // Try to send email in background (non-blocking)
            // Check if EmailJS service is available and configured
            if (window.EmailJSService) {
                const isConfigured = window.EmailJSService.isConfigured();
                
                if (isConfigured) {
                    const emailResult = await window.EmailJSService.sendContactEmail({
                        name: data.name,
                        phone: data.phone,
                        email: data.email || '',
                        interest: interestText[interestValue] || interestValue,
                        age: data.age || '',
                        members: data.members || '',
                        message: data.message || ''
                    });
                    
                    if (emailResult.success) {
                        console.log('Email notification sent successfully');
                    } else {
                        console.warn('Email sending failed:', emailResult.error);
                    }
                } else {
                    console.warn('EmailJS is not configured. Email will not be sent.');
                }
            } else {
                console.warn('EmailJSService is not available');
            }
            
            // Reset form
            contactForm.reset();
            
            // Show success message
            alert('Thank you! We have received your inquiry. We will contact you shortly.');
            
        } catch (error) {
            console.error('Form submission error:', error);
            alert('An error occurred while processing your request. Please try again.');
        } finally {
            // Restore button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    });
}

// ========================================
// Smooth Scroll for Navigation
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// Animation on Scroll
// ========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .policy-card, .why-us-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add animation class styles dynamically
const style = document.createElement('style');
style.textContent = `
    .animate {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .service-card:nth-child(1), .policy-card:nth-child(1), .why-us-card:nth-child(1), .testimonial-card:nth-child(1) { transition-delay: 0.1s; }
    .service-card:nth-child(2), .policy-card:nth-child(2), .why-us-card:nth-child(2), .testimonial-card:nth-child(2) { transition-delay: 0.2s; }
    .service-card:nth-child(3), .policy-card:nth-child(3), .why-us-card:nth-child(3), .testimonial-card:nth-child(3) { transition-delay: 0.3s; }
    .service-card:nth-child(4), .policy-card:nth-child(4), .why-us-card:nth-child(4), .testimonial-card:nth-child(4) { transition-delay: 0.4s; }
    .service-card:nth-child(5), .policy-card:nth-child(5), .why-us-card:nth-child(5) { transition-delay: 0.5s; }
    .service-card:nth-child(6), .policy-card:nth-child(6), .why-us-card:nth-child(6) { transition-delay: 0.6s; }
`;
document.head.appendChild(style);

// ========================================
// Counter Animation for Stats
// ========================================

const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const targetValue = target.getAttribute('data-target');
            const targetNumber = targetValue ? parseInt(targetValue) : 0;
            
            if (!isNaN(targetNumber) && targetNumber > 0) {
                animateCounter(target, targetNumber);
            } else {
                // If no valid data-target, just show the text as is
                target.textContent = target.textContent || '0+';
            }
            counterObserver.unobserve(target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
    counterObserver.observe(stat);
});

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, stepTime);
}

// ========================================
// Form Input Formatting
// ========================================

const phoneInput = document.getElementById('phone');

if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        e.target.value = value;
    });
}

// Also format quick phone input
const quickPhoneInput = document.getElementById('quickPhone');
if (quickPhoneInput) {
    quickPhoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        e.target.value = value;
    });
}

// ========================================
// Pre-fill interest from URL
// ========================================

const urlParams = new URLSearchParams(window.location.search);
const interestParam = urlParams.get('interest');

if (interestParam) {
    const interestSelect = document.getElementById('interest');
    if (interestSelect) {
        interestSelect.value = interestParam;
    }
}

// ========================================
// Quick Quote Form - WhatsApp + EmailJS
// ========================================

const quickQuoteForm = document.getElementById('quickQuoteForm');

if (quickQuoteForm) {
    quickQuoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get submit button
        const submitBtn = quickQuoteForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
        
        const insuranceType = document.getElementById('quickInsuranceType').value;
        const phone = document.getElementById('quickPhone').value;
        
        if (!insuranceType || !phone) {
            alert('Please fill in all fields');
            return;
        }
        
        // Validate phone
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }
        
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }
        
        try {
            // Map insurance type to readable text
            const insuranceText = {
                'health': 'Health Insurance',
                'life': 'Life Insurance',
                'vehicle': 'Vehicle Insurance'
            };
            
            // Create WhatsApp message
            const message = `Hello Buggaram Linganna,%0A%0AI am interested in getting a quote for ${insuranceText[insuranceType]}.%0A%0AMy mobile number: ${phone}%0A%0APlease contact me with the best quotes.`;
            
            // Redirect to WhatsApp
            const whatsappUrl = `https://wa.me/917702040476?text=${message}`;
            window.open(whatsappUrl, '_blank');
            
            // Try to send email in background (non-blocking)
            // Check if EmailJS service is available and configured
            if (window.EmailJSService) {
                const isConfigured = window.EmailJSService.isConfigured();
                
                if (isConfigured) {
                    const emailResult = await window.EmailJSService.sendQuickQuoteEmail({
                        phone: phone,
                        insuranceType: insuranceType
                    });
                    
                    if (emailResult.success) {
                        console.log('Quick quote email sent successfully');
                    } else {
                        console.warn('Quick quote email failed:', emailResult.error);
                    }
                } else {
                    console.warn('EmailJS is not configured. Email will not be sent.');
                }
            } else {
                console.warn('EmailJSService is not available');
            }
            
            // Reset form
            quickQuoteForm.reset();
            
            // Show success message
            alert('Thank you! We will contact you shortly with the best quotes.');
            
        } catch (error) {
            console.error('Quick quote form error:', error);
            alert('An error occurred while processing your request. Please try again.');
        } finally {
            // Restore button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    });
}

// ========================================
// Console Welcome Message
// ========================================

console.log('%c🦸 Buggaram Linganna - Insurance Expert', 'color: #0066CC; font-size: 20px; font-weight: bold;');
console.log('%c30+ Years of Trust in Star Health Insurance & LIC', 'color: #666; font-size: 14px;');
console.log('%cContact: 7702040476 | 9440250476', 'color: #666; font-size: 14px;');
console.log('%cEmail: buggaramlinganna@gmail.com', 'color: #666; font-size: 14px;');

