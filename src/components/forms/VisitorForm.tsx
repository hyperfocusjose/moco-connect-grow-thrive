
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
import { useToast } from '@/hooks/use-toast';
import { DialogFooter } from '@/components/ui/dialog';

const formSchema = z.object({
  visitorName: z.string().min(2, {
    message: "Visitor name must be at least 2 characters.",
  }),
  visitorBusiness: z.string().min(2, {
    message: "Business name or industry must be at least 2 characters.",
  }),
  visitDate: z.string().min(1, {
    message: "Visit date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const VisitorForm: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const { addVisitor } = useData();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitorName: "",
      visitorBusiness: "",
      visitDate: new Date().toISOString().substring(0, 10),
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add a visitor",
      });
      return;
    }

    try {
      await addVisitor({
        hostMemberId: currentUser.id,
        visitorName: data.visitorName,
        visitorBusiness: data.visitorBusiness,
        visitDate: new Date(data.visitDate),
      });

      toast({
        title: "Visitor added",
        description: "Your visitor has been recorded successfully",
      });

      // Reset form
      form.reset({
        visitorName: "",
        visitorBusiness: "",
        visitDate: new Date().toISOString().substring(0, 10),
      });

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem adding your visitor",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="visitorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visitor Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormDescription>
                  The name of the visitor you're bringing
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visitorBusiness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business or Industry</FormLabel>
                <FormControl>
                  <Input placeholder="ABC Consulting / Marketing" {...field} />
                </FormControl>
                <FormDescription>
                  The visitor's business name or industry
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visitDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visit Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  When the visitor will attend
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
            ) : "Add Visitor"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
