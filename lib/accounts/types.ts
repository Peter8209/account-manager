export type ManagedAccountStatus =
  | 'pending'
  | 'active'
  | 'paused'
  | 'blocked'
  | 'archived';

export type ManagedAccount = {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  language: string;
  status: ManagedAccountStatus;
  source: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateManagedAccountInput = {
  email: string;
  username?: string;
  display_name?: string;
  bio?: string;
  language?: string;
  status?: ManagedAccountStatus;
  source?: string;
  notes?: string;
};

export type UpdateManagedAccountInput = Partial<CreateManagedAccountInput>;