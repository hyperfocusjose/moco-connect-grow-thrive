
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
  hostMemberName?: string;
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
  presenter?: string;
  createdAt: Date;
  isCancelled?: boolean;
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

export interface DataContextType {
  users: User[];
  events: Event[];
  visitors: Visitor[];
  activities: Activity[];
  referrals: Referral[];
  oneToOnes: OneToOne[];
  tyfcbs: TYFCB[];
  polls: Poll[];
  stats: any; // Consider creating a more specific type for stats if possible

  // User-related methods
  getUser: (id: string) => User | undefined;
  addUser: (user: Partial<User>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  fetchUsers: () => Promise<void>;

  // Event-related methods
  createEvent: (event: Partial<Event>) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  fetchEvents: () => Promise<void>;

  // Visitor-related methods
  addVisitor: (visitor: Partial<Visitor>) => Promise<void>;
  updateVisitor: (id: string, visitorData: Partial<Visitor>) => Promise<void>;
  markVisitorNoShow: (visitorId: string) => Promise<void>;
  fetchVisitors: () => Promise<void>;

  // Activity-related methods
  addReferral: (referral: Partial<Referral>) => Promise<void>;
  addOneToOne: (oneToOne: Partial<OneToOne>) => Promise<void>;
  addTYFCB: (tyfcb: Partial<TYFCB>) => Promise<void>;
  fetchActivities: () => Promise<void>;

  // Metrics-related methods
  getUserMetrics: (userId: string) => any; // Consider creating a more specific return type
  getTopPerformers: () => any; // Consider creating a more specific return type
  getActivityForAllMembers: () => any; // Consider creating a more specific return type

  // Poll-related methods
  createPoll: (poll: Partial<Poll>) => Promise<void>;
  updatePoll: (id: string, pollData: Partial<Poll>) => Promise<void>;
  deletePoll: (id: string) => Promise<void>;
  votePoll: (pollId: string, optionId: string) => Promise<void>;
  hasVoted: (pollId: string, userId: string) => boolean;
  fetchPolls: () => Promise<void>;

  // Data management methods
  reloadData: () => Promise<void>; // Added this function to the type definition

  // Loading and error states
  isLoading: boolean;
  loadError: string | null;
  resetFetchState: () => void;
}
