import { createClient } from 'https://esm.sh/@insforge/sdk';

const insforge = createClient({
    baseUrl: 'https://a7vbh7bb.us-east.insforge.app',
    anonKey: 'ik_d9c58a1f612782c4a01c6e8b22ded03f'
});

// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

/**
 * CONTACT FORM SUBMISSION
 * Handles the Message Report filing with a themed stamp animation and InsForge database insertion
 */
function initContactForm() {
    const form = document.querySelector('.report-form');
    const stamp = document.querySelector('.case-filed-stamp');
    const btn = document.querySelector('.send-report-btn');
    const btnText = btn?.querySelector('.btn-text');

    if (form && stamp && btn) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            const subject = document.querySelector('.custom-select-trigger span').innerText;

            if (!email || !message) {
                alert("INVESTIGATOR ERROR: Email and Message fields cannot be blank.");
                return;
            }

            // High-fidelity GSAP feedback
            gsap.to(btn, {
                scale: 0.95,
                opacity: 0.7,
                duration: 0.2,
                onComplete: () => {
                    if (btnText) btnText.innerText = "FILING REPORT...";
                }
            });

            // Slam the "CASE FILED" stamp
            gsap.fromTo(stamp, 
                { opacity: 0, scale: 3, rotation: -45 },
                { 
                    opacity: 0.8, 
                    scale: 1, 
                    rotation: -15, 
                    duration: 0.4, 
                    ease: "power4.out",
                    delay: 0.3,
                    onStart: () => {
                        // Shake effect on "impact"
                        gsap.to('.message-form-container', { 
                            x: (i) => i % 2 === 0 ? -5 : 5, 
                            duration: 0.05, 
                            repeat: 5, 
                            yoyo: true 
                        });
                    },
                    onComplete: () => {
                        // INSERTION INTO INSFORGE DATABASE
                        insforge.database.from('contacts').insert([{
                            email: email,
                            message: message,
                            subject: subject
                        }])
                        .then(({ error }) => {
                            if (!error) {
                                // Reset button state
                                gsap.to(btn, { scale: 1, opacity: 1, duration: 0.3 });
                                if (btnText) btnText.innerText = "REPORT FILED ➔";
                                form.reset();
                            } else {
                                throw error;
                            }
                        })
                        .catch(error => {
                            console.error('FILING ERROR:', error);
                            alert("COMMUNICATION FAILURE: Check your network and try again.");
                            gsap.to(btn, { scale: 1, opacity: 1, duration: 0.3 });
                            if (btnText) btnText.innerText = "RETRY REPORT ➔";
                            gsap.to(stamp, { opacity: 0, duration: 0.2 });
                        });
                    }
                }
            );
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDashboardAnimations();
    initAboutAnimations();
    initProjectsAnimations();
    initContactAnimations();
    initArchiveModal();
    initCustomSelect();
    initContactForm();
    
    // Start the global rope animation loop via GSAP Ticker for perfect sync
    gsap.ticker.add(ropeLoop);
});

// Force refresh on full window load to capture correct element positions for ropes
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    // One extra layout pass to ensure ropes are perfectly aligned after images load
    setTimeout(() => {
        ropeLoop();
        ScrollTrigger.refresh();
    }, 100);
});

function ropeLoop() {
    updateConnectingStrings();
    updateProjectConnectingStrings();
    updateHeroConnectingString();
}

