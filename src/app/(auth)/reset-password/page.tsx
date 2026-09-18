import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ResetPasswordForm hasSession={Boolean(user)} />;
}
