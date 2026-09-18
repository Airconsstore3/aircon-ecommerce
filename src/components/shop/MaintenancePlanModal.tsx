"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MaintenancePlanConfig,
  MaintenancePlan,
  MaintenancePlanService,
} from "@/types/maintenance-plan";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductInfo {
  id: string;
  name: string;
  display_name?: string | null;
  brand: string | null;
  btu_range: number | null;
  type: string;
}

export interface ResolvedMaintenancePrice {
  plan: MaintenancePlan;
  /** exact price in ZAR cents as a number, or null when the price is on request */
  price: number | null;
  /** how to display the price prefix: "R", "From R" etc. */
  displayPrefix: string;
  priceOnRequest: boolean;
}

export interface MaintenancePlanSelection {
  planId: string;
  purchasedFromAirconsStore: boolean;
  termsAccepted: boolean;
}

interface MaintenancePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductInfo;
  quantity: number;
  config: MaintenancePlanConfig;
  initialSelection?: Partial<MaintenancePlanSelection>;
  onConfirm: (selection: MaintenancePlanSelection, price: ResolvedMaintenancePrice | null) => void;
  onCancel?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace("ZAR", "R");
}

function formatBtu(btu: number | null): string {
  if (!btu) return "Unknown BTU";
  return `${btu.toLocaleString("en-ZA")} BTU`;
}

function matchesRule(
  value: string | number | null | undefined,
  min?: number | null,
  max?: number | null,
  exact?: string | null,
  anyValues?: (string | null)[]
): boolean {
  if (min !== undefined && min !== null && min > 0) {
    if (typeof value !== "number" || value < min) return false;
  }
  if (max !== undefined && max !== null && max > 0) {
    if (typeof value !== "number" || value > max) return false;
  }
  if (exact && exact.trim()) {
    if (String(value ?? "").toLowerCase() !== exact.toLowerCase()) return false;
  }
  if (anyValues && anyValues.length > 0) {
    if (!anyValues.some((v) => (v || "").toLowerCase() === String(value ?? "").toLowerCase())) {
      return false;
    }
  }
  return true;
}

