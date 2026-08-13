export type UserRole =
  | "ADMIN"
  | "OWNER"
  | "PROFESSIONAL"
  | "CLIENT";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileImageUrl?: string | null;
  role: UserRole;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type AdminLoginResponse =
  | {
      requiresTwoFactor: true;
      challengeToken: string;
      user: User;
    }
  | {
      requiresTwoFactor: false;
      token: string;
      user: User;
    };
