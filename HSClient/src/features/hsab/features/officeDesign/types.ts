export type AccentName = "cyan" | "purple" | "green" | "orange" | "pink";
export type RoomId = string;

export type PropType =
  | "desk"
  | "chair"
  | "monitor"
  | "monitorCluster"
  | "keyboard"
  | "serverRack"
  | "coffeeBar"
  | "sofa"
  | "plant"
  | "whiteboard"
  | "neonSign"
  | "wallSegment"
  | "glassDivider"
  | "smallTable"
  | "floorCable"
  | "floorLight"
  | "decorativePanel"
  | "console"
  | "books"
  | "cup"
  | "tinyScreen"
  | "vent"
  | "pipe"
  | "floorMark"
  | "paperStack"
  | "deskLamp"
  | "wallSpark"
  | "serverLedStrip"
  | "entranceStep";

export type IdleType = "idle" | "typing" | "thinking" | "coffee" | "whiteboard" | "qa" | "server";
export type WaypointStatusTag = "idle" | "working" | "coffeeBreak" | "lunch" | "meeting";
export type Facing = "up" | "down" | "left" | "right";
export type HairStyle = "bald" | "long" | "parted" | "bun";
export type FloorPatternType =
  | "solid"
  | "grid"
  | "checker"
  | "diagonalStripes"
  | "horizontalStripes"
  | "verticalStripes"
  | "dotted"
  | "circuitLines"
  | "neonEdge"
  | "glass"
  | "metalPanel"
  | "carpet"
  | "tile"
  | "concrete"
  | "holographic";

export type ShapeType =
  | "rectangle"
  | "roundedRectangle"
  | "line"
  | "thickLine"
  | "circle"
  | "ellipse"
  | "triangle"
  | "polygon"
  | "pixelBlock"
  | "panel"
  | "glassPanel"
  | "neonStrip"
  | "floorTile"
  | "rug"
  | "cable"
  | "counter"
  | "shelf"
  | "divider"
  | "wallBlock";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HallwaySegment {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoomConfig extends Rect {
  id: RoomId;
  label: string;
  accent: AccentName;
  labelX: number;
  labelY: number;
  floorColor?: string;
  wallColor?: string;
  accentColor?: string;
  pattern?: FloorPatternType;
  labelEnabled?: boolean;
  editable?: boolean;
  locked?: boolean;
}

export interface FloorAreaConfig extends Rect {
  id: string;
  roomId?: RoomId;
  label: string;
  accent?: AccentName;
  fillColor?: string;
  accentColor?: string;
  pattern?: FloorPatternType;
  opacity?: number;
  fillAlpha?: number;
  locked?: boolean;
  editable?: boolean;
}

export interface ShapeConfig {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  fillColor?: string;
  strokeColor?: string;
  accentColor?: string;
  opacity?: number;
  pattern?: FloorPatternType;
  depth?: number;
  roomId?: RoomId;
  locked?: boolean;
  editable?: boolean;
}

export interface PropConfig {
  id: string;
  type: PropType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  flipX?: boolean;
  accent?: AccentName;
  dual?: boolean;
  text?: string;
  roomId?: RoomId;
  depthBase?: number;
  locked?: boolean;
  editable?: boolean;
}

export interface CharacterAppearance {
  hairStyle: HairStyle;
  hairColor: string;
  skinColor: string;
  shirtColor: string;
  jacketColor: string;
  pantsColor: string;
  shoesColor: string;
}

export interface CharacterConfig {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  homeAnchorId: string;
  movementRouteId: string;
  appearance: CharacterAppearance;
  locked?: boolean;
  editable?: boolean;
}

export interface MovementRouteStep {
  id: string;
  x: number;
  y: number;
  idleType: IdleType;
  statusTag?: WaypointStatusTag;
  idleMs: number;
  facing: Facing;
  label?: string;
  targetObjectId?: string;
  zoneId?: RoomId;
  path?: Array<{ x: number; y: number }>;
}

export interface MovementRouteConfig {
  id: string;
  characterId: string;
  steps: MovementRouteStep[];
  locked?: boolean;
  editable?: boolean;
}

export interface OfficeDesign {
  officeBounds: Rect;
  rooms: RoomConfig[];
  floorAreas: FloorAreaConfig[];
  props: PropConfig[];
  shapes: ShapeConfig[];
  characters: CharacterConfig[];
  movementRoutes: MovementRouteConfig[];
}
