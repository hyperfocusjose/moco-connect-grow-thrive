
import React from 'react';
import { User } from '@/types';
import { MemberCard } from '@/components/directory/MemberCard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface MembersSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredMembers: User[];
  totalMembers: number;
  onSelectMember: (member: User) => void;
  isAdmin: boolean;
  onEditMember: (member: User) => void;
}

export const MembersSection = ({
  searchTerm,
  onSearchChange,
  filteredMembers,
  totalMembers,
  onSelectMember,
  isAdmin,
  onEditMember,
}: MembersSectionProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Card className="flex-grow">
          <CardHeader className="py-4 px-5 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-medium">Total Members</CardTitle>
              <CardDescription>Active group members</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-green-100 p-2">
                <Search className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold">{totalMembers}</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, business, industry, or services..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {filteredMembers.length === 0 && (
        <Alert variant="default" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No members found</AlertTitle>
          <AlertDescription>
            {searchTerm ? 
              "No members match your search criteria. Try adjusting your search terms." : 
              "There are no members in the directory yet. If you believe this is an error, please check the console logs or contact the administrator."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <MemberCard 
            key={member.id} 
            member={member} 
            onClick={() => onSelectMember(member)}
            showEditButton={isAdmin}
            onEdit={() => onEditMember(member)}
          />
        ))}
      </div>
    </>
  );
};
