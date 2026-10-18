export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  password: string;
  confirmPassword: string;
}

export interface CreateTeamDTO {
  title: string;
  members: string[];
}
