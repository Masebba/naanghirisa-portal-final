
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MID_ADMIN = 'MID_ADMIN',
  STAFF_ADMIN = 'STAFF_ADMIN',
  DONOR = 'DONOR',
  VOLUNTEER = 'VOLUNTEER',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // For authentication
  avatar?: string;
  phone?: string;
  location?: string;
  workDetails?: string;
}

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'In Progress' | 'Completed';
  startDate: string;
  endDate: string;
  assignedTo: string; // User ID
}

export interface VolunteerDocument {
  id: string;
  type: 'certificate' | 'letter';
  title: string;
  reason: string;
  issueDate: string;
  issuedBy: string;
  referenceNo: string;
}

export interface LibraryTask {
  id: string;
  title: string;
  description: string;
  durationDays: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'mission' | 'status' | 'general' | 'feedback' | 'recognition';
}

export interface Program {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  goals: string[];
  impact: string;
  status: 'Running' | 'Completed' | 'Planned';
  allocatedBudget: number;
  image: string;
  type: 'Recurrent' | 'Annual';
}

export interface Campaign {
  id: string;
  name: string;
  purpose: string;
  description?: string;
  targetAmount: number;
  amountRaised: number;
  startDate: string;
  endDate: string;
  image: string;
  status: 'Active' | 'Closed';
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  campaignId?: string;
  category?: string;
  description?: string;
  receiptImage?: string;
}

export interface OtherIncome {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  receiptImage?: string;
}

export interface Expenditure {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  initiatedBy: string;
  approvedBy?: string;
  receiptImage?: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  background: string;
  status: string;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  date: string;
  author: string;
  image: string;
  category: 'Announcement' | 'Event' | 'Impact Story' | 'Update';
  tags: string[];
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  link: string;
}

export interface Leader {
  id: string;
  name: string;
  role: string;
  profile: string;
  image: string;
}
