
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useData } from '@/contexts/DataContext';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addWeeks } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  visitorName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  visitorBusiness: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  industry: z.string().min(2, {
    message: "Please enter your industry.",
  }),
  selectedEventId: z.string({
    required_error: "Please select a meeting to attend.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const VisitorSignupForm: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { events, addVisitor } = useData();
  const { toast } = useToast();
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitorName: "",
      visitorBusiness: "",
      phoneNumber: "",
      email: "",
      industry: "",
      selectedEventId: "",
    },
  });

  // Get the next 4 uncancelled Tuesday meetings
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextFourWeeks = addWeeks(today, 4);
    
    const upcomingTuesdayMeetings = events
      .filter(event => 
        event.name.toLowerCase().includes('tuesday meeting') &&
        !event.isCancelled && 
        event.isApproved &&
        new Date(event.date) >= today &&
        new Date(event.date) <= nextFourWeeks
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
      
    // Make sure each meeting has a valid ID
    const meetingsWithValidIds = upcomingTuesdayMeetings.map(meeting => ({
      ...meeting,
      id: meeting.id || `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    setUpcomingMeetings(meetingsWithValidIds);
  }, [events]);

  const onSubmit = async (data: FormValues) => {
    try {
      const selectedEvent = upcomingMeetings.find(meeting => meeting.id === data.selectedEventId);
      
      if (!selectedEvent) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a valid meeting to attend",
        });
        return;
      }

      await addVisitor({
        visitorName: data.visitorName,
        visitorBusiness: data.visitorBusiness,
        visitDate: new Date(selectedEvent.date),
        phoneNumber: data.phoneNumber,
        email: data.email,
        industry: data.industry,
        isSelfEntered: true,
      });

      toast({
        title: "Registration successful",
        description: "We look forward to seeing you at our meeting!",
      });

      // Reset form
      form.reset();

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your registration",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Visit Our Group</h2>
      <p className="mb-6 text-gray-600 text-center">
        Fill out the form below to register as a visitor for an upcoming meeting
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="visitorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" {...field} />
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
                <FormLabel>Business Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Your Business" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry*</FormLabel>
                <FormControl>
                  <Input placeholder="Your Industry" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number*</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Phone" {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email*</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Email" {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="selectedEventId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select a meeting to attend*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Tuesday meeting" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {upcomingMeetings.map(meeting => (
                      <SelectItem key={meeting.id} value={meeting.id}>
                        {format(new Date(meeting.date), "EEEE, MMMM d, yyyy")} - {meeting.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-maroon hover:bg-maroon/90"
          >
            {form.formState.isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : "Register as Visitor"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
