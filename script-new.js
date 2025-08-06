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
