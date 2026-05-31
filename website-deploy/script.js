document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const enterBtn = document.getElementById('enter-btn');
    const entryScreen = document.getElementById('entry-screen');
    const dashboard = document.getElementById('dashboard');
    const header = document.getElementById('main-header');

    // Splash Animation - Tech style
    const splashTl = gsap.timeline();

    splashTl.from('.main-shield', {
        duration: 1.2,
        scale: 0,
        opacity: 0,
        y: 20,
        ease: 'back.out(1.7)',
    })
        .from('#main-logo-text', {
            duration: 1,
            opacity: 0,
            filter: 'blur(10px)',
            y: 10,
            ease: 'power3.out',
        }, '-=0.6');

    // Header scroll background
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Enter sequence (Transition + Dashboard intro)
    // Removed enterBtn listener, fires automatically 2 seconds after splash finishes
    const transitionTl = gsap.timeline({ delay: 2.5 });

    // 1. Tech wipe out of entry screen
    transitionTl.to('#entry-screen > *', {
        duration: 0.5,
        opacity: 0,
        y: -20,
        stagger: 0.1,
        ease: 'power2.in',
    });

    transitionTl.to(entryScreen, {
        duration: 0.8,
        clipPath: 'circle(0% at 50% 50%)',
        ease: 'power4.inOut',
        onComplete: () => {
            entryScreen.style.display = 'none';
        }
    });

    // 2. Show dashboard
    transitionTl.call(() => {
        dashboard.style.display = 'block';
        dashboard.style.opacity = '1';
    }, [], '-=0.2');

    const logoEl = document.getElementById('logo-text');
    const heroContent = document.getElementById('hero-content');
    const headerNav = document.querySelector('.header-nav');
    const scrollHint = document.getElementById('scroll-hint');
    const headerLogo = document.getElementById('header-logo');
    const techBg = document.querySelector('.tech-background');
    const glowOrb = document.querySelector('.glow-orb');

    // Setup initial states for dashboard
    gsap.set([logoEl, heroContent, headerNav, scrollHint, headerLogo, techBg, glowOrb], { opacity: 0 });
    gsap.set(heroContent, { y: 30 });
    gsap.set(techBg, { scale: 1.1 });
    gsap.set(glowOrb, { scale: 0.5 });

    // 3. Fade in tech background elements
    transitionTl.to(techBg, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'power2.out'
    }, '+=0.1');

    transitionTl.to(glowOrb, {
        opacity: 1,
        scale: 1,
        duration: 2,
        ease: 'power2.out'
    }, '-=1.2');

    // 4. Fade in centered "Secure Pro" giant text
    transitionTl.fromTo(logoEl,
        { opacity: 0, scale: 0.8, filter: 'blur(20px)' },
        {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1,
            ease: 'power3.out'
        }, '-=1');

    // 5. Instead of auto-morphing, we setup the scroll logic for the logo
    // Wait for tech BG and initial logo fade to complete
    transitionTl.call(() => {
        setupHeroScrollAnimation(logoEl, headerLogo);
    });

    // 6. Fade in hero description and nav
    transitionTl.to(heroContent, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
    }, '-=0.3');

    transitionTl.to(headerNav, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
    }, '-=0.4');

    transitionTl.to(scrollHint, {
        opacity: 0.8,
        duration: 0.5,
        ease: 'power2.out',
    }, '-=0.2');

    // 7. Setup scroll triggers for features and download
    setupScrollTriggers();

    function setupScrollTriggers() {
        const featEls = ['#feat-eyebrow', '#feat-heading'];

        gsap.set(featEls, { y: 30, opacity: 0 });
        gsap.set('.feature-card', { y: 50, opacity: 0, scale: 0.95 });

        featEls.forEach((sel, i) => {
            gsap.to(sel, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: i * 0.15,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '#features',
                    start: 'top 80%',
                }
            });
        });

        gsap.to('.feature-card', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'back.out(1.2)',
            scrollTrigger: {
                trigger: '#features-grid',
                start: 'top 80%',
            }
        });

        // Download Section
        gsap.set(['#dl-eyebrow', '#dl-heading', '#dl-sub'], { y: 30, opacity: 0 });
        gsap.set('.dl-card', { y: 50, scale: 0.95, opacity: 0 });
        gsap.set('#dl-meta', { y: 20, opacity: 0 });

        const dlEls = ['#dl-eyebrow', '#dl-heading', '#dl-sub'];
        dlEls.forEach((sel, i) => {
            gsap.to(sel, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                delay: i * 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#download',
                    start: 'top 80%',
                }
            });
        });

        gsap.to('.dl-card', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'back.out(1.2)',
            scrollTrigger: {
                trigger: '#download-buttons',
                start: 'top 80%',
            }
        });

        gsap.to('#dl-meta', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '#download-buttons',
                start: 'top 80%',
            }
        });
    }

    function setupHeroScrollAnimation(logoEl, headerLogo) {
        // Prepare header logo
        gsap.set(headerLogo, { opacity: 0, x: -50, scale: 0.5 });

        // Pin the hero section so the content stays while we scroll and morph
        // Actually, let's just use scrub to modify the text itself

        const scrollAnimTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#dashboard',
                start: 'top top',
                end: '500px top', // After 500px of scroll, animation completes
                scrub: 1, // Smooth scrubbing
            }
        });

        // Morph giant text OUT
        scrollAnimTl.to(logoEl, {
            opacity: 0,
            scale: 0.2,
            y: -50,
            filter: 'blur(10px)',
            ease: 'power1.inOut'
        }, 0);

        // Morph the blobs away slightly to clear the reading area
        scrollAnimTl.to('.morphic-blobs-container', {
            opacity: 0.3,
            scale: 0.8,
            y: -100,
            ease: 'power1.inOut'
        }, 0);

        // Bring the header logo IN
        scrollAnimTl.to(headerLogo, {
            opacity: 1,
            x: 0,
            scale: 1,
            ease: 'power1.inOut'
        }, 0.2); // Starts slightly after scroll begins
    }

    // Parallax effect on tech background
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        gsap.to('.tech-background', {
            x: -x,
            y: -y,
            duration: 1,
            ease: 'power2.out'
        });

        gsap.to('.glow-orb', {
            x: -x * 2,
            y: -y * 2,
            duration: 1,
            ease: 'power2.out'
        });
    });
});

