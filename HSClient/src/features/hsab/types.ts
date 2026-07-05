import type { AgentResolvedOfficeState } from "./features/githubOfficeState/types";

export type AgentStatus = "idle" | "working" | "blocked" | "done";

export type AgentRole = "Säljare" | "Frontend Engineer" | "Fullstack Engineer" | "QA Specialist";

export interface AgentLog {
  id: string;
  timestamp: string;
  message: string;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  currentTask: string;
  lastActivity: string;
  logs: AgentLog[];
  officeState?: AgentResolvedOfficeState;
}

export interface GithubIssue {
  id: number;
  title: string;
  state: "open" | "closed";
}

export interface GithubPullRequest {
  id: number;
  title: string;
  state: "open" | "merged";
}

export interface GithubCommit {
  sha: string;
  message: string;
  author: string;
}
