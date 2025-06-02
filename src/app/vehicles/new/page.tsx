"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function NewVehiclePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const vehicleData = {
      brand: formData.get('brand'),
      plateNumber: formData.get('plateNumber'),
      maxPayloadKg: Number(formData.get('maxPayloadKg')),
    };

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create vehicle');
      }

      toast({
        title: "Success",
        description: "Vehicle has been registered successfully.",
      });

      router.push('/vehicles');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Register New Vehicle</CardTitle>
          <CardDescription>Add a new vehicle to your fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="brand" className="text-sm font-medium">
                Brand
              </label>
              <Input
                id="brand"
                name="brand"
                required
                placeholder="e.g., Toyota, Mitsubishi"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="plateNumber" className="text-sm font-medium">
                Plate Number
              </label>
              <Input
                id="plateNumber"
                name="plateNumber"
                required
                placeholder="e.g., 1234 TBA"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="maxPayloadKg" className="text-sm font-medium">
                Maximum Payload (kg)
              </label>
              <Input
                id="maxPayloadKg"
                name="maxPayloadKg"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="e.g., 1000"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Vehicle
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 