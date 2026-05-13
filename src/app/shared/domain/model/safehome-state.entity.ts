
export interface SafeUserEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
  plan: string;
  initials: string;
  memberSince: string;
}


export interface HomeZoneEntity {
  id: number;
  name: string;
  deviceCount: number;
  status: 'safe' | 'warning' | 'critical';
  signal: number;
}


export interface SafeSettingsEntity {
  homeName: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  systemNotifications: boolean;
  emailSummary: boolean;
  autoArm: boolean;
  darkMode: boolean;
  twoFactor: boolean;
  autoLogout: boolean;
  loginAlerts: boolean;
  sensibility: string;
  updateTime: string;
  sessionDuration: string;
  zoneReviewInterval: string;
  historyRetention: string;
  hiddenSensors: boolean;
  language: 'en' | 'es';
}


export interface AccountActivityEntity {
  id: number;
  title: string;
  description: string;
  time: string;
  tone: 'success' | 'warning' | 'info' | 'danger';
}


export interface SupportTicketEntity {
  id: number;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  createdAt: string;
}



export interface RegisteredAccountEntity {
  name: string;
  email: string;
  password: string;
}
