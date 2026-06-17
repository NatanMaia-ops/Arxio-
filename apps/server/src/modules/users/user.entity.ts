export type User = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  disabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithPasswordHash = User & {
  passwordHash: string;
};
