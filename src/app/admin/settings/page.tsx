import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(cookieStore);

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .single();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6" style={{ color: "#0A2540" }}>
        Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: "#0A2540" }}>Store Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm initialData={settings || {}} />
        </CardContent>
      </Card>
    </div>
  );
}
