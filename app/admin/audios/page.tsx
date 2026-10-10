import { redirect } from "next/navigation";

export default function AdminAudiosPage() {
  redirect("/admin/contenus?tab=audios");
}

