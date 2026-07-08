import type { Metadata } from 'next';
import { sbRest } from '@/lib/publicConfig';
import { UserProfileView } from './UserProfileView';

/** Publikus felhasználói profil — szerver-héj SEO-metaadatokkal. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);
  const rows = await sbRest<{ user_id: string }[]>(
    `profiles?username=eq.${encodeURIComponent(username)}&select=user_id&limit=1`,
  );
  if (!rows?.[0]) {
    return { title: 'Profil nem található', robots: { index: false } };
  }
  return {
    title: `${username} profilja`,
    description: `${username} témái, hozzászólásai és közösségi aktivitása a CrowdMindon — a magyar közösségi véleményplatformon.`,
    alternates: { canonical: `/user/${encodeURIComponent(username)}` },
  };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <UserProfileView username={decodeURIComponent(username)} />;
}
