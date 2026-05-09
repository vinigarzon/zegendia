import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  source: string;
};

export function Markdown({ source }: MarkdownProps) {
  const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(source.trim());
  const proseClassName =
    "prose prose-invert max-w-none prose-headings:font-display prose-headings:text-white prose-h2:mt-12 prose-h3:mt-10 prose-p:text-slate-300 prose-a:text-[#78d5d7] prose-strong:text-white prose-li:text-slate-300 prose-blockquote:border-l-[#e44c44] prose-blockquote:text-white prose-img:rounded-[24px] prose-img:border prose-img:border-white/10 prose-video:rounded-[24px] prose-video:border prose-video:border-white/10 lg:prose-lg";

  if (isHtmlContent) {
    return <div className={proseClassName} dangerouslySetInnerHTML={{ __html: source }} />;
  }

  return (
    <div className={proseClassName}>
      <MDXRemote source={source} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
    </div>
  );
}
