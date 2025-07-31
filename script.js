// Mobile menu toggle
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// GitHub API integration
class GitHubPortfolio {
    constructor(username) {
        this.username = username;
        this.apiBase = 'https://api.github.com';
    }

    async fetchUserData() {
        try {
            const response = await fetch(`${this.apiBase}/users/${this.username}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    async fetchRepositories() {
        try {
            const response = await fetch(`${this.apiBase}/users/${this.username}/repos?sort=updated&per_page=100`);
            const repos = await response.json();
            
            // Filter out forks and sort by stars/updated date
            return repos
                .filter(repo => !repo.fork)
                .sort((a, b) => {
                    // Prioritize repos with stars, then by updated date
                    if (a.stargazers_count !== b.stargazers_count) {
                        return b.stargazers_count - a.stargazers_count;
                    }
                    return new Date(b.updated_at) - new Date(a.updated_at);
                });
        } catch (error) {
            console.error('Error fetching repositories:', error);
            return [];
        }
    }

    async fetchLanguageStats() {
        try {
            const repos = await this.fetchRepositories();
            const languageStats = {};

            for (const repo of repos.slice(0, 20)) { // Limit to avoid rate limiting
                if (repo.language) {
                    languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
                }
            }

            return Object.entries(languageStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10); // Top 10 languages
        } catch (error) {
            console.error('Error fetching language stats:', error);
            return [];
        }
    }

    renderProject(repo) {
        const updatedDate = new Date(repo.updated_at).toLocaleDateString();
        const description = repo.description || 'No description available';
        
        return `
            <div class="project-card fade-in-up">
                <div class="project-header">
                    <div>
                        <h3 class="project-title">${repo.name}</h3>
                        <p class="project-description">${description}</p>
                    </div>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank" class="project-link" title="View on GitHub">
                            <i class="fab fa-github"></i>
                        </a>
                        ${repo.homepage ? `
                            <a href="${repo.homepage}" target="_blank" class="project-link" title="Live Demo">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
                
                ${repo.language ? `
                    <div class="project-tech">
                        <span class="tech-tag">${repo.language}</span>
                        ${repo.topics ? repo.topics.slice(0, 3).map(topic => 
                            `<span class="tech-tag">${topic}</span>`
                        ).join('') : ''}
                    </div>
                ` : ''}
                
                <div class="project-stats">
                    <div class="project-stat">
                        <i class="fas fa-star"></i>
                        <span>${repo.stargazers_count}</span>
                    </div>
                    <div class="project-stat">
                        <i class="fas fa-code-branch"></i>
                        <span>${repo.forks_count}</span>
                    </div>
                    <div class="project-stat">
                        <i class="fas fa-calendar"></i>
                        <span>${updatedDate}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async loadProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        
        try {
            const repos = await this.fetchRepositories();
            const featuredRepos = repos.slice(0, 6); // Show top 6 projects

            if (featuredRepos.length === 0) {
                projectsGrid.innerHTML = `
                    <div class="project-card">
                        <div class="loading-placeholder">
                            <i class="fab fa-github"></i>
                            <p>No repositories found. Start creating some amazing projects!</p>
                        </div>
                    </div>
                `;
                return;
            }

            projectsGrid.innerHTML = featuredRepos.map(repo => this.renderProject(repo)).join('');
            
            // Update projects count
            const projectsCount = document.getElementById('projects-count');
            if (projectsCount) {
                this.animateCounter(projectsCount, repos.length);
            }

        } catch (error) {
            console.error('Error loading projects:', error);
            projectsGrid.innerHTML = `
                <div class="project-card">
                    <div class="loading-placeholder">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error loading projects. Please try again later.</p>
                    </div>
                </div>
            `;
        }
    }

    async loadLanguageSkills() {
        try {
            const languages = await this.fetchLanguageStats();
            const languagesSkills = document.getElementById('languages-skills');
            
            if (languagesSkills && languages.length > 0) {
                languagesSkills.innerHTML = languages
                    .map(([language, count]) => `<span class="skill-tag">${language}</span>`)
                    .join('');
            }

            // Update languages count
            const languagesCount = document.getElementById('languages-count');
            if (languagesCount) {
                this.animateCounter(languagesCount, languages.length);
            }
        } catch (error) {
            console.error('Error loading language skills:', error);
        }
    }

    async loadGitHubStats() {
        try {
            const userData = await this.fetchUserData();
            if (userData) {
                const commitsCount = document.getElementById('commits-count');
                if (commitsCount && userData.public_repos) {
                    // Approximate commits based on repos (this is a rough estimate)
                    this.animateCounter(commitsCount, userData.public_repos * 10);
                }
            }
        } catch (error) {
            console.error('Error loading GitHub stats:', error);
        }
    }

    animateCounter(element, target) {
        const duration = 2000; // 2 seconds
        const start = Date.now();
        const startValue = 0;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startValue + (target - startValue) * easeOut);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target;
            }
        };

        animate();
    }

    async init() {
        await Promise.all([
            this.loadProjects(),
            this.loadLanguageSkills(),
            this.loadGitHubStats()
        ]);
    }
}

// Initialize the portfolio
document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new GitHubPortfolio('amirmsvii');
    portfolio.init();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.project-card, .skill-category, .contact-link');
    animatedElements.forEach(el => observer.observe(el));
});

// Theme toggle (optional enhancement)
function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.style.getPropertyValue('--background') === '#1e293b';
    
    if (isDark) {
        // Light theme
        root.style.setProperty('--background', '#ffffff');
        root.style.setProperty('--surface', '#f8fafc');
        root.style.setProperty('--text-primary', '#1e293b');
        root.style.setProperty('--text-secondary', '#64748b');
    } else {
        // Dark theme
        root.style.setProperty('--background', '#1e293b');
        root.style.setProperty('--surface', '#334155');
        root.style.setProperty('--text-primary', '#f1f5f9');
        root.style.setProperty('--text-secondary', '#cbd5e1');
    }
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Performance optimization: lazy load images if any are added later
const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
};

// Call lazy load on DOM ready
document.addEventListener('DOMContentLoaded', lazyLoadImages);
