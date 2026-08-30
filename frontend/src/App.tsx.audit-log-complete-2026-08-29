import { useEffect, useState } from 'react';
import './App.css';

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
};

type HomeCell = {
  id: string;
  name: string;
  location: string | null;
  leader_id: string | null;
  leader_name?: string;
  meeting_day: string | null;
  meeting_time: string | null;
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
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceSessionDetail | null>(null);
  const [memberAttendanceHistory, setMemberAttendanceHistory] =
    useState<MemberAttendanceHistory | null>(null);
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

  const [pastoralCareRecords, setPastoralCareRecords] =
    useState<PastoralCareRecord[]>([]);

  const [leadershipAssignments, setLeadershipAssignments] =
    useState<LeadershipAssignment[]>([]);
  const [showLeadership, setShowLeadership] = useState(false);
  const [showReports, setShowReports] = useState(false);

  const [systemUsers, setSystemUsers] =
    useState<SystemUser[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
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
  const [homeCellName, setHomeCellName] = useState('');
  const [homeCellLocation, setHomeCellLocation] = useState('');
  const [homeCellMeetingDay, setHomeCellMeetingDay] = useState('');
  const [homeCellMeetingTime, setHomeCellMeetingTime] = useState('');
  const [homeCellLeaderId, setHomeCellLeaderId] = useState('');
  const [homeCellSaving, setHomeCellSaving] = useState(false);
  const [homeCellError, setHomeCellError] = useState('');
    const [showHomeCells, setShowHomeCells] = useState(false);
  const [ministryName, setMinistryName] = useState('');
  const [ministryDescription, setMinistryDescription] = useState('');
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
        `http://localhost:3000/finance/${transaction.id}`,
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
        ? `http://localhost:3000/finance/${editingFinanceTransaction.id}`
        : 'http://localhost:3000/finance';

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
    authFetch('http://localhost:3000/leadership')
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
    authFetch('http://localhost:3000/pastoral-care')
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

  const loadEvents = () => {
    authFetch('http://localhost:3000/events')
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
      `http://localhost:3000/giving${query ? `?${query}` : ''}`,
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
      `http://localhost:3000/giving/summary${query ? `?${query}` : ''}`,
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
        `http://localhost:3000/giving/${record.id}`,
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
        ? `http://localhost:3000/giving/${editingGivingRecord.id}`
        : 'http://localhost:3000/giving';

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
      `http://localhost:3000/finance${
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
      `http://localhost:3000/finance/summary${
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
    authFetch("http://localhost:3000/attendance")
      .then((response) => response.json())
      .then((data) => {
        setAttendanceSessions(data);
      })
      .catch((err) => {
        console.error("Failed to load attendance:", err);
      });
  };


  const loadHomeCells = () => {
    authFetch("http://localhost:3000/home-cells")
      .then((response) => response.json())
      .then((data) => {
        setHomeCells(data);
      })
      .catch((err) => {
        console.error("Failed to load home cells:", err);
      });
  };


  const loadMinistries = () => {
    authFetch("http://localhost:3000/ministries")
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

    authFetch('http://localhost:3000/members')
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
        ? 'http://localhost:3000/events/' + editingEvent.id
        : 'http://localhost:3000/events';

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
        'http://localhost:3000/events/' + event.id,
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
        ? 'http://localhost:3000/pastoral-care/' +
          editingPastoralCare.id
        : 'http://localhost:3000/pastoral-care';

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
        'http://localhost:3000/pastoral-care/' +
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
        ? 'http://localhost:3000/leadership/' +
          editingLeadership.id
        : 'http://localhost:3000/leadership';

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
        'http://localhost:3000/leadership/' +
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

  const loadAuditSummary = async () => {
    if (!authUser || authUser.role !== 'ADMIN') return;

    try {
      const response = await authFetch(
        'http://localhost:3000/audit/summary',
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
        `http://localhost:3000/audit?${params.toString()}`,
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
        'http://localhost:3000/users',
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
        ? `http://localhost:3000/users/${editingSystemUser.id}`
        : 'http://localhost:3000/users';

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
        `http://localhost:3000/users/${user.id}/status`,
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
        `http://localhost:3000/users/${user.id}/password`,
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
        'http://localhost:3000/auth/login',
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

    setAuthUser(null);
    setAccessToken('');
    setLoginPassword('');
    setLoginError('');
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
      loadSystemUsers();
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
    const text = search.toLowerCase();

    return (
      member.first_name.toLowerCase().includes(text) ||
      member.last_name.toLowerCase().includes(text) ||
      member.membership_number.toLowerCase().includes(text) ||
      member.phone.toLowerCase().includes(text) ||
      member.email.toLowerCase().includes(text)
    );
  });

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
        'http://localhost:3000/members',
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
        `http://localhost:3000/members/${id}/deactivate`,
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
        `http://localhost:3000/members/${id}/reactivate`,
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
        `http://localhost:3000/members/${editingMember.id}`,
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
                {authUser.role === 'ADMIN' && (
                  <div className="member-actions">
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
        ? `http://localhost:3000/ministries/${editingMinistry.id}`
        : 'http://localhost:3000/ministries';

      const response = await authFetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: ministryName.trim(),
          description: ministryDescription.trim() || null,
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
        `http://localhost:3000/ministries/${ministryId}`,
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
    setMinistryError('');
  };

  const cancelEditMinistry = () => {
    setEditingMinistry(null);
    setMinistryName('');
    setMinistryDescription('');
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
        `http://localhost:3000/ministries/${id}`,
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
    setHomeCellError('');
  };

  const cancelEditHomeCell = () => {
    setEditingHomeCell(null);
    setHomeCellName('');
    setHomeCellLocation('');
    setHomeCellLeaderId('');
    setHomeCellMeetingDay('');
    setHomeCellMeetingTime('');
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
        `http://localhost:3000/home-cells/${id}`,
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
        ? `http://localhost:3000/home-cells/${editingHomeCell.id}`
        : 'http://localhost:3000/home-cells';

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

      await loadHomeCells();
    loadAttendance();

      setHomeCellName('');
      setHomeCellLocation('');
      setHomeCellLeaderId('');
      setHomeCellMeetingDay('');
      setHomeCellMeetingTime('');

      await loadHomeCells();
    loadAttendance();
    } catch (err) {
      console.error(err);
      setHomeCellError('Unable to save home cell.');
    } finally {
      setHomeCellSaving(false);
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
        `http://localhost:3000/attendance/report${
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
  const openMemberAttendanceHistory = async (memberId: string) => {
    try {
      const response = await authFetch(
        `http://localhost:3000/attendance/member/${memberId}/history`,
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
        `http://localhost:3000/attendance/${id}`,
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
        `http://localhost:3000/attendance/${selectedAttendance.id}/members`,
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
        `http://localhost:3000/attendance/${selectedAttendance.id}/members/${memberId}`,
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
        'http://localhost:3000/attendance',
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
        `http://localhost:3000/events/${event.id}/attendance`,
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
      'http://localhost:3000/attendance/report',
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

                            <div className="members-list">
                {members
                  .filter((member) => member.status === 'ACTIVE')
                  .map((member) => {
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
                  })}
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

                    <span className="status active">
                      ACTIVE
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
        <h2>Church Dashboard</h2>

        <p className="welcome">
          Welcome to the Church Management System
        </p>

        {loading && <p>Loading members...</p>}

        {error && <p className="error">{error}</p>}

        <div className="cards">
          <div className="card">
            <span>👥</span>
            <h3>Total Members</h3>
            <strong>{totalMembers}</strong>
          </div>

          <div className="card">
            <span>🟢</span>
            <h3>Active Members</h3>
            <strong>{activeMembers}</strong>
          </div>

          <div className="card">
            <span>⚪</span>
            <h3>Inactive Members</h3>
            <strong>{inactiveMembers}</strong>
          </div>

          <div className="card">
            <span>🏠</span>
            <h3>Home Cells</h3>
            <strong>{homeCells.length}</strong>
          </div>
          <div className="card">
            <span>📋</span>
            <h3>Attendance</h3>
            <strong>{attendanceSessions.length}</strong>
          </div>

          <div className="card">
            <span>🙏</span>
            <h3>Ministries</h3>
            <strong>{ministries.length}</strong>
          </div>
        </div>

        <div className="actions">
          {authUser.role === 'ADMIN' && (
            <button onClick={openAddMember}>
              + Add Member
            </button>
          )}

          <button onClick={() => setShowMembers(true)}>
            View Members
          </button>


          <button onClick={() => setShowHomeCells(true)}>
            {authUser.role === 'ADMIN'
              ? 'Manage Home Cells'
              : 'View Home Cells'}
          </button>

          
            
         
                    <button onClick={() => setShowMinistries(true)}>
            {authUser.role === 'ADMIN'
              ? 'Manage Ministries'
              : 'View Ministries'}
          </button>

          <button onClick={() => setShowAttendance(true)}>
            Manage Attendance
          </button>

          <button onClick={() => setShowFinance(true)}>
            View Finance
          </button>

          <button onClick={() => setShowGiving(true)}>
            View Giving
          </button>

          <button onClick={() => setShowEvents(true)}>
            {authUser.role === 'ADMIN'
              ? 'Manage Events'
              : 'View Events'}
          </button>

          <button onClick={() => setShowPastoralCare(true)}>
            {authUser.role === 'ADMIN'
              ? 'Manage Pastoral Care'
              : 'View Pastoral Care'}
          </button>

          <button onClick={() => setShowLeadership(true)}>
            {authUser.role === 'ADMIN'
              ? 'Manage Leadership'
              : 'View Leadership'}
          </button>

          {authUser.role === 'ADMIN' && (
            <button
              onClick={() => {
                loadSystemUsers();
                setShowUsers(true);
              }}
            >
              Manage Users
            </button>
          )}


          {authUser.role === 'ADMIN' && (
            <button
              onClick={() => {
                loadAuditLogs();
                loadAuditSummary();
                setShowAuditLog(true);
              }}
            >
              Activity Log
            </button>
          )}

          <button onClick={() => setShowReports(true)}>
            {authUser.role === 'ADMIN'
              ? 'Manage Reports'
              : 'View Reports'}
          </button>

        </div>
      </main>

      <footer>
        © 2026 The City Of The Living God Fellowship
      </footer>
    </div>
  );
}


// ACTIVITY_LOG_PATCH_TEST
export default App;
