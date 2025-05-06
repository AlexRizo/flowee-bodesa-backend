import { Role } from "./models.interfaces";

export interface IUserPayload {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

