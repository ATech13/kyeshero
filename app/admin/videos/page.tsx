import { redirect } from "next/navigation";

export default function AdminVideosPage() {
  redirect("/admin/contenus?tab=videos");
}

