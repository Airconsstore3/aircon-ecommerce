declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    notes: string | null;
    items: Array<{
      name: string;
      quantity: number;
      unit_price_zar: number;
      line_total_zar: number;
    }>;
    total_zar: number;
    channel: "whatsapp" | "email" | "both";
  };
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function orderHtml(order: WebhookPayload["record"]) {
  const items = order.items
    .map((item) => `<li>${item.quantity} x ${item.name} - ${formatPrice(item.line_total_zar)}</li>`)
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0A2540;">
      <h1>New checkout request</h1>
      <p><strong>Reference:</strong> ${order.id}</p>
      <p><strong>Name:</strong> ${order.name}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      ${order.email ? `<p><strong>Email:</strong> ${order.email}</p>` : ""}
      ${order.notes ? `<p><strong>Notes:</strong><br>${order.notes.replaceAll("\n", "<br>")}</p>` : ""}
      <h2>Items</h2>
      <ul>${items}</ul>
      <p><strong>Total:</strong> ${formatPrice(order.total_zar)}</p>
    </div>
  `;
}

async function sendEmail(payload: { to: string; subject: string; html: string }) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("RESEND_FROM") || "Aircons Store <orders@aircons-store.co.za>",
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const expectedSecret = Deno.env.get("ORDER_WEBHOOK_SECRET");

  if (expectedSecret && request.headers.get("x-webhook-secret") !== expectedSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await request.json()) as WebhookPayload;
  const order = payload.record;

  if (!order || !["email", "both"].includes(order.channel)) {
    return Response.json({ skipped: true });
  }

  const ownerInbox = Deno.env.get("OWNER_EMAIL") || "info@airconsstore.co.za";
  const html = orderHtml(order);

  await sendEmail({
    to: ownerInbox,
    subject: `New checkout request - ${order.id}`,
    html,
  });

  if (order.email) {
    await sendEmail({
      to: order.email,
      subject: `Aircons Store request received - ${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0A2540;">
          <h1>We received your request</h1>
          <p>Hi ${order.name},</p>
          <p>Thank you for contacting Aircons Store. We will confirm availability, delivery, and installation details before payment.</p>
          <p><strong>Reference:</strong> ${order.id}</p>
          <p><strong>Total:</strong> ${formatPrice(order.total_zar)}</p>
        </div>
      `,
    });
  }

  return Response.json({ success: true });
});
