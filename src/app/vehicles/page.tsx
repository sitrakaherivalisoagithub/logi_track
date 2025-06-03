'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { IVehicle } from '@/models/Vehicle'; // Import the interface

interface VehicleWithId extends IVehicle {
  _id: string; // Ensure _id is part of the type
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/vehicles');
        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.error || 'Failed to fetch vehicles');
        }
        const result = await response.json();
        if (result.success) {
          setVehicles(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch vehicles');
        }
      } catch (error) {
        const e = error as Error;
        console.error('Error fetching vehicles:', e);
        toast({
          title: 'Error',
          description: e.message || 'Could not fetch vehicles. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [toast]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicle Fleet</h1>
        <Link href="/vehicles/new" passHref>
          <Button>Register New Vehicle</Button>
        </Link>
      </div>

      {isLoading ? (
        <p>Loading vehicles...</p>
      ) : vehicles.length === 0 ? (
        <p>No vehicles registered yet. <Link href="/vehicles/new" className="text-indigo-600 hover:underline">Add one now!</Link></p>
      ) : (
        <div className="bg-white p-6 shadow-md rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Plate Number</TableHead>
                <TableHead className="text-right">Max Payload (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle._id}>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.plateNumber}</TableCell>
                  <TableCell className="text-right">{vehicle.maxPayloadKg.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
