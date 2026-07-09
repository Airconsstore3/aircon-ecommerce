const PRODUCT_IMAGE_BASE = "/Hero Images/Product category pictures";

const SAMSUNG_MODEL_IMAGES: Array<{ keywords: string[]; images: string[] }> = [
  {
    keywords: ["ar9500"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung AR9500 2.0 WindFree open (1).webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR9500 2.0 WindFree Remote.webp`,
    ],
  },
  {
    keywords: ["ar8500"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung AR8500 WindFree Front.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR8500 WindFree condesnser.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR8500 remote.webp`,
    ],
  },
  {
    keywords: ["ar80"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung AR80 WindFree front.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR80 WindFree open.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR80 WindFree condenser front.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR80 WindFree condenser back.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR80 WindFree Remote.webp`,
    ],
  },
  {
    keywords: ["ar70", "bespoke"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Wall mount AC AR70 Bespoke AI WindFree front.webp`,
      `${PRODUCT_IMAGE_BASE}/Wall mount AC AR70 Bespoke AI WindFree  on top.webp`,
      `${PRODUCT_IMAGE_BASE}/Wall mount AC AR70 Bespoke AI WindFree condenser.webp`,
      `${PRODUCT_IMAGE_BASE}/Wall mount AC AR70 Bespoke AI WindFree  remote.webp`,
    ],
  },
  {
    keywords: ["ar6500"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung AR6500 WindFree.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR6500 front half.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR6500 outdoor.webp`,
    ],
  },
  {
    keywords: ["ar4500"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung AR4500 Inverter close.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR4500 Inverter close (2).webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR4500 Inverter side.webp`,
    ],
  },
  {
    keywords: ["ar3000"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung AR3000.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR3000 open.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR3000 side.webp`,
    ],
  },
  {
    keywords: ["ar40"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung AR40.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR40 open.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR40 side.webp`,
    ],
  },
  {
    keywords: ["commercial wall-mount", "commercial wall mount"],
    images: [`${PRODUCT_IMAGE_BASE}/Samsung Commercial Wall-Mount WindFree.webp`],
  },
  {
    keywords: ["360"],
    images: [`${PRODUCT_IMAGE_BASE}/Samsung 360 Cassette.webp`],
  },
  {
    keywords: ["msp"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung MSP Duct front.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung MSP Duct front side.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung MSP Duct front side (2).webp`,
    ],
  },
  {
    keywords: ["4-way", "4 way", "mini cassette"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung 4-Way Mini Cassette WindFree front.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung 4-Way Mini Cassette WindFree front  corner.webp`,
    ],
  },
  {
    keywords: ["1-way", "1 way"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung 1-Way Cassette WindFree front.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung 1-Way Cassette WindFree 1.webp`,
    ],
  },
  {
    keywords: ["9000btu", "complete package", "inverter split wall unit"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Samsung AR80 WindFree front.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR80 WindFree open.webp`,
      `${PRODUCT_IMAGE_BASE}/Samsung AR80 WindFree condenser front.webp`,
    ],
  },
];

const COMFEE_IMAGES = [
  `${PRODUCT_IMAGE_BASE}/Comfee Comfee combo front.webp`,
  `${PRODUCT_IMAGE_BASE}/Comfee Comfee front side.webp`,
  `${PRODUCT_IMAGE_BASE}/Comfee Comfee details.webp`,
  `${PRODUCT_IMAGE_BASE}/Comfee Comfee condesnser.webp`,
];

const ALLIANCE_MODEL_IMAGES: Array<{ keywords: string[]; images: string[] }> = [
  {
    keywords: ["aqua"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Alliance Aqua front.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Aqua back.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Aqua condenser.webp`,
    ],
  },
  {
    keywords: ["black mirror"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Alliance Black Mirror Finish Pro Inverter front.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Black Mirror Finish Pro Inverter left.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Black Mirror Finish Pro Inverter middle.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Black Mirror Finish Pro Inverter Right.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Black Mirror Finish Pro Inverter tilt.webp`,
    ],
  },
  {
    keywords: ["emerald"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Alliance Emerald R32 Inverter Front.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Emerald R32 Inverter l.e.d on.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Emerald R32 Inverter left.webp`,
    ],
  },
  {
    keywords: ["fous"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Alliance FOUS front.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance FOUS side.webp`,
    ],
  },
  {
    keywords: ["cassette"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Alliance Cassette Inverter.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Cassette Non-Inverter.webp`,
    ],
  },
  {
    keywords: ["duct heavy commercial"],
    images: [`${PRODUCT_IMAGE_BASE}/Alliance Duct Heavy Commercial Inverter.webp`],
  },
  {
    keywords: ["duct light commercial"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Alliance Duct Light Commercial Inverter.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Duct Light Commercial Non-Inverter.webp`,
    ],
  },
  {
    keywords: ["floor standing"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Alliance Floor Standing Inverter.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Floor Standing Non-Inverter.webp`,
    ],
  },
  {
    keywords: ["large rooftop"],
    images: [`${PRODUCT_IMAGE_BASE}/Alliance Large Rooftop Non-Inverter.webp`],
  },
  {
    keywords: ["rooftop"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Alliance Rooftop Inverter front.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Rooftop Inverter side.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Rooftop Non-Inverter Front.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Rooftop Non-Inverter back.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Rooftop Non-Inverter side.webp`,
    ],
  },
  {
    keywords: ["underceiling"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Alliance Underceiling Inverter.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Underceiling Non-Inverter.webp`,
    ],
  },
  {
    keywords: ["window wall"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Alliance Window Wall Cooling Only.webp`,
      `${PRODUCT_IMAGE_BASE}/Alliance Window Wall Heat Pump.webp`,
    ],
  },
  {
    keywords: ["portable"],
    images: [`${PRODUCT_IMAGE_BASE}/Alliance Portable.webp`],
  },
];

