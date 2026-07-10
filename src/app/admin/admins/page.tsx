import { cookies } from "next/headers";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/utils/supabase/server";
import { serviceRoleClient } from "@/lib/supabase-service";

export default async function AdminAdminsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: admins } = await serviceRoleClient
    .from("admins")
    .select("id, user_id, created_at")
    .order("created_at", { ascending: false });

  const allUsersResult = await serviceRoleClient.auth.admin.listUsers();
  const allUsers = Array.isArray(allUsersResult.data?.users) ? allUsersResult.data.users : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: "#0A2540" }}>Admin Users</h1>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "#0A2540" }}>Add Admin</h2>
        <form action={async (formData: FormData) => {
          "use server";
          const email = String(formData.get("email") || "");
          const targetUsersResult = await serviceRoleClient.auth.admin.listUsers();
          const targetUsers = Array.isArray(targetUsersResult.data?.users) ? targetUsersResult.data.users : [];
          const userRecord = targetUsers.find((u: { email?: string }) => u.email === email);

          if (!userRecord) {
            throw new Error("User not found");
          }

          await serviceRoleClient.from("admins").insert({ user_id: userRecord.id });
        }} className="flex gap-3">
          <input
            name="email"
            type="email"
            placeholder="User email address"
            required
            className="h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button type="submit" className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg">
            Add as Admin
          </Button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead style={{ color: "#0A2540" }}>User ID</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Email</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Added</TableHead>
              <TableHead className="text-right" style={{ color: "#0A2540" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins?.map((admin) => {
              const userProfile = allUsers.find((u: { id: string }) => u.id === admin.user_id);
              return (
                <TableRow key={admin.id} className="border-slate-200">
                  <TableCell className="font-mono text-xs" style={{ color: "#64748B" }}>{admin.user_id}</TableCell>
                  <TableCell style={{ color: "#64748B" }}>{userProfile?.email || "Unknown"}</TableCell>
                  <TableCell style={{ color: "#64748B" }}>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {admin.user_id !== user.id && (
                      <form action={async () => {
                        "use server";
                        await serviceRoleClient.from("admins").delete().eq("id", admin.id);
                      }}>
                        <Button variant="destructive" size="sm" className="rounded-lg">
                          Remove
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
