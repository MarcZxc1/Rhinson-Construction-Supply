import { UserRole } from "@prisma/client";

export interface User {
  id: string;
  username: string;
  email: string;
  contactNumber: string | null;
  address: string | null;
  role: UserRole;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  contactNumber?: string;
  address?: string;
  role?: UserRole;
}

// Using Partial to make all properties optional
export type UserUpdateInput = Partial<UserCreateInput> & {
  isActive?: boolean;
};

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  contactNumber: string | null;
  address: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
}

export interface RegisterResponse {
  status: string;
  data: string;
}