function getAllianceImages(name: string) {
  const normalizedName = normalizeName(name);
  const match = ALLIANCE_MODEL_IMAGES.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(normalizeName(keyword)))
  );

  return match?.images ?? [];
}

const HISENSE_MODEL_IMAGES: Array<{ keywords: string[]; images: string[] }> = [
  {
    keywords: ["cassette inverter"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Hisense LCAC Cassette Inverter.webp`,
      `${PRODUCT_IMAGE_BASE}/Hisense LCAC Cassette Inverter front.webp`,
    ],
  },
  {
    keywords: ["cassette non-inverter", "cassette non inverter"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Hisense LCAC Cassette Non-Inverter.webp`,
      `${PRODUCT_IMAGE_BASE}/Hisense LCAC Cassette Non-Inverter  front.webp`,
    ],
  },
  {
    keywords: ["cassette"],
    images: [
      `${PRODUCT_IMAGE_BASE}/Hisense LCAC Cassette Inverter.webp`,
      `${PRODUCT_IMAGE_BASE}/Hisense LCAC Cassette Inverter front.webp`,
    ],
  },
  {
    keywords: ["duct type inverter", "duct inverter"],
    images: [`${PRODUCT_IMAGE_BASE}/Hisense LCAC Duct Type Inverter.webp`],
  },
  {
    keywords: ["duct type non-inverter", "duct non inverter", "duct non-inverter"],
    images: [`${PRODUCT_IMAGE_BASE}/Hisense LCAC Duct Type Non-Inverter.webp`],
  },
  {
    keywords: ["duct type", "duct"],
    images: [`${PRODUCT_IMAGE_BASE}/Hisense LCAC Duct Type Inverter.webp`],
  },
  {
    keywords: ["floor ceiling inverter", "floor/ceiling inverter", "floor-ceiling inverter"],
    images: [`${PRODUCT_IMAGE_BASE}/Hisense LCAC Floor Ceiling Inverter.webp`],
  },
  {
    keywords: ["floor ceiling non-inverter", "floor/ceiling non inverter", "floor-ceiling non-inverter"],
    images: [`${PRODUCT_IMAGE_BASE}/Hisense LCAC Floor Ceiling Non-Inverter.webp`],
  },
  {
    keywords: ["floor ceiling", "floor/ceiling", "floor-ceiling"],
    images: [`${PRODUCT_IMAGE_BASE}/Hisense LCAC Floor Ceiling Inverter.webp`],
  },
  {
    keywords: ["rac inverter", "wall inverter"],
    images: [`${PRODUCT_IMAGE_BASE}/Hisense RAC Inverter.webp`],
  },
  {
    keywords: ["rac non-inverter", "rac non inverter", "wall non-inverter"],
    images: [`${PRODUCT_IMAGE_BASE}/Hisense RAC Non-Inverter.webp`],
  },
  {
    keywords: ["rac", "wall"],
    images: [`${PRODUCT_IMAGE_BASE}/Hisense RAC Inverter.webp`],
  },
];

