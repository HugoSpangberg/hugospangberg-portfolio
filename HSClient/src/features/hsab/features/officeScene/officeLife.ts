import { MAP_HEIGHT, MAP_WIDTH } from "../../data/officeRooms";
import type { Agent } from "../../types";

export type ZoneId =
  | "research"
  | "workstation"
  | "meeting"
  | "lobby"
  | "whiteboard"
  | "focus"
  | "lounge"
  | "coffee"
  | "qa"
  | "server";

export interface AmbientZone {
  id: ZoneId;
  roomId: ZoneId;
  center: { x: number; y: number };
  radius: number;
  colorIntent: "cyan" | "purple" | "green" | "orange" | "pink";
  mood: string;
  futureAudioCue: string;
}

export interface AmbientEventHook {
  id: string;
  roomId: ZoneId;
  trigger: "agent-arrive" | "agent-pause" | "ambient-loop";
  futureAudioCue: string;
}

export type IdleMode = "desk" | "whiteboard" | "coffee" | "lounge" | "meeting" | "server" | "focus" | "qa" | "lobby";
export type Facing = "left" | "right";

export interface AgentDestinationChoice {
  station: string;
  zone: ZoneId;
  pauseMs: [number, number];
  facing: Facing;
  idle: IdleMode;
  shared?: boolean;
}

export interface RoutineStep {
  candidates: string[];
}

export interface RoutinePickContext {
  reservedStations?: Set<string>;
  blockedStations?: Set<string>;
}

export interface RoutinePickResult {
  choice: AgentDestinationChoice;
  nextStepIndex: number;
}

export type CollisionGrid = boolean[][];

export const ambientZones: AmbientZone[] = [
  { id: "research", roomId: "research", center: { x: 8, y: 9 }, radius: 4.2, colorIntent: "purple", mood: "research energy", futureAudioCue: "lab-hum" },
  { id: "workstation", roomId: "workstation", center: { x: 22, y: 11 }, radius: 6.2, colorIntent: "cyan", mood: "active maker zone", futureAudioCue: "keys-and-fans" },
  { id: "meeting", roomId: "meeting", center: { x: 41, y: 8 }, radius: 4.2, colorIntent: "pink", mood: "late-night collaboration", futureAudioCue: "soft-meeting-room" },
  { id: "lobby", roomId: "lobby", center: { x: 7, y: 17 }, radius: 3.4, colorIntent: "purple", mood: "entry glow", futureAudioCue: "signage-buzz" },
  { id: "whiteboard", roomId: "whiteboard", center: { x: 39, y: 18 }, radius: 4.6, colorIntent: "purple", mood: "brainstorm wall", futureAudioCue: "marker-scratch" },
  { id: "focus", roomId: "focus", center: { x: 50, y: 18 }, radius: 3, colorIntent: "cyan", mood: "quiet concentration", futureAudioCue: "low-air-vent" },
  { id: "lounge", roomId: "lounge", center: { x: 8, y: 28 }, radius: 4.6, colorIntent: "pink", mood: "cozy recharge", futureAudioCue: "soft-lounge-loop" },
  { id: "coffee", roomId: "coffee", center: { x: 19, y: 24 }, radius: 4.2, colorIntent: "orange", mood: "warm social stop", futureAudioCue: "coffee-machine" },
  { id: "qa", roomId: "qa", center: { x: 31, y: 28 }, radius: 4.6, colorIntent: "cyan", mood: "test rig focus", futureAudioCue: "device-blips" },
  { id: "server", roomId: "server", center: { x: 46, y: 28 }, radius: 4.4, colorIntent: "green", mood: "cold infrastructure", futureAudioCue: "server-room" },
];

export const ambientEventHooks: AmbientEventHook[] = [
  { id: "coffee-arrive", roomId: "coffee", trigger: "agent-arrive", futureAudioCue: "cup-set-down" },
  { id: "meeting-arrive", roomId: "meeting", trigger: "agent-arrive", futureAudioCue: "chair-slide" },
  { id: "lounge-pause", roomId: "lounge", trigger: "agent-pause", futureAudioCue: "soft-lounge-shift" },
  { id: "server-loop", roomId: "server", trigger: "ambient-loop", futureAudioCue: "fan-swell" },
];

const stationNodes: Record<string, string> = {
  viktorDesk: "hubNorth",
  viktorSalesStand: "hubNorth",
  emilDesk: "hubNorth",
  emilWhiteboard: "hubEast",
  emilReview: "hubEast",
  robinResearch: "hubWest",
  robinResearchBoard: "hubWest",
  robinServerCheck: "hubSouth",
  robinWhiteboardSlot: "hubEast",
  adamQa: "hubSouth",
  adamQaBench: "hubSouth",
  adamQaInspect: "hubSouth",
  adamCoffeeSlot: "hubCenter",
  coffeeSlotA: "hubCenter",
  coffeeSlotB: "hubCenter",
  whiteboardSlotA: "hubEast",
  whiteboardSlotB: "hubEast",
  meetingSlotA: "hubEast",
  meetingSlotB: "hubEast",
  focus: "hubEast",
  server: "hubSouth",
  lobby: "hubWest",
  lounge: "hubWest",
  hubNorth: "hubNorth",
  hubCenter: "hubCenter",
  hubWest: "hubWest",
  hubEast: "hubEast",
  hubSouth: "hubSouth",
};

