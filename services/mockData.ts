import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { createAuthUser } from "./authApi";
import {
  Campaign,
  Donation,
  Expenditure,
  LibraryTask,
  Leader,
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
} from "../types";
import { BRAND } from "../constants";

const initialPageContent = {
  heroTitle: BRAND.heroTitle,
  heroDescription: BRAND.heroDescription,
  heroImage: "",
  footerDescription: BRAND.heroDescription,
  footerAddress: "Plot 12, Link Road, Butaleja Town Council, Uganda",
  footerPhone: "+256 700 000000",
  footerEmail: "info@naanghirisa.org",
  aboutMission: "To support vulnerable children and communities through education, welfare, and empowerment.",
  aboutVision: "A community where every child has access to education and a better future.",
  aboutStory:
    "Naanghirisa was founded to respond to the gaps facing vulnerable children and households in the community.",
  aboutJourneyImage: "",
  aboutHeaderImage: "",
  aboutFormationImage: "",
  aboutFlashback2016: "",
  aboutFlashback2017: "",
  aboutFlashback2018: "",
  aboutFlashback2019: "",
  aboutFlashback2020: "",
  aboutFlashback2021: "",
  aboutFlashback2022: "",
  aboutFlashback2023: "",
  aboutFlashback2024: "",
  aboutFlashback2025: "",
  programSpendPercentage: 0,
  impactChildrenCount: 0,
  totalFundsRaised: 0,
  transparencyLockMessage:
    "Detailed financial reports and donor-only records are available after secure sign-in.",
  transparencyIntro: "At Naanghirisa, transparency is a core value.",
  transparencyArchivesText: "Approved financial records and archived accountability reports are available to trusted stakeholders.",
  transparencyHeroImage: "",
  contactEmailSupport: "info@naanghirisa.org",
  contactEmailEnquiry: "support@naanghirisa.org",
  contactPhone1: "+256 700 000000",
  contactPhone2: "+256 770 000000",
  contactAddress: "Plot 12, Link Road, Butaleja Town Council, Uganda",
  contactHeroTitle: "Get in Touch",
  contactHeroDescription: "Have questions about our programs or want to partner with us? Reach out today.",
  contactHeroImage: "",
  contactIntro: "We are here to help. Whether you are a donor, a volunteer, or a community member in need, our team is ready to listen and support.",
  volunteerHeroTitle: "Volunteer with Naanghirisa",
  volunteerHeroDescription: "Your skills and passion can help transform lives in Butaleja.",
  volunteerHeroImage: "",
  volunteerIntro: "Tell us a bit about yourself and your motivations.",
  donateHeroTitle: "Change a life today",
  donateHeroDescription: "Support general welfare or a specific campaign directly from the portal.",
  donateHeroImage: "",
  programsHeroImage: "",
  campaignsHeroImage: "",
  newsHeroImage: "",
  homeHeroTitle: BRAND.heroTitle,
  homeHeroDescription: BRAND.heroDescription,
  homeHeroImage: "",
  homeHeroSideImage: "",
  homeWhoWeAreTitle: "Our Dedication to Local Impact",
  homeWhoWeAreText: "Poverty, early marriage, teenage pregnancies, gender based violence, HIV and AIDS, and low participation in post-primary education are some of the situations attributed to Butaleja District.",
  homeWhatWeDoTitle: "What We Do",
  homeWhatWeDoText: "Our programs are designed to protect children, strengthen families, and create opportunities for lasting community change.",
  homeVisionTitle: "Vision for Tomorrow",
  homeVisionText: "Naanghirisa is constantly looking ahead. Our dynamic programming model allows us to address emerging challenges.",
  homeVisionImage: "",
  homeSnapshotImage1: "",
  homeSnapshotImage2: "",
  homeProgramImage1: "",
  homeProgramImage2: "",
  homeProgramImage3: "",
  homeProgramImage4: "",
  aboutHeaderTitle: 'About Naanghirisa',
  aboutHeaderSubtitle: 'Building a community with equal opportunities.',
  aboutJoinText: 'We welcome volunteers, donors, and partners who share our vision.',
  aboutPublicDomainTitle: 'Butaleja in public domain',
  aboutPublicDomainText: 'Butaleja district faces severe challenges in education and child welfare. Naanghirisa responds through practical, accountable action.',
  donateIntro: 'Support general welfare or a specific campaign directly from the portal.',
};

