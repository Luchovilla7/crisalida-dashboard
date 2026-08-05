import { getClients, getServices } from "@/lib/queries";
import { ServicesManager } from "@/components/services/services-manager";

export default async function ServiciosPage() {
  const [clients, services] = await Promise.all([getClients(), getServices()]);

  return <ServicesManager services={services} clients={clients} />;
}

