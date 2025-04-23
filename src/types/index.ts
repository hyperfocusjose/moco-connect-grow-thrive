export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  industry: string;
  bio?: string;
  tags: string[];
  profilePicture?: string;
  isAdmin: boolean;
  website?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
  instagram?: string;
  createdAt: Date;
}

export interface Referral {
  id: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface Visitor {
  id: string;
  visitorName: string;
  visitorBusiness: string;
  visitDate: Date;
  hostMemberId?: string;
  isSelfEntered?: boolean;
  phoneNumber?: string;
  email?: string;
  industry?: string;
  createdAt: Date;
  didNotShow?: boolean;
}

export interface OneToOne {
  id: string;
  member1Id: string;
  member1Name: string;
  member2Id: string;
  member2Name: string;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface TYFCB {
  id: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  createdBy: string;
  isApproved: boolean;
  isFeatured: boolean;
  isPresentationMeeting: boolean;
  isCancelled?: boolean;
  presenter?: string;
  createdAt: Date;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  startDate: Date;
  endDate: Date;
  createdBy: string;
  isActive: boolean;
  isArchived?: boolean;
  createdAt: Date;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // Array of user IDs who voted for this option
}

export interface Vote {
  id: string;
  pollId: string;
  userId: string;
  optionId: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: 'referral' | 'visitor' | 'oneToOne' | 'tyfcb' | 'event' | 'poll';
  description: string;
  date: Date;
  userId: string;
  relatedUserId?: string;
  referenceId: string; // ID of the related item (referral, visitor, etc.)
}

export interface ProfilePicUploadProps {
  onImageUploaded: (imageUrl: string) => void;
}
