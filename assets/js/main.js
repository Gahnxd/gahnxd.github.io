// Document ready function
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animation controller
    initScrollAnimationController();
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        if (hamburger.classList.contains('active')) {
            hamburger.style.backgroundColor = 'transparent';
            hamburger.style.transform = 'rotate(45deg)';
            hamburger.querySelector('::before').style.transform = 'rotate(90deg)';
            hamburger.querySelector('::after').style.transform = 'rotate(90deg)';
        } else {
            hamburger.style.backgroundColor = 'var(--text-color)';
            hamburger.style.transform = 'rotate(0)';
        }
    });
});

// Animate elements when they come into view
document.addEventListener('DOMContentLoaded', () => {
    // Add reveal classes to elements that should animate on scroll
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionHeader = section.querySelector('.section-header');
        if (sectionHeader) {
            sectionHeader.classList.add('reveal');
        }
        
        const contentElements = section.querySelectorAll('.about-content, .project-cards, .contact-content, .about-text, .skills, .education, .experience');
        contentElements.forEach(element => {
            element.classList.add('reveal');
        });
        
        // Add alternating reveal directions for visual interest
        const leftElements = section.querySelectorAll('.about-text, .contact-info');
        leftElements.forEach(element => {
            element.classList.remove('reveal');
            element.classList.add('reveal-left');
        });
        
        const rightElements = section.querySelectorAll('.skills, .contact-form');
        rightElements.forEach(element => {
            element.classList.remove('reveal');
            element.classList.add('reveal-right');
        });
    });
    
    // Intersection Observer for reveal animations
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    
    // Observe all elements with reveal classes
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(element => {
        revealObserver.observe(element);
    });
    
    // Intersection Observer for skill bars
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('style').split('width: ')[1].split('%')[0];
                entry.target.style.width = '0%';
                setTimeout(() => {
                    entry.target.style.width = width + '%';
                }, 200);
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
    
    // Project cards staggered animation
    const projectCards = document.querySelectorAll('.project-card');
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 100);
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    projectCards.forEach(card => {
        card.classList.add('reveal');
        cardObserver.observe(card);
    });
});

// Mobile device detection
const isMobile = 'ontouchstart' in window;

// Animation control variables
let lastScrollTop = 0;
let scrollDirection = 'down';
let animationsPaused = false;
let animationSpeed = 1;
let animationElements = [];

// Initialize scroll animation controller
function initScrollAnimationController() {
    // Get all animated elements
    animationElements = document.querySelectorAll('.animate-text, .reveal, .reveal-left, .reveal-right, .project-card, .skill-progress');
    
    // Set initial animation state
    updateAnimationState('down', false);
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    console.log('Scroll animation controller initialized');
}

// Handle scroll events
function handleScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    
    // Determine scroll direction
    if (st > lastScrollTop) {
        // Scrolling down
        if (scrollDirection !== 'down') {
            scrollDirection = 'down';
            updateAnimationState('down', false);
        }
    } else if (st < lastScrollTop) {
        // Scrolling up
        if (scrollDirection !== 'up') {
            scrollDirection = 'up';
            updateAnimationState('up', false);
        }
    }
    
    // If user stops scrolling for a moment, pause animations
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        if (!animationsPaused) {
            animationsPaused = true;
            updateAnimationState(scrollDirection, true);
        }
    }, 150);
    
    // Reset pause state when scrolling
    if (animationsPaused) {
        animationsPaused = false;
        updateAnimationState(scrollDirection, false);
    }
    
    lastScrollTop = st <= 0 ? 0 : st;
}

// Update animation state based on scroll direction and pause state
function updateAnimationState(direction, paused) {
    // Set animation speed and direction
    animationSpeed = paused ? 0 : (direction === 'up' ? -1 : 1);
    
    // Apply to CSS animations
    document.documentElement.style.setProperty('--animation-direction', animationSpeed);
    
    // Apply to background animations
    const bgAnimations = document.querySelectorAll('.bg-animation');
    bgAnimations.forEach(anim => {
        if (paused) {
            anim.style.animationPlayState = 'paused';
        } else {
            anim.style.animationPlayState = 'running';
            anim.style.animationDirection = direction === 'up' ? 'reverse' : 'normal';
        }
    });
    
    console.log(`Animations ${paused ? 'paused' : 'running'}, direction: ${direction}`);
}

