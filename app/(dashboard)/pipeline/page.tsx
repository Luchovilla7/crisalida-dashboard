import { getLeads, getServices } from "@/lib/queries";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default async function PipelinePage() {
  const [leads, services] = await Promise.all([getLeads(), getServices()]);
  return <PipelineBoard leads={leads} services={services} />;
}

