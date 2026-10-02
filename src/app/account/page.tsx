import React from 'react';
import { AccountClient } from './AccountClient';

export const metadata = {
  title: 'My Account & Sizing Profile Vault | Miss Stitch',
  description: 'Manage your saved inch sizing profiles, track active tailoring orders, and view delivery addresses.',
};

export default function AccountPage() {
  return <AccountClient />;
}
