import { notFound } from "next/navigation";
import { getClient, getClientLinks, getClientNotes } from "@/lib/queries";
import { ClientDetail } from "@/components/clients/client-detail";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const [notes, links] = await Promise.all([getClientNotes(id), getClientLinks(id)]);

  return <ClientDetail client={client} notes={notes} links={links} />;
}
