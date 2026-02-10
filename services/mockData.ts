
import { Program, Campaign, Donation, Student, NewsPost, Partner, Leader, User, UserRole, Expenditure, OtherIncome, VolunteerTask, Notification, LibraryTask, VolunteerDocument } from '../types';

const DB_PREFIX = 'naanghirisa_db_';

// --- Persistence Helpers ---
const save = (key: string, data: any) => {
  try {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Storage error for ${key}:`, e);
    // Alert the user if the quota is exceeded (usually due to large images)
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      alert("Storage limit reached. Try using a smaller profile image or clearing some data.");
    }
  }
};

const load = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(DB_PREFIX + key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    console.error(`Database error loading ${key}:`, e);
    return defaultValue;
  }
};

// --- Initial Default States ---
const defaultPrograms: Program[] = [
  {
    id: 'child-sponsorship',
    name: 'The PASS Project',
    description: 'Promot Academic Success in Schools',
    longDescription: 'Naanghirisa chose education as one of its priority areas of focus and developed the PASS project (Promoting Academic Success in Schools). The goal of this project is to contribute to the improvement of education standards in Butaleja in general.',
    goals: ['Improve academic performance', 'Reduce school dropout rates by 30%'],
    impact: 'Over 1200 children have been impacted',
    status: 'Running',
    allocatedBudget: 50000,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    type: 'Recurrent'
  },
  {
    id: 'community-support',
    name: 'Community Support Program',
    description: 'Providing relief and assistance to disadvantaged families.',
    longDescription: 'Naanghirisa believes that a child cannot thrive if the family is in crisis.',
    goals: ['Establish 5 clean water points', 'Support 50 households with seeds'],
    impact: 'We have supported over 200 families with emergency relief.',
    status: 'Running',
    allocatedBudget: 30000,
    image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800',
    type: 'Recurrent'
  }
];

const defaultCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Back to School 2024',
    purpose: 'Provision of books and uniforms for 50 orphans.',
    description: 'As the new academic year approaches, many children in our community face the risk of dropping out simply because they lack basic materials.',
    targetAmount: 15000,
    amountRaised: 12450,
    startDate: '2024-01-01',
    endDate: '2024-03-30',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    status: 'Active'
  }
];

const DEFAULT_PASS = 'user123';

const defaultUsers: User[] = [
  { id: 'u1', name: 'Masebba', email: 'admin@naanghirisa.org', phone: '0700000001', role: UserRole.SUPER_ADMIN, password: DEFAULT_PASS, avatar: 'https://i.pravatar.cc/150?u=admin', location: 'Kampala, Uganda', workDetails: 'Chief of Operations' },
  { id: 'u2', name: 'John Manager', email: 'manager@naanghirisa.org', phone: '0700000002', role: UserRole.MID_ADMIN, password: DEFAULT_PASS, location: 'Butaleja, Uganda', workDetails: 'Manager' },
  { id: 'u3', name: 'Staff Admin', email: 'staff@naanghirisa.org', phone: '0700000003', role: UserRole.STAFF_ADMIN, password: DEFAULT_PASS, location: 'Butaleja, Uganda', workDetails: 'Field Operations Officer' },
  { id: 'u4', name: 'Dave Donor', email: 'donor@example.com', phone: '0700000004', role: UserRole.DONOR, password: DEFAULT_PASS, location: 'London, UK', workDetails: 'Philanthropist' },
  { id: 'u5', name: 'Volunteer User', email: 'volunteer@example.com', phone: '0700000005', role: UserRole.VOLUNTEER, password: DEFAULT_PASS, location: 'Mbale, Uganda', workDetails: 'Community Liaison', avatar: 'https://i.pravatar.cc/150?u=volunteer' }
];

const defaultPageContent = {
  heroTitle: 'Changing Life of the Less Privileged',
  heroDescription: 'Naanghirisa Development Association is a community based organisation founded to support vulnerable children and disadvantaged communities through education, care, and empowerment initiatives.',
  heroImage: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=800',
  footerDescription: 'A Community-Based Organisation supporting vulnerable children and disadvantaged communities through education, care, and empowerment initiatives.',
  footerAddress: 'Plot 12, Link Road, Butaleja Town Council, Uganda',
  footerPhone: '+256 700 000000',
  footerEmail: 'info@naanghirisa.org',
  aboutMission: 'To support vulnerable children and communities through education, welfare, and empowerment.',
  aboutVision: 'A community where every child has access to education and a better future.',
  aboutStory: 'Naanghirisa was born out of a profound realization in 2021 that many orphans and vulnerable children in our local community were falling through the gaps of existing support systems.',
  aboutJourneyImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
  programSpendPercentage: 92,
  impactChildrenCount: 120,
  totalFundsRaised: 25000,
  transparencyLockMessage: 'Detailed financial reports, donor lists, and individual student progress are available exclusively to our donors via the Donor Portal.',
  contactEmailSupport: 'info@naanghirisa.org',
  contactEmailEnquiry: 'support@naanghirisa.org',
  contactPhone1: '+256 700 000000',
  contactPhone2: '+256 770 000000',
  contactAddress: 'Plot 12, Link Road, Butaleja Town Council, Uganda',
};

// --- Runtime Database State ---
let _programs = load<Program[]>('programs', defaultPrograms);
let _campaigns = load<Campaign[]>('campaigns', defaultCampaigns);
let _users = load<User[]>('users', defaultUsers);
let _donations = load<Donation[]>('donations', [
  { id: 'd1', donorName: 'Anonymous', amount: 500, date: '2024-02-15', campaignId: 'c1', category: 'Education', description: 'General sponsorship contribution.' },
  { id: 'd2', donorName: 'Global Fund', amount: 5000, date: '2023-12-15', campaignId: 'General', category: 'Grant', description: 'Strategic growth donation.' }
]);
let _news = load<NewsPost[]>('news', [
  { id: 'n1', title: 'Success of 2024 Back to School Drive', summary: 'We are thrilled to announce that 50 children have received full school kits.', content: 'Full details of the distribution event in Butaleja district. Our team visited three local schools.', date: '2024-03-05', author: 'Sarah Namono', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800', category: 'Impact Story', tags: ['Education', 'Butaleja'] }
]);
let _expenditures = load<Expenditure[]>('expenditures', [
  { id: 'e1', title: 'Uniforms for 50 Students', amount: 2500, date: '2024-02-10', category: 'Education', description: 'Purchase of custom tailored uniforms.', status: 'Approved', initiatedBy: 'Super Admin' }
]);
let _otherIncome = load<OtherIncome[]>('otherIncome', []);
let _volunteers = load<any[]>('volunteers', [
  { id: 'u5', name: 'Volunteer User', email: 'volunteer@example.com', status: 'Approved', joinedDate: '2024-01-01', tasks: [], documents: [] }
]);
let _pageContent = load<typeof defaultPageContent>('pageContent', defaultPageContent);
let _taskLibrary = load<LibraryTask[]>('taskLibrary', [
  { id: 'lib1', title: "Community Water Audit", description: "Analyzing water accessibility in sub-counties.", durationDays: 14 }
]);
let _notifications = load<Notification[]>('notifications', []);
let _feedback = load<any[]>('feedback', []);

// --- Data Accessors & Mutators (With Persistence) ---

export const getPrograms = () => _programs;
export const addProgram = (p: Program) => { _programs = [p, ..._programs]; save('programs', _programs); };
export const updateProgram = (p: Program) => { _programs = _programs.map(old => old.id === p.id ? p : old); save('programs', _programs); };
export const deleteProgram = (id: string) => { _programs = _programs.filter(p => p.id !== id); save('programs', _programs); };

export const getCampaigns = () => _campaigns;
export const addCampaign = (c: Campaign) => { _campaigns = [c, ..._campaigns]; save('campaigns', _campaigns); };
export const updateCampaign = (c: Campaign) => { _campaigns = _campaigns.map(old => old.id === c.id ? c : old); save('campaigns', _campaigns); };
export const deleteCampaign = (id: string) => { _campaigns = _campaigns.filter(c => c.id !== id); save('campaigns', _campaigns); };

export const getDonations = () => _donations;
export const addDonation = (d: Donation) => {
  _donations = [d, ..._donations];
  // Reactive updates
  _pageContent.totalFundsRaised += d.amount;
  if (d.amount >= 250) _pageContent.impactChildrenCount += Math.floor(d.amount / 250);
  if (d.campaignId && d.campaignId !== 'General') {
    _campaigns = _campaigns.map(c => c.id === d.campaignId ? { ...c, amountRaised: c.amountRaised + d.amount } : c);
    save('campaigns', _campaigns);
  }
  save('donations', _donations);
  save('pageContent', _pageContent);
};

export const getNews = () => _news;
export const addNews = (n: NewsPost) => { _news = [n, ..._news]; save('news', _news); };
export const updateNews = (n: NewsPost) => { _news = _news.map(old => old.id === n.id ? n : old); save('news', _news); };
export const deleteNews = (id: string) => { _news = _news.filter(n => n.id !== id); save('news', _news); };

export const getUsers = () => _users;
export const updateUser = (u: User) => {
  // Preserve sensitive fields like password if they aren't provided in the update object
  _users = _users.map(old => {
    if (old.id === u.id) {
      return { ...old, ...u, password: u.password || old.password };
    }
    return old;
  });
  save('users', _users);
};
export const addUser = (u: User) => { _users = [..._users, u]; save('users', _users); };
export const deleteUser = (id: string) => { _users = _users.filter(u => u.id !== id); save('users', _users); };
export const resetUserPassword = (id: string, newPass: string) => {
  _users = _users.map(u => u.id === id ? { ...u, password: newPass } : u);
  save('users', _users);
};

export const getExpenditures = () => _expenditures;
export const addExpenditure = (e: Expenditure) => { _expenditures = [e, ..._expenditures]; save('expenditures', _expenditures); };
export const updateExpenditure = (e: Expenditure) => { _expenditures = _expenditures.map(old => old.id === e.id ? e : old); save('expenditures', _expenditures); };

export const getOtherIncome = () => _otherIncome;
export const addOtherIncome = (oi: OtherIncome) => {
  _otherIncome = [oi, ..._otherIncome];
  _pageContent.totalFundsRaised += oi.amount;
  save('otherIncome', _otherIncome);
  save('pageContent', _pageContent);
};

export const getPageContent = () => _pageContent;
export const updatePageContent = (c: Partial<typeof _pageContent>) => { _pageContent = { ..._pageContent, ...c }; save('pageContent', _pageContent); };

export const getVolunteers = () => _volunteers;
export const addVolunteerApplication = (v: any) => {
  const newV = { ...v, id: `v${Date.now()}`, status: 'Pending', joinedDate: new Date().toISOString().split('T')[0], tasks: [], documents: [] };
  _volunteers = [newV, ..._volunteers];
  _users.push({
    id: newV.id,
    name: newV.name,
    email: newV.email,
    phone: newV.phone || '',
    role: UserRole.VOLUNTEER,
    password: DEFAULT_PASS,
    avatar: `https://i.pravatar.cc/150?u=${newV.email}`
  });
  save('volunteers', _volunteers);
  save('users', _users);
  return newV;
};
export const updateVolunteerStatus = (id: string, status: string) => { _volunteers = _volunteers.map(v => v.id === id ? { ...v, status } : v); save('volunteers', _volunteers); };
export const upsertVolunteerTask = (volId: string, t: VolunteerTask) => {
  _volunteers = _volunteers.map(v => {
    if (v.id === volId) {
      const idx = (v.tasks || []).findIndex((task: any) => task.id === t.id);
      let tasks = [...(v.tasks || [])];
      if (idx > -1) tasks[idx] = t; else tasks.push(t);
      return { ...v, tasks };
    }
    return v;
  });
  save('volunteers', _volunteers);
};
export const deleteVolunteerTask = (volId: string, taskId: string) => {
  _volunteers = _volunteers.map(v => v.id === volId ? { ...v, tasks: (v.tasks || []).filter((t: any) => t.id !== taskId) } : v);
  save('volunteers', _volunteers);
};
export const updateTaskProgress = (volId: string, taskId: string, progress: number) => {
  _volunteers = _volunteers.map(v => v.id === volId ? { ...v, tasks: v.tasks.map((t: any) => t.id === taskId ? { ...t, progress, status: progress === 100 ? 'Completed' : 'In Progress' } : t) } : v);
  save('volunteers', _volunteers);
};
export const awardVolunteerDocument = (volId: string, doc: any) => {
  const newDoc = { ...doc, id: `doc${Date.now()}`, issueDate: new Date().toISOString().split('T')[0], referenceNo: `REF-${Date.now()}` };
  _volunteers = _volunteers.map(v => v.id === volId ? { ...v, documents: [...(v.documents || []), newDoc] } : v);
  save('volunteers', _volunteers);
};

