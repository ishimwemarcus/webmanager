document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initHeaderScroll();
    initRevealAnimations();
    initSmoothScrolling();
    initMagneticButtons();
    initHeroParallax();
    initCustomCursor();
    initBackToTop();
    initMovingImageHover();
});

/**
 * Moving Image Hover: GSAP logic for floating images on showcase items.
 */
function initMovingImageHover() {
    const items = document.querySelectorAll('.showcase-item');
    
    items.forEach(item => {
        const wrapper = item.querySelector('.floating-img-wrapper');
        
        item.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            
            // GSAP for ultra-smooth movement following the cursor
            gsap.to(wrapper, {
                x: clientX - 125, // Offset to center the 250px wide image
                y: clientY - 90,  // Offset to center the 180px high image
                duration: 0.6,
                ease: "power3.out"
            });
        });
        
        item.addEventListener('mouseenter', () => {
            gsap.to(wrapper, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: "back.out(1.7)"
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(wrapper, {
                scale: 0,
                opacity: 0,
                duration: 0.4,
                ease: "power3.inOut"
            });
        });
    });
}

/**
 * Premium Loader: Simulates loading and then reveals content.
 */
function initLoader() {
    const loader = document.getElementById('loader');
    const progressBar = document.querySelector('.loader-progress');
    const body = document.body;

    if (!loader || !progressBar) return;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = `${progress}%`;

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                body.classList.remove('loading');
            }, 500);
        }
    }, 200);
}

/**
 * Custom Cursor: Smoothly following dot and ring.
 */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const follower = document.getElementById('cursor-follower');
    
    if (!cursor || !follower) return;

    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        
        cursor.style.left = `${clientX}px`;
        cursor.style.top = `${clientY}px`;
        
        follower.style.left = `${clientX}px`;
        follower.style.top = `${clientY}px`;
    });

    // Hover effects
    const hoverables = document.querySelectorAll('a, button, .showcase-item');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            follower.style.width = '80px';
            follower.style.height = '80px';
            follower.style.background = 'rgba(255, 95, 0, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            follower.style.width = '40px';
            follower.style.height = '40px';
            follower.style.background = 'transparent';
        });
    });
}

/**
 * Back to Top: Shows/hides button based on scroll position.
 */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Header scroll effect: Adds 'scrolled' class when page is scrolled down.
 */
function initHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Reveal Animation: Elements with 'reveal' class fade in on scroll.
 */
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
}

/**
 * Smooth Scrolling: For all internal anchor links.
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId.startsWith('#')) return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Magnetic Button Effect: Premium interaction for CTA buttons.
 */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-cta');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0, 0)`;
        });
    });
}

/**
 * Hero Parallax: Subtle movement for floating food and background elements.
 */
function initHeroParallax() {
    const hero = document.getElementById('hero');
    const floatFood = document.querySelector('.hero-food-float');
    
    if (!hero || !floatFood) return;

    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const moveX = (clientX - centerX) / 50;
        const moveY = (clientY - centerY) / 50;

        floatFood.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${5 + moveX * 0.1}deg)`;
    });
}
