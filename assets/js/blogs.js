/**
 * blogs.js - Processes MDX files and generates HTML blog pages
 * Compatible with GitHub Pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the blogs index page
    const isBlogsIndex = window.location.pathname.endsWith('blogs/') || 
                         window.location.pathname.endsWith('blogs/index.html');
    
    // Check if we're on a specific blog page
    const isBlogPage = window.location.pathname.includes('/blogs/') && 
                      !window.location.pathname.endsWith('blogs/') && 
                      !window.location.pathname.endsWith('blogs/index.html');
    
    // Add animation classes to section header
    const sectionHeader = document.querySelector('.section-header');
    if (sectionHeader) {
        sectionHeader.querySelector('h2').classList.add('animate-slide-down');
        const underline = sectionHeader.querySelector('.underline');
        if (underline) {
            underline.classList.add('animate-grow');
        }
    }
    
    if (isBlogsIndex) {
        loadBlogsList();
    } else if (isBlogPage) {
        const blogSlug = window.location.pathname.split('/').pop().replace('.html', '');
        loadBlogContent(blogSlug);
    }
});

/**
 * Loads the list of blogs for the blogs index page
 */
async function loadBlogsList() {
    try {
        const blogsGrid = document.querySelector('.blogs-links-grid');
        if (!blogsGrid) return;
        
        // Add a loading indicator
        blogsGrid.innerHTML = '<div class="loading-spinner"><div></div><div></div><div></div><div></div></div>';
        
        // Get list of MDX files with metadata
        const mdxFilesData = await fetchMdxFilesList();
        
        if (Object.keys(mdxFilesData).length === 0) {
            blogsGrid.innerHTML = '<p class="no-blogs animate-fade-in">No blogs available yet. Check back soon!</p>';
            return;
        }
        
        // Process each MDX file to get content and metadata
        const blogPosts = [];
        for (const [filename, metadata] of Object.entries(mdxFilesData)) {
            const slug = filename.replace('.mdx', '');
            const content = await fetchMdxContent(slug);
            
            blogPosts.push({
                slug,
                title: metadata.title || 'Untitled',
                date: metadata.date || 'No date',
                excerpt: metadata.excerpt || extractExcerpt(content)
            });
        }
        
        // Sort blogs by date (newest first)
        blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Clear the loading spinner
        blogsGrid.innerHTML = '';
        
        // Create and append blog cards with staggered animations
        blogPosts.forEach((post, index) => {
            const blogCard = document.createElement('div');
            blogCard.className = 'blog-card animate-slide-up';
            blogCard.style.animationDelay = `${index * 0.15}s`;
            
            blogCard.innerHTML = `
                <h3 class="animate-fade-in" style="animation-delay: ${index * 0.15 + 0.1}s">${post.title}</h3>
                <p class="blog-date animate-fade-in" style="animation-delay: ${index * 0.15 + 0.2}s">${formatDate(post.date)}</p>
                <p class="blog-excerpt animate-fade-in" style="animation-delay: ${index * 0.15 + 0.3}s">${post.excerpt}</p>
                <a href="./${post.slug}.html" class="read-more animate-fade-in" style="animation-delay: ${index * 0.15 + 0.4}s">Read More</a>
            `;
            
            blogsGrid.appendChild(blogCard);
        });
    } catch (error) {
        console.error('Error loading blogs list:', error);
        const blogsGrid = document.querySelector('.blogs-links-grid');
        if (blogsGrid) {
            blogsGrid.innerHTML = '<p class="no-blogs animate-fade-in">Failed to load blogs. Please try again later.</p>';
        }
    }
}

/**
 * Loads the content for a specific blog page
 * @param {string} slug - The blog slug (filename without extension)
 */
async function loadBlogContent(slug) {
    try {
        const titleElement = document.querySelector('.section-header h2');
        const contentElement = document.querySelector('.blog-content');
        
        if (!titleElement || !contentElement) return;
        
        // Add loading animation
        contentElement.innerHTML = '<div class="loading-spinner"><div></div><div></div><div></div><div></div></div>';
        
        // Get metadata from index.json
        const mdxFilesData = await fetchMdxFilesList();
        const mdxFilename = `${slug}.mdx`;
        const metadata = mdxFilesData[mdxFilename] || {};
        
        // Get content from the MDX file
        const content = await fetchMdxContent(slug);
        const htmlContent = convertMdxToHtml(content);
        
        // Set the title with animation
        if (metadata && metadata.title) {
            titleElement.textContent = metadata.title;
            document.title = `${metadata.title} | Gahn W`;
        } else {
            titleElement.textContent = slug;
        }
        
        // Add date if available
        if (metadata && metadata.date) {
            // Check if date element already exists
            let dateElement = document.querySelector('.section-header .blog-date');
            
            if (!dateElement) {
                dateElement = document.createElement('p');
                dateElement.className = 'blog-date animate-fade-in';
                titleElement.parentNode.insertBefore(dateElement, titleElement.nextSibling);
            } else {
                dateElement.classList.add('animate-fade-in');
            }
            
            dateElement.textContent = formatDate(metadata.date);
        }
        
        // Set the content with animation
        contentElement.innerHTML = htmlContent;
        contentElement.classList.add('animate-fade-in');
        
        // Add animations to content elements with staggered delays
        const contentElements = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, pre, img, table');
        contentElements.forEach((element, index) => {
            element.classList.add('animate-slide-up');
            element.style.animationDelay = `${0.1 + (index * 0.05)}s`;
        });
        
        // Process any code blocks for syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
            if (window.hljs) {
                window.hljs.highlightBlock(block);
            }
        });
        
        // Process any LaTeX math expressions
        if (window.MathJax) {
            window.MathJax.typeset();
        }
    } catch (error) {
        console.error(`Error loading blog content for ${slug}:`, error);
        const contentElement = document.querySelector('.blog-content');
        if (contentElement) {
            contentElement.innerHTML = '<p class="error-message animate-fade-in">Failed to load blog content. Please try again later.</p>';
        }
    }
}

