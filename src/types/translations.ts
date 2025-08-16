// Define the exact structure of your translations for type safety
export interface TranslationKeys {
  // Common translations
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    confirm: string;
    yes: string;
    no: string;
    switchTo: string;
  };
  // Navigation
  navigation: {
    dashboard: string;
    students: string;
    payments: string;
    reports: string;
    settings: string;
    logout: string;
  };
  // Authentication
  auth: {
    login: string;
    logout: string;
    email: string;
    password: string;
    forgotPassword: string;
    signIn: string;
    signOut: string;
    welcome: string;
    loginSubtitle: string;
    invalidCredentials: string;
    loginSuccess: string;
    resetPassword: string;
    resetPasswordSubtitle: string;
    sendResetLink: string;
    backToLogin: string;
    resetEmailSent: string;
    newPassword: string;
    confirmNewPassword: string;
    updatePassword: string;
    passwordUpdated: string;
    sessionExpired: string;
    unauthorized: string;
    role: {
      admin: string;
      school_staff: string;
      parent: string;
    };
  };
  // Dashboard
  dashboard: {
    title: string;
    overview: string;
    welcome: string;
    lastLogin: string;
    stats: {
      totalStudents: string;
      totalPayments: string;
      pendingPayments: string;
      overduePayments: string;
      thisMonth: string;
      thisYear: string;
      revenue: string;
      collections: string;
    };
    recentActivity: string;
    recentPayments: string;
    notifications: string;
    quickActions: string;
    viewAll: string;
    noData: string;
    loading: string;
    refreshData: string;
    exportData: string;
    chartLabels: {
      paymentsOverTime: string;
      paymentMethods: string;
      studentsByClass: string;
      monthlyRevenue: string;
    };
    filters: {
      today: string;
      thisWeek: string;
      thisMonth: string;
      thisYear: string;
      allTime: string;
    };
  };
  // Students
  students: {
    title: string;
    subtitle: string;
    addStudent: string;
    editStudent: string;
    deleteStudent: string;
    importStudents: string;
    exportStudents: string;
    totalStudents: string;
    searchPlaceholder: string;
    filters: {
      all: string;
      active: string;
      inactive: string;
      class: string;
      paymentStatus: string;
    };
    table: {
      studentName: string;
      studentId: string;
      class: string;
      parent: string;
      phone: string;
      email: string;
      feeBalance: string;
      status: string;
      actions: string;
      enrollmentDate: string;
      lastPayment: string;
    };
    status: {
      active: string;
      inactive: string;
      suspended: string;
      graduated: string;
      transferred: string;
    };
    paymentStatus: {
      upToDate: string;
      partial: string;
      overdue: string;
      exempt: string;
    };
    form: {
      personalInfo: string;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      address: string;
      parentInfo: string;
      parentName: string;
      parentPhone: string;
      parentEmail: string;
      relationship: string;
      academicInfo: string;
      admissionDate: string;
      academicYear: string;
      section: string;
      previousSchool: string;
      emergencyContact: string;
      emergencyName: string;
      emergencyPhone: string;
      medicalInfo: string;
      allergies: string;
      medications: string;
      specialNeeds: string;
    };
    actions: {
      viewProfile: string;
      editProfile: string;
      viewPayments: string;
      sendNotification: string;
      suspendStudent: string;
      activateStudent: string;
      deleteConfirm: string;
    };
    bulk: {
      selectAll: string;
      selectedCount: string;
      bulkActions: string;
      sendBulkNotification: string;
      exportSelected: string;
      updateClass: string;
      updateStatus: string;
    };
    messages: {
      studentAdded: string;
      studentUpdated: string;
      studentDeleted: string;
      noStudentsFound: string;
      importSuccess: string;
      importError: string;
    };
  };
  // Payments
  payments: {
    title: string;
    subtitle: string;
    makePayment: string;
    paymentHistory: string;
    pendingPayments: string;
    processPayment: string;
    recordPayment: string;
    searchPayments: string;
    filters: {
      all: string;
      pending: string;
      completed: string;
      failed: string;
      refunded: string;
      today: string;
      thisWeek: string;
      thisMonth: string;
      dateRange: string;
    };
    table: {
      transactionId: string;
      student: string;
      amount: string;
      paymentMethod: string;
      date: string;
      time: string;
      reference: string;
      status: string;
      actions: string;
      feeType: string;
      academicYear: string;
      term: string;
    };
    status: {
      pending: string;
      processing: string;
      completed: string;
      failed: string;
      cancelled: string;
      refunded: string;
      expired: string;
    };
    methods: {
      mPesa: string;
      airtelMoney: string;
      orangeMoney: string;
      bankTransfer: string;
      cash: string;
      cheque: string;
      card: string;
    };
    feeTypes: {
      tuition: string;
      registration: string;
      uniform: string;
      books: string;
      transport: string;
      meals: string;
      activities: string;
      examination: string;
      library: string;
      laboratory: string;
      other: string;
    };
    form: {
      selectStudent: string;
      selectFeeType: string;
      amount: string;
      paymentMethod: string;
      reference: string;
      notes: string;
      dueDate: string;
      discount: string;
      penalties: string;
      totalAmount: string;
      phoneNumber: string;
      bankDetails: string;
    };
    actions: {
      viewDetails: string;
      printReceipt: string;
      sendReceipt: string;
      refundPayment: string;
      cancelPayment: string;
      verifyPayment: string;
      resendNotification: string;
    };
    receipts: {
      title: string;
      receiptNumber: string;
      issuedTo: string;
      paidBy: string;
      paymentFor: string;
      amountPaid: string;
      paymentDate: string;
      balanceRemaining: string;
      signature: string;
      officialStamp: string;
      thankYou: string;
    };
    statistics: {
      totalCollected: string;
      totalPending: string;
      successRate: string;
      averageAmount: string;
      popularMethod: string;
      dailyCollection: string;
      monthlyGrowth: string;
    };
    notifications: {
      paymentReminder: string;
      paymentOverdue: string;
      paymentReceived: string;
      paymentFailed: string;
      receiptSent: string;
      reminderSent: string;
    };
    messages: {
      paymentSuccess: string;
      paymentFailed: string;
      invalidAmount: string;
      insufficientFunds: string;
      networkError: string;
      receiptGenerated: string;
      receiptSent: string;
      paymentCancelled: string;
      refundProcessed: string;
      noPaymentsFound: string;
    };
    bulk: {
      bulkActions: string;
      selectedPayments: string;
      sendBulkReceipts: string;
      exportSelected: string;
      markAsVerified: string;
      generateReport: string;
    };
  };
  // Form validations
  forms: {
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    passwordTooShort: string;
    confirmPassword: string;
    passwordsNoMatch: string;
  };
  // System messages
  messages: {
    success: string;
    error: string;
    confirmDelete: string;
    noData: string;
    networkError: string;
    saveSuccess: string;
    deleteSuccess: string;
  };
  // Currency
  currency: {
    cdf: string;
    symbol: string;
  };
}

// Create a flattened type for dot notation access
export type FlatTranslationKeys = {
  [K in keyof TranslationKeys]: {
    [P in keyof TranslationKeys[K]]: TranslationKeys[K][P] extends object
      ? {
          [Q in keyof TranslationKeys[K][P]]: `${K}.${P & string}.${Q & string}`
        }[keyof TranslationKeys[K][P]]
      : `${K}.${P & string}`
  }[keyof TranslationKeys[K]]
}[keyof TranslationKeys];

// Enhanced translation function with type safety
export interface TypedTranslationFunction {
  (key: FlatTranslationKeys, params?: Record<string, string>): string;
  (key: string, params?: Record<string, string>): string; // Fallback for dynamic keys
}

// Enhanced i18n context with type safety
export interface TypedI18nContextType {
  locale: 'fr' | 'en';
  t: TypedTranslationFunction;
  switchLanguage: (locale: 'fr' | 'en') => void;
}

// Supported locales type
export type SupportedLocale = 'fr' | 'en';

// Translation namespace type
export type TranslationNamespace = keyof TranslationKeys;
