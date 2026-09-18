"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WarrantyConfig, WarrantySelection, ResolvedWarrantyPrice } from "@/types/warranty";
import { WarrantyProductContext, resolveWarrantyPrice } from "@/lib/warranty-price";

function formatPrice(price: number): string {
  if (typeof price !== "number" || Number.isNaN(price)) return "—";
  return `R ${Math.round(price).toLocaleString("en-ZA")}`;
}

function formatPeriodLabel(months: number): string {
  if (months < 12) return `${months}-Month`;
  const years = Math.floor(months / 12);
  return years === 1 ? `${years}-Year` : `${years}-Year`;
}

interface WarrantyOptionButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function WarrantyOptionButton({ label, isSelected, onClick }: WarrantyOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 border px-3 py-[10px] text-left text-[13px] font-medium transition-colors sm:px-4 sm:py-3",
        isSelected
          ? "border-[#1C99D6] bg-[#F4FAFD] text-[#1C99D6]"
          : "border-[#E1E5EA] bg-white text-[#0A2540] hover:border-[#1C99D6]"
      )}
    >
      <span
        className={cn(
          "h-3 w-3 border transition-colors",
          isSelected ? "border-[#1C99D6] bg-[#1C99D6]" : "border-[#9CA3AF] bg-white"
        )}
        aria-hidden="true"
      />
      <span>{label}</span>
    </button>
  );
}

interface WarrantySelectorProps {
  config: WarrantyConfig;
  product: WarrantyProductContext;
  value: WarrantySelection | null;
  onChange: (selection: WarrantySelection | null) => void;
}

export function WarrantySelector({ config, product, value, onChange }: WarrantySelectorProps) {
  const [showTerms, setShowTerms] = useState(false);

  const activeOptions = useMemo(
    () => config.options.filter((o) => o.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [config.options]
  );

  const selectedOption = activeOptions.find((o) => o.id === value?.optionId) ?? null;

  const resolved = useMemo<ResolvedWarrantyPrice>(() => {
    if (!selectedOption) {
      return { optionId: "", price: 0, priceOnRequest: false, requiresConfirmation: false, message: null };
    }
    return resolveWarrantyPrice(config, selectedOption.id, product);
  }, [config, selectedOption, product]);

  const termsText = useMemo(() => {
    if (!selectedOption) return null;
    return config.terms.find((t) => t.option_id === selectedOption.id)?.terms ?? null;
  }, [config.terms, selectedOption]);

  const hasWarranty = value !== null && value.optionId !== "";

  const canEnableWarranty = activeOptions.length > 0;

  const handleToggle = (want: boolean) => {
    if (!want) {
      onChange(null);
      return;
    }
    const firstOption = activeOptions[0];
    if (firstOption) {
      onChange({ optionId: firstOption.id, termsAccepted: false });
    }
  };

  const canAdd = !resolved.priceOnRequest && !resolved.requiresConfirmation && value?.termsAccepted === true;
  const needsTerms = !!termsText;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleToggle(false)}
          className={cn(
            "px-5 py-[6px] text-[13px] font-medium transition-colors",
            !hasWarranty
              ? "bg-[#1C99D6] text-white"
              : "border border-[#E1E5EA] bg-white text-[#0A2540] hover:border-[#1C99D6]"
          )}
        >
          No
        </button>
        <button
          type="button"
          disabled={!canEnableWarranty}
          onClick={() => handleToggle(true)}
          className={cn(
            "px-5 py-[6px] text-[13px] font-medium transition-colors",
            hasWarranty
              ? "bg-[#1C99D6] text-white"
              : "border border-[#E1E5EA] bg-white text-[#0A2540] hover:border-[#1C99D6]",
            !canEnableWarranty && "cursor-not-allowed border-gray-100 text-[#9CA3AF] hover:border-[#E1E5EA]"
          )}
        >
          Yes
        </button>
      </div>

      {!canEnableWarranty && (
        <p className="text-[13px] text-[#5F6B7A]">
          No warranty options are currently configured. Please contact support for assistance.
        </p>
      )}

      {hasWarranty && (
        <div className="space-y-4">
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">
              Warranty period
            </h4>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {activeOptions.map((option) => (
                <WarrantyOptionButton
                  key={option.id}
                  label={option.name}
                  isSelected={value?.optionId === option.id}
                  onClick={() => onChange({ optionId: option.id, termsAccepted: false })}
                />
              ))}
            </div>
          </div>

          {selectedOption && (
            <div className="border border-[#E1E5EA] bg-white p-3 sm:p-4">
              <p className="text-[14px] font-semibold text-[#0A2540]">
                {formatPeriodLabel(selectedOption.period_months)} Extended Warranty
              </p>
              <p className="text-[13px] text-[#5F6B7A]">Additional manufacturer warranty cover.</p>

              {resolved.priceOnRequest ? (
                <p className="mt-2 text-[14px] font-semibold text-[#5F6B7A]">Price on request</p>
              ) : resolved.requiresConfirmation ? (
                <p className="mt-2 text-[13px] text-[#1C99D6]">Eligibility to be confirmed</p>
              ) : (
                <p className="mt-2 text-[16px] font-semibold text-[#0A2540]">{formatPrice(resolved.price)}</p>
              )}

              {resolved.message && (
                <p className="mt-1 text-[13px] text-[#5F6B7A]">{resolved.message}</p>
              )}

              {termsText && (
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="mt-3 text-[14px] font-semibold text-[#1C99D6] transition-colors hover:text-[#0A2540]"
                >
                  View warranty terms &rarr;
                </button>
              )}

              {needsTerms && (
                <div className="mt-3 flex items-start gap-3">
                  <Checkbox
                    id="warranty-terms-accepted"
                    checked={value?.termsAccepted ?? false}
                    onCheckedChange={(checked) =>
                      onChange({ optionId: selectedOption.id, termsAccepted: checked === true })
                    }
                    className="mt-0.5 rounded-none border-[#9CA3AF] data-[state=checked]:border-[#1C99D6] data-[state=checked]:bg-[#1C99D6] data-[state=checked]:text-white"
                  />
                  <label
                    htmlFor="warranty-terms-accepted"
                    className="cursor-pointer text-[13px] font-medium leading-[1.5] text-[#0A2540]"
                  >
                    I have read and accept the Extended Warranty Terms
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {termsText && (
        <Dialog open={showTerms} onOpenChange={setShowTerms}>
          <DialogContent className="h-full max-h-[100dvh] w-full max-w-none rounded-none border-0 p-0 sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:border sm:border-gray-200">
            <DialogHeader className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <DialogTitle className="text-[16px] font-semibold text-[#0A2540]">
                Extended Warranty Terms & Conditions
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[calc(100dvh-120px)] overflow-y-auto px-5 py-5 sm:max-h-[60vh] sm:px-6">
              <p className="whitespace-pre-wrap text-[14px] leading-[1.7] text-[#5F6B7A]">{termsText}</p>
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
      )}
    </div>
  );
}
