/**
 * User Domain Model
 * The public face of a Supabase Auth user - only what a blog reader may see.
 * Built from `auth.users.raw_user_meta_data`; the email and every other auth
 * column stay behind the repository.
 */
export interface User {
  id: string;
  /** `user_metadata.full_name`. Null when the user has no display name set. */
  name: string | null;
  /** `user_metadata.avatar_url`. Null when unset. */
  avatarUrl: string | null;
}

/** Shape `UserRepository` selects from `auth.users`. */
export interface UserRow {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
  };
}
