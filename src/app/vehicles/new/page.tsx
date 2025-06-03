<<<<<<< HEAD
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
=======
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast'; // Assuming you have a toast hook

interface VehicleFormData {
  brand: string;
  plateNumber: string;
  maxPayloadKg: string; // Input will be string, convert to number before sending
}
>>>>>>> dev

export default function NewVehiclePage() {
  const router = useRouter();
  const { toast } = useToast();
<<<<<<< HEAD
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
=======
  const [formData, setFormData] = useState<VehicleFormData>({
    brand: '',
    plateNumber: '',
    maxPayloadKg: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof VehicleFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof VehicleFormData, string>> = {};
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required.';
    if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required.';
    if (!formData.maxPayloadKg.trim()) {
      newErrors.maxPayloadKg = 'Max payload is required.';
    } else if (isNaN(Number(formData.maxPayloadKg)) || Number(formData.maxPayloadKg) <= 0) {
      newErrors.maxPayloadKg = 'Max payload must be a positive number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please check the form for errors.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        maxPayloadKg: Number(formData.maxPayloadKg),
      };
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to add vehicle (status: ${response.status})`);
      }

      toast({
        title: 'Success!',
        description: 'Vehicle added successfully.',
      });
      router.push('/vehicles'); // Redirect to the list of vehicles page
    } catch (error) {
      const e = error as Error;
      console.error('Failed to add vehicle:', e);
      toast({
        title: 'Error',
        description: e.message || 'Could not add vehicle. Please try again.',
        variant: 'destructive',
>>>>>>> dev
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Register New Vehicle</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-md rounded-lg">
        <div>
          <Label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</Label>
          <Input
            id="brand"
            name="brand"
            type="text"
            value={formData.brand}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.brand ? 'border-red-500' : ''}`}
          />
          {errors.brand && <p className="mt-2 text-sm text-red-600">{errors.brand}</p>}
        </div>

        <div>
          <Label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">Plate Number</Label>
          <Input
            id="plateNumber"
            name="plateNumber"
            type="text"
            value={formData.plateNumber}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.plateNumber ? 'border-red-500' : ''}`}
          />
          {errors.plateNumber && <p className="mt-2 text-sm text-red-600">{errors.plateNumber}</p>}
        </div>

        <div>
          <Label htmlFor="maxPayloadKg" className="block text-sm font-medium text-gray-700">Maximum Payload (kg)</Label>
          <Input
            id="maxPayloadKg"
            name="maxPayloadKg"
            type="number"
            value={formData.maxPayloadKg}
            onChange={handleChange}
            min="0"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.maxPayloadKg ? 'border-red-500' : ''}`}
          />
          {errors.maxPayloadKg && <p className="mt-2 text-sm text-red-600">{errors.maxPayloadKg}</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {isLoading ? 'Adding Vehicle...' : 'Add Vehicle'}
        </Button>
      </form>
    </div>
  );
}
>>>>>>> dev
