
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DialogFooter } from '@/components/ui/dialog';

const formSchema = z.object({
  memberOneId: z.string().optional(),
  memberTwoId: z.string({
    required_error: "Please select the member",
  }),
  amount: z.string().min(1, {
    message: "Amount is required",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  date: z.string().min(1, {
    message: "Date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const TYFCBForm: React.FC<{ 
  onComplete?: () => void; 
  forceShowInputMemberSelect?: boolean 
}> = ({
  onComplete,
  forceShowInputMemberSelect = false
}) => {
  const { currentUser } = useAuth();
  const { users, addTYFCB } = useData();
  const { toast } = useToast();

  // For admin, allow selecting the reporting member; otherwise, pre-select current
  const showMemberOneSelect = forceShowInputMemberSelect;
  const allUsers = users;

  // Get other users (for member selection)
  // For non-admin, filter out the current user from possible selections
  const memberOneId = showMemberOneSelect ? undefined : currentUser?.id;
  const otherUsers = users.filter(user => user.id !== memberOneId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberTwoId: "",
      amount: "",
      description: "",
      date: new Date().toISOString().substring(0, 10),
      ...(showMemberOneSelect ? { memberOneId: "" } : { memberOneId: currentUser?.id ?? "" })
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!currentUser && !showMemberOneSelect) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to record closed business",
      });
      return;
    }

    try {
      const amount = parseFloat(data.amount);
      
      if (isNaN(amount)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid amount",
        });
        return;
      }

      await addTYFCB({
        memberOneId: showMemberOneSelect ? data.memberOneId! : currentUser.id,
        memberTwoId: data.memberTwoId,
        amount,
        description: data.description,
        date: new Date(data.date),
      });

      toast({
        title: "Thank You For Closed Business recorded",
        description: "The closed business has been recorded successfully",
      });

      form.reset({
        memberTwoId: "",
        amount: "",
        description: "",
        date: new Date().toISOString().substring(0, 10),
        ...(showMemberOneSelect ? { memberOneId: "" } : {})
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem recording the closed business",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {showMemberOneSelect && (
            <FormField
              control={form.control}
              name="memberOneId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who is entering?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} - {user.businessName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The member recording this closed business
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="memberTwoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thank You To</FormLabel>
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
                  The member you're thanking for closed business
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
                  <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>
                  The dollar amount of the closed business
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the closed business"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of the closed business
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
