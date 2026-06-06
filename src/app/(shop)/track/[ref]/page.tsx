import { mockOrder, mockOrderTracking } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Calendar, Truck, Wrench, Package } from "lucide-react";

export default function TrackPage({ params }: { params: { ref: string } }) {
  const ref = params.ref;
  
  // In a real app, you'd fetch the order by ref from the database
  // For now, we'll use the mock data
  const order = mockOrder;
  const trackingHistory = mockOrderTracking;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="size-5 text-emerald-500" />;
      case "in_progress":
        return <Wrench className="size-5 text-[#D85A30]" />;
      case "scheduled":
        return <Calendar className="size-5 text-blue-500" />;
      case "paid":
        return <CheckCircle className="size-5 text-emerald-500" />;
      default:
        return <Clock className="size-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "payment_sent":
        return "Payment Sent";
      case "paid":
        return "Payment Received";
      case "scheduled":
        return "Scheduled";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">
            Track Order
          </h1>
          <p className="text-muted-foreground">
            Reference: {ref}
          </p>
        </div>

        {/* Order Summary Card */}
        <Card className="rounded-xl shadow-sm p-6 border-0 mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-[#1E3A5F]">
                {order.order_ref}
              </CardTitle>
              <Badge
                variant={order.status === "completed" ? "default" : "secondary"}
                className={
                  order.status === "completed"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-[#D85A30] hover:bg-[#c44e28] text-white"
                }
              >
                {getStatusLabel(order.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold text-[#1E3A5F]">{formatPrice(order.total_zar)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Scheduled Date</p>
                <p className="font-semibold text-[#1E3A5F]">
                  {order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString("en-ZA") : "TBD"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Time Slot</p>
                <p className="font-semibold text-[#1E3A5F]">{order.scheduled_time_slot || "TBD"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Order Type</p>
                <p className="font-semibold text-[#1E3A5F]">Installation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Timeline */}
        <Card className="rounded-xl shadow-sm p-6 border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[#1E3A5F]">
              Order Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {trackingHistory.map((track, index) => (
                <div key={track.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-white border-2 border-border rounded-full p-2">
                      {getStatusIcon(track.status)}
                    </div>
                    {index < trackingHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-[#1E3A5F]">
                        {getStatusLabel(track.status)}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(track.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {track.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion Notes */}
        {order.completion_notes && (
          <Card className="rounded-xl shadow-sm p-6 border-0 mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#1E3A5F]">
                Completion Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {order.completion_notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
