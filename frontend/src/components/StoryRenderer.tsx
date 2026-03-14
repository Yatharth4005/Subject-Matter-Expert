'use client';

interface StoryRendererProps {
  content: string;
}

/**
 * Renders interleaved text + images from the Creative Storyteller agent.
 * Expects content with image markers like [IMAGE:url] interspersed with text.
 */
export default function StoryRenderer({ content }: StoryRendererProps) {
  // Parse content to extract text and image blocks
  const chunks = parseStoryContent(content);

  return (
    <div className="story-container">
      {chunks.map((chunk, idx) =>
        chunk.type === 'text' ? (
          <p key={idx} className="story-chunk--text">
            {chunk.content}
          </p>
        ) : (
          <div key={idx} className="story-chunk--image">
            <img
              src={chunk.content}
              alt={`Story illustration ${idx}`}
              loading="lazy"
            />
          </div>
        ),
      )}
    </div>
  );
}

function parseStoryContent(content: string): Array<{ type: 'text' | 'image'; content: string }> {
  const parts: Array<{ type: 'text' | 'image'; content: string }> = [];
  const regex = /\[IMAGE:(.*?)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Text before image
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim();
      if (text) parts.push({ type: 'text', content: text });
    }
    // Image
    parts.push({ type: 'image', content: match[1] });
    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim();
    if (text) parts.push({ type: 'text', content: text });
  }

  // If no special markers found, just return as text
  if (parts.length === 0 && content.trim()) {
    parts.push({ type: 'text', content: content.trim() });
  }

  return parts;
}