export const waypointCatalog: Record<string, AgentDestinationChoice> = {
  viktorDesk: { station: "viktorDesk", zone: "workstation", pauseMs: [2200, 3800], facing: "left", idle: "desk" },
  viktorSalesStand: { station: "viktorSalesStand", zone: "workstation", pauseMs: [1800, 2800], facing: "right", idle: "desk" },
  emilDesk: { station: "emilDesk", zone: "workstation", pauseMs: [2200, 3800], facing: "left", idle: "desk" },
  emilWhiteboard: { station: "emilWhiteboard", zone: "whiteboard", pauseMs: [2000, 3600], facing: "left", idle: "whiteboard" },
  emilReview: { station: "emilReview", zone: "whiteboard", pauseMs: [2000, 3200], facing: "right", idle: "whiteboard" },
  robinResearch: { station: "robinResearch", zone: "research", pauseMs: [2200, 3800], facing: "left", idle: "desk" },
  robinResearchBoard: { station: "robinResearchBoard", zone: "research", pauseMs: [2200, 3400], facing: "right", idle: "desk" },
  robinServerCheck: { station: "robinServerCheck", zone: "server", pauseMs: [1800, 3000], facing: "left", idle: "server", shared: true },
  robinWhiteboardSlot: { station: "robinWhiteboardSlot", zone: "whiteboard", pauseMs: [1800, 3000], facing: "left", idle: "whiteboard", shared: true },
  adamQa: { station: "adamQa", zone: "qa", pauseMs: [2200, 3800], facing: "left", idle: "qa" },
  adamQaBench: { station: "adamQaBench", zone: "qa", pauseMs: [2200, 3400], facing: "right", idle: "qa" },
  adamQaInspect: { station: "adamQaInspect", zone: "qa", pauseMs: [2200, 3400], facing: "left", idle: "qa" },
  adamCoffeeSlot: { station: "adamCoffeeSlot", zone: "coffee", pauseMs: [1600, 2400], facing: "right", idle: "coffee", shared: true },
  coffeeSlotA: { station: "coffeeSlotA", zone: "coffee", pauseMs: [1600, 2400], facing: "right", idle: "coffee", shared: true },
  coffeeSlotB: { station: "coffeeSlotB", zone: "coffee", pauseMs: [1600, 2400], facing: "left", idle: "coffee", shared: true },
  whiteboardSlotA: { station: "whiteboardSlotA", zone: "whiteboard", pauseMs: [1800, 2600], facing: "left", idle: "whiteboard", shared: true },
  whiteboardSlotB: { station: "whiteboardSlotB", zone: "whiteboard", pauseMs: [1800, 2600], facing: "right", idle: "whiteboard", shared: true },
  meetingSlotA: { station: "meetingSlotA", zone: "meeting", pauseMs: [1600, 2400], facing: "left", idle: "meeting", shared: true },
  meetingSlotB: { station: "meetingSlotB", zone: "meeting", pauseMs: [1600, 2400], facing: "right", idle: "meeting", shared: true },
  focus: { station: "focus", zone: "focus", pauseMs: [1800, 2600], facing: "left", idle: "focus", shared: true },
  server: { station: "server", zone: "server", pauseMs: [1800, 2600], facing: "left", idle: "server", shared: true },
  lobby: { station: "lobby", zone: "lobby", pauseMs: [1200, 2000], facing: "right", idle: "lobby", shared: true },
  lounge: { station: "lounge", zone: "lounge", pauseMs: [1600, 2600], facing: "left", idle: "lounge", shared: true },
  hubNorth: { station: "hubNorth", zone: "workstation", pauseMs: [700, 1100], facing: "left", idle: "desk", shared: true },
  hubCenter: { station: "hubCenter", zone: "workstation", pauseMs: [700, 1100], facing: "right", idle: "desk", shared: true },
  hubWest: { station: "hubWest", zone: "lobby", pauseMs: [700, 1100], facing: "right", idle: "lobby", shared: true },
  hubEast: { station: "hubEast", zone: "whiteboard", pauseMs: [700, 1100], facing: "left", idle: "whiteboard", shared: true },
  hubSouth: { station: "hubSouth", zone: "qa", pauseMs: [700, 1100], facing: "left", idle: "qa", shared: true },
};

export const agentHomeAnchors: Record<Agent["id"], string> = {
  viktor: "viktorDesk",
  emil: "emilDesk",
  robin: "robinResearch",
  adam: "adamQa",
};

