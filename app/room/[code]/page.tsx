import { notFound } from "next/navigation";
import { Room } from "../../ui";
export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!/^[a-z0-9]{8}$/.test(code)) notFound();
  return <Room code={code} />;
}
