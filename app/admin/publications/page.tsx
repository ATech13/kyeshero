import { getAllAdminPosts } from "@/actions/posts";
import PostsClientList from "./PostsClientList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publications & Vie de l'Église | Admin",
};

export default async function AdminPostsPage() {
  const posts = await getAllAdminPosts();
  return <PostsClientList initialPosts={posts} />;
}
