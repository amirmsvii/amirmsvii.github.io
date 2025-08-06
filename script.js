// Interactive Paper Resume functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initializeControls();
    initializeTooltips();
    initializeSearch();
    initializePDFGeneration();
    initializeSkillInteractions();
    
    // Hide controls initially, show on hover/interaction
    setupControlVisibility();
});

// Control visibility and interaction
function setupControlVisibility() {
    const controls = document.querySelector('.resume-controls');
    const resume = document.querySelector('.paper-resume');
    
    // Show controls on resume hover
    resume.addEventListener('mouseenter', () => {
        controls.style.opacity = '1';
        controls.style.transform = 'translateY(0)';
    });
    
    // Hide controls when not hovering
    document.addEventListener('mouseleave', (e) => {
        if (!e.relatedTarget || !e.relatedTarget.closest('.resume-controls')) {
            controls.style.opacity = '0';
            controls.style.transform = 'translateY(-10px)';
        }
    });
}

// Initialize control buttons
function initializeControls() {
    const searchToggle = document.getElementById('search-toggle');
    const downloadBtn = document.getElementById('download-pdf');
    const printBtn = document.getElementById('print-resume');
    
    if (searchToggle) {
        searchToggle.addEventListener('click', toggleSearch);
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', generatePDF);
    }
    
    if (printBtn) {
        printBtn.addEventListener('click', printResume);
    }
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape') {
                closeSearch();
            }
        });
    }
}

function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.opacity = '1';
        input.focus();
    }, 10);
}

function closeSearch() {
    const overlay = document.getElementById('search-overlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
        clearSearch();
    }, 200);
}

// Tooltip system for interactive elements
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('.contact-item, .skill-item, .project-link');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const tooltip = event.target.querySelector('.tooltip, .skill-level');
    if (tooltip) {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(-5px)';
        tooltip.style.pointerEvents = 'auto';
    }
}

function hideTooltip(event) {
    const tooltip = event.target.querySelector('.tooltip, .skill-level');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(0)';
        tooltip.style.pointerEvents = 'none';
    }
}

