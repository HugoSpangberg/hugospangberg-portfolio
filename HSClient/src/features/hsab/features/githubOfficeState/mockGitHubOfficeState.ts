import { workItemMatchesCharacter } from "./githubAgentMap";
import type { AgentAssignmentState, GitHubOfficeState, GitHubWorkItem } from "./types";

export type MockGitHubOfficeScenario =
  | "noTasks"
  | "bobbanAssigned"
  | "newBacklogItem"
  | "davidAndLuddeAssigned";

const nowIso = () => new Date().toISOString();

const createItem = (item: Omit<GitHubWorkItem, "createdAt" | "updatedAt">): GitHubWorkItem => ({
  ...item,
  createdAt: nowIso(),
  updatedAt: nowIso(),
});

const scenarios: Record<MockGitHubOfficeScenario, GitHubWorkItem[]> = {
  noTasks: [],
  bobbanAssigned: [
    createItem({
      id: "issue-42",
      number: 42,
      title: "Stabilize office status resolver",
      status: "inProgress",
      assignees: ["robin"],
      labels: ["bobban", "backend"],
      url: "",
    }),
  ],
  newBacklogItem: [
    createItem({
      id: "issue-99",
      number: 99,
      title: "Plan new sales automation backlog",
      status: "backlog",
      assignees: [],
      labels: ["support", "mafs"],
      url: "",
    }),
  ],
  davidAndLuddeAssigned: [
    createItem({
      id: "issue-18",
      number: 18,
      title: "Polish frontend issue label rendering",
      status: "todo",
      assignees: ["emil"],
      labels: ["frontend", "david"],
      url: "",
    }),
    createItem({
      id: "issue-27",
      number: 27,
      title: "QA smoke pass for waypoint exports",
      status: "inReview",
      assignees: ["adam"],
      labels: ["test", "ludde"],
      url: "",
    }),
  ],
};

const characterIds = ["viktor", "emil", "robin", "adam"] as const;

function buildAgentAssignments(items: GitHubWorkItem[]): Record<string, AgentAssignmentState> {
  return Object.fromEntries(
    characterIds.map((characterId) => {
      const assignedItems = items.filter((item) =>
        workItemMatchesCharacter(characterId, item.assignees, item.labels),
      );
      const activeItem = assignedItems.find((item) =>
        item.status === "todo" || item.status === "inProgress" || item.status === "inReview",
      );

      return [
        characterId,
        {
          characterId,
          activeItem,
          assignedItems,
          statusSource: activeItem ? "github" : "idle",
        } satisfies AgentAssignmentState,
      ];
    }),
  );
}

export function getMockGitHubOfficeState(scenario: MockGitHubOfficeScenario = "noTasks"): GitHubOfficeState {
  const items = scenarios[scenario].map((item) => ({ ...item }));
  const backlogItems = items.filter((item) => item.status === "backlog");
  const activeItems = items.filter((item) => item.status === "todo" || item.status === "inProgress" || item.status === "inReview");

  return {
    source: "mock",
    fetchedAt: nowIso(),
    configured: false,
    mockMode: true,
    backlogItems,
    activeItems,
    recentBacklogItems: scenario === "newBacklogItem" ? backlogItems : [],
    agentAssignments: buildAgentAssignments(items),
    scenarioId: scenario,
  };
}

export function getAvailableMockGitHubOfficeScenarios(): MockGitHubOfficeScenario[] {
  return Object.keys(scenarios) as MockGitHubOfficeScenario[];
}
