import { User_account } from "./user.model";

export interface AuthResponse {
    jwt: string;
    user: User_account;
  }