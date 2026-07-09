import type { Metadata } from 'next';
import { GroupView } from './GroupView';

/** Csoport-oldal (kategória = csoport) — szerver-héj SEO-metaadatokkal. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name: raw } = await params;
  const name = decodeURIComponent(raw);
  return {
    title: `${name} csoport`,
    description: `A(z) ${name} csoport témái és vitái a CrowdMindon — csatlakozz, kövesd, és szólj hozzá!`,
    alternates: { canonical: `/csoport/${encodeURIComponent(name)}` },
  };
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return <GroupView name={decodeURIComponent(name)} />;
}
