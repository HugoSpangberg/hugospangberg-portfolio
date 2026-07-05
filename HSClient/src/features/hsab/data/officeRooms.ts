import officeDesign from "../features/officeDesign/officeDesign";
import type { HallwaySegment } from "../features/officeDesign/types";

export type OfficeRoom = (typeof officeDesign.rooms)[number];

export const TILE_SIZE = 20;
export const MAP_WIDTH = 56;
export const MAP_HEIGHT = 38;

export const officeRooms: OfficeRoom[] = officeDesign.rooms;

export const hallways: HallwaySegment[] = [
  { x: 3, y: 12, width: 50, height: 4 },
  { x: 11, y: 16, width: 24, height: 4 },
  { x: 13, y: 20, width: 31, height: 4 },
  { x: 13, y: 27, width: 39, height: 3 },
];

export const roomStations = {
  viktorDesk: { x: 19.7, y: 11.9 },
  viktorSalesStand: { x: 22.2, y: 13.1 },
  emilDesk: { x: 25.6, y: 12.4 },
  davidFrontendPoint: { x: 27.4, y: 14.9 },
  emilWhiteboard: { x: 40.8, y: 18.8 },
  emilReview: { x: 36.7, y: 18.8 },
  robinDesk: { x: 20.6, y: 15.9 },
  robinServerCheck: { x: 41.7, y: 29.7 },
  robinWhiteboardSlot: { x: 35.9, y: 18.8 },
  adamQa: { x: 34.4, y: 29.3 },
  adamQaBench: { x: 27.8, y: 28.3 },
  adamQaInspect: { x: 35.2, y: 26.4 },
  coffeeSlotA: { x: 17.6, y: 25.8 },
  coffeeSlotB: { x: 21.1, y: 25.8 },
  sharedSlotC: { x: 24.8, y: 27.1 },
  focus: { x: 49.7, y: 19.2 },
  server: { x: 46.1, y: 30.1 },
  lobby: { x: 6.7, y: 18.9 },
  lounge: { x: 8.3, y: 29.4 },
  hubNorth: { x: 22, y: 15.2 },
  hubCenter: { x: 25.8, y: 20.4 },
  hubWest: { x: 13.4, y: 20.4 },
  hubEast: { x: 39.6, y: 20.1 },
  hubSouth: { x: 25.2, y: 28.2 },
} as const;