function initDashboardAnimations() {
    const tl = gsap.timeline();

    // Navigation bar entrance
    tl.from('.dashboard-nav', {
        y: -100,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    });

    // Staggered hero text entry
    tl.from(['.case-meta-tag', '.dash-main-heading', '.dash-description'], {
        y: 40,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out'
    }, "-=0.3");

    // Video frame entrance
    tl.from('.video-frame-container', {
        scale: 0.95,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    }, "-=0.4");

    // Decorative elements
    tl.from(['.evidence-marker', '.red-string', '.confidential-stamp', '.corner-tape'], {
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.inOut'
    }, "-=0.3");

    // Ambient floating animations
    gsap.to('.corner-tape', {
        y: (i) => i % 2 === 0 ? 8 : -8,
        rotation: (i) => i % 2 === 0 ? "+=2" : "-=2",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });

    // Parallax background
    gsap.to('.dashboard-bg-texture', {
        y: 100,
        scrollTrigger: {
            trigger: '.storm-dashboard',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });

    // Button Hover Effects
    const evidenceBtn = document.querySelector('.view-evidence-btn');
    if (evidenceBtn) {
        evidenceBtn.addEventListener('mouseenter', () => {
            gsap.to(evidenceBtn, { scale: 1.05, filter: 'brightness(1.1)', duration: 0.2 });
        });
        evidenceBtn.addEventListener('mouseleave', () => {
            gsap.to(evidenceBtn, { scale: 1, filter: 'brightness(1)', duration: 0.2 });
        });
    }
}

function initAboutAnimations() {
    // Entrance animation for the Dossier File
    gsap.from('.dossier-file', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top 80%',
        },
        x: 80,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out'
    });

    // Staggered entrance for Evidence Board elements
    gsap.from('.evidence-board .pinned-item', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out'
    });

    // Flashlight beam animation
    gsap.fromTo('.flashlight-beam', 
        { opacity: 0 },
        { 
            scrollTrigger: {
                trigger: '#about',
                start: 'top 60%',
            },
            opacity: 1, 
            duration: 0.4 
        }
    );

    // Hover animations for Skill Badges
    const skillBadges = document.querySelectorAll('.skill-badge');
    skillBadges.forEach(badge => {
        badge.addEventListener('mouseenter', () => {
            gsap.to(badge, { scale: 1.05, boxShadow: '0 0 15px #FFD966', duration: 0.2 });
        });
        badge.addEventListener('mouseleave', () => {
            gsap.to(badge, { scale: 1, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)', duration: 0.2 });
        });
    });

    // 3D Tilt Effect on mouse move
    const dashboard = document.querySelector('.about-dashboard');
    if (dashboard) {
        dashboard.addEventListener('mousemove', (e) => {
            // Reduce calculations on small screens
            if (window.innerWidth < 768) return;

            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            const xPos = (clientX / innerWidth) - 0.5;
            const yPos = (clientY / innerHeight) - 0.5;

            gsap.to('.pinned-item', {
                rotateY: xPos * 10,
                rotateX: -yPos * 10,
                duration: 0.5,
                ease: 'power2.out',
                lazy: false // Force immediate DOM write for rope sync
            });

            gsap.to('.dossier-file', {
                rotateY: xPos * 5,
                rotateX: -yPos * 2,
                duration: 0.5,
                ease: 'power2.out',
                lazy: false
            });
        });
        
        // Tilt slightly on device orientation if desired? 
        // For now, just a static slight tilt or center it
        window.addEventListener('resize', () => {
            if (window.innerWidth < 768) {
                gsap.set(['.pinned-item', '.dossier-file'], { rotateX: 0, rotateY: 0 });
            }
        });
    }
}

