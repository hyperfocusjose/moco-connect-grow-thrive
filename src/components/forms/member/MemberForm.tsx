import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useData } from '@/contexts/DataContext';
import { User } from '@/types';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BasicInfoFields } from './BasicInfoFields';
import { ServiceTagsField } from './ServiceTagsField';
import { SocialMediaFields } from './SocialMediaFields';
import { ProfileImageField } from './ProfileImageField';

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
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
  const { addUser, updateUser, fetchUsers } = useData();
  const [tags, setTags] = useState<string[]>(member?.tags || []);
  const [profileImage, setProfileImage] = useState<string | null>(member?.profilePicture || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const generateTemporaryPassword = () => {
    return "mocopng1";
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && member) {
        await updateUser(member.id, {
          ...member,
          ...data,
          tags,
          profilePicture: profileImage || member.profilePicture,
        });
        
        toast("Member updated", {
          description: "Member information has been updated successfully"
        });
      } else {
        const password = generateTemporaryPassword();
        
        const { data: sessionData } = await supabase.auth.getSession();
        
        try {
          const response = await fetch("https://fermfvwyoqewedrzgben.functions.supabase.co/create-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${sessionData.session?.access_token || ""}`,
            },
            body: JSON.stringify({
              email: data.email,
              password: password,
              userData: {
                firstName: data.firstName,
                lastName: data.lastName,
                businessName: data.businessName,
                industry: data.industry,
                bio: data.bio || "",
                phoneNumber: data.phoneNumber,
                profilePicture: profileImage || "",
                website: data.website || "",
                linkedin: data.linkedin || "",
                facebook: data.facebook || "",
                tiktok: data.tiktok || "",
                instagram: data.instagram || "",
                tags: tags,
              }
            }),
          });

          const result = await response.json();
          
          if (result.error) {
            if (result.error.includes("already been registered")) {
              toast("Email already exists", {
                description: "A user with this email already exists. Try a different email or update the existing user."
              });
              return;
            }
            throw new Error(result.error);
          }

          if (!result.user?.user) {
            throw new Error('Failed to create user');
          }

          const newUser: User = {
            id: result.user.user.id,
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
          
          toast("Member added", {
            description: `New member has been added successfully. Their temporary password is: ${password}`
          });
          
          await fetchUsers();
        } catch (error: any) {
          console.error('Error in member form:', error);
          
          if (error.message && error.message.includes("already been registered")) {
            toast("Email already exists", {
              description: "A user with this email already exists. Try a different email or update the existing user."
            });
            return;
          }
          
          throw error;
        }
      }
      
      onComplete();
    } catch (error: any) {
      console.error('Error in member form:', error);
      toast("Error", {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Member" : "Add New Member"}
      </h2>
      
      <ScrollArea className="h-[70vh] pr-4">
        <ProfileImageField 
          profileImage={profileImage} 
          member={member || null} 
          onImageUploaded={setProfileImage} 
        />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoFields form={form} />
            <ServiceTagsField tags={tags} setTags={setTags} />
            
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">Social Media & Website</h3>
              <SocialMediaFields form={form} />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onComplete}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-maroon hover:bg-maroon/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
