import type { MovementRouteStep } from "../officeDesign/types";
import { getGitHubAgentProfile, workItemMatchesCharacter } from "./githubAgentMap";
import { getOfficeScheduleStatus } from "./schedule";
import type {
  AgentAssignmentState,
  AgentResolvedOfficeState,
  GitHubOfficeState,
  GitHubWorkItem,
  GitHubWorkItemStatus,
  OfficeResolverDesign,
  ResolvedOfficeState,
} from "./types";

const statusPriority: Record<GitHubWorkItemStatus, number> = {
  inProgress: 0,
  inReview: 1,
  todo: 2,
  backlog: 3,
  unknown: 4,
  done: 5,
};

function pickBestWorkItem(items: GitHubWorkItem[]) {
  return [...items].sort((left, right) => {
    const statusCompare = statusPriority[left.status] - statusPriority[right.status];
    if (statusCompare !== 0) {
      return statusCompare;
    }
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  })[0];
}

function findCharacterRouteStep(
  design: OfficeResolverDesign,
  characterId: string,
  preferredStatus: AgentResolvedOfficeState["statusTag"],
) {
  const route = design.movementRoutes.find((candidate) => candidate.characterId === characterId);
  if (!route) {
    return undefined;
  }

  const ownMatch = route.steps.find((step) => step.statusTag === preferredStatus);
  if (ownMatch) {
    return ownMatch;
  }

  if (preferredStatus === "lunch") {
    return route.steps.find((step) => step.statusTag === "coffeeBreak") ?? route.steps.find((step) => step.statusTag === "idle");
  }

  if (preferredStatus === "coffeeBreak") {
    return route.steps.find((step) => step.statusTag === "lunch") ?? route.steps.find((step) => step.statusTag === "idle");
  }

  return route.steps.find((step) => step.statusTag === "idle");
}

function buildLabel(characterId: string, statusTag: AgentResolvedOfficeState["statusTag"], activeItem?: GitHubWorkItem) {
  const profile = getGitHubAgentProfile(characterId);
  const name = profile?.characterName ?? characterId;
  switch (statusTag) {
    case "working":
      return activeItem ? `${name} — Working #${activeItem.number}` : `${name} — Working`;
    case "coffeeBreak":
      return `${name} — Coffee`;
    case "lunch":
      return `${name} — Lunch`;
    case "meeting":
      return `${name} — Meeting`;
    case "idle":
    default:
      return `${name} — Idle`;
  }
}

function isMeetingActive(githubState: GitHubOfficeState, now: Date) {
  if (!githubState.activeMeeting) {
    return false;
  }
  return new Date(githubState.activeMeeting.endsAt).getTime() > now.getTime();
}

function findAssignment(characterId: string, githubState: GitHubOfficeState): AgentAssignmentState | undefined {
  return githubState.agentAssignments[characterId];
}

function findActiveWorkItem(characterId: string, githubState: GitHubOfficeState) {
  const assignment = findAssignment(characterId, githubState);
  if (assignment?.activeItem) {
    return assignment.activeItem;
  }

  const matches = githubState.activeItems.filter((item) =>
    workItemMatchesCharacter(characterId, item.assignees, item.labels),
  );
  return matches.length > 0 ? pickBestWorkItem(matches) : undefined;
}

function resolveSingleCharacter(
  characterId: string,
  design: OfficeResolverDesign,
  githubState: GitHubOfficeState,
  now: Date,
): AgentResolvedOfficeState {
  if (isMeetingActive(githubState, now)) {
    const step = findCharacterRouteStep(design, characterId, "meeting");
    return {
      characterId,
      statusTag: "meeting",
      targetWaypointId: step?.id,
      labelText: buildLabel(characterId, "meeting"),
      source: "meeting",
    };
  }

  const activeItem = findActiveWorkItem(characterId, githubState);
  if (activeItem) {
    const step = findCharacterRouteStep(design, characterId, "working");
    return {
      characterId,
      statusTag: "working",
      targetWaypointId: step?.id,
      activeItem,
      labelText: buildLabel(characterId, "working", activeItem),
      source: "github",
    };
  }

  const scheduleStatus = getOfficeScheduleStatus(now);
  if (scheduleStatus === "lunch") {
    const step = findCharacterRouteStep(design, characterId, "lunch");
    return {
      characterId,
      statusTag: "lunch",
      targetWaypointId: step?.id,
      labelText: buildLabel(characterId, "lunch"),
      source: "schedule",
    };
  }

  if (scheduleStatus === "coffeeBreak") {
    const step = findCharacterRouteStep(design, characterId, "coffeeBreak");
    return {
      characterId,
      statusTag: "coffeeBreak",
      targetWaypointId: step?.id,
      labelText: buildLabel(characterId, "coffeeBreak"),
      source: "schedule",
    };
  }

  const step = findCharacterRouteStep(design, characterId, "idle");
  return {
    characterId,
    statusTag: "idle",
    targetWaypointId: step?.id,
    labelText: buildLabel(characterId, "idle"),
    source: "idle",
  };
}

export function resolveAgentOfficeState({
  now,
  githubState,
  design,
  editorMode,
}: {
  now: Date;
  githubState: GitHubOfficeState;
  design: OfficeResolverDesign;
  editorMode?: boolean;
}): ResolvedOfficeState {
  return Object.fromEntries(
    design.characters.map((character) => {
      const resolved = resolveSingleCharacter(character.id, design, githubState, now);
      if (editorMode) {
        return [character.id, { ...resolved, targetWaypointId: undefined }];
      }
      return [character.id, resolved];
    }),
  );
}

export function resolveWaypointStepForStatus(
  design: OfficeResolverDesign,
  characterId: string,
  statusTag: AgentResolvedOfficeState["statusTag"],
): MovementRouteStep | undefined {
  return findCharacterRouteStep(design, characterId, statusTag);
}