function resolvePrice(
  config: MaintenancePlanConfig,
  plan: MaintenancePlan,
  product: ProductInfo,
  quantity: number,
  purchasedFromAirconsStore: boolean
): ResolvedMaintenancePrice {
  const rules = config.pricingRules
    .filter((r) => r.plan_id === plan.id && r.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const purchaseSource = purchasedFromAirconsStore ? "aircons_store" : "elsewhere";

  for (const rule of rules) {
    const sourceOk =
      !rule.purchase_source ||
      rule.purchase_source === "any" ||
      rule.purchase_source === purchaseSource;

    if (!sourceOk) continue;
    if (!matchesRule(product.btu_range, rule.min_btu, rule.max_btu)) continue;
    if (!matchesRule(product.type, undefined, undefined, rule.unit_type)) continue;
    if (!matchesRule(product.brand, undefined, undefined, rule.brand)) continue;
    if (quantity < rule.quantity_min || quantity > rule.quantity_max) continue;

    return {
      plan,
      price: rule.price_on_request ? null : (rule.price ?? null),
      displayPrefix: rule.display_prefix || "R",
      priceOnRequest: rule.price_on_request,
    };
  }

  // No matching rule: price on request.
  return { plan, price: null, displayPrefix: "R", priceOnRequest: true };
}

function resolveEligibility(
  config: MaintenancePlanConfig,
  plan: MaintenancePlan,
  product: ProductInfo,
  purchasedFromAirconsStore: boolean
): { eligible: boolean; message: string } {
  const rules = config.eligibilityRules.filter((r) => r.plan_id === plan.id && r.is_active);

  if (rules.length === 0) {
    return { eligible: true, message: "Eligibility to be confirmed" };
  }

  for (const rule of rules) {
    const purchaseOk = !rule.requires_purchase_from_aircons_store || purchasedFromAirconsStore;
    if (!purchaseOk) continue;
    if (!matchesRule(product.btu_range, rule.min_btu, rule.max_btu)) continue;
    if (!matchesRule(product.type, undefined, undefined, rule.unit_type)) continue;
    if (!matchesRule(product.brand, undefined, undefined, rule.brand)) continue;

    return {
      eligible: rule.eligible,
      message:
        rule.message ||
        (rule.eligible ? "Eligible for this maintenance plan" : "Eligibility to be confirmed"),
    };
  }

  return { eligible: true, message: "Eligibility to be confirmed" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MaintenancePlanModal({
  open,
  onOpenChange,
  product,
  quantity,
  config,
  initialSelection,
  onConfirm,
  onCancel,
}: MaintenancePlanModalProps) {
  const activePlans = useMemo(
    () => config.plans.filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [config.plans]
  );

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    initialSelection?.planId ?? activePlans[0]?.id ?? null
  );
  const [purchasedFromAirconsStore, setPurchasedFromAirconsStore] = useState<boolean>(
    initialSelection?.purchasedFromAirconsStore ?? true
  );
  const [termsAccepted, setTermsAccepted] = useState<boolean>(
    initialSelection?.termsAccepted ?? false
  );
  const [showTerms, setShowTerms] = useState(false);

  // Reset state when the modal opens
  useEffect(() => {
    if (open) {
      setSelectedPlanId(initialSelection?.planId ?? activePlans[0]?.id ?? null);
      setPurchasedFromAirconsStore(initialSelection?.purchasedFromAirconsStore ?? true);
      setTermsAccepted(initialSelection?.termsAccepted ?? false);
    }
  }, [open, activePlans, initialSelection]);

  const selectedPlan = useMemo(
    () => activePlans.find((p) => p.id === selectedPlanId) ?? activePlans[0] ?? null,
    [activePlans, selectedPlanId]
  );

  const planServices = useMemo(() => {
    if (!selectedPlan) return [];
    return config.services
      .filter((s) => s.plan_id === selectedPlan.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => s.service);
  }, [config.services, selectedPlan]);

  const resolvedPrice = useMemo(() => {
    if (!selectedPlan) return null;
    return resolvePrice(config, selectedPlan, product, quantity, purchasedFromAirconsStore);
  }, [config, selectedPlan, product, quantity, purchasedFromAirconsStore]);

  const eligibility = useMemo(() => {
    if (!selectedPlan) return null;
    return resolveEligibility(config, selectedPlan, product, purchasedFromAirconsStore);
  }, [config, selectedPlan, product, purchasedFromAirconsStore]);

  const displayPrice = useMemo(() => {
    if (!resolvedPrice || resolvedPrice.priceOnRequest) return "Price on request";
    if (resolvedPrice.price === null || resolvedPrice.price === undefined) return "Price on request";
    const formatted = formatPrice(resolvedPrice.price).replace(/^R\s?/, "").trim();
    const prefix = resolvedPrice.displayPrefix?.trim() || "R";
    return `${prefix} ${formatted}`;
  }, [resolvedPrice]);

  const requiresTerms = selectedPlan?.requires_terms_acceptance ?? true;
  const canConfirm = selectedPlan && (!requiresTerms || termsAccepted);

  const handleConfirm = () => {
    if (!selectedPlan || !canConfirm) return;
    onConfirm(
      {
        planId: selectedPlan.id,
        purchasedFromAirconsStore,
        termsAccepted,
      },
      resolvedPrice
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    onCancel?.();
  };

  const productTitle = product.display_name || product.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-full max-h-[100dvh] w-full max-w-none flex-col rounded-none border-0 bg-white p-0 shadow-none sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:border sm:border-gray-200 sm:shadow-lg">
        {/* Fixed header */}
        <DialogHeader className="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-[18px] font-semibold text-[#0A2540] sm:text-[20px]">
                Maintenance
              </DialogTitle>
              <DialogDescription className="sr-only">
                Select a maintenance plan for your air conditioning unit.
              </DialogDescription>
              <p className="mt-1 text-[13px] text-[#5F6B7A]">
                Keep your aircon clean, efficient and properly maintained.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {activePlans.length === 0 ? (
            <p className="text-sm text-[#5F6B7A]">
              No maintenance plans are currently available. Please try again later.
            </p>
          ) : (
            <div className="space-y-8">
              {/* STEP 1: YOUR AIRCON */}
              <section>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">
                  Step 1
                </p>
                <h3 className="text-[16px] font-semibold text-[#0A2540]">YOUR AIRCON</h3>
                <div className="mt-3 border border-gray-100 bg-white p-3 sm:p-4">
                  <div className="grid gap-1 text-[14px] leading-[1.5]">
                    <div className="flex justify-between">
                      <span className="text-[#5F6B7A]">Brand</span>
                      <span className="font-medium text-[#0A2540]">{product.brand || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F6B7A]">Model</span>
                      <span className="font-medium text-[#0A2540]">{productTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F6B7A]">BTU</span>
                      <span className="font-medium text-[#0A2540]">{formatBtu(product.btu_range)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* STEP 2: MAINTENANCE FREQUENCY */}
              <section>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">
                  Step 2
                </p>
                <h3 className="text-[16px] font-semibold text-[#0A2540]">MAINTENANCE FREQUENCY</h3>
                <div className="mt-3 space-y-2">
                  {activePlans.map((plan) => {
                    const preview = resolvePrice(
                      config,
                      plan,
                      product,
                      quantity,
                      purchasedFromAirconsStore
                    );
                    const previewText = preview.priceOnRequest
                      ? "Price on request"
                      : preview.price !== null
                      ? formatPrice(preview.price)
                      : "Price on request";
                    const isSelected = selectedPlan?.id === plan.id;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={cn(
                          "group flex w-full flex-col items-start border p-3 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-4",
                          isSelected
                            ? "border-[#1C99D6] bg-[#F4FAFD]"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        )}
                      >
                        <div>
                          <span
                            className={cn(
                              "text-[15px] font-semibold",
                              isSelected ? "text-[#1C99D6]" : "text-[#0A2540]"
                            )}
                          >
                            {plan.name}
                          </span>
                          {plan.short_description && (
                            <p className="mt-0.5 text-[13px] text-[#5F6B7A]">
                              {plan.short_description}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 text-[14px] font-semibold sm:mt-0 sm:pl-4">
                          {preview.priceOnRequest ? (
                            <span className="text-[#0A2540]">Price on request</span>
                          ) : (
                            <span className="text-[#0A2540]">From {previewText}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* STEP 3: PURCHASED FROM AIRCONS STORE */}
              <section>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">
                  Step 3
                </p>
                <h3 className="text-[16px] font-semibold text-[#0A2540]">
                  DID YOU PURCHASE THIS AIRCON FROM AIRCONS STORE?
                </h3>
                <div className="mt-3 inline-flex items-center rounded-none border border-gray-200 bg-white p-[3px]">
                  {([true, false] as const).map((opt) => (
                    <button
                      key={String(opt)}
                      type="button"
                      onClick={() => setPurchasedFromAirconsStore(opt)}
                      className={cn(
                        "px-5 py-[6px] text-[13px] font-medium transition-colors",
                        purchasedFromAirconsStore === opt
                          ? "bg-[#1C99D6] text-white"
                          : "text-[#58585A] hover:text-[#0A2540]"
                      )}
                    >
                      {opt ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[13px] leading-[1.55] text-[#5F6B7A]">
                  {purchasedFromAirconsStore
                    ? "We’ll check your unit and purchase details to confirm the applicable maintenance pricing and coverage."
                    : "That’s okay. We service eligible aircons purchased from other suppliers too. We’ll assess the unit and confirm whether it qualifies for the selected maintenance plan."}
                </p>
              </section>

              {/* STEP 4: YOUR PLAN */}
              {selectedPlan && (
                <section>
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">
                    Step 4
                  </p>
                  <h3 className="text-[16px] font-semibold text-[#0A2540]">YOUR PLAN</h3>
                  <div className="mt-3 border border-gray-100 bg-white p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[15px] font-semibold text-[#0A2540]">{selectedPlan.name}</p>
                        {selectedPlan.description && (
                          <p className="mt-1 text-[13px] leading-[1.55] text-[#5F6B7A]">
                            {selectedPlan.description}
                          </p>
                        )}
                      </div>
                      <span className="text-[15px] font-semibold text-[#1C99D6] whitespace-nowrap">
                        {displayPrice}
                      </span>
                    </div>

                    {resolvedPrice?.priceOnRequest && (
                      <p className="mt-3 text-[13px] leading-[1.55] text-[#5F6B7A]">
                        Pricing depends on your unit size and maintenance requirements. We’ll confirm the price before proceeding.
                      </p>
                    )}

                    {planServices.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">
                          Includes
                        </p>
                        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                          {planServices.map((service, index) => (
                            <li key={index} className="flex items-start gap-2 text-[13px] text-[#0A2540]">
                              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-[#1C99D6]" aria-hidden="true" />
                              <span>{service}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {eligibility && (
                      <div className="mt-4 border-t border-gray-100 pt-3">
                        <p
                          className={cn(
                            "text-[13px]",
                            eligibility.eligible ? "text-[#0F834D]" : "text-[#5F6B7A]"
                          )}
                        >
                          {eligibility.message}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* STEP 5: REVIEW */}
              {selectedPlan && (
                <section>
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">
                    Step 5
                  </p>
                  <h3 className="text-[16px] font-semibold text-[#0A2540]">REVIEW</h3>
                  <div className="mt-3 border border-gray-100 bg-white p-3 sm:p-4">
                    <dl className="space-y-2 text-[14px]">
                      <div className="flex justify-between">
                        <dt className="text-[#5F6B7A]">Unit</dt>
                        <dd className="font-medium text-[#0A2540]">
                          {product.brand ? `${product.brand} · ` : ""}
                          {productTitle} · {formatBtu(product.btu_range)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[#5F6B7A]">Maintenance frequency</dt>
                        <dd className="font-medium text-[#0A2540]">{selectedPlan.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[#5F6B7A]">Price</dt>
                        <dd className="font-semibold text-[#0A2540]">{displayPrice}</dd>
                      </div>
                    </dl>
                  </div>
                </section>
              )}

              {/* Terms */}
              {selectedPlan?.terms && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-[14px] font-semibold text-[#1C99D6] transition-colors hover:text-[#0A2540]"
                  >
                    View maintenance terms →
                  </button>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="maintenance-terms-accepted"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    />
                    <label
                      htmlFor="maintenance-terms-accepted"
                      className="cursor-pointer text-[13px] font-medium leading-[1.5] text-[#0A2540]"
                    >
                      I have read and accept the maintenance terms
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed bottom action bar */}
        <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-row justify-between gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="h-[44px] flex-1 rounded-none border-gray-200 bg-white text-[#0A2540] hover:bg-gray-50 sm:flex-none sm:px-8"
            >
              Cancel
            </Button>
            <Button
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="h-[44px] flex-1 rounded-none bg-[#1C99D6] text-white hover:bg-[#1597c6] disabled:bg-gray-100 disabled:text-[#9CA3AF] sm:flex-none sm:px-8"
            >
              Add to order
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Terms sub-modal */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="h-full max-h-[100dvh] w-full max-w-none rounded-none border-0 p-0 sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:rounded-none sm:border sm:border-gray-200">
          <DialogHeader className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <DialogTitle className="text-[16px] font-semibold text-[#0A2540]">
              Maintenance Terms
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(100dvh-120px)] overflow-y-auto px-5 py-5 sm:max-h-[60vh] sm:px-6">
            <div className="prose prose-sm max-w-none text-[#5F6B7A]">
              {selectedPlan?.terms ? (
                <p className="whitespace-pre-wrap text-[14px] leading-[1.7]">
                  {selectedPlan.terms}
                </p>
              ) : (
                <p className="text-[14px]">No terms available.</p>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 px-5 py-4 sm:px-6">
            <Button
              onClick={() => setShowTerms(false)}
              className="h-[44px] w-full rounded-none bg-[#1C99D6] text-white hover:bg-[#1597c6] sm:w-auto"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
