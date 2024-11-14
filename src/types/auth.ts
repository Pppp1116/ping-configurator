export interface User {
  id: string;
  email: string;
  blocked: boolean;
  lastLogin: string;
  ipAddress: string;
  deviceInfo: string;
}

export interface LoginAttempt {
  userId: string;
  timestamp: string;
  ipAddress: string;
  deviceInfo: string;
  success: boolean;
}

export interface BlockedUser {
  userId: string;
  blocked: boolean;
  blockedAt: string;
  reason?: string;
}