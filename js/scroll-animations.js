/**
 * Scroll Reveal Animation Handler
 * Modern scroll animations using Intersection Observer API
 * Optimized for performance with minimal repaints
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        observerOptions: {
            root: null,
            rootMargin: '0px 0px -100px 0px', // Trigger animation when element is 100px from bottom
            threshold: 0
        },
        animationDuration: 700 // Match CSS animation duration
    };

    // Initialize animation observer
    function initScrollAnimations() {
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: show all elements immediately
            const elements = document.querySelectorAll('[data-animate]');
            elements.forEach(el => {
                el.dataset.animate = 'visible';
            });
            return;
        }

        // Create observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add visible class when element enters viewport
                    entry.target.setAttribute('data-animate', 'visible');
                    // Unobserve after animation triggers (element should stay visible)
                    observer.unobserve(entry.target);
                }
            });
        }, config.observerOptions);

        // Observe all animatable elements
        const animatableElements = document.querySelectorAll('[data-animate]');
        animatableElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Stagger animations for groups of elements
    function addStaggerToGroup(groupSelector, baseClass = 'stagger-') {
        const groups = document.querySelectorAll(groupSelector);
        
        groups.forEach(group => {
            const items = group.querySelectorAll('[data-animate]');
            items.forEach((item, index) => {
                // Add stagger class (1-6) based on position
                const staggerClass = baseClass + Math.min(index + 1, 6);
                item.classList.add(staggerClass);
            });
        });
    }

    // Utility: Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }

    // Initialize when DOM is ready
    function initialize() {
        // Add animations to service cards
        addStaggerToGroup('.services-grid', 'stagger-');
        
        // Add animations to fleet cards
        addStaggerToGroup('.fleet-grid', 'stagger-');
        
        // Add animations to why cards
        addStaggerToGroup('.why-grid', 'stagger-');
        
        // Start observing
        initScrollAnimations();

        // Header state: transparent at top, semi-transparent after scroll
        const header = document.querySelector('.header');
        if (header) {
            const updateHeaderState = () => {
                if (window.scrollY > 8) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            };
            updateHeaderState();
            window.addEventListener('scroll', updateHeaderState, { passive: true });
        }

        // Trigger animations for elements already in viewport (e.g., on page load)
        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach(element => {
            if (isInViewport(element)) {
                // Add small delay to let page fully load
                setTimeout(() => {
                    element.setAttribute('data-animate', 'visible');
                }, 100);
            }
        });
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Export for manual control if needed
    window.ScrollAnimations = {
        /**
         * Manually trigger animation for an element
         * @param {Element|string} element - Element or selector
         */
        animate: function(element) {
            const el = typeof element === 'string' 
                ? document.querySelector(element) 
                : element;
            if (el) {
                el.setAttribute('data-animate', 'visible');
            }
        },

        /**
         * Reset animations (unobserve all and mark as not visible)
         */
        reset: function() {
            const elements = document.querySelectorAll('[data-animate]');
            elements.forEach(el => {
                el.setAttribute('data-animate', '');
            });
            initialize();
        },

        /**
         * Get all animated elements
         * @returns {NodeList} All elements with data-animate attribute
         */
        getAnimatedElements: function() {
            return document.querySelectorAll('[data-animate]');
        }
    };

})();
