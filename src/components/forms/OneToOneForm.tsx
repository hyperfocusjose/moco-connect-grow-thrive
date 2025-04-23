
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
  memberTwoId: z.string({
    required_error: "Please select the other member",
  }),
  meetingDate: z.string().min(1, {
    message: "Meeting date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const OneToOneForm: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const { users, addOneToOne } = useData();
  const { toast } = useToast();

  // Get other users excluding current user
  const otherUsers = users.filter(user => user.id !== currentUser?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberTwoId: "",
      meetingDate: new Date().toISOString().substring(0, 10),
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to record a one-to-one meeting",
      });
      return;
    }

    try {
      await addOneToOne({
        memberOneId: currentUser.id,
        memberTwoId: data.memberTwoId,
        meetingDate: new Date(data.meetingDate),
      });

      toast({
        title: "One-to-One recorded",
        description: "Your one-to-one meeting has been recorded successfully",
      });

      // Reset form
      form.reset({
        memberTwoId: "",
        meetingDate: new Date().toISOString().substring(0, 10),
      });

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem recording your one-to-one meeting",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="memberTwoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting With</FormLabel>
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
                  The member you had a one-to-one meeting with
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meetingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  When the one-to-one meeting took place
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
            ) : "Record One-to-One"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
