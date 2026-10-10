import { getAllAdminSermonQuotes } from "@/actions/quotes";
import QuotesClientList from "./QuotesClientList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Citations de Prédications | Admin",
};

export default async function AdminQuotesPage() {
  const quotes = await getAllAdminSermonQuotes();
  return <QuotesClientList initialQuotes={quotes} />;
}
