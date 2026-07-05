import type { OfficeDesign, WaypointStatusTag } from "../officeDesign/types";

export type GitHubWorkItemStatus = "backlog" | "todo" | "inProgress" | "inReview" | "done" | "unknown";

export type GitHubWorkItem = {
  id: string;
  number: number;
  title: string;
  url: string;
  status: GitHubWorkItemStatus;
  assignees: string[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
};

export type AgentAssignmentState = {
  characterId: string;
  activeItem?: GitHubWorkItem;
  assignedItems: GitHubWorkItem[];
  statusSource: "github" | "schedule" | "idle";
};

export type GitHubOfficeMeeting = {
  itemId: string;
  startedAt: string;
  endsAt: string;
};

export type GitHubOfficeStateSource = "mock" | "github";

export type GitHubOfficeState = {
  fetchedAt: string;
  configured?: boolean;
  mockMode?: boolean;
  backlogItems: GitHubWorkItem[];
  activeItems: GitHubWorkItem[];
  recentBacklogItems: GitHubWorkItem[];
  agentAssignments: Record<string, AgentAssignmentState>;
  source?: GitHubOfficeStateSource;
  activeMeeting?: GitHubOfficeMeeting;
  scenarioId?: string;
};

export type AgentResolvedOfficeState = {
  characterId: string;
  statusTag: WaypointStatusTag;
  targetWaypointId?: string;
  activeItem?: GitHubWorkItem;
  labelText?: string;
  source: "github" | "schedule" | "meeting" | "idle";
};

export type ResolvedOfficeState = Record<string, AgentResolvedOfficeState>;

export type OfficeScheduleStatus = "idle" | "coffeeBreak" | "lunch";

export type OfficeResolverDesign = Pick<OfficeDesign, "characters" | "movementRoutes">;
