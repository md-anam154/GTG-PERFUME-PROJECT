/**
 * GTG Perfumes - Main JavaScript
 * Handles all interactive functionality for the website
 */

'use strict';

// ===================================
// Utility Functions
// ===================================

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Animate number counter
 */
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '%';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '%';
        }
    }, 16);
}

// ===================================
// Mobile Navigation
// ===================================

class MobileNavigation {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.navMobile = document.querySelector('.nav-mobile');
        this.init();
    }

    init() {
        if (!this.hamburger || !this.navMobile) return;

        this.hamburger.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking on a link
        const navLinks = this.navMobile.querySelectorAll('.nav-link-mobile');
        navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header')) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.hamburger.classList.toggle('active');
        this.navMobile.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (this.navMobile.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMenu() {
        this.hamburger.classList.remove('active');
        this.navMobile.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===================================
// Product Gallery
// ===================================

class ProductGallery {
    constructor() {
        this.currentIndex = 0;
        this.images = document.querySelectorAll('.gallery-image');
        this.dots = document.querySelectorAll('.dot');
        this.thumbnails = document.querySelectorAll('.thumbnail');
        this.prevBtn = document.querySelector('.gallery-arrow-prev');
        this.nextBtn = document.querySelector('.gallery-arrow-next');
        this.init();
    }

    init() {
        if (!this.images.length) return;

        // Arrow navigation
        this.prevBtn?.addEventListener('click', () => this.navigate(-1));
        this.nextBtn?.addEventListener('click', () => this.navigate(1));

        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Thumbnail navigation - Disabled (thumbnails are now static)
        // this.thumbnails.forEach((thumbnail, index) => {
        //     thumbnail.addEventListener('click', () => this.goToSlide(index));
        // });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'ArrowRight') this.navigate(1);
        });

        // Touch/Swipe support
        this.initSwipe();
    }

    navigate(direction) {
        this.currentIndex += direction;
        
        if (this.currentIndex < 0) {
            this.currentIndex = this.images.length - 1;
        } else if (this.currentIndex >= this.images.length) {
            this.currentIndex = 0;
        }
        
        this.updateGallery(false); // Don't update thumbnails
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateGallery(true); // Update thumbnails only when clicked
    }

    updateGallery(updateThumbnails = true) {
        // Update images
        this.images.forEach((img, index) => {
            img.classList.toggle('active', index === this.currentIndex);
        });

        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });

        // Update thumbnails only if specified
        if (updateThumbnails) {
            this.thumbnails.forEach((thumbnail, index) => {
                thumbnail.classList.toggle('active', index === this.currentIndex);
            });
        }
    }

    initSwipe() {
        const container = document.querySelector('.gallery-main');
        if (!container) return;

        let startX = 0;
        let endX = 0;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    this.navigate(1); // Swipe left
                } else {
                    this.navigate(-1); // Swipe right
                }
            }
        });
    }
}

// ===================================
// Subscription Options & Dynamic Cart
// ===================================

class SubscriptionManager {
    constructor() {
        this.subscriptionRadios = document.querySelectorAll('input[name="subscription"]');
        this.fragranceRadios = document.querySelectorAll('input[name="fragrance"]');
        this.purchaseTypeRadios = document.querySelectorAll('input[name="purchase-type"]');
        this.addToCartBtn = document.getElementById('addToCartBtn');
        this.subscriptionCards = document.querySelectorAll('.subscription-card');
        
        this.cartLinks = {
            // Single Subscription + Fragrances
            'single-original': 'https://example.com/cart/single-original',
            'single-lily': 'https://example.com/cart/single-lily',
            'single-rose': 'https://example.com/cart/single-rose',
            
            // Double Subscription + Purchase Types
            'double-monthly': 'https://example.com/cart/double-monthly',
            'double-quarterly': 'https://example.com/cart/double-quarterly',
            'double-annual': 'https://example.com/cart/double-annual',
        };
        
        this.init();
    }

    init() {
        if (!this.addToCartBtn) return;

        // Subscription type change
        this.subscriptionRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleSubscriptionChange());
        });

        // Fragrance selection change
        this.fragranceRadios.forEach(radio => {
            radio.addEventListener('change', () => this.updateCartLink());
        });

        // Purchase type change
        this.purchaseTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.updateCartLink());
        });

        // Initial cart link
        this.updateCartLink();
    }

    handleSubscriptionChange() {
        const selectedSubscription = document.querySelector('input[name="subscription"]:checked');
        if (!selectedSubscription) return;

        // Update active card
        this.subscriptionCards.forEach(card => {
            const radio = card.querySelector('input[name="subscription"]');
            if (radio === selectedSubscription) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Hide/Show "Most Popular" badge based on selection
        const mostPopularBadge = document.getElementById('mostPopularBadge');
        if (mostPopularBadge) {
            if (selectedSubscription.value === 'double') {
                mostPopularBadge.style.display = 'none';
            } else {
                mostPopularBadge.style.display = 'block';
            }
        }

        this.updateCartLink();
    }

    updateCartLink() {
        const subscription = document.querySelector('input[name="subscription"]:checked')?.value;
        
        let cartKey = '';
        
        if (subscription === 'single') {
            const fragrance = document.querySelector('input[name="fragrance"]:checked')?.value || 'original';
            cartKey = `single-${fragrance}`;
        } else if (subscription === 'double') {
            const purchaseType = document.querySelector('input[name="purchase-type"]:checked')?.value || 'monthly';
            cartKey = `double-${purchaseType}`;
        }

        // Update the Add to Cart button href
        const cartLink = this.cartLinks[cartKey] || '#';
        this.addToCartBtn.href = cartLink;
        
        // Log for debugging
        console.log(`Cart link updated: ${cartKey} -> ${cartLink}`);
    }
}

// ===================================
// Accordion
// ===================================

class Accordion {
    constructor() {
        this.accordionItems = document.querySelectorAll('.accordion-item');
        this.init();
    }

    init() {
        if (!this.accordionItems.length) return;

        this.accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all items
                this.accordionItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const icon = otherItem.querySelector('.accordion-icon');
                    if (icon) icon.textContent = '+';
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                    const icon = item.querySelector('.accordion-icon');
                    if (icon) icon.textContent = '−';
                }
            });
        });
    }
}

