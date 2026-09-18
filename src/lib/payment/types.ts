// ─── Payment Provider Type Definitions ───────────────────────────────────────
// Shared types for payment providers, kept separate to avoid circular imports.

export interface PaymentProvider {
  code: string;
  name: string;
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  verifyWebhook(params: VerifyWebhookParams): Promise<VerifyWebhookResult>;
}

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amountZar: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  baseUrl: string;
  secureToken: string;
}

export interface CreatePaymentResult {
  redirectUrl: string;
  paymentReference: string;
}

export interface VerifyWebhookParams {
  body: Record<string, string>;
  signature: string | undefined;
  sourceIp: string | undefined;
}

export interface VerifyWebhookResult {
  valid: boolean;
  orderNumber: string | null;
  amountZar: number | null;
  paymentStatus: "paid" | "failed" | "cancelled" | null;
  providerTransactionId: string | null;
  rawResponse: Record<string, string>;
}
