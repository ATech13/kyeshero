import { redirect } from "next/navigation";

export default function PublicationsPage() {
  redirect("/evenements?filter=news");
}
