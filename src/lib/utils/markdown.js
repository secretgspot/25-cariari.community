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

	text = text.replace(/\r\n/g, '\n');

	// Inline-level rules (order matters - images must come before links)
	const inlineRules = [
		{ regex: /!\[([^\]]*)\]\(([^)]+)\)/g, replacement: '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" loading="lazy" />' },
		{ regex: /\*\*(.*?)\*\*/g, replacement: '<strong>$1</strong>' },
		{ regex: /__(.*?)__/g, replacement: '<strong>$1</strong>' },
		{ regex: /\*(.*?)\*/g, replacement: '<em>$1</em>' },
		{ regex: /_(.*?)_/g, replacement: '<em>$1</em>' },
		{ regex: /~~(.*?)~~/g, replacement: '<del>$1</del>' },
		{ regex: /`([^`]+)`/g, replacement: '<code>$1</code>' },
		{ regex: /\[([^\]]+)\]\(([^)]+)\)/g, replacement: '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>' },
	];

	const applyInlineRules = (line) => {
		return inlineRules.reduce((acc, rule) => acc.replace(rule.regex, rule.replacement), line);
	};

	const blocks = text.split(/\n{2,}/);
	const htmlBlocks = blocks.map(block => {
		// Code blocks
		if (block.startsWith('```') && block.endsWith('```')) {
			const language = block.match(/^```(\w*)/)[1];
			const code = block.slice(block.indexOf('\n') + 1, -3).trim();
			return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
		}

		const lines = block.split('\n');
		let listType = null;
		let listItems = '';

		// Block-level rules
		const processedLines = lines.map(line => {
			if (line.startsWith('# ')) return `<h1>${applyInlineRules(line.substring(2))}</h1>`;
			if (line.startsWith('## ')) return `<h2>${applyInlineRules(line.substring(3))}</h2>`;
			if (line.startsWith('### ')) return `<h3>${applyInlineRules(line.substring(4))}</h3>`;
			if (line.match(/^([-*_])\1{2,}$/)) return '<hr>';
			if (line.startsWith('> ')) return `<blockquote>${applyInlineRules(line.substring(2))}</blockquote>`;

			const unorderedMatch = line.match(/^[-*+] (.*)/);
			if (unorderedMatch) {
				if (listType !== 'ul') {
					listItems += (listType ? `</${listType}>` : '') + '<ul>';
					listType = 'ul';
				}
				listItems += `<li>${applyInlineRules(unorderedMatch[1])}</li>`;
				return null; // Handled in list logic
			}

			const orderedMatch = line.match(/^\d+\. (.*)/);
			if (orderedMatch) {
				if (listType !== 'ol') {
					listItems += (listType ? `</${listType}>` : '') + '<ol>';
					listType = 'ol';
				}
				listItems += `<li>${applyInlineRules(orderedMatch[1])}</li>`;
				return null; // Handled in list logic
			}

			if (listType) {
				listItems += `</${listType}>`;
				const result = listItems;
				listType = null;
				listItems = '';
				return result + `<p>${applyInlineRules(line)}</p>`;
			}

			return applyInlineRules(line);
		}).filter(line => line !== null);

		if (listType) {
			listItems += `</${listType}>`;
			processedLines.push(listItems);
		}

		// Join lines that are not block elements into paragraphs
		let paragraph = '';
		const result = [];
		processedLines.forEach(line => {
			if (line.match(/^<(h[1-3]|ul|ol|li|hr|blockquote|pre|img)/)) {
				if (paragraph) {
					result.push(`<p>${paragraph}</p>`);
					paragraph = '';
				}
				result.push(line);
			} else {
				paragraph += (paragraph ? '<br>' : '') + line;
			}
		});
		if (paragraph) {
			result.push(`<p>${paragraph}</p>`);
		}

		return result.join('');
	});

	return htmlBlocks.join('\n\n');
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
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images (extract alt text)
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

	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
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