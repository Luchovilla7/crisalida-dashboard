import { getLeads } from "@/lib/queries";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default async function PipelinePage() {
  const leads = await getLeads();
  return <PipelineBoard leads={leads} />;
}
