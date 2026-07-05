export type GitHubAgentProfile = {
  characterId: string;
  characterName: string;
  githubUsername: string;
  labels: string[];
};

export const githubAgentMap: Record<string, GitHubAgentProfile> = {
  viktor: {
    characterId: "viktor",
    characterName: "Mafs",
    githubUsername: "viktor",
    labels: ["mafs", "sales", "support", "säljare"],
  },
  emil: {
    characterId: "emil",
    characterName: "David",
    githubUsername: "emil",
    labels: ["david", "frontend"],
  },
  robin: {
    characterId: "robin",
    characterName: "Bobban",
    githubUsername: "robin",
    labels: ["bobban", "backend", "fullstack"],
  },
  adam: {
    characterId: "adam",
    characterName: "Ludde",
    githubUsername: "adam",
    labels: ["ludde", "test", "qa"],
  },
};

const normalize = (value: string) => value.trim().toLowerCase();

export function getGitHubAgentProfile(characterId: string) {
  return githubAgentMap[characterId];
}

export function workItemMatchesCharacter(characterId: string, assignees: string[], labels: string[]) {
  const profile = githubAgentMap[characterId];
  if (!profile) {
    return false;
  }

  const normalizedAssignees = new Set(assignees.map(normalize));
  if (normalizedAssignees.has(normalize(profile.githubUsername))) {
    return true;
  }

  const normalizedLabels = new Set(labels.map(normalize));
  return profile.labels.some((label) => normalizedLabels.has(normalize(label)));
}
