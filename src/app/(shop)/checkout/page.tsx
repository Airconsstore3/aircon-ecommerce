import { CheckoutClient } from "./CheckoutClient";

export const metadata = {
  title: "Checkout Request | Aircons Store",
  description: "Submit your air conditioning quote request to Aircons Store.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
