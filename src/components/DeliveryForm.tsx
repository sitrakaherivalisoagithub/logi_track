
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, parse } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { CalendarIcon, Sparkles, Loader2, Info } from "lucide-react";
// import type { Delivery, AISuggestion } from "@/types/delivery"; // Using IDelivery from model
import type { AISuggestion } from "@/types/delivery";
import { IDelivery, IDeliveryData } from "@/models/Delivery"; // Use IDelivery and IDeliveryData from model
import { IVehicle } from "@/models/Vehicle"; // Import IVehicle
// import useLocalStorage from "@/hooks/useLocalStorage"; // Removed
import { useToast } from "@/hooks/use-toast";
import { suggestPricePerKg, type SuggestPricePerKgInput } from "@/ai/flows/suggest-price-per-kg";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
// import { useRouter } from 'next/navigation'; // Optional: for redirecting after submission

interface VehicleOption extends IVehicle { // For fetched vehicles with _id
  _id: string;
}

const formSchema = z.object({
  date: z.string().refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Date must be in YYYY-MM-DD format" }),
  client: z.string().min(1, "Client name is required"),
  departureLocation: z.string().min(1, "Departure location is required"),
  destination: z.string().min(1, "Destination is required"),
  goods: z.string().min(1, "Goods description is required"),
  weightKg: z.coerce.number({invalid_type_error: "Weight must be a number"}).positive("Weight must be positive"),
  pricePerKg: z.coerce.number({invalid_type_error: "Price per kg must be a number"}).positive("Price per kg must be positive"),
  totalAriary: z.coerce.number({invalid_type_error: "Total must be a number"}).positive("Total must be positive"),
  vehicleId: z.string().min(1, "Vehicle selection is required"),
});

export type DeliveryFormValues = z.infer<typeof formSchema>;

