import React from 'react';

// Lightweight markdown renderer — zero dependencies.
// Falls back to plain whitespace-pre-wrap text if content doesn't look like markdown.

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderInline(text) {
    let html = escapeHtml(text);
    html = html.replace(/`([^`]+)`/g, '<code class="md-code-inline">$1</code>');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>'
    );
    html = html.replace(
        /(?<!["=])(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>'
    );
    return html;
}

function parseMarkdown(source) {
    const lines = source.split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.trimStart().startsWith('```')) {
            const lang = line.trimStart().slice(3).trim();
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            i++;
            blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
            continue;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            blocks.push({ type: 'heading', level: headingMatch[1].length, content: headingMatch[2] });
            i++;
            continue;
        }

        if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
            blocks.push({ type: 'hr' });
            i++;
            continue;
        }

        if (/^[\s]*[-*+]\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^[\s]*[-*+]\s/.test(lines[i])) {
                items.push(lines[i].replace(/^[\s]*[-*+]\s/, ''));
                i++;
            }
            blocks.push({ type: 'ul', items });
            continue;
        }

        if (/^[\s]*\d+[.)]\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^[\s]*\d+[.)]\s/.test(lines[i])) {
                items.push(lines[i].replace(/^[\s]*\d+[.)]\s/, ''));
                i++;
            }
            blocks.push({ type: 'ol', items });
            continue;
        }

        if (line.startsWith('>')) {
            const quoteLines = [];
            while (i < lines.length && lines[i].startsWith('>')) {
                quoteLines.push(lines[i].replace(/^>\s?/, ''));
                i++;
            }
            blocks.push({ type: 'blockquote', content: quoteLines.join('\n') });
            continue;
        }

        if (line.trim() === '') {
            i++;
            continue;
        }

        const paraLines = [];
        while (
            i < lines.length &&
            lines[i].trim() !== '' &&
            !lines[i].startsWith('#') &&
            !lines[i].startsWith('```') &&
            !/^[\s]*[-*+]\s/.test(lines[i]) &&
            !/^[\s]*\d+[.)]\s/.test(lines[i]) &&
            !lines[i].startsWith('>') &&
            !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim())
        ) {
            paraLines.push(lines[i]);
            i++;
        }
        if (paraLines.length > 0) {
            blocks.push({ type: 'paragraph', content: paraLines.join('\n') });
        }
    }

    return blocks;
}

function InlineHtml({ text }) {
    return <span dangerouslySetInnerHTML={{ __html: renderInline(text) }} />;
}

/** Heuristic: does this text contain markdown-like syntax? */
export function looksLikeMarkdown(text) {
    if (!text) return false;
    return /^#{1,6}\s/m.test(text) ||
        /\*\*.+?\*\*/m.test(text) ||
        /^[\s]*[-*+]\s/m.test(text) ||
        /^[\s]*\d+[.)]\s/m.test(text) ||
        /^>/m.test(text) ||
        /```/.test(text) ||
        /\[.+?\]\(.+?\)/.test(text);
}

/**
 * Zero-dependency Markdown renderer.
 * Falls back to plain whitespace-pre-wrap text if content doesn't look like markdown.
 *
 * Props:
 *   children  - Markdown string
 *   className - Additional classes on the wrapper
 */
export default function Markdown({ children, className = '' }) {
    const source = typeof children === 'string' ? children : '';
    if (!source) return null;

    if (!looksLikeMarkdown(source)) {
        return <div className={`text-sm whitespace-pre-wrap leading-relaxed ${className}`}>{source}</div>;
    }

    const blocks = React.useMemo(() => parseMarkdown(source), [source]);

    return (
        <div className={`md-root ${className}`}>
            {blocks.map((block, idx) => {
                switch (block.type) {
                    case 'heading': {
                        const classes = {
                            1: 'text-xl font-bold mt-4 mb-2',
                            2: 'text-lg font-bold mt-3 mb-2',
                            3: 'text-base font-semibold mt-3 mb-1',
                            4: 'text-sm font-semibold mt-2 mb-1',
                            5: 'text-sm font-medium mt-2 mb-1',
                            6: 'text-xs font-medium mt-2 mb-1 uppercase tracking-wider',
                        };
                        const Tag = `h${block.level}`;
                        return (
                            <Tag key={idx} className={`${classes[block.level]} text-gray-gray700 dark:text-gray-gray200`}>
                                <InlineHtml text={block.content} />
                            </Tag>
                        );
                    }
                    case 'paragraph':
                        return (
                            <p key={idx} className="mb-2 text-sm leading-relaxed text-gray-gray700 dark:text-gray-gray200">
                                <InlineHtml text={block.content} />
                            </p>
                        );
                    case 'code':
                        return (
                            <pre key={idx} className="mb-2 p-3 rounded-md bg-gray-gray800 dark:bg-gray-gray900 text-gray-gray200 text-xs leading-relaxed overflow-x-auto font-mono">
                                <code>{block.content}</code>
                            </pre>
                        );
                    case 'ul':
                        return (
                            <ul key={idx} className="mb-2 pl-5 list-disc text-sm text-gray-gray700 dark:text-gray-gray200 space-y-0.5">
                                {block.items.map((item, j) => (
                                    <li key={j} className="leading-relaxed"><InlineHtml text={item} /></li>
                                ))}
                            </ul>
                        );
                    case 'ol':
                        return (
                            <ol key={idx} className="mb-2 pl-5 list-decimal text-sm text-gray-gray700 dark:text-gray-gray200 space-y-0.5">
                                {block.items.map((item, j) => (
                                    <li key={j} className="leading-relaxed"><InlineHtml text={item} /></li>
                                ))}
                            </ol>
                        );
                    case 'blockquote':
                        return (
                            <blockquote key={idx} className="mb-2 pl-3 border-l-2 border-gray-gray300 dark:border-gray-gray500 text-sm text-gray-gray500 dark:text-gray-gray400 italic">
                                <InlineHtml text={block.content} />
                            </blockquote>
                        );
                    case 'hr':
                        return <hr key={idx} className="my-3 border-gray-gray100 dark:border-gray-gray600" />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
