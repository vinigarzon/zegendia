type MarkdownProps = {
  source: string;
};

const proseClassName =
  "prose prose-invert max-w-none prose-headings:font-display prose-headings:text-white prose-h2:mt-12 prose-h3:mt-10 prose-p:text-slate-300 prose-a:text-[#78d5d7] prose-strong:text-white prose-li:text-slate-300 prose-blockquote:border-l-[#e44c44] prose-blockquote:text-white prose-code:text-[#b7e78c] prose-img:rounded-[24px] prose-img:border prose-img:border-white/10 prose-video:rounded-[24px] prose-video:border prose-video:border-white/10 lg:prose-lg";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function flushList(items: string[], ordered: boolean) {
  if (!items.length) {
    return "";
  }

  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</${tag}>`;
}

function markdownToHtml(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let orderedList = false;

  function flushParagraph() {
    if (!paragraph.length) {
      return;
    }

    blocks.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushCurrentList() {
    if (!listItems.length) {
      return;
    }

    blocks.push(flushList(listItems, orderedList));
    listItems = [];
    orderedList = false;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushCurrentList();
      continue;
    }

    const heading = /^(#{2,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushCurrentList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);
    if (unordered) {
      flushParagraph();
      if (listItems.length && orderedList) {
        flushCurrentList();
      }
      orderedList = false;
      listItems.push(unordered[1]);
      continue;
    }

    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (ordered) {
      flushParagraph();
      if (listItems.length && !orderedList) {
        flushCurrentList();
      }
      orderedList = true;
      listItems.push(ordered[1]);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushCurrentList();

  return blocks.join("\n");
}

export function Markdown({ source }: MarkdownProps) {
  const trimmedSource = source.trim();
  const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(trimmedSource);
  const html = isHtmlContent ? trimmedSource : markdownToHtml(trimmedSource);

  return <div className={proseClassName} dangerouslySetInnerHTML={{ __html: html }} />;
}