function updateConnectingStrings() {
    const pins = [
        document.getElementById('pin-red'),
        document.getElementById('pin-yellow-2'),
        document.getElementById('pin-yellow-1')
    ];
    const rope = document.getElementById('rope-path');
    const svg = rope ? rope.closest('svg') : null;

    const knotGroup = document.getElementById('rope-knots');

    if (!pins[0] || !rope || !svg) return;

    const svgRect = svg.getBoundingClientRect();
    let pathData = "";

    // Clear and redraw knots
    if (knotGroup) knotGroup.innerHTML = '';

    pins.forEach((pin, index) => {
        const pinRect = pin.getBoundingClientRect();
        
        // Calculate center of pin relative to SVG
        const x = (pinRect.left + pinRect.width / 2) - svgRect.left;
        const y = (pinRect.top + pinRect.height / 2) - svgRect.top;

        if (index === 0) {
            pathData = `M ${x} ${y}`;
        } else {
            // Get previous pin coordinates
            const prevPinRect = pins[index - 1].getBoundingClientRect();
            const px = (prevPinRect.left + prevPinRect.width / 2) - svgRect.left;
            const py = (prevPinRect.top + prevPinRect.height / 2) - svgRect.top;

            // Calculate midpoint and add sag (vertically downwards)
            const midX = (x + px) / 2;
            const midY = (y + py) / 2 + 140; // Increased sag for ultra-loose effect

            pathData += ` Q ${midX} ${midY} ${x} ${y}`;
        }

        if (knotGroup) {
            const knot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            knot.setAttribute("r", "3.5"); // Refined size for thinner rope
            knot.setAttribute("class", "rope-knot");
            knotGroup.appendChild(knot);

            // Add a pin head in the SVG so it stays on top of the rope
            const pinHead = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            pinHead.setAttribute("cx", x);
            pinHead.setAttribute("cy", y);
            pinHead.setAttribute("r", "5"); // Refined size for thinner rope
            // Determine color based on original pin classes
            if (pin.classList.contains('red-pin')) {
                pinHead.setAttribute("fill", "#D96B4A");
            } else {
                pinHead.setAttribute("fill", "#FFD24A");
            }
            pinHead.setAttribute("stroke", "rgba(0,0,0,0.2)");
            pinHead.setAttribute("stroke-width", "1");
            knotGroup.appendChild(pinHead);
        }
    });

    rope.setAttribute('d', pathData);
}

function updateProjectConnectingStrings() {
    const pins = [
        document.getElementById('proj-pin-1'),
        document.getElementById('proj-pin-2'),
        document.getElementById('proj-pin-3'),
        document.getElementById('proj-pin-4')
    ];
    const rope = document.getElementById('proj-rope-path');
    const svg = rope ? rope.closest('svg') : null;
    const knotGroup = document.getElementById('proj-rope-knots');

    if (!pins[0] || !rope || !svg) return;

    const svgRect = svg.getBoundingClientRect();
    let pathData = "";

    // Clear and redraw knots
    if (knotGroup) knotGroup.innerHTML = '';

    pins.forEach((pin, index) => {
        if (!pin) return;
        const pinRect = pin.getBoundingClientRect();
        
        const x = (pinRect.left + pinRect.width / 2) - svgRect.left;
        const y = (pinRect.top + pinRect.height / 2) - svgRect.top;

        if (index === 0) {
            pathData = `M ${x} ${y}`;
        } else {
            // Get previous pin coordinates
            const prevPin = pins[index - 1];
            if (prevPin) {
                const prevPinRect = prevPin.getBoundingClientRect();
                const px = (prevPinRect.left + prevPinRect.width / 2) - svgRect.left;
                const py = (prevPinRect.top + prevPinRect.height / 2) - svgRect.top;

                const midX = (x + px) / 2;
                const midY = (y + py) / 2 + 120; // 120px sag for project grid

                pathData += ` Q ${midX} ${midY} ${x} ${y}`;
            }
        }

        // Add a knot at each pin location
        if (knotGroup) {
            const knot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            knot.setAttribute("cx", x);
            knot.setAttribute("cy", y);
            knot.setAttribute("r", "3.5");
            knot.setAttribute("class", "rope-knot");
            knotGroup.appendChild(knot);

            const pinHead = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            pinHead.setAttribute("cx", x);
            pinHead.setAttribute("cy", y);
            pinHead.setAttribute("r", "5");
            if (pin.classList.contains('red-pin')) {
                pinHead.setAttribute("fill", "#D96B4A");
            } else {
                pinHead.setAttribute("fill", "#FFD24A");
            }
            pinHead.setAttribute("stroke", "rgba(0,0,0,0.2)");
            pinHead.setAttribute("stroke-width", "1");
            knotGroup.appendChild(pinHead);
        }
    });

    rope.setAttribute('d', pathData);
}

