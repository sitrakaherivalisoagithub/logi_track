
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { format, parse } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import type { Delivery, AISuggestion } from "@/types/delivery";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { suggestPricePerKg, type SuggestPricePerKgInput } from "@/ai/flows/suggest-price-per-kg";
import { useState, useEffect } from "react";

const formSchema = z.object({
  date: z.string().refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Date must be in YYYY-MM-DD format" }),
  client: z.string().min(1, "Client name is required"),
  departureLocation: z.string().min(1, "Departure location is required"),
  destination: z.string().min(1, "Destination is required"),
  goods: z.string().min(1, "Goods description is required"),
  weightKg: z.coerce.number({invalid_type_error: "Weight must be a number"}).positive("Weight must be positive"),
  pricePerKg: z.coerce.number({invalid_type_error: "Price per kg must be a number"}).positive("Price per kg must be positive"),
  totalAriary: z.coerce.number({invalid_type_error: "Total must be a number"}).positive("Total must be positive"),
});

export type DeliveryFormValues = z.infer<typeof formSchema>;

export function DeliveryForm() {
  const [deliveries, setDeliveries] = useLocalStorage<Delivery[]>("logiTrackDeliveries", []);
  const { toast } = useToast();
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      client: "",
      departureLocation: "",
      destination: "",
      goods: "",
      weightKg: '' as unknown as number, // Initialize as empty string for controlled input
      pricePerKg: '' as unknown as number, // Initialize as empty string
      totalAriary: '' as unknown as number, // Initialize as empty string
    },
  });

  const watchedWeightKg = form.watch('weightKg');
  const watchedPricePerKg = form.watch('pricePerKg');

  useEffect(() => {
    const weightNum = parseFloat(String(watchedWeightKg));
    const priceNum = parseFloat(String(watchedPricePerKg));

    if (!isNaN(weightNum) && weightNum > 0 && !isNaN(priceNum) && priceNum > 0) {
      const calculatedTotal = parseFloat((weightNum * priceNum).toFixed(2));
      form.setValue('totalAriary', String(calculatedTotal) as unknown as number, { shouldValidate: true });
    } else {
      // Optionally clear totalAriary if weight/price are not valid for calculation
      // and totalAriary is not already empty.
      // This check prevents an infinite loop if totalAriary also watched.
      if (form.getValues('totalAriary') !== ('' as unknown as number)) {
        // form.setValue('totalAriary', '' as unknown as number, { shouldValidate: true });
      }
    }
  }, [watchedWeightKg, watchedPricePerKg, form]);

  async function onSubmit(values: DeliveryFormValues) {
    const newDelivery: Delivery = {
      id: crypto.randomUUID(),
      ...values, // Values will be coerced to numbers by Zod
    };
    setDeliveries([...deliveries, newDelivery]);
    toast({
      title: "Success!",
      description: "Delivery logged successfully.",
      variant: "default",
    });
    form.reset(); // Resets to new defaultValues (empty strings for numbers)
    setAiSuggestion(null);
    setAiError(null);
  }

  const handleSuggestPrice = async () => {
    // Get raw string values from form for AI suggestion
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g. 1000" {...field} onChange={e => field.onChange(e.target.value)} />
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
                    <Input type="number" placeholder="e.g. 500" {...field} onChange={e => field.onChange(e.target.value)} />
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
                <Input type="number" placeholder="e.g. 500000" {...field} onChange={e => field.onChange(e.target.value)} readOnly />
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


  