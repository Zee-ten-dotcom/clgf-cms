import { useEffect, useState } from 'react';
import './App.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

type SystemUser = {
  id: string;
  member_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type AuditLog = {
  id: string;
  actor_email: string | null;
  actor_name: string | null;
  actor_role: string | null;
  action: string;
  module: string;
  entity_type: string | null;
  description: string | null;
  created_at: string;
};

type AuditSummary = {
  total_logs: number | string;
  today_logs: number | string;
  last_7_days: number | string;
  active_users: number | string;
};

type Member = {
  id: string;
  membership_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
date_of_birth: string | null;
address: string;
gender: string;
  marital_status: string;
  status: string;
};
type Ministry = {
  id: string;
  name: string;
  description: string | null;
  leader_id: string | null;
  leader_name?: string;
  status: 'ACTIVE' | 'INACTIVE';
  public_visible: boolean;
  display_order: number;
};

type HomeCell = {
  id: string;
  name: string;
  location: string | null;
  leader_id: string | null;
  leader_name?: string;
  meeting_day: string | null;
  meeting_time: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  public_visible: boolean;
  display_order: number;
};

type WeeklyService = {
  id: string;
  name: string;
  day_of_week: string;
  start_time: string;
  end_time: string | null;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  public_visible: boolean;
  display_order: number;
};

type Announcement = {
  id: string;
  title: string;
  message: string;
  announcement_type: string;
  publish_date: string;
  expiry_date: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  public_visible: boolean;
  display_order: number;
};

type AttendanceSession = {
  id: string;
  service_date: string;
  service_type: string;
  notes: string | null;
  attendance_count: number;
  event_id?: string | null;
  event_title?: string | null;
  event_type?: string | null;
  event_status?: string | null;
};

type AttendanceRecord = {
  id: string;
  session_id: string;
  member_id: string;
  status: string;
  membership_number: string;
  first_name: string;
  last_name: string;
};

type AttendanceSessionDetail = AttendanceSession & {
  records: AttendanceRecord[];
};

type MemberForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  address: string;
};
type AttendanceHistoryItem = {
  session_id: string;
  service_date: string;
  service_type: string;
  notes: string | null;
  attendance_status: string;
};


 type MemberAttendanceHistory = {
  member: {
    id: string;
    membership_number: string;
    first_name: string;
    last_name: string;
    status: string;
  };
  summary: {
    totalSessions: number;
    present: number;
    absent: number;
    notMarked: number;
    attendanceRate: number;
  };
  history: AttendanceHistoryItem[];
};

type AttendanceReport = {
  summary: {
    totalSessions: number;
    totalActiveMembers: number;
    present: number;
    absent: number;
    attendanceRate: number;
  };
  members: {
    id: string;
    membership_number: string;
    first_name: string;
    last_name: string;
    total_sessions: number;
    present: number;
    absent: number;
    not_marked: number;
    attendance_rate: number;
  }[];
};

type FinanceTransaction = {
  id: string;
  transaction_date: string;
  transaction_type: string;
  category: string;
  amount: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

type FinanceSummary = {
  period: {
    from: string | null;
    to: string | null;
  };
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  breakdown: {
    transactionType: string;
    category: string;
    total: number;
    count: number;
  }[];
};

type GivingRecord = {
  id: string;
  member_id: string | null;
  giving_date: string;
  giving_type: string;
  amount: string;
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  finance_transaction_id: string | null;
  membership_number?: string;
  first_name?: string;
  last_name?: string;
};

type GivingSummary = {
  totalGiving: number;
  givingCount: number;
  breakdown: {
    givingType: string;
    total: number;
    count: number;
  }[];
  period: {
    from: string | null;
    to: string | null;
  };
};
type ChurchEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: string | null;
  status: string;
  attendance_session_id: string | null;
  created_at: string;
  updated_at: string;
};

type ChurchSermon = {
  id: string;
  title: string;
  speaker: string;
  scripture: string | null;
  sermon_date: string;
  description: string | null;
  video_url: string | null;
  audio_url: string | null;
  notes_url: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  created_at: string;
  updated_at: string;
};

type PastoralCareRecord = {
  id: string;
  member_id: string;
  care_type: string;
  subject: string | null;
  notes: string | null;
  priority: string;
  status: string;
  assigned_leader_id: string | null;
  care_date: string;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  membership_number: string;
  first_name: string;
  last_name: string;
  assigned_leader_first_name: string | null;
  assigned_leader_last_name: string | null;
};
  
type PublicPrayerRequest = {
  id: string;
  requester_name: string;
  contact: string | null;
  prayer_request: string;
  confidential: boolean;
  status:
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'PRAYED_FOR'
    | 'FOLLOW_UP'
    | 'CLOSED';
  source: string;
  created_at: string;
  updated_at: string;
};

type ContactEnquiry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string;
  message: string;
  status:
    | 'NEW'
    | 'IN_PROGRESS'
    | 'RESPONDED'
    | 'CLOSED';
  source: string;
  created_at: string;
  updated_at: string;
};

type LeadershipAssignment = {
  id: string;
  member_id: string;
  ministry_id: string | null;
  role_title: string;
  role_type: string;
  responsibility: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  public_visible: boolean;
  display_order: number;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  membership_number: string;
  first_name: string;
  last_name: string;
  ministry_name: string | null;
};

const emptyForm: MemberForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  gender: '',
  maritalStatus: '',
  dateOfBirth: '',
  address: '',
};