// ===================================
// Stats Counter Animation
// ===================================

class StatsCounter {
    constructor() {
        this.statsSection = document.querySelector('.stats-section');
        this.statElements = document.querySelectorAll('.stat-percentage');
        this.hasAnimated = false;
        this.init();
    }

    init() {
        if (!this.statsSection || !this.statElements.length) return;

        // Use Intersection Observer for better performance
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animateStats();
                        this.hasAnimated = true;
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(this.statsSection);
    }

    animateStats() {
        this.statElements.forEach(element => {
            const target = parseInt(element.getAttribute('data-target'));
            animateCounter(element, target, 2000);
        });
    }
}

// ===================================
// Smooth Scroll
// ===================================

class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ===================================
// Lazy Loading Images
// ===================================

class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.init();
    }

    init() {
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            return;
        }

        // Fallback for browsers that don't support native lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        this.images.forEach(img => imageObserver.observe(img));
    }
}

// ===================================
// Header Scroll Effect
// ===================================

class HeaderScroll {
    constructor() {
        this.header = document.querySelector('.header');
        this.init();
    }

    init() {
        if (!this.header) return;

        const handleScroll = debounce(() => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }
}

// ===================================
// Form Validation
// ===================================

class FormValidator {
    constructor() {
        this.newsletterForm = document.querySelector('.newsletter-form');
        this.init();
    }

    init() {
        if (!this.newsletterForm) return;

        this.newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = this.newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (this.validateEmail(email)) {
                // Success - In production, this would send to a server
                alert('Thank you for subscribing!');
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

// ===================================
// Performance Optimization
// ===================================

/**
 * Preload critical images
 */
function preloadImages() {
    const criticalImages = [
        'assets/images/hero-bg.jpg',
        'assets/images/perfume-main.jpg'
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

/**
 * Add fade-in animation to sections on scroll
 */
class ScrollAnimations {
    constructor() {
        this.sections = document.querySelectorAll('section');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'fadeIn 0.6s ease-out forwards';
                    }
                });
            },
            { threshold: 0.1 }
        );

        this.sections.forEach(section => {
            section.style.opacity = '0';
            observer.observe(section);
        });
    }
}

// ===================================
// Accessibility Enhancements
// ===================================

class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        // Add skip to main content link
        this.addSkipLink();
        
        // Ensure all interactive elements are keyboard accessible
        this.enhanceKeyboardNavigation();
        
        // Add ARIA labels where needed
        this.addAriaLabels();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#product';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--color-primary);
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 100;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    enhanceKeyboardNavigation() {
        // Ensure all clickable elements are focusable
        const clickableElements = document.querySelectorAll('[onclick], .thumbnail, .dot');
        clickableElements.forEach(el => {
            if (!el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
            
            // Add keyboard support
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    el.click();
                }
            });
        });
    }

    addAriaLabels() {
        // Add aria-labels to elements that need them
        const subscriptionCards = document.querySelectorAll('.subscription-card');
        subscriptionCards.forEach((card, index) => {
            const radio = card.querySelector('input[type="radio"]');
            if (radio && !radio.hasAttribute('aria-label')) {
                radio.setAttribute('aria-label', `Subscription option ${index + 1}`);
            }
        });
    }
}

// ===================================
// Initialize All Components
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new MobileNavigation();
    new ProductGallery();
    new SubscriptionManager();
    new Accordion();
    new StatsCounter();
    new SmoothScroll();
    new LazyLoader();
    new HeaderScroll();
    new FormValidator();
    new ScrollAnimations();
    new AccessibilityEnhancer();
    
    // Preload critical images
    preloadImages();
    
    console.log('GTG Perfumes website initialized successfully! 🎉');
});

// ===================================
// Error Handling
// ===================================

window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// ===================================
// Export for testing (if needed)
// ===================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MobileNavigation,
        ProductGallery,
        SubscriptionManager,
        Accordion,
        StatsCounter,
        SmoothScroll,
        LazyLoader,
        HeaderScroll,
        FormValidator
    };
}
