
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const INDUSTRY_SEATS = [
  'Plumbing',
  'Real Estate',
  'Insurance',
  'Legal Services',
  'Accounting',
  'Marketing',
  'Web Development',
  'Graphic Design',
  'Financial Services',
  'Dentistry',
  'Home Renovation',
  'Catering',
  'Photography',
  'Electrical Services',
  'HVAC',
  'Roofing',
  'Interior Design',
  'Landscaping',
  'Automotive',
  'Other',
];

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  businessName: z.string().min(1, { message: 'Business name is required' }),
  phoneNumber: z.string().min(7, { message: 'Please enter a valid phone number' }),
  industry: z.string().min(1, { message: 'Industry is required' }),
  bio: z.string().max(500, { message: 'Bio should not exceed 500 characters' }).optional(),
  tags: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      businessName: '',
      phoneNumber: '',
      industry: '',
      bio: '',
      tags: '',
    },
  });

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Convert comma-separated tags to array
      const tagsArray = data.tags
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];

      await signup(
        {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          businessName: data.businessName,
          phoneNumber: data.phoneNumber,
          profilePicture: profilePicture || '/placeholder.svg',
          industry: data.industry,
          bio: data.bio || '',
          tags: tagsArray,
        },
        data.password
      );
      
      toast({
        title: 'Account created successfully',
        description: 'Welcome to MocoPNG!',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Please check your information and try again',
      });
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-maroon tracking-tight">MocoPNG</h1>
          <p className="mt-2 text-sm text-gray-600">
            Montgomery County Professional Networking Group
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Join MocoPNG to connect with other professionals and grow your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profilePicture || undefined} />
                    <AvatarFallback className="bg-maroon text-white text-xl">
                      {form.watch('firstName') && form.watch('lastName')
                        ? `${form.watch('firstName')[0]}${form.watch('lastName')[0]}`.toUpperCase()
                        : 'PIC'}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="profile-picture" className="cursor-pointer text-sm font-medium text-maroon hover:text-maroon-dark">
                    Upload Profile Picture
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Smith" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
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
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business Information */}
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Business LLC" {...field} />
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
                        <FormLabel>Industry / Seat</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Select your industry</option>
                            {INDUSTRY_SEATS.map((industry) => (
                              <option key={industry} value={industry}>
                                {industry}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormDescription>
                          The industry seat you wish to claim
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your business and expertise..."
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be visible to other members (max 500 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services Offered (Tags)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="plumbing, repairs, remodeling"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter comma-separated keywords for services you offer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-maroon hover:bg-maroon-light"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-maroon hover:text-maroon-dark font-medium">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