const routines: Record<Agent["id"], RoutineStep[]> = {
  viktor: [
    { candidates: ["viktorDesk"] },
    { candidates: ["viktorSalesStand"] },
    { candidates: ["coffeeSlotA", "coffeeSlotB"] },
    { candidates: ["viktorDesk"] },
  ],
  emil: [
    { candidates: ["emilDesk"] },
    { candidates: ["emilReview", "emilWhiteboard"] },
    { candidates: ["coffeeSlotB", "coffeeSlotA"] },
    { candidates: ["emilDesk"] },
  ],
  robin: [
    { candidates: ["robinResearch"] },
    { candidates: ["robinServerCheck", "server"] },
    { candidates: ["robinWhiteboardSlot", "whiteboardSlotA"] },
    { candidates: ["robinResearchBoard"] },
    { candidates: ["robinResearch"] },
  ],
  adam: [
    { candidates: ["adamQa"] },
    { candidates: ["adamQaBench", "adamQaInspect"] },
    { candidates: ["adamCoffeeSlot", "coffeeSlotB"] },
    { candidates: ["adamQaInspect", "adamQaBench"] },
    { candidates: ["adamQa"] },
  ],
};

const openGraph: Record<string, string[]> = {
  hubWest: ["hubCenter", "hubNorth"],
  hubNorth: ["hubWest", "hubCenter", "hubEast"],
  hubCenter: ["hubWest", "hubNorth", "hubEast", "hubSouth"],
  hubEast: ["hubNorth", "hubCenter", "hubSouth"],
  hubSouth: ["hubCenter", "hubEast"],
};

export function getHomeAnchor(agentId: Agent["id"]) {
  return agentHomeAnchors[agentId];
}

export function getWaypointMeta(station: string) {
  return waypointCatalog[station];
}

export function getRoutineStepCount(agentId: Agent["id"]) {
  return routines[agentId].length;
}

export function getRoutineSteps(agentId: Agent["id"]) {
  return routines[agentId];
}

export function pickRoutineDestination(
  agentId: Agent["id"],
  stepIndex: number,
  context: RoutinePickContext = {},
): RoutinePickResult {
  const routine = routines[agentId];
  const reserved = context.reservedStations ?? new Set<string>();
  const blocked = context.blockedStations ?? new Set<string>();

  for (let offset = 0; offset < routine.length; offset += 1) {
    const index = (stepIndex + offset) % routine.length;
    const step = routine[index];
    const station = step.candidates.find((candidate) => !reserved.has(candidate) && !blocked.has(candidate)) ?? step.candidates[0];

    if (station && !reserved.has(station) && !blocked.has(station)) {
      return {
        choice: waypointCatalog[station],
        nextStepIndex: (index + 1) % routine.length,
      };
    }
  }

  const fallback = agentHomeAnchors[agentId];
  return {
    choice: waypointCatalog[fallback],
    nextStepIndex: 0,
  };
}

export function randomPauseDuration(choice: AgentDestinationChoice, random = Math.random) {
  const [min, max] = choice.pauseMs;
  return Math.round(min + (max - min) * random());
}

export function routeViaOffice(fromStation: string, toStation: string) {
  if (fromStation === toStation) {
    return [toStation];
  }

  const fromNode = stationNodes[fromStation] ?? fromStation;
  const toNode = stationNodes[toStation] ?? toStation;
  const queue: string[][] = [[fromNode]];
  const visited = new Set<string>([fromNode]);

  while (queue.length > 0) {
    const path = queue.shift();
    if (!path) {
      break;
    }

    const current = path[path.length - 1];
    if (current === toNode) {
      return [...path, toStation];
    }

    for (const neighbor of openGraph[current] ?? []) {
      if (visited.has(neighbor)) {
        continue;
      }
      visited.add(neighbor);
      queue.push([...path, neighbor]);
    }
  }

  return [fromNode, toNode, toStation];
}

function createGrid() {
  return Array.from({ length: MAP_HEIGHT + 2 }, () => Array.from({ length: MAP_WIDTH + 2 }, () => false));
}

function markRect(grid: CollisionGrid, x: number, y: number, width: number, height: number, value = true) {
  for (let row = Math.max(0, Math.floor(y)); row < Math.min(grid.length, Math.ceil(y + height)); row += 1) {
    for (let column = Math.max(0, Math.floor(x)); column < Math.min(grid[row].length, Math.ceil(x + width)); column += 1) {
      grid[row][column] = value;
    }
  }
}

export const officeCollisionGrid: CollisionGrid = (() => {
  const grid = createGrid();
  markRect(grid, 2, 4, 52, 29, true);

  [
    [14.4, 6.8, 0.9, 8.4],
    [31.8, 6.2, 0.9, 6.8],
    [45.9, 14.2, 0.9, 7.2],
    [13.1, 22.4, 0.9, 8.8],
    [39.2, 23.2, 1.2, 8.8],
  ].forEach(([x, y, width, height]) => markRect(grid, x, y, width, height, false));

  return grid;
})();

export function isGridWalkable(x: number, y: number) {
  const row = Math.round(y);
  const column = Math.round(x);
  return officeCollisionGrid[row]?.[column] ?? false;
}
