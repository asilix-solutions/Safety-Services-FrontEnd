import type { PaymentProvider, PaymentResult } from "../provider";

/** Brief pause so the confirm button's pending state is visible. */
const SETTLEMENT_DELAY_MS = 600;

function generateTransactionReference(): string {
  return `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Simulated provider used by the MVP. It never contacts a network and always
 * settles successfully — failure handling exists in `PaymentResult` for the
 * real implementation, not because this one can fail.
 */
export const simulatedPaymentProvider: PaymentProvider = {
  id: "simulated",
  async initiatePayment(): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, SETTLEMENT_DELAY_MS));
    return {
      status: "succeeded",
      transactionReference: generateTransactionReference(),
    };
  },
};
