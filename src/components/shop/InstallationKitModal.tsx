"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveInstallationPrice } from "@/lib/installation-kit-price";
import {
  InstallationKitConfig,
  KitConfiguration,
  ProductInstallationContext,
  ResolvedInstallationPrice,
} from "@/types/installation-kit";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (typeof price !== "number" || Number.isNaN(price)) return "—";
  return `R ${Math.round(price).toLocaleString("en-ZA")}`;
}

function isValidNumber(value: string): boolean {
  return /^\d+(\.\d+)?$/.test(value.trim()) && Number(value) > 0;
}

interface KitOptionButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  price?: string;
  disabled?: boolean;
  hasIndicator?: boolean;
}

function KitOptionButton({ label, isSelected, onClick, price, disabled, hasIndicator = true }: KitOptionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between border px-3 py-[10px] text-left text-[13px] font-medium transition-colors sm:px-4 sm:py-3",
        isSelected
          ? "border-[#1C99D6] bg-[#F4FAFD]"
          : "border-[#E1E5EA] bg-white hover:border-[#1C99D6]",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className="flex items-center gap-2.5">
        {hasIndicator && (
          <span
            className={cn(
              "h-3 w-3 border transition-colors",
              isSelected ? "border-[#1C99D6] bg-[#1C99D6]" : "border-[#9CA3AF] bg-white"
            )}
            aria-hidden="true"
          />
        )}
        <span className={cn(isSelected ? "text-[#1C99D6]" : "text-[#0A2540]")}>{label}</span>
      </span>
      {price && <span className={cn("font-medium", price === "Quote on request" ? "text-[#5F6B7A]" : "text-[#0A2540]")}>{price}</span>}
    </button>
  );
}

function createDefaultConfig(config: InstallationKitConfig): KitConfiguration {
  const firstKit = config.kits[0];
  if (!firstKit) {
    return {
      kitId: "",
      materialId: "",
      pipeSizeId: "",
      pipeLengthId: "",
      bracketId: "",
      insulationId: "",
      hasCage: false,
      cageId: null,
    };
  }

  const compatibleMaterials = config.materialCompat.filter((c) => c.kit_id === firstKit.id);
  const firstMaterial = config.pipeMaterials.find((m) =>
    compatibleMaterials.some((c) => c.material_id === m.id)
  ) ?? config.pipeMaterials[0];

  const compatibleSizes = firstMaterial
    ? config.pipeSizes.filter((s) => s.material_id === firstMaterial.id)
    : [];
  const firstSize = compatibleSizes[0];

  const compatibleLengths = config.pipeLengths.filter((l) => l.kit_id === firstKit.id);
  const firstLength = compatibleLengths[0];

  const compatibleBrackets = config.bracketCompat.filter((c) => c.kit_id === firstKit.id);
  const firstBracket = config.brackets.find((b) =>
    compatibleBrackets.some((c) => c.bracket_id === b.id)
  ) ?? config.brackets[0];

  const compatibleInsulations = config.insulationCompat.filter((c) => c.kit_id === firstKit.id);
  const firstInsulation = config.insulations.find((i) =>
    compatibleInsulations.some((c) => c.insulation_id === i.id)
  ) ?? config.insulations[0];

  return {
    kitId: firstKit.id,
    materialId: firstMaterial?.id ?? "",
    pipeSizeId: firstSize?.id ?? "",
    pipeLengthId: firstLength?.id ?? "",
    bracketId: firstBracket?.id ?? "",
    insulationId: firstInsulation?.id ?? "",
    hasCage: false,
    cageId: null,
  };
}

