/**
 * Enhanced markdown-like text formatting for simple display
 * Note: For full markdown rendering, use MDSvex with .svx files
 * @param {string} text - The text to apply basic formatting
 * @returns {string} - HTML string with basic formatting
 */
export function formatText(text) {
	if (!text || typeof text !== 'string') {
		return '';
	}

	// Apply markdown formatting in order of precedence
	return text
		// Headers (must be at start of line)
		.replace(/^### (.*$)/gm, '<h3>$1</h3>')
		.replace(/^## (.*$)/gm, '<h2>$1</h2>')
		.replace(/^# (.*$)/gm, '<h1>$1</h1>')

		// Code blocks (before inline code)
		.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

		// Inline code
		.replace(/`([^`]+)`/g, '<code>$1</code>')

		// Bold (before italic to handle overlap)
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/__(.*?)__/g, '<strong>$1</strong>')

		// Italic
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/_(.*?)_/g, '<em>$1</em>')

		// Strikethrough
		.replace(/~~(.*?)~~/g, '<del>$1</del>')

		// Links
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

		// Blockquotes (must be at start of line)
		.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')

		// Unordered lists (simple single-level)
		.replace(/^[-*+] (.*$)/gm, '<li>$1</li>')

		// Ordered lists (simple single-level)
		.replace(/^\d+\. (.*$)/gm, '<li>$1</li>')

		// Wrap consecutive <li> elements in <ul> or <ol>
		.replace(/(<li>.*<\/li>)(?:\n<li>.*<\/li>)*/g, (match) => {
			// Check if this comes from ordered list (contains numbers)
			const isOrdered = /^\d+\./.test(text.split('\n').find(line =>
				line.match(/^\d+\./) && match.includes(line.replace(/^\d+\. (.*$)/, '<li>$1</li>'))
			));
			const tag = isOrdered ? 'ol' : 'ul';
			return `<${tag}>${match}</${tag}>`;
		})

		// Horizontal rule
		.replace(/^---$/gm, '<hr>')
		.replace(/^\*\*\*$/gm, '<hr>')

		// Line breaks (convert double newlines to paragraphs, single to <br>)
		.replace(/\n\n/g, '</p><p>')
		.replace(/\n/g, '<br>')

		// Wrap in paragraph tags if content doesn't start with block element
		.replace(/^(?!<[h1-6|blockquote|pre|ul|ol|hr])/gm, '<p>')
		.replace(/(?<!<\/[h1-6|blockquote|pre|ul|ol|hr]>)$/gm, '</p>')

		// Clean up empty paragraphs and fix double paragraphs
		.replace(/<p><\/p>/g, '')
		.replace(/<p>(<[h1-6|blockquote|pre|ul|ol|hr])/g, '$1')
		.replace(/(<\/[h1-6|blockquote|pre|ul|ol|hr]>)<\/p>/g, '$1');
}

/**
 * Strip markdown and return plain text
 * @param {string} markdown - The markdown string
 * @returns {string} - Plain text
 */
export function stripMarkdown(markdown) {
	if (!markdown || typeof markdown !== 'string') {
		return '';
	}

	return markdown
		.replace(/#{1,6}\s+/g, '') // Headers
		.replace(/\*\*(.*?)\*\*/g, '$1') // Bold **
		.replace(/__(.*?)__/g, '$1') // Bold __
		.replace(/\*(.*?)\*/g, '$1') // Italic *
		.replace(/_(.*?)_/g, '$1') // Italic _
		.replace(/~~(.*?)~~/g, '$1') // Strikethrough
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
		.replace(/`([^`]+)`/g, '$1') // Inline code
		.replace(/```[\s\S]*?```/g, '') // Code blocks
		.replace(/^>\s+/gm, '') // Blockquotes
		.replace(/^[-*+]\s+/gm, '') // Unordered lists
		.replace(/^\d+\.\s+/gm, '') // Ordered lists
		.replace(/^---$/gm, '') // Horizontal rules
		.replace(/^\*\*\*$/gm, '') // Horizontal rules
		.trim();
}

/**
 * Truncate text and add ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 150) {
	if (!text || typeof text !== 'string') {
		return '';
	}

	if (text.length <= maxLength) {
		return text;
	}

	return text.substring(0, maxLength).trim() + '...';
}

/**
 * Escape HTML characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
	if (!text || typeof text !== 'string') {
		return '';
	}

	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Safe markdown formatting that escapes user input first
 * @param {string} text - The text to format
 * @returns {string} - Safely formatted HTML
 */
export function safeFormatText(text) {
	if (!text || typeof text !== 'string') {
		return '';
	}

	// First escape HTML, then apply markdown formatting
	const escaped = escapeHtml(text);
	return formatText(escaped);
}