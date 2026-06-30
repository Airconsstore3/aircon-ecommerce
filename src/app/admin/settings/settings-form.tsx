"use client";

import { useState } from "react";
import { updateSettings } from "../actions/settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface SettingsFormProps {
  initialData: any;
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: initialData.id || "",
    store_name: initialData.store_name || "Aircons Store",
    contact_email: initialData.contact_email || "",
    contact_phone: initialData.contact_phone || "",
    whatsapp_number: initialData.whatsapp_number || "",
    free_shipping_threshold_zar: initialData.free_shipping_threshold_zar || "",
    announcement_text: initialData.announcement_text || "",
    announcement_active: initialData.announcement_active || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "announcement_active") {
          formDataObj.append(key, value ? "true" : "false");
        } else {
          formDataObj.append(key, value as string);
        }
      });

      const result = await updateSettings(formDataObj);

      if (result.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="store_name">Store Name</Label>
        <Input
          id="store_name"
          name="store_name"
          value={formData.store_name}
          onChange={handleChange}
          className="mt-2"
        />
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#0A2540" }}>
          Contact Information
        </h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              placeholder="+27 XX XXX XXXX"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="info@airconsstore.co.za"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input
              id="whatsapp_number"
              name="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={handleChange}
              placeholder="+27 XX XXX XXXX"
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#0A2540" }}>
          Shipping
        </h3>

        <div>
          <Label htmlFor="free_shipping_threshold_zar">
            Free Shipping Threshold (ZAR)
          </Label>
          <Input
            id="free_shipping_threshold_zar"
            name="free_shipping_threshold_zar"
            type="number"
            value={formData.free_shipping_threshold_zar}
            onChange={handleChange}
            placeholder="1000"
            className="mt-2"
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#0A2540" }}>
          Announcement Banner
        </h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="announcement_text">Announcement Text</Label>
            <Textarea
              id="announcement_text"
              name="announcement_text"
              value={formData.announcement_text}
              onChange={handleChange}
              placeholder="Free shipping on orders over R1000!"
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="announcement_active"
              checked={formData.announcement_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  announcement_active: checked as boolean,
                }))
              }
            />
            <Label htmlFor="announcement_active">
              Show announcement banner
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: "#1C99D6" }}
          className="text-white hover:opacity-90"
        >
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
