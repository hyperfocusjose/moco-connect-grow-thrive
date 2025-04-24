
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ContactInfo } from '@/components/profile/ContactInfo';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { RecentActivities } from '@/components/profile/RecentActivities';
import { AboutSection } from '@/components/profile/AboutSection';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

const Profile = () => {
  const { currentUser } = useAuth();
  const { stats, referrals, oneToOnes, tyfcbs } = useData();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (!currentUser) {
    return <div className="p-6">Loading profile...</div>;
  }

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
          <Card className="p-6 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <ProfileHeader currentUser={currentUser} />
            <ContactInfo currentUser={currentUser} />
            <AboutSection currentUser={currentUser} />
          </Card>

          <ProfileStats
            referralsGiven={referralsGiven}
            referralsReceived={referralsReceived}
            oneToOnesDone={oneToOnesDone}
            closedBusiness={closedBusiness}
          />
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="bg-white rounded-lg shadow p-6 mt-4">
              <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
              <RecentActivities
                currentUserId={currentUser.id}
                referrals={userReferrals || []}
                oneToOnes={userOneToOnes || []}
                closedBusiness={userClosedBusiness || []}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <ProfileEditDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        currentUser={currentUser}
      />
    </div>
  );
};

export default Profile;
