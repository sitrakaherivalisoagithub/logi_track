import { DeliveryForm } from '@/components/DeliveryForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LogDeliveryPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Log New Delivery</CardTitle>
          <CardDescription>Fill in the details below to record a delivery.</CardDescription>
        </CardHeader>
        <CardContent>
          <DeliveryForm />
        </CardContent>
      </Card>
    </div>
  );
}
