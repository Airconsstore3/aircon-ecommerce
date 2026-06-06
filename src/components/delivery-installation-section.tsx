"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Truck, Wrench, RotateCcw } from "lucide-react";

interface FeatureTopItem {
  id: string;
  label: string;
}

interface FeatureIconItem {
  id: string;
  icon: React.ReactNode;
  label: string | React.ReactNode;
}

const TOP_FEATURES: FeatureTopItem[] = [
  {
    id: "1",
    label: "Delivery Enquiry"
  },
  {
    id: "2",
    label: "Installation Enquiry"
  },
  {
    id: "3",
    label: "Return Policy"
  }
];

const ICON_FEATURES: FeatureIconItem[] = [
  {
    id: "delivery",
    icon: <Truck className="w-8 h-8 text-[#1C99D6]" />,
    label: "In Cape Town, anything after you pay a fee"
  },
  {
    id: "installation",
    icon: <Wrench className="w-8 h-8 text-[#1C99D6]" />,
    label: "Professional installation services available"
  },
  {
    id: "return",
    icon: <RotateCcw className="w-8 h-8 text-[#1C99D6]" />,
    label: "Easy returns with our satisfaction guarantee"
  }
];

export const DeliveryInstallationSection: React.FC = () => {
  return (
    <section className="w-full bg-white py-20 px-4 sm:px-20">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-4">
        <h2 className="text-[13px] font-normal uppercase tracking-tight text-black m-0 font-[var(--font-google-sans-flex)]">
          <span>Services</span>
        </h2>

        <div className="border-[0.8px] border-[#0A2540]/30 rounded-none overflow-hidden flex flex-col bg-white">
          {/* Top Bar Navigation/Feature List */}
          <ul className="flex flex-col lg:flex-row border-b-[0.8px] border-[#0A2540]/30 list-none m-0 p-0">
            {TOP_FEATURES.map((item, index) => (
              <li
                key={item.id}
                className={`
                  flex justify-center items-center text-center py-6 px-10 
                  text-[13px] font-medium uppercase tracking-tight text-black font-[var(--font-google-sans-flex)]
                  w-full
                  ${index !== TOP_FEATURES.length - 1 ? 'border-b-[0.8px] lg:border-b-0 lg:border-r-[0.8px] border-[#0A2540]/30' : ''}
                `}
              >
                <span>{item.label}</span>
              </li>
            ))}
          </ul>

          {/* Icon Grid Section */}
          <ul className="grid grid-cols-1 md:grid-cols-3 list-none m-0 p-0">
            {ICON_FEATURES.map((item, index) => (
              <li
                key={item.id}
                className={`
                  flex flex-col items-center justify-center gap-6 py-8 px-4 text-center
                  ${index !== ICON_FEATURES.length - 1 ? 'border-b-[0.8px] md:border-b-0 md:border-r-[0.8px] border-[#0A2540]/30' : ''}
                `}
              >
                <div className="h-[38px] lg:h-[38px] flex items-center justify-center overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="h-full w-auto block"
                  >
                    {item.icon}
                  </motion.div>
                </div>
                <h3 className="text-[13px] font-normal uppercase leading-[1.1] text-black m-0 max-w-[175px] text-center font-[var(--font-google-sans-flex)]">
                  {typeof item.label === 'string' ? <span>{item.label}</span> : item.label}
                </h3>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
