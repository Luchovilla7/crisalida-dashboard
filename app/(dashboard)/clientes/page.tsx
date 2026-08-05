import { getClients, getServices } from "@/lib/queries";
import { ClientList } from "@/components/clients/client-list";

export default async function ClientesPage() {
  const [clients, services] = await Promise.all([getClients(), getServices()]);
  return <ClientList clients={clients} services={services} />;
}

