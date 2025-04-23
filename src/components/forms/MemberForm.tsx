import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useData } from '@/contexts/DataContext';
import { User } from '@/types';
import { ProfilePicUpload } from '@/components/profile/ProfilePicUpload';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface MemberFormProps {
  member?: User;
  onComplete: () => void;
}

export const MemberForm: React.FC<MemberFormProps> = ({ member, onComplete }) => {
  const { addUser, updateUser } = useData();
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>(member?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(member?.profilePicture || null);
  
  const isEditing = !!member;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: member?.firstName || "",
      lastName: member?.lastName || "",
      email: member?.email || "",
      phoneNumber: member?.phoneNumber || "",
      businessName: member?.businessName || "",
      bio: member?.bio || "",
      industry: member?.industry || "",
      website: member?.website || "",
      linkedin: member?.linkedin || "",
      facebook: member?.facebook || "",
      tiktok: member?.tiktok || "",
      instagram: member?.instagram || "",
    },
  });

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

  const onSubmit = async (data: FormValues) => {
    if (isEditing && member) {
      // Update existing member
      await updateUser(member.id, {
        ...member,
        ...data,
        tags,
        profilePicture: profileImage || member.profilePicture,
      });
      
      toast({
        title: "Member updated",
        description: "Member information has been updated successfully",
      });
    } else {
      // Create new member with required fields (ensures all required User properties exist)
      const newUser: User = {
        id: `user-${Date.now()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        businessName: data.businessName,
        industry: data.industry,
        bio: data.bio || "",
        tags: tags,
        profilePicture: profileImage || "",
        isAdmin: false,
        website: data.website || "",
        linkedin: data.linkedin || "",
        facebook: data.facebook || "",
        tiktok: data.tiktok || "",
        instagram: data.instagram || "",
        createdAt: new Date(),
      };
      
      await addUser(newUser);
      
      toast({
        title: "Member added",
        description: "New member has been added successfully",
      });
    }
    
    onComplete();
  };

  const handleImageUpload = (imageUrl: string) => {
    setProfileImage(imageUrl);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Member" : "Add New Member"}
      </h2>
      
      <ScrollArea className="h-[70vh] pr-4">
        <div className="mb-6 flex justify-center">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-2">
              <AvatarImage src={profileImage || ""} />
              <AvatarFallback className="bg-maroon text-white text-xl">
                {member ? `${member.firstName[0]}${member.lastName[0]}`.toUpperCase() : "NA"}
              </AvatarFallback>
            </Avatar>
            <ProfilePicUpload onImageUploaded={handleImageUpload} />
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
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
                    <FormLabel>Last Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
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
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" type="email" {...field} />
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
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
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
                  <FormLabel>Business Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Business name" {...field} />
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
                    <Input placeholder="Member industry" {...field} />
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
                      placeholder="Write a brief description about the member or their business" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Services Offered</FormLabel>
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
              <h3 className="text-lg font-medium mb-4">Social Media & Website</h3>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="username or full URL" {...field} />
                        </FormControl>
                        <FormDescription>
                          Just the username or full profile URL
                        </FormDescription>
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
                          <Input placeholder="username or full URL" {...field} />
                        </FormControl>
                        <FormDescription>
                          Just the username or page name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tiktok"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TikTok</FormLabel>
                        <FormControl>
                          <Input placeholder="username or full URL" {...field} />
                        </FormControl>
                        <FormDescription>
                          With or without @ symbol
                        </FormDescription>
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
                          <Input placeholder="username or full URL" {...field} />
                        </FormControl>
                        <FormDescription>
                          Just the username
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onComplete}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-maroon hover:bg-maroon/90"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                ) : isEditing ? "Update Member" : "Add Member"}
              </Button>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </div>
  );
};
