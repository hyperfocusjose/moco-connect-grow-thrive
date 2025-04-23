
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DialogFooter } from '@/components/ui/dialog';

const formSchema = z.object({
  thankedMemberId: z.string({
    required_error: "Please select the member you are thanking",
  }),
  amount: z.string().min(1, {
    message: "Amount is required",
  }).refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  date: z.string().min(1, {
    message: "Date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const TYFCBForm: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const { users, addTYFCB } = useData();
  const { toast } = useToast();

  // Get other users excluding current user
  const otherUsers = users.filter(user => user.id !== currentUser?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thankedMemberId: "",
      amount: "",
      date: new Date().toISOString().substring(0, 10),
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to record closed business",
      });
      return;
    }

    try {
      await addTYFCB({
        thankingMemberId: currentUser.id,
        thankedMemberId: data.thankedMemberId,
        amount: Number(data.amount),
        date: new Date(data.date),
      });

      toast({
        title: "Thank You For Closed Business recorded",
        description: "Your closed business has been recorded successfully",
      });

      // Reset form
      form.reset({
        thankedMemberId: "",
        amount: "",
        date: new Date().toISOString().substring(0, 10),
      });

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem recording your closed business",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="thankedMemberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thanking Member</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {otherUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} - {user.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The member who referred you business that you're now thanking
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="1000.00"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  The dollar amount of closed business
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  When the business was closed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button 
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-maroon hover:bg-maroon-light"
          >
            {form.formState.isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : "Record Closed Business"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
