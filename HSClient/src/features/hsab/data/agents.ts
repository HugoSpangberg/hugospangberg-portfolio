import type { Agent } from "../types";
import officeDesign from "../features/officeDesign/officeDesign";

const characterById = Object.fromEntries(officeDesign.characters.map((character) => [character.id, character])) as Record<string, (typeof officeDesign.characters)[number]>;

export const initialAgents: Agent[] = [
  {
    id: "viktor",
    name: characterById.viktor.name,
    role: characterById.viktor.role as Agent["role"],
    status: "working",
    currentTask: "Tuning workstation systems and office automations",
    lastActivity: "Dialed in the neon workstation cluster a moment ago",
    logs: [
      { id: "v1", timestamp: "09:08", message: "Checked workstation monitor loops and desk lighting." },
      { id: "v2", timestamp: "09:19", message: "Patched cable routing between the main desk islands." },
      { id: "v3", timestamp: "09:31", message: "Reviewing server telemetry from the workstation pit." },
    ],
  },
  {
    id: "emil",
    name: characterById.emil.name,
    role: characterById.emil.role as Agent["role"],
    status: "working",
    currentTask: "Polishing room signage and the whiteboard pitch wall",
    lastActivity: "Signed off on the cyberpunk office mood pass",
    logs: [
      { id: "e1", timestamp: "09:02", message: "Drafted whiteboard compositions for the next concept sprint." },
      { id: "e2", timestamp: "09:15", message: "Balanced neon sign scale against the room silhouettes." },
      { id: "e3", timestamp: "09:27", message: "Approved the lounge and coffee bar palette." },
    ],
  },
  {
    id: "robin",
    name: characterById.robin.name,
    role: characterById.robin.role as Agent["role"],
    status: "working",
    currentTask: "Mapping experiment notes across the research lab displays",
    lastActivity: "Just refreshed the lab wall board with new findings",
    logs: [
      { id: "r1", timestamp: "08:58", message: "Updated the research wall with model comparison notes." },
      { id: "r2", timestamp: "09:14", message: "Checked incoming experiments at the lab desk." },
      { id: "r3", timestamp: "09:29", message: "Summarized early findings for the next meeting room sync." },
    ],
  },
  {
    id: "adam",
    name: characterById.adam.name,
    role: characterById.adam.role as Agent["role"],
    status: "working",
    currentTask: "Running calm smoke checks between QA and the lounge",
    lastActivity: "Grabbed coffee before another quiet validation pass",
    logs: [
      { id: "a1", timestamp: "09:04", message: "Finished a QA lab sweep across the current build." },
      { id: "a2", timestamp: "09:17", message: "Logged lounge ambience notes for comfort testing." },
      { id: "a3", timestamp: "09:33", message: "Queued one more regression walk after coffee." },
    ],
  },
];
