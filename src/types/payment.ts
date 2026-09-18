export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon?: string;
  logos?: string[];
  expandedContent?: string;
}
