import { pool } from "./db";

export async function ensureUser(userId: string, email?: string | null) {
  await pool.query(
    `
      INSERT INTO public.users (id, email)
      VALUES ($1, $2)
      ON CONFLICT (id) DO UPDATE
      SET email = COALESCE(EXCLUDED.email, public.users.email),
          updated_at = now()
    `,
    [userId, email || null]
  );
}
