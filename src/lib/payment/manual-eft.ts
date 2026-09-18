import {
  PaymentProvider,
  CreatePaymentParams,
  CreatePaymentResult,
  VerifyWebhookParams,
  VerifyWebhookResult,
} from "./types";
import { registerProvider } from "./registry";

class ManualEftProvider implements PaymentProvider {
  code = "manual_eft";
  name = "Manual EFT";

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    // Manual EFT doesn't redirect to a payment gateway.
    // The customer is redirected to the order confirmation page
    // which displays banking details.
    return {
      redirectUrl: `${params.baseUrl}/order-confirmed/${params.orderId}?token=${params.secureToken}`,
      paymentReference: params.orderNumber,
    };
  }

  async verifyWebhook(_params: VerifyWebhookParams): Promise<VerifyWebhookResult> {
    // Manual EFT has no webhook. Payment is confirmed by admin.
    return {
      valid: false,
      orderNumber: null,
      amountZar: null,
      paymentStatus: null,
      providerTransactionId: null,
      rawResponse: {},
    };
  }
}

registerProvider(new ManualEftProvider());
