/**
 * Basic markdown-like text formatting for simple display
 * Note: For full markdown rendering, use MDSvex with .svx files
 * @param {string} text - The text to apply basic formatting
 * @returns {string} - HTML string with basic formatting
 */
export function formatText(text) {
	if (!text || typeof text !== 'string') {
		return '';
	}

	// Apply very basic formatting
	return text
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
		.replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
		.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>') // Links
		.replace(/\n/g, '<br>'); // Line breaks
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
		.replace(/\*\*(.*?)\*\*/g, '$1') // Bold
		.replace(/\*(.*?)\*/g, '$1') // Italic
		.replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
		.replace(/`(.*?)`/g, '$1') // Inline code
		.replace(/```[\s\S]*?```/g, '') // Code blocks
		.replace(/^\s*[-\*\+]\s+/gm, '') // Unordered lists
		.replace(/^\s*\d+\.\s+/gm, '') // Ordered lists
		.replace(/^\s*>\s+/gm, '') // Blockquotes
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