function initProjectsAnimations() {
    // 1. Staggered card entry - Optimized for high-fidelity stability
    gsap.from('.evidence-card', {
        scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true
        },
        y: 50,
        autoAlpha: 0,
        rotation: (i) => i % 2 === 0 ? -3 : 3,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
        force3D: true, // Force hardware acceleration
        clearProps: 'opacity,visibility' // Don't clear transform yet as ropes need it
    });

    // 2. Header slide down
    gsap.from('.archive-header', {
        scrollTrigger: {
            trigger: '.evidence-archive',
            start: 'top 85%',
            once: true
        },
        y: -30,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'all'
    });

    // 3. CTA Button Pulse
    const ctaBtn = document.querySelector('.archive-cta-btn');
    if (ctaBtn) {
        gsap.to(ctaBtn, {
            boxShadow: '0 0 30px rgba(255, 210, 74, 0.6)',
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    // 4. Evidence Card Hovers (GSAP for rope sync)
    const cards = document.querySelectorAll('.evidence-card');
    cards.forEach(card => {
        // Get initial rotation from class
        const initialRotate = card.classList.contains('card-rotate-left') ? -1.5 : 1.5;
        
        // Ensure initial state
        gsap.set(card, { rotation: initialRotate });

        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                rotation: 0,
                autoAlpha: 1, 
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto',
                lazy: false,
                force3D: true,
                onUpdate: () => ropeLoop()
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotation: initialRotate,
                autoAlpha: 1,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)',
                overwrite: 'auto',
                lazy: false,
                force3D: true,
                onUpdate: () => ropeLoop()
            });
        });
    });

    // 4. Ambient Dust Particles
    const dustContainer = document.querySelector('.dust-container');
    if (dustContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'dust-particle';
            dustContainer.appendChild(particle);
            
            // Random initial position
            gsap.set(particle, {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: Math.random() * 0.3
            });

            // Random drift
            gsap.to(particle, {
                x: `+=${Math.random() * 100 - 50}`,
                y: `+=${Math.random() * 100 - 50}`,
                opacity: Math.random() * 0.5,
                duration: 5 + Math.random() * 5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }
    }

    // Dust particle styles (injected via JS for simplicity or added to CSS)
    const style = document.createElement('style');
    style.textContent = `
        .dust-particle {
            position: absolute;
            width: 2px;
            height: 2px;
            background: #fff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 5;
        }
    `;
    document.head.appendChild(style);
}

