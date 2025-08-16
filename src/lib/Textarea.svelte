<script>
	let { value = '', placeholder = '', ...rest } = $props();
	let textareaRef;

	function insertMarkdown(before, after = '') {
		if (!textareaRef) return;

		const start = textareaRef.selectionStart;
		const end = textareaRef.selectionEnd;
		const selectedText = value.substring(start, end);

		const newText =
			value.substring(0, start) + before + selectedText + after + value.substring(end);
		value = newText;

		// Restore cursor position after the change
		setTimeout(() => {
			textareaRef.focus();
			const newCursorPos = start + before.length + selectedText.length + after.length;
			textareaRef.setSelectionRange(newCursorPos, newCursorPos);
		}, 0);
	}

	function toggleLinePrefix(prefix) {
		if (!textareaRef) return;

		const start = textareaRef.selectionStart;
		const end = textareaRef.selectionEnd;

		// Find line boundaries
		const beforeCursor = value.substring(0, start);
		const afterCursor = value.substring(end);
		const lineStart = beforeCursor.lastIndexOf('\n') + 1;
		const lineEndInAfter = afterCursor.indexOf('\n');
		const lineEnd = lineEndInAfter === -1 ? value.length : end + lineEndInAfter;

		const currentLine = value.substring(lineStart, lineEnd);

		let newLine;
		let newCursorOffset = 0;

		// Check if line already has this prefix
		if (currentLine.startsWith(prefix)) {
			// Remove prefix
			newLine = currentLine.substring(prefix.length);
			newCursorOffset = -prefix.length;
		} else {
			// Remove any existing heading prefix first
			const cleanLine = currentLine.replace(/^#{1,6}\s/, '');
			newLine = prefix + cleanLine;
			newCursorOffset = prefix.length - (currentLine.length - cleanLine.length);
		}

		value = value.substring(0, lineStart) + newLine + value.substring(lineEnd);

		// Restore cursor position
		setTimeout(() => {
			textareaRef.focus();
			const newCursorPos = start + newCursorOffset;
			textareaRef.setSelectionRange(newCursorPos, newCursorPos);
		}, 0);
	}

	function createLink(event) {
		event.preventDefault();
		const url = prompt('Enter the URL:');
		if (url) {
			const linkText = prompt('Enter link text:') || 'link';
			insertMarkdown(`[${linkText}](`, `${url})`);
		}
	}

	function insertHorizontalRule(event) {
		event.preventDefault();
		insertMarkdown('\n---\n');
	}

	function toggleList(type, event) {
		event.preventDefault();
		const prefix = type === 'ul' ? '- ' : '1. ';
		toggleLinePrefix(prefix);
	}
</script>

<div class="wysiwyg-editor">
	<div class="toolbar">
		<button
			type="button"
			title="Header"
			onclick={(e) => {
				e.preventDefault();
				toggleLinePrefix('# ');
			}}>H1</button>
		<button
			type="button"
			title="Subheader"
			onclick={(e) => {
				e.preventDefault();
				toggleLinePrefix('## ');
			}}>H2</button>
		<button
			type="button"
			title="Subheader 3"
			onclick={(e) => {
				e.preventDefault();
				toggleLinePrefix('### ');
			}}>H3</button>
		<button
			type="button"
			title="Bold"
			onclick={(e) => {
				e.preventDefault();
				insertMarkdown('**', '**');
			}}><b>B</b></button>
		<button
			type="button"
			title="Italic"
			onclick={(e) => {
				e.preventDefault();
				insertMarkdown('*', '*');
			}}><i>I</i></button>
		<button
			type="button"
			title="Strikethrough"
			onclick={(e) => {
				e.preventDefault();
				insertMarkdown('~~', '~~');
			}}><s>S</s></button>
		<button type="button" title="List" onclick={(e) => toggleList('ul', e)}>UL</button>
		<button type="button" title="Numbered List" onclick={(e) => toggleList('ol', e)}
			>OL</button>
		<button type="button" title="Link" onclick={createLink}>Link</button>
		<button
			type="button"
			title="Quote"
			onclick={(e) => {
				e.preventDefault();
				toggleLinePrefix('> ');
			}}>Quote</button>
		<button type="button" title="Divider" onclick={insertHorizontalRule}>HR</button>
	</div>
	<textarea
		id="description"
		bind:this={textareaRef}
		bind:value
		class="editor form-textarea"
		{placeholder}
		rows="10"
		{...rest}></textarea>
</div>

<style>
	.wysiwyg-editor {
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
	}

	.toolbar {
		background-color: var(--surface-3);
		margin-block: var(--size-1);
		border-bottom: var(--border-size-1) solid var(--surface-3);
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1);

		button {
			background-color: transparent;
			border: var(--border-size-1) solid transparent;
			padding: var(--size-1) var(--size-2);
			cursor: pointer;
			line-height: 1;
			text-align: center;
			border-radius: var(--radius-2);

			&:hover {
				background-color: var(--surface-4);
				border-color: var(--surface-4);
			}
		}
	}
</style>
