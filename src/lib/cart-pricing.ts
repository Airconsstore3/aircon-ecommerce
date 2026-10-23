interface CartPriceItem {
  price_zar: number;
  sale_price_zar?: number | null;
  quantity: number;
  is_enquiry_only: boolean;
  installation_price_zar?: number;
  kit_price_zar?: number;
  maintenance_price_zar?: number;
  warranty_price_zar?: number;
  has_quoted_extras?: boolean;
}

export function getCartBreakdown(items: readonly CartPriceItem[]) {
  return items.reduce((totals, item) => {
    totals.hasEnquiryItems ||= item.is_enquiry_only;
    totals.hasQuotedExtras ||= item.has_quoted_extras === true;
    if (item.is_enquiry_only) return totals;

    const unitPrice = item.sale_price_zar ?? item.price_zar;
    const installation = item.installation_price_zar ?? 0;
    const kit = item.kit_price_zar ?? 0;
    const maintenance = item.maintenance_price_zar ?? 0;
    const warranty = item.warranty_price_zar ?? 0;
    totals.hasPricedItems = true;
    totals.subtotal += (unitPrice - installation - kit - maintenance - warranty) * item.quantity;
    totals.installationTotal += installation * item.quantity;
    totals.kitTotal += kit * item.quantity;
    totals.maintenanceTotal += maintenance * item.quantity;
    totals.warrantyTotal += warranty * item.quantity;
    totals.total += unitPrice * item.quantity;
    return totals;
  }, {
    subtotal: 0,
    installationTotal: 0,
    kitTotal: 0,
    maintenanceTotal: 0,
    warrantyTotal: 0,
    total: 0,
    hasPricedItems: false,
    hasEnquiryItems: false,
    hasQuotedExtras: false,
  });
}
