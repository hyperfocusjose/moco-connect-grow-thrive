
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { User } from '@/types';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ProfilePicUpload } from '@/components/profile/ProfilePicUpload';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Phone, Mail, User as UserIcon, Briefcase, Settings, Globe, Linkedin, Facebook, Instagram, Edit, Save } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().min(10, { message: "Valid phone number is required" }),
  businessName: z.string().min(2, { message: "Business name is required" }),
  bio: z.string().optional(),
  industry: z.string().min(2, { message: "Industry is required" }),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  instagram: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Profile = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { stats, referrals, oneToOnes, tyfcbs } = useData();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(currentUser?.profilePicture || null);
  const [tags, setTags] = useState<string[]>(currentUser?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      phoneNumber: currentUser?.phoneNumber || "",
      businessName: currentUser?.businessName || "",
      bio: currentUser?.bio || "",
      industry: currentUser?.industry || "",
      website: currentUser?.website || "",
      linkedin: currentUser?.linkedin || "",
      facebook: currentUser?.facebook || "",
      tiktok: currentUser?.tiktok || "",
      instagram: currentUser?.instagram || "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
        businessName: currentUser.businessName || "",
        bio: currentUser.bio || "",
        industry: currentUser.industry || "",
        website: currentUser.website || "",
        linkedin: currentUser.linkedin || "",
        facebook: currentUser.facebook || "",
        tiktok: currentUser.tiktok || "",
        instagram: currentUser.instagram || "",
      });
      setProfileImage(currentUser.profilePicture || null);
      setTags(currentUser.tags || []);
    }
  }, [currentUser, form]);

  if (!currentUser) {
    return <div className="p-6">Loading profile...</div>;
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setProfileImage(imageUrl);
  };

  const onSubmit = async (data: FormValues) => {
    if (!currentUser) return;
    
    try {
      const updatedUser: User = {
        ...currentUser,
        ...data,
        tags,
        profilePicture: profileImage || currentUser.profilePicture
      };
      
      await updateCurrentUser(updatedUser);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const ensureHttps = (url: string): string => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const getLinkedInUrl = (username: string): string => {
    if (!username) return '';
    return username.startsWith('http') ? username : `https://linkedin.com/in/${username.replace(/^@/, '')}`;
  };

  const getFacebookUrl = (username: string): string => {
    if (!username) return '';
    return username.startsWith('http') ? username : `https://facebook.com/${username.replace(/^@/, '')}`;
  };

  const getTikTokUrl = (username: string): string => {
    if (!username) return '';
    return username.startsWith('http') ? username : `https://tiktok.com/@${username.replace(/^@/, '')}`;
  };

  const getInstagramUrl = (username: string): string => {
    if (!username) return '';
    return username.startsWith('http') ? username : `https://instagram.com/${username.replace(/^@/, '')}`;
  };

  const userStats = stats ? stats[currentUser.id] : null;
  const referralsGiven = userStats?.referralsGiven || 0;
  const referralsReceived = userStats?.referralsReceived || 0;
  const oneToOnesDone = userStats?.oneToOnesDone || 0;
  const closedBusiness = userStats?.tyfcbTotal || 0;

  const userReferrals = referrals?.filter(ref => 
    ref.fromMemberId === currentUser.id || ref.toMemberId === currentUser.id
  ).slice(0, 5);
  
  const userOneToOnes = oneToOnes?.filter(oneToOne => 
    oneToOne.member1Id === currentUser.id || oneToOne.member2Id === currentUser.id
  ).slice(0, 5);
  
  const userClosedBusiness = tyfcbs?.filter(tyfcb => 
    tyfcb.fromMemberId === currentUser.id || tyfcb.toMemberId === currentUser.id
  ).slice(0, 5);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={currentUser.profilePicture} />
                <AvatarFallback className="bg-maroon text-white text-3xl">
                  {getInitials(currentUser.firstName, currentUser.lastName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-center">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-gray-500 text-center">{currentUser.businessName}</p>
              <div className="mt-2">
                <Badge variant="outline" className="border-maroon text-maroon">
                  {currentUser.industry}
                </Badge>
                {currentUser.isAdmin && (
                  <Badge variant="outline" className="ml-2 border-maroon text-maroon">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div>{currentUser.phoneNumber}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div>{currentUser.email}</div>
                </div>
              </div>
              
              {currentUser.website && (
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Website</div>
                    <a 
                      href={ensureHttps(currentUser.website)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {currentUser.website}
                    </a>
                  </div>
                </div>
              )}
              
              {(currentUser.linkedin || currentUser.facebook || currentUser.tiktok || currentUser.instagram) && (
                <div className="flex space-x-3 mt-4">
                  {currentUser.linkedin && (
                    <a 
                      href={getLinkedInUrl(currentUser.linkedin)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {currentUser.facebook && (
                    <a 
                      href={getFacebookUrl(currentUser.facebook)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {currentUser.tiktok && (
                    <a 
                      href={getTikTokUrl(currentUser.tiktok)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-400"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                        <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                        <path d="M15 2v10c0 4.418-3.582 8-8 8" />
                      </svg>
                    </a>
                  )}
                  {currentUser.instagram && (
                    <a 
                      href={getInstagramUrl(currentUser.instagram)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {currentUser.bio && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">About Me</h3>
                <p className="text-gray-600">{currentUser.bio}</p>
              </div>
            )}
            
            {currentUser.tags && currentUser.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Services Offered</h3>
                <div className="flex flex-wrap gap-1">
                  {currentUser.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="font-semibold text-lg mb-4">My Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-500">Referrals Given</div>
                <div className="text-xl font-bold text-green-600">{referralsGiven}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-500">Referrals Received</div>
                <div className="text-xl font-bold text-blue-600">{referralsReceived}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-sm text-gray-500">One-to-Ones</div>
                <div className="text-xl font-bold text-amber-600">{oneToOnesDone}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-500">Closed Business</div>
                <div className="text-xl font-bold text-purple-600">${closedBusiness.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="bg-white rounded-lg shadow p-6 mt-4">
              <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Recent Referrals</h4>
                {userReferrals && userReferrals.length > 0 ? (
                  <div className="space-y-3">
                    {userReferrals.map(referral => (
                      <div key={referral.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {referral.fromMemberId === currentUser.id ? 
                                `You gave a referral to ${referral.toMemberName}` : 
                                `${referral.fromMemberName} gave you a referral`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(referral.date), "MMMM d, yyyy")}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Referral
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent referrals to show.</p>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Recent One-to-Ones</h4>
                {userOneToOnes && userOneToOnes.length > 0 ? (
                  <div className="space-y-3">
                    {userOneToOnes.map(oneToOne => (
                      <div key={oneToOne.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {`One-to-one with ${oneToOne.member1Id === currentUser.id ? 
                                oneToOne.member2Name : 
                                oneToOne.member1Name}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(oneToOne.date), "MMMM d, yyyy")}
                            </p>
                            {oneToOne.notes && (
                              <p className="text-sm mt-1">{oneToOne.notes}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            One-to-One
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent one-to-ones to show.</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Recent Closed Business</h4>
                {userClosedBusiness && userClosedBusiness.length > 0 ? (
                  <div className="space-y-3">
                    {userClosedBusiness.map(tyfcb => (
                      <div key={tyfcb.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {tyfcb.fromMemberId === currentUser.id ? 
                                `You thanked ${tyfcb.toMemberName} for closed business` : 
                                `${tyfcb.fromMemberName} thanked you for closed business`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(tyfcb.date), "MMMM d, yyyy")}
                            </p>
                            <p className="font-medium text-green-600 mt-1">
                              Amount: ${Number(tyfcb.amount).toLocaleString()}
                            </p>
                            {tyfcb.description && (
                              <p className="text-sm mt-1">{tyfcb.description}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-purple-600 border-purple-600">
                            Closed Business
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent closed business to show.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <ScrollArea className="h-[80vh]">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-2">
                        <AvatarImage src={profileImage || ""} />
                        <AvatarFallback className="bg-maroon text-white text-xl">
                          {getInitials(currentUser.firstName, currentUser.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <ProfilePicUpload onImageUploaded={handleImageUpload} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
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
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write a brief description about you or your business" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <Label>Services Offered</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a service or skill tag"
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-medium mb-4">Website & Social Media</h3>
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Full URL including https://
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input placeholder="username or URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input placeholder="username or URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="tiktok"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TikTok</FormLabel>
                            <FormControl>
                              <Input placeholder="username or URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input placeholder="username or URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-maroon hover:bg-maroon/90"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
