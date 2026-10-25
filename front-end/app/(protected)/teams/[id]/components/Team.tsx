import { TeamResponse } from "@/types/types";

export default function Team({ team }: Pick<TeamResponse, "team">) {
  return <div>{team.title}</div>;
}
