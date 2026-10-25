import { notFound } from "next/navigation";
import Frame from "../../../../../components/Frame";
import { jobs } from "../../../../../lib/data";
import Prepare from "../../../../../components/Prepare";

export default async function PreparePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!jobs.find((j) => j.id === id)) notFound();
  return (
    <Frame word="Pitch" caption="TAILOR AND SEND" step={1}>
      <Prepare jobId={id} />
    </Frame>
  );
}