export function DeliveryForm() {
  // const [deliveries, setDeliveries] = useLocalStorage<Delivery[]>("logiTrackDeliveries", []); // Removed
  const { toast } = useToast();
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  // const router = useRouter(); // Optional

  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      client: "",
      departureLocation: "",
      destination: "",
      goods: "",
      weightKg: '' as unknown as number,
      pricePerKg: '' as unknown as number,
      totalAriary: '' as unknown as number,
      vehicleId: '', // Add vehicleId default
    },
  });

  const watchedWeightKg = form.watch('weightKg');
  const watchedPricePerKg = form.watch('pricePerKg');
  const watchedVehicleId = form.watch('vehicleId'); // Now using

  useEffect(() => {
    // Fetch vehicles on component mount
    const fetchVehicles = async () => {
      setIsLoadingVehicles(true);
      try {
        const response = await fetch('/api/vehicles');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({error: 'Failed to fetch vehicles'}));
          throw new Error(errData.error || 'Failed to fetch vehicles');
        }
        const data = await response.json();
        if (data.success) {
          setVehicles(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch vehicles');
        }
      } catch (error) {
        const e = error as Error;
        console.error("Error fetching vehicles:", e.message);
        toast({ title: "Error", description: `Could not load vehicles: ${e.message}. Please try refreshing.`, variant: "destructive" });
      } finally {
        setIsLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, [toast]); // Added toast to dependency array

  useEffect(() => {
    const weightStr = String(watchedWeightKg);
    const priceStr = String(watchedPricePerKg);
    const weightNum = parseFloat(weightStr);
    const priceNum = parseFloat(priceStr);

    if (!isNaN(weightNum) && weightNum > 0 && !isNaN(priceNum) && priceNum > 0) {
      const calculatedTotal = parseFloat((weightNum * priceNum).toFixed(2));
      form.setValue('totalAriary', String(calculatedTotal) as unknown as number, { shouldValidate: true });
    } else if (form.getValues('totalAriary') !== ('' as unknown as number) && (weightStr === '' || priceStr === '')) {
       // Clear total if one of the calculation fields is cleared by user, but not if it's just invalid (e.g. "abc")
       // form.setValue('totalAriary', '' as unknown as number, { shouldValidate: true });
    }
  }, [watchedWeightKg, watchedPricePerKg, form]);

  // Effect to clear weightKg error if vehicle changes and the error was due to payload capacity
  useEffect(() => {
    if (form.formState.errors.weightKg?.message?.includes("Max payload")) {
      form.clearErrors("weightKg");
    }
  }, [watchedVehicleId, form]);

  async function onSubmit(values: DeliveryFormValues) {
    // Payload validation: weightKg vs selected vehicle's maxPayloadKg
    const selectedVehicle = vehicles.find(v => v._id === values.vehicleId);
    if (!selectedVehicle) {
      toast({ title: "Error", description: "Selected vehicle not found. Please refresh.", variant: "destructive" });
      form.setError("vehicleId", { type: "manual", message: "Invalid vehicle selected." });
      return;
    }

    const deliveryWeight = parseFloat(String(values.weightKg)); // Ensure weightKg is treated as number
    if (isNaN(deliveryWeight) || deliveryWeight <= 0) {
        toast({ title: "Validation Error", description: "Please enter a valid positive weight for the delivery.", variant: "destructive" });
        form.setError("weightKg", { type: "manual", message: "Weight must be a positive number."});
        return;
    }

    if (deliveryWeight > selectedVehicle.maxPayloadKg) {
      toast({
        title: "Validation Error",
        description: `Delivery weight (${deliveryWeight}kg) exceeds selected vehicle's maximum payload (${selectedVehicle.maxPayloadKg}kg).`,
        variant: "destructive",
      });
      form.setError("weightKg", { type: "manual", message: `Max payload for ${selectedVehicle.brand} (${selectedVehicle.plateNumber}) is ${selectedVehicle.maxPayloadKg}kg.` });
      return;
    }
    
    // Use IDeliveryData for the payload type to represent plain data
    const newDeliveryPayload: Omit<IDeliveryData, 'vehicle'> & { vehicle: string } = {
      date: values.date,
      client: values.client,
      departureLocation: values.departureLocation,
      destination: values.destination,
      goods: values.goods,
      weightKg: deliveryWeight,
      pricePerKg: parseFloat(String(values.pricePerKg)), // Ensure pricePerKg is treated as number
      totalAriary: parseFloat(String(values.totalAriary)), // Ensure totalAriary is treated as number
      vehicle: values.vehicleId, 
    };
    
    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeliveryPayload), // Send the correct payload
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({message: 'Failed to log delivery'}));
        throw new Error(errorData.message);
      }

      toast({
        title: "Success!",
        description: "Delivery logged successfully.",
        variant: "default",
      });
      form.reset(); 
      setAiSuggestion(null);
      setAiError(null);
      // router.push('/'); // Optional: redirect to dashboard
    } catch (err: any) {
      toast({ title: "Error", description: `Could not log delivery: ${err.message}`, variant: "destructive" });
    }
  }

  const handleSuggestPrice = async () => {
    const goods = String(form.getValues("goods") || "");
    const weightString = String(form.getValues("weightKg") || "");
    const departure = String(form.getValues("departureLocation") || "");
    const destination = String(form.getValues("destination") || "");
    
    const weight = parseFloat(weightString);

    if (!goods || isNaN(weight) || weight <=0 || !departure || !destination) {
      toast({
        title: "Missing Information",
        description: "Please fill in Goods, valid Weight, Departure, and Destination to get a price suggestion.",
        variant: "destructive",
      });
      return;
    }

    setIsAiLoading(true);
    setAiSuggestion(null);
    setAiError(null);
    try {
      const input: SuggestPricePerKgInput = {
        goods,
        weightKg: weight,
        departureLocation: departure,
        destination,
      };
      const result = await suggestPricePerKg(input);
      setAiSuggestion(result);
      if (result.suggestedPricePerKg) {
        form.setValue('pricePerKg', String(result.suggestedPricePerKg) as unknown as number, { shouldValidate: true });
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      setAiError("Failed to get AI price suggestion. Please try again.");
      toast({
        title: "AI Error",
        description: "Could not fetch price suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const rawGoods = form.watch('goods');
  const rawWeightKg = form.watch('weightKg');
  const rawDepartureLocation = form.watch('departureLocation');
  const rawDestination = form.watch('destination');

  const canSuggestPrice = 
    String(rawGoods || "").trim() !== '' &&
    !isNaN(parseFloat(String(rawWeightKg))) && parseFloat(String(rawWeightKg)) > 0 &&
    String(rawDepartureLocation || "").trim() !== '' &&
    String(rawDestination || "").trim() !== '';


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Delivery</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(parse(field.value, 'yyyy-MM-dd', new Date()), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="departureLocation"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Departure Location</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Antananarivo" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Toamasina" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="goods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goods Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Rice, Cement bags" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Vehicle</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value} // Ensure value is controlled
                disabled={isLoadingVehicles}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingVehicles ? "Loading vehicles..." : "Select a vehicle"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingVehicles ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : vehicles.length === 0 ? (
                    <SelectItem value="no-vehicle" disabled>No vehicles registered. Add one first.</SelectItem>
                  ) : (
                    vehicles.map((vehicle) => (
                      <SelectItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.brand} - {vehicle.plateNumber} (Max: {vehicle.maxPayloadKg}kg)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g. 1000" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)} value={field.value === undefined || field.value === null ? '' : field.value} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="pricePerKg"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price per kg (Ariary)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g. 500" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)} value={field.value === undefined || field.value === null ? '' : field.value} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <div className="my-6 space-y-4">
          <Button type="button" variant="outline" onClick={handleSuggestPrice} disabled={isAiLoading || !canSuggestPrice} className="w-full md:w-auto">
            {isAiLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Suggest Price/kg (AI)
          </Button>
          {!canSuggestPrice && (
            <p className="text-xs text-muted-foreground">
              Fill in Goods, Weight, Departure, and Destination to enable AI price suggestion.
            </p>
          )}

          {aiSuggestion && (
            <Alert variant="default" className="bg-accent/10 border-accent/50">
              <Sparkles className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent">AI Price Suggestion</AlertTitle>
              <AlertDescription>
                <p>Suggested Price/kg: <span className="font-semibold">{aiSuggestion.suggestedPricePerKg?.toLocaleString() ?? 'N/A'} Ariary</span></p>
                <p>Reasoning: {aiSuggestion.reasoning}</p>
              </AlertDescription>
            </Alert>
          )}
          {aiError && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{aiError}</AlertDescription>
            </Alert>
          )}
        </div>

        <FormField
          control={form.control}
          name="totalAriary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total (Ariary)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 500000" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)} value={field.value === undefined || field.value === null ? '' : field.value} readOnly />
              </FormControl>
              <FormDescription>
                Total revenue for this delivery. Auto-calculated if Weight and Price/kg are filled.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Log Delivery
        </Button>
      </form>
    </Form>
  );
}
