"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lock, CreditCard } from "lucide-react";
import { PaymentMethod } from "@/types/payment";
import Image from "next/image";

interface PaymentOptionsProps {
  compact?: boolean;
  methods?: PaymentMethod[];
}

export function PaymentOptions({ compact = false, methods = [] }: PaymentOptionsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  if (methods.length === 0) {
    return null;
  }

  return (
    <div className={`border border-[#E1E5EA] bg-white ${compact ? 'rounded-none' : 'rounded-sm'}`}>
      <div className="px-4 py-2 border-b border-[#E1E5EA]">
        <h3 className="text-[12px] font-semibold text-[#0A2540]">PAYMENT OPTIONS</h3>
      </div>
      <div className="divide-y divide-[#F0F0F0]">
        {methods.map((method) => (
          <PaymentOptionItem
            key={method.id}
            method={method}
            isSelected={selectedMethod === method.id}
            onSelect={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

interface PaymentOptionItemProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
  compact?: boolean;
}

function PaymentOptionItem({ method, isSelected, onSelect, compact }: PaymentOptionItemProps) {
  const Icon = method.id === 'manual-eft' ? CreditCard : Lock;

  return (
    <div>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full flex items-start gap-3 px-4 py-2 text-left transition-colors hover:bg-[#F5F5F5] ${
          isSelected ? 'bg-[#F0F7FC] border-l-2 border-l-[#1C99D6]' : ''
        }`}
      >
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="h-3.5 w-3.5 text-[#5F6B7A]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[12px] font-medium text-[#0A2540] truncate">
              {method.name}
            </h4>
            {isSelected ? (
              <ChevronUp className="h-3.5 w-3.5 text-[#5F6B7A] flex-shrink-0" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[#5F6B7A] flex-shrink-0" />
            )}
          </div>
          <p className="text-[10px] text-[#5F6B7A] mt-0.5">{method.description}</p>
          {!isSelected && method.logos && method.logos.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {method.logos.map((logo, index) => (
                <div key={index} className="relative h-4 w-7 flex-shrink-0">
                  <Image
                    src={logo}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </button>
      {isSelected && method.expandedContent && (
        <div className="px-4 pb-2 pl-11">
          <p className="text-[11px] text-[#5F6B7A]">{method.expandedContent}</p>
          {method.logos && method.logos.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {method.logos.map((logo, index) => (
                <div key={index} className="relative h-4 w-7 flex-shrink-0">
                  <Image
                    src={logo}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
