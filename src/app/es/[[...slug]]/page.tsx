import { redirect } from "next/navigation";

export default async function Page({
  params
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = slug && slug.length > 0 ? `/${slug.join("/")}` : "/";
  redirect(path as never);
}
