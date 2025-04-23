import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';

interface VisitorFormProps {
  onComplete: () => void;
}

const visitorFormSchema = z.object({
  visitorName: z.string().min(2, {
    message: 'Visitor name must be at least 2 characters.',
  }),
  visitorBusiness: z.string().min(2, {
    message: 'Business name must be at least 2 characters.',
  }),
  visitDate: z.date(),
  email: z.string().email({
    message: 'Please enter a valid email.',
  }).optional(),
  phoneNumber: z.string().optional(),
  industry: z.string().optional(),
});

export const VisitorForm: React.FC<VisitorFormProps> = ({ onComplete }) => {
  const form = useForm<z.infer<typeof visitorFormSchema>>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      visitorName: '',
      visitorBusiness: '',
      visitDate: new Date(),
      email: '',
      phoneNumber: '',
      industry: '',
    },
  });

  const { email, phoneNumber } = form.watch();
  
  // Validate that at least email or phone is provided
  const hasContactInfo = !!email || !!phoneNumber;
  
  const { addVisitor } = useData();

  const onSubmit = async (data: z.infer<typeof visitorFormSchema>) => {
    if (!hasContactInfo) {
      toast.error('Please provide either an email or phone number');
      return;
    }

    try {
      await addVisitor(data);
      toast.success('Visitor added successfully!');
      onComplete();
    } catch (error) {
      console.error('Error adding visitor:', error);
      toast.error('Failed to add visitor. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
        <FormField
          control={form.control}
          name="visitorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visitor Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visitorBusiness"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visitDate"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <FormLabel>Visit Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
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
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Contact Information (provide at least one)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="visitor@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="(555) 555-5555" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {!hasContactInfo && (
            <p className="text-sm text-destructive">Please provide either an email or phone number</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Technology" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={!hasContactInfo}>
          Add Visitor
        </Button>
      </form>
    </Form>
  );
};
