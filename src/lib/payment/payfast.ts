import { createHash } from "crypto";
import {
  PaymentProvider,
  CreatePaymentParams,
  CreatePaymentResult,
  VerifyWebhookParams,
  VerifyWebhookResult,
} from "./types";
import { registerProvider } from "./registry";

// ─── Payfast Configuration ───────────────────────────────────────────────────

function getConfig() {
  return {
    merchantId: process.env.PAYFAST_MERCHANT_ID || "",
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || "",
    passphrase: process.env.PAYFAST_PASSPHRASE || "",
    mode: process.env.PAYFAST_MODE || "sandbox",
  };
}

function getBaseUrl(): string {
  const { mode } = getConfig();
  return mode === "live"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";
}

// ─── Signature Generation (server-side only) ─────────────────────────────────

function generateSignature(params: Record<string, string>, passphrase: string): string {
  // Sort keys alphabetically, exclude signature field
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== "signature")
    .sort();

  // Build query string
  let query = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(params[key].trim()).replace(/%20/g, "+")}`)
    .join("&");

  // Append passphrase if set
  if (passphrase) {
    query += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  // MD5 hash
  return createHash("md5").update(query).digest("hex");
}

// ─── Payfast Provider ────────────────────────────────────────────────────────

class PayfastProvider implements PaymentProvider {
  code = "payfast";
  name = "Payfast";

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const config = getConfig();

    if (!config.merchantId || !config.merchantKey) {
      throw new Error("Payfast is not configured. Set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY.");
    }

    const paymentParams: Record<string, string> = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: `${params.baseUrl}/order-confirmed/${params.orderId}?token=${params.secureToken}`,
      cancel_url: `${params.baseUrl}/order-confirmed/${params.orderId}?token=${params.secureToken}&cancelled=1`,
      notify_url: `${params.baseUrl}/api/payfast/itn`,
      name_first: params.customerName.split(" ")[0] || params.customerName,
      name_last: params.customerName.split(" ").slice(1).join(" ") || "",
      email_address: params.customerEmail || "",
      cell_number: params.customerPhone.replace("+", ""),
      m_payment_id: params.orderNumber,
      amount: params.amountZar.toFixed(2),
      item_name: `Order ${params.orderNumber}`,
      item_description: `Aircons Store order ${params.orderNumber}`,
      custom_str1: params.orderId,
      custom_str2: params.secureToken,
    };

    // Generate signature
    const signature = generateSignature(paymentParams, config.passphrase);
    paymentParams.signature = signature;

    // Build redirect URL with all params
    const url = new URL(getBaseUrl());
    Object.entries(paymentParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return {
      redirectUrl: url.toString(),
      paymentReference: params.orderNumber,
    };
  }

  async verifyWebhook(params: VerifyWebhookParams): Promise<VerifyWebhookResult> {
    const config = getConfig();
    const body = params.body;

    // 1. Validate signature
    const expectedSignature = generateSignature(body, config.passphrase);
    const providedSignature = params.signature || body.signature;

    if (!providedSignature || providedSignature !== expectedSignature) {
      console.error("[payfast] Signature mismatch");
      return {
        valid: false,
        orderNumber: null,
        amountZar: null,
        paymentStatus: null,
        providerTransactionId: null,
        rawResponse: body,
      };
    }

    // 2. Validate merchant ID
    if (body.merchant_id !== config.merchantId) {
      console.error("[payfast] Merchant ID mismatch");
      return {
        valid: false,
        orderNumber: null,
        amountZar: null,
        paymentStatus: null,
        providerTransactionId: null,
        rawResponse: body,
      };
    }

    // 3. Extract payment data
    const orderNumber = body.m_payment_id || null;
    const amountZar = body.amount_gross ? Math.round(parseFloat(body.amount_gross) * 100) / 100 : null;
    const pfPaymentId = body.pf_payment_id || null;
    const paymentStatus = body.payment_status || "";

    // 4. Map Payfast status to our status
    let mappedStatus: "paid" | "failed" | "cancelled" | null = null;
    if (paymentStatus === "COMPLETE") mappedStatus = "paid";
    else if (paymentStatus === "FAILED") mappedStatus = "failed";
    else if (paymentStatus === "CANCELLED") mappedStatus = "cancelled";

    return {
      valid: true,
      orderNumber,
      amountZar,
      paymentStatus: mappedStatus,
      providerTransactionId: pfPaymentId,
      rawResponse: body,
    };
  }
}

// Register the provider
registerProvider(new PayfastProvider());