export type PageContent = typeof initialPageContent;

type Timestamped = {
  createdAt?: string;
  updatedAt?: string;
};

type VolunteerRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  joinedDate: string;
  tasks?: VolunteerTask[];
  documents?: VolunteerDocument[];
  [key: string]: any;
};

type FeedbackRecord = {
  id: string;
  name?: string;
  email?: string;
  message: string;
  category?: string;
  subject?: string;
  sender?: string;
  replyTo?: string;
  date?: string;
  status?: string;
  [key: string]: any;
};

type PageContentRecord = PageContent & Timestamped;

const toStringValue = (value: unknown) => (typeof value === "string" ? value : "");
const ensureArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value as T[] : []);
const nowIso = () => new Date().toISOString();
const today = () => new Date().toISOString().split("T")[0];
const VOLUNTEER_DEFAULT_PASSWORD = "Volunteer@123";

const normalizeUser = (data: DocumentData, id: string): User => ({
  id,
  name: toStringValue(data.name),
  email: toStringValue(data.email),
  phone: toStringValue(data.phone),
  role: (data.role as UserRole) || UserRole.VOLUNTEER,
  avatar: toStringValue(data.avatar),
  location: toStringValue(data.location),
  workDetails: toStringValue(data.workDetails),
  status: (toStringValue(data.status) as User['status']) || 'Active',
});

const normalizeProgram = (data: DocumentData, id: string): Program => ({
  id,
  name: toStringValue(data.name),
  description: toStringValue(data.description),
  longDescription: toStringValue(data.longDescription),
  goals: ensureArray<string>(data.goals),
  impact: toStringValue(data.impact),
  status: (data.status as Program["status"]) || "Planned",
  allocatedBudget: Number(data.allocatedBudget || 0),
  image: toStringValue(data.image),
  type: (data.type as Program["type"]) || "Recurrent",
});

const normalizeCampaign = (data: DocumentData, id: string): Campaign => ({
  id,
  name: toStringValue(data.name),
  purpose: toStringValue(data.purpose),
  description: toStringValue(data.description),
  targetAmount: Number(data.targetAmount || 0),
  amountRaised: Number(data.amountRaised || 0),
  startDate: toStringValue(data.startDate),
  endDate: toStringValue(data.endDate),
  image: toStringValue(data.image),
  status: (data.status as Campaign["status"]) || "Active",
});

const normalizeDonation = (data: DocumentData, id: string): Donation => ({
  id,
  donorName: toStringValue(data.donorName),
  amount: Number(data.amount || 0),
  date: toStringValue(data.date) || today(),
  campaignId: data.campaignId ? String(data.campaignId) : undefined,
  category: data.category ? String(data.category) : undefined,
  description: data.description ? String(data.description) : undefined,
  receiptImage: data.receiptImage ? String(data.receiptImage) : undefined,
});

const normalizeNews = (data: DocumentData, id: string): NewsPost => ({
  id,
  title: toStringValue(data.title),
  content: toStringValue(data.content),
  summary: toStringValue(data.summary),
  date: toStringValue(data.date) || today(),
  author: toStringValue(data.author),
  image: toStringValue(data.image),
  category: (data.category as NewsPost["category"]) || "Update",
  tags: ensureArray<string>(data.tags),
});

const normalizeExpenditure = (data: DocumentData, id: string): Expenditure => ({
  id,
  title: toStringValue(data.title),
  amount: Number(data.amount || 0),
  date: toStringValue(data.date) || today(),
  category: toStringValue(data.category),
  description: toStringValue(data.description),
  status: (data.status as Expenditure["status"]) || "Pending",
  initiatedBy: toStringValue(data.initiatedBy),
  approvedBy: data.approvedBy ? String(data.approvedBy) : undefined,
  receiptImage: data.receiptImage ? String(data.receiptImage) : undefined,
});

const normalizeOtherIncome = (data: DocumentData, id: string): OtherIncome => ({
  id,
  title: toStringValue(data.title),
  amount: Number(data.amount || 0),
  date: toStringValue(data.date) || today(),
  category: toStringValue(data.category),
  description: toStringValue(data.description),
  receiptImage: data.receiptImage ? String(data.receiptImage) : undefined,
});

