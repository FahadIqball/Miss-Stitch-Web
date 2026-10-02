import React from 'react';
import { getTeamMembersAction } from '@/app/actions/teamActions';
import { TeamClient } from './TeamClient';

export const metadata = {
  title: 'Workshop Team & Roles | Miss Stitch Atelier Portal',
  description: 'Manage atelier staff permissions, master tailor assignments, and administrative access.',
};

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  const initialMembers = await getTeamMembersAction();

  return <TeamClient initialMembers={initialMembers} />;
}
