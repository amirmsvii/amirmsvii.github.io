// Resume functionality
document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        clearButton.addEventListener('click', clearSearch);
    }

    // PDF generation
    const downloadBtn = document.getElementById('downloadPDF');
    const printBtn = document.getElementById('printResume');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', generatePDF);
    }
    
    if (printBtn) {
        printBtn.addEventListener('click', printResume);
    }

    // Initialize page
    setupHighlightedTerms();
});

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const sections = document.querySelectorAll('.resume-section');
    
    // Clear previous highlights
    clearHighlights();
    
    if (searchTerm === '') {
        // Show all sections
        sections.forEach(section => {
            section.style.display = 'block';
            section.style.opacity = '1';
        });
        return;
    }
    
    let hasResults = false;
    
    sections.forEach(section => {
        const content = section.textContent.toLowerCase();
        const hasMatch = content.includes(searchTerm);
        
        if (hasMatch) {
            section.style.display = 'block';
            section.style.opacity = '1';
            highlightText(section, searchTerm);
            hasResults = true;
        } else {
            section.style.display = 'none';
            section.style.opacity = '0.3';
        }
    });
    
    // Show no results message if needed
    showNoResultsMessage(!hasResults);
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
    }
}

function highlightText(container, searchTerm) {
    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        
        if (regex.test(text)) {
            const highlightedText = text.replace(regex, '<mark class="search-highlight">$1</mark>');
            const span = document.createElement('span');
            span.innerHTML = highlightedText;
            textNode.parentNode.replaceChild(span, textNode);
        }
    });
}

function clearHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
    
    // Remove any remaining highlight containers
    const highlightContainers = document.querySelectorAll('span:has(.search-highlight)');
    highlightContainers.forEach(container => {
        if (container.innerHTML === container.textContent) {
            container.outerHTML = container.textContent;
        }
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showNoResultsMessage(show) {
    let noResultsDiv = document.getElementById('noResults');
    
    if (show && !noResultsDiv) {
        noResultsDiv = document.createElement('div');
        noResultsDiv.id = 'noResults';
        noResultsDiv.className = 'no-results';
        noResultsDiv.innerHTML = `
            <div class="no-results-content">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try searching for different keywords like "React", "Python", "IoT", or "AI"</p>
            </div>
        `;
        
        const resumeContent = document.querySelector('.resume-content');
        if (resumeContent) {
            resumeContent.appendChild(noResultsDiv);
        }
    } else if (!show && noResultsDiv) {
        noResultsDiv.remove();
    }
}

function setupHighlightedTerms() {
    // Add CSS for search highlights
    const style = document.createElement('style');
    style.textContent = `
        .search-highlight {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 0.1rem 0.3rem;
            border-radius: 3px;
            font-weight: 600;
            animation: highlightPulse 2s ease-in-out;
        }
        
        @keyframes highlightPulse {
            0%, 100% { background: linear-gradient(135deg, #667eea, #764ba2); }
            50% { background: linear-gradient(135deg, #f093fb, #f5576c); }
        }
        
        .no-results {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-secondary);
        }
        
        .no-results-content i {
            font-size: 3rem;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        
        .no-results-content h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }
    `;
    document.head.appendChild(style);
}

async function generatePDF() {
    try {
        // Show loading state
        const downloadBtn = document.getElementById('downloadPDF');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        downloadBtn.disabled = true;
        
        // Hide search controls temporarily
        const controlsSection = document.querySelector('.controls-section');
        if (controlsSection) {
            controlsSection.style.display = 'none';
        }
        
        // Clear any search highlights
        clearHighlights();
        
        // Show all sections
        const sections = document.querySelectorAll('.resume-section');
        sections.forEach(section => {
            section.style.display = 'block';
            section.style.opacity = '1';
        });
        
        // Wait for content to be visible
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate PDF using html2canvas and jsPDF
        const resumeContainer = document.querySelector('.resume-container');
        
        const canvas = await html2canvas(resumeContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: resumeContainer.scrollWidth,
            height: resumeContainer.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        // Download the PDF
        pdf.save('Amir_Mousavi_Resume.pdf');
        
        // Restore controls
        if (controlsSection) {
            controlsSection.style.display = 'block';
        }
        
        // Restore button
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        
        // Show success message
        showNotification('PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        
        // Restore button
        const downloadBtn = document.getElementById('downloadPDF');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
        downloadBtn.disabled = false;
        
        // Restore controls
        const controlsSection = document.querySelector('.controls-section');
        if (controlsSection) {
            controlsSection.style.display = 'block';
        }
        
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

function printResume() {
    // Hide search controls
    const controlsSection = document.querySelector('.controls-section');
    const originalDisplay = controlsSection ? controlsSection.style.display : '';
    
    if (controlsSection) {
        controlsSection.style.display = 'none';
    }
    
    // Clear highlights
    clearHighlights();
    
    // Show all sections
    const sections = document.querySelectorAll('.resume-section');
    sections.forEach(section => {
        section.style.display = 'block';
        section.style.opacity = '1';
    });
    
    // Add print styles
    const printStyles = document.createElement('style');
    printStyles.media = 'print';
    printStyles.textContent = `
        @media print {
            body * {
                visibility: hidden;
            }
            .resume-container, .resume-container * {
                visibility: visible;
            }
            .resume-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                box-shadow: none !important;
                border-radius: 0 !important;
            }
            .controls-section {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(printStyles);
    
    // Print
    window.print();
    
    // Cleanup
    setTimeout(() => {
        document.head.removeChild(printStyles);
        if (controlsSection) {
            controlsSection.style.display = originalDisplay;
        }
    }, 1000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }
            
            .notification-success {
                background: linear-gradient(135deg, #4ade80, #22c55e);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
            }
            
            .notification.show {
                transform: translateX(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Smooth scrolling for internal links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Add loading animation on page load
window.addEventListener('load', function() {
    const resumeContainer = document.querySelector('.resume-container');
    if (resumeContainer) {
        resumeContainer.style.opacity = '0';
        resumeContainer.style.transform = 'translateY(20px)';
        resumeContainer.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            resumeContainer.style.opacity = '1';
            resumeContainer.style.transform = 'translateY(0)';
        }, 100);
    }
});
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
                // Get existing skills (like C++, JavaScript, Python that are already there)
                const existingSkills = Array.from(languagesSkills.querySelectorAll('.skill-tag')).map(tag => tag.textContent);
                
                // Add new languages from GitHub, avoiding duplicates
                const newLanguages = languages
                    .filter(([language]) => !existingSkills.includes(language))
                    .slice(0, 7) // Limit to avoid overcrowding
                    .map(([language]) => `<span class="skill-tag">${language}</span>`)
                    .join('');
                
                // Append new languages to existing ones
                if (newLanguages) {
                    languagesSkills.insertAdjacentHTML('beforeend', newLanguages);
                }
            }

            // Update languages count based on all visible skills
            const languagesCount = document.getElementById('languages-count');
            if (languagesCount) {
                const totalLanguages = languagesSkills ? languagesSkills.querySelectorAll('.skill-tag').length : 0;
                this.animateCounter(languagesCount, totalLanguages);
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
