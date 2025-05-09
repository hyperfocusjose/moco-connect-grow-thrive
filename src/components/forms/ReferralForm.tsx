import React, { useEffect, useState } from 'react';
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
import { toast } from 'sonner';
import { DialogFooter } from '@/components/ui/dialog';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
  const { currentUser, refreshSession } = useAuth();
  const { users, addReferral, reloadData } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<{ valid: boolean; userId: string | null }>({ valid: false, userId: null });

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

  // Check session status
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionStatus({
        valid: !!data.session,
        userId: data.session?.user?.id || null
      });
    };
    
    checkSession();
  }, [currentUser]);

  // If preselectedMember changes, update the form
  useEffect(() => {
    if (preselectedMember) {
      form.setValue('referredToMemberId', preselectedMember.id);
    }
  }, [preselectedMember, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setLastError(null);
    setLastSuccess(null);
    
    try {
      if (!currentUser && !showMemberOneSelect) {
        const error = "You must be logged in to make a referral";
        setLastError(error);
        toast.error(error);
        return;
      }

      // Refresh session to ensure we have valid tokens
      await refreshSession();
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        const error = "Your session has expired. Please log in again.";
        setLastError(error);
        toast.error(error);
        return;
      }
      
      console.log("Current session user ID:", sessionData.session.user.id);
      console.log("Context user ID:", currentUser?.id);
      
      const fromMemberId = showMemberOneSelect ? data.referringMemberId! : currentUser!.id;
      const fromMember = users.find(u => u.id === fromMemberId);
      const toMember = users.find(u => u.id === data.referredToMemberId);
      
      if (!fromMember || !toMember) {
        const error = "Could not find member information";
        setLastError(error);
        toast.error(error);
        return;
      }
      
      console.log("Creating referral with data:", {
        fromMemberId,
        fromMemberName: `${fromMember.firstName} ${fromMember.lastName}`,
        toMemberId: data.referredToMemberId,
        toMemberName: `${toMember.firstName} ${toMember.lastName}`,
        description: data.description,
        date: new Date(data.date)
      });
      
      // Try direct insertion to debug
      try {
        const referralId = crypto.randomUUID();
        const { error } = await supabase.from('referrals').insert({
          id: referralId,
          from_member_id: fromMemberId,
          from_member_name: `${fromMember.firstName} ${fromMember.lastName}`,
          to_member_id: data.referredToMemberId,
          to_member_name: `${toMember.firstName} ${toMember.lastName}`,
          description: data.description,
          date: new Date(data.date).toISOString(),
          created_at: new Date().toISOString(),
        });
        
        if (error) {
          console.error("Direct Supabase insertion error:", error);
          setLastError(`Supabase error: ${error.message}`);
          throw new Error(`Direct insertion failed: ${error.message}`);
        } else {
          console.log("Direct insertion successful, ID:", referralId);
          
          // Create the activity record
          const { error: activityError } = await supabase.from('activities').insert({
            type: 'referral',
            description: `Made a referral to ${toMember.firstName} ${toMember.lastName}`,
            date: new Date().toISOString(),
            user_id: fromMemberId,
            reference_id: referralId,
            related_user_id: data.referredToMemberId
          });
          
          if (activityError) {
            console.error("Activity creation error:", activityError);
          }
          
          // Reload data to refresh UI
          await reloadData();
          
          setLastSuccess("Referral created successfully");
          toast.success("Referral made successfully");
          
          form.reset({
            referredToMemberId: "",
            description: "",
            date: new Date().toISOString().substring(0, 10),
            ...(showMemberOneSelect ? { referringMemberId: "" } : {})
          });
          
          if (onComplete) {
            onComplete();
          }
          
          return;
        }
      } catch (directError) {
        console.error("Error in direct insertion:", directError);
        // Continue to try the normal flow
      }
      
      // Try normal flow through the addReferral function
      await addReferral({
        id: `referral-${Date.now()}`,
        fromMemberId,
        fromMemberName: `${fromMember.firstName} ${fromMember.lastName}`,
        toMemberId: data.referredToMemberId,
        toMemberName: `${toMember.firstName} ${toMember.lastName}`,
        description: data.description,
        date: new Date(data.date),
        createdAt: new Date()
      });

      setLastSuccess("Referral made successfully");
      toast.success("Referral made successfully");

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
      console.error("Error making referral:", error);
      const errorMessage = error instanceof Error ? error.message : "There was a problem making your referral";
      setLastError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Session status info */}
        {sessionStatus && (
          <div className="mb-4">
            <Alert className={sessionStatus.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              {sessionStatus.valid ? (
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              )}
              <AlertDescription>
                Session status: {sessionStatus.valid ? (
                  <span className="text-green-600 font-semibold">Active</span>
                ) : (
                  <span className="text-red-600 font-semibold">Inactive</span>
                )}
                {sessionStatus.userId && (
                  <span className="block text-xs mt-1">{sessionStatus.userId}</span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {lastError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <AlertDescription className="text-red-600">{lastError}</AlertDescription>
          </Alert>
        )}
        
        {lastSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <AlertDescription className="text-green-600">{lastSuccess}</AlertDescription>
          </Alert>
        )}
      
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
            type="button"
            variant="outline"
            onClick={() => refreshSession()}
            className="mr-2"
          >
            Refresh Session
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-maroon hover:bg-maroon-light"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : "Make Referral"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
