import { getAllAdminEvents } from "@/actions/events";
import EventsClientList from "./EventsClientList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion des Événements | Admin",
};

export default async function AdminEventsPage() {
  const events = await getAllAdminEvents();
  return <EventsClientList initialEvents={events} />;
}