function initContactAnimations() {
    // 1. Header Entrance
    gsap.from('.contact-header', {
        scrollTrigger: {
            trigger: '.contact-dashboard',
            start: 'top 70%'
        },
        y: -50,
        opacity: 0,
        scale: 0.9,
        duration: 1,
        ease: 'power3.out'
    });

    // 2. Tapes Slide Entrance
    gsap.from('.contact-tape', {
        scrollTrigger: {
            trigger: '.contact-tapes',
            start: 'top 80%'
        },
        x: (i) => i % 2 === 0 ? -100 : 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
    });

    // 3. Blood Splatter Fade
    gsap.from('.splatter', {
        scrollTrigger: {
            trigger: '.contact-dashboard',
            start: 'top 60%'
        },
        opacity: 0,
        scale: 0.5,
        duration: 1.5,
        stagger: 0.3,
        ease: 'sine.out'
    });

    // 4. Form Entrance
    gsap.from('.message-form-container', {
        scrollTrigger: {
            trigger: '.message-form-container',
            start: 'top 85%'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });

    // 5. Bullet Casing Entrance
    gsap.from('.bullet-casing', {
        scrollTrigger: {
            trigger: '.message-form-container',
            start: 'top 80%'
        },
        x: -100,
        rotation: -90,
        opacity: 0,
        duration: 1.2,
        delay: 0.5,
        ease: 'power2.out'
    });
    
    // 6. Send Button Pulse
    const sendBtn = document.querySelector('.send-report-btn');
    if (sendBtn) {
        gsap.to(sendBtn, {
            boxShadow: '0 0 25px rgba(255, 224, 59, 0.4)',
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

function updateHeroConnectingString() {
    const pinLeft = document.getElementById('hero-pin-left');
    const pinRight = document.getElementById('hero-pin-right');
    const rope = document.getElementById('hero-rope-path');
    const svg = rope ? rope.closest('svg') : null;
    const knotGroup = document.getElementById('hero-rope-knots');

    if (!pinLeft || !pinRight || !rope || !svg) return;

    const svgRect = svg.getBoundingClientRect();
    const rectL = pinLeft.getBoundingClientRect();
    const rectR = pinRight.getBoundingClientRect();

    // Calculate center of pins relative to SVG
    const x1 = (rectL.left + rectL.width / 2) - svgRect.left;
    const y1 = (rectL.top + rectL.height / 2) - svgRect.top;
    const x2 = (rectR.left + rectR.width / 2) - svgRect.left;
    const y2 = (rectR.top + rectR.height / 2) - svgRect.top;

    // Create a quadratic bezier for the "loose" effect
    // Control point is mid-way horizontally and offset downwards
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 + 160; // Massive 160px sag for hero

    const pathData = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
    rope.setAttribute('d', pathData);

    // Update knots/pin heads
    if (knotGroup) {
        knotGroup.innerHTML = '';
        [ {x: x1, y: y1, color: "#D96B4A"}, {x: x2, y: y2, color: "#FFD24A"} ].forEach(pos => {
            const knot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            knot.setAttribute("cx", pos.x);
            knot.setAttribute("cy", pos.y);
            knot.setAttribute("r", "3.5");
            knot.setAttribute("class", "rope-knot");
            knotGroup.appendChild(knot);

            const pinHead = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            pinHead.setAttribute("cx", pos.x);
            pinHead.setAttribute("cy", pos.y);
            pinHead.setAttribute("r", "5");
            pinHead.setAttribute("fill", pos.color);
            pinHead.setAttribute("stroke", "rgba(0,0,0,0.2)");
            pinHead.setAttribute("stroke-width", "1");
            knotGroup.appendChild(pinHead);
        });
    }
}

function initArchiveModal() {
    const modal = document.getElementById('project-archive-modal');
    const openBtn = document.querySelector('.archive-cta-btn');
    const mainCard = document.querySelector('.case-file-main-card');
    const paperLayers = document.querySelectorAll('.paper-layer');
    const policeTape = document.querySelector('.police-tape-diagonal');

    // Dynamic Selectors
    const tabsContainer = document.getElementById('dynamic-tabs-container');
    const mainTitle = document.getElementById('dynamic-main-title');
    const subTitle = document.getElementById('dynamic-sub-title');
    const caseNoText = document.getElementById('dynamic-case-no');
    const statusText = document.getElementById('dynamic-status');
    const evidenceList = document.getElementById('dynamic-evidence-list');
    const projectDesc = document.getElementById('dynamic-project-desc');
    const photoStack = document.getElementById('dynamic-photo-stack');
    const accessAdditionalBtn = document.querySelector('.access-additional-btn');

    if (!modal || !openBtn) return;

    const DEFAULT_PROJECTS = [
        {
            name: 'KADIXA DIGITAL SOLUTIONS',
            subTitle: 'DIGITAL SOLUTIONS COMPANY',
            caseNo: '#0713-KDX',
            description: 'KADIXA is a digital solutions company that builds modern websites, mobile apps, and custom software. We focus on clean design, smooth performance, and practical solutions to help businesses grow online.',
            status: 'ACTIVE',
            evidence: [
                'Modern Website Development',
                'Mobile App Solutions',
                'Custom Software Delivery',
                'Clean UI and Performance Optimization'
            ],
            media: [
                { type: 'video', url: '/assets/evidence_01.mp4' },
                { type: 'image', url: '/assets/evidence_01.png' }
            ],
            additionalLink: 'https://isan4f4e.insforge.site'
        },
        {
            name: 'WILDLIFE PHOTOGRAPHY PORTFOLIO',
            subTitle: 'CINEMATIC PHOTOGRAPHY EXPERIENCE',
            caseNo: '#0713-WLD',
            description: 'A cinematic wildlife photography portfolio website crafted with a premium, immersive aesthetic. Designed to blend storytelling with nature-inspired visuals, the website features a bold full-screen hero section, smooth modern UI, elegant typography, and a dark earthy color palette that enhances the beauty of wildlife photography.',
            status: 'ACTIVE',
            evidence: [
                'Stunning fullscreen wildlife imagery',
                'Minimal yet powerful navigation',
                'Professional "About Me" storytelling',
                'Smooth modern layout with responsive design',
                'Nature-inspired visual atmosphere',
                'Strong focus on photography presentation'
            ],
            media: [
                { type: 'image', url: '/assets/evidence_02.png' },
                { type: 'image', url: '/assets/evidence_02_5.png' }
            ],
            additionalLink: 'https://prithibi17.github.io/photo-web/'
        },
        {
            name: 'FUTURISTIC CITYSCAPE',
            subTitle: 'URBAN ARCHITECTURE R&D',
            caseNo: '#0713-CTY',
            description: 'Exploration of futuristic urban environments, blending neon aesthetics with sustainable architecture concepts. This project focused on creating immersive 3D environments for next-generation digital experiences.',
            status: 'ARCHIVED',
            evidence: [
                'Next-Gen 3D Modeling',
                'Neon Lighting Systems',
                'Sustainable Urban Concepts',
                'Immersive Environment Design'
            ],
            media: [
                { type: 'image', url: '/assets/proj_cityscape.png' }
            ],
            additionalLink: '#'
        },
        {
            name: 'SCIFI INTERFACE DESIGN',
            subTitle: 'TACTICAL HUD SYSTEMS',
            caseNo: '#0713-HUD',
            description: 'Development of advanced tactical HUDs and UI systems for cinematic and gaming applications. Focused on data visualization, functional aesthetics, and high-fidelity motion graphics.',
            status: 'ARCHIVED',
            evidence: [
                'Tactical UI Development',
                'Data Visualization',
                'Motion Graphics Design',
                'Functional Scifi Aesthetics'
            ],
            media: [
                { type: 'image', url: '/assets/proj_scifi.png' }
            ],
            additionalLink: '#'
        }
    ];

    let projectsData = [...DEFAULT_PROJECTS];
    let currentAdditionalLink = '';

    // Fetch projects from InsForge database with silent fallback to static data
    async function fetchProjects() {
        try {
            const { data, error } = await insforge.database
                .from('projects')
                .select('*')
                .order('created_at', { ascending: true });

            if (!error && data && data.length > 0) {
                // Append database projects that aren't already in our static list
                const dbProjects = data.map(proj => ({
                    ...proj,
                    caseNo: proj.case_no || proj.caseNo || `#${Math.floor(Math.random() * 9000) + 1000}`,
                    evidence: Array.isArray(proj.evidence) ? proj.evidence : (proj.evidence ? proj.evidence.split(',') : []),
                    media: Array.isArray(proj.media) ? proj.media : (proj.url ? [{type: proj.type || 'image', url: proj.url}] : [])
                }));
                
                // Combine and ensure uniqueness (simple name-based check)
                const existingNames = new Set(DEFAULT_PROJECTS.map(p => p.name));
                const uniqueDbProjects = dbProjects.filter(p => !existingNames.has(p.name));
                
                projectsData = [...DEFAULT_PROJECTS, ...uniqueDbProjects];
            }
        } catch (err) {
            console.warn('DATABASE OFFLINE: Using local cached evidence files.', err);
        }
    }

    function renderTabs() {
        tabsContainer.innerHTML = '';
        projectsData.forEach((proj, index) => {
            const tab = document.createElement('div');
            tab.className = `case-nav-tab ${index === 0 ? 'active' : ''}`;
            tab.innerHTML = `${proj.name} <span class="tab-arrow">▶</span>`;
            tab.addEventListener('click', () => {
                document.querySelectorAll('.case-nav-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                updateProjectContent(proj);
            });
            tabsContainer.appendChild(tab);
        });
    }

    function updateProjectContent(proj) {
        // Animate out content before updating (optional but smoother)
        gsap.to([mainTitle, subTitle, caseNoText, evidenceList, projectDesc, photoStack], {
            opacity: 0,
            x: -10,
            duration: 0.2,
            onComplete: () => {
                mainTitle.textContent = proj.name;
                subTitle.textContent = proj.subTitle;
                caseNoText.textContent = proj.caseNo;
                statusText.textContent = proj.status;
                projectDesc.textContent = proj.description;
                currentAdditionalLink = proj.additionalLink || '';

                // Update Evidence List
                evidenceList.innerHTML = proj.evidence
                    .map(item => `<li><span class="star-icon">✦</span> ${item}</li>`)
                    .join('');

                // Update media (supports both image and video)
                const projectMedia = Array.isArray(proj.media) && proj.media.length > 0
                    ? proj.media
                    : (proj.photos || []).map((url) => ({ type: 'image', url }));

                photoStack.innerHTML = projectMedia
                    .map((item, i) => `
                        <div class="forensic-frame frame-${i + 1}">
                            ${item.type === 'video'
                                ? `<video autoplay loop muted playsinline aria-label="Project evidence video"><source src="${item.url}" type="video/mp4"></video>`
                                : `<img src="${item.url}" alt="Project evidence ${i + 1}">`
                            }
                        </div>
                    `).join('');

                // Animate back in
                gsap.to([mainTitle, subTitle, caseNoText, evidenceList, projectDesc, photoStack], {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: 'power2.out'
                });
            }
        });
    }

    async function openModal() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Wait for projects if they aren't loaded yet
        if (projectsData.length === 0) {
            await fetchProjects();
        }
        
        renderTabs();
        updateProjectContent(projectsData[0]);

        const tl = gsap.timeline();

        // Overlay fade in
        tl.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.4 });

        // Paper layers and main card slide up
        tl.fromTo([paperLayers, mainCard], 
            { y: 100, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'back.out(1.2)' }, 
            "-=0.2"
        );

        // Content entrance
        tl.fromTo('.case-content-area', 
            { x: -30, opacity: 0 }, 
            { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 
            "-=0.5"
        );

        // Tabs staggered entry from right
        tl.fromTo('.case-nav-tab', 
            { x: 40, opacity: 0 }, 
            { x: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }, 
            "-=0.5"
        );

        // Police Tape slide in
        tl.fromTo(policeTape, 
            { x: -200, opacity: 0 }, 
            { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
            "-=0.8"
        );
    }

    function closeModal() {
        gsap.to(modal, { 
            opacity: 0, 
            duration: 0.3, 
            onComplete: () => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            } 
        });
    }

    openBtn.addEventListener('click', openModal);

    if (accessAdditionalBtn) {
        accessAdditionalBtn.addEventListener('click', () => {
            if (currentAdditionalLink) {
                window.open(currentAdditionalLink, '_blank', 'noopener,noreferrer');
            }
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
    });
}

function initCustomSelect() {
    const customSelect = document.getElementById('subject-select');
    if (!customSelect) return;

    const trigger = customSelect.querySelector('.custom-select-trigger');
    const options = customSelect.querySelectorAll('.custom-option');
    const hiddenInput = document.getElementById('report-type-hidden');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('open');
    });

    options.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const value = this.getAttribute('data-value');
            const text = this.textContent;

            // Update UI
            trigger.querySelector('span').textContent = text;
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            // Update hidden input
            hiddenInput.value = value;

            // Close dropdown
            customSelect.classList.remove('open');
        });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });
}
