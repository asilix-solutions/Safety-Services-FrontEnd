import { simulatedPaymentProvider } from "./providers/simulated";

/** Everything a provider needs to charge for a single invoice. */
export interface PaymentRequestContext {
  invoiceId: string;
  jobNumber: string;
  amount: number;
  currency: string;
}

export type PaymentResult =
  | { status: "succeeded"; transactionReference: string }
  | { status: "failed"; reason: string };

/**
 * The boundary between "collect payment details and confirm the charge" and
 * "mark the invoice paid and provision the project". Everything on the app side
 * of that line lives in `workflow.ts` and never talks to a provider directly.
 *
 * `initiatePayment` is async even though the simulation resolves immediately,
 * because a networked implementation cannot be anything else — keeping the
 * signature honest today means callers need no change tomorrow.
 */
export interface PaymentProvider {
  readonly id: string;
  initiatePayment(ctx: PaymentRequestContext): Promise<PaymentResult>;
}

/**
 * SWAP POINT — the single wiring line to change when a real payment API is
 * introduced. Implement `PaymentProvider` against the backend and assign it
 * here; no caller, dialog or workflow needs to be touched.
 */
export const paymentProvider: PaymentProvider = simulatedPaymentProvider;
