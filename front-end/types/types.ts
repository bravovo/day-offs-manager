export interface Team {
  _id: string;
  title: string;
  members: Array<{
    memberId: string;
    role: string;
  }>;
}

export interface TeamsResponse {
  success: boolean;
  teams: Team[];
}
