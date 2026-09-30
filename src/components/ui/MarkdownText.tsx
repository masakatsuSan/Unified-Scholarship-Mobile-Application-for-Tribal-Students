import React from 'react';

/**
 * Renders the limited Markdown subset that the JAGO answer engine emits:
 * `**bold**`, `*italic*`, `` `code` ``, `-`/`•` bullet lists and blank-line
 * paragraph breaks.
 *
 * Everything is built as React elements, so untrusted content can never be
 * injected as HTML. Masked values such as `(**** 4412)` are left untouched
 * because a bold token cannot contain an asterisk.
 */

const INLINE_PATTERN = /(\*\*[^*\n]+\*\*)|(`[^`\n]+`)|(\*[^*\n]+\*)/g;
const BULLET_PATTERN = /^\s*(?:[-•*])\s+(.*)$/;

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-b-${match.index}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={`${keyPrefix}-c-${match.index}`} className="md-code">{token.slice(1, -1)}</code>);
    } else {
      nodes.push(<em key={`${keyPrefix}-i-${match.index}`}>{token.slice(1, -1)}</em>);
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
};

interface MarkdownTextProps {
  text: string;
  className?: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ text, className = '' }) => {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul className="md-list" key={`ul-${blocks.length}`}>
        {bullets.map((item, idx) => (
          <li key={idx}>{renderInline(item, `ul-${blocks.length}-${idx}`)}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  const lines = (text || '').split('\n');
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const joined = paragraph.join(' ').trim();
    if (joined) blocks.push(<p key={`p-${blocks.length}`}>{renderInline(joined, `p-${blocks.length}`)}</p>);
    paragraph = [];
  };

  lines.forEach(line => {
    if (line.trim() === '') {
      flushBullets();
      flushParagraph();
      return;
    }
    const bullet = BULLET_PATTERN.exec(line);
    if (bullet) {
      flushParagraph();
      bullets.push(bullet[1]);
      return;
    }
    flushBullets();
    paragraph.push(line.trim());
  });
  flushBullets();
  flushParagraph();

  return <div className={`md ${className}`}>{blocks}</div>;
};