// Load data from JSON files
function loadData() {
    // Load projects data
    fetch('assets/data/projects.json')
        .then(response => response.json())
        .then(data => {
            console.log('Projects data loaded:', data);
            if (data.projects && Array.isArray(data.projects)) {
                populateProjects(data.projects);
                populateFeaturedProjects(data.projects);
            } else {
                console.error('Projects data is not in expected format:', data);
            }
        })
        .catch(error => console.error('Error loading projects data:', error));
    
    // Load contact data
    fetch('assets/data/contacts.json')
        .then(response => response.json())
        .then(data => {
            console.log('Contact data loaded:', data);
            populateContactInfo(data);
        })
        .catch(error => console.error('Error loading contact data:', error));
}

// Populate projects from JSON data
function populateProjects(projects) {
    // Find project containers
    const projectsContainer = document.querySelector('.projects-grid');
    if (!projectsContainer) return;
    
    // Clear existing content
    projectsContainer.innerHTML = '';
    
    // Auto-generate categories from projects
    const categories = new Set();
    categories.add('all'); // Always include 'all' category
    
    projects.forEach(project => {
        if (project.category) {
            categories.add(project.category);
        }
    });
    
    // Update filter buttons if they exist
    const filterContainer = document.querySelector('.project-filters');
    if (filterContainer) {
        filterContainer.innerHTML = '';
        
        // Create filter buttons for each category
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn' + (category === 'all' ? ' active' : '');
            button.setAttribute('data-filter', category);
            button.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
            filterContainer.appendChild(button);
            
            // Add event listener
            button.addEventListener('click', () => {
                // Update active button
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                // Filter projects
                document.querySelectorAll('.project-card').forEach(card => {
                    card.classList.remove('show');
                    card.classList.add('hide');
                    
                    if (category === 'all' || card.getAttribute('data-category') === category) {
                        setTimeout(() => {
                            card.classList.remove('hide');
                            card.classList.add('show');
                        }, 100);
                    }
                });
            });
        });
    }
    
    // Add projects
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card show'; // Add 'show' class to make visible initially
        projectCard.setAttribute('data-category', project.category);
        
        const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        let linksHTML = '';
        if (project.links.demo) {
            linksHTML += `<a href="${project.links.demo}" class="project-link" target="_blank"><i class="fas fa-external-link-alt"></i> Live</a>`;
        }
        if (project.links.github) {
            linksHTML += `<a href="${project.links.github}" class="project-link" target="_blank"><i class="fab fa-github"></i> GitHub</a>`;
        }
        if (project.links && project.links.paper) {
            linksHTML += `<a href="${project.links.paper}" class="project-link" target="_blank"><i class="fas fa-file-alt"></i> Docs</a>`;
        }
        
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tags">${tagsHTML}</div>
                <div class="project-links">${linksHTML}</div>
            </div>
        `;
        
        projectsContainer.appendChild(projectCard);
    });
}

// Populate featured projects on home page
function populateFeaturedProjects(projects) {
    // Find the featured projects container
    const featuredContainer = document.querySelector('.project-cards');
    console.log('Looking for featured projects container:', featuredContainer);
    
    if (!featuredContainer) {
        console.error('Featured projects container not found');
        return;
    }
    
    // Clear existing content
    featuredContainer.innerHTML = '';
    
    // Filter projects marked as featured
    let featuredProjects = projects.filter(project => project.featured === true);
    console.log('Featured projects found:', featuredProjects.length, featuredProjects);
    
    if (featuredProjects.length === 0) {
        console.warn('No featured projects found, using first two projects');
        featuredProjects = projects.slice(0, 2);
    }
    
    // Add featured projects using the same card style as the projects page
    featuredProjects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card show'; // Add 'show' class to make visible initially
        projectCard.setAttribute('data-category', project.category);
        
        const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        let linksHTML = '';
        if (project.links.demo) {
            linksHTML += `<a href="${project.links.demo}" class="project-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> Live</a>`;
        }
        if (project.links.github) {
            linksHTML += `<a href="${project.links.github}" class="project-link" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i> GitHub</a>`;
        }
        if (project.links && project.links.paper) {
            linksHTML += `<a href="${project.links.paper}" class="project-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-file-alt"></i> Docs</a>`;
        }
        
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tags">${tagsHTML}</div>
                <div class="project-links">${linksHTML}</div>
            </div>
        `;
        
        // Add card to container
        featuredContainer.appendChild(projectCard);
        console.log('Added featured project:', project.title);
    });
}

// Populate contact information from JSON data
function populateContactInfo(data) {
    // Update name in header and footer
    document.querySelectorAll('h1 .highlight').forEach(el => {
        if (el.textContent.includes('Gahn')) {
            el.textContent = data.name;
        }
    });
    
    // Update social links - ensure all instances are updated
    // This includes both header, footer, and any other locations
    document.querySelectorAll('.social-links a, .social-link, footer .social-link').forEach(link => {
        // Use icon classes to identify the social platform
        if (link.querySelector('.fa-github') || link.classList.contains('fa-github')) {
            if (data.social && data.social.github) {
                link.href = data.social.github.url;
                link.setAttribute('aria-label', `GitHub - ${data.social.github.username}`);
                link.setAttribute('title', `GitHub - ${data.social.github.username}`);
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        } else if (link.querySelector('.fa-linkedin') || link.classList.contains('fa-linkedin')) {
            if (data.social && data.social.linkedin) {
                link.href = data.social.linkedin.url;
                link.setAttribute('aria-label', `LinkedIn - ${data.social.linkedin.username}`);
                link.setAttribute('title', `LinkedIn - ${data.social.linkedin.username}`);
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        } else if (link.querySelector('.fa-twitter') || link.classList.contains('fa-twitter')) {
            if (data.social && data.social.twitter) {
                link.href = data.social.twitter.url;
                link.setAttribute('aria-label', `Twitter - ${data.social.twitter.username}`);
                link.setAttribute('title', `Twitter - ${data.social.twitter.username}`);
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        }
    });
    
    // Also update any specific social links that might be in the contact page
    document.querySelectorAll('a[href*="github.com"], a[href*="linkedin.com"], a[href*="twitter.com"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href.includes('github') && data.social && data.social.github) {
            link.href = data.social.github.url;
        } else if (href.includes('linkedin') && data.social && data.social.linkedin) {
            link.href = data.social.linkedin.url;
        } else if ((href.includes('twitter') || href.includes('x.com')) && data.social && data.social.twitter) {
            link.href = data.social.twitter.url;
        }
    });
    
    console.log('Social links updated from contacts.json');

    
    // Update contact details on contact page
    const contactDetails = document.querySelectorAll('.contact-text a, .contact-text p, .contact-info a, .contact-info p');
    contactDetails.forEach(detail => {
        if (detail.href && detail.href.includes('mailto')) {
            detail.href = `mailto:${data.email}`;
            detail.textContent = data.email;
        } else if (detail.textContent.includes('123') || detail.textContent.match(/\(\d{3}\)\s\d{3}-\d{4}/)) {
            detail.textContent = data.phone;
            if (detail.href) {
                detail.href = `tel:${data.phone.replace(/[^0-9]/g, '')}`;
            }
        } else if (detail.textContent.includes('San Diego') || detail.textContent.includes('California')) {
            detail.textContent = data.location;
        }
    });
    
    // Update resume link
    const resumeLinks = document.querySelectorAll('a[href*="Resume_"], a.resume-link, a.btn.primary-btn[href*="resume"]');
    resumeLinks.forEach(link => {
        link.href = data.resume;
    });
    
    // Update CTA buttons on homepage
    if (data.sections && data.sections.home && data.sections.home.cta) {
        const primaryCta = document.querySelector('.hero-content .btn.primary-btn');
        const secondaryCta = document.querySelector('.hero-content .btn.secondary-btn');
        
        if (primaryCta && data.sections.home.cta.primary) {
            primaryCta.href = data.sections.home.cta.primary.url;
            primaryCta.textContent = data.sections.home.cta.primary.text;
        }
        
        if (secondaryCta && data.sections.home.cta.secondary) {
            secondaryCta.href = data.sections.home.cta.secondary.url;
            secondaryCta.textContent = data.sections.home.cta.secondary.text;
        }
    }
    
    // Update contact form submit button
    if (data.sections && data.sections.contact && data.sections.contact.formSubmitText) {
        const submitBtn = document.querySelector('.contact-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = data.sections.contact.formSubmitText;
        }
    }
}

// Call loadData when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    loadData();
});
