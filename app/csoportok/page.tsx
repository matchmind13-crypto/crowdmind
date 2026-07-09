import type { Metadata } from 'next';
import { GroupsDirectory } from './GroupsDirectory';

export const metadata: Metadata = {
  title: 'Csoportok',
  description: 'A CrowdMind közösségi csoportjai — böngéssz, csatlakozz, vagy hozd létre a sajátodat!',
  alternates: { canonical: '/csoportok' },
};

export default function GroupsPage() {
  return <GroupsDirectory />;
}
