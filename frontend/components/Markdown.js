import React from 'react';

// Lightweight markdown renderer — zero dependencies.
// Renders to React nodes (no dangerouslySetInnerHTML, no string HTML synthesis),
// so attribute escaping is handled by React. Falls back to plain
// whitespace-pre-wrap text if content doesn't look like markdown.

const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:']);

function safeUrl(raw) {
    if (!raw) return null;
    const trimmed = String(raw).trim();
    try {
        const parsed = new URL(trimmed, 'https://example.invalid');
        if (parsed.origin === 'https://example.invalid' && !trimmed.startsWith('/')) {
            return null;
        }
        return SAFE_SCHEMES.has(parsed.protocol) ? parsed.href : null;
    } catch {
        return null;
    }
}

// ── Inline tokenizer ─────────────────────────────────────────────────────────────
// Parses inline markdown into an array of React-renderable tokens.
// Order matters: code spans first (their content is opaque), then links, then
// emphasis. Each pass slices the string into plain segments + token segments
// and recurses into the plain segments for the next pass.

function tokenizeCode(text) {
    const out = [];
    const re = /`([^`]+)`/g;
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) out.push({ type: 'text', value: text.slice(last, m.index) });
        out.push({ type: 'code', value: m[1] });
        last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ type: 'text', value: text.slice(last) });
    return out;
}

function tokenizeLinks(text) {
    const out = [];
    const explicit = /\[([^\]]+)\]\(([^)]+)\)/g;
    let last = 0;
    let m;
    while ((m = explicit.exec(text)) !== null) {
        if (m.index > last) out.push({ type: 'text', value: text.slice(last, m.index) });
        const href = safeUrl(m[2]);
        if (href) {
            out.push({ type: 'link', label: m[1], href });
        } else {
            out.push({ type: 'text', value: m[1] });
        }
        last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ type: 'text', value: text.slice(last) });

    const withAuto = [];
    const auto = /(https?:\/\/[^\s)]+)/g;
    for (const tok of out) {
        if (tok.type !== 'text') { withAuto.push(tok); continue; }
        let l = 0;
        let mm;
        while ((mm = auto.exec(tok.value)) !== null) {
            if (mm.index > l) withAuto.push({ type: 'text', value: tok.value.slice(l, mm.index) });
            const href = safeUrl(mm[1]);
            if (href) {
                withAuto.push({ type: 'link', label: mm[1], href });
            } else {
                withAuto.push({ type: 'text', value: mm[1] });
            }
            l = mm.index + mm[0].length;
        }
        if (l < tok.value.length) withAuto.push({ type: 'text', value: tok.value.slice(l) });
    }
    return withAuto;
}

function tokenizeEmphasis(text) {
    const patterns = [
        { re: /\*\*\*(.+?)\*\*\*/g, type: 'boldItalic' },
        { re: /\*\*(.+?)\*\*/g,     type: 'bold' },
        { re: /\*(.+?)\*/g,         type: 'italic' },
    ];
    let tokens = [{ type: 'text', value: text }];
    for (const { re, type } of patterns) {
        const next = [];
        for (const tok of tokens) {
            if (tok.type !== 'text') { next.push(tok); continue; }
            let last = 0;
            let m;
            re.lastIndex = 0;
            while ((m = re.exec(tok.value)) !== null) {
                if (m.index > last) next.push({ type: 'text', value: tok.value.slice(last, m.index) });
                next.push({ type, value: m[1] });
                last = m.index + m[0].length;
            }
            if (last < tok.value.length) next.push({ type: 'text', value: tok.value.slice(last) });
        }
        tokens = next;
    }
    return tokens;
}

function tokenizeInline(text) {
    const codeStage = tokenizeCode(text);
    const linkStage = [];
    for (const tok of codeStage) {
        if (tok.type !== 'text') { linkStage.push(tok); continue; }
        linkStage.push(...tokenizeLinks(tok.value));
    }
    const finalStage = [];
    for (const tok of linkStage) {
        if (tok.type === 'text') {
            finalStage.push(...tokenizeEmphasis(tok.value));
        } else if (tok.type === 'link') {
            finalStage.push({ ...tok, children: tokenizeEmphasis(tok.label) });
        } else {
            finalStage.push(tok);
        }
    }
    return finalStage;
}

function renderTokens(tokens, keyPrefix = '') {
    return tokens.map((tok, i) => {
        const key = `${keyPrefix}${i}`;
        switch (tok.type) {
            case 'text':       return <React.Fragment key={key}>{tok.value}</React.Fragment>;
            case 'code':       return <code key={key} className="md-code-inline">{tok.value}</code>;
            case 'bold':       return <strong key={key}>{tok.value}</strong>;
            case 'italic':     return <em key={key}>{tok.value}</em>;
            case 'boldItalic': return <strong key={key}><em>{tok.value}</em></strong>;
            case 'link':
                return (
                    <a
                        key={key}
                        href={tok.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="md-link"
                    >
                        {renderTokens(tok.children || [{ type: 'text', value: tok.label }], `${key}-`)}
                    </a>
                );
            default: return null;
        }
    });
}

function Inline({ text }) {
    return <>{renderTokens(tokenizeInline(text))}</>;
}

// ── Block parser ─────────────────────────────────────────────────────────────────

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

    const blocks = React.useMemo(
        () => (source && looksLikeMarkdown(source) ? parseMarkdown(source) : null),
        [source],
    );

    if (!source) return null;

    if (!blocks) {
        return <div className={`text-sm whitespace-pre-wrap leading-relaxed ${className}`}>{source}</div>;
    }

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
                                <Inline text={block.content} />
                            </Tag>
                        );
                    }
                    case 'paragraph':
                        return (
                            <p key={idx} className="mb-2 text-sm leading-relaxed text-gray-gray700 dark:text-gray-gray200">
                                <Inline text={block.content} />
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
                                    <li key={j} className="leading-relaxed"><Inline text={item} /></li>
                                ))}
                            </ul>
                        );
                    case 'ol':
                        return (
                            <ol key={idx} className="mb-2 pl-5 list-decimal text-sm text-gray-gray700 dark:text-gray-gray200 space-y-0.5">
                                {block.items.map((item, j) => (
                                    <li key={j} className="leading-relaxed"><Inline text={item} /></li>
                                ))}
                            </ol>
                        );
                    case 'blockquote':
                        return (
                            <blockquote key={idx} className="mb-2 pl-3 border-l-2 border-gray-gray300 dark:border-gray-gray500 text-sm text-gray-gray500 dark:text-gray-gray400 italic">
                                <Inline text={block.content} />
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
