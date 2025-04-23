
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { User } from '@/types';
import { MemberCard } from '@/components/directory/MemberCard';
import { MemberDetail } from '@/components/directory/MemberDetail';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search } from 'lucide-react';

const Directory: React.FC = () => {
  const { users } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter members based on search term
  const filteredMembers = users.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.firstName.toLowerCase().includes(searchLower) ||
      member.lastName.toLowerCase().includes(searchLower) ||
      member.businessName.toLowerCase().includes(searchLower) ||
      member.industry.toLowerCase().includes(searchLower) ||
      member.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Open member detail dialog
  const handleSelectMember = (member: User) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  // Close member detail dialog
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Member Directory</h1>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, business, industry, or services..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Members grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <MemberCard 
            key={member.id} 
            member={member} 
            onClick={() => handleSelectMember(member)} 
          />
        ))}
        {filteredMembers.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No members found matching your search criteria.
          </div>
        )}
      </div>

      {/* Member detail dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md p-0" onInteractOutside={(e) => e.preventDefault()}>
          {selectedMember && (
            <MemberDetail 
              member={selectedMember}
              onClose={handleCloseDetail}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Directory;
