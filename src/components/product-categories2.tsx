"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Types
interface SolutionItem {
  id: string;
  index: string;
  title: string;
  description: string;
  mobileDescription?: string;
  image1: string;
  image2: string;
  link: string;
}

// Data
const SOLUTIONS_DATA: SolutionItem[] = [{
  id: '1',
  index: '01',
  title: 'Residential Aircons',
  description: 'Find the perfect aircon for your home. We stock split systems, ducted units, heat pumps and inverter models to suit any space or budget. Browse trusted brands that keep you comfortable all year round.',
  mobileDescription: 'Find the perfect aircon for your home. We stock split systems, ducted units, heat pumps and inverter models.',
  image1: '/Hero Images/Product category pictures/Residsentil aircon 1.png',
  image2: '/Hero Images/Product category pictures/Residential aircon 2.png',
  link: '/categories/residential'
}, {
  id: '2',
  index: '02',
  title: 'Commercial Aircons',
  description: 'Equip your business with powerful cooling systems. We supply units for offices, shops, warehouses and restaurants. Choose from reliable brands built to handle demanding work environments efficiently.',
  mobileDescription: 'Equip your business with powerful cooling systems. We supply units for offices, shops, warehouses and restaurants.',
  image1: '/Hero Images/Product category pictures/Commercial aircon 1.png',
  image2: '/Hero Images/Product category pictures/Commercial Aircon 2.png',
  link: '/categories/commercial'
}, {
  id: '3',
  index: '03',
  title: 'Portable Aircons',
  description: 'Cool any room without permanent installation. Our portable aircons are ideal for apartments, home offices and temporary spaces. They are compact, powerful and easy to move around as needed.',
  mobileDescription: 'Cool any room without permanent installation. Our portable aircons are ideal for apartments and home offices.',
  image1: '/Hero Images/Product category pictures/Portable aircon 1.png',
  image2: '/Hero Images/Product category pictures/Portable aircon 2.png',
  link: '/categories/portable'
}, {
  id: '4',
  index: '04',
  title: 'Installation Packages',
  description: 'Get your aircon installed by professionals. Add installation to your purchase or book it separately. Our technicians handle the complete setup including mounting and electrical work. We offer standard, premium and custom options.',
  mobileDescription: 'Get your aircon installed by professionals. Add installation to your purchase or book it separately.',
  image1: '/Hero Images/Product category pictures/Installation packages 1.png',
  image2: '/Hero Images/Product category pictures/Installation packages 2.png',
  link: '/categories/kits'
}, {
  id: '5',
  index: '05',
  title: 'Extended Warranty Packages',
  description: 'Protect your aircon with extended warranty cover. We offer bronze, silver, gold and platinum plans with different protection periods. Our warranties cover parts, labour and callouts for full peace of mind.',
  mobileDescription: 'Protect your aircon with extended warranty cover. We offer bronze, silver, gold and platinum plans.',
  image1: '/Hero Images/Product category pictures/extended warrant 1.png',
  image2: '/Hero Images/Product category pictures/extended waranty 2.png',
  link: '/categories/warranty'
}, {
  id: '6',
  index: '06',
  title: 'Maintenance Packages',
  description: 'Keep your aircon running smoothly with regular servicing. We provide annual service plans, quarterly check-ups and one-off maintenance visits. Our team handles cleaning, filter changes and system checks to maximise efficiency.',
  mobileDescription: 'Keep your aircon running smoothly with regular servicing. We provide annual service plans and quarterly check-ups.',
  image1: '/Hero Images/Product category pictures/maintaninance packages 1.png',
  image2: '/Hero Images/Product category pictures/maintaninance packages 2.png',
  link: '/maintenance'
}];

const SolutionCard = ({
  item,
  isFirstRow
}: {
  item: SolutionItem;
  isFirstRow: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  return <motion.div initial={{
    opacity: 0,
    y: 30
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true
  }} transition={{
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1],
    delay: Number(item.index) * 0.1
  }} className={cn("relative flex flex-col md:flex-row w-full p-8 md:p-[30px] transition-colors duration-200 group", !isFirstRow && "md:border-t-[0.8px] border-[#0A2540]/30")} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <span className="absolute top-[20px] left-[20px] text-[12px] font-normal text-[#1C99D6] z-10 font-[var(--font-google-sans-flex)]">
        {item.index}
      </span>
      
      {/* Image Container */}
      <div className="relative w-full md:w-[366.2px] aspect-square flex items-center justify-center shrink-0">
        <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden">
          <img src={item.image1} alt={`${item.title} outline`} className={cn("absolute inset-0 w-full h-full object-contain transition-all duration-400 ease-[cubic-bezier(0.83,0,0.17,1)] pointer-events-none", isHovered ? "opacity-0" : "opacity-100")} />
          <img src={item.image2} alt={`${item.title} detailed`} className={cn("absolute inset-0 w-full h-full object-contain transition-all duration-400 ease-[cubic-bezier(0.83,0,0.17,1)] pointer-events-none", isHovered ? "opacity-100" : "opacity-0")} />
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 pt-8 md:pt-[30px] md:pl-[42px] pb-[75px] relative">
        <h3 className="text-[20px] md:text-[28px] leading-[1.1] md:leading-[31px] font-normal mb-[15px] text-black font-[var(--font-google-sans-flex)]">
          {item.title}
        </h3>
        <div className="text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] font-normal text-black/80 space-y-4 font-[var(--font-google-sans-flex)]">
          <p className="hidden md:block">{item.description}</p>
          <p className="md:hidden">{item.mobileDescription || item.description}</p>
        </div>

        {/* Buttons List */}
        <div className="absolute bottom-[15px] left-0 md:left-[42px] right-0">
          <ul className="flex items-center space-x-10 list-none p-0 m-0">
            <li>
              <Link href="/enquire">
                <div className="aircon-angled-button-wrap">
                  <button className="aircon-angled-button">
                    Enquire
                  </button>
                </div>
              </Link>
            </li>
            <li>
              <Link href={item.link} className="text-[14px] leading-[20px] font-normal text-black inline-block relative border-b border-dashed border-black hover:border-[#1C99D6] hover:text-[#1C99D6] transition-all duration-200 font-[var(--font-google-sans-flex)]">
                View Products
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>;
};

export const AirconCategories = () => {
  return <div className="w-full bg-white overflow-hidden selection:bg-black selection:text-white">
      <section className="w-full max-w-[1920px] mx-auto py-20 px-[35px] font-sans antialiased">
        {/* Section Header */}
        <div className="relative flex flex-col mb-[60px] items-center text-center">
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: 0.5
        }} className="mb-4">
            <span className="text-[14px] leading-[20px] font-normal text-[#1C99D6] uppercase tracking-wider font-[var(--font-google-sans-flex)]">
              Categories
            </span>
          </motion.div>

          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 1,
          ease: [0.22, 1, 0.36, 1]
        }} className="text-[28px] md:text-[48px] leading-[1.1] font-normal text-black -tracking-[0.6px] font-[var(--font-google-sans-flex)] md:whitespace-nowrap">
            Aircon Product Categories
          </motion.h2>
        </div>

        {/* Content Area */}
        <div className="relative pt-[20px]">
          {/* Vertical Divider (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] border-l-[0.8px] border-[#0A2540]/30 transform -translate-x-1/2 z-0" />

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 relative z-10 border-t-[0.8px] border-[#0A2540]/30 md:border-none">
            {SOLUTIONS_DATA.map((item, idx) => <SolutionCard key={item.id} item={item} isFirstRow={idx < 2} />)}
          </div>
        </div>
      </section>
    </div>;
};
