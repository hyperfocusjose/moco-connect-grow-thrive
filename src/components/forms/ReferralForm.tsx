
import React, { useEffect } from 'react';
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
import { User } from '@/types';

const formSchema = z.object({
  referringMemberId: z.string().optional(),
  referredToMemberId: z.string({
    required_error: "Please select the member to refer to",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  date: z.string().min(1, {
    message: "Date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const ReferralForm: React.FC<{ 
  onComplete?: () => void; 
  forceShowInputMemberSelect?: boolean;
  preselectedMember?: User;
}> = ({
  onComplete,
  forceShowInputMemberSelect = false,
  preselectedMember
}) => {
  const { currentUser } = useAuth();
  const { users, addReferral } = useData();
  const { toast } = useToast();

  // For admin, allow selecting the referring member; otherwise, pre-select current
  const showMemberOneSelect = forceShowInputMemberSelect;
  const allUsers = users;

  // Get other users (for member selection)
  // For non-admin, filter out the current user from possible selections
  const referringMemberId = showMemberOneSelect ? undefined : currentUser?.id;
  const otherUsers = users.filter(user => user.id !== referringMemberId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referredToMemberId: preselectedMember?.id || "",
      description: "",
      date: new Date().toISOString().substring(0, 10),
      ...(showMemberOneSelect ? { referringMemberId: "" } : { referringMemberId: currentUser?.id ?? "" })
    },
  });

  // If preselectedMember changes, update the form
  useEffect(() => {
    if (preselectedMember) {
      form.setValue('referredToMemberId', preselectedMember.id);
    }
  }, [preselectedMember, form]);

  const onSubmit = async (data: FormValues) => {
    if (!currentUser && !showMemberOneSelect) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to make a referral",
      });
      return;
    }

    try {
      await addReferral({
        referringMemberId: showMemberOneSelect ? data.referringMemberId! : currentUser.id,
        referredToMemberId: data.referredToMemberId,
        description: data.description,
        date: new Date(data.date),
      });

      toast({
        title: "Referral made",
        description: "Your referral has been recorded successfully",
      });

      form.reset({
        referredToMemberId: "",
        description: "",
        date: new Date().toISOString().substring(0, 10),
        ...(showMemberOneSelect ? { referringMemberId: "" } : {})
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem making your referral",
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
              name="referringMemberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who is referring?</FormLabel>
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
                        <SelectItem key={user.id} value={user.id || `user-${user.firstName}`}>
                          {user.firstName} {user.lastName} - {user.businessName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The member making this referral
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="referredToMemberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Refer To</FormLabel>
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
                      <SelectItem key={user.id} value={user.id || `user-${user.firstName}`}>
                        {user.firstName} {user.lastName} - {user.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The member you're referring a client to
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
                    placeholder="Describe the referral"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of the referral opportunity
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
                  When the referral was made
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
            ) : "Make Referral"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