const normalizeVolunteer = (data: DocumentData, id: string): VolunteerRecord => ({
  id,
  name: toStringValue(data.name),
  email: toStringValue(data.email),
  phone: toStringValue(data.phone),
  status: toStringValue(data.status) || "Pending",
  joinedDate: toStringValue(data.joinedDate) || today(),
  tasks: ensureArray<VolunteerTask>(data.tasks),
  documents: ensureArray<VolunteerDocument>(data.documents),
  ...data,
});

const normalizeLibraryTask = (data: DocumentData, id: string): LibraryTask => ({
  id,
  title: toStringValue(data.title),
  description: toStringValue(data.description),
  durationDays: Number(data.durationDays || 0),
});

const normalizeNotification = (data: DocumentData, id: string): Notification => ({
  id,
  userId: toStringValue(data.userId),
  title: toStringValue(data.title),
  message: toStringValue(data.message),
  date: toStringValue(data.date) || today(),
  read: Boolean(data.read),
  type: (data.type as Notification["type"]) || "general",
});

const normalizeFeedback = (data: DocumentData, id: string): FeedbackRecord => ({
  id,
  name: data.name ? String(data.name) : undefined,
  email: data.email ? String(data.email) : undefined,
  message: toStringValue(data.message),
  category: data.category ? String(data.category) : undefined,
  date: data.date ? String(data.date) : today(),
  status: data.status ? String(data.status) : undefined,
  ...data,
});

const normalizeLeader = (data: DocumentData, id: string): Leader => ({
  id,
  name: toStringValue(data.name),
  role: toStringValue(data.role),
  profile: toStringValue(data.profile),
  image: toStringValue(data.image),
});

let programs: Program[] = [];
let campaigns: Campaign[] = [];
let users: User[] = [];
let donations: Donation[] = [];
let news: NewsPost[] = [];
let expenditures: Expenditure[] = [];
let otherIncome: OtherIncome[] = [];
let volunteers: VolunteerRecord[] = [];
let pageContent: PageContent = { ...initialPageContent };
let taskLibrary: LibraryTask[] = [];
let notifications: Notification[] = [];
let feedback: FeedbackRecord[] = [];
let contactMessages: FeedbackRecord[] = [];
let leaders: Leader[] = [];
let systemSettings: Record<string, unknown> = {
  siteName: BRAND.fullName,
  maintenanceMode: false,
  allowDonorSignups: true,
  allowVolunteerApplications: true,
  notificationEmails: 'admin@naanghirisa.org',
  primaryCurrency: 'USD',
  sessionTimeout: 60,
  footerSocialLinks: '',
  contactHours: 'Mon - Fri, 8:00 AM - 5:00 PM',
  publicRegistrationEnabled: true,
};
const storeListeners = new Set<() => void>();
const notifyStoreChange = () => { storeListeners.forEach(listener => listener()); };
export const subscribeStoreUpdates = (listener: () => void) => {
  storeListeners.add(listener);
  return () => storeListeners.delete(listener);
};

export let mockPrograms: Program[] = [];
export let mockCampaigns: Campaign[] = [];
export let mockNews: NewsPost[] = [];
export let mockDonations: Donation[] = [];
export const mockPartners: Partner[] = [];
export let mockLeaders: Leader[] = [];
export let mockStudents: Student[] = [];


let publicListenersStarted = false;
let privateListenersStarted = false;

