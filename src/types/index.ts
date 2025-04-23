
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phoneNumber: string;
  profilePicture: string;
  industry: string;
  bio: string;
  tags: string[];
  isAdmin: boolean;
  createdAt: Date;
}

export interface Referral {
  id: string;
  referringMemberId: string;
  referredToMemberId: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface Visitor {
  id: string;
  hostMemberId: string;
  visitorName: string;
  visitorBusiness: string;
  visitDate: Date;
  createdAt: Date;
}

export interface OneToOne {
  id: string;
  memberOneId: string;
  memberTwoId: string;
  meetingDate: Date;
  createdAt: Date;
}

export interface TYFCB {
  id: string;
  thankingMemberId: string;
  thankedMemberId: string;
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
