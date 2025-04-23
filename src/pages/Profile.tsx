
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Phone, Mail, Users, CheckCircle, BarChart, Medal, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { currentUser } = useAuth();
  const { getUserMetrics, referrals, visitors, oneToOnes, tyfcbs } = useData();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || '',
    businessName: currentUser?.businessName || '',
    industry: currentUser?.industry || '',
    bio: currentUser?.bio || '',
    tags: currentUser?.tags || [],
  });
  
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get user metrics
  const metrics = currentUser ? getUserMetrics(currentUser.id) : null;
  
  // Calculate membership duration
  const getMembershipDuration = () => {
    if (!currentUser?.createdAt) return 'N/A';
    
    const joinDate = new Date(currentUser.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !profileData.tags.includes(newTag.trim())) {
      setProfileData({
        ...profileData,
        tags: [...profileData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setProfileData({
      ...profileData,
      tags: profileData.tags.filter(t => t !== tag),
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    }, 1000);
  };
  
  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold">You must be logged in to view your profile</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">View and manage your account information</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="metrics">My Metrics</TabsTrigger>
          <TabsTrigger value="activity">My Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentUser.profilePicture} alt={currentUser.firstName} />
                    <AvatarFallback className="bg-maroon text-white text-xl">
                      {getInitials(currentUser.firstName, currentUser.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl text-center mt-4">
                  {currentUser.firstName} {currentUser.lastName}
                </CardTitle>
                <CardDescription className="text-center text-base">
                  {currentUser.businessName}
                </CardDescription>
                <div className="flex justify-center mt-2">
                  <Badge variant="outline" className="text-xs border-maroon text-maroon">
                    {currentUser.industry}
                  </Badge>
                  {currentUser.isAdmin && (
                    <Badge variant="outline" className="ml-2 text-xs border-maroon text-maroon">
                      Admin
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-gray-500" />
                    <span>{currentUser.phoneNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 text-gray-500" />
                    <span>{currentUser.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                    <span>Member for {getMembershipDuration()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {currentUser.bio || "No bio provided. Add a bio in the Edit Profile tab."}
                </p>

                {currentUser.tags && currentUser.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Services Offered</h3>
                    <div className="flex flex-wrap gap-1">
                      {currentUser.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-100 p-3 rounded-full mb-2">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-3xl font-bold">{metrics?.referrals || 0}</h3>
                    <p className="text-gray-500">Referrals Given</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-green-100 p-3 rounded-full mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-bold">{metrics?.visitors || 0}</h3>
                    <p className="text-gray-500">Visitors Invited</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-100 p-3 rounded-full mb-2">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-3xl font-bold">{metrics?.oneToOnes || 0}</h3>
                    <p className="text-gray-500">One-to-Ones</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-amber-100 p-3 rounded-full mb-2">
                      <BarChart className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-3xl font-bold">${metrics?.tyfcb.amount.toLocaleString()}</h3>
                    <p className="text-gray-500">Closed Business</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your profile information and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        value={profileData.businessName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        name="industry"
                        value={profileData.industry}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={profileData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell the group about yourself and your business..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Label>Services Offered (Tags)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex mt-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a service tag"
                      className="mr-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-maroon hover:bg-maroon/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Metrics</CardTitle>
                <CardDescription>Your activity metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Referrals</p>
                      <h4 className="text-2xl font-bold">{metrics?.referrals || 0}</h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Visitors</p>
                      <h4 className="text-2xl font-bold">{metrics?.visitors || 0}</h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">One-to-Ones</p>
                      <h4 className="text-2xl font-bold">{metrics?.oneToOnes || 0}</h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Medal className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">TYFCB Count</p>
                      <h4 className="text-2xl font-bold">{metrics?.tyfcb.count || 0}</h4>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Closed Business</h3>
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <BarChart className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total TYFCB Amount</p>
                      <h4 className="text-2xl font-bold">${metrics?.tyfcb.amount.toLocaleString() || 0}</h4>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Targets</CardTitle>
                <CardDescription>Your progress towards group goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Referrals Goal (Monthly)</Label>
                      <span className="text-sm font-medium">
                        {metrics?.referrals || 0}/4
                      </span>
                    </div>
                    <Progress value={(metrics?.referrals || 0) / 4 * 100} max={100} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Visitors Goal (Monthly)</Label>
                      <span className="text-sm font-medium">
                        {metrics?.visitors || 0}/2
                      </span>
                    </div>
                    <Progress value={(metrics?.visitors || 0) / 2 * 100} max={100} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>One-to-Ones Goal (Monthly)</Label>
                      <span className="text-sm font-medium">
                        {metrics?.oneToOnes || 0}/3
                      </span>
                    </div>
                    <Progress value={(metrics?.oneToOnes || 0) / 3 * 100} max={100} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Closed Business Goal (Quarterly)</Label>
                      <span className="text-sm font-medium">
                        ${metrics?.tyfcb.amount.toLocaleString() || 0}/$5,000
                      </span>
                    </div>
                    <Progress value={(metrics?.tyfcb.amount || 0) / 5000 * 100} max={100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.filter(r => r.referringMemberId === currentUser.id).length > 0 ? (
                  <div className="divide-y">
                    {referrals
                      .filter(r => r.referringMemberId === currentUser.id)
                      .slice(0, 5)
                      .map((referral) => {
                        const referredTo = referral.referredToMemberId ? 
                          `${referral.referredToMemberId}` : 'Unknown';
                        return (
                          <div key={referral.id} className="py-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{referral.description}</p>
                              <p className="text-sm text-gray-500">
                                Referred to: {referredTo}
                              </p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(referral.date).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No referrals yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                {visitors.filter(v => v.hostMemberId === currentUser.id).length > 0 ? (
                  <div className="divide-y">
                    {visitors
                      .filter(v => v.hostMemberId === currentUser.id)
                      .slice(0, 5)
                      .map((visitor) => (
                        <div key={visitor.id} className="py-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{visitor.visitorName}</p>
                            <p className="text-sm text-gray-500">{visitor.visitorBusiness}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(visitor.visitDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No visitors yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent One-to-Ones</CardTitle>
              </CardHeader>
              <CardContent>
                {oneToOnes.filter(o => o.memberOneId === currentUser.id || o.memberTwoId === currentUser.id).length > 0 ? (
                  <div className="divide-y">
                    {oneToOnes
                      .filter(o => o.memberOneId === currentUser.id || o.memberTwoId === currentUser.id)
                      .slice(0, 5)
                      .map((oneToOne) => {
                        const otherMemberId = oneToOne.memberOneId === currentUser.id ? 
                          oneToOne.memberTwoId : oneToOne.memberOneId;
                        return (
                          <div key={oneToOne.id} className="py-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">One-to-One with {otherMemberId}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(oneToOne.meetingDate).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No one-to-ones yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Closed Business</CardTitle>
              </CardHeader>
              <CardContent>
                {tyfcbs.filter(t => t.thankingMemberId === currentUser.id).length > 0 ? (
                  <div className="divide-y">
                    {tyfcbs
                      .filter(t => t.thankingMemberId === currentUser.id)
                      .slice(0, 5)
                      .map((tyfcb) => {
                        const thankedMember = tyfcb.thankedMemberId ? 
                          `${tyfcb.thankedMemberId}` : 'Unknown';
                        return (
                          <div key={tyfcb.id} className="py-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{tyfcb.description}</p>
                              <p className="text-sm text-gray-500">
                                Thanked: {thankedMember}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-right">${tyfcb.amount.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(tyfcb.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No closed business yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