// Skill level interactions
function initializeSkillInteractions() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(skill => {
        skill.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Enhanced search functionality for paper resume
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const resultsDiv = document.getElementById('search-results');
    
    if (searchTerm === '') {
        resultsDiv.innerHTML = '';
        clearHighlights();
        return;
    }
    
    const results = [];
    const searchableElements = document.querySelectorAll(
        '.paper-resume p, .paper-resume li, .skill-item, .contact-item, .project-title, .position-title, .company-name'
    );
    
    // Clear previous highlights
    clearHighlights();
    
    searchableElements.forEach((element, index) => {
        const content = element.textContent.toLowerCase();
        if (content.includes(searchTerm)) {
            // Highlight the term
            highlightTerm(element, searchTerm);
            
            // Add to results
            const context = getSearchContext(element);
            results.push({
                element: element,
                context: context,
                index: index
            });
        }
    });
    
    displaySearchResults(results, searchTerm);
}

function getSearchContext(element) {
    const section = element.closest('.resume-section, .experience-entry, .project-entry');
    const sectionTitle = section ? section.querySelector('.section-header, .position-title, .project-title')?.textContent || 'Resume' : 'Resume';
    return sectionTitle;
}

function displaySearchResults(results, searchTerm) {
    const resultsDiv = document.getElementById('search-results');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = `<p style="color: #666; font-style: italic;">No results found for "${searchTerm}"</p>`;
        return;
    }
    
    let html = `<p style="margin-bottom: 10px; font-weight: bold;">${results.length} result(s) found:</p>`;
    
    results.forEach((result, index) => {
        const preview = result.element.textContent.substring(0, 80) + (result.element.textContent.length > 80 ? '...' : '');
        html += `
            <div class="search-result-item" onclick="scrollToResult(${result.index})" style="
                padding: 8px; 
                margin: 5px 0; 
                border-left: 3px solid var(--interactive-blue); 
                background: #f9f9f9; 
                cursor: pointer;
                border-radius: 3px;
            ">
                <div style="font-weight: bold; color: var(--interactive-blue); font-size: 11pt;">${result.context}</div>
                <div style="font-size: 10pt; color: #333; margin-top: 2px;">${preview}</div>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

function scrollToResult(index) {
    const searchableElements = document.querySelectorAll(
        '.paper-resume p, .paper-resume li, .skill-item, .contact-item, .project-title, .position-title, .company-name'
    );
    
    if (searchableElements[index]) {
        searchableElements[index].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Flash highlight
        const element = searchableElements[index];
        const originalBg = element.style.backgroundColor;
        element.style.backgroundColor = '#fff3cd';
        element.style.transition = 'background-color 0.3s';
        
        setTimeout(() => {
            element.style.backgroundColor = originalBg;
        }, 1000);
        
        // Close search
        setTimeout(() => {
            closeSearch();
        }, 500);
    }
}

function highlightTerm(element, searchTerm) {
    const content = element.innerHTML;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const highlighted = content.replace(regex, '<mark style="background-color: #fff3cd; padding: 2px 3px; border-radius: 2px;">$1</mark>');
    element.innerHTML = highlighted;
}

function clearHighlights() {
    const highlighted = document.querySelectorAll('mark');
    highlighted.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const resultsDiv = document.getElementById('search-results');
    
    if (searchInput) searchInput.value = '';
    if (resultsDiv) resultsDiv.innerHTML = '';
    clearHighlights();
}

// PDF Generation with paper resume optimization
function initializePDFGeneration() {
    // Pre-load PDF generation libraries
    if (typeof window.jsPDF === 'undefined') {
        console.warn('jsPDF library not loaded');
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

// Clean up old functions - replace with new PDF generation
async function generatePDF() {
    try {
        // Show loading state
        const downloadBtn = document.getElementById('download-pdf');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        downloadBtn.disabled = true;
        
        // Hide interactive controls temporarily
        const controls = document.querySelector('.resume-controls');
        const searchOverlay = document.getElementById('search-overlay');
        
        if (controls) controls.style.display = 'none';
        if (searchOverlay) searchOverlay.style.display = 'none';
        
        // Clear any search highlights and ensure clean state
        clearHighlights();
        
        // Hide all tooltips and interactive elements for PDF
        const tooltips = document.querySelectorAll('.tooltip, .skill-level');
        tooltips.forEach(tooltip => {
            tooltip.style.display = 'none';
        });
        
        // Get the paper resume content
        const resumeContent = document.getElementById('resume-content');
        
        // Generate PDF using html2canvas and jsPDF
        const canvas = await html2canvas(resumeContent, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            width: resumeContent.offsetWidth,
            height: resumeContent.offsetHeight,
            scrollX: 0,
            scrollY: 0
        });
        
        // Initialize jsPDF with letter size (8.5" x 11")
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'letter'
        });
        
        // Calculate dimensions
        const imgWidth = 8.5;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageHeight = 11;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Download PDF
        pdf.save('Amir_Mousavi_Resume.pdf');
        
        // Restore interface
        if (controls) controls.style.display = 'flex';
        tooltips.forEach(tooltip => {
            tooltip.style.display = 'block';
        });
        
        // Reset button
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please try again or use the print option.');
        
        // Reset button on error
        const downloadBtn = document.getElementById('download-pdf');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> PDF';
        downloadBtn.disabled = false;
    }
}

function printResume() {
    // Hide interactive elements for printing
    const controls = document.querySelector('.resume-controls');
    const searchOverlay = document.getElementById('search-overlay');
    const tooltips = document.querySelectorAll('.tooltip, .skill-level');
    
    if (controls) controls.style.display = 'none';
    if (searchOverlay) searchOverlay.style.display = 'none';
    tooltips.forEach(tooltip => tooltip.style.display = 'none');
    
    // Clear highlights
    clearHighlights();
    
    // Print
    window.print();
    
    // Restore interface after print dialog
    setTimeout(() => {
        if (controls) controls.style.display = 'flex';
        tooltips.forEach(tooltip => tooltip.style.display = 'block');
    }, 100);
}

// Utility function for escaping regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Enhanced interactions for paper resume
document.addEventListener('click', function(e) {
    // Handle project links
    if (e.target.classList.contains('project-link')) {
        e.preventDefault();
        const link = e.target;
        
        // Add click animation
        link.style.transform = 'scale(0.95)';
        setTimeout(() => {
            link.style.transform = 'scale(1)';
        }, 150);
        
        // Simulate opening link (you can replace with actual URLs)
        setTimeout(() => {
            alert(`Opening ${link.textContent} for ${link.closest('.project-entry').querySelector('.project-title').textContent}`);
        }, 200);
    }
    
    // Handle contact items
    if (e.target.closest('.contact-item')) {
        const contactItem = e.target.closest('.contact-item');
        const text = contactItem.querySelector('span').textContent;
        
        // Copy to clipboard if possible
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                // Show brief feedback
                const originalBg = contactItem.style.backgroundColor;
                contactItem.style.backgroundColor = '#e7f3ff';
                contactItem.style.transition = 'background-color 0.3s';
                
                setTimeout(() => {
                    contactItem.style.backgroundColor = originalBg;
                }, 1000);
            });
        }
    }
});

// Add subtle animations on page load
window.addEventListener('load', function() {
    const resume = document.querySelector('.paper-resume');
    if (resume) {
        resume.style.opacity = '0';
        resume.style.transform = 'translateY(20px)';
        resume.style.transition = 'all 0.8s ease';
        
        setTimeout(() => {
            resume.style.opacity = '1';
            resume.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Stagger section animations
    const sections = document.querySelectorAll('.resume-section, .experience-entry, .project-entry');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(10px)';
        section.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
});
