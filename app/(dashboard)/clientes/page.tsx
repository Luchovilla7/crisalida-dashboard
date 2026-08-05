import { getClients } from "@/lib/queries";
import { ClientList } from "@/components/clients/client-list";

export default async function ClientesPage() {
  const clients = await getClients();
  return <ClientList clients={clients} />;
}