function App() {
  const [authUser, setAuthUser] =
    useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loginEmail, setLoginEmail] =
    useState('admin@clgf.local');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const authFetch = (
    input: RequestInfo | URL,
    init: RequestInit = {},
  ) => {
    const token =
      accessToken ||
      localStorage.getItem('clgf_access_token') ||
      '';

    const headers = new Headers(init.headers || {});

    if (token) {
      headers.set(
        'Authorization',
        `Bearer ${token}`,
      );
    }

    return window.fetch(input, {
      ...init,
      headers,
    });
  };

  const [editingEvent, setEditingEvent] =
    useState<ChurchEvent | null>(null);

  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventStatus, setEventStatus] = useState('SCHEDULED');
  const [eventSaving, setEventSaving] = useState(false);
  const [eventError, setEventError] = useState(''); 
 const [members, setMembers] = useState<Member[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [homeCells, setHomeCells] = useState<HomeCell[]>([]);
  const [weeklyServices, setWeeklyServices] =
    useState<WeeklyService[]>([]);
  const [showWeeklyServices, setShowWeeklyServices] =
    useState(false);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);
  const [showAnnouncements, setShowAnnouncements] =
    useState(false);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceSessionDetail | null>(null);
  const [attendanceMemberSearch, setAttendanceMemberSearch] =
    useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] =
    useState<'ALL' | 'NOT_MARKED' | 'PRESENT' | 'ABSENT'>('ALL');
  const [memberAttendanceHistory, setMemberAttendanceHistory] =
    useState<MemberAttendanceHistory | null>(null);

  const [selectedMemberProfile, setSelectedMemberProfile] =
    useState<Member | null>(null);
  const [memberProfileAttendance, setMemberProfileAttendance] =
    useState<MemberAttendanceHistory | null>(null);
  const [memberProfileLeadership, setMemberProfileLeadership] =
    useState<LeadershipAssignment[]>([]);
  const [memberProfilePastoralCare, setMemberProfilePastoralCare] =
    useState<PastoralCareRecord[]>([]);
  const [memberProfileLoading, setMemberProfileLoading] =
    useState(false);
  const [memberProfileError, setMemberProfileError] =
    useState('');

  const [attendanceReport, setAttendanceReport] =
    useState<AttendanceReport | null>(null);
  const [financeTransactions, setFinanceTransactions] =
    useState<FinanceTransaction[]>([]);
  const [financeSummary, setFinanceSummary] =
    useState<FinanceSummary | null>(null);
  const [showFinance, setShowFinance] = useState(false);
  const [givingRecords, setGivingRecords] =
    useState<GivingRecord[]>([]);
  const [givingSummary, setGivingSummary] =
    useState<GivingSummary | null>(null);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [showEvents, setShowEvents] = useState(false);

  const [sermons, setSermons] = useState<ChurchSermon[]>([]);
  const [showSermons, setShowSermons] = useState(false);
  const [editingSermon, setEditingSermon] =
    useState<ChurchSermon | null>(null);

  const [sermonTitle, setSermonTitle] = useState('');
  const [sermonSpeaker, setSermonSpeaker] = useState('');
  const [sermonScripture, setSermonScripture] = useState('');
  const [sermonDate, setSermonDate] = useState('');
  const [sermonDescription, setSermonDescription] = useState('');
  const [sermonVideoUrl, setSermonVideoUrl] = useState('');
  const [sermonAudioUrl, setSermonAudioUrl] = useState('');
  const [sermonNotesUrl, setSermonNotesUrl] = useState('');
  const [sermonStatus, setSermonStatus] =
    useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [sermonFeatured, setSermonFeatured] = useState(false);
  const [sermonSaving, setSermonSaving] = useState(false);
  const [sermonError, setSermonError] = useState('');

  const [sermonVideoFile, setSermonVideoFile] =
    useState<File | null>(null);
  const [sermonAudioFile, setSermonAudioFile] =
    useState<File | null>(null);
  const [sermonNotesFile, setSermonNotesFile] =
    useState<File | null>(null);

  const [sermonVideoUploading, setSermonVideoUploading] =
    useState(false);
  const [sermonAudioUploading, setSermonAudioUploading] =
    useState(false);
  const [sermonNotesUploading, setSermonNotesUploading] =
    useState(false);

  const [pastoralCareRecords, setPastoralCareRecords] =
    useState<PastoralCareRecord[]>([]);

  const [publicPrayerRequests, setPublicPrayerRequests] =
    useState<PublicPrayerRequest[]>([]);
  const [showPublicPrayerRequests, setShowPublicPrayerRequests] =
    useState(false);
  const [publicPrayerLoading, setPublicPrayerLoading] =
    useState(false);
  const [publicPrayerError, setPublicPrayerError] =
    useState('');
  const [publicPrayerActionId, setPublicPrayerActionId] =
    useState('');

  const [contactEnquiries, setContactEnquiries] =
    useState<ContactEnquiry[]>([]);
  const [showContactEnquiries, setShowContactEnquiries] =
    useState(false);
  const [contactEnquiryLoading, setContactEnquiryLoading] =
    useState(false);
  const [contactEnquiryError, setContactEnquiryError] =
    useState('');
  const [contactEnquiryActionId, setContactEnquiryActionId] =
    useState('');

  const [leadershipAssignments, setLeadershipAssignments] =
    useState<LeadershipAssignment[]>([]);
  const [showLeadership, setShowLeadership] = useState(false);
  const [showReports, setShowReports] = useState(false);

  const [systemUsers, setSystemUsers] =
    useState<SystemUser[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [dashboardMenuOpen, setDashboardMenuOpen] =
    useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] =
    useState<AuditLog[]>([]);
  const [recentAuditLoading, setRecentAuditLoading] =
    useState(false);
  const [recentAuditError, setRecentAuditError] =
    useState('');
  const [auditSummary, setAuditSummary] =
    useState<AuditSummary | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModule, setAuditModule] = useState('');
  const [auditAction, setAuditAction] = useState('');
  const [auditFromDate, setAuditFromDate] = useState('');
  const [auditToDate, setAuditToDate] = useState('');
  const [editingSystemUser, setEditingSystemUser] =
    useState<SystemUser | null>(null);

  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('LEADER');
  const [userMemberId, setUserMemberId] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userSaving, setUserSaving] = useState(false);
  const [userError, setUserError] = useState('');
  const [reportPrintMode, setReportPrintMode] =
    useState<'FULL' | 'ATTENDANCE' | 'FINANCIAL'>('FULL');

  const [financialReportFrom, setFinancialReportFrom] =
    useState('');
  const [financialReportTo, setFinancialReportTo] =
    useState('');

  const [editingLeadership, setEditingLeadership] =
    useState<LeadershipAssignment | null>(null);

  const [leadershipMemberId, setLeadershipMemberId] = useState('');
  const [leadershipMinistryId, setLeadershipMinistryId] = useState('');
  const [leadershipRoleTitle, setLeadershipRoleTitle] = useState('');
  const [leadershipRoleType, setLeadershipRoleType] =
    useState('CHURCH');
  const [leadershipResponsibility, setLeadershipResponsibility] =
    useState('');
  const [leadershipStatus, setLeadershipStatus] =
    useState('ACTIVE');
  const [leadershipStartDate, setLeadershipStartDate] = useState('');
  const [leadershipEndDate, setLeadershipEndDate] = useState('');
  const [leadershipPublicVisible, setLeadershipPublicVisible] =
    useState(false);
  const [leadershipDisplayOrder, setLeadershipDisplayOrder] =
    useState('0');
  const [leadershipPhotoFile, setLeadershipPhotoFile] =
    useState<File | null>(null);
  const [leadershipPhotoUploading, setLeadershipPhotoUploading] =
    useState(false);
  const [leadershipSaving, setLeadershipSaving] = useState(false);
  const [leadershipError, setLeadershipError] = useState('');
  const [showPastoralCare, setShowPastoralCare] = useState(false);

  const [editingPastoralCare, setEditingPastoralCare] =
    useState<PastoralCareRecord | null>(null);

  const [pastoralMemberId, setPastoralMemberId] = useState('');
  const [pastoralCareType, setPastoralCareType] =
    useState('Follow-up');
  const [pastoralSubject, setPastoralSubject] = useState('');
  const [pastoralNotes, setPastoralNotes] = useState('');
  const [pastoralPriority, setPastoralPriority] =
    useState('NORMAL');
  const [pastoralStatus, setPastoralStatus] = useState('OPEN');
  const [pastoralLeaderId, setPastoralLeaderId] = useState('');
  const [pastoralCareDate, setPastoralCareDate] = useState('');
  const [pastoralFollowUpDate, setPastoralFollowUpDate] =
    useState('');
  const [pastoralSaving, setPastoralSaving] = useState(false);
  const [pastoralError, setPastoralError] = useState('');

  const [pastoralFilterStatus, setPastoralFilterStatus] =
    useState('');
  const [pastoralFilterPriority, setPastoralFilterPriority] =
    useState('');
  const [pastoralFilterMember, setPastoralFilterMember] =
    useState('');
  const [pastoralFilterLeader, setPastoralFilterLeader] =
    useState('');
  const [pastoralFilterFollowUp, setPastoralFilterFollowUp] =
    useState('');

  const [eventFilterFrom, setEventFilterFrom] = useState('');
  const [eventFilterTo, setEventFilterTo] = useState('');
  const [eventFilterStatus, setEventFilterStatus] = useState('');
  const [eventFilterType, setEventFilterType] = useState('');
  const [showGiving, setShowGiving] = useState(false);
  const [givingReportFrom, setGivingReportFrom] = useState('');
  const [givingReportTo, setGivingReportTo] = useState('');
  const [editingGivingRecord, setEditingGivingRecord] =
    useState<GivingRecord | null>(null);

  const [givingMemberId, setGivingMemberId] = useState('');
  const [givingDate, setGivingDate] = useState('');
  const [givingType, setGivingType] = useState('Tithe');
  const [givingAmount, setGivingAmount] = useState('');
  const [givingPaymentMethod, setGivingPaymentMethod] =
    useState('Cash');
  const [givingReference, setGivingReference] = useState('');
  const [givingNotes, setGivingNotes] = useState('');
  const [givingSaving, setGivingSaving] = useState(false);
  const [givingError, setGivingError] = useState('');
  const [financeReportFrom, setFinanceReportFrom] = useState('');
  const [financeReportTo, setFinanceReportTo] = useState('');
  const [editingFinanceTransaction, setEditingFinanceTransaction] =
    useState<FinanceTransaction | null>(null);
  const [financeDate, setFinanceDate] = useState('');
  const [financeType, setFinanceType] = useState('INCOME');
  const [financeCategory, setFinanceCategory] = useState('');
  const [financeAmount, setFinanceAmount] = useState('');
  const [financeDescription, setFinanceDescription] = useState('');
  const [financeSaving, setFinanceSaving] = useState(false);
  const [financeError, setFinanceError] = useState('');
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceType, setAttendanceType] = useState('');
  const [attendanceNotes, setAttendanceNotes] = useState('');
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showMinistries, setShowMinistries] = useState(false);
  const [weeklyServiceName, setWeeklyServiceName] = useState('');
  const [weeklyServiceDay, setWeeklyServiceDay] = useState('Sunday');
  const [weeklyServiceStartTime, setWeeklyServiceStartTime] = useState('');
  const [weeklyServiceEndTime, setWeeklyServiceEndTime] = useState('');
  const [weeklyServiceDescription, setWeeklyServiceDescription] = useState('');
  const [weeklyServiceStatus, setWeeklyServiceStatus] =
    useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [weeklyServicePublicVisible, setWeeklyServicePublicVisible] =
    useState(false);
  const [weeklyServiceDisplayOrder, setWeeklyServiceDisplayOrder] =
    useState('0');
  const [weeklyServiceSaving, setWeeklyServiceSaving] = useState(false);
  const [weeklyServiceError, setWeeklyServiceError] = useState('');
  const [editingWeeklyService, setEditingWeeklyService] =
    useState<WeeklyService | null>(null);

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState('GENERAL');
  const [announcementPublishDate, setAnnouncementPublishDate] =
    useState('');
  const [announcementExpiryDate, setAnnouncementExpiryDate] =
    useState('');
  const [announcementStatus, setAnnouncementStatus] =
    useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [announcementPublicVisible, setAnnouncementPublicVisible] =
    useState(false);
  const [announcementDisplayOrder, setAnnouncementDisplayOrder] =
    useState('0');
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementError, setAnnouncementError] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  const [homeCellName, setHomeCellName] = useState('');
  const [homeCellLocation, setHomeCellLocation] = useState('');
  const [homeCellMeetingDay, setHomeCellMeetingDay] = useState('');
  const [homeCellMeetingTime, setHomeCellMeetingTime] = useState('');
  const [homeCellLeaderId, setHomeCellLeaderId] = useState('');
  const [homeCellStatus, setHomeCellStatus] =
    useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [homeCellPublicVisible, setHomeCellPublicVisible] =
    useState(false);
  const [homeCellDisplayOrder, setHomeCellDisplayOrder] =
    useState('0');
  const [homeCellSaving, setHomeCellSaving] = useState(false);
  const [homeCellError, setHomeCellError] = useState('');
    const [showHomeCells, setShowHomeCells] = useState(false);
  const [ministryName, setMinistryName] = useState('');
  const [ministryDescription, setMinistryDescription] = useState('');
  const [ministryStatus, setMinistryStatus] =
    useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [ministryPublicVisible, setMinistryPublicVisible] =
    useState(false);
  const [ministryDisplayOrder, setMinistryDisplayOrder] =
    useState('0');
  const [ministrySaving, setMinistrySaving] = useState(false);
  const [ministryError, setMinistryError] = useState('');
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [search, setSearch] = useState('');
const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingHomeCell, setEditingHomeCell] =
    useState<HomeCell | null>(null);
  const startEditingFinance = (
    transaction: FinanceTransaction,
  ) => {
    setEditingFinanceTransaction(transaction);
    setFinanceDate(
      transaction.transaction_date.slice(0, 10),
    );
    setFinanceType(transaction.transaction_type);
    setFinanceCategory(transaction.category);
    setFinanceAmount(String(transaction.amount));
    setFinanceDescription(
      transaction.description || '',
    );
    setFinanceError('');
  };

  const deleteFinanceTransaction = async (
    transaction: FinanceTransaction,
  ) => {
    const confirmed = window.confirm(
      `Delete "${transaction.category}" transaction?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/finance/${transaction.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to delete finance transaction',
        );
      }

      await loadFinanceTransactions();
      await loadFinanceSummary();
    } catch (err) {
      console.error(err);
      setFinanceError(
        'Unable to delete finance transaction.',
      );
    }
  };
  const saveFinanceTransaction = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (
      !financeDate ||
      !financeCategory.trim() ||
      !financeAmount
    ) {
      setFinanceError(
        'Date, category and amount are required.',
      );
      return;
    }

    const amount = Number(financeAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setFinanceError(
        'Amount must be greater than zero.',
      );
      return;
    }

    setFinanceSaving(true);
    setFinanceError('');

    try {
            const url = editingFinanceTransaction
        ? `${API_BASE_URL}/finance/${editingFinanceTransaction.id}`
        : `${API_BASE_URL}/finance`;

      const response = await authFetch(
        url,
        {
          method: editingFinanceTransaction
            ? 'PATCH'
            : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionDate: financeDate,
            transactionType: financeType,
            category: financeCategory.trim(),
            amount,
            description:
              financeDescription.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to save finance transaction',
        );
      }

      setFinanceDate('');
      setFinanceType('INCOME');
      setFinanceCategory('');
      setFinanceAmount('');
      setFinanceDescription('');

      loadFinanceTransactions();
      loadFinanceSummary();
    } catch (err) {
      console.error(err);
      setFinanceError(
        'Unable to save finance transaction.',
      );
    } finally {
      setFinanceSaving(false);
    }
  };
  const loadLeadership = () => {
    authFetch(`${API_BASE_URL}/leadership`)
      .then((response) => response.json())
      .then((data) => {
        setLeadershipAssignments(
          Array.isArray(data) ? data : [],
        );
      })
      .catch((err) => {
        console.error('Failed to load leadership:', err);
      });
  };

  const loadPastoralCare = () => {
    authFetch(`${API_BASE_URL}/pastoral-care`)
      .then((response) => response.json())
      .then((data) => {
        setPastoralCareRecords(
          Array.isArray(data) ? data : [],
        );
      })
      .catch((err) => {
        console.error('Failed to load pastoral care:', err);
      });
  };

  const loadPublicPrayerRequests = async () => {
    if (!authUser || authUser.role !== 'ADMIN') {
      return;
    }

    setPublicPrayerLoading(true);
    setPublicPrayerError('');

    try {
      const response = await authFetch(
        `${API_BASE_URL}/public-prayer-requests`,
      );

      if (!response.ok) {
        throw new Error('Failed to load prayer requests');
      }

      const data = await response.json();

      setPublicPrayerRequests(
        Array.isArray(data) ? data : [],
      );
    } catch (err) {
      console.error(
        'Failed to load public prayer requests:',
        err,
      );
      setPublicPrayerError(
        'Unable to load prayer requests.',
      );
    } finally {
      setPublicPrayerLoading(false);
    }
  };

  const updatePublicPrayerRequestStatus = async (
    request: PublicPrayerRequest,
    status: PublicPrayerRequest['status'],
  ) => {
    setPublicPrayerActionId(request.id);
    setPublicPrayerError('');

    try {
      const response = await authFetch(
        `${API_BASE_URL}/public-prayer-requests/${request.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to update prayer request',
        );
      }

      await loadPublicPrayerRequests();
    } catch (err) {
      console.error(
        'Failed to update prayer request:',
        err,
      );
      setPublicPrayerError(
        'Unable to update prayer request status.',
      );
    } finally {
      setPublicPrayerActionId('');
    }
  };

  const deletePublicPrayerRequest = async (
    request: PublicPrayerRequest,
  ) => {
    const confirmed = window.confirm(
      'Delete prayer request from "' +
        request.requester_name +
        '"?',
    );

    if (!confirmed) {
      return;
    }

    setPublicPrayerActionId(request.id);
    setPublicPrayerError('');

    try {
      const response = await authFetch(
        `${API_BASE_URL}/public-prayer-requests/${request.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to delete prayer request',
        );
      }

      await loadPublicPrayerRequests();
    } catch (err) {
      console.error(
        'Failed to delete prayer request:',
        err,
      );
      setPublicPrayerError(
        'Unable to delete prayer request.',
      );
    } finally {
      setPublicPrayerActionId('');
    }
  };


  const loadContactEnquiries = async () => {
    if (!authUser || authUser.role !== 'ADMIN') {
      return;
    }

    setContactEnquiryLoading(true);
    setContactEnquiryError('');

    try {
      const response = await authFetch(
        `${API_BASE_URL}/contact-enquiries`,
      );

      if (!response.ok) {
        throw new Error('Failed to load contact enquiries');
      }

      const data = await response.json();

      setContactEnquiries(
        Array.isArray(data) ? data : [],
      );
    } catch (err) {
      console.error(
        'Failed to load contact enquiries:',
        err,
      );
      setContactEnquiryError(
        'Unable to load contact enquiries.',
      );
    } finally {
      setContactEnquiryLoading(false);
    }
  };

  const updateContactEnquiryStatus = async (
    enquiry: ContactEnquiry,
    status: ContactEnquiry['status'],
  ) => {
    setContactEnquiryActionId(enquiry.id);
    setContactEnquiryError('');

    try {
      const response = await authFetch(
        `${API_BASE_URL}/contact-enquiries/${enquiry.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to update contact enquiry',
        );
      }

      await loadContactEnquiries();
    } catch (err) {
      console.error(
        'Failed to update contact enquiry:',
        err,
      );
      setContactEnquiryError(
        'Unable to update contact enquiry status.',
      );
    } finally {
      setContactEnquiryActionId('');
    }
  };

  const deleteContactEnquiry = async (
    enquiry: ContactEnquiry,
  ) => {
    const confirmed = window.confirm(
      'Delete contact enquiry from "' +
        enquiry.name +
        '"?',
    );

    if (!confirmed) {
      return;
    }

    setContactEnquiryActionId(enquiry.id);
    setContactEnquiryError('');

    try {
      const response = await authFetch(
        `${API_BASE_URL}/contact-enquiries/${enquiry.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to delete contact enquiry',
        );
      }

      await loadContactEnquiries();
    } catch (err) {
      console.error(
        'Failed to delete contact enquiry:',
        err,
      );
      setContactEnquiryError(
        'Unable to delete contact enquiry.',
      );
    } finally {
      setContactEnquiryActionId('');
    }
  };

  const loadEvents = () => {
    authFetch(`${API_BASE_URL}/events`)
      .then((response) => response.json())
      .then((data) => {
        setEvents(
          Array.isArray(data) ? data : [],
        );
      })
      .catch((err) => {
        console.error('Failed to load events:', err);
      });
  };

  const loadGivingRecords = (
    from = '',
    to = '',
  ) => {
    const params = new URLSearchParams();

    if (from) {
      params.set('from', from);
    }

    if (to) {
      params.set('to', to);
    }

    const query = params.toString();

    authFetch(
      `${API_BASE_URL}/giving${query ? `?${query}` : ''}`,
    )
      .then((response) => response.json())
      .then((data) => {
        setGivingRecords(data);
      })
      .catch((err) => {
        console.error('Failed to load giving records:', err);
      });
  };

  const loadGivingSummary = (
    from = '',
    to = '',
  ) => {
    const params = new URLSearchParams();

    if (from) {
      params.set('from', from);
    }

    if (to) {
      params.set('to', to);
    }

    const query = params.toString();

    authFetch(
      `${API_BASE_URL}/giving/summary${query ? `?${query}` : ''}`,
    )
      .then((response) => response.json())
      .then((data) => {
        setGivingSummary(data);
      })
      .catch((err) => {
        console.error('Failed to load giving summary:', err);
      });
  };

  const startEditingGiving = (
    record: GivingRecord,
  ) => {
    setEditingGivingRecord(record);
    setGivingMemberId(record.member_id || '');
    setGivingDate(record.giving_date.slice(0, 10));
    setGivingType(record.giving_type);
    setGivingAmount(String(record.amount));
    setGivingPaymentMethod(
      record.payment_method || 'Cash',
    );
    setGivingReference(
      record.reference_number || '',
    );
    setGivingNotes(record.notes || '');
    setGivingError('');
  };

  const cancelEditingGiving = () => {
    setEditingGivingRecord(null);
    setGivingMemberId('');
    setGivingDate('');
    setGivingType('Tithe');
    setGivingAmount('');
    setGivingPaymentMethod('Cash');
    setGivingReference('');
    setGivingNotes('');
    setGivingError('');
  };

  const deleteGivingRecord = async (
    record: GivingRecord,
  ) => {
    const confirmed = window.confirm(
      `Delete this ${record.giving_type} giving record?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/giving/${record.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete giving record');
      }

      if (editingGivingRecord?.id === record.id) {
        cancelEditingGiving();
      }

      loadGivingRecords();
      loadGivingSummary();
      loadFinanceTransactions();
      loadFinanceSummary();
    } catch (err) {
      console.error(err);
      setGivingError(
        'Unable to delete giving record.',
      );
    }
  };

  const saveGivingRecord = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (
      !givingDate ||
      !givingType.trim() ||
      !givingAmount
    ) {
      setGivingError(
        'Giving date, type and amount are required.',
      );
      return;
    }

    const amount = Number(givingAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setGivingError(
        'Amount must be greater than zero.',
      );
      return;
    }

    setGivingSaving(true);
    setGivingError('');

    try {
      const url = editingGivingRecord
        ? `${API_BASE_URL}/giving/${editingGivingRecord.id}`
        : `${API_BASE_URL}/giving`;

      const response = await authFetch(
        url,
        {
          method: editingGivingRecord
            ? 'PATCH'
            : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memberId: givingMemberId || undefined,
            givingDate,
            givingType,
            amount,
            paymentMethod:
              givingPaymentMethod || undefined,
            referenceNumber:
              givingReference.trim() || undefined,
            notes: givingNotes.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to save giving record');
      }

      setGivingMemberId('');
      setGivingDate('');
      setGivingType('Tithe');
      setGivingAmount('');
      setGivingPaymentMethod('Cash');
      setGivingReference('');
      setGivingNotes('');
      setEditingGivingRecord(null);

      loadGivingRecords();
      loadGivingSummary();

      loadFinanceTransactions();
      loadFinanceSummary();
    } catch (err) {
      console.error(err);
      setGivingError(
        'Unable to save giving record.',
      );
    } finally {
      setGivingSaving(false);
    }
  };
    const loadFinanceTransactions = (
    from = '',
    to = '',
  ) => {
    const params = new URLSearchParams();

    if (from) {
      params.set('from', from);
    }

    if (to) {
      params.set('to', to);
    }

    const query = params.toString();

    authFetch(
      `${API_BASE_URL}/finance${
        query ? `?${query}` : ''
      }`,
    )
      .then((response) => response.json())
      .then((data) => {
        setFinanceTransactions(data);
      })
      .catch((err) => {
        console.error(
          'Failed to load finance transactions:',
          err,
        );
      });
  };

  const loadFinanceSummary = (
    from = '',
    to = '',
  ) => {
    const params = new URLSearchParams();

    if (from) {
      params.set('from', from);
    }

    if (to) {
      params.set('to', to);
    }

    const query = params.toString();

    authFetch(
      `${API_BASE_URL}/finance/summary${
        query ? `?${query}` : ''
      }`,
    )
      .then((response) => response.json())
      .then((data) => {
        setFinanceSummary(data);
      })
      .catch((err) => {
        console.error(
          'Failed to load finance summary:',
          err,
        );
      });
  };
  const printReports = () => {
    document.body.setAttribute(
      'data-report-print-mode',
      reportPrintMode,
    );

    window.print();
  };

  const generateFinancialReport = () => {
    loadFinanceSummary(
      financialReportFrom,
      financialReportTo,
    );

    loadGivingSummary(
      financialReportFrom,
      financialReportTo,
    );
  };

  const loadAttendance = () => {
    authFetch(`${API_BASE_URL}/attendance`)
      .then((response) => response.json())
      .then((data) => {
        setAttendanceSessions(data);
      })
      .catch((err) => {
        console.error("Failed to load attendance:", err);
      });
  };


  const loadWeeklyServices = () => {
    authFetch(`${API_BASE_URL}/weekly-services`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load weekly services');
        }

        return response.json();
      })
      .then((data) => {
        setWeeklyServices(data);
      })
      .catch((err) => {
        console.error('Failed to load weekly services:', err);
      });
  };


  const loadAnnouncements = () => {
    authFetch(`${API_BASE_URL}/announcements`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load announcements');
        }

        return response.json();
      })
      .then((data) => {
        setAnnouncements(data);
      })
      .catch((err) => {
        console.error('Failed to load announcements:', err);
      });
  };


  const loadHomeCells = () => {
    authFetch(`${API_BASE_URL}/home-cells`)
      .then((response) => response.json())
      .then((data) => {
        setHomeCells(data);
      })
      .catch((err) => {
        console.error("Failed to load home cells:", err);
      });
  };


  const loadMinistries = () => {
    authFetch(`${API_BASE_URL}/ministries`)
      .then((response) => response.json())
      .then((data) => {
        setMinistries(data);
      })
      .catch((err) => {
        console.error("Failed to load ministries:", err);
      });
  };


  const loadMembers = () => {
    setLoading(true);
    setError('');

    authFetch(`${API_BASE_URL}/members`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load members');
        }

        return response.json();
      })
      .then((data) => {
        setMembers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to connect to the CLGF server');
        setLoading(false);
      });
  };

  const startEditingEvent = (
    event: ChurchEvent,
  ) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventDate(event.event_date.slice(0, 10));
    setEventStartTime(
      event.start_time ? event.start_time.slice(0, 5) : '',
    );
    setEventEndTime(
      event.end_time ? event.end_time.slice(0, 5) : '',
    );
    setEventLocation(event.location || '');
    setEventType(event.event_type || '');
    setEventStatus(event.status || 'SCHEDULED');
    setEventError('');
  };

  const cancelEditingEvent = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventDescription('');
    setEventDate('');
    setEventStartTime('');
    setEventEndTime('');
    setEventLocation('');
    setEventType('');
    setEventStatus('SCHEDULED');
    setEventError('');
  };

  const saveEvent = async (
    submitEvent: React.FormEvent,
  ) => {
    submitEvent.preventDefault();

    if (!eventTitle.trim() || !eventDate) {
      setEventError(
        'Event title and event date are required.',
      );
      return;
    }

    setEventSaving(true);
    setEventError('');

    try {
      const url = editingEvent
        ? `${API_BASE_URL}/events/` + editingEvent.id
        : `${API_BASE_URL}/events`;

      const response = await authFetch(
        url,
        {
          method: editingEvent ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: eventTitle.trim(),
            description:
              eventDescription.trim() || undefined,
            eventDate,
            startTime: eventStartTime || undefined,
            endTime: eventEndTime || undefined,
            location:
              eventLocation.trim() || undefined,
            eventType:
              eventType.trim() || undefined,
            status: eventStatus,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      cancelEditingEvent();
      loadEvents();
    loadPastoralCare();
    } catch (err) {
      console.error(err);
      setEventError(
        'Unable to save event.',
      );
    } finally {
      setEventSaving(false);
    }
  };

  const deleteEvent = async (
    event: ChurchEvent,
  ) => {
    const confirmed = window.confirm(
      'Delete "' + event.title + '"?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/events/` + event.id,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      if (editingEvent?.id === event.id) {
        cancelEditingEvent();
      }

      loadEvents();
    } catch (err) {
      console.error(err);
      setEventError(
        'Unable to delete event.',
      );
    }
  };

  const loadSermons = async () => {
    try {
      const response = await authFetch(
        `${API_BASE_URL}/sermons`,
      );

      if (!response.ok) {
        throw new Error('Failed to load sermons');
      }

      const data = await response.json();

      setSermons(
        Array.isArray(data) ? data : [],
      );
    } catch (err) {
      console.error('Failed to load sermons:', err);
      setSermonError('Unable to load sermons.');
    }
  };

  const cancelEditingSermon = () => {
    setEditingSermon(null);
    setSermonTitle('');
    setSermonSpeaker('');
    setSermonScripture('');
    setSermonDate('');
    setSermonDescription('');
    setSermonVideoUrl('');
    setSermonAudioUrl('');
    setSermonNotesUrl('');
    setSermonStatus('DRAFT');
    setSermonFeatured(false);
    setSermonVideoFile(null);
    setSermonAudioFile(null);
    setSermonNotesFile(null);
    setSermonError('');
  };

  const startEditingSermon = (
    sermon: ChurchSermon,
  ) => {
    setEditingSermon(sermon);
    setSermonTitle(sermon.title);
    setSermonSpeaker(sermon.speaker);
    setSermonScripture(sermon.scripture || '');
    setSermonDate(sermon.sermon_date.slice(0, 10));
    setSermonDescription(sermon.description || '');
    setSermonVideoUrl(sermon.video_url || '');
    setSermonAudioUrl(sermon.audio_url || '');
    setSermonNotesUrl(sermon.notes_url || '');
    setSermonStatus(sermon.status);
    setSermonFeatured(sermon.featured);
    setSermonError('');
  };

  const saveSermon = async (
    submitEvent: React.FormEvent,
  ) => {
    submitEvent.preventDefault();

    if (
      !sermonTitle.trim() ||
      !sermonSpeaker.trim() ||
      !sermonDate
    ) {
      setSermonError(
        'Title, speaker and sermon date are required.',
      );
      return;
    }

    setSermonSaving(true);
    setSermonError('');

    try {
      const url = editingSermon
        ? `${API_BASE_URL}/sermons/${editingSermon.id}`
        : `${API_BASE_URL}/sermons`;

      const response = await authFetch(url, {
        method: editingSermon ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: sermonTitle.trim(),
          speaker: sermonSpeaker.trim(),
          scripture:
            sermonScripture.trim() || undefined,
          sermonDate,
          description:
            sermonDescription.trim() || undefined,
          videoUrl:
            sermonVideoUrl.trim() || undefined,
          audioUrl:
            sermonAudioUrl.trim() || undefined,
          notesUrl:
            sermonNotesUrl.trim() || undefined,
          status: sermonStatus,
          featured: sermonFeatured,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save sermon');
      }

      cancelEditingSermon();
      await loadSermons();
    } catch (err) {
      console.error(err);
      setSermonError('Unable to save sermon.');
    } finally {
      setSermonSaving(false);
    }
  };

  const uploadSermonMedia = async (
    type: 'video' | 'audio' | 'notes',
  ) => {
    if (!editingSermon) {
      setSermonError(
        'Save the sermon first before uploading files.',
      );
      return;
    }

    const file =
      type === 'video'
        ? sermonVideoFile
        : type === 'audio'
          ? sermonAudioFile
          : sermonNotesFile;

    if (!file) {
      setSermonError(
        `Choose a ${type} file first.`,
      );
      return;
    }

    const setUploading =
      type === 'video'
        ? setSermonVideoUploading
        : type === 'audio'
          ? setSermonAudioUploading
          : setSermonNotesUploading;

    setUploading(true);
    setSermonError('');

    try {
      const formData = new FormData();
      formData.append(type, file);

      const response = await authFetch(
        `${API_BASE_URL}/sermons/${editingSermon.id}/${type}`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to upload sermon ${type}`,
        );
      }

      const result = await response.json();

      setEditingSermon((current) =>
        current
          ? {
              ...current,
              video_url:
                type === 'video'
                  ? result.video_url ?? null
                  : current.video_url,
              audio_url:
                type === 'audio'
                  ? result.audio_url ?? null
                  : current.audio_url,
              notes_url:
                type === 'notes'
                  ? result.notes_url ?? null
                  : current.notes_url,
            }
          : current,
      );

      if (type === 'video') {
        setSermonVideoUrl(result.video_url ?? '');
        setSermonVideoFile(null);
      }

      if (type === 'audio') {
        setSermonAudioUrl(result.audio_url ?? '');
        setSermonAudioFile(null);
      }

      if (type === 'notes') {
        setSermonNotesUrl(result.notes_url ?? '');
        setSermonNotesFile(null);
      }

      await loadSermons();
    } catch (err) {
      console.error(
        `Failed to upload sermon ${type}:`,
        err,
      );
      setSermonError(
        `Unable to upload sermon ${type}.`,
      );
    } finally {
      setUploading(false);
    }
  };

  const removeSermonMedia = async (
    type: 'video' | 'audio' | 'notes',
  ) => {
    if (!editingSermon) {
      return;
    }

    if (
      !window.confirm(
        `Remove this sermon ${type}?`,
      )
    ) {
      return;
    }

    setSermonError('');

    try {
      const response = await authFetch(
        `${API_BASE_URL}/sermons/${editingSermon.id}/${type}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to remove sermon ${type}`,
        );
      }

      setEditingSermon((current) =>
        current
          ? {
              ...current,
              video_url:
                type === 'video'
                  ? null
                  : current.video_url,
              audio_url:
                type === 'audio'
                  ? null
                  : current.audio_url,
              notes_url:
                type === 'notes'
                  ? null
                  : current.notes_url,
            }
          : current,
      );

      if (type === 'video') {
        setSermonVideoUrl('');
      }

      if (type === 'audio') {
        setSermonAudioUrl('');
      }

      if (type === 'notes') {
        setSermonNotesUrl('');
      }

      await loadSermons();
    } catch (err) {
      console.error(
        `Failed to remove sermon ${type}:`,
        err,
      );
      setSermonError(
        `Unable to remove sermon ${type}.`,
      );
    }
  };

  const deleteSermon = async (
    sermon: ChurchSermon,
  ) => {
    const confirmed = window.confirm(
      'Delete "' + sermon.title + '"?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/sermons/${sermon.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete sermon');
      }

      if (editingSermon?.id === sermon.id) {
        cancelEditingSermon();
      }

      await loadSermons();
    } catch (err) {
      console.error(err);
      setSermonError('Unable to delete sermon.');
    }
  };

  const startEditingPastoralCare = (
    record: PastoralCareRecord,
  ) => {
    setEditingPastoralCare(record);
    setPastoralMemberId(record.member_id);
    setPastoralCareType(record.care_type);
    setPastoralSubject(record.subject || '');
    setPastoralNotes(record.notes || '');
    setPastoralPriority(record.priority);
    setPastoralStatus(record.status);
    setPastoralLeaderId(record.assigned_leader_id || '');
    setPastoralCareDate(record.care_date.slice(0, 10));
    setPastoralFollowUpDate(
      record.follow_up_date
        ? record.follow_up_date.slice(0, 10)
        : '',
    );
    setPastoralError('');
  };

  const cancelEditingPastoralCare = () => {
    setEditingPastoralCare(null);
    setPastoralMemberId('');
    setPastoralCareType('Follow-up');
    setPastoralSubject('');
    setPastoralNotes('');
    setPastoralPriority('NORMAL');
    setPastoralStatus('OPEN');
    setPastoralLeaderId('');
    setPastoralCareDate('');
    setPastoralFollowUpDate('');
    setPastoralError('');
  };

  const savePastoralCare = async (
    submitEvent: React.FormEvent,
  ) => {
    submitEvent.preventDefault();

    if (!pastoralMemberId || !pastoralCareType.trim()) {
      setPastoralError(
        'Member and care type are required.',
      );
      return;
    }

    setPastoralSaving(true);
    setPastoralError('');

    try {
      const url = editingPastoralCare
        ? `${API_BASE_URL}/pastoral-care/` +
          editingPastoralCare.id
        : `${API_BASE_URL}/pastoral-care`;

      const response = await authFetch(
        url,
        {
          method: editingPastoralCare ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memberId: pastoralMemberId,
            careType: pastoralCareType,
            subject:
              pastoralSubject.trim() || undefined,
            notes:
              pastoralNotes.trim() || undefined,
            priority: pastoralPriority,
            status: pastoralStatus,
            assignedLeaderId:
              pastoralLeaderId || undefined,
            careDate:
              pastoralCareDate || undefined,
            followUpDate:
              pastoralFollowUpDate || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to save pastoral care record',
        );
      }

      cancelEditingPastoralCare();
      loadPastoralCare();
    } catch (err) {
      console.error(err);
      setPastoralError(
        'Unable to save pastoral care record.',
      );
    } finally {
      setPastoralSaving(false);
    }
  };

  const deletePastoralCare = async (
    record: PastoralCareRecord,
  ) => {
    const confirmed = window.confirm(
      'Delete pastoral care record for ' +
        record.first_name +
        ' ' +
        record.last_name +
        '?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/pastoral-care/` +
          record.id,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to delete pastoral care record',
        );
      }

      if (editingPastoralCare?.id === record.id) {
        cancelEditingPastoralCare();
      }

      loadPastoralCare();
    } catch (err) {
      console.error(err);
      setPastoralError(
        'Unable to delete pastoral care record.',
      );
    }
  };

  const startEditingLeadership = (
    assignment: LeadershipAssignment,
  ) => {
    setEditingLeadership(assignment);
    setLeadershipMemberId(assignment.member_id);
    setLeadershipMinistryId(assignment.ministry_id || '');
    setLeadershipRoleTitle(assignment.role_title);
    setLeadershipRoleType(assignment.role_type);
    setLeadershipResponsibility(
      assignment.responsibility || '',
    );
    setLeadershipStatus(assignment.status);
    setLeadershipStartDate(
      assignment.start_date
        ? assignment.start_date.slice(0, 10)
        : '',
    );
    setLeadershipEndDate(
      assignment.end_date
        ? assignment.end_date.slice(0, 10)
        : '',
    );
    setLeadershipPublicVisible(
      assignment.public_visible ?? false,
    );
    setLeadershipDisplayOrder(
      String(assignment.display_order ?? 0),
    );
    setLeadershipPhotoFile(null);
    setLeadershipError('');
  };

  const cancelEditingLeadership = () => {
    setEditingLeadership(null);
    setLeadershipMemberId('');
    setLeadershipMinistryId('');
    setLeadershipRoleTitle('');
    setLeadershipRoleType('CHURCH');
    setLeadershipResponsibility('');
    setLeadershipStatus('ACTIVE');
    setLeadershipStartDate('');
    setLeadershipEndDate('');
    setLeadershipPublicVisible(false);
    setLeadershipDisplayOrder('0');
    setLeadershipPhotoFile(null);
    setLeadershipError('');
  };

  const saveLeadership = async (
    submitEvent: React.FormEvent,
  ) => {
    submitEvent.preventDefault();

    if (
      !leadershipMemberId ||
      !leadershipRoleTitle.trim()
    ) {
      setLeadershipError(
        'Member and role title are required.',
      );
      return;
    }

    setLeadershipSaving(true);
    setLeadershipError('');

    try {
      const url = editingLeadership
        ? `${API_BASE_URL}/leadership/` +
          editingLeadership.id
        : `${API_BASE_URL}/leadership`;

      const response = await authFetch(url, {
        method: editingLeadership ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: leadershipMemberId,
          ministryId:
            leadershipMinistryId || undefined,
          roleTitle: leadershipRoleTitle,
          roleType: leadershipRoleType,
          responsibility:
            leadershipResponsibility.trim() ||
            undefined,
          status: leadershipStatus,
          startDate:
            leadershipStartDate || undefined,
          endDate:
            leadershipEndDate || undefined,
          publicVisible:
            leadershipPublicVisible,
          displayOrder:
            Number(leadershipDisplayOrder || 0),
        }),
      });

      if (!response.ok) {
        throw new Error(
          'Failed to save leadership assignment',
        );
      }

      cancelEditingLeadership();
      loadLeadership();
    } catch (err) {
      console.error(err);
      setLeadershipError(
        'Unable to save leadership assignment.',
      );
    } finally {
      setLeadershipSaving(false);
    }
  };

  const uploadLeadershipPhoto = async () => {
    if (!editingLeadership) {
      setLeadershipError(
        'Save the leadership assignment before adding a photo.',
      );
      return;
    }

    if (!leadershipPhotoFile) {
      setLeadershipError('Choose a photo first.');
      return;
    }

    setLeadershipPhotoUploading(true);
    setLeadershipError('');

    try {
      const formData = new FormData();
      formData.append('photo', leadershipPhotoFile);

      const response = await authFetch(
        `${API_BASE_URL}/leadership/${editingLeadership.id}/photo`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error('Failed to upload leadership photo');
      }

      const result = await response.json();

      setEditingLeadership((current) =>
        current
          ? {
              ...current,
              photo_url: result.photo_url ?? null,
            }
          : current,
      );

      setLeadershipPhotoFile(null);
      loadLeadership();
    } catch (err) {
      console.error(err);
      setLeadershipError(
        'Unable to upload leader photo. Use JPG, PNG or WebP up to 5 MB.',
      );
    } finally {
      setLeadershipPhotoUploading(false);
    }
  };

  const removeLeadershipPhoto = async () => {
    if (!editingLeadership?.photo_url) {
      return;
    }

    const confirmed = window.confirm(
      'Remove this leader photo?',
    );

    if (!confirmed) {
      return;
    }

    setLeadershipPhotoUploading(true);
    setLeadershipError('');

    try {
      const response = await authFetch(
        `${API_BASE_URL}/leadership/${editingLeadership.id}/photo`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to remove leadership photo');
      }

      setEditingLeadership((current) =>
        current
          ? {
              ...current,
              photo_url: null,
            }
          : current,
      );

      setLeadershipPhotoFile(null);
      loadLeadership();
    } catch (err) {
      console.error(err);
      setLeadershipError(
        'Unable to remove leader photo.',
      );
    } finally {
      setLeadershipPhotoUploading(false);
    }
  };

  const deleteLeadership = async (
    assignment: LeadershipAssignment,
  ) => {
    const confirmed = window.confirm(
      'Delete leadership assignment for ' +
        assignment.first_name +
        ' ' +
        assignment.last_name +
        '?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/leadership/` +
          assignment.id,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(
          'Failed to delete leadership assignment',
        );
      }

      if (editingLeadership?.id === assignment.id) {
        cancelEditingLeadership();
      }

      loadLeadership();
    } catch (err) {
      console.error(err);
      setLeadershipError(
        'Unable to delete leadership assignment.',
      );
    }
  };


  const exportAuditLogs = () => {
    if (auditLogs.length === 0) {
      setAuditError('There are no activity records to export.');
      return;
    }

    const escapeCsv = (value: unknown) => {
      const textValue =
        value === null || value === undefined
          ? ''
          : String(value);

      return '"' + textValue.replace(/"/g, '""') + '"';
    };

    const headers = [
      'Date',
      'User',
      'Email',
      'Role',
      'Module',
      'Action',
      'Entity Type',
      'Description',
    ];

    const rows = auditLogs.map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.actor_name || '',
      log.actor_email || '',
      log.actor_role || '',
      log.module,
      log.action,
      log.entity_type || '',
      log.description || '',
    ]);

    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) =>
        row.map(escapeCsv).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    link.href = url;
    link.download =
      `clgf-activity-log-${today}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const loadRecentAuditLogs = async () => {
    if (!authUser || authUser.role !== 'ADMIN') return;

    setRecentAuditLoading(true);
    setRecentAuditError('');

    try {
      const params = new URLSearchParams();
      params.set('limit', '5');

      const response = await authFetch(
        `${API_BASE_URL}/audit?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error('Failed to load recent activity');
      }

      const data = await response.json();

      setRecentAuditLogs(
        Array.isArray(data) ? data : [],
      );
    } catch (err) {
      console.error(err);
      setRecentAuditError(
        'Unable to load recent activity.',
      );
    } finally {
      setRecentAuditLoading(false);
    }
  };

  const loadAuditSummary = async () => {
    if (!authUser || authUser.role !== 'ADMIN') return;

    try {
      const response = await authFetch(
        `${API_BASE_URL}/audit/summary`,
      );

      if (!response.ok) {
        throw new Error('Failed to load audit summary');
      }

      setAuditSummary(await response.json());
    } catch (err) {
      console.error(err);
      setAuditError('Unable to load activity summary.');
    }
  };

  const loadAuditLogs = async () => {
    if (!authUser || authUser.role !== 'ADMIN') return;

    setAuditLoading(true);
    setAuditError('');

    try {
      const params = new URLSearchParams();

      params.set('limit', '200');

      if (auditSearch.trim()) {
        params.set('search', auditSearch.trim());
      }

      if (auditModule) {
        params.set('module', auditModule);
      }

      if (auditAction) {
        params.set('action', auditAction);
      }

      if (auditFromDate) {
        params.set('from', auditFromDate);
      }

      if (auditToDate) {
        params.set('to', auditToDate);
      }

      const response = await authFetch(
        `${API_BASE_URL}/audit?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error('Failed to load audit log');
      }

      const data = await response.json();

      setAuditLogs(
        Array.isArray(data) ? data : [],
      );
    } catch (err) {
      console.error(err);
      setAuditError('Unable to load activity log.');
    } finally {
      setAuditLoading(false);
    }
  };

  const loadSystemUsers = async () => {
    if (!authUser || authUser.role !== 'ADMIN') {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/users`,
      );

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setSystemUsers(
        Array.isArray(data) ? data : [],
      );
      setUserError('');
    } catch (err) {
      console.error(err);
      setUserError('Unable to load users.');
    }
  };

  const resetSystemUserForm = () => {
    setEditingSystemUser(null);
    setUserFirstName('');
    setUserLastName('');
    setUserEmail('');
    setUserRole('LEADER');
    setUserMemberId('');
    setUserPassword('');
    setUserError('');
  };

  const startEditingSystemUser = (
    user: SystemUser,
  ) => {
    setEditingSystemUser(user);
    setUserFirstName(user.first_name);
    setUserLastName(user.last_name);
    setUserEmail(user.email);
    setUserRole(user.role);
    setUserMemberId(user.member_id || '');
    setUserPassword('');
    setUserError('');
  };

  const saveSystemUser = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setUserSaving(true);
    setUserError('');

    try {
      const isEditing = editingSystemUser !== null;

      const url = isEditing
        ? `${API_BASE_URL}/users/${editingSystemUser.id}`
        : `${API_BASE_URL}/users`;

      const body = isEditing
        ? {
            email: userEmail.trim(),
            firstName: userFirstName.trim(),
            lastName: userLastName.trim(),
            role: userRole,
            memberId: userMemberId || null,
          }
        : {
            email: userEmail.trim(),
            firstName: userFirstName.trim(),
            lastName: userLastName.trim(),
            role: userRole,
            memberId: userMemberId || null,
            password: userPassword,
          };

      const response = await authFetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            'Unable to save user account',
        );
      }

      resetSystemUserForm();
      await loadSystemUsers();
    } catch (err) {
      console.error(err);

      setUserError(
        err instanceof Error
          ? err.message
          : 'Unable to save user account.',
      );
    } finally {
      setUserSaving(false);
    }
  };

  const toggleSystemUserStatus = async (
    user: SystemUser,
  ) => {
    try {
      const response = await authFetch(
        `${API_BASE_URL}/users/${user.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isActive: !user.is_active,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Unable to change user status');
      }

      await loadSystemUsers();
    } catch (err) {
      console.error(err);
      setUserError('Unable to change user status.');
    }
  };

  const resetSystemUserPassword = async (
    user: SystemUser,
  ) => {
    const password = window.prompt(
      `Enter a new password for ${user.first_name} ${user.last_name}`,
    );

    if (!password) {
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/users/${user.id}/password`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Unable to reset password');
      }

      alert('Password reset successfully.');
    } catch (err) {
      console.error(err);
      setUserError('Unable to reset password.');
    }
  };

  const login = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await authFetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: loginEmail.trim(),
            password: loginPassword,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();

      setSelectedMemberProfile(null);
      setMemberProfileAttendance(null);
      setMemberProfileLeadership([]);
      setMemberProfilePastoralCare([]);
      window.scrollTo(0, 0);

      setAuthUser(data.user);
      setAccessToken(data.accessToken);

      localStorage.setItem(
        'clgf_access_token',
        data.accessToken,
      );

      localStorage.setItem(
        'clgf_auth_user',
        JSON.stringify(data.user),
      );

      setLoginPassword('');
    } catch (err) {
      console.error(err);
      setLoginError('Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('clgf_access_token');
    localStorage.removeItem('clgf_auth_user');

    setSelectedMemberProfile(null);
    setMemberProfileAttendance(null);
    setMemberProfileLeadership([]);
    setMemberProfilePastoralCare([]);

    setAuthUser(null);
    setAccessToken('');
    setLoginPassword('');
    setLoginError('');

    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const savedToken =
      localStorage.getItem('clgf_access_token');

    const savedUser =
      localStorage.getItem('clgf_auth_user');

    if (!savedToken || !savedUser) {
      return;
    }

    try {
      const parsedUser: AuthUser =
        JSON.parse(savedUser);

      setAccessToken(savedToken);
      setAuthUser(parsedUser);
    } catch (error) {
      console.error(
        'Unable to restore login session:',
        error,
      );

      localStorage.removeItem('clgf_access_token');
      localStorage.removeItem('clgf_auth_user');
    }
  }, []);

  useEffect(() => {
    if (!authUser || !accessToken) {
      return;
    }

    loadFinanceTransactions();
    loadGivingRecords();
    loadGivingSummary();
    loadFinanceSummary();

    loadEvents();
    loadPastoralCare();
    loadLeadership();
    loadMembers();
    loadMinistries();
    loadHomeCells();
    loadAttendance();

    if (authUser.role === 'ADMIN') {
      loadPublicPrayerRequests();
      loadContactEnquiries();
      loadSystemUsers();
      loadRecentAuditLogs();
      loadWeeklyServices();
      loadAnnouncements();
    }
  }, [authUser, accessToken]);

  if (!authUser || !accessToken) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-heading">
            <h1>CLGF CMS</h1>
            <h2>The City Of The Living God Fellowship</h2>
            <p>Church Management System</p>
          </div>

          <form onSubmit={login} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) =>
                  setLoginEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            {loginError && (
              <p className="login-error">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loginLoading}
            >
              {loginLoading
                ? 'Signing In...'
                : 'Sign In'}
            </button>
          </form>

          <p className="login-footer">
            Authorized access only
          </p>
        </div>
      </div>
    );
  }

  const totalMembers = members.length;

  const activeMembers = members.filter(
    (member) => member.status === 'ACTIVE',
  ).length;

  const inactiveMembers = members.filter(
    (member) => member.status !== 'ACTIVE',
  ).length;

  const totalMinistries = ministries.length;
  const totalHomeCells = homeCells.length;
  const totalAttendanceSessions = attendanceSessions.length;
  const totalLeadershipAssignments = leadershipAssignments.length;
  const activeLeadershipAssignments = leadershipAssignments.filter(
    (assignment) => assignment.status === 'ACTIVE',
  ).length;

  const totalPastoralCases = pastoralCareRecords.length;
  const openPastoralCases = pastoralCareRecords.filter(
    (record) =>
      record.status === 'OPEN' ||
      record.status === 'IN_PROGRESS' ||
      record.status === 'FOLLOW_UP',
  ).length;

  const reportTotalEvents = events.length;

  const reportFinanceIncome =
    financeSummary?.totalIncome ?? 0;
  const reportFinanceExpenses =
    financeSummary?.totalExpenses ?? 0;
  const reportFinanceBalance =
    financeSummary?.balance ?? 0;

  const reportTotalGiving =
    givingSummary?.totalGiving ?? 0;

  const filteredMembers = members.filter((member) => {
    const text = search.trim().toLowerCase();

    return (
      (member.first_name || '').toLowerCase().includes(text) ||
      (member.last_name || '').toLowerCase().includes(text) ||
      (member.membership_number || '')
        .toLowerCase()
        .includes(text) ||
      (member.phone || '').toLowerCase().includes(text) ||
      (member.email || '').toLowerCase().includes(text)
    );
  });


  const dashboardMemberSearchResults = search.trim()
    ? filteredMembers.slice(0, 5)
    : [];

  const updateForm = (
    field: keyof MemberForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAddMember = () => {
    setForm(emptyForm);
    setFormError('');
    setShowMembers(false);
    setShowAddMember(true);
  };

  const cancelAddMember = () => {
    setForm(emptyForm);
    setFormError('');
    setShowAddMember(false);
  };

  const saveMember = async (event: React.FormEvent) => {
    event.preventDefault();

    setFormError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError('First name and last name are required.');
      return;
    }

    setSaving(true);

    try {
      const response = await authFetch(
        `${API_BASE_URL}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim() || undefined,
            email: form.email.trim() || undefined,
            gender: form.gender || undefined,
            maritalStatus: form.maritalStatus || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
            address: form.address.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to create member');
      }

      await response.json();

      setForm(emptyForm);
      setShowAddMember(false);

      loadMembers();
    loadMinistries();
    loadHomeCells();
    loadAttendance();
    } catch (err) {
      console.error(err);
      setFormError(
        'Unable to save member. Please check that the CLGF server is running.',
      );
    } finally {
      setSaving(false);
    }
  };

  const deactivateMember = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate this member?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/members/${id}/deactivate`,
        {
          method: 'PATCH',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to deactivate member');
      }

      await loadMembers();
    loadMinistries();
    loadHomeCells();
    loadAttendance();
    } catch (err) {
      console.error(err);
      alert('Unable to deactivate member.');
    }
  };

  const reactivateMember = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to reactivate this member?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/members/${id}/reactivate`,
        {
          method: 'PATCH',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to reactivate member');
      }

      await loadMembers();
    loadMinistries();
    loadHomeCells();
    loadAttendance();
    } catch (err) {
      console.error(err);
      alert('Unable to reactivate member.');
    }
  };

  const editMember = (member: Member) => {
    setForm({
      firstName: member.first_name,
      lastName: member.last_name,
      phone: member.phone || '',
      email: member.email || '',
      gender: member.gender || '',
      maritalStatus: member.marital_status || '',
      dateOfBirth: member.date_of_birth
        ? member.date_of_birth.substring(0, 10)
        : '',
      address: member.address || '',
    });

    setFormError('');
    setEditingMember(member);
    setShowMembers(false);
    setShowAddMember(false);
  };

  const updateMember = async (event: React.FormEvent) => {
    event.preventDefault();

    setFormError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError('First name and last name are required.');
      return;
    }

    if (!editingMember) {
      return;
    }

    setSaving(true);

    try {
      const response = await authFetch(
        `${API_BASE_URL}/members/${editingMember.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim() || undefined,
            email: form.email.trim() || undefined,
            gender: form.gender || undefined,
            maritalStatus: form.maritalStatus || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
            address: form.address.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update member');
      }

      await response.json();

      setForm(emptyForm);
      setEditingMember(null);
      setShowAddMember(false);

      await loadMembers();
    loadMinistries();
    loadHomeCells();
    loadAttendance();
    } catch (err) {
      console.error(err);
      setFormError(
        'Unable to update member. Please check that the CLGF server is running.',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     ADD MEMBER PAGE
     ========================= */

  if ((showAddMember || editingMember) && authUser.role === 'ADMIN') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>{editingMember ? 'Edit Member' : 'Add New Member'}</h2>

<p className="welcome">
  {editingMember
    ? 'Update church membership information'
    : 'Register a new member of the fellowship'}
</p>
            </div>

            <button
              className="back-button"
              onClick={() => {
  setEditingMember(null);
  cancelAddMember();
}}
            >
              ← Dashboard
            </button>
          </div>

          <form
  className="member-form"
  onSubmit={editingMember ? updateMember : saveMember}
>
            {formError && (
              <div className="form-error">
                {formError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>

                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) =>
                    updateForm('firstName', e.target.value)
                  }
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name *</label>

                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) =>
                    updateForm('lastName', e.target.value)
                  }
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    updateForm('phone', e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateForm('email', e.target.value)
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>

                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    updateForm('dateOfBirth', e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Gender</label>

                <select
                  value={form.gender}
                  onChange={(e) =>
                    updateForm('gender', e.target.value)
                  }
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label>Marital Status</label>

                <select
                  value={form.maritalStatus}
                  onChange={(e) =>
                    updateForm(
                      'maritalStatus',
                      e.target.value,
                    )
                  }
                >
                  <option value="">Select marital status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Address</label>

                <textarea
                  value={form.address}
                  onChange={(e) =>
                    updateForm('address', e.target.value)
                  }
                  placeholder="Enter residential address"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
              onClick={cancelAddMember}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving
  ? editingMember
    ? 'Updating Member...'
    : 'Saving Member...'
  : editingMember
    ? 'Update Member'
    : 'Save Member'}
              </button>
            </div>
          </form>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     MEMBER PROFILE
     ========================= */

  if (selectedMemberProfile) {
    const activeLeadership = memberProfileLeadership.filter(
      (assignment) => assignment.status === 'ACTIVE',
    );

    const openPastoralCare = memberProfilePastoralCare.filter(
      (record) =>
        record.status === 'OPEN' ||
        record.status === 'IN_PROGRESS' ||
        record.status === 'FOLLOW_UP',
    );

    const latestPastoralCare =
      [...memberProfilePastoralCare].sort(
        (a, b) =>
          new Date(b.care_date).getTime() -
          new Date(a.care_date).getTime(),
      )[0];

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Member Profile</h2>
              <p className="welcome">
                Membership and church involvement overview
              </p>
            </div>

            <button
              type="button"
              className="back-button"
              onClick={() => {
                setSelectedMemberProfile(null);
                window.scrollTo(0, 0);
              }}
            >
              ← Members
            </button>
          </div>

          <section className="member-profile-hero">
            <div>
              <p className="member-profile-label">
                CLGF MEMBER
              </p>

              <h2>
                {selectedMemberProfile.first_name}{' '}
                {selectedMemberProfile.last_name}
              </h2>

              <p className="membership-number">
                {selectedMemberProfile.membership_number}
              </p>
            </div>

            <span
              className={
                selectedMemberProfile.status === 'ACTIVE'
                  ? 'status active'
                  : 'status inactive'
              }
            >
              {selectedMemberProfile.status}
            </span>
          </section>

          <section className="member-profile-section">
            <div className="member-profile-heading">
              <div>
                <h3>Personal Information</h3>
                <p>Contact and membership details</p>
              </div>

              {authUser.role === 'ADMIN' && (
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => {
                    const member = selectedMemberProfile;
                    setSelectedMemberProfile(null);
                    editMember(member);
                  }}
                >
                  Edit Member
                </button>
              )}
            </div>

            <div className="member-profile-grid">
              <div>
                <span>Phone</span>
                <strong>
                  {selectedMemberProfile.phone || 'Not provided'}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedMemberProfile.email || 'Not provided'}
                </strong>
              </div>

              <div>
                <span>Date of Birth</span>
                <strong>
                  {selectedMemberProfile.date_of_birth
                    ? selectedMemberProfile.date_of_birth.slice(0, 10)
                    : 'Not provided'}
                </strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>
                  {selectedMemberProfile.gender || 'Not provided'}
                </strong>
              </div>

              <div>
                <span>Marital Status</span>
                <strong>
                  {selectedMemberProfile.marital_status ||
                    'Not provided'}
                </strong>
              </div>

              <div>
                <span>Address</span>
                <strong>
                  {selectedMemberProfile.address || 'Not provided'}
                </strong>
              </div>
            </div>
          </section>

          {memberProfileLoading && (
            <div className="member-profile-loading">
              Loading church involvement...
            </div>
          )}

          {memberProfileError && (
            <p className="error">{memberProfileError}</p>
          )}

          {!memberProfileLoading && (
            <>
              <section className="member-profile-section">
                <div className="member-profile-heading">
                  <div>
                    <h3>Attendance</h3>
                    <p>Member attendance summary</p>
                  </div>
                </div>

                {memberProfileAttendance ? (
                  <>
                    <div className="member-profile-stats">
                      <div>
                        <span>Total Sessions</span>
                        <strong>
                          {memberProfileAttendance.summary.totalSessions}
                        </strong>
                      </div>

                      <div>
                        <span>Present</span>
                        <strong>
                          {memberProfileAttendance.summary.present}
                        </strong>
                      </div>

                      <div>
                        <span>Absent</span>
                        <strong>
                          {memberProfileAttendance.summary.absent}
                        </strong>
                      </div>

                      <div>
                        <span>Not Marked</span>
                        <strong>
                          {memberProfileAttendance.summary.notMarked}
                        </strong>
                      </div>

                      <div>
                        <span>Attendance Rate</span>
                        <strong>
                          {memberProfileAttendance.summary.attendanceRate}%
                        </strong>
                      </div>
                    </div>

                    <div className="member-profile-history">
                      <h4>Recent Attendance</h4>

                      {memberProfileAttendance.history.length === 0 ? (
                        <p>No attendance history yet.</p>
                      ) : (
                        memberProfileAttendance.history
                          .slice(0, 5)
                          .map((item) => (
                            <div
                              className="member-profile-history-row"
                              key={item.session_id}
                            >
                              <div>
                                <strong>{item.service_type}</strong>
                                <span>
                                  {item.service_date.slice(0, 10)}
                                </span>
                              </div>

                              <strong>
                                {item.attendance_status}
                              </strong>
                            </div>
                          ))
                      )}
                    </div>
                  </>
                ) : (
                  <p>No attendance information available.</p>
                )}
              </section>

              <section className="member-profile-section">
                <div className="member-profile-heading">
                  <div>
                    <h3>Leadership & Ministry</h3>
                    <p>Current leadership assignments</p>
                  </div>
                </div>

                {activeLeadership.length === 0 ? (
                  <p>
                    No active leadership assignment recorded.
                  </p>
                ) : (
                  <div className="member-profile-role-list">
                    {activeLeadership.map((assignment) => (
                      <div
                        className="member-profile-role"
                        key={assignment.id}
                      >
                        <div>
                          <strong>
                            {assignment.role_title}
                          </strong>
                          <span>
                            {assignment.ministry_name ||
                              'Church Leadership'}
                          </span>
                        </div>

                        {assignment.responsibility && (
                          <p>{assignment.responsibility}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="member-profile-section">
                <div className="member-profile-heading">
                  <div>
                    <h3>Pastoral Care</h3>
                    <p>
                      Care summary without private notes
                    </p>
                  </div>
                </div>

                <div className="member-profile-stats member-profile-stats-small">
                  <div>
                    <span>Total Records</span>
                    <strong>
                      {memberProfilePastoralCare.length}
                    </strong>
                  </div>

                  <div>
                    <span>Open / Follow-up</span>
                    <strong>{openPastoralCare.length}</strong>
                  </div>

                  <div>
                    <span>Latest Care Date</span>
                    <strong className="member-profile-date">
                      {latestPastoralCare
                        ? latestPastoralCare.care_date.slice(0, 10)
                        : 'None'}
                    </strong>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    );
  }

  /* =========================
     MEMBERS PAGE
     ========================= */

  if (showMembers) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Church Members</h2>

              <p className="welcome">
                Manage and view church membership records
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setShowMembers(false)}
            >
              ← Dashboard
            </button>
          </div>

          <div className="member-tools">
            <input
              type="text"
              placeholder="Search by name, membership number, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="member-count">
              {filteredMembers.length} member
              {filteredMembers.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading && <p>Loading members...</p>}

          {error && <p className="error">{error}</p>}

          {!loading &&
            !error &&
            filteredMembers.length === 0 && (
              <div className="empty">
                <div>👥</div>
                <h3>No members found</h3>
                <p>Try another search.</p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredMembers.length > 0 && (
              <div className="members-list">
                {filteredMembers.map((member) => (
                  <div
                    className="member-card"
                    key={member.id}
                  >
                    <div className="member-top">
                      <div>
                        <h3>
                          {member.first_name}{' '}
                          {member.last_name}
                        </h3>

                        <p className="membership-number">
                          {member.membership_number}
                        </p>
                      </div>

                  <span
                    className={
                      member.status === 'ACTIVE'
                        ? 'status active'
                        : 'status inactive'
                    }
                  >
                    {member.status}
                  </span>
                </div>

                <div className="member-details">
                  <p>
                    <strong>📞 Phone:</strong>{' '}
                    {member.phone || 'Not provided'}
                  </p>

                  <p>
                    <strong>✉️ Email:</strong>{' '}
                    {member.email || 'Not provided'}
                  </p>

                  <p>
                    <strong>⚥ Gender:</strong>{' '}
                    {member.gender || 'Not provided'}
                  </p>

                  <p>
                    <strong>💍 Marital Status:</strong>{' '}
                    {member.marital_status || 'Not provided'}
                  </p>

                  <p>
                    <strong>📍 Address:</strong>{' '}
                    {member.address || 'Not provided'}
                  </p>
                </div>
                <div className="member-actions">
                  <button
                    type="button"
                    className="back-button"
                    onClick={() => openMemberProfile(member)}
                  >
                    View Profile
                  </button>

                  {authUser.role === 'ADMIN' && (
                    <>
                      <button
                        className="edit-button"
                        onClick={() => editMember(member)}
                      >
                        Edit Member
                      </button>

                    {member.status === 'ACTIVE' ? (
                      <button
                        className="deactivate-button"
                        onClick={() => deactivateMember(member.id)}
                      >
                        Deactivate Member
                      </button>
                    ) : (
                      <button
                        className="reactivate-button"
                        onClick={() => reactivateMember(member.id)}
                      >
                        Reactivate Member
                      </button>
                    )}
                    </>
                  )}
                </div>
              </div>
                ))}
              </div>
            )}
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }


  const saveMinistry = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!ministryName.trim()) {
      setMinistryError('Ministry name is required.');
      return;
    }

    setMinistrySaving(true);
    setMinistryError('');

    try {
      const isEditing = !!editingMinistry;
      const url = isEditing
        ? `${API_BASE_URL}/ministries/${editingMinistry.id}`
        : `${API_BASE_URL}/ministries`;

      const response = await authFetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: ministryName.trim(),
          description: ministryDescription.trim() || null,
          status: ministryStatus,
          publicVisible: ministryPublicVisible,
          displayOrder: Number(ministryDisplayOrder) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(
          isEditing
            ? 'Failed to update ministry'
            : 'Failed to create ministry',
        );
      }

      setEditingMinistry(null);
      setMinistryName('');
      setMinistryDescription('');
      setMinistryStatus('ACTIVE');
      setMinistryPublicVisible(false);
      setMinistryDisplayOrder('0');

      await loadMinistries();
    loadHomeCells();
    loadAttendance();
    } catch (err) {
      console.error(err);
      setMinistryError(
        editingMinistry
          ? 'Unable to update ministry.'
          : 'Unable to save ministry.',
      );
    } finally {
      setMinistrySaving(false);
    }
  };

  const assignMinistryLeader = async (
    ministryId: string,
    leaderId: string,
  ) => {
    try {
      const response = await authFetch(
        `${API_BASE_URL}/ministries/${ministryId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leaderId: leaderId || null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to assign ministry leader');
      }

      await loadMinistries();
    loadHomeCells();
    loadAttendance();
    } catch (err) {
      console.error(err);
      alert('Unable to update ministry leader.');
    }
  };

  const editMinistry = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setMinistryName(ministry.name);
    setMinistryDescription(ministry.description || '');
    setMinistryStatus(ministry.status || 'ACTIVE');
    setMinistryPublicVisible(ministry.public_visible ?? false);
    setMinistryDisplayOrder(String(ministry.display_order ?? 0));
    setMinistryError('');
  };

  const cancelEditMinistry = () => {
    setEditingMinistry(null);
    setMinistryName('');
    setMinistryDescription('');
    setMinistryStatus('ACTIVE');
    setMinistryPublicVisible(false);
    setMinistryDisplayOrder('0');
    setMinistryError('');
  };

  const deleteMinistry = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this ministry?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/ministries/${id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete ministry');
      }

      await loadMinistries();
    loadHomeCells();
    loadAttendance();
    } catch (err) {
      console.error(err);
      alert('Unable to delete ministry.');
    }
  };
  const editHomeCell = (homeCell: HomeCell) => {
    setEditingHomeCell(homeCell);
    setHomeCellName(homeCell.name);
    setHomeCellLocation(homeCell.location || '');
    setHomeCellLeaderId(homeCell.leader_id || '');
    setHomeCellMeetingDay(homeCell.meeting_day || '');
    setHomeCellMeetingTime(homeCell.meeting_time || '');
    setHomeCellStatus(homeCell.status || 'ACTIVE');
    setHomeCellPublicVisible(homeCell.public_visible ?? false);
    setHomeCellDisplayOrder(String(homeCell.display_order ?? 0));
    setHomeCellError('');
  };

  const cancelEditHomeCell = () => {
    setEditingHomeCell(null);
    setHomeCellName('');
    setHomeCellLocation('');
    setHomeCellLeaderId('');
    setHomeCellMeetingDay('');
    setHomeCellMeetingTime('');
    setHomeCellStatus('ACTIVE');
    setHomeCellPublicVisible(false);
    setHomeCellDisplayOrder('0');
    setHomeCellError('');
  };  const deleteHomeCell = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this home cell?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/home-cells/${id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete home cell');
      }

      await loadHomeCells();
    loadAttendance();
    } catch (err) {
      console.error(err);
      alert('Unable to delete home cell.');
    }
  };
  const saveHomeCell = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!homeCellName.trim()) {
      setHomeCellError('Home cell name is required.');
      return;
    }

    setHomeCellSaving(true);
    setHomeCellError('');

    try {
      const isEditing = editingHomeCell !== null;

      const url = isEditing
        ? `${API_BASE_URL}/home-cells/${editingHomeCell.id}`
        : `${API_BASE_URL}/home-cells`;

      const response = await authFetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: homeCellName.trim(),
          location: homeCellLocation.trim() || undefined,
          leaderId: homeCellLeaderId || undefined,
          meetingDay: homeCellMeetingDay.trim() || undefined,
          meetingTime: homeCellMeetingTime.trim() || undefined,
          status: homeCellStatus,
          publicVisible: homeCellPublicVisible,
          displayOrder: Number(homeCellDisplayOrder) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(
          isEditing
            ? 'Failed to update home cell'
            : 'Failed to create home cell',
        );
      }

      setEditingHomeCell(null);
      setHomeCellName('');
      setHomeCellLocation('');
      setHomeCellLeaderId('');
      setHomeCellMeetingDay('');
      setHomeCellMeetingTime('');
      setHomeCellStatus('ACTIVE');
      setHomeCellPublicVisible(false);
      setHomeCellDisplayOrder('0');

      await loadHomeCells();
    loadAttendance();

      setHomeCellName('');
      setHomeCellLocation('');
      setHomeCellLeaderId('');
      setHomeCellMeetingDay('');
      setHomeCellMeetingTime('');
      setHomeCellStatus('ACTIVE');
      setHomeCellPublicVisible(false);
      setHomeCellDisplayOrder('0');

      await loadHomeCells();
    loadAttendance();
    } catch (err) {
      console.error(err);
      setHomeCellError('Unable to save home cell.');
    } finally {
      setHomeCellSaving(false);
    }
  };
  const editAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementTitle(announcement.title);
    setAnnouncementMessage(announcement.message);
    setAnnouncementType(announcement.announcement_type || 'GENERAL');
    setAnnouncementPublishDate(announcement.publish_date);
    setAnnouncementExpiryDate(announcement.expiry_date || '');
    setAnnouncementStatus(announcement.status || 'DRAFT');
    setAnnouncementPublicVisible(
      announcement.public_visible ?? false,
    );
    setAnnouncementDisplayOrder(
      String(announcement.display_order ?? 0),
    );
    setAnnouncementError('');
  };

  const cancelEditAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setAnnouncementType('GENERAL');
    setAnnouncementPublishDate('');
    setAnnouncementExpiryDate('');
    setAnnouncementStatus('DRAFT');
    setAnnouncementPublicVisible(false);
    setAnnouncementDisplayOrder('0');
    setAnnouncementError('');
  };

  const deleteAnnouncement = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this announcement?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/announcements/${id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }

      await loadAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Unable to delete announcement.');
    }
  };

  const saveAnnouncement = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!announcementTitle.trim()) {
      setAnnouncementError('Announcement title is required.');
      return;
    }

    if (!announcementMessage.trim()) {
      setAnnouncementError('Announcement message is required.');
      return;
    }

    if (!announcementPublishDate) {
      setAnnouncementError('Publish date is required.');
      return;
    }

    if (
      announcementExpiryDate &&
      announcementExpiryDate < announcementPublishDate
    ) {
      setAnnouncementError(
        'Expiry date cannot be before publish date.',
      );
      return;
    }

    setAnnouncementSaving(true);
    setAnnouncementError('');

    try {
      const isEditing = editingAnnouncement !== null;

      const url = isEditing
        ? `${API_BASE_URL}/announcements/${editingAnnouncement.id}`
        : `${API_BASE_URL}/announcements`;

      const response = await authFetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: announcementTitle.trim(),
          message: announcementMessage.trim(),
          announcementType:
            announcementType.trim() || 'GENERAL',
          publishDate: announcementPublishDate,
          expiryDate: isEditing
            ? announcementExpiryDate
            : announcementExpiryDate || undefined,
          status: announcementStatus,
          publicVisible: announcementPublicVisible,
          displayOrder:
            Number(announcementDisplayOrder) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(
          isEditing
            ? 'Failed to update announcement'
            : 'Failed to create announcement',
        );
      }

      cancelEditAnnouncement();
      await loadAnnouncements();
    } catch (err) {
      console.error(err);
      setAnnouncementError('Unable to save announcement.');
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const editWeeklyService = (service: WeeklyService) => {
    setEditingWeeklyService(service);
    setWeeklyServiceName(service.name);
    setWeeklyServiceDay(service.day_of_week);
    setWeeklyServiceStartTime(service.start_time.slice(0, 5));
    setWeeklyServiceEndTime(
      service.end_time ? service.end_time.slice(0, 5) : '',
    );
    setWeeklyServiceDescription(service.description || '');
    setWeeklyServiceStatus(service.status || 'ACTIVE');
    setWeeklyServicePublicVisible(service.public_visible ?? false);
    setWeeklyServiceDisplayOrder(String(service.display_order ?? 0));
    setWeeklyServiceError('');
  };

  const cancelEditWeeklyService = () => {
    setEditingWeeklyService(null);
    setWeeklyServiceName('');
    setWeeklyServiceDay('Sunday');
    setWeeklyServiceStartTime('');
    setWeeklyServiceEndTime('');
    setWeeklyServiceDescription('');
    setWeeklyServiceStatus('ACTIVE');
    setWeeklyServicePublicVisible(false);
    setWeeklyServiceDisplayOrder('0');
    setWeeklyServiceError('');
  };

  const deleteWeeklyService = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this weekly service?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/weekly-services/${id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete weekly service');
      }

      await loadWeeklyServices();
    } catch (err) {
      console.error(err);
      alert('Unable to delete weekly service.');
    }
  };

  const saveWeeklyService = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!weeklyServiceName.trim()) {
      setWeeklyServiceError('Service name is required.');
      return;
    }

    if (!weeklyServiceStartTime) {
      setWeeklyServiceError('Start time is required.');
      return;
    }

    setWeeklyServiceSaving(true);
    setWeeklyServiceError('');

    try {
      const isEditing = editingWeeklyService !== null;

      const url = isEditing
        ? `${API_BASE_URL}/weekly-services/${editingWeeklyService.id}`
        : `${API_BASE_URL}/weekly-services`;

      const response = await authFetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: weeklyServiceName.trim(),
          dayOfWeek: weeklyServiceDay,
          startTime: weeklyServiceStartTime,
          endTime: weeklyServiceEndTime || undefined,
          description:
            weeklyServiceDescription.trim() || undefined,
          status: weeklyServiceStatus,
          publicVisible: weeklyServicePublicVisible,
          displayOrder: Number(weeklyServiceDisplayOrder) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(
          isEditing
            ? 'Failed to update weekly service'
            : 'Failed to create weekly service',
        );
      }

      cancelEditWeeklyService();
      await loadWeeklyServices();
    } catch (err) {
      console.error(err);
      setWeeklyServiceError('Unable to save weekly service.');
    } finally {
      setWeeklyServiceSaving(false);
    }
  };

    const loadAttendanceReport = async () => {
    try {
      const params = new URLSearchParams();

      if (reportFrom) {
        params.set('from', reportFrom);
      }

      if (reportTo) {
        params.set('to', reportTo);
      }

      const query = params.toString();

      const response = await authFetch(
        `${API_BASE_URL}/attendance/report${
          query ? `?${query}` : ''
        }`,
      );

      if (!response.ok) {
        throw new Error('Failed to load attendance report');
      }

      const data = await response.json();
      setAttendanceReport(data);
    } catch (err) {
      console.error(err);
      alert('Unable to load attendance report.');
    }
  };
  async function openMemberProfile(member: Member) {
    window.scrollTo(0, 0);
    setSelectedMemberProfile(member);
    setMemberProfileLoading(true);
    setMemberProfileError('');
    setMemberProfileAttendance(null);
    setMemberProfileLeadership([]);
    setMemberProfilePastoralCare([]);

    try {
      const [
        attendanceResponse,
        leadershipResponse,
        pastoralResponse,
      ] = await Promise.all([
        authFetch(
          `${API_BASE_URL}/attendance/member/${member.id}/history`,
        ),
        authFetch(`${API_BASE_URL}/leadership`),
        authFetch(`${API_BASE_URL}/pastoral-care`),
      ]);

      if (
        !attendanceResponse.ok ||
        !leadershipResponse.ok ||
        !pastoralResponse.ok
      ) {
        throw new Error('Failed to load member profile');
      }

      const [
        attendanceData,
        leadershipData,
        pastoralData,
      ] = await Promise.all([
        attendanceResponse.json(),
        leadershipResponse.json(),
        pastoralResponse.json(),
      ]);

      setMemberProfileAttendance(attendanceData);

      setMemberProfileLeadership(
        Array.isArray(leadershipData)
          ? leadershipData.filter(
              (item) => item.member_id === member.id,
            )
          : [],
      );

      setMemberProfilePastoralCare(
        Array.isArray(pastoralData)
          ? pastoralData.filter(
              (item) => item.member_id === member.id,
            )
          : [],
      );
    } catch (err) {
      console.error(err);
      setMemberProfileError(
        'Unable to load the complete member profile.',
      );
    } finally {
      setMemberProfileLoading(false);
    }
  }

  const openMemberAttendanceHistory = async (memberId: string) => {
    try {
      const response = await authFetch(
        `${API_BASE_URL}/attendance/member/${memberId}/history`,
      );

      if (!response.ok) {
        throw new Error('Failed to load attendance history');
      }

      const data = await response.json();
      setMemberAttendanceHistory(data);
    } catch (err) {
      console.error(err);
      alert('Unable to load member attendance history.');
    }
  };
    const openAttendanceSession = async (id: string) => {
    setAttendanceLoading(true);

    try {
      const response = await authFetch(
        `${API_BASE_URL}/attendance/${id}`,
      );

      if (!response.ok) {
        throw new Error('Failed to load attendance session');
      }

      const data = await response.json();
      setSelectedAttendance(data);
    } catch (err) {
      console.error(err);
      alert('Unable to open attendance session.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  

      const markMemberAttendance = async (
    memberId: string,
    status: 'PRESENT' | 'ABSENT',
  ) => {
    if (!selectedAttendance) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/attendance/${selectedAttendance.id}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memberId,
            status,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }

      await openAttendanceSession(selectedAttendance.id);
      await loadAttendance();
    } catch (err) {
      console.error(err);
      alert('Unable to update attendance.');
    }
  };

  const removeMemberAttendance = async (memberId: string) => {
    if (!selectedAttendance) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE_URL}/attendance/${selectedAttendance.id}/members/${memberId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to remove attendance');
      }

      await openAttendanceSession(selectedAttendance.id);
      await loadAttendance();
    } catch (err) {
      console.error(err);
      alert('Unable to remove attendance.');
    }
  }; 
     
  const saveAttendanceSession = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!attendanceDate || !attendanceType.trim()) {
      setAttendanceError('Service date and service type are required.');
      return;
    }

    setAttendanceSaving(true);
    setAttendanceError('');

    try {
      const response = await authFetch(
        `${API_BASE_URL}/attendance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceDate: attendanceDate,
            serviceType: attendanceType.trim(),
            notes: attendanceNotes.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to create attendance session');
      }

      setAttendanceDate('');
      setAttendanceType('');
      setAttendanceNotes('');

      await loadAttendance();
    } catch (err) {
      setAttendanceError('Unable to create attendance session.');
    } finally {
      setAttendanceSaving(false);
    }
  };
  const now = new Date();
  const eventToday =
    now.getFullYear() +
    '-' +
    String(now.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(now.getDate()).padStart(2, '0');

  const totalEvents = events.length;

  const upcomingEventsCount = events.filter((event) => {
    const date = event.event_date.slice(0, 10);

    return (
      date >= eventToday &&
      event.status !== 'COMPLETED' &&
      event.status !== 'CANCELLED'
    );
  }).length;

  const completedEventsCount = events.filter(
    (event) => event.status === 'COMPLETED',
  ).length;

  const cancelledPostponedEventsCount = events.filter(
    (event) =>
      event.status === 'CANCELLED' ||
      event.status === 'POSTPONED',
  ).length;

  const filteredEvents = events.filter((event) => {
    const date = event.event_date.slice(0, 10);

    const matchesFrom =
      !eventFilterFrom || date >= eventFilterFrom;

    const matchesTo =
      !eventFilterTo || date <= eventFilterTo;

    const matchesStatus =
      !eventFilterStatus ||
      event.status === eventFilterStatus;

    const matchesType =
      !eventFilterType ||
      event.event_type === eventFilterType;

    return (
      matchesFrom &&
      matchesTo &&
      matchesStatus &&
      matchesType
    );
  });

  const upcomingFilteredEvents = filteredEvents.filter(
    (event) => {
      const date = event.event_date.slice(0, 10);

      return (
        date >= eventToday &&
        event.status !== 'COMPLETED' &&
        event.status !== 'CANCELLED'
      );
    },
  );

  const pastCompletedFilteredEvents = filteredEvents.filter(
    (event) => {
      const date = event.event_date.slice(0, 10);

      return (
        date < eventToday ||
        event.status === 'COMPLETED' ||
        event.status === 'CANCELLED'
      );
    },
  );

  const takeEventAttendance = async (event: ChurchEvent) => {
    try {
      setEventError('');

      const response = await authFetch(
        `${API_BASE_URL}/events/${event.id}/attendance`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error('Unable to open attendance register');
      }

      const data = await response.json();
      const sessionId = data.attendanceSession?.id;

      if (!sessionId) {
        throw new Error('Attendance session ID was not returned');
      }

      await loadEvents();
      await loadAttendance();

      setShowEvents(false);
      setShowAttendance(true);

      await openAttendanceSession(sessionId);
    } catch (err) {
      console.error(err);
      alert('Unable to open attendance for this event.');
    }
  };

  const pastoralToday = new Date();

  const pastoralTodayKey =
    pastoralToday.getFullYear() +
    '-' +
    String(pastoralToday.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(pastoralToday.getDate()).padStart(2, '0');

  const filteredPastoralCareRecords =
    pastoralCareRecords.filter(
      (record: PastoralCareRecord) => {
        const followUpDate = record.follow_up_date
          ? record.follow_up_date.slice(0, 10)
          : '';

        const matchesStatus =
          !pastoralFilterStatus ||
          (pastoralFilterStatus === 'COMPLETED_CLOSED'
            ? record.status === 'COMPLETED' ||
              record.status === 'CLOSED'
            : record.status === pastoralFilterStatus);

        const matchesPriority =
          !pastoralFilterPriority ||
          record.priority === pastoralFilterPriority;

        const matchesMember =
          !pastoralFilterMember ||
          record.member_id === pastoralFilterMember;

        const matchesLeader =
          !pastoralFilterLeader ||
          (pastoralFilterLeader === 'UNASSIGNED'
            ? !record.assigned_leader_id
            : record.assigned_leader_id === pastoralFilterLeader);

        const isClosed =
          record.status === 'COMPLETED' ||
          record.status === 'CLOSED';

        const matchesFollowUp =
          !pastoralFilterFollowUp ||
          (pastoralFilterFollowUp === 'OVERDUE' &&
            !!followUpDate &&
            followUpDate < pastoralTodayKey &&
            !isClosed) ||
          (pastoralFilterFollowUp === 'TODAY' &&
            followUpDate === pastoralTodayKey &&
            !isClosed) ||
          (pastoralFilterFollowUp === 'UPCOMING' &&
            !!followUpDate &&
            followUpDate > pastoralTodayKey &&
            !isClosed);

        return (
          matchesStatus &&
          matchesPriority &&
          matchesMember &&
          matchesLeader &&
          matchesFollowUp
        );
      },
    );

  /* =========================
     PUBLIC PRAYER REQUESTS MANAGEMENT PAGE
     ========================= */

  if (
    showPublicPrayerRequests &&
    authUser.role === 'ADMIN'
  ) {
    const openPrayerRequests =
      publicPrayerRequests.filter(
        (request) =>
          request.status === 'OPEN' ||
          request.status === 'IN_PROGRESS' ||
          request.status === 'FOLLOW_UP',
      ).length;

    const confidentialPrayerRequests =
      publicPrayerRequests.filter(
        (request) => request.confidential,
      ).length;

    const completedPrayerRequests =
      publicPrayerRequests.filter(
        (request) =>
          request.status === 'PRAYED_FOR' ||
          request.status === 'CLOSED',
      ).length;

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Prayer Requests</h2>
              <p className="welcome">
                Manage prayer requests submitted
                through the public website
              </p>
            </div>

            <div className="member-actions">
              <button
                type="button"
                className="save-button"
                onClick={loadPublicPrayerRequests}
                disabled={publicPrayerLoading}
              >
                {publicPrayerLoading
                  ? 'Refreshing...'
                  : 'Refresh'}
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() =>
                  setShowPublicPrayerRequests(false)
                }
              >
                ← Dashboard
              </button>
            </div>
          </div>

          <div className="event-stats">
            <div className="event-stat-card">
              <div>🙏</div>
              <h3>Total Requests</h3>
              <strong>{publicPrayerRequests.length}</strong>
            </div>

            <div className="event-stat-card">
              <div>🟡</div>
              <h3>Open</h3>
              <strong>{openPrayerRequests}</strong>
            </div>

            <div className="event-stat-card">
              <div>🔒</div>
              <h3>Confidential</h3>
              <strong>{confidentialPrayerRequests}</strong>
            </div>

            <div className="event-stat-card">
              <div>✅</div>
              <h3>Prayed / Closed</h3>
              <strong>{completedPrayerRequests}</strong>
            </div>
          </div>

          {publicPrayerError && (
            <div className="form-error">
              {publicPrayerError}
            </div>
          )}

          <div className="members-list">
            {publicPrayerLoading ? (
              <div className="empty">
                <div>🙏</div>
                <h3>Loading prayer requests...</h3>
              </div>
            ) : publicPrayerRequests.length === 0 ? (
              <div className="empty">
                <div>🙏</div>
                <h3>No prayer requests found</h3>
                <p>
                  New website prayer submissions
                  will appear here.
                </p>
              </div>
            ) : (
              publicPrayerRequests.map((request) => (
                <div
                  className="member-card"
                  key={request.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>{request.requester_name}</h3>
                      <p className="membership-number">
                        {request.confidential
                          ? '🔒 Confidential Prayer Request'
                          : '🙏 Prayer Request'}
                      </p>
                    </div>

                    <span className="status active">
                      {request.status.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>Contact:</strong>{' '}
                      {request.contact || 'Not provided'}
                    </p>

                    <div>
                      <strong>Prayer Request:</strong>
                      <p style={{ whiteSpace: 'pre-wrap' }}>
                        {request.prayer_request}
                      </p>
                    </div>

                    <p>
                      <strong>Confidential:</strong>{' '}
                      {request.confidential ? 'Yes' : 'No'}
                    </p>

                    <p>
                      <strong>Source:</strong>{' '}
                      {request.source}
                    </p>

                    <p>
                      <strong>Received:</strong>{' '}
                      {new Date(
                        request.created_at,
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Status</label>

                      <select
                        value={request.status}
                        disabled={
                          publicPrayerActionId === request.id
                        }
                        onChange={(e) =>
                          updatePublicPrayerRequestStatus(
                            request,
                            e.target.value as
                              PublicPrayerRequest['status'],
                          )
                        }
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">
                          In Progress
                        </option>
                        <option value="PRAYED_FOR">
                          Prayed For
                        </option>
                        <option value="FOLLOW_UP">
                          Follow-up
                        </option>
                        <option value="CLOSED">
                          Closed
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="member-actions">
                    <button
                      type="button"
                      className="deactivate-button"
                      disabled={
                        publicPrayerActionId === request.id
                      }
                      onClick={() =>
                        deletePublicPrayerRequest(request)
                      }
                    >
                      {publicPrayerActionId === request.id
                        ? 'Working...'
                        : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }


  /* =========================
     CONTACT ENQUIRIES MANAGEMENT PAGE
     ========================= */

  if (
    showContactEnquiries &&
    authUser.role === 'ADMIN'
  ) {
    const newEnquiries = contactEnquiries.filter(
      (enquiry) => enquiry.status === 'NEW',
    ).length;

    const inProgressEnquiries = contactEnquiries.filter(
      (enquiry) => enquiry.status === 'IN_PROGRESS',
    ).length;

    const completedEnquiries = contactEnquiries.filter(
      (enquiry) =>
        enquiry.status === 'RESPONDED' ||
        enquiry.status === 'CLOSED',
    ).length;

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Contact Enquiries</h2>
              <p className="welcome">
                Manage enquiries submitted through
                the public website
              </p>
            </div>

            <div className="member-actions">
              <button
                type="button"
                className="save-button"
                onClick={loadContactEnquiries}
                disabled={contactEnquiryLoading}
              >
                {contactEnquiryLoading
                  ? 'Refreshing...'
                  : 'Refresh'}
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() =>
                  setShowContactEnquiries(false)
                }
              >
                ← Dashboard
              </button>
            </div>
          </div>

          <div className="event-stats">
            <div className="event-stat-card">
              <div>✉️</div>
              <h3>Total Enquiries</h3>
              <strong>{contactEnquiries.length}</strong>
            </div>

            <div className="event-stat-card">
              <div>🟡</div>
              <h3>New</h3>
              <strong>{newEnquiries}</strong>
            </div>

            <div className="event-stat-card">
              <div>🔵</div>
              <h3>In Progress</h3>
              <strong>{inProgressEnquiries}</strong>
            </div>

            <div className="event-stat-card">
              <div>✅</div>
              <h3>Responded / Closed</h3>
              <strong>{completedEnquiries}</strong>
            </div>
          </div>

          {contactEnquiryError && (
            <div className="form-error">
              {contactEnquiryError}
            </div>
          )}

          <div className="members-list">
            {contactEnquiryLoading ? (
              <div className="empty">
                <div>✉️</div>
                <h3>Loading contact enquiries...</h3>
              </div>
            ) : contactEnquiries.length === 0 ? (
              <div className="empty">
                <div>✉️</div>
                <h3>No contact enquiries found</h3>
                <p>
                  New website enquiries will appear here.
                </p>
              </div>
            ) : (
              contactEnquiries.map((enquiry) => (
                <div
                  className="member-card"
                  key={enquiry.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>{enquiry.name}</h3>
                      <p className="membership-number">
                        {enquiry.subject}
                      </p>
                    </div>

                    <span className="status active">
                      {enquiry.status.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>Email:</strong>{' '}
                      {enquiry.email || 'Not provided'}
                    </p>

                    <p>
                      <strong>Phone:</strong>{' '}
                      {enquiry.phone || 'Not provided'}
                    </p>

                    <p>
                      <strong>Subject:</strong>{' '}
                      {enquiry.subject}
                    </p>

                    <div>
                      <strong>Message:</strong>
                      <p style={{ whiteSpace: 'pre-wrap' }}>
                        {enquiry.message}
                      </p>
                    </div>

                    <p>
                      <strong>Source:</strong>{' '}
                      {enquiry.source}
                    </p>

                    <p>
                      <strong>Received:</strong>{' '}
                      {new Date(
                        enquiry.created_at,
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Status</label>

                      <select
                        value={enquiry.status}
                        disabled={
                          contactEnquiryActionId === enquiry.id
                        }
                        onChange={(e) =>
                          updateContactEnquiryStatus(
                            enquiry,
                            e.target.value as
                              ContactEnquiry['status'],
                          )
                        }
                      >
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">
                          In Progress
                        </option>
                        <option value="RESPONDED">
                          Responded
                        </option>
                        <option value="CLOSED">
                          Closed
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="member-actions">
                    <button
                      type="button"
                      className="deactivate-button"
                      disabled={
                        contactEnquiryActionId === enquiry.id
                      }
                      onClick={() =>
                        deleteContactEnquiry(enquiry)
                      }
                    >
                      {contactEnquiryActionId === enquiry.id
                        ? 'Working...'
                        : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }


  /* =========================
     ADMIN ACTIVITY LOG PAGE
     ========================= */

  if (showAuditLog && authUser.role === 'ADMIN') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Admin Activity Log</h2>
              <p className="welcome">
                Review CMS administrative activity
              </p>
            </div>

            <div className="member-actions">
              <button
                type="button"
                className="save-button"
                onClick={() => {
                  loadAuditLogs();
                  loadAuditSummary();
                }}
              >
                Refresh
              </button>


              <button
                type="button"
                className="save-button"
                onClick={exportAuditLogs}
                disabled={auditLogs.length === 0}
              >
                Export CSV
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => setShowAuditLog(false)}
              >
                ← Dashboard
              </button>
            </div>
          </div>

          <div className="form-card">
            <h3>Filter Activity</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Search</label>
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) =>
                    setAuditSearch(e.target.value)
                  }
                  placeholder="User, description, module..."
                />
              </div>

              <div className="form-group">
                <label>Module</label>
                <select
                  value={auditModule}
                  onChange={(e) =>
                    setAuditModule(e.target.value)
                  }
                >
                  <option value="">All Modules</option>
                  <option value="USERS">Users</option>
                  <option value="MEMBERS">Members</option>
                  <option value="FINANCE">Finance</option>
                  <option value="GIVING">Giving</option>
                  <option value="ATTENDANCE">Attendance</option>
                  <option value="EVENTS">Events</option>
                  <option value="MINISTRIES">Ministries</option>
                  <option value="HOME_CELLS">Home Cells</option>
                  <option value="LEADERSHIP">Leadership</option>
                  <option value="PASTORAL_CARE">
                    Pastoral Care
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Action</label>
                <select
                  value={auditAction}
                  onChange={(e) =>
                    setAuditAction(e.target.value)
                  }
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="ACTIVATE">Activate</option>
                  <option value="DEACTIVATE">
                    Deactivate
                  </option>
                  <option value="PASSWORD_RESET">
                    Password Reset
                  </option>
                  <option value="CREATE_SESSION">
                    Create Session
                  </option>
                  <option value="MARK_ATTENDANCE">
                    Mark Attendance
                  </option>
                  <option value="REMOVE_ATTENDANCE">
                    Remove Attendance
                  </option>
                  <option value="DELETE_SESSION">
                    Delete Session
                  </option>
                  <option value="CREATE_ATTENDANCE_SESSION">
                    Create Attendance Session
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={auditFromDate}
                  onChange={(e) =>
                    setAuditFromDate(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>To Date</label>
                <input
                  type="date"
                  value={auditToDate}
                  onChange={(e) =>
                    setAuditToDate(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="member-actions">
              <button
                type="button"
                className="save-button"
                onClick={loadAuditLogs}
              >
                Apply Filters
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setAuditSearch('');
                  setAuditModule('');
                  setAuditAction('');
                  setAuditFromDate('');
                  setAuditToDate('');

                  setTimeout(() => {
                    loadAuditLogs();
                  }, 0);
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="event-stats">
            <div className="event-stat-card">
              <h3>Total Activity</h3>
              <strong>{auditSummary?.total_logs ?? 0}</strong>
            </div>

            <div className="event-stat-card">
              <h3>Today</h3>
              <strong>{auditSummary?.today_logs ?? 0}</strong>
            </div>

            <div className="event-stat-card">
              <h3>Last 7 Days</h3>
              <strong>{auditSummary?.last_7_days ?? 0}</strong>
            </div>

            <div className="event-stat-card">
              <h3>Active Users</h3>
              <strong>{auditSummary?.active_users ?? 0}</strong>
            </div>
          </div>

          {auditError && (
            <div className="form-error">
              {auditError}
            </div>
          )}

          <div className="members-list">
            {auditLoading ? (
              <div className="empty">
                <h3>Loading activity...</h3>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="empty">
                <h3>No activity records found</h3>
              </div>
            ) : (
              auditLogs.map((log) => (
                <div className="member-card" key={log.id}>
                  <div className="member-top">
                    <div>
                      <h3>
                        {log.module.replaceAll('_', ' ')}
                      </h3>

                      <p className="membership-number">
                        {log.action.replaceAll('_', ' ')}
                      </p>
                    </div>

                    <span className="status active">
                      {log.actor_role || 'SYSTEM'}
                    </span>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>User:</strong>{' '}
                      {log.actor_name ||
                        log.actor_email ||
                        'System'}
                    </p>

                    <p>
                      <strong>Entity:</strong>{' '}
                      {log.entity_type
                        ? log.entity_type.replaceAll('_', ' ')
                        : '—'}
                    </p>

                    <p>
                      <strong>Description:</strong>{' '}
                      {log.description || '—'}
                    </p>

                    <p>
                      <strong>Date:</strong>{' '}
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     USER MANAGEMENT PAGE
     ========================= */

  if (showUsers && authUser.role === 'ADMIN') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>User Management</h2>
              <p className="welcome">
                Manage CMS login accounts and access roles
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => {
                resetSystemUserForm();
                setShowUsers(false);
              }}
            >
              ← Dashboard
            </button>
          </div>

          <form
            className="member-form"
            onSubmit={saveSystemUser}
          >
            <h3>
              {editingSystemUser
                ? 'Edit User Account'
                : 'Create User Account'}
            </h3>

            {userError && (
              <div className="form-error">
                {userError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={userFirstName}
                  onChange={(e) =>
                    setUserFirstName(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={userLastName}
                  onChange={(e) =>
                    setUserLastName(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) =>
                    setUserEmail(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={userRole}
                  onChange={(e) =>
                    setUserRole(e.target.value)
                  }
                >
                  <option value="LEADER">Leader</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label>Linked Church Member</label>

                <select
                  value={userMemberId}
                  onChange={(e) =>
                    setUserMemberId(e.target.value)
                  }
                >
                  <option value="">
                    Not linked to a member
                  </option>

                  {members
                    .filter((member) => {
                      const linkedUser =
                        systemUsers.find(
                          (systemUser) =>
                            systemUser.member_id === member.id,
                        );

                      return (
                        !linkedUser ||
                        linkedUser.id === editingSystemUser?.id
                      );
                    })
                    .map((member) => (
                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.first_name}{' '}
                        {member.last_name} —{' '}
                        {member.membership_number}
                      </option>
                    ))}
                </select>
              </div>

              {!editingSystemUser && (
                <div className="form-group">
                  <label>Initial Password *</label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) =>
                      setUserPassword(e.target.value)
                    }
                    minLength={8}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-button"
                disabled={userSaving}
              >
                {userSaving
                  ? 'Saving...'
                  : editingSystemUser
                    ? 'Update User'
                    : 'Create User'}
              </button>

              {editingSystemUser && (
                <button
                  type="button"
                  className="back-button"
                  onClick={resetSystemUserForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="members-list">
            {systemUsers.length === 0 ? (
              <div className="empty">
                <div>👤</div>
                <h3>No user accounts found</h3>
              </div>
            ) : (
              systemUsers.map((user) => (
                <div
                  className="member-card"
                  key={user.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>
                        {user.first_name} {user.last_name}
                      </h3>

                      <p className="membership-number">
                        {user.email}
                      </p>
                    </div>

                    <span
                      className={
                        user.is_active
                          ? 'status active'
                          : 'status inactive'
                      }
                    >
                      {user.is_active
                        ? 'ACTIVE'
                        : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>Role:</strong>{' '}
                      {user.role}
                    </p>

                    <p>
                      <strong>Linked Member:</strong>{' '}
                      {user.member_id
                        ? (() => {
                            const linkedMember =
                              members.find(
                                (member) =>
                                  member.id === user.member_id,
                              );

                            return linkedMember
                              ? linkedMember.first_name +
                                  ' ' +
                                  linkedMember.last_name +
                                  ' — ' +
                                  linkedMember.membership_number
                              : 'Linked member not found';
                          })()
                        : 'Not linked'}
                    </p>

                    <p>
                      <strong>Created:</strong>{' '}
                      {new Date(
                        user.created_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="member-actions">
                    <button
                      className="edit-button"
                      onClick={() =>
                        startEditingSystemUser(user)
                      }
                    >
                      Edit User
                    </button>

                    {user.id !== authUser.id && (
                      <button
                        className={
                          user.is_active
                            ? 'deactivate-button'
                            : 'reactivate-button'
                        }
                        onClick={() =>
                          toggleSystemUserStatus(user)
                        }
                      >
                        {user.is_active
                          ? 'Deactivate'
                          : 'Reactivate'}
                      </button>
                    )}

                    <button
                      className="back-button"
                      onClick={() =>
                        resetSystemUserPassword(user)
                      }
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     REPORTS & ADMINISTRATION PAGE
     ========================= */

  if (showReports) {
    return (
      <div
          className={
            'app reports-page report-mode-' +
            reportPrintMode.toLowerCase()
          }
        >
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Reports & Administration</h2>
              <p className="welcome">
                Church-wide ministry and administration overview
              </p>
            </div>

            <div className="member-actions">
              <select
                value={reportPrintMode}
                onChange={(e) =>
                  setReportPrintMode(
                    e.target.value as
                      | 'FULL'
                      | 'ATTENDANCE'
                      | 'FINANCIAL',
                  )
                }
              >
                <option value="FULL">Full Church Report</option>
                <option value="ATTENDANCE">
                  Attendance Report Only
                </option>
                <option value="FINANCIAL">
                  Financial Report Only
                </option>
              </select>

              <button
                type="button"
                className="save-button"
                onClick={printReports}
              >
                🖨️ Print / Save as PDF
              </button>

              <button
                className="back-button"
                onClick={() => setShowReports(false)}
              >
                ← Dashboard
              </button>
            </div>
          </div>

          <div className="member-form">
            <h3>👥 Membership</h3>

            <div className="event-stats">
              <div className="event-stat-card">
                <div>👥</div>
                <h3>Total Members</h3>
                <strong>{totalMembers}</strong>
              </div>

              <div className="event-stat-card">
                <div>✅</div>
                <h3>Active Members</h3>
                <strong>{activeMembers}</strong>
              </div>

              <div className="event-stat-card">
                <div>⚪</div>
                <h3>Inactive Members</h3>
                <strong>{inactiveMembers}</strong>
              </div>
            </div>
          </div>

          <div className="member-form">
            <h3>⛪ Ministry & Leadership</h3>

            <div className="event-stats">
              <div className="event-stat-card">
                <div>⛪</div>
                <h3>Ministries</h3>
                <strong>{totalMinistries}</strong>
              </div>

              <div className="event-stat-card">
                <div>🏠</div>
                <h3>Home Cells</h3>
                <strong>{totalHomeCells}</strong>
              </div>

              <div className="event-stat-card">
                <div>👔</div>
                <h3>Leadership Assignments</h3>
                <strong>{totalLeadershipAssignments}</strong>
              </div>

              <div className="event-stat-card">
                <div>✅</div>
                <h3>Active Leaders</h3>
                <strong>{activeLeadershipAssignments}</strong>
              </div>
            </div>
          </div>

          <div className="member-form">
            <h3>📅 Attendance, Events & Pastoral Care</h3>

            <div className="event-stats">
              <div className="event-stat-card">
                <div>📝</div>
                <h3>Attendance Sessions</h3>
                <strong>{totalAttendanceSessions}</strong>
              </div>

              <div className="event-stat-card">
                <div>📅</div>
                <h3>Events</h3>
                <strong>{reportTotalEvents}</strong>
              </div>

              <div className="event-stat-card">
                <div>🙏</div>
                <h3>Pastoral Cases</h3>
                <strong>{totalPastoralCases}</strong>
              </div>

              <div className="event-stat-card">
                <div>🟡</div>
                <h3>Open Pastoral Cases</h3>
                <strong>{openPastoralCases}</strong>
              </div>
            </div>
          </div>

          <div className="member-form">
              <h3>💰 Financial Overview</h3>

            <div className="event-stats">
              <div className="event-stat-card">
                <div>⬆️</div>
                <h3>Total Income</h3>
                <strong>
                  R {reportFinanceIncome.toFixed(2)}
                </strong>
              </div>

              <div className="event-stat-card">
                <div>⬇️</div>
                <h3>Total Expenses</h3>
                <strong>
                  R {reportFinanceExpenses.toFixed(2)}
                </strong>
              </div>

              <div className="event-stat-card">
                <div>💰</div>
                <h3>Balance</h3>
                <strong>
                  R {reportFinanceBalance.toFixed(2)}
                </strong>
              </div>

              <div className="event-stat-card">
                <div>🎁</div>
                <h3>Total Giving</h3>
                <strong>
                  R {reportTotalGiving.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          <div className="member-form report-attendance">
            <h3>📊 Detailed Attendance Report</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>From</label>
                <input
                  type="date"
                  value={reportFrom}
                  onChange={(e) =>
                    setReportFrom(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>To</label>
                <input
                  type="date"
                  value={reportTo}
                  onChange={(e) =>
                    setReportTo(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="save-button"
                onClick={loadAttendanceReport}
              >
                Generate Attendance Report
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setReportFrom('');
                  setReportTo('');
                  setAttendanceReport(null);
                }}
              >
                Clear Report
              </button>
            </div>

            {attendanceReport && (
              <>
                <div className="event-stats">
                  <div className="event-stat-card">
                    <div>📝</div>
                    <h3>Sessions</h3>
                    <strong>
                      {attendanceReport.summary.totalSessions}
                    </strong>
                  </div>

                  <div className="event-stat-card">
                    <div>👥</div>
                    <h3>Active Members</h3>
                    <strong>
                      {attendanceReport.summary.totalActiveMembers}
                    </strong>
                  </div>

                  <div className="event-stat-card">
                    <div>✅</div>
                    <h3>Present</h3>
                    <strong>
                      {attendanceReport.summary.present}
                    </strong>
                  </div>

                  <div className="event-stat-card">
                    <div>❌</div>
                    <h3>Absent</h3>
                    <strong>
                      {attendanceReport.summary.absent}
                    </strong>
                  </div>

                  <div className="event-stat-card">
                    <div>📈</div>
                    <h3>Attendance Rate</h3>
                    <strong>
                      {attendanceReport.summary.attendanceRate}%
                    </strong>
                  </div>
                </div>

                <div className="members-list">
                  <h3>Member Attendance</h3>

                  {attendanceReport.members.length === 0 ? (
                    <p>No attendance records found for this period.</p>
                  ) : (
                    attendanceReport.members.map((member) => (
                      <div
                        className="member-card"
                        key={member.id}
                      >
                        <div className="member-top">
                          <div>
                            <h3>
                              {member.first_name}{' '}
                              {member.last_name}
                            </h3>

                            <p className="membership-number">
                              {member.membership_number}
                            </p>
                          </div>
                        </div>

                        <div className="member-details">
                          <p>
                            <strong>Sessions:</strong>{' '}
                            {member.total_sessions}
                          </p>

                          <p>
                            <strong>✅ Present:</strong>{' '}
                            {member.present}
                          </p>

                          <p>
                            <strong>❌ Absent:</strong>{' '}
                            {member.absent}
                          </p>

                          <p>
                            <strong>➖ Not Marked:</strong>{' '}
                            {member.not_marked}
                          </p>

                          <p>
                            <strong>📊 Attendance Rate:</strong>{' '}
                            {member.attendance_rate}%
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="member-form report-financial">
              <h3>💰 Detailed Financial Report</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>From</label>
                <input
                  type="date"
                  value={financialReportFrom}
                  onChange={(e) =>
                    setFinancialReportFrom(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>To</label>
                <input
                  type="date"
                  value={financialReportTo}
                  onChange={(e) =>
                    setFinancialReportTo(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="save-button"
                onClick={generateFinancialReport}
              >
                Generate Financial Report
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setFinancialReportFrom('');
                  setFinancialReportTo('');
                  loadFinanceSummary();
                  loadGivingSummary();
                }}
              >
                Clear Dates
              </button>
            </div>

            {financeSummary && (
              <>
                <div className="event-stats">
                  <div className="event-stat-card">
                    <div>⬆️</div>
                    <h3>Income</h3>
                    <strong>
                      R {financeSummary.totalIncome.toFixed(2)}
                    </strong>
                  </div>

                  <div className="event-stat-card">
                    <div>⬇️</div>
                    <h3>Expenses</h3>
                    <strong>
                      R {financeSummary.totalExpenses.toFixed(2)}
                    </strong>
                  </div>

                  <div className="event-stat-card">
                    <div>💰</div>
                    <h3>Balance</h3>
                    <strong>
                      R {financeSummary.balance.toFixed(2)}
                    </strong>
                  </div>

                  <div className="event-stat-card">
                    <div>🧾</div>
                    <h3>Transactions</h3>
                    <strong>
                      {financeSummary.transactionCount}
                    </strong>
                  </div>

                  <div className="event-stat-card">
                    <div>🎁</div>
                    <h3>Giving</h3>
                    <strong>
                      R {(givingSummary?.totalGiving ?? 0).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="members-list">
                  <h3>Finance Category Breakdown</h3>

                  {financeSummary.breakdown.length === 0 ? (
                    <p>No financial activity found for this period.</p>
                  ) : (
                    financeSummary.breakdown.map((item, index) => (
                      <div
                        className="member-details"
                        key={
                          item.transactionType +
                          '-' +
                          item.category +
                          '-' +
                          index
                        }
                      >
                        <p>
                          <strong>Type:</strong>{' '}
                          {item.transactionType}
                        </p>

                        <p>
                          <strong>Category:</strong>{' '}
                          {item.category}
                        </p>

                        <p>
                          <strong>Total:</strong>{' '}
                          R {item.total.toFixed(2)}
                        </p>

                        <p>
                          <strong>Transactions:</strong>{' '}
                          {item.count}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {givingSummary && (
                  <div className="members-list">
                    <h3>Giving Breakdown</h3>

                    {givingSummary.breakdown.length === 0 ? (
                      <p>No giving found for this period.</p>
                    ) : (
                      givingSummary.breakdown.map((item, index) => (
                        <div
                          className="member-details"
                          key={
                            item.givingType +
                            '-' +
                            index
                          }
                        >
                          <p>
                            <strong>Giving Type:</strong>{' '}
                            {item.givingType}
                          </p>

                          <p>
                            <strong>Total:</strong>{' '}
                            R {item.total.toFixed(2)}
                          </p>

                          <p>
                            <strong>Entries:</strong>{' '}
                            {item.count}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     LEADERSHIP PAGE
     ========================= */

  if (showLeadership) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Leadership</h2>
              <p className="welcome">
                Church leadership roles and ministry assignments
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setShowLeadership(false)}
            >
              ← Dashboard
            </button>
          </div>

          <div className="event-stats">
            <div className="event-stat-card">
              <div>👥</div>
              <h3>Total Assignments</h3>
              <strong>{leadershipAssignments.length}</strong>
            </div>

            <div className="event-stat-card">
              <div>✅</div>
              <h3>Active</h3>
              <strong>
                {
                  leadershipAssignments.filter(
                    (assignment) => assignment.status === 'ACTIVE',
                  ).length
                }
              </strong>
            </div>
          </div>

          {authUser.role === 'ADMIN' && (
          <div className="member-form">
            <h3>
              {editingLeadership
                ? 'Edit Leadership Assignment'
                : 'Add Leadership Assignment'}
            </h3>

            <form onSubmit={saveLeadership}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Member *</label>
                  <select
                    value={leadershipMemberId}
                    onChange={(e) =>
                      setLeadershipMemberId(e.target.value)
                    }
                    required
                  >
                    <option value="">Select Member</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} —{' '}
                        {member.membership_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ministry</label>
                  <select
                    value={leadershipMinistryId}
                    onChange={(e) =>
                      setLeadershipMinistryId(e.target.value)
                    }
                  >
                    <option value="">Church-wide / No Ministry</option>
                    {ministries.map((ministry) => (
                      <option key={ministry.id} value={ministry.id}>
                        {ministry.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Role Title *</label>
                  <input
                    type="text"
                    value={leadershipRoleTitle}
                    onChange={(e) =>
                      setLeadershipRoleTitle(e.target.value)
                    }
                    placeholder="e.g. Pastor, Minister, Youth Leader"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role Type</label>
                  <select
                    value={leadershipRoleType}
                    onChange={(e) =>
                      setLeadershipRoleType(e.target.value)
                    }
                  >
                    <option value="CHURCH">Church</option>
                    <option value="MINISTRY">Ministry</option>
                    <option value="DEPARTMENT">Department</option>
                    <option value="HOME_CELL">Home Cell</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={leadershipStatus}
                    onChange={(e) =>
                      setLeadershipStatus(e.target.value)
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ENDED">Ended</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={leadershipStartDate}
                    onChange={(e) =>
                      setLeadershipStartDate(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={leadershipEndDate}
                    onChange={(e) =>
                      setLeadershipEndDate(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={leadershipDisplayOrder}
                    onChange={(e) =>
                      setLeadershipDisplayOrder(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={leadershipPublicVisible}
                      onChange={(e) =>
                        setLeadershipPublicVisible(
                          e.target.checked,
                        )
                      }
                    />{' '}
                    Public on website
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Responsibility</label>
                <textarea
                  value={leadershipResponsibility}
                  onChange={(e) =>
                    setLeadershipResponsibility(e.target.value)
                  }
                  placeholder="Describe leadership responsibilities..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Leader Photo</label>

                {!editingLeadership ? (
                  <p>
                    Save the leadership assignment first, then edit it to add a photo.
                  </p>
                ) : (
                  <>
                    {editingLeadership.photo_url && (
                      <div style={{ marginBottom: '12px' }}>
                        <img
                          src={editingLeadership.photo_url}
                          alt={
                            editingLeadership.first_name +
                            ' ' +
                            editingLeadership.last_name
                          }
                          style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '50%',
                          }}
                        />
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) =>
                        setLeadershipPhotoFile(
                          e.target.files?.[0] || null,
                        )
                      }
                      disabled={leadershipPhotoUploading}
                    />

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={uploadLeadershipPhoto}
                        disabled={
                          leadershipPhotoUploading ||
                          !leadershipPhotoFile
                        }
                      >
                        {leadershipPhotoUploading
                          ? 'Uploading...'
                          : 'Upload Photo'}
                      </button>

                      {editingLeadership.photo_url && (
                        <button
                          type="button"
                          className="danger-button"
                          onClick={removeLeadershipPhoto}
                          disabled={leadershipPhotoUploading}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <p>
                      JPG, PNG or WebP. Maximum size 5 MB.
                    </p>
                  </>
                )}
              </div>

              {leadershipError && (
                <p className="error">{leadershipError}</p>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={leadershipSaving}
                >
                  {leadershipSaving
                    ? 'Saving...'
                    : editingLeadership
                      ? 'Update Assignment'
                      : 'Add Assignment'}
                </button>

                {editingLeadership && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={cancelEditingLeadership}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
          )}

          <div className="member-form">
            <h3>Leadership Assignments</h3>

            {leadershipAssignments.length === 0 ? (
              <p>No leadership assignments found.</p>
            ) : (
              leadershipAssignments.map((assignment) => (
                <div
                  className="member-details"
                  key={assignment.id}
                >
                  <h3>
                    {assignment.first_name} {assignment.last_name}
                  </h3>

                  <p className="membership-number">
                    {assignment.membership_number}
                  </p>

                  <p>
                    <strong>Role:</strong>{' '}
                    {assignment.role_title}
                  </p>

                  <p>
                    <strong>Role Type:</strong>{' '}
                    {assignment.role_type}
                  </p>

                  <p>
                    <strong>Ministry:</strong>{' '}
                    {assignment.ministry_name || 'Church-wide'}
                  </p>

                  <p>
                    <strong>Status:</strong>{' '}
                    {assignment.status}
                  </p>

                  <p>
                    <strong>Website:</strong>{' '}
                    {assignment.public_visible
                      ? 'Public'
                      : 'Private'}
                  </p>

                  <p>
                    <strong>Display Order:</strong>{' '}
                    {assignment.display_order ?? 0}
                  </p>

                  <p>
                    <strong>Photo:</strong>{' '}
                    {assignment.photo_url ? 'Added' : 'Not added'}
                  </p>

                  {assignment.responsibility && (
                    <p>
                      <strong>Responsibility:</strong>{' '}
                      {assignment.responsibility}
                    </p>
                  )}

                  {authUser.role === 'ADMIN' && (
                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startEditingLeadership(assignment)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          deleteLeadership(assignment)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     PASTORAL CARE PAGE
     ========================= */

  if (showPastoralCare) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Pastoral Care</h2>
              <p className="welcome">
                Member follow-up, prayer, care and support
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setShowPastoralCare(false)}
            >
              ← Dashboard
            </button>
          </div>

          <div className="event-stats">
            <div className="event-stat-card">
              <div>📋</div>
              <h3>Total Cases</h3>
              <strong>{pastoralCareRecords.length}</strong>
            </div>

            <div className="event-stat-card">
              <div>🟡</div>
              <h3>Open</h3>
              <strong>
                {
                  pastoralCareRecords.filter(
                    (record) =>
                      record.status === 'OPEN' ||
                      record.status === 'IN_PROGRESS' ||
                      record.status === 'FOLLOW_UP',
                  ).length
                }
              </strong>
            </div>

            <div className="event-stat-card">
              <div>📅</div>
              <h3>Follow-ups</h3>
              <strong>
                {
                  pastoralCareRecords.filter(
                    (record) =>
                      !!record.follow_up_date &&
                      record.status !== 'COMPLETED' &&
                      record.status !== 'CLOSED',
                  ).length
                }
              </strong>
            </div>

            <div className="event-stat-card">
              <div>✅</div>
              <h3>Completed</h3>
              <strong>
                {
                  pastoralCareRecords.filter(
                    (record) =>
                      record.status === 'COMPLETED' ||
                      record.status === 'CLOSED',
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="member-form">
            <h3>📌 Follow-up Dashboard</h3>

            <div className="event-stats">
              <button
                type="button"
                className="event-stat-card"
                onClick={() => {
                  setPastoralFilterFollowUp('OVERDUE');
                  setPastoralFilterStatus('');
                }}
              >
                <div>🔴</div>
                <h3>Overdue</h3>
                <strong>
                  {
                    pastoralCareRecords.filter(
                      (record) =>
                        !!record.follow_up_date &&
                        record.follow_up_date.slice(0, 10) <
                          pastoralTodayKey &&
                        record.status !== 'COMPLETED' &&
                        record.status !== 'CLOSED',
                    ).length
                  }
                </strong>
              </button>

              <button
                type="button"
                className="event-stat-card"
                onClick={() => {
                  setPastoralFilterFollowUp('TODAY');
                  setPastoralFilterStatus('');
                }}
              >
                <div>🟠</div>
                <h3>Due Today</h3>
                <strong>
                  {
                    pastoralCareRecords.filter(
                      (record) =>
                        !!record.follow_up_date &&
                        record.follow_up_date.slice(0, 10) ===
                          pastoralTodayKey &&
                        record.status !== 'COMPLETED' &&
                        record.status !== 'CLOSED',
                    ).length
                  }
                </strong>
              </button>

              <button
                type="button"
                className="event-stat-card"
                onClick={() => {
                  setPastoralFilterFollowUp('UPCOMING');
                  setPastoralFilterStatus('');
                }}
              >
                <div>🔵</div>
                <h3>Upcoming</h3>
                <strong>
                  {
                    pastoralCareRecords.filter(
                      (record) =>
                        !!record.follow_up_date &&
                        record.follow_up_date.slice(0, 10) >
                          pastoralTodayKey &&
                        record.status !== 'COMPLETED' &&
                        record.status !== 'CLOSED',
                    ).length
                  }
                </strong>
              </button>

              <button
                type="button"
                className="event-stat-card"
                onClick={() => {
                  setPastoralFilterFollowUp('');
                  setPastoralFilterStatus('COMPLETED_CLOSED');
                }}
              >
                <div>✅</div>
                <h3>Completed / Closed</h3>
                <strong>
                  {
                    pastoralCareRecords.filter(
                      (record) =>
                        record.status === 'COMPLETED' ||
                        record.status === 'CLOSED',
                    ).length
                  }
                </strong>
              </button>
            </div>
          </div>

          <div className="member-form">
            <h3>Pastoral Care Filters</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={pastoralFilterStatus}
                  onChange={(e) =>
                    setPastoralFilterStatus(e.target.value)
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CLOSED">Closed</option>
                  <option value="COMPLETED_CLOSED">
                    Completed / Closed
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={pastoralFilterPriority}
                  onChange={(e) =>
                    setPastoralFilterPriority(e.target.value)
                  }
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Member</label>
                <select
                  value={pastoralFilterMember}
                  onChange={(e) =>
                    setPastoralFilterMember(e.target.value)
                  }
                >
                  <option value="">All Members</option>

                  {members.map((member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Leader</label>
                <select
                  value={pastoralFilterLeader}
                  onChange={(e) =>
                    setPastoralFilterLeader(e.target.value)
                  }
                >
                  <option value="">All Leaders</option>
                  <option value="UNASSIGNED">
                    Unassigned
                  </option>

                  {members
                    .filter(
                      (member) => member.status === 'ACTIVE',
                    )
                    .map((member) => (
                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.first_name} {member.last_name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Follow-up</label>
                <select
                  value={pastoralFilterFollowUp}
                  onChange={(e) =>
                    setPastoralFilterFollowUp(e.target.value)
                  }
                >
                  <option value="">All Follow-ups</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="TODAY">Due Today</option>
                  <option value="UPCOMING">Upcoming</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setPastoralFilterStatus('');
                  setPastoralFilterPriority('');
                  setPastoralFilterMember('');
                  setPastoralFilterLeader('');
                  setPastoralFilterFollowUp('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {authUser.role === 'ADMIN' && (
          <form
            className="member-form"
            onSubmit={savePastoralCare}
          >
            <h3>
              {editingPastoralCare
                ? 'Edit Pastoral Care Record'
                : 'Add Pastoral Care Record'}
            </h3>

            {pastoralError && (
              <div className="form-error">
                {pastoralError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Member *</label>
                <select
                  value={pastoralMemberId}
                  onChange={(e) =>
                    setPastoralMemberId(e.target.value)
                  }
                  required
                >
                  <option value="">Select Member</option>

                  {members
                    .filter((member) => member.status === 'ACTIVE')
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Care Type *</label>
                <select
                  value={pastoralCareType}
                  onChange={(e) =>
                    setPastoralCareType(e.target.value)
                  }
                >
                  <option value="Follow-up">Follow-up</option>
                  <option value="Member Visit">Member Visit</option>
                  <option value="Prayer Request">Prayer Request</option>
                  <option value="Counselling">Counselling</option>
                  <option value="Hospital Visit">Hospital Visit</option>
                  <option value="Bereavement Support">
                    Bereavement Support
                  </option>
                  <option value="Family Support">Family Support</option>
                  <option value="New Member Care">New Member Care</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={pastoralPriority}
                  onChange={(e) =>
                    setPastoralPriority(e.target.value)
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={pastoralStatus}
                  onChange={(e) =>
                    setPastoralStatus(e.target.value)
                  }
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Leader</label>
                <select
                  value={pastoralLeaderId}
                  onChange={(e) =>
                    setPastoralLeaderId(e.target.value)
                  }
                >
                  <option value="">Not Assigned</option>

                  {members
                    .filter((member) => member.status === 'ACTIVE')
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Care Date</label>
                <input
                  type="date"
                  value={pastoralCareDate}
                  onChange={(e) =>
                    setPastoralCareDate(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Follow-up Date</label>
                <input
                  type="date"
                  value={pastoralFollowUpDate}
                  onChange={(e) =>
                    setPastoralFollowUpDate(e.target.value)
                  }
                />
              </div>

              <div className="form-group full-width">
                <label>Subject</label>
                <input
                  type="text"
                  value={pastoralSubject}
                  onChange={(e) =>
                    setPastoralSubject(e.target.value)
                  }
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  rows={4}
                  value={pastoralNotes}
                  onChange={(e) =>
                    setPastoralNotes(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-button"
                disabled={pastoralSaving}
              >
                {pastoralSaving
                  ? 'Saving...'
                  : editingPastoralCare
                    ? 'Update Record'
                    : 'Save Record'}
              </button>

              {editingPastoralCare && (
                <button
                  type="button"
                  className="back-button"
                  onClick={cancelEditingPastoralCare}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          )}

          <div className="members-list">
            {filteredPastoralCareRecords.length === 0 ? (
              <div className="empty">
                <div>🤝</div>
                <h3>No pastoral care records found</h3>
              </div>
            ) : (
              filteredPastoralCareRecords.map((record) => (
                <div
                  className="member-card"
                  key={record.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>
                        {record.first_name} {record.last_name}
                      </h3>

                      <p className="membership-number">
                        {record.care_type} · {record.priority} · {record.status}
                      </p>
                    </div>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>Subject:</strong>{' '}
                      {record.subject || 'No subject'}
                    </p>

                    <p>
                      <strong>Care Date:</strong>{' '}
                      {record.care_date.slice(0, 10)}
                    </p>

                    <p>
                      <strong>Follow-up:</strong>{' '}
                      {record.follow_up_date
                        ? record.follow_up_date.slice(0, 10)
                        : 'Not scheduled'}
                    </p>

                    <p>
                      <strong>Assigned Leader:</strong>{' '}
                      {record.assigned_leader_first_name
                        ? record.assigned_leader_first_name +
                          ' ' +
                          (record.assigned_leader_last_name || '')
                        : 'Not assigned'}
                    </p>

                    <p>
                      <strong>Notes:</strong>{' '}
                      {record.notes || 'No notes'}
                    </p>
                  </div>

                  {authUser.role === 'ADMIN' && (
                    <div className="member-actions">
                      <button
                        className="edit-button"
                        onClick={() =>
                          startEditingPastoralCare(record)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="deactivate-button"
                        onClick={() =>
                          deletePastoralCare(record)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     EVENTS PAGE
     ========================= */

  if (showEvents) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Events & Calendar</h2>
              <p className="welcome">
                Manage church services, workshops and special events
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setShowEvents(false)}
            >
              ← Dashboard
            </button>
          </div>

          <div className="event-stats">
            <div className="event-stat-card">
              <div>📅</div>
              <h3>Total Events</h3>
              <strong>{totalEvents}</strong>
            </div>

            <div className="event-stat-card">
              <div>⏳</div>
              <h3>Upcoming</h3>
              <strong>{upcomingEventsCount}</strong>
            </div>

            <div className="event-stat-card">
              <div>✅</div>
              <h3>Completed</h3>
              <strong>{completedEventsCount}</strong>
            </div>

            <div className="event-stat-card">
              <div>🚫</div>
              <h3>Cancelled / Postponed</h3>
              <strong>{cancelledPostponedEventsCount}</strong>
            </div>
          </div>

          <div className="member-form">
            <h3>Event Filters</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>From</label>
                <input
                  type="date"
                  value={eventFilterFrom}
                  onChange={(e) =>
                    setEventFilterFrom(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>To</label>
                <input
                  type="date"
                  value={eventFilterTo}
                  onChange={(e) =>
                    setEventFilterTo(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={eventFilterStatus}
                  onChange={(e) =>
                    setEventFilterStatus(e.target.value)
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="POSTPONED">Postponed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Event Type</label>
                <select
                  value={eventFilterType}
                  onChange={(e) =>
                    setEventFilterType(e.target.value)
                  }
                >
                  <option value="">All Types</option>
                  <option value="Sunday Service">Sunday Service</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Night Prayer">Night Prayer</option>
                  <option value="Youth">Youth</option>
                  <option value="Women">Women's Fellowship</option>
                  <option value="Children">Children's Ministry</option>
                  <option value="Home Cell">Home Cell</option>
                  <option value="Conference">Conference</option>
                  <option value="Funeral">Funeral</option>
                  <option value="Special Event">Special Event</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setEventFilterFrom('');
                  setEventFilterTo('');
                  setEventFilterStatus('');
                  setEventFilterType('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {authUser.role === 'ADMIN' && (
          <form
            className="member-form"
            onSubmit={saveEvent}
          >
            <h3>
              {editingEvent
                ? 'Edit Event'
                : 'Add Event'}
            </h3>

            {eventError && (
              <div className="form-error">
                {eventError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) =>
                    setEventTitle(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) =>
                    setEventType(e.target.value)
                  }
                >
                  <option value="">Select Type</option>
                  <option value="Sunday Service">
                    Sunday Service
                  </option>
                  <option value="Leadership">
                    Leadership
                  </option>
                  <option value="Night Prayer">
                    Night Prayer
                  </option>
                  <option value="Youth">
                    Youth
                  </option>
                  <option value="Women">
                    Women's Fellowship
                  </option>
                  <option value="Children">
                    Children's Ministry
                  </option>
                  <option value="Home Cell">
                    Home Cell
                  </option>
                  <option value="Conference">
                    Conference
                  </option>
                  <option value="Funeral">
                    Funeral
                  </option>
                  <option value="Special Event">
                    Special Event
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) =>
                    setEventDate(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={eventStartTime}
                  onChange={(e) =>
                    setEventStartTime(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={eventEndTime}
                  onChange={(e) =>
                    setEventEndTime(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) =>
                    setEventLocation(e.target.value)
                  }
                  placeholder="e.g. Main Church Hall"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={eventStatus}
                  onChange={(e) =>
                    setEventStatus(e.target.value)
                  }
                >
                  <option value="SCHEDULED">
                    Scheduled
                  </option>
                  <option value="COMPLETED">
                    Completed
                  </option>
                  <option value="POSTPONED">
                    Postponed
                  </option>
                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) =>
                    setEventDescription(e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-button"
                disabled={eventSaving}
              >
                {eventSaving
                  ? editingEvent
                    ? 'Updating Event...'
                    : 'Saving Event...'
                  : editingEvent
                    ? 'Update Event'
                    : 'Save Event'}
              </button>

              {editingEvent && (
                <button
                  type="button"
                  className="back-button"
                  onClick={cancelEditingEvent}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          )}

          {filteredEvents.length === 0 ? (
            <div className="empty">
              <div>📅</div>
              <h3>No events found</h3>
              <p>No events match the selected filters.</p>
            </div>
          ) : (
            <>
              <div className="member-form">
                <h3>⏳ Upcoming Events</h3>

                <div className="members-list">
                  {upcomingFilteredEvents.length === 0 ? (
                    <div className="empty">
                      <p>No upcoming events found.</p>
                    </div>
                  ) : (
                    upcomingFilteredEvents.map((event: ChurchEvent) => (
              <div
                className="member-card"
                key={event.id}
              >
                <div className="member-top">
                  <div>
                    <h3>{event.title}</h3>
                    <p className="membership-number">
                      {event.event_type || 'Church Event'} · {event.status}
                    </p>
                  </div>
                </div>

                <div className="member-details">
                  <p>
                    <strong>Date:</strong>{' '}
                    {event.event_date.slice(0, 10)}
                  </p>

                  <p>
                    <strong>Time:</strong>{' '}
                    {event.start_time
                      ? event.start_time.slice(0, 5)
                      : 'Not set'}
                    {event.end_time
                      ? ' - ' + event.end_time.slice(0, 5)
                      : ''}
                  </p>

                  <p>
                    <strong>Location:</strong>{' '}
                    {event.location || 'Not specified'}
                  </p>

                  <p>
                    <strong>Description:</strong>{' '}
                    {event.description || 'No description'}
                  </p>
                </div>

                <div className="member-actions">
                  <button
                    type="button"
                    className="save-button"
                    onClick={() =>
                      takeEventAttendance(event)
                    }
                  >
                    {event.attendance_session_id
                      ? '📋 Open Attendance'
                      : '✅ Take Attendance'}
                  </button>

                  {authUser.role === 'ADMIN' && (
                    <>
                      <button
                        className="edit-button"
                        onClick={() =>
                          startEditingEvent(event)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="deactivate-button"
                        onClick={() =>
                          deleteEvent(event)
                        }
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
                  )}
                </div>
              </div>

              <div className="member-form">
                <h3>✅ Past / Completed Events</h3>

                <div className="members-list">
                  {pastCompletedFilteredEvents.length === 0 ? (
                    <div className="empty">
                      <p>No past or completed events found.</p>
                    </div>
                  ) : (
                    pastCompletedFilteredEvents.map((event: ChurchEvent) => (
              <div
                className="member-card"
                key={event.id}
              >
                <div className="member-top">
                  <div>
                    <h3>{event.title}</h3>
                    <p className="membership-number">
                      {event.event_type || 'Church Event'} · {event.status}
                    </p>
                  </div>
                </div>

                <div className="member-details">
                  <p>
                    <strong>Date:</strong>{' '}
                    {event.event_date.slice(0, 10)}
                  </p>

                  <p>
                    <strong>Time:</strong>{' '}
                    {event.start_time
                      ? event.start_time.slice(0, 5)
                      : 'Not set'}
                    {event.end_time
                      ? ' - ' + event.end_time.slice(0, 5)
                      : ''}
                  </p>

                  <p>
                    <strong>Location:</strong>{' '}
                    {event.location || 'Not specified'}
                  </p>

                  <p>
                    <strong>Description:</strong>{' '}
                    {event.description || 'No description'}
                  </p>
                </div>

                <div className="member-actions">
                  <button
                    type="button"
                    className="save-button"
                    onClick={() =>
                      takeEventAttendance(event)
                    }
                  >
                    {event.attendance_session_id
                      ? '📋 Open Attendance'
                      : '✅ Take Attendance'}
                  </button>

                  {authUser.role === 'ADMIN' && (
                    <>
                      <button
                        className="edit-button"
                        onClick={() =>
                          startEditingEvent(event)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="deactivate-button"
                        onClick={() =>
                          deleteEvent(event)
                        }
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     SERMONS & RESOURCES PAGE
     ========================= */

  if (showSermons) {
    const publishedSermons = sermons.filter(
      (sermon) => sermon.status === 'PUBLISHED',
    ).length;

    const draftSermons = sermons.filter(
      (sermon) => sermon.status === 'DRAFT',
    ).length;

    const archivedSermons = sermons.filter(
      (sermon) => sermon.status === 'ARCHIVED',
    ).length;

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Sermons & Resources</h2>
              <p className="welcome">
                Manage sermons, teachings and ministry resources
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setShowSermons(false)}
            >
              ← Dashboard
            </button>
          </div>

          <div className="event-stats">
            <div className="event-stat-card">
              <div>📖</div>
              <h3>Total Sermons</h3>
              <strong>{sermons.length}</strong>
            </div>

            <div className="event-stat-card">
              <div>🌍</div>
              <h3>Published</h3>
              <strong>{publishedSermons}</strong>
            </div>

            <div className="event-stat-card">
              <div>📝</div>
              <h3>Drafts</h3>
              <strong>{draftSermons}</strong>
            </div>

            <div className="event-stat-card">
              <div>📦</div>
              <h3>Archived</h3>
              <strong>{archivedSermons}</strong>
            </div>
          </div>

          {authUser.role === 'ADMIN' && (
            <form
              className="member-form"
              onSubmit={saveSermon}
            >
              <h3>
                {editingSermon
                  ? 'Edit Sermon'
                  : 'Add Sermon'}
              </h3>

              {sermonError && (
                <div className="form-error">
                  {sermonError}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={sermonTitle}
                    onChange={(e) =>
                      setSermonTitle(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Speaker *</label>
                  <input
                    type="text"
                    value={sermonSpeaker}
                    onChange={(e) =>
                      setSermonSpeaker(e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Scripture</label>
                  <input
                    type="text"
                    value={sermonScripture}
                    onChange={(e) =>
                      setSermonScripture(e.target.value)
                    }
                    placeholder="e.g. Hebrews 12:22-24"
                  />
                </div>

                <div className="form-group">
                  <label>Sermon Date *</label>
                  <input
                    type="date"
                    value={sermonDate}
                    onChange={(e) =>
                      setSermonDate(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={sermonStatus}
                    onChange={(e) =>
                      setSermonStatus(
                        e.target.value as
                          | 'DRAFT'
                          | 'PUBLISHED'
                          | 'ARCHIVED',
                      )
                    }
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">
                      Published
                    </option>
                    <option value="ARCHIVED">
                      Archived
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Featured</label>
                  <select
                    value={sermonFeatured ? 'YES' : 'NO'}
                    onChange={(e) =>
                      setSermonFeatured(
                        e.target.value === 'YES',
                      )
                    }
                  >
                    <option value="NO">No</option>
                    <option value="YES">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Video URL</label>
                  <input
                    type="url"
                    value={sermonVideoUrl}
                    onChange={(e) =>
                      setSermonVideoUrl(e.target.value)
                    }
                    placeholder="https://..."
                  />

                  {editingSermon && (
                    <div className="form-actions">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) =>
                          setSermonVideoFile(
                            e.target.files?.[0] || null,
                          )
                        }
                      />

                      <button
                        type="button"
                        className="save-button"
                        disabled={
                          !sermonVideoFile ||
                          sermonVideoUploading
                        }
                        onClick={() =>
                          uploadSermonMedia('video')
                        }
                      >
                        {sermonVideoUploading
                          ? 'Uploading Video...'
                          : 'Upload Video'}
                      </button>

                      {sermonVideoUrl && (
                        <button
                          type="button"
                          className="back-button"
                          onClick={() =>
                            removeSermonMedia('video')
                          }
                        >
                          Remove Video
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Audio URL</label>
                  <input
                    type="url"
                    value={sermonAudioUrl}
                    onChange={(e) =>
                      setSermonAudioUrl(e.target.value)
                    }
                    placeholder="https://..."
                  />

                  {editingSermon && (
                    <div className="form-actions">
                      <input
                        type="file"
                        accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,audio/ogg"
                        onChange={(e) =>
                          setSermonAudioFile(
                            e.target.files?.[0] || null,
                          )
                        }
                      />

                      <button
                        type="button"
                        className="save-button"
                        disabled={
                          !sermonAudioFile ||
                          sermonAudioUploading
                        }
                        onClick={() =>
                          uploadSermonMedia('audio')
                        }
                      >
                        {sermonAudioUploading
                          ? 'Uploading Audio...'
                          : 'Upload Audio'}
                      </button>

                      {sermonAudioUrl && (
                        <button
                          type="button"
                          className="back-button"
                          onClick={() =>
                            removeSermonMedia('audio')
                          }
                        >
                          Remove Audio
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Notes / Resource URL</label>
                  <input
                    type="url"
                    value={sermonNotesUrl}
                    onChange={(e) =>
                      setSermonNotesUrl(e.target.value)
                    }
                    placeholder="https://..."
                  />

                  {editingSermon && (
                    <div className="form-actions">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          setSermonNotesFile(
                            e.target.files?.[0] || null,
                          )
                        }
                      />

                      <button
                        type="button"
                        className="save-button"
                        disabled={
                          !sermonNotesFile ||
                          sermonNotesUploading
                        }
                        onClick={() =>
                          uploadSermonMedia('notes')
                        }
                      >
                        {sermonNotesUploading
                          ? 'Uploading Notes...'
                          : 'Upload PDF Notes'}
                      </button>

                      {sermonNotesUrl && (
                        <button
                          type="button"
                          className="back-button"
                          onClick={() =>
                            removeSermonMedia('notes')
                          }
                        >
                          Remove Notes
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={sermonDescription}
                    onChange={(e) =>
                      setSermonDescription(e.target.value)
                    }
                    rows={4}
                    placeholder="Sermon summary or teaching notes"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={sermonSaving}
                >
                  {sermonSaving
                    ? editingSermon
                      ? 'Updating Sermon...'
                      : 'Saving Sermon...'
                    : editingSermon
                      ? 'Update Sermon'
                      : 'Save Sermon'}
                </button>

                {editingSermon && (
                  <button
                    type="button"
                    className="back-button"
                    onClick={cancelEditingSermon}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}

          {sermonError && authUser.role !== 'ADMIN' && (
            <div className="form-error">
              {sermonError}
            </div>
          )}
          {sermons.length === 0 ? (
            <div className="empty">
              <div>📖</div>
              <h3>No sermons yet</h3>
              <p>
                Sermons and ministry resources will appear here.
              </p>
            </div>
          ) : (
            <div className="members-list">
              {sermons.map((sermon: ChurchSermon) => (
                <div
                  className="member-card"
                  key={sermon.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>
                        {sermon.featured ? '⭐ ' : ''}
                        {sermon.title}
                      </h3>

                      <p className="membership-number">
                        {sermon.speaker} · {sermon.status}
                      </p>
                    </div>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>Date:</strong>{' '}
                      {sermon.sermon_date.slice(0, 10)}
                    </p>

                    <p>
                      <strong>Scripture:</strong>{' '}
                      {sermon.scripture || 'Not specified'}
                    </p>

                    <p>
                      <strong>Description:</strong>{' '}
                      {sermon.description || 'No description'}
                    </p>

                    <p>
                      <strong>Featured:</strong>{' '}
                      {sermon.featured ? 'Yes' : 'No'}
                    </p>

                    {sermon.video_url && (
                      <p>
                        <strong>Video:</strong>{' '}
                        <a
                          href={sermon.video_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Video
                        </a>
                      </p>
                    )}

                    {sermon.audio_url && (
                      <p>
                        <strong>Audio:</strong>{' '}
                        <a
                          href={sermon.audio_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Audio
                        </a>
                      </p>
                    )}

                    {sermon.notes_url && (
                      <p>
                        <strong>Notes:</strong>{' '}
                        <a
                          href={sermon.notes_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Resource
                        </a>
                      </p>
                    )}
                  </div>

                  {authUser.role === 'ADMIN' && (
                    <div className="member-actions">
                      <button
                        className="edit-button"
                        onClick={() =>
                          startEditingSermon(sermon)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="deactivate-button"
                        onClick={() =>
                          deleteSermon(sermon)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     GIVING PAGE
     ========================= */

  if (showGiving) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Giving & Tithes</h2>
              <p className="welcome">
                Record member giving, tithes, offerings and donations
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setShowGiving(false)}
            >
              ← Dashboard
            </button>
          </div>

          {givingSummary && (
            <div className="member-form">
              <h3>Giving Summary</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>From</label>
                  <input
                    type="date"
                    value={givingReportFrom}
                    onChange={(e) =>
                      setGivingReportFrom(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>To</label>
                  <input
                    type="date"
                    value={givingReportTo}
                    onChange={(e) =>
                      setGivingReportTo(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="save-button no-print"
                  onClick={() => {
                    loadGivingRecords(
                      givingReportFrom,
                      givingReportTo,
                    );
                    loadGivingSummary(
                      givingReportFrom,
                      givingReportTo,
                    );
                  }}
                >
                  Generate Report
                </button>

                <button
                  type="button"
                  className="back-button no-print"
                  onClick={() => {
                    setGivingReportFrom('');
                    setGivingReportTo('');
                    loadGivingRecords();
                    loadGivingSummary();
                  }}
                >
                  Clear Dates
                </button>

                <button
                  type="button"
                  className="edit-button no-print"
                  onClick={() => window.print()}
                >
                  🖨️ Print Report
                </button>
              </div>
              <div className="member-details">
                <p>
                  <strong>💰 Total Giving:</strong>{' '}
                  R{givingSummary.totalGiving.toFixed(2)}
                </p>

                <p>
                  <strong>🧾 Giving Records:</strong>{' '}
                  {givingSummary.givingCount}
                </p>
              </div>

              {givingSummary.breakdown.length > 0 && (
                <div className="members-list">
                  {givingSummary.breakdown.map((item) => (
                    <div
                      className="member-card"
                      key={item.givingType}
                    >
                      <div className="member-details">
                        <p>
                          <strong>{item.givingType}:</strong>{' '}
                          R{item.total.toFixed(2)}
                        </p>

                        <p>
                          <strong>Records:</strong>{' '}
                          {item.count}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {authUser.role === 'ADMIN' && (
          <form
            className="member-form"
            onSubmit={saveGivingRecord}
          >
            <h3>
              {editingGivingRecord
                ? 'Edit Giving Record'
                : 'Add Giving Record'}
            </h3>

            {givingError && (
              <div className="form-error">
                {givingError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Member</label>
                <select
                  value={givingMemberId}
                  onChange={(e) =>
                    setGivingMemberId(e.target.value)
                  }
                >
                  <option value="">
                    Anonymous / Visitor
                  </option>

                  {members
                    .filter(
                      (member) =>
                        member.status === 'ACTIVE',
                    )
                    .map((member) => (
                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.first_name}{' '}
                        {member.last_name} —{' '}
                        {member.membership_number}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Giving Date *</label>
                <input
                  type="date"
                  value={givingDate}
                  onChange={(e) =>
                    setGivingDate(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Giving Type *</label>
                <select
                  value={givingType}
                  onChange={(e) =>
                    setGivingType(e.target.value)
                  }
                >
                  <option value="Tithe">Tithe</option>
                  <option value="Offering">Offering</option>
                  <option value="Special Offering">
                    Special Offering
                  </option>
                  <option value="Donation">Donation</option>
                  <option value="Building Fund">
                    Building Fund
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount (R) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={givingAmount}
                  onChange={(e) =>
                    setGivingAmount(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={givingPaymentMethod}
                  onChange={(e) =>
                    setGivingPaymentMethod(
                      e.target.value,
                    )
                  }
                >
                  <option value="Cash">Cash</option>
                  <option value="EFT">EFT</option>
                  <option value="Card">Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reference Number</label>
                <input
                  type="text"
                  value={givingReference}
                  onChange={(e) =>
                    setGivingReference(e.target.value)
                  }
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={givingNotes}
                  onChange={(e) =>
                    setGivingNotes(e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-button"
                disabled={givingSaving}
              >
                {givingSaving
                  ? editingGivingRecord
                    ? 'Updating Giving...'
                    : 'Saving Giving...'
                  : editingGivingRecord
                    ? 'Update Giving'
                    : 'Save Giving'}
              </button>

              {editingGivingRecord && (
                <button
                  type="button"
                  className="back-button"
                  onClick={cancelEditingGiving}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          )}

          <div className="members-list">
            {givingRecords.length === 0 ? (
              <div className="empty">
                <div>🙏</div>
                <h3>No giving records found</h3>
                <p>Add the first tithe or offering.</p>
              </div>
            ) : (
              givingRecords.map((record) => (
                <div
                  className="member-card"
                  key={record.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>
                        {record.first_name
                          ? `${record.first_name} ${record.last_name}`
                          : 'Anonymous / Visitor'}
                      </h3>

                      <p className="membership-number">
                        {record.giving_type}
                      </p>
                    </div>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>Amount:</strong>{' '}
                      R{Number(record.amount).toFixed(2)}
                    </p>

                    <p>
                      <strong>Date:</strong>{' '}
                      {new Date(
                        record.giving_date,
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>Payment:</strong>{' '}
                      {record.payment_method || 'Not specified'}
                    </p>

                    <p>
                      <strong>Reference:</strong>{' '}
                      {record.reference_number || 'None'}
                    </p>

                    <p>
                      <strong>Notes:</strong>{' '}
                      {record.notes || 'No notes'}
                    </p>
                  </div>

                  {authUser.role === 'ADMIN' && (
                  <div className="member-actions">
                    <button
                      className="edit-button"
                      onClick={() =>
                        startEditingGiving(record)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="deactivate-button"
                      onClick={() =>
                        deleteGivingRecord(record)
                      }
                    >
                      Delete
                    </button>
                  </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }
  /* =========================
     FINANCE PAGE
     ========================= */

  if (showFinance) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Finance</h2>
              <p className="welcome">
                Manage church income, offerings and expenses
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setShowFinance(false)}
            >
              ← Dashboard
            </button>
          </div>

          {financeSummary && (
            <div className="member-form">
              <h3>Financial Summary</h3>              <div className="form-grid">
                <div className="form-group">
                  <label>From</label>
                  <input
                    type="date"
                    value={financeReportFrom}
                    onChange={(e) =>
                      setFinanceReportFrom(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>To</label>
                  <input
                    type="date"
                    value={financeReportTo}
                    onChange={(e) =>
                      setFinanceReportTo(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="save-button no-print"
                  onClick={() => {
                    loadFinanceTransactions(
                      financeReportFrom,
                      financeReportTo,
                    );
                    loadFinanceSummary(
                      financeReportFrom,
                      financeReportTo,
                    );
                  }}
                >
                  Generate Report
                </button>

                <button
                  type="button"
className="back-button no-print"                 
 onClick={() => {
                    setFinanceReportFrom('');
                    setFinanceReportTo('');
                    loadFinanceTransactions();
                    loadFinanceSummary();
                  }}
                >
                  Clear Dates
                </button>
                <button
                  type="button"
                  className="edit-button no-print"
                  onClick={() => window.print()}
                >
                  🖨️ Print Report
                </button>
              </div>
          {authUser.role === 'ADMIN' && (
          <form
            className="member-form"
            onSubmit={saveFinanceTransaction}
          >
            <h3>
  {editingFinanceTransaction
    ? 'Edit Finance Transaction'
    : 'Add Finance Transaction'}
</h3>

            {financeError && (
              <div className="form-error">
                {financeError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={financeDate}
                  onChange={(e) =>
                    setFinanceDate(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  value={financeType}
                  onChange={(e) =>
                    setFinanceType(e.target.value)
                  }
                >
                  <option value="INCOME">
                    Income / Offering
                  </option>
                  <option value="EXPENSE">
                    Expense
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  value={financeCategory}
                  onChange={(e) =>
                    setFinanceCategory(e.target.value)
                  }
                  placeholder="e.g. Sunday Offering"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (R) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={financeAmount}
                  onChange={(e) =>
                    setFinanceAmount(e.target.value)
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={financeDescription}
                  onChange={(e) =>
                    setFinanceDescription(e.target.value)
                  }
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-button"
                disabled={financeSaving}
              >
              {financeSaving
  ? editingFinanceTransaction
    ? 'Updating Transaction...'
    : 'Saving Transaction...'
  : editingFinanceTransaction
    ? 'Update Transaction'
    : 'Save Transaction'}
              </button>
{editingFinanceTransaction && (
  <button
    type="button"
    className="back-button"
    onClick={() => {
      setEditingFinanceTransaction(null);
      setFinanceDate('');
      setFinanceType('INCOME');
      setFinanceCategory('');
      setFinanceAmount('');
      setFinanceDescription('');
      setFinanceError('');
    }}
  >
    Cancel Edit
  </button>
)}
            </div>
          </form>
          )}

              <div className="print-only financial-statement-heading">
                <h2>CLGF Financial Statement</h2>
                <p>The City Of The Living God Fellowship</p>
                <p>
                  <strong>Reporting Period:</strong>{' '}
                  {financeSummary.period.from || 'Beginning'}
                  {' — '}
                  {financeSummary.period.to || 'Current'}
                </p>
              </div>

              <div className="member-details">
                <p>
                  <strong>💰 Total Income:</strong>{' '}
                  R{financeSummary.totalIncome.toFixed(2)}
                </p>

                <p>
                  <strong>💸 Total Expenses:</strong>{' '}
                  R{financeSummary.totalExpenses.toFixed(2)}
                </p>

                <p>
                  <strong>🏦 Balance:</strong>{' '}
                  R{financeSummary.balance.toFixed(2)}
                </p>

                <p>
                  <strong>🧾 Transactions:</strong>{' '}
                  {financeSummary.transactionCount}
                </p>
              </div>

              {financeSummary.breakdown.length > 0 && (
                <div className="members-list">
                  {financeSummary.breakdown.map((item) => (
                    <div
                      className="member-card"
                      key={`${item.transactionType}-${item.category}`}
                    >
                      <div className="member-details">
                        <p>
                          <strong>
                            {item.transactionType === 'INCOME'
                              ? '💰 Income'
                              : '💸 Expense'}{' '}
                            — {item.category}:
                          </strong>{' '}
                          R{item.total.toFixed(2)}
                        </p>

                        <p>
                          <strong>Transactions:</strong>{' '}
                          {item.count}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="members-list">
            {financeTransactions.length === 0 ? (
              <div className="empty">
                <div>💰</div>
                <h3>No finance transactions found</h3>
                <p>Add your first offering or expense.</p>
              </div>
            ) : (
              financeTransactions.map((transaction) => (
                <div
                  className="member-card"
                  key={transaction.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>{transaction.category}</h3>

                      <p className="membership-number">
                        {transaction.transaction_type}
                      </p>
                    </div>
                  </div>

                  <div className="member-details">
                  {authUser.role === 'ADMIN' && (
                  <div className="member-actions">
                    <button
                      className="edit-button"
                      onClick={() =>
                        startEditingFinance(transaction)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="deactivate-button"
                      onClick={() =>
                        deleteFinanceTransaction(transaction)
                      }
                    >
                      Delete
                    </button>
                  </div>
                  )}
                    <p>
                      <strong>Amount:</strong>{' '}
                      R{Number(transaction.amount).toFixed(2)}
                    </p>

                    <p>
                      <strong>Date:</strong>{' '}
                      {new Date(
                        transaction.transaction_date,
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>Description:</strong>{' '}
                      {transaction.description || 'No description'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }
  /* =========================
     ATTENDANCE PAGE
     ========================= */

  if (showAttendance) {
    const activeAttendanceMembers = members.filter(
      (member) => member.status === 'ACTIVE',
    );

    const filteredAttendanceMembers = activeAttendanceMembers.filter(
      (member) => {
        const searchText = attendanceMemberSearch
          .trim()
          .toLowerCase();

        const matchesSearch =
          !searchText ||
          (member.first_name || '')
            .toLowerCase()
            .includes(searchText) ||
          (member.last_name || '')
            .toLowerCase()
            .includes(searchText) ||
          (member.membership_number || '')
            .toLowerCase()
            .includes(searchText);

        if (!matchesSearch) {
          return false;
        }

        if (!selectedAttendance || attendanceStatusFilter === 'ALL') {
          return true;
        }

        const record = selectedAttendance.records.find(
          (attendanceRecord) =>
            attendanceRecord.member_id === member.id,
        );

        if (attendanceStatusFilter === 'NOT_MARKED') {
          return !record;
        }

        return record?.status === attendanceStatusFilter;
      },
    );

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Attendance</h2>
              <p className="welcome">
                Manage church service attendance
              </p>
            </div>

                        <div className="member-actions">
              <button
                className="edit-button"
                onClick={loadAttendanceReport}
              >
                View Church Report
              </button>

              <button
                className="back-button"
                onClick={() => setShowAttendance(false)}
              >
                ← Dashboard
              </button>
            </div>
          </div>
          {attendanceReport && (
            <div className="member-form">
              <div className="page-header">
                <div>
                  <h3>Church Attendance Report</h3>
                  <p className="membership-number">
                    Overall attendance summary
                  </p>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>From</label>
                      <input
                        type="date"
                        value={reportFrom}
                        onChange={(e) =>
                          setReportFrom(e.target.value)
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>To</label>
                      <input
                        type="date"
                        value={reportTo}
                        onChange={(e) =>
                          setReportTo(e.target.value)
                        }
                      />
                    </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="save-button"
                      onClick={loadAttendanceReport}
                    >
                      Generate Report
                    </button>

                    <button
                      type="button"
                      className="back-button"
                      onClick={() => {
                        setReportFrom('');
                        setReportTo('');
                      }}
                    >
                      Clear Dates
                    </button>
                  </div>
                  </div>
                </div>

                <button
                  className="back-button"
                  onClick={async () => {
  setReportFrom('');
  setReportTo('');

  try {
    const response = await authFetch(
      `${API_BASE_URL}/attendance/report`,
    );

    if (!response.ok) {
      throw new Error('Failed to load attendance report');
    }

    const data = await response.json();
    setAttendanceReport(data);
  } catch (err) {
    console.error(err);
    alert('Unable to reload attendance report.');
  }
}}
                >
                  Close Report
                </button>
              </div>

              <div className="member-details">
                <p>
                  <strong>Total Sessions:</strong>{' '}
                  {attendanceReport.summary.totalSessions}
                </p>

                <p>
                  <strong>Active Members:</strong>{' '}
                  {attendanceReport.summary.totalActiveMembers}
                </p>

                <p>
                  <strong>✅ Present:</strong>{' '}
                  {attendanceReport.summary.present}
                </p>

                <p>
                  <strong>❌ Absent:</strong>{' '}
                  {attendanceReport.summary.absent}
                </p>

                <p>
                  <strong>📊 Attendance Rate:</strong>{' '}
                  {attendanceReport.summary.attendanceRate}%
                </p>
              </div>
              <div className="members-list">
                {attendanceReport.members.map((member) => (
                  <div
                    className="member-card"
                    key={member.id}
                  >
                    <div className="member-top">
                      <div>
                        <h3>
                          {member.first_name}{' '}
                          {member.last_name}
                        </h3>

                        <p className="membership-number">
                          {member.membership_number}
                        </p>
                      </div>
                    </div>

                    <div className="member-details">
                      <p>
                        <strong>Total Sessions:</strong>{' '}
                        {member.total_sessions}
                      </p>

                      <p>
                        <strong>✅ Present:</strong>{' '}
                        {member.present}
                      </p>

                      <p>
                        <strong>❌ Absent:</strong>{' '}
                        {member.absent}
                      </p>

                      <p>
                        <strong>➖ Not Marked:</strong>{' '}
                        {member.not_marked}
                      </p>

                      <p>
                        <strong>📊 Attendance Rate:</strong>{' '}
                        {member.attendance_rate}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {authUser.role === 'ADMIN' && (
          <form
            className="member-form"
            onSubmit={saveAttendanceSession}
          >
            <h3>Create Attendance Session</h3>

            {attendanceError && (
              <div className="form-error">
                {attendanceError}
                </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Service Date *</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) =>
                    setAttendanceDate(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Service Type *</label>
                <input
                  type="text"
                  value={attendanceType}
                  onChange={(e) =>
                    setAttendanceType(e.target.value)
                  }
                  placeholder="e.g. Sunday Worship Service"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={attendanceNotes}
                  onChange={(e) =>
                    setAttendanceNotes(e.target.value)
                  }
                  placeholder="Optional notes"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-button"
                disabled={attendanceSaving}
              >
                {attendanceSaving
                  ? 'Creating Session...'
                  : 'Create Session'}
              </button>
            </div>
          </form>
          )}

          {selectedAttendance && (
            <div className="member-form">
              <div className="page-header">
                <div>
                  <h3>
                    Mark Attendance —{' '}
                    {selectedAttendance.service_type}
                  </h3>

                  <p className="membership-number">
                    {new Date(
                      selectedAttendance.service_date,
                    ).toLocaleDateString()}
                  </p>

                  {selectedAttendance.event_id && (
                    <p className="membership-number">
                      <strong>📅 Linked Event:</strong>{' '}
                      {selectedAttendance.event_title ||
                        selectedAttendance.service_type}
                      {selectedAttendance.event_type
                        ? ` · ${selectedAttendance.event_type}`
                        : ''}
                      {selectedAttendance.event_status
                        ? ` · ${selectedAttendance.event_status}`
                        : ''}
                    </p>
                  )}
                </div>

                <div className="form-actions">
                  {selectedAttendance.event_id && (
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => {
                        setSelectedAttendance(null);
                        setShowAttendance(false);
                        setShowEvents(true);
                      }}
                    >
                      ← Back to Events
                    </button>
                  )}

                  <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                      setSelectedAttendance(null)
                    }
                  >
                    Close
                  </button>
                </div>
              </div>

                            <div className="member-details">
                <p>
                  <strong>✅ Present:</strong>{' '}
                  {
                    selectedAttendance.records.filter(
                      (record) => record.status === 'PRESENT',
                    ).length
                  }
                </p>

                <p>
                  <strong>❌ Absent:</strong>{' '}
                  {
                    selectedAttendance.records.filter(
                      (record) => record.status === 'ABSENT',
                    ).length
                  }
                </p>

                <p>
                  <strong>👥 Total Members:</strong>{' '}
                  {
                    members.filter(
                      (member) => member.status === 'ACTIVE',
                    ).length
                  }
                </p>
                <p>
                  <strong>➖ Not Marked:</strong>{' '}
                  {
                    members.filter(
                      (member) => member.status === 'ACTIVE',
                    ).length -
                    selectedAttendance.records.length
                  }
                </p>

                <p>
                  <strong>📊 Attendance Rate:</strong>{' '}
                  {
                    members.filter(
                      (member) => member.status === 'ACTIVE',
                    ).length > 0
                      ? (
                          (selectedAttendance.records.filter(
                            (record) =>
                              record.status === 'PRESENT',
                          ).length /
                            members.filter(
                              (member) =>
                                member.status === 'ACTIVE',
                            ).length) *
                          100
                        ).toFixed(1)
                      : '0.0'
                  }
                  %
                </p>
              </div>

              <div className="attendance-quick-register">
                <div className="attendance-register-heading">
                  <div>
                    <h3>Quick Attendance Register</h3>
                    <p>
                      Search members and filter by attendance status
                    </p>
                  </div>

                  <strong>
                    Showing {filteredAttendanceMembers.length} of{' '}
                    {activeAttendanceMembers.length}
                  </strong>
                </div>

                <div className="attendance-register-tools">
                  <input
                    type="search"
                    value={attendanceMemberSearch}
                    onChange={(e) =>
                      setAttendanceMemberSearch(e.target.value)
                    }
                    placeholder="Search name or membership number..."
                    aria-label="Search attendance members"
                  />

                  <div className="attendance-status-filters">
                    {(
                      [
                        ['ALL', 'All'],
                        ['NOT_MARKED', 'Not Marked'],
                        ['PRESENT', 'Present'],
                        ['ABSENT', 'Absent'],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={
                          attendanceStatusFilter === value
                            ? 'attendance-filter-button active'
                            : 'attendance-filter-button'
                        }
                        onClick={() =>
                          setAttendanceStatusFilter(value)
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="members-list">
                {filteredAttendanceMembers.length === 0 ? (
                  <div className="empty">
                    <div>🔎</div>
                    <h3>No members found</h3>
                    <p>
                      Try another search or attendance filter.
                    </p>
                  </div>
                ) : (
                  filteredAttendanceMembers.map((member) => {
                    const attendanceRecord =
                      selectedAttendance.records.find(
                        (record) =>
                          record.member_id === member.id,
                      );

                    return (
                      <div
                        className="member-card"
                        key={member.id}
                      >
                        <div className="member-top">
                          <div>
                            <h3>
                              {member.first_name}{' '}
                              {member.last_name}
                            </h3>

                            <p className="membership-number">
                              {member.membership_number}
                            </p>
                          </div>
                        </div>

                        <div className="member-details">
                          <p>
                            <strong>Status:</strong>{' '}
                            {attendanceRecord
                              ? attendanceRecord.status
                              : 'NOT MARKED'}
                          </p>
                        </div>

                                                <div className="member-actions">
                          {attendanceRecord?.status === 'PRESENT' ? (
                            <>
                              <button
                                className="deactivate-button"
                                onClick={() =>
                                  markMemberAttendance(
                                    member.id,
                                    'ABSENT',
                                  )
                                }
                              >
                                Mark Absent
                              </button>

                              <button
                                className="reactivate-button"
                                onClick={() =>
                                  removeMemberAttendance(member.id)
                                }
                              >
                                Clear
                              </button>
                            </>
                          ) : attendanceRecord?.status === 'ABSENT' ? (
                            <>
                              <button
                                className="edit-button"
                                onClick={() =>
                                  markMemberAttendance(
                                    member.id,
                                    'PRESENT',
                                  )
                                }
                              >
                                Mark Present
                              </button>

                              <button
                                className="reactivate-button"
                                onClick={() =>
                                  removeMemberAttendance(member.id)
                                }
                              >
                                Clear
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="edit-button"
                                onClick={() =>
                                  markMemberAttendance(
                                    member.id,
                                    'PRESENT',
                                  )
                                }
                              >
                                Mark Present
                              </button>

                              <button
                                className="deactivate-button"
                                onClick={() =>
                                  markMemberAttendance(
                                    member.id,
                                    'ABSENT',
                                  )
                                }
                              >
                                Mark Absent
                              </button>
                            </>
                          )}                         
 <button
                            className="back-button"
                            onClick={() =>
                              openMemberAttendanceHistory(member.id)
                            }
                          >
                            View History
                          </button>
                        </div>  
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          {memberAttendanceHistory && (
            <div className="member-form">
              <div className="page-header">
                <div>
                  <h3>
                    Attendance History —{' '}
                    {memberAttendanceHistory.member.first_name}{' '}
                    {memberAttendanceHistory.member.last_name}
                  </h3>

                  <p className="membership-number">
                    {memberAttendanceHistory.member.membership_number}
                  </p>
                </div>

                <button
                  type="button"
                  className="back-button"
                  onClick={() =>
                    setMemberAttendanceHistory(null)
                  }
                >
                  Close History
                </button>
              </div>

              <div className="member-details">
                <p>
                  <strong>Total Sessions:</strong>{' '}
                  {memberAttendanceHistory.summary.totalSessions}
                </p>

                <p>
                  <strong>✅ Present:</strong>{' '}
                  {memberAttendanceHistory.summary.present}
                </p>

                <p>
                  <strong>❌ Absent:</strong>{' '}
                  {memberAttendanceHistory.summary.absent}
                </p>

                <p>
                  <strong>➖ Not Marked:</strong>{' '}
                  {memberAttendanceHistory.summary.notMarked}
                </p>

                <p>
                  <strong>📊 Attendance Rate:</strong>{' '}
                  {memberAttendanceHistory.summary.attendanceRate}%
                </p>
              </div>

              <div className="members-list">
                {memberAttendanceHistory.history.map((item) => (
                  <div
                    className="member-card"
                    key={item.session_id}
                  >
                    <div className="member-top">
                      <div>
                        <h3>{item.service_type}</h3>

                        <p className="membership-number">
                          {new Date(
                            item.service_date,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="member-details">
                      <p>
                        <strong>Status:</strong>{' '}
                        {item.attendance_status}
                      </p>

                      <p>
                        <strong>Notes:</strong>{' '}
                        {item.notes || 'No notes'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="members-list">
            {attendanceSessions.length === 0 ? (
              <div className="empty">
                <div>📋</div>
                <h3>No attendance sessions found</h3>
                <p>Create your first attendance session.</p>
              </div>
            ) : (
              attendanceSessions.map((session) => (
                             <div
                  className="member-card"
                  key={session.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>{session.service_type}</h3>
                      <p className="membership-number">
                        {new Date(
                          session.service_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>👥 Attendance:</strong>{' '}
                      {session.attendance_count}
                    </p>

                    <p>
                      <strong>📝 Notes:</strong>{' '}
                      {session.notes || 'No notes'}
                    </p>
                  </div>

                  <div className="member-actions">
                    <button
                      className="edit-button"
                      onClick={() =>
                        openAttendanceSession(session.id)
                      }
                      disabled={attendanceLoading}
                    >
                      Open Attendance
                    </button>
                  </div>
                </div>      
                     
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }
  /* =========================
     WEEKLY SERVICES PAGE
     ========================= */

  if (showWeeklyServices) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Weekly Services</h2>
              <p className="welcome">
                Manage recurring church services shown on the public website
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setShowWeeklyServices(false)}
            >
              ← Dashboard
            </button>
          </div>

          {authUser.role === 'ADMIN' && (
            <form
              className="member-form"
              onSubmit={saveWeeklyService}
            >
              <h3>
                {editingWeeklyService
                  ? 'Edit Weekly Service'
                  : 'Add New Weekly Service'}
              </h3>

              {weeklyServiceError && (
                <div className="form-error">
                  {weeklyServiceError}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    value={weeklyServiceName}
                    onChange={(e) =>
                      setWeeklyServiceName(e.target.value)
                    }
                    placeholder="e.g. Sunday Worship"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Day *</label>
                  <select
                    value={weeklyServiceDay}
                    onChange={(e) =>
                      setWeeklyServiceDay(e.target.value)
                    }
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={weeklyServiceStartTime}
                    onChange={(e) =>
                      setWeeklyServiceStartTime(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={weeklyServiceEndTime}
                    onChange={(e) =>
                      setWeeklyServiceEndTime(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={weeklyServiceDescription}
                    onChange={(e) =>
                      setWeeklyServiceDescription(e.target.value)
                    }
                    placeholder="Optional service description"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={weeklyServiceStatus}
                    onChange={(e) =>
                      setWeeklyServiceStatus(
                        e.target.value as 'ACTIVE' | 'INACTIVE',
                      )
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={weeklyServiceDisplayOrder}
                    onChange={(e) =>
                      setWeeklyServiceDisplayOrder(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={weeklyServicePublicVisible}
                      onChange={(e) =>
                        setWeeklyServicePublicVisible(e.target.checked)
                      }
                    />{' '}
                    Show on Public Website
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={weeklyServiceSaving}
                >
                  {weeklyServiceSaving
                    ? editingWeeklyService
                      ? 'Updating Weekly Service...'
                      : 'Saving Weekly Service...'
                    : editingWeeklyService
                      ? 'Update Weekly Service'
                      : 'Add Weekly Service'}
                </button>

                {editingWeeklyService && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={cancelEditWeeklyService}
                    disabled={weeklyServiceSaving}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="members-list">
            {weeklyServices.length === 0 ? (
              <div className="empty">
                <div>⛪</div>
                <h3>No weekly services found</h3>
                <p>Add your first recurring church service.</p>
              </div>
            ) : (
              weeklyServices.map((service) => (
                <div
                  className="member-card"
                  key={service.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>{service.name}</h3>
                      <p className="membership-number">
                        Weekly Service
                      </p>
                    </div>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>📅 Day:</strong>{' '}
                      {service.day_of_week}
                    </p>

                    <p>
                      <strong>🕒 Time:</strong>{' '}
                      {service.start_time.slice(0, 5)}
                      {service.end_time
                        ? ` - ${service.end_time.slice(0, 5)}`
                        : ''}
                    </p>

                    <p>
                      <strong>Description:</strong>{' '}
                      {service.description || 'Not provided'}
                    </p>

                    <p>
                      <strong>Status:</strong>{' '}
                      {service.status}
                    </p>

                    <p>
                      <strong>Public Website:</strong>{' '}
                      {service.public_visible ? 'Visible' : 'Hidden'}
                    </p>

                    <p>
                      <strong>Display Order:</strong>{' '}
                      {service.display_order ?? 0}
                    </p>

                    {authUser.role === 'ADMIN' && (
                      <div className="member-actions">
                        <button
                          className="edit-button"
                          onClick={() => editWeeklyService(service)}
                        >
                          Edit Weekly Service
                        </button>

                        <button
                          className="deactivate-button"
                          onClick={() => deleteWeeklyService(service.id)}
                        >
                          Delete Weekly Service
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     ANNOUNCEMENTS PAGE
     ========================= */

  if (showAnnouncements) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Announcements & Notices</h2>
              <p className="welcome">
                Manage public church announcements and notices
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setShowAnnouncements(false)}
            >
              ← Dashboard
            </button>
          </div>

          {authUser.role === 'ADMIN' && (
            <form
              className="member-form"
              onSubmit={saveAnnouncement}
            >
              <h3>
                {editingAnnouncement
                  ? 'Edit Announcement'
                  : 'Add New Announcement'}
              </h3>

              {announcementError && (
                <div className="form-error">
                  {announcementError}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) =>
                      setAnnouncementTitle(e.target.value)
                    }
                    placeholder="Announcement title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <input
                    type="text"
                    value={announcementType}
                    onChange={(e) =>
                      setAnnouncementType(e.target.value)
                    }
                    placeholder="GENERAL"
                  />
                </div>

                <div className="form-group">
                  <label>Publish Date *</label>
                  <input
                    type="date"
                    value={announcementPublishDate}
                    onChange={(e) =>
                      setAnnouncementPublishDate(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={announcementExpiryDate}
                    onChange={(e) =>
                      setAnnouncementExpiryDate(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={announcementStatus}
                    onChange={(e) =>
                      setAnnouncementStatus(
                        e.target.value as
                          | 'DRAFT'
                          | 'PUBLISHED'
                          | 'ARCHIVED',
                      )
                    }
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={announcementDisplayOrder}
                    onChange={(e) =>
                      setAnnouncementDisplayOrder(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={announcementPublicVisible}
                      onChange={(e) =>
                        setAnnouncementPublicVisible(e.target.checked)
                      }
                    />{' '}
                    Show on Public Website
                  </label>
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={announcementMessage}
                    onChange={(e) =>
                      setAnnouncementMessage(e.target.value)
                    }
                    placeholder="Announcement message"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={announcementSaving}
                >
                  {announcementSaving
                    ? editingAnnouncement
                      ? 'Updating Announcement...'
                      : 'Saving Announcement...'
                    : editingAnnouncement
                      ? 'Update Announcement'
                      : 'Add Announcement'}
                </button>

                {editingAnnouncement && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={cancelEditAnnouncement}
                    disabled={announcementSaving}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="members-list">
            {announcements.length === 0 ? (
              <div className="empty">
                <div>📢</div>
                <h3>No announcements found</h3>
                <p>Add your first church announcement or notice.</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div
                  className="member-card"
                  key={announcement.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>{announcement.title}</h3>
                      <p className="membership-number">
                        {announcement.announcement_type}
                      </p>
                    </div>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>Message:</strong>{' '}
                      {announcement.message}
                    </p>

                    <p>
                      <strong>Publish Date:</strong>{' '}
                      {announcement.publish_date}
                    </p>

                    <p>
                      <strong>Expiry Date:</strong>{' '}
                      {announcement.expiry_date || 'No expiry date'}
                    </p>

                    <p>
                      <strong>Status:</strong>{' '}
                      {announcement.status}
                    </p>

                    <p>
                      <strong>Public Website:</strong>{' '}
                      {announcement.public_visible
                        ? 'Visible'
                        : 'Hidden'}
                    </p>

                    <p>
                      <strong>Display Order:</strong>{' '}
                      {announcement.display_order ?? 0}
                    </p>

                    {authUser.role === 'ADMIN' && (
                      <div className="member-actions">
                        <button
                          className="edit-button"
                          onClick={() =>
                            editAnnouncement(announcement)
                          }
                        >
                          Edit Announcement
                        </button>

                        <button
                          className="deactivate-button"
                          onClick={() =>
                            deleteAnnouncement(announcement.id)
                          }
                        >
                          Delete Announcement
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     HOME CELLS PAGE
     ========================= */

  if (showHomeCells) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Home Cells</h2>
              <p className="welcome">
                Manage church home cells and their leaders
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => setShowHomeCells(false)}
            >
              ← Dashboard
            </button>
          </div>
          {authUser.role === 'ADMIN' && (
          <form
            className="member-form"
            onSubmit={saveHomeCell}
          >
            <h3>
  {editingHomeCell ? 'Edit Home Cell' : 'Add New Home Cell'}
</h3>

            {homeCellError && (
              <div className="form-error">
                {homeCellError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Home Cell Name *</label>
                <input
                  type="text"
                  value={homeCellName}
                  onChange={(e) =>
                    setHomeCellName(e.target.value)
                  }
                  placeholder="e.g. Soldiers of Christ"
                  required
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={homeCellLocation}
                  onChange={(e) =>
                    setHomeCellLocation(e.target.value)
                  }
                  placeholder="e.g. Kanana Zone 12 Ext"
                />
              </div>

              <div className="form-group">
                <label>Leader</label>
                <select
                  value={homeCellLeaderId}
                  onChange={(e) =>
                    setHomeCellLeaderId(e.target.value)
                  }
                >
                  <option value="">No leader assigned</option>

                  {members.map((member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.first_name}{' '}
                      {member.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Meeting Day</label>
                <input
                  type="text"
                  value={homeCellMeetingDay}
                  onChange={(e) =>
                    setHomeCellMeetingDay(e.target.value)
                  }
                  placeholder="e.g. Monday and Friday"
                />
              </div>

              <div className="form-group">
                <label>Meeting Time</label>
                <input
                  type="text"
                  value={homeCellMeetingTime}
                  onChange={(e) =>
                    setHomeCellMeetingTime(e.target.value)
                  }
                  placeholder="e.g. 17:00 - 18:30"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={homeCellStatus}
                  onChange={(e) =>
                    setHomeCellStatus(
                      e.target.value as 'ACTIVE' | 'INACTIVE',
                    )
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  min="0"
                  value={homeCellDisplayOrder}
                  onChange={(e) =>
                    setHomeCellDisplayOrder(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={homeCellPublicVisible}
                    onChange={(e) =>
                      setHomeCellPublicVisible(e.target.checked)
                    }
                  />{' '}
                  Show on Public Website
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-button"
                disabled={homeCellSaving}
              >
                {homeCellSaving
                  ? editingHomeCell
                    ? 'Updating Home Cell...'
                    : 'Saving Home Cell...'
                  : editingHomeCell
                    ? 'Update Home Cell'
                    : 'Add Home Cell'}
              </button>

              {editingHomeCell && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cancelEditHomeCell}
                  disabled={homeCellSaving}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          )}
          <div className="members-list">
            {homeCells.length === 0 ? (
              <div className="empty">
                <div>🏠</div>
                <h3>No home cells found</h3>
                <p>Add your first home cell.</p>
              </div>
            ) : (
              homeCells.map((homeCell) => (
                <div
                  className="member-card"
                  key={homeCell.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>{homeCell.name}</h3>
                      <p className="membership-number">
                        Home Cell
                      </p>
                    </div>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>📍 Location:</strong>{' '}
                      {homeCell.location || 'Not provided'}
                    </p>

                    <p>
                      <strong>👤 Leader:</strong>{' '}
                      {homeCell.leader_name?.trim() ||
                        'No leader assigned'}
                    </p>

                    <p>
                      <strong>📅 Meeting Day:</strong>{' '}
                      {homeCell.meeting_day || 'Not provided'}
                    </p>

                    <p>
                      <strong>🕒 Meeting Time:</strong>{' '}
                      {homeCell.meeting_time || 'Not provided'}
                    </p>

                    <p>
                      <strong>Status:</strong>{' '}
                      {homeCell.status || 'ACTIVE'}
                    </p>

                    <p>
                      <strong>Public Website:</strong>{' '}
                      {homeCell.public_visible ? 'Visible' : 'Hidden'}
                    </p>

                    <p>
                      <strong>Display Order:</strong>{' '}
                      {homeCell.display_order ?? 0}
                    </p>

                  {authUser.role === 'ADMIN' && (
                    <div className="member-actions">
                      <button
                        className="edit-button"
                        onClick={() => editHomeCell(homeCell)}
                      >
                        Edit Home Cell
                      </button>
                      <button
                        className="deactivate-button"
                        onClick={() => deleteHomeCell(homeCell.id)}
                      >
                        Delete Home Cell
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }
  /* =========================
     MINISTRIES PAGE
     ========================= */

  if (showMinistries) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>

          <div className="admin">
            <span>
              {authUser.firstName} {authUser.lastName}
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main">
          <div className="page-header">
            <div>
              <h2>Ministries</h2>
              <p className="welcome">
                Manage church ministries and ministry leaders
              </p>
            </div>

            <button
              className="back-button"
              onClick={() => {
                setShowMinistries(false);
                setMinistryError('');
              }}
            >
              ← Dashboard
            </button>
          </div>

          {authUser.role === 'ADMIN' && (
          <form
            className="member-form"
            onSubmit={saveMinistry}
          >
            <h3>Add New Ministry</h3>

            {ministryError && (
              <div className="form-error">
                {ministryError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Ministry Name *</label>

                <input
                  type="text"
                  value={ministryName}
                  onChange={(e) =>
                    setMinistryName(e.target.value)
                  }
                  placeholder="e.g. Prayer Ministry"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={ministryStatus}
                  onChange={(e) =>
                    setMinistryStatus(
                      e.target.value as 'ACTIVE' | 'INACTIVE',
                    )
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  min="0"
                  value={ministryDisplayOrder}
                  onChange={(e) =>
                    setMinistryDisplayOrder(e.target.value)
                  }
                />
              </div>

              <div className="form-group full-width">
                <label>
                  <input
                    type="checkbox"
                    checked={ministryPublicVisible}
                    onChange={(e) =>
                      setMinistryPublicVisible(e.target.checked)
                    }
                  />{' '}
                  Show on Public Website
                </label>
              </div>

              <div className="form-group full-width">
                <label>Description</label>

                <textarea
                  value={ministryDescription}
                  onChange={(e) =>
                    setMinistryDescription(e.target.value)
                  }
                  placeholder="Describe the ministry and its responsibilities"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-button"
                disabled={ministrySaving}
              >
                {ministrySaving
                  ? 'Saving Ministry...'
                  : 'Add Ministry'}
              </button>              {editingMinistry && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cancelEditMinistry}
                  disabled={ministrySaving}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          )}

          <div className="members-list">
            {ministries.length === 0 ? (
              <div className="empty">
                <div>🙏</div>
                <h3>No ministries found</h3>
                <p>Add the first ministry above.</p>
              </div>
            ) : (
              ministries.map((ministry) => (
                <div
                  className="member-card"
                  key={ministry.id}
                >
                  <div className="member-top">
                    <div>
                      <h3>{ministry.name}</h3>

                      <p className="membership-number">
                        Ministry
                      </p>
                    </div>

                    <span
                      className={
                        ministry.status === 'ACTIVE'
                          ? 'status active'
                          : 'status inactive'
                      }
                    >
                      {ministry.status}
                    </span>
                  </div>

                  <div className="member-details">
                    <p>
                      <strong>Description:</strong>{' '}
                      {ministry.description ||
                        'No description provided'}
                    </p>

                    <p>
                      <strong>Leader:</strong>{' '}
                      {ministry.leader_name?.trim() ||
                        'No leader assigned'}
                    </p>

                    <p>
                      <strong>Public Website:</strong>{' '}
                      {ministry.public_visible ? 'Visible' : 'Hidden'}
                    </p>

                    <p>
                      <strong>Display Order:</strong>{' '}
                      {ministry.display_order}
                    </p>

                    {authUser.role === 'ADMIN' && (
                      <div className="form-group">
                        <label>Assign Ministry Leader</label>

                        <select
                          value={ministry.leader_id || ''}
                          onChange={(e) =>
                            assignMinistryLeader(
                              ministry.id,
                              e.target.value,
                            )
                          }
                        >
                          <option value="">
                            No leader assigned
                          </option>

                          {members.map((member) => (
                            <option
                              key={member.id}
                              value={member.id}
                            >
                              {member.first_name}{' '}
                              {member.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {authUser.role === 'ADMIN' && (
                    <div className="member-actions">
                      <button
                        className="edit-button"
                        onClick={() => editMinistry(ministry)}
                      >
                        Edit Ministry
                      </button>

                      <button
                        className="deactivate-button"
                        onClick={() => deleteMinistry(ministry.id)}
                      >
                        Delete Ministry
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>

        <footer>
          © 2026 The City Of The Living God Fellowship
        </footer>
      </div>
    );
  }

  /* =========================
     DASHBOARD
     ========================= */


  const dashboardOpenPrayerRequests =
    publicPrayerRequests.filter(
      (request) =>
        request.status === 'OPEN' ||
        request.status === 'IN_PROGRESS' ||
        request.status === 'FOLLOW_UP',
    ).length;

  const dashboardNewContactEnquiries =
    contactEnquiries.filter(
      (enquiry) => enquiry.status === 'NEW',
    ).length;

  const dashboardPastoralFollowUps =
    pastoralCareRecords.filter((record) => {
      const followUpDate = record.follow_up_date
        ? record.follow_up_date.slice(0, 10)
        : '';

      const isClosed =
        record.status === 'COMPLETED' ||
        record.status === 'CLOSED';

      return (
        !!followUpDate &&
        followUpDate <= pastoralTodayKey &&
        !isClosed
      );
    }).length;

  const dashboardUpcomingEvents = upcomingEventsCount;

  const dashboardUpcomingEventItems = events
    .filter((event) => {
      const date = event.event_date.slice(0, 10);

      return (
        date >= eventToday &&
        event.status !== 'COMPLETED' &&
        event.status !== 'CANCELLED'
      );
    })
    .sort((a, b) => {
      const aKey =
        a.event_date.slice(0, 10) +
        (a.start_time || '23:59');

      const bKey =
        b.event_date.slice(0, 10) +
        (b.start_time || '23:59');

      return aKey.localeCompare(bKey);
    })
    .slice(0, 3);

  const dashboardWeeklyServiceItems = weeklyServices
    .filter((service) => service.status === 'ACTIVE')
    .sort(
      (a, b) =>
        a.display_order - b.display_order ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 4);


  const dashboardAnnouncementItems = announcements
    .filter((announcement) => {
      const publishDate = announcement.publish_date.slice(0, 10);
      const expiryDate = announcement.expiry_date
        ? announcement.expiry_date.slice(0, 10)
        : '';

      return (
        announcement.status === 'PUBLISHED' &&
        publishDate <= eventToday &&
        (!expiryDate || expiryDate >= eventToday)
      );
    })
    .sort(
      (a, b) =>
        a.display_order - b.display_order ||
        b.publish_date.localeCompare(a.publish_date),
    )
    .slice(0, 3);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-brand">
          <button
            type="button"
            className="dashboard-menu-icon"
            aria-label="Open navigation menu"
            aria-expanded={dashboardMenuOpen}
            onClick={() =>
              setDashboardMenuOpen((open) => !open)
            }
          >
            ☰
          </button>

          <div>
            <h1>CLGF CMS</h1>
            <p>The City Of The Living God Fellowship</p>
          </div>
        </div>

        <div className="dashboard-user">
          <div className="dashboard-user-icon">●</div>

          <div className="dashboard-user-details">
            <strong>
              {authUser.firstName} {authUser.lastName}
            </strong>
            <span>
              {authUser.role === 'ADMIN'
                ? 'Administrator'
                : authUser.role}
            </span>
          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={logout}
          >
            ↪ Logout
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside
          className={
            dashboardMenuOpen
              ? 'dashboard-sidebar dashboard-sidebar-open'
              : 'dashboard-sidebar'
          }
          onClick={(event) => {
            if (
              (event.target as HTMLElement).closest(
                'button',
              )
            ) {
              setDashboardMenuOpen(false);
            }
          }}
        >
          <button className="sidebar-active">
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => setShowMembers(true)}>
            <span>♟</span>
            Members
          </button>

          <button onClick={() => setShowMinistries(true)}>
            <span>♟</span>
            Ministries
          </button>

          <button onClick={() => setShowHomeCells(true)}>
            <span>⌂</span>
            Home Cells
          </button>

          <button onClick={() => setShowAttendance(true)}>
            <span>✓</span>
            Attendance
          </button>

          <button
            onClick={() => {
              loadSermons();
              setShowSermons(true);
            }}
          >
            <span>▤</span>
            Sermons & Resources
          </button>

          <button
            className="sidebar-badge-button"
            onClick={() => setShowEvents(true)}
          >
            <span>▣</span>
            <span className="sidebar-nav-label">Events</span>
            {dashboardUpcomingEvents > 0 && (
              <span className="sidebar-notification-badge">
                {dashboardUpcomingEvents}
              </span>
            )}
          </button>

          <button onClick={() => setShowGiving(true)}>
            <span>♥</span>
            Giving
          </button>

          <button onClick={() => setShowFinance(true)}>
            <span>▥</span>
            Finance
          </button>

          <button
            className="sidebar-badge-button"
            onClick={() => setShowPastoralCare(true)}
          >
            <span>♣</span>
            <span className="sidebar-nav-label">
              Pastoral Care
            </span>
            {dashboardPastoralFollowUps > 0 && (
              <span className="sidebar-notification-badge">
                {dashboardPastoralFollowUps}
              </span>
            )}
          </button>

          <button onClick={() => setShowLeadership(true)}>
            <span>♟</span>
            Leadership
          </button>

          <button onClick={() => setShowReports(true)}>
            <span>▤</span>
            Reports
          </button>

          {authUser.role === 'ADMIN' && (
            <>
              <button
                onClick={() => {
                  loadWeeklyServices();
                  setShowWeeklyServices(true);
                }}
              >
                <span>◷</span>
                Weekly Services
              </button>

              <button
                onClick={() => {
                  loadAnnouncements();
                  setShowAnnouncements(true);
                }}
              >
                <span>!</span>
                Announcements
              </button>

              <button
                className="sidebar-badge-button"
                onClick={() => {
                  loadPublicPrayerRequests();
                  setShowPublicPrayerRequests(true);
                }}
              >
                <span>†</span>
                <span className="sidebar-nav-label">
                  Prayer Requests
                </span>
                {dashboardOpenPrayerRequests > 0 && (
                  <span className="sidebar-notification-badge">
                    {dashboardOpenPrayerRequests}
                  </span>
                )}
              </button>

              <button
                className="sidebar-badge-button"
                onClick={() => {
                  loadContactEnquiries();
                  setShowContactEnquiries(true);
                }}
              >
                <span>✉</span>
                <span className="sidebar-nav-label">
                  Contact Enquiries
                </span>
                {dashboardNewContactEnquiries > 0 && (
                  <span className="sidebar-notification-badge">
                    {dashboardNewContactEnquiries}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  loadSystemUsers();
                  setShowUsers(true);
                }}
              >
                <span>●</span>
                Users
              </button>

              <button
                onClick={() => {
                  loadAuditLogs();
                  loadAuditSummary();
                  setShowAuditLog(true);
                }}
              >
                <span>≡</span>
                Activity Log
              </button>
            </>
          )}
        </aside>

        {dashboardMenuOpen && (
          <button
            type="button"
            className="dashboard-menu-overlay"
            aria-label="Close navigation menu"
            onClick={() => setDashboardMenuOpen(false)}
          />
        )}

        <main className="dashboard-content">
          <section className="dashboard-logo-area">
            <img
              src="/branding/clgf-logo.png"
              alt="The City Of The Living God Fellowship"
              className="dashboard-reference-logo"
            />
          </section>

          <section className="dashboard-welcome-panel">
            <h2>
              Welcome to the Church Management System
            </h2>

            <p>
              Manage members, ministries, attendance, giving,
              events and more — for the glory of God.
            </p>

            <div className="dashboard-help">
              “The Lord is Our Help.”
            </div>
          </section>

          {loading && (
            <p className="dashboard-loading">
              Loading members...
            </p>
          )}

          {error && (
            <p className="error">{error}</p>
          )}

          <section className="dashboard-stat-grid">
            <button
              className="dashboard-stat stat-members"
              onClick={() => setShowMembers(true)}
            >
              <span className="stat-icon">👥</span>
              <div>
                <h3>Total Members</h3>
                <strong>{totalMembers}</strong>
                <small>View all members →</small>
              </div>
            </button>

            <button
              className="dashboard-stat stat-active"
              onClick={() => setShowMembers(true)}
            >
              <span className="stat-icon">●</span>
              <div>
                <h3>Active Members</h3>
                <strong>{activeMembers}</strong>
                <small>View active members →</small>
              </div>
            </button>

            <button
              className="dashboard-stat stat-inactive"
              onClick={() => setShowMembers(true)}
            >
              <span className="stat-icon">●</span>
              <div>
                <h3>Inactive Members</h3>
                <strong>{inactiveMembers}</strong>
                <small>View inactive members →</small>
              </div>
            </button>

            <button
              className="dashboard-stat stat-home"
              onClick={() => setShowHomeCells(true)}
            >
              <span className="stat-icon">⌂</span>
              <div>
                <h3>Home Cells</h3>
                <strong>{homeCells.length}</strong>
                <small>View home cells →</small>
              </div>
            </button>

            <button
              className="dashboard-stat stat-attendance"
              onClick={() => setShowAttendance(true)}
            >
              <span className="stat-icon">▣</span>
              <div>
                <h3>Attendance</h3>
                <strong>{attendanceSessions.length}</strong>
                <small>View attendance →</small>
              </div>
            </button>

            <button
              className="dashboard-stat stat-ministries"
              onClick={() => setShowMinistries(true)}
            >
              <span className="stat-icon">♟</span>
              <div>
                <h3>Ministries</h3>
                <strong>{ministries.length}</strong>
                <small>View ministries →</small>
              </div>
            </button>
          </section>

          <section className="dashboard-member-search">
            <div className="dashboard-member-search-heading">
              <div>
                <h2>Find a Member</h2>
                <p>
                  Search by name, membership number, phone or email.
                </p>
              </div>
            </div>

            <div className="dashboard-member-search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search church members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear member search"
                  onClick={() => setSearch('')}
                >
                  ×
                </button>
              )}
            </div>

            {search.trim() && (
              <div className="dashboard-member-results">
                {dashboardMemberSearchResults.length === 0 ? (
                  <div className="dashboard-member-empty">
                    No matching members found.
                  </div>
                ) : (
                  <>
                    {dashboardMemberSearchResults.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        className="dashboard-member-result"
                        onClick={() => {
                          setSearch(member.membership_number);
                          setShowMembers(true);
                        }}
                      >
                        <div className="dashboard-member-result-icon">
                          👤
                        </div>

                        <div>
                          <strong>
                            {member.first_name}{' '}
                            {member.last_name}
                          </strong>

                          <small>
                            {member.membership_number}
                            {member.phone
                              ? ` · ${member.phone}`
                              : ''}
                          </small>
                        </div>

                        <span
                          className={
                            member.status === 'ACTIVE'
                              ? 'dashboard-member-status active'
                              : 'dashboard-member-status inactive'
                          }
                        >
                          {member.status}
                        </span>
                      </button>
                    ))}

                    {filteredMembers.length > 5 && (
                      <button
                        type="button"
                        className="dashboard-member-view-all"
                        onClick={() => setShowMembers(true)}
                      >
                        View all {filteredMembers.length} matches
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </section>

          {authUser.role === 'ADMIN' && (
            <section className="dashboard-schedule">
              <div className="dashboard-schedule-heading">
                <div>
                  <h2>Upcoming Schedule</h2>
                  <p>
                    A quick view of upcoming events and recurring
                    church services.
                  </p>
                </div>
              </div>

              <div className="dashboard-schedule-grid">
                <div className="dashboard-schedule-panel">
                  <div className="dashboard-schedule-panel-heading">
                    <div>
                      <strong>Upcoming Events</strong>
                      <small>
                        {dashboardUpcomingEvents} scheduled
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowEvents(true)}
                    >
                      View All
                    </button>
                  </div>

                  {dashboardUpcomingEventItems.length === 0 ? (
                    <div className="dashboard-schedule-empty">
                      No upcoming events scheduled.
                    </div>
                  ) : (
                    <div className="dashboard-schedule-list">
                      {dashboardUpcomingEventItems.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          className="dashboard-schedule-item"
                          onClick={() => setShowEvents(true)}
                        >
                          <span className="dashboard-schedule-icon">
                            ▣
                          </span>

                          <div>
                            <strong>{event.title}</strong>

                            <small>
                              {new Date(
                                event.event_date.slice(0, 10) +
                                  'T00:00:00',
                              ).toLocaleDateString()}
                              {event.start_time
                                ? ` · ${event.start_time.slice(
                                    0,
                                    5,
                                  )}`
                                : ''}
                            </small>

                            {event.location && (
                              <small>{event.location}</small>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="dashboard-schedule-panel">
                  <div className="dashboard-schedule-panel-heading">
                    <div>
                      <strong>Weekly Services</strong>
                      <small>
                        {dashboardWeeklyServiceItems.length} shown
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        loadWeeklyServices();
                        setShowWeeklyServices(true);
                      }}
                    >
                      Manage
                    </button>
                  </div>

                  {dashboardWeeklyServiceItems.length === 0 ? (
                    <div className="dashboard-schedule-empty">
                      No active weekly services found.
                    </div>
                  ) : (
                    <div className="dashboard-schedule-list">
                      {dashboardWeeklyServiceItems.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          className="dashboard-schedule-item"
                          onClick={() => {
                            loadWeeklyServices();
                            setShowWeeklyServices(true);
                          }}
                        >
                          <span className="dashboard-schedule-icon">
                            ◷
                          </span>

                          <div>
                            <strong>{service.name}</strong>

                            <small>
                              {service.day_of_week}
                              {' · '}
                              {service.start_time.slice(0, 5)}
                              {service.end_time
                                ? `–${service.end_time.slice(
                                    0,
                                    5,
                                  )}`
                                : ''}
                            </small>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {authUser.role === 'ADMIN' && (
            <section className="dashboard-announcements">
              <div className="dashboard-announcements-heading">
                <div>
                  <h2>Announcements & Notices</h2>
                  <p>
                    Current published notices for church
                    administration.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    loadAnnouncements();
                    setShowAnnouncements(true);
                  }}
                >
                  Manage Announcements
                </button>
              </div>

              {dashboardAnnouncementItems.length === 0 ? (
                <div className="dashboard-announcements-empty">
                  No current published announcements.
                </div>
              ) : (
                <div className="dashboard-announcements-list">
                  {dashboardAnnouncementItems.map(
                    (announcement) => (
                      <button
                        key={announcement.id}
                        type="button"
                        className="dashboard-announcement-card"
                        onClick={() => {
                          loadAnnouncements();
                          setShowAnnouncements(true);
                        }}
                      >
                        <div className="dashboard-announcement-icon">
                          !
                        </div>

                        <div>
                          <div className="dashboard-announcement-top">
                            <strong>
                              {announcement.title}
                            </strong>

                            <span>
                              {announcement.announcement_type}
                            </span>
                          </div>

                          <p>{announcement.message}</p>

                          <small>
                            Published{' '}
                            {new Date(
                              announcement.publish_date.slice(
                                0,
                                10,
                              ) + 'T00:00:00',
                            ).toLocaleDateString()}
                            {announcement.expiry_date
                              ? ` · Expires ${new Date(
                                  announcement.expiry_date.slice(
                                    0,
                                    10,
                                  ) + 'T00:00:00',
                                ).toLocaleDateString()}`
                              : ''}
                          </small>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              )}
            </section>
          )}

          {authUser.role === 'ADMIN' && (
            <section className="dashboard-quick-actions">
              <div className="dashboard-quick-heading">
                <h2>Quick Actions</h2>
                <p>
                  Start common church administration tasks.
                </p>
              </div>

              <div className="dashboard-quick-grid">
                <button
                  type="button"
                  className="dashboard-quick-card"
                  onClick={openAddMember}
                >
                  <span>＋</span>
                  <div>
                    <strong>Add Member</strong>
                    <small>Register a new member</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="dashboard-quick-card"
                  onClick={() => {
                    setAttendanceDate('');
                    setAttendanceType('');
                    setAttendanceNotes('');
                    setAttendanceError('');
                    setShowAttendance(true);
                  }}
                >
                  <span>✓</span>
                  <div>
                    <strong>Record Attendance</strong>
                    <small>Create attendance session</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="dashboard-quick-card"
                  onClick={() => {
                    cancelEditingGiving();
                    setShowGiving(true);
                  }}
                >
                  <span>♥</span>
                  <div>
                    <strong>Add Giving</strong>
                    <small>Record a giving entry</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="dashboard-quick-card"
                  onClick={() => {
                    cancelEditingEvent();
                    setShowEvents(true);
                  }}
                >
                  <span>▣</span>
                  <div>
                    <strong>Add Event</strong>
                    <small>Create a church event</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="dashboard-quick-card"
                  onClick={() => {
                    cancelEditingPastoralCare();
                    setShowPastoralCare(true);
                  }}
                >
                  <span>♡</span>
                  <div>
                    <strong>Add Pastoral Care</strong>
                    <small>Start a care record</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="dashboard-quick-card"
                  onClick={() => {
                    cancelEditingSermon();
                    setShowSermons(true);
                  }}
                >
                  <span>▶</span>
                  <div>
                    <strong>Add Sermon</strong>
                    <small>Create a sermon resource</small>
                  </div>
                </button>
              </div>
            </section>
          )}

          {authUser.role === 'ADMIN' && (
            <section className="dashboard-attention">
              <div className="dashboard-attention-heading">
                <div>
                  <h2>Needs Attention</h2>
                  <p>
                    Quick access to items requiring leadership
                    follow-up.
                  </p>
                </div>
              </div>

              <div className="dashboard-attention-grid">
                <button
                  type="button"
                  className="attention-card"
                  onClick={() =>
                    setShowPublicPrayerRequests(true)
                  }
                >
                  <span className="attention-icon">🙏</span>
                  <div>
                    <strong>
                      {dashboardOpenPrayerRequests}
                    </strong>
                    <h3>Open Prayer Requests</h3>
                    <small>Review prayer requests →</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="attention-card"
                  onClick={() =>
                    setShowContactEnquiries(true)
                  }
                >
                  <span className="attention-icon">✉</span>
                  <div>
                    <strong>
                      {dashboardNewContactEnquiries}
                    </strong>
                    <h3>New Contact Enquiries</h3>
                    <small>Review enquiries →</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="attention-card"
                  onClick={() => setShowPastoralCare(true)}
                >
                  <span className="attention-icon">♥</span>
                  <div>
                    <strong>
                      {dashboardPastoralFollowUps}
                    </strong>
                    <h3>Pastoral Follow-ups</h3>
                    <small>Due or overdue →</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="attention-card"
                  onClick={() => setShowEvents(true)}
                >
                  <span className="attention-icon">◷</span>
                  <div>
                    <strong>
                      {dashboardUpcomingEvents}
                    </strong>
                    <h3>Upcoming Events</h3>
                    <small>View event schedule →</small>
                  </div>
                </button>
              </div>
            </section>
          )}

          {authUser.role === 'ADMIN' && (
            <section className="dashboard-recent-activity">
              <div className="dashboard-recent-heading">
                <div>
                  <h2>Recent Activity</h2>
                  <p>
                    Latest administrative actions across the CMS.
                  </p>
                </div>

                <button
                  type="button"
                  className="dashboard-view-activity"
                  onClick={() => {
                    loadAuditLogs();
                    loadAuditSummary();
                    setShowAuditLog(true);
                  }}
                >
                  View Full Activity Log
                </button>
              </div>

              {recentAuditError && (
                <p className="dashboard-recent-error">
                  {recentAuditError}
                </p>
              )}

              {recentAuditLoading ? (
                <div className="dashboard-recent-empty">
                  Loading recent activity...
                </div>
              ) : recentAuditLogs.length === 0 ? (
                <div className="dashboard-recent-empty">
                  No recent activity found.
                </div>
              ) : (
                <div className="dashboard-recent-list">
                  {recentAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="dashboard-recent-item"
                    >
                      <div className="dashboard-recent-marker">
                        ●
                      </div>

                      <div className="dashboard-recent-content">
                        <div className="dashboard-recent-top">
                          <strong>
                            {log.module.replaceAll('_', ' ')}
                          </strong>

                          <span>
                            {log.action.replaceAll('_', ' ')}
                          </span>
                        </div>

                        <p>
                          {log.description ||
                            log.entity_type?.replaceAll(
                              '_',
                              ' ',
                            ) ||
                            'CMS activity'}
                        </p>

                        <small>
                          {log.actor_name ||
                            log.actor_email ||
                            'System'}
                          {' • '}
                          {new Date(
                            log.created_at,
                          ).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {authUser.role === 'ADMIN' && (
            <button
              type="button"
              className="dashboard-add-member"
              onClick={openAddMember}
            >
              + Add New Member
            </button>
          )}
        </main>
      </div>

      <footer className="dashboard-footer">
        <span>
          © 2026 The City Of The Living God Fellowship
        </span>

        <strong>The Lord is Our Help.</strong>
      </footer>
    </div>
  );

}

// ACTIVITY_LOG_PATCH_TEST
export default App;