export const getTaskLibrary = () => _taskLibrary;
export const addLibraryTask = (t: any) => { _taskLibrary = [{ ...t, id: `lib${Date.now()}` }, ..._taskLibrary]; save('taskLibrary', _taskLibrary); };
export const deleteLibraryTask = (id: string) => { _taskLibrary = _taskLibrary.filter(t => t.id !== id); save('taskLibrary', _taskLibrary); };

export const getNotifications = (uid: string) => _notifications.filter(n => n.userId === uid);
export const addNotification = (n: any) => { _notifications = [{ ...n, id: `notif${Date.now()}`, read: false, date: new Date().toISOString().split('T')[0] }, ..._notifications]; save('notifications', _notifications); };
export const markNotificationRead = (id: string) => { _notifications = _notifications.map(n => n.id === id ? { ...n, read: true } : n); save('notifications', _notifications); };

export const getFeedback = () => _feedback;

// --- Legacy Compatibility Exports ---
export const mockPrograms = _programs;
export const mockCampaigns = _campaigns;
export const mockNews = _news;
export const mockDonations = _donations;
export const mockPartners: Partner[] = [
  { id: 'pa1', name: 'Global Fund', logo: 'https://logo.clearbit.com/unicef.org', link: '#' }
];
export const mockLeaders: Leader[] = [
  { id: 'l1', name: 'Sarah Namono', role: 'Executive Director', profile: 'Visionary leader with 10+ years in CBO management.', image: 'https://i.pravatar.cc/150?u=sarah' }
];
export const mockStudents: Student[] = [
  { id: 's1', name: 'Alina K.', age: 10, background: 'Orphaned student from Butaleja.', status: 'Sponsored' }
];