function resolveCompatibleIds(config: InstallationKitConfig, configState: KitConfiguration, kitId: string) {
  const materials = config.pipeMaterials.filter((m) =>
    config.materialCompat.some((c) => c.kit_id === kitId && c.material_id === m.id)
  );
  const lengths = config.pipeLengths.filter((l) => l.kit_id === kitId);
  const brackets = config.brackets.filter((b) =>
    config.bracketCompat.some((c) => c.kit_id === kitId && c.bracket_id === b.id)
  );
  const insulations = config.insulations.filter((i) =>
    config.insulationCompat.some((c) => c.kit_id === kitId && c.insulation_id === i.id)
  );
  const cages = config.cages.filter((c) =>
    config.cageCompat.some((cc) => cc.kit_id === kitId && cc.cage_id === c.id)
  );

  let materialId = configState.materialId;
  if (!materials.some((m) => m.id === materialId)) {
    materialId = materials[0]?.id ?? "";
  }

  const sizes = config.pipeSizes.filter((s) => s.material_id === materialId);
  let pipeSizeId = configState.pipeSizeId;
  if (!sizes.some((s) => s.id === pipeSizeId)) {
    pipeSizeId = sizes[0]?.id ?? "";
  }

  let pipeLengthId = configState.pipeLengthId;
  if (!lengths.some((l) => l.id === pipeLengthId)) {
    pipeLengthId = lengths[0]?.id ?? "";
  }

  let bracketId = configState.bracketId;
  if (!brackets.some((b) => b.id === bracketId)) {
    bracketId = brackets[0]?.id ?? "";
  }

  let insulationId = configState.insulationId;
  if (!insulations.some((i) => i.id === insulationId)) {
    insulationId = insulations[0]?.id ?? "";
  }

  let hasCage = configState.hasCage;
  let cageId = configState.cageId;
  if (hasCage && cageId && !cages.some((c) => c.id === cageId)) {
    cageId = cages[0]?.id ?? null;
    hasCage = !!cageId;
  }

  return {
    materials,
    sizes,
    lengths,
    brackets,
    insulations,
    cages,
    materialId,
    pipeSizeId,
    pipeLengthId,
    bracketId,
    insulationId,
    hasCage,
    cageId,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface InstallationKitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: InstallationKitConfig;
  product: ProductInstallationContext;
  initialConfig?: KitConfiguration | null;
  onConfirm: (config: KitConfiguration, resolved: ResolvedInstallationPrice) => void;
  onCancel?: () => void;
}

export function InstallationKitModal({
  open,
  onOpenChange,
  config,
  product,
  initialConfig,
  onConfirm,
  onCancel,
}: InstallationKitModalProps) {
  const activeKits = useMemo(
    () => config.kits.filter((k) => k.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [config.kits]
  );

  const [state, setState] = useState<KitConfiguration>(() => {
    if (initialConfig) return initialConfig;
    return createDefaultConfig(config);
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (open) {
      const resolved = resolveCompatibleIds(config, initialConfig ?? state, (initialConfig ?? state).kitId || activeKits[0]?.id || "");
      setState((prev) => ({
        ...prev,
        ...resolved,
        kitId: prev.kitId || activeKits[0]?.id || "",
      }));
    }
  }, [open, config, activeKits]);

  const resolved = useMemo(
    () => resolveCompatibleIds(config, state, state.kitId),
    [config, state]
  );

  const resolvedPrice = useMemo(
    () => resolveInstallationPrice(config, state, product),
    [config, state, product]
  );

  const selectedKit = config.kits.find((k) => k.id === state.kitId);
  const selectedMaterial = config.pipeMaterials.find((m) => m.id === state.materialId);
  const selectedSize = config.pipeSizes.find((s) => s.id === state.pipeSizeId);
  const selectedLength = config.pipeLengths.find((l) => l.id === state.pipeLengthId);
  const selectedBracket = config.brackets.find((b) => b.id === state.bracketId);
  const selectedInsulation = config.insulations.find((i) => i.id === state.insulationId);
  const selectedCage = state.hasCage && state.cageId ? config.cages.find((c) => c.id === state.cageId) : null;

  const customCage = selectedCage?.is_custom ? selectedCage : null;
  const [customWidth, setCustomWidth] = useState(state.customCageDimensions?.width ?? "");
  const [customHeight, setCustomHeight] = useState(state.customCageDimensions?.height ?? "");
  const [customDepth, setCustomDepth] = useState(state.customCageDimensions?.depth ?? "");

  const customCageValid = customCage
    ? isValidNumber(customWidth) && isValidNumber(customHeight) && isValidNumber(customDepth)
    : true;

  const canConfirm = selectedKit && termsAccepted && customCageValid;

  const updateState = (patch: Partial<KitConfiguration>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      const resolved = resolveCompatibleIds(config, next, next.kitId);
      return { ...next, ...resolved, customCageDimensions: next.customCageDimensions };
    });
  };

  const handleConfirm = () => {
    if (!selectedKit || !canConfirm) return;
    onConfirm(
      {
        ...state,
        customCageDimensions: customCage
          ? { width: customWidth, height: customHeight, depth: customDepth }
          : undefined,
      },
      resolvedPrice
    );
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    onCancel?.();
  };

  if (activeKits.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="h-full max-h-[100dvh] w-full max-w-none rounded-none border-0 p-0 sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:border sm:border-gray-200">
          <DialogHeader className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <DialogTitle className="text-[18px] font-semibold text-[#0A2540]">
              Installation Kit
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 py-5 sm:px-6">
            <p className="text-[14px] text-[#5F6B7A]">
              No installation kits are currently available. Please try again later.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-full max-h-[100dvh] w-full max-w-none flex-col rounded-none border-0 bg-white p-0 shadow-none sm:h-auto sm:max-h-[90vh] sm:max-w-[860px] sm:border sm:border-gray-200 sm:shadow-lg">
        <DialogHeader className="border-b border-gray-200 bg-white px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-[17px] font-semibold text-[#0A2540] sm:text-[19px]">
                Installation Kit
              </DialogTitle>
              <DialogDescription className="sr-only">
                Select and configure your installation kit.
              </DialogDescription>
              <p className="mt-0.5 text-[12px] text-[#5F6B7A]">
                Select the installation distance, then configure the materials.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="text-[24px] leading-none text-[#5F6B7A] transition-colors hover:text-[#0A2540]"
            >
              ×
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-28 pt-5 sm:px-6 sm:pb-32 sm:pt-6">
          <div className="space-y-7">
            {/* Step 1 */}
            <section>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">
                Step 1
              </p>
              <h3 className="text-[14px] font-semibold text-[#0A2540]">Choose installation kit</h3>
              <div className="mt-3 space-y-2">
                {activeKits.map((kit) => {
                  const isSelected = state.kitId === kit.id;
                  return (
                    <button
                      key={kit.id}
                      type="button"
                      onClick={() => updateState({ kitId: kit.id })}
                      className={cn(
                        "flex w-full items-center justify-between border p-3 text-left transition-colors sm:p-4",
                        isSelected
                          ? "border-[#1C99D6] bg-[#F4FAFD]"
                          : "border-[#E1E5EA] bg-white hover:border-[#1C99D6]"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "h-3 w-3 border transition-colors",
                            isSelected ? "border-[#1C99D6] bg-[#1C99D6]" : "border-[#9CA3AF] bg-white"
                          )}
                          aria-hidden="true"
                        />
                        <span className={cn("text-[14px] font-semibold", isSelected ? "text-[#1C99D6]" : "text-[#0A2540]")}>
                          {kit.name}
                        </span>
                      </span>
                      <span className="sr-only">{formatPrice(kit.base_price)}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2 */}
            {selectedKit && (
              <section className="border-t border-[#E1E5EA] pt-6">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">
                  Step 2
                </p>
                <h3 className="text-[14px] font-semibold text-[#0A2540]">Configure your kit</h3>

                {resolved.materials.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">Pipe material</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {resolved.materials.map((material) => (
                        <KitOptionButton
                          key={material.id}
                          label={material.name}
                          isSelected={state.materialId === material.id}
                          onClick={() => updateState({ materialId: material.id })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {resolved.sizes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">Pipe size</h4>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {resolved.sizes.map((size) => (
                        <KitOptionButton
                          key={size.id}
                          label={size.label}
                          isSelected={state.pipeSizeId === size.id}
                          onClick={() => updateState({ pipeSizeId: size.id })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {resolved.lengths.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">Pipe length</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {resolved.lengths.map((length) => (
                        <KitOptionButton
                          key={length.id}
                          label={`${length.length_m}m`}
                          isSelected={state.pipeLengthId === length.id}
                          onClick={() => updateState({ pipeLengthId: length.id })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {resolved.brackets.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">Outdoor unit brackets</h4>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {resolved.brackets.map((bracket) => (
                        <KitOptionButton
                          key={bracket.id}
                          label={bracket.name}
                          isSelected={state.bracketId === bracket.id}
                          onClick={() => updateState({ bracketId: bracket.id })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {resolved.insulations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">Pipe insulation</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {resolved.insulations.map((insulation) => (
                        <KitOptionButton
                          key={insulation.id}
                          label={insulation.name}
                          isSelected={state.insulationId === insulation.id}
                          onClick={() => updateState({ insulationId: insulation.id })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">Protective cage</h4>
                  <p className="text-[12px] text-[#5F6B7A]">
                    Protect your outdoor unit from accidental damage, theft and impact.
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <KitOptionButton
                      key="no-cage"
                      label="No cage"
                      isSelected={!state.hasCage}
                      onClick={() => updateState({ hasCage: false, cageId: null })}
                    />
                    <KitOptionButton
                      key="add-cage"
                      label="Add protective cage"
                      isSelected={state.hasCage}
                      onClick={() => {
                        const firstCage = resolved.cages[0];
                        updateState({ hasCage: true, cageId: firstCage?.id ?? null });
                      }}
                      disabled={resolved.cages.length === 0}
                    />
                  </div>

                  {state.hasCage && resolved.cages.length > 0 && (
                    <div className="mt-3 border-l-2 border-[#1C99D6] pl-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#1C99D6]">Choose cage type</p>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {resolved.cages.map((cage) => (
                          <KitOptionButton
                            key={cage.id}
                            label={cage.name}
                            isSelected={state.cageId === cage.id}
                            onClick={() => updateState({ cageId: cage.id })}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {customCage && (
                    <div className="mt-3 border border-[#E1E5EA] bg-white p-3 sm:p-4">
                      <h5 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">Cage requirements</h5>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[12px] text-[#5F6B7A]">Width</label>
                          <Input
                            value={customWidth}
                            onChange={(e) => setCustomWidth(e.target.value)}
                            placeholder="mm"
                            className="mt-1 rounded-none border-[#E1E5EA] text-[13px]"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] text-[#5F6B7A]">Height</label>
                          <Input
                            value={customHeight}
                            onChange={(e) => setCustomHeight(e.target.value)}
                            placeholder="mm"
                            className="mt-1 rounded-none border-[#E1E5EA] text-[13px]"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] text-[#5F6B7A]">Depth</label>
                          <Input
                            value={customDepth}
                            onChange={(e) => setCustomDepth(e.target.value)}
                            placeholder="mm"
                            className="mt-1 rounded-none border-[#E1E5EA] text-[13px]"
                          />
                        </div>
                      </div>
                      {!customCageValid && (
                        <p className="mt-2 text-[12px] text-[#1C99D6]">
                          Enter valid positive dimensions to continue.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Step 3 */}
            {selectedKit && (
              <section className="border-t border-[#E1E5EA] pt-6">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">
                  Step 3
                </p>
                <h3 className="text-[14px] font-semibold text-[#0A2540]">Review</h3>

                <div className="mt-3 border border-[#E1E5EA] bg-white p-3 sm:p-4">
                  <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">Your configuration</h4>
                  <dl className="mt-2 space-y-1.5 text-[13px]">
                    <div className="flex justify-between">
                      <dt className="text-[#5F6B7A]">Installation kit</dt>
                      <dd className="text-right font-medium text-[#0A2540]">{selectedKit.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#5F6B7A]">Pipe</dt>
                      <dd className="text-right font-medium text-[#0A2540]">{selectedMaterial?.name ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#5F6B7A]">Pipe size</dt>
                      <dd className="text-right font-medium text-[#0A2540]">{selectedSize?.label ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#5F6B7A]">Pipe length</dt>
                      <dd className="text-right font-medium text-[#0A2540]">{selectedLength ? `${selectedLength.length_m}m` : "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#5F6B7A]">Brackets</dt>
                      <dd className="text-right font-medium text-[#0A2540]">{selectedBracket?.name ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#5F6B7A]">Insulation</dt>
                      <dd className="text-right font-medium text-[#0A2540]">{selectedInsulation?.name ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#5F6B7A]">Protective cage</dt>
                      <dd className="text-right font-medium text-[#0A2540]">{selectedCage ? selectedCage.name : "None"}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 border-t border-[#E1E5EA] pt-3">
                    <h4 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#0A2540]">Price</h4>
                    {resolvedPrice.priceOnRequest ? (
                      <p className="mt-2 text-[13px] leading-[1.55] text-[#5F6B7A]">
                        {resolvedPrice.message}
                      </p>
                    ) : (
                      <dl className="mt-2 space-y-1.5">
                        {resolvedPrice.breakdown.map((row) => (
                          <div key={row.label} className="flex justify-between text-[13px]">
                            <dt className="text-[#5F6B7A]">{row.label}</dt>
                            <dd className="font-medium text-[#0A2540]">{formatPrice(row.price)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    <div className="mt-3 flex items-start gap-3 border-t border-[#E1E5EA] pt-3">
                      <Checkbox
                        id="installation-kit-terms-accepted"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                        className="mt-0.5 rounded-none border-[#9CA3AF] data-[state=checked]:border-[#1C99D6] data-[state=checked]:bg-[#1C99D6] data-[state=checked]:text-white"
                      />
                      <label
                        htmlFor="installation-kit-terms-accepted"
                        className="cursor-pointer text-[13px] font-medium leading-[1.5] text-[#0A2540]"
                      >
                        I have read and accept the installation kit terms
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-[#E1E5EA] pt-3 text-[15px] font-bold text-[#0A2540]">
                    <dt>Total</dt>
                    <dd className="text-[#1C99D6]">
                      {resolvedPrice.priceOnRequest ? "Quote on request" : formatPrice(resolvedPrice.price)}
                    </dd>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="h-[44px] flex-1 rounded-none border-[#E1E5EA] bg-white px-6 text-[#0A2540] hover:bg-gray-50 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="h-[44px] flex-1 rounded-none bg-[#1C99D6] px-6 text-white hover:bg-[#1597c6] disabled:bg-gray-100 disabled:text-[#9CA3AF] sm:flex-none"
            >
              Proceed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
