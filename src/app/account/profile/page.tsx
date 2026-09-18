import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account/profile");
  }

  return (
    <ProfileForm
      initialFullName={(user.user_metadata?.full_name as string) ?? ""}
      email={user.email ?? ""}
      initialPhone={(user.user_metadata?.phone as string) ?? ""}
      initialContactMethod={(user.user_metadata?.contact_method as string) ?? "both"}
    />
  );
}