/**
 * Fetches the list of MDX files from the blogs directory
 * @returns {Promise<Object>} Object with MDX filenames and metadata
 */
async function fetchMdxFilesList() {
    try {
        // For GitHub Pages, we'll maintain a JSON file with the list of blogs
        // This is because we can't directly list directory contents on GitHub Pages
        const response = await fetch('../assets/blogs/index.json');
        
        if (response.ok) {
            const data = await response.json();
            return data.files || {};
        } else {
            throw new Error('index.json not found');
        }
    } catch (error) {
        console.error('Error fetching MDX files list:', error);
        throw error;
    }
}

/**
 * Fetches the content of an MDX file
 * @param {string} slug - The blog slug (filename without extension)
 * @returns {Promise<string>} The MDX content
 */
async function fetchMdxContent(slug) {
    try {
        const response = await fetch(`../assets/blogs/${slug}.mdx`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${slug}.mdx`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error fetching MDX content for ${slug}:`, error);
        return '';
    }
}

/**
 * Extracts metadata from MDX content
 * @param {string} content - The MDX content
 * @returns {Object|null} The metadata object or null if not found
 */
function extractMetadata(content) {
    if (!content) return null;
    
    const metadataRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(metadataRegex);
    
    if (!match || !match[1]) return null;
    
    const metadataStr = match[1];
    const metadata = {};
    
    // Parse each line of the metadata
    metadataStr.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            let value = valueParts.join(':').trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            metadata[key.trim()] = value;
        }
    });
    
    return metadata;
}

/**
 * Extracts an excerpt from the MDX content
 * @param {string} content - The MDX content
 * @returns {string} The excerpt
 */
function extractExcerpt(content) {
    if (!content) return 'No content available';
    
    // Remove metadata section
    const contentWithoutMetadata = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    
    // Get first paragraph or heading content
    const firstContentMatch = contentWithoutMetadata.match(/(?:^|\n)(?:#+\s+(.+)|(.+?)\n\n)/m);
    if (firstContentMatch) {
        const excerpt = firstContentMatch[1] || firstContentMatch[2] || '';
        return excerpt.length > 150 ? excerpt.substring(0, 147) + '...' : excerpt;
    }
    
    return 'Read more...';
}

/**
 * Converts MDX content to HTML
 * @param {string} content - The MDX content
 * @returns {string} The HTML content
 */
function convertMdxToHtml(content) {
    if (!content) return '';
    
    // Remove metadata section if present
    let mdContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    
    // Configure Marked.js options
    marked.setOptions({
        breaks: true,        // Convert line breaks to <br>
        gfm: true,          // Enable GitHub Flavored Markdown
        headerIds: true,    // Generate IDs for headings
        mangle: false,      // Don't escape HTML
        pedantic: false,    // Don't conform to original markdown spec
        sanitize: false,    // Don't sanitize HTML
        smartLists: true,   // Use smarter list behavior
        smartypants: true,  // Use smart typography
        xhtml: false        // Don't close empty tags with />
    });
    
    // Process LaTeX math expressions before Marked.js
    // Display math ($$...$$)
    mdContent = mdContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        // Use a placeholder that won't be processed by Marked
        return `<div class="math-display">$$${formula}$$</div>`;
    });
    
    // Inline math ($...$) - but avoid replacing currency symbols
    mdContent = mdContent.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)(?<!\$)\$(?!\$)/g, (match, formula) => {
        return `<span class="math-inline">$${formula}$</span>`;
    });
    
    // Convert Markdown to HTML using Marked.js
    let htmlContent = marked.parse(mdContent);
    
    return htmlContent;
}

/**
 * Formats a date string
 * @param {string} dateStr - The date string
 * @returns {string} The formatted date
 */
function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateStr; // Return the original string if parsing fails
    }
}