const isAdminRole = (role: unknown) => [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(role as UserRole);

const syncLegacyExports = () => {

  mockPrograms = programs;
  mockCampaigns = campaigns;
  mockNews = news;
  mockDonations = donations;
  mockLeaders = leaders;
  mockStudents = [];
  notifyStoreChange();
};

const sortByNewest = <T,>(items: T[]) =>
  [...items].sort((a: any, b: any) => {
    const aTime = new Date(a.updatedAt || a.createdAt || a.date || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || b.date || 0).getTime();
    return bTime - aTime;
  }) as T[];

const attachListener = <T>(
  label: string,
  source: any,
  normalize: (data: DocumentData, id: string) => T,
  setter: (items: T[]) => void,
) => {
  if (!db || !isFirebaseConfigured) return;
  onSnapshot(
    source,
    snapshot => {
      setter(snapshot.docs.map((docSnap: any) => normalize(docSnap.data(), docSnap.id)));
    },
    error => {
      console.warn(`Firestore listener failed for ${label}.`, error);
    },
  );
};

export const startPrivateListeners = (role?: UserRole) => {
  if (privateListenersStarted || !db || !isFirebaseConfigured || !isAdminRole(role)) return;
  privateListenersStarted = true;

  attachListener("users", query(collection(db, "users"), orderBy("updatedAt", "desc")), normalizeUser, items => {
    users = items;
    notifyStoreChange();
  });
  attachListener("expenditures", query(collection(db, "expenditures"), orderBy("updatedAt", "desc")), normalizeExpenditure, items => {
    expenditures = items;
    notifyStoreChange();
  });
  attachListener("otherIncome", query(collection(db, "otherIncome"), orderBy("updatedAt", "desc")), normalizeOtherIncome, items => {
    otherIncome = items;
    notifyStoreChange();
  });
  attachListener("volunteers", query(collection(db, "volunteers"), orderBy("updatedAt", "desc")), normalizeVolunteer, items => {
    volunteers = items;
    notifyStoreChange();
  });
  attachListener("taskLibrary", query(collection(db, "taskLibrary"), orderBy("updatedAt", "desc")), normalizeLibraryTask, items => {
    taskLibrary = items;
    notifyStoreChange();
  });
  attachListener("notifications", query(collection(db, "notifications"), orderBy("updatedAt", "desc")), normalizeNotification, items => {
    notifications = items;
    notifyStoreChange();
  });
  attachListener("feedback", query(collection(db, "feedback"), orderBy("updatedAt", "desc")), normalizeFeedback, items => {
    feedback = items;
    contactMessages = items;
    notifyStoreChange();
  });
};

const startPublicListeners = () => {
  if (publicListenersStarted || !db || !isFirebaseConfigured) return;
  publicListenersStarted = true;

  attachListener("programs", query(collection(db, "programs"), orderBy("updatedAt", "desc")), normalizeProgram, items => {
    programs = items;
    syncLegacyExports();
    notifyStoreChange();
  });
  attachListener("campaigns", query(collection(db, "campaigns"), orderBy("updatedAt", "desc")), normalizeCampaign, items => {
    campaigns = items;
    syncLegacyExports();
    notifyStoreChange();
  });
  attachListener("donations", query(collection(db, "donations"), orderBy("updatedAt", "desc")), normalizeDonation, items => {
    donations = items;
    syncLegacyExports();
    notifyStoreChange();
  });
  attachListener("news", query(collection(db, "news"), orderBy("updatedAt", "desc")), normalizeNews, items => {
    news = items;
    syncLegacyExports();
    notifyStoreChange();
  });
  attachListener("leaders", query(collection(db, "leaders"), orderBy("updatedAt", "desc")), normalizeLeader, items => {
    leaders = items;
    syncLegacyExports();
    notifyStoreChange();
  });
  attachListener("approved expenditures", query(collection(db, "expenditures"), where("status", "==", "Approved")), normalizeExpenditure, items => {
    expenditures = items;
    notifyStoreChange();
  });

  onSnapshot(
    doc(db, "site", "content"),
    snap => {
      if (snap.exists()) {
        pageContent = { ...initialPageContent, ...(snap.data() as PageContentRecord) };
      } else {
        pageContent = { ...initialPageContent };
      }
      void updateTotals(false);
      notifyStoreChange();
    },
    error => {
      console.warn("Firestore listener failed for site/content.", error);
    },
  );

  onSnapshot(
    doc(db, "site", "settings"),
    snap => {
      if (snap.exists()) {
        systemSettings = { ...systemSettings, ...(snap.data() as Record<string, unknown>) };
      }
      notifyStoreChange();
    },
    error => {
      console.warn("Firestore listener failed for site/settings.", error);
    },
  );
};

startPublicListeners();

const persistDoc = async (collectionName: string, id: string, data: Record<string, unknown>) => {
  if (!db || !isFirebaseConfigured) return;
  await setDoc(doc(db, collectionName, id), { ...data, updatedAt: nowIso(), createdAt: data.createdAt || nowIso() }, { merge: true });
};

const deleteById = async (collectionName: string, id: string) => {
  if (!db || !isFirebaseConfigured) return;
  await deleteDoc(doc(db, collectionName, id));
};

const bumpCampaignAmount = async (campaignId: string | undefined, amountDelta: number) => {
  if (!db || !isFirebaseConfigured || !campaignId) return;
  const ref = doc(db, "campaigns", campaignId);
  const current = campaigns.find(c => c.id === campaignId)?.amountRaised || 0;
  await updateDoc(ref, { amountRaised: Math.max(0, current + amountDelta), updatedAt: nowIso() });
};

const updateTotals = async (persist = true) => {
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

  if (persist && db && isFirebaseConfigured) {
    await setDoc(doc(db, "site", "content"), { ...pageContent, updatedAt: nowIso() }, { merge: true });
  }
  notifyStoreChange();
};

export const getSystemSettings = () => systemSettings;
export const updateSystemSettings = (settings: Record<string, unknown>) => {
  systemSettings = { ...systemSettings, ...settings };
  notifyStoreChange();
  if (db && isFirebaseConfigured) {
    void setDoc(doc(db, 'site', 'settings'), { ...systemSettings, updatedAt: nowIso() }, { merge: true });
  }
};

export const clearAllData = async () => {
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
  contactMessages = [];
  leaders = [];
  pageContent = { ...initialPageContent };
  syncLegacyExports();

  if (db && isFirebaseConfigured) {
    const collections = ["programs", "campaigns", "users", "donations", "news", "leaders", "expenditures", "otherIncome", "volunteers", "taskLibrary", "notifications", "feedback"];
    for (const name of collections) {
      const snap = await getDocs(collection(db, name));
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    }
    await setDoc(doc(db, "site", "content"), pageContent, { merge: true });
  }
};

export const getPrograms = () => programs;
export const addProgram = (program: Program) => {
  programs = sortByNewest([{ ...program, updatedAt: nowIso(), createdAt: nowIso() } as Program & Timestamped, ...programs.filter(item => item.id !== program.id)] as any);
  syncLegacyExports();
  notifyStoreChange();
  void persistDoc("programs", program.id, program as any);
};
export const updateProgram = (program: Program) => {
  programs = programs.map(item => (item.id === program.id ? { ...program, updatedAt: nowIso() } as any : item));
  syncLegacyExports();
  notifyStoreChange();
  void persistDoc("programs", program.id, program as any);
};
export const deleteProgram = (id: string) => {
  programs = programs.filter(item => item.id !== id);
  syncLegacyExports();
  void deleteById("programs", id);
};

export const getCampaigns = () => campaigns;
export const addCampaign = (campaign: Campaign) => {
  campaigns = sortByNewest([{ ...campaign, updatedAt: nowIso(), createdAt: nowIso() } as any, ...campaigns.filter(item => item.id !== campaign.id)]);
  syncLegacyExports();
  notifyStoreChange();
  void persistDoc("campaigns", campaign.id, campaign as any);
};
export const updateCampaign = (campaign: Campaign) => {
  campaigns = campaigns.map(item => (item.id === campaign.id ? { ...campaign, updatedAt: nowIso() } as any : item));
  syncLegacyExports();
  notifyStoreChange();
  void persistDoc("campaigns", campaign.id, campaign as any);
};
export const deleteCampaign = (id: string) => {
  campaigns = campaigns.filter(item => item.id !== id);
  syncLegacyExports();
  void deleteById("campaigns", id);
};

export const getDonations = () => donations;
export const addDonation = (donation: Donation) => {
  donations = sortByNewest([{ ...donation, updatedAt: nowIso(), createdAt: nowIso() } as any, ...donations.filter(item => item.id !== donation.id)]);
  syncLegacyExports();
  void persistDoc("donations", donation.id, donation as any);
  void bumpCampaignAmount(donation.campaignId, donation.amount);
  void updateTotals();
  notifyStoreChange();
};

export const getNews = () => news;
export const addNews = (post: NewsPost) => {
  news = sortByNewest([{ ...post, updatedAt: nowIso(), createdAt: nowIso() } as any, ...news.filter(item => item.id !== post.id)]);
  syncLegacyExports();
  notifyStoreChange();
  void persistDoc("news", post.id, post as any);
};
export const updateNews = (post: NewsPost) => {
  news = news.map(item => (item.id === post.id ? { ...post, updatedAt: nowIso() } as any : item));
  syncLegacyExports();
  notifyStoreChange();
  void persistDoc("news", post.id, post as any);
};
export const deleteNews = (id: string) => {
  news = news.filter(item => item.id !== id);
  syncLegacyExports();
  void deleteById("news", id);
};

export const getUsers = () => users;
export const addUser = (user: User) => {
  const profile: User = { ...user, phone: user.phone || "", avatar: user.avatar || "" };
  const persistedUser = isFirebaseConfigured ? (() => {
    const { password, ...rest } = profile as User & { password?: string };
    return rest as User;
  })() : profile;
  users = sortByNewest([{ ...persistedUser, updatedAt: nowIso(), createdAt: nowIso() } as any, ...users.filter(item => item.id !== user.id)]);
  if (isFirebaseConfigured) void persistDoc("users", user.id, persistedUser as any);
  notifyStoreChange();
  return persistedUser;
};
export const updateUser = (user: User) => {
  const persistedUser = isFirebaseConfigured ? (() => {
    const { password, ...rest } = user as User & { password?: string };
    return rest as User;
  })() : user;
  users = users.map(item => (item.id === user.id ? { ...item, ...persistedUser, updatedAt: nowIso() } : item));
  if (isFirebaseConfigured) void persistDoc("users", user.id, persistedUser as any);
  notifyStoreChange();
};
export const deleteUser = (id: string) => {
  users = users.filter(item => item.id !== id);
  if (isFirebaseConfigured) void deleteById("users", id);
  notifyStoreChange();
};
export const resetUserPassword = (id: string, newPassword: string) => {
  if (!isFirebaseConfigured) void persistDoc("users", id, { password: newPassword });
  notifyStoreChange();
};

export const getExpenditures = () => expenditures;
export const addExpenditure = (expenditure: Expenditure) => {
  expenditures = sortByNewest([{ ...expenditure, updatedAt: nowIso(), createdAt: nowIso() } as any, ...expenditures.filter(item => item.id !== expenditure.id)]);
  void persistDoc("expenditures", expenditure.id, expenditure as any);
  void updateTotals();
  notifyStoreChange();
};
export const updateExpenditure = (expenditure: Expenditure) => {
  expenditures = expenditures.map(item => (item.id === expenditure.id ? { ...expenditure, updatedAt: nowIso() } as any : item));
  void persistDoc("expenditures", expenditure.id, expenditure as any);
  void updateTotals();
  notifyStoreChange();
};

export const getOtherIncome = () => otherIncome;
export const addOtherIncome = (income: OtherIncome) => {
  otherIncome = sortByNewest([{ ...income, updatedAt: nowIso(), createdAt: nowIso() } as any, ...otherIncome.filter(item => item.id !== income.id)]);
  void persistDoc("otherIncome", income.id, income as any);
  void updateTotals();
  notifyStoreChange();
};

export const getPageContent = () => pageContent;
export const updatePageContent = (content: Partial<PageContent>) => {
  pageContent = { ...pageContent, ...content };
  void updateTotals();
  if (db && isFirebaseConfigured) {
    void setDoc(doc(db, "site", "content"), { ...pageContent, updatedAt: nowIso() }, { merge: true });
  }
  notifyStoreChange();
};

export const getVolunteers = () => volunteers;
export const addVolunteerApplication = (application: any) => {
  const newVolunteer: VolunteerRecord = {
    ...application,
    id: `v_${Date.now()}`,
    status: "Pending",
    joinedDate: today(),
    tasks: [],
    documents: [],
  };
  volunteers = sortByNewest([newVolunteer, ...volunteers.filter(item => item.id !== newVolunteer.id)]);
  notifyStoreChange();
  void persistDoc("volunteers", newVolunteer.id, newVolunteer as any);
  return newVolunteer;
};
export const updateVolunteerStatus = (id: string, status: string, changes: Partial<VolunteerRecord> = {}) => {
  volunteers = volunteers.map(item => (item.id === id ? { ...item, status, ...changes, updatedAt: nowIso() } : item));
  void persistDoc("volunteers", id, volunteers.find(v => v.id === id) as any);
  notifyStoreChange();
};

export const acceptVolunteerApplication = async (id: string) => {
  const application = volunteers.find(item => item.id === id);
  if (!application) {
    throw new Error("Volunteer application not found.");
  }
  if (!application.email) {
    throw new Error("Volunteer email is required to create an account.");
  }

  const created = await createAuthUser({
    email: application.email.trim().toLowerCase(),
    password: VOLUNTEER_DEFAULT_PASSWORD,
    displayName: application.name,
    photoURL: application.avatar || "",
  });

  const accountId = created.localId;
  const portalUser = {
    id: accountId,
    name: application.name,
    email: application.email.trim().toLowerCase(),
    phone: application.phone || "",
    role: UserRole.VOLUNTEER,
    avatar: application.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(application.email || application.name || accountId)}`,
    location: application.location || "",
    workDetails: application.interests || application.message || "",
    status: "Active",
  } as User;

  await persistDoc("users", accountId, portalUser as any);

  const updatedApplication = {
    ...application,
    status: "Approved",
    accountId,
    credentialEmailSentAt: nowIso(),
    updatedAt: nowIso(),
  };

  volunteers = volunteers.map(item => (item.id === id ? updatedApplication : item));
  void persistDoc("volunteers", id, updatedApplication as any);
  notifyStoreChange();

  if (typeof window !== "undefined") {
    const subject = "Your Naanghirisa volunteer portal access";
    const body = [
      `Hello ${application.name},`,
      "",
      "Your volunteer application has been approved.",
      `Login email: ${application.email.trim().toLowerCase()}`,
      `Temporary password: ${VOLUNTEER_DEFAULT_PASSWORD}`,
      `Login page: ${window.location.origin}/login`,
      "",
      "Please sign in and change your password after your first login.",
      "",
      "Thank you for serving with Naanghirisa.",
    ].join("\n");

    const mailto = `mailto:${encodeURIComponent(application.email.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank", "noopener,noreferrer");
  }

  addNotification({
    userId: accountId,
    title: "Volunteer account created",
    message: "Your application has been approved and your portal access has been prepared.",
    type: "general",
  });

  return { accountId, password: VOLUNTEER_DEFAULT_PASSWORD };
};

export const upsertVolunteerTask = (volunteerId: string, task: VolunteerTask) => {
  volunteers = volunteers.map(volunteer => {
    if (volunteer.id !== volunteerId) return volunteer;
    const tasks = [...(volunteer.tasks || [])];
    const index = tasks.findIndex((item: VolunteerTask) => item.id === task.id);
    if (index >= 0) tasks[index] = task;
    else tasks.push(task);
    return { ...volunteer, tasks, updatedAt: nowIso() };
  });
  void persistDoc("volunteers", volunteerId, volunteers.find(v => v.id === volunteerId) as any);
  notifyStoreChange();
};
export const deleteVolunteerTask = (volunteerId: string, taskId: string) => {
  volunteers = volunteers.map(volunteer =>
    volunteer.id === volunteerId ? { ...volunteer, tasks: (volunteer.tasks || []).filter((task: VolunteerTask) => task.id !== taskId), updatedAt: nowIso() } : volunteer,
  );
  void persistDoc("volunteers", volunteerId, volunteers.find(v => v.id === volunteerId) as any);
  notifyStoreChange();
};
export const updateTaskProgress = (volunteerId: string, taskId: string, progress: number) => {
  volunteers = volunteers.map(volunteer =>
    volunteer.id === volunteerId
      ? {
          ...volunteer,
          tasks: (volunteer.tasks || []).map((task: VolunteerTask) =>
            task.id === taskId ? { ...task, progress, status: progress === 100 ? "Completed" : "In Progress" } : task,
          ),
          updatedAt: nowIso(),
        }
      : volunteer,
  );
  void persistDoc("volunteers", volunteerId, volunteers.find(v => v.id === volunteerId) as any);
  notifyStoreChange();
};
export const awardVolunteerDocument = (volunteerId: string, document: Omit<VolunteerDocument, 'id' | 'issueDate' | 'referenceNo'>) => {
  const issuedDocument: VolunteerDocument = {
    ...document,
    id: `doc_${Date.now()}`,
    issueDate: today(),
    referenceNo: `NAA-${Date.now()}`,
  };
  volunteers = volunteers.map(volunteer =>
    volunteer.id === volunteerId ? { ...volunteer, documents: [...(volunteer.documents || []), issuedDocument], updatedAt: nowIso() } : volunteer,
  );
  void persistDoc("volunteers", volunteerId, volunteers.find(v => v.id === volunteerId) as any);
  notifyStoreChange();
  return issuedDocument;
};

export const getTaskLibrary = () => taskLibrary;
export const addLibraryTask = (task: LibraryTask) => {
  const next = { ...task, id: task.id || `lib_${Date.now()}` };
  taskLibrary = sortByNewest([next as any, ...taskLibrary.filter(item => item.id !== next.id)]);
  void persistDoc("taskLibrary", next.id, next as any);
  notifyStoreChange();
};
export const deleteLibraryTask = (id: string) => {
  taskLibrary = taskLibrary.filter(item => item.id !== id);
  void deleteById("taskLibrary", id);
  notifyStoreChange();
};

export const getNotifications = (userId: string) => notifications.filter(item => item.userId === userId);
export const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'date'>) => {
  const created: Notification = {
    ...notification,
    id: `notif_${Date.now()}`,
    read: false,
    date: today(),
  };
  notifications = sortByNewest([created, ...notifications]);
  void persistDoc("notifications", created.id, created as any);
  notifyStoreChange();
  return created;
};
export const markNotificationRead = (id: string) => {
  notifications = notifications.map(item => (item.id === id ? { ...item, read: true } : item));
  const updated = notifications.find(item => item.id === id);
  if (updated) void persistDoc("notifications", id, updated as any);
  notifyStoreChange();
};

export const getFeedback = () => feedback;
export const updateFeedbackMessage = (id: string, changes: Partial<FeedbackRecord>) => {
  feedback = feedback.map(item => item.id === id ? { ...item, ...changes, updatedAt: nowIso() } as any : item);
  contactMessages = contactMessages.map(item => item.id === id ? { ...item, ...changes, updatedAt: nowIso() } as any : item);
  notifyStoreChange();
  void persistDoc('feedback', id, feedback.find(item => item.id === id) as any);
};

export const deleteFeedbackMessage = (id: string) => {
  feedback = feedback.filter(item => item.id !== id);
  contactMessages = contactMessages.filter(item => item.id !== id);
  notifyStoreChange();
  void deleteById('feedback', id);
};

export const getLeaders = () => leaders;
export const addLeader = (leader: Leader) => {
  const next = { ...leader, id: leader.id || `leader_${Date.now()}` };
  leaders = sortByNewest([next as any, ...leaders.filter(item => item.id !== next.id)]);
  syncLegacyExports();
  void persistDoc('leaders', next.id, next as any);
};
export const updateLeader = (leader: Leader) => {
  leaders = leaders.map(item => (item.id === leader.id ? { ...leader, updatedAt: nowIso() } as any : item));
  syncLegacyExports();
  notifyStoreChange();
  void persistDoc('leaders', leader.id, leader as any);
};
export const deleteLeader = (id: string) => {
  leaders = leaders.filter(item => item.id !== id);
  syncLegacyExports();
  notifyStoreChange();
  void deleteById('leaders', id);
};
export const addContactMessage = (message: Omit<FeedbackRecord, 'id' | 'date' | 'status'>) => {
  const created = {
    ...message,
    id: `msg_${Date.now()}`,
    status: 'New',
    date: today(),
    subject: message.category || (message as any).subject || 'General Inquiry',
    sender: message.name || message.email || 'Anonymous',
  } as unknown as FeedbackRecord;
  feedback = sortByNewest([created, ...feedback]);
  contactMessages = sortByNewest([created, ...contactMessages]);
  feedback = sortByNewest([created, ...feedback]);
  notifyStoreChange();
  void persistDoc('feedback', created.id, created as any);
  return created;
};
export const getContactMessages = () => contactMessages;

