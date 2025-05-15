"use client";

import { useState, useEffect, useMemo } from 'react';
import { format, parse, isValid } from 'date-fns';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Delivery } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, TrendingUp, WeightIcon, DollarSign, FilterX, ListOrdered, Search } from "lucide-react";
import { SummaryCard } from './SummaryCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

export function DeliveryDashboard() {
  const [allDeliveries] = useLocalStorage<Delivery[]>("logiTrackDeliveries", []);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortColumn, setSortColumn] = useState<keyof Delivery | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof Delivery) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const filteredAndSortedDeliveries = useMemo(() => {
    let deliveries = [...allDeliveries].reverse(); // Show newest first by default before sorting

    if (startDate || endDate) {
        deliveries = deliveries.filter(delivery => {
        try {
            const deliveryDate = parse(delivery.date, 'yyyy-MM-dd', new Date());
            if (!isValid(deliveryDate)) return false; // Skip invalid dates

            const deliveryTimestamp = deliveryDate.setHours(0,0,0,0);
            
            if (startDate && deliveryTimestamp < new Date(startDate).setHours(0,0,0,0)) {
                return false;
            }
            if (endDate && deliveryTimestamp > new Date(endDate).setHours(0,0,0,0)) {
                return false;
            }
            return true;
        } catch (e) {
            console.error("Error parsing delivery date:", delivery.date, e);
            return false;
        }
        });
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      deliveries = deliveries.filter(delivery => 
        delivery.client.toLowerCase().includes(lowerSearchTerm) ||
        delivery.departureLocation.toLowerCase().includes(lowerSearchTerm) ||
        delivery.destination.toLowerCase().includes(lowerSearchTerm) ||
        delivery.goods.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (sortColumn) {
      deliveries.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          if (sortColumn === 'date') { // Date string comparison
            comparison = new Date(valA).getTime() - new Date(valB).getTime();
          } else {
            comparison = valA.localeCompare(valB);
          }
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }


    return deliveries;
  }, [allDeliveries, startDate, endDate, searchTerm, sortColumn, sortDirection]);

  const totalRevenue = useMemo(() => 
    filteredAndSortedDeliveries.reduce((sum, d) => sum + d.totalAriary, 0),
    [filteredAndSortedDeliveries]
  );
  const totalWeight = useMemo(() =>
    filteredAndSortedDeliveries.reduce((sum, d) => sum + d.weightKg, 0),
    [filteredAndSortedDeliveries]
  );
  const averagePricePerKg = useMemo(() =>
    totalWeight > 0 ? totalRevenue / totalWeight : 0,
    [totalRevenue, totalWeight]
  );

  const totalPages = Math.ceil(filteredAndSortedDeliveries.length / ITEMS_PER_PAGE);
  const paginatedDeliveries = filteredAndSortedDeliveries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerm("");
    setSortColumn(null);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [startDate, endDate, searchTerm]);

  const SortableHeader = ({ column, label }: { column: keyof Delivery; label: string }) => (
    <TableHead onClick={() => handleSort(column)} className="cursor-pointer hover:bg-muted/50 transition-colors">
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortColumn === column && (sortDirection === 'asc' ? '▲' : '▼')}
      </div>
    </TableHead>
  );


  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Deliveries Dashboard</CardTitle>
          <CardDescription>Overview of all logged deliveries. Track revenue, weight, and filter by date.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SummaryCard title="Total Revenue" value={`${totalRevenue.toLocaleString()} Ar`} icon={TrendingUp} description="Over selected period" />
        <SummaryCard title="Total Weight" value={`${totalWeight.toLocaleString()} kg`} icon={WeightIcon} description="Over selected period" />
        <SummaryCard title="Avg. Price/kg" value={`${averagePricePerKg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Ar`} icon={DollarSign} description="Over selected period" />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : <span>Start Date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                </Popover>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : <span>End Date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus disabled={(date) => startDate && date < startDate} />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="relative flex-grow w-full md:w-auto pt-4 md:pt-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="text" 
                    placeholder="Search client, location, goods..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            <Button onClick={clearFilters} variant="ghost" className="w-full md:w-auto">
                <FilterX className="mr-2 h-4 w-4" /> Clear Filters
            </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-xl">Delivery Logs</CardTitle>
                <CardDescription>
                    Showing {paginatedDeliveries.length} of {filteredAndSortedDeliveries.length} deliveries.
                </CardDescription>
            </div>
             <Button asChild variant="default" size="sm">
                <Link href="/log-delivery">
                    <ListOrdered className="mr-2 h-4 w-4" /> Add New Delivery
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px] w-full">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <SortableHeader column="date" label="Date" />
                  <SortableHeader column="client" label="Client" />
                  <SortableHeader column="departureLocation" label="Departure" />
                  <SortableHeader column="destination" label="Destination" />
                  <SortableHeader column="goods" label="Goods" />
                  <SortableHeader column="weightKg" label="Weight (kg)" />
                  <SortableHeader column="pricePerKg" label="Price/kg (Ar)" />
                  <SortableHeader column="totalAriary" label="Total (Ar)" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDeliveries.length > 0 ? (
                  paginatedDeliveries.map((delivery) => (
                    <TableRow key={delivery.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>{format(parse(delivery.date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{delivery.client}</TableCell>
                      <TableCell>{delivery.departureLocation}</TableCell>
                      <TableCell>{delivery.destination}</TableCell>
                      <TableCell><Badge variant="secondary" className="whitespace-nowrap">{delivery.goods}</Badge></TableCell>
                      <TableCell className="text-right">{delivery.weightKg.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{delivery.pricePerKg.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">{delivery.totalAriary.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No deliveries found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