const JET_AIR_MODEL_IMAGES: Array<{ keywords: string[]; images: string[] }> = [
  {
    keywords: ["j-smart mirror"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA J-Smart Mirror Mid Wall Split front.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA J-Smart Mirror Mid Wall Split side.webp`,
    ],
  },
  {
    keywords: ["j-smart"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA J-Smart Mid Wall font.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA J-Smart Mid Wall tilt.webp`,
    ],
  },
  {
    keywords: ["q plus wine"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus Wine Mid Wall Split front.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus Wine Mid Wall Split right (2).webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus Wine Mid Wall Split right.webp`,
    ],
  },
  {
    keywords: ["q plus x"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus X Mid Wall Split 2.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus X Mid Wall Split front 1.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus X Mid Wall Split front.webp`,
    ],
  },
  {
    keywords: ["q plus 2.0 mid wall split (inverter)", "q plus inverter"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus 2.0 Mid Wall Split (Inverter) front.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus 2.0 Mid Wall Split (Inverter) right.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus 2.0 Mid Wall Split (Inverter) side.webp`,
    ],
  },
  {
    keywords: ["q plus 2.0 mid wall split (fixed speed)", "q plus fixed speed"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus 2.0 Mid Wall Split (Fixed Speed)front.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus 2.0 Mid Wall Split (Fixed Speed) 2.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus 2.0 Mid Wall Split (Fixed Speed) side 2.webp`,
    ],
  },
  {
    keywords: ["q plus portable", "portable"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus Portable (Wi-Fi, Fixed Speed front.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus Portable (Wi-Fi, Fixed Speed side.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Q Plus Portable (Wi-Fi, Fixed Speed back.webp`,
    ],
  },
  {
    keywords: ["industrial floor standing"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA AL Industrial Floor Standing front.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA AL Industrial Floor Standing side.webp`,
    ],
  },
  {
    keywords: ["shine floor standing"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA Shine Floor Standing 1.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Shine Floor Standing front.webp`,
    ],
  },
  {
    keywords: ["floor standing"],
    images: [`${PRODUCT_IMAGE_BASE}/JASA AL Floor Standing.webp`],
  },
  {
    keywords: ["asi cassette", "cassette (inverter)"],
    images: [`${PRODUCT_IMAGE_BASE}/JASA ASI Cassette (Inverter).webp`],
  },
  {
    keywords: ["r2 cassette"],
    images: [`${PRODUCT_IMAGE_BASE}/JASA R2 Cassette (Fixed Speed).webp`],
  },
  {
    keywords: ["large ducted"],
    images: [`${PRODUCT_IMAGE_BASE}/JASA Large Ducted.webp`],
  },
  {
    keywords: ["asi ducted", "ducted (inverter)"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA ASI Ducted (Inverter).webp`,
      `${PRODUCT_IMAGE_BASE}/JASA ASI Ducted (Inverter) 2.webp`,
    ],
  },
  {
    keywords: ["r2 ducted"],
    images: [`${PRODUCT_IMAGE_BASE}/JASA R2 Ducted (Fixed Speed).webp`],
  },
  {
    keywords: ["asi floor/ceiling", "asi floor ceiling", "floor/ceiling (inverter)", "floor ceiling (inverter)"],
    images: [`${PRODUCT_IMAGE_BASE}/JASA ASI Floor_Ceiling (Inverter).webp`],
  },
  {
    keywords: ["r2 floor/ceiling", "r2 floor ceiling"],
    images: [`${PRODUCT_IMAGE_BASE}/JASA R2 Floor_Ceiling (Fixed Speed).webp`],
  },
  {
    keywords: ["large rooftop package"],
    images: [`${PRODUCT_IMAGE_BASE}/JASA Large Rooftop Package.webp`],
  },
  {
    keywords: ["inverter rooftop package", "rooftop package"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA Inverter Rooftop Package.webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Inverter Rooftop Package front.webp`,
    ],
  },
  {
    keywords: ["air cooled scroll chiller"],
    images: [`${PRODUCT_IMAGE_BASE}/JASA Air Cooled Scroll Chiller.webp`],
  },
  {
    keywords: ["inverter mini chiller", "mini chiller"],
    images: [`${PRODUCT_IMAGE_BASE}/JASA Inverter Mini Chiller.webp`],
  },
  {
    keywords: ["window wall"],
    images: [
      `${PRODUCT_IMAGE_BASE}/JASA Window Wall (Fixed Speed, Cooling Only).webp`,
      `${PRODUCT_IMAGE_BASE}/JASA Window Wall (Fixed Speed, Heat Pump).webp`,
    ],
  },
];

function getHisenseImages(name: string) {
  const normalizedName = normalizeName(name);
  const match = HISENSE_MODEL_IMAGES.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(normalizeName(keyword)))
  );

  return match?.images ?? [];
}

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[\/_-]/g, " ").replace(/\s+/g, " ").trim();
}

function getJetAirImages(name: string) {
  const normalizedName = normalizeName(name);
  const match = JET_AIR_MODEL_IMAGES.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(normalizeName(keyword)))
  );

  return match?.images ?? [];
}

function getSamsungImages(name: string) {
  const normalizedName = normalizeName(name);
  const match = SAMSUNG_MODEL_IMAGES.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(normalizeName(keyword)))
  );

  return match?.images ?? [];
}

export function getProductImages(product: { name?: string; brand: string | null; images?: string[] | null }) {
  const brand = product.brand?.toLowerCase() ?? "";

  if (brand === "samsung") {
    return getSamsungImages(product.name ?? "");
  }

  if (brand === "comfee") {
    return COMFEE_IMAGES;
  }

  if (brand === "alliance") {
    return getAllianceImages(product.name ?? "");
  }

  if (brand === "jet-air" || brand === "jet air") {
    return getJetAirImages(product.name ?? "");
  }

  if (brand === "hisense") {
    return getHisenseImages(product.name ?? "");
  }

  // Only show database images for non-mapped brands if they are not Samsung-specific fallback images.
  // Other brands will show blank until their own exact image mappings are added.
  if (product.images && product.images.length > 0 && !product.images.some((url) => url.toLowerCase().includes("samsung"))) {
    return product.images;
  }

  return [];
}

export function getCssImageUrl(url: string) {
  return `url("${url.replace(/"/g, '\\"')}")`;
}
