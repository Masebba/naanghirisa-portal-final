import {
  Campaign,
  Donation,
  Expenditure,
  Leader,
  LibraryTask,
  NewsPost,
  Notification,
  OtherIncome,
  Partner,
  Program,
  Student,
  User,
  UserRole,
  VolunteerDocument,
  VolunteerTask,
} from '../types';

const DB_PREFIX = 'naanghirisa_db_';

const save = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to persist ${key}:`, error);
  }
};

const load = <T,>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(`${DB_PREFIX}${key}`);
  if (!stored) return fallback;

  try {
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return fallback;
  }
};

const initialPageContent = {
  heroTitle: 'Changing Life of the Less Privileged',
  heroDescription:
    'Naanghirisa Development Association supports vulnerable children and disadvantaged communities through education, care, and empowerment initiatives.',
  heroImage: '',
  footerDescription:
    'A community-based organisation supporting vulnerable children and disadvantaged communities through education, care, and empowerment initiatives.',
  footerAddress: 'Plot 12, Link Road, Butaleja Town Council, Uganda',
  footerPhone: '+256 700 000000',
  footerEmail: 'info@naanghirisa.org',
  aboutMission: 'To support vulnerable children and communities through education, welfare, and empowerment.',
  aboutVision: 'A community where every child has access to education and a better future.',
  aboutStory:
    'Naanghirisa was founded to respond to the gaps facing vulnerable children and households in the community.',
  aboutJourneyImage: '',
  programSpendPercentage: 0,
  impactChildrenCount: 0,
  totalFundsRaised: 0,
  transparencyLockMessage:
    'Detailed financial reports and donor-only records are available after secure sign-in.',
  contactEmailSupport: 'info@naanghirisa.org',
  contactEmailEnquiry: 'support@naanghirisa.org',
  contactPhone1: '+256 700 000000',
  contactPhone2: '+256 770 000000',
  contactAddress: 'Plot 12, Link Road, Butaleja Town Council, Uganda',
};

let programs = load<Program[]>('programs', []);
let campaigns = load<Campaign[]>('campaigns', []);
let users = load<User[]>('users', []);
let donations = load<Donation[]>('donations', []);
let news = load<NewsPost[]>('news', []);
let expenditures = load<Expenditure[]>('expenditures', []);
let otherIncome = load<OtherIncome[]>('otherIncome', []);
let volunteers = load<any[]>('volunteers', []);
let pageContent = load<typeof initialPageContent>('pageContent', initialPageContent);
let taskLibrary = load<LibraryTask[]>('taskLibrary', []);
let notifications = load<Notification[]>('notifications', []);
let feedback = load<any[]>('feedback', []);

const syncLegacyExports = () => {
  mockPrograms = programs;
  mockCampaigns = campaigns;
  mockNews = news;
  mockDonations = donations;
  mockStudents = [];
};

const persistAll = () => {
  save('programs', programs);
  save('campaigns', campaigns);
  save('users', users);
  save('donations', donations);
  save('news', news);
  save('expenditures', expenditures);
  save('otherIncome', otherIncome);
  save('volunteers', volunteers);
  save('pageContent', pageContent);
  save('taskLibrary', taskLibrary);
  save('notifications', notifications);
  save('feedback', feedback);
  syncLegacyExports();
};

const updateTotals = () => {
  const donationTotal = donations.reduce((sum, item) => sum + item.amount, 0);
  const incomeTotal = otherIncome.reduce((sum, item) => sum + item.amount, 0);
  const expenditureTotal = expenditures.reduce((sum, item) => sum + item.amount, 0);
  const netRaised = donationTotal + incomeTotal - expenditureTotal;
  const impactChildrenCount = Math.max(0, Math.floor(donationTotal / 250));

  pageContent = {
    ...pageContent,
    totalFundsRaised: Math.max(0, netRaised),
    impactChildrenCount,
    programSpendPercentage: netRaised > 0 ? Math.min(100, Math.round((expenditureTotal / netRaised) * 100)) : 0,
  };
};

export const clearAllData = () => {
  programs = [];
  campaigns = [];
  users = [];
  donations = [];
  news = [];
  expenditures = [];
  otherIncome = [];
  volunteers = [];
  taskLibrary = [];
  notifications = [];
  feedback = [];
  pageContent = { ...initialPageContent };
  persistAll();
};

export const getPrograms = () => programs;
export const addProgram = (program: Program) => {
  programs = [program, ...programs.filter(item => item.id !== program.id)];
  persistAll();
};
export const updateProgram = (program: Program) => {
  programs = programs.map(item => (item.id === program.id ? program : item));
  persistAll();
};
export const deleteProgram = (id: string) => {
  programs = programs.filter(item => item.id !== id);
  persistAll();
};

export const getCampaigns = () => campaigns;
export const addCampaign = (campaign: Campaign) => {
  campaigns = [campaign, ...campaigns.filter(item => item.id !== campaign.id)];
  persistAll();
};
export const updateCampaign = (campaign: Campaign) => {
  campaigns = campaigns.map(item => (item.id === campaign.id ? campaign : item));
  persistAll();
};
export const deleteCampaign = (id: string) => {
  campaigns = campaigns.filter(item => item.id !== id);
  persistAll();
};

export const getDonations = () => donations;
export const addDonation = (donation: Donation) => {
  donations = [donation, ...donations.filter(item => item.id !== donation.id)];
  if (donation.campaignId) {
    campaigns = campaigns.map(campaign =>
      campaign.id === donation.campaignId
        ? { ...campaign, amountRaised: campaign.amountRaised + donation.amount }
        : campaign,
    );
  }
  updateTotals();
  persistAll();
};

export const getNews = () => news;
export const addNews = (post: NewsPost) => {
  news = [post, ...news.filter(item => item.id !== post.id)];
  persistAll();
};
export const updateNews = (post: NewsPost) => {
  news = news.map(item => (item.id === post.id ? post : item));
  persistAll();
};
export const deleteNews = (id: string) => {
  news = news.filter(item => item.id !== id);
  persistAll();
};

export const getUsers = () => users;
export const addUser = (user: User) => {
  users = [...users.filter(item => item.id !== user.id), user];
  persistAll();
  return user;
};
export const updateUser = (user: User) => {
  users = users.map(item => (item.id === user.id ? { ...item, ...user, password: user.password || item.password } : item));
  persistAll();
};
export const deleteUser = (id: string) => {
  users = users.filter(item => item.id !== id);
  persistAll();
};
export const resetUserPassword = (id: string, newPassword: string) => {
  users = users.map(item => (item.id === id ? { ...item, password: newPassword } : item));
  persistAll();
};

export const getExpenditures = () => expenditures;
export const addExpenditure = (expenditure: Expenditure) => {
  expenditures = [expenditure, ...expenditures.filter(item => item.id !== expenditure.id)];
  updateTotals();
  persistAll();
};
export const updateExpenditure = (expenditure: Expenditure) => {
  expenditures = expenditures.map(item => (item.id === expenditure.id ? expenditure : item));
  updateTotals();
  persistAll();
};

export const getOtherIncome = () => otherIncome;
export const addOtherIncome = (income: OtherIncome) => {
  otherIncome = [income, ...otherIncome.filter(item => item.id !== income.id)];
  updateTotals();
  persistAll();
};

export const getPageContent = () => pageContent;
export const updatePageContent = (content: Partial<typeof initialPageContent>) => {
  pageContent = { ...pageContent, ...content };
  persistAll();
};

export const getVolunteers = () => volunteers;
export const addVolunteerApplication = (application: any) => {
  const newVolunteer = {
    ...application,
    id: `v_${Date.now()}`,
    status: 'Pending',
    joinedDate: new Date().toISOString().split('T')[0],
    tasks: [],
    documents: [],
  };
  volunteers = [newVolunteer, ...volunteers.filter(item => item.id !== newVolunteer.id)];
  persistAll();
  return newVolunteer;
};
export const updateVolunteerStatus = (id: string, status: string) => {
  volunteers = volunteers.map(item => (item.id === id ? { ...item, status } : item));
  persistAll();
};
export const upsertVolunteerTask = (volunteerId: string, task: VolunteerTask) => {
  volunteers = volunteers.map(volunteer => {
    if (volunteer.id !== volunteerId) return volunteer;
    const tasks = [...(volunteer.tasks || [])];
    const index = tasks.findIndex((item: VolunteerTask) => item.id === task.id);
    if (index >= 0) tasks[index] = task;
    else tasks.push(task);
    return { ...volunteer, tasks };
  });
  persistAll();
};
export const deleteVolunteerTask = (volunteerId: string, taskId: string) => {
  volunteers = volunteers.map(volunteer =>
    volunteer.id === volunteerId ? { ...volunteer, tasks: (volunteer.tasks || []).filter((task: VolunteerTask) => task.id !== taskId) } : volunteer,
  );
  persistAll();
};
export const updateTaskProgress = (volunteerId: string, taskId: string, progress: number) => {
  volunteers = volunteers.map(volunteer =>
    volunteer.id === volunteerId
      ? {
          ...volunteer,
          tasks: (volunteer.tasks || []).map((task: VolunteerTask) =>
            task.id === taskId ? { ...task, progress, status: progress === 100 ? 'Completed' : 'In Progress' } : task,
          ),
        }
      : volunteer,
  );
  persistAll();
};
export const awardVolunteerDocument = (volunteerId: string, document: Omit<VolunteerDocument, 'id' | 'issueDate' | 'referenceNo'>) => {
  const issuedDocument: VolunteerDocument = {
    ...document,
    id: `doc_${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    referenceNo: `NAA-${Date.now()}`,
  };
  volunteers = volunteers.map(volunteer =>
    volunteer.id === volunteerId ? { ...volunteer, documents: [...(volunteer.documents || []), issuedDocument] } : volunteer,
  );
  persistAll();
  return issuedDocument;
};

export const getTaskLibrary = () => taskLibrary;
export const addLibraryTask = (task: LibraryTask) => {
  taskLibrary = [
    { ...task, id: task.id || `lib_${Date.now()}` },
    ...taskLibrary.filter(item => item.id !== task.id),
  ];
  persistAll();
};
export const deleteLibraryTask = (id: string) => {
  taskLibrary = taskLibrary.filter(item => item.id !== id);
  persistAll();
};

export const getNotifications = (userId: string) => notifications.filter(item => item.userId === userId);
export const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'date'>) => {
  const created: Notification = {
    ...notification,
    id: `notif_${Date.now()}`,
    read: false,
    date: new Date().toISOString().split('T')[0],
  };
  notifications = [created, ...notifications];
  persistAll();
  return created;
};
export const markNotificationRead = (id: string) => {
  notifications = notifications.map(item => (item.id === id ? { ...item, read: true } : item));
  persistAll();
};

export const getFeedback = () => feedback;

export let mockPrograms = programs;
export let mockCampaigns = campaigns;
export let mockNews = news;
export let mockDonations = donations;
export const mockPartners: Partner[] = [];
export const mockLeaders: Leader[] = [];
export let mockStudents: Student[] = [];
