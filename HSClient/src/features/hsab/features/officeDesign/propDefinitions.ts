import type { PropConfig } from "./types";

export interface PropDefinition {
  defaultWidth: number;
  defaultHeight: number;
  editorHitboxWidth?: number;
  editorHitboxHeight?: number;
}

export const PROP_DEFINITIONS: Record<PropConfig["type"], PropDefinition> = {
  desk: { defaultWidth: 56, defaultHeight: 34 },
  chair: { defaultWidth: 24, defaultHeight: 24 },
  monitor: { defaultWidth: 24, defaultHeight: 24 },
  monitorCluster: { defaultWidth: 56, defaultHeight: 34 },
  keyboard: { defaultWidth: 20, defaultHeight: 12, editorHitboxWidth: 22, editorHitboxHeight: 14 },
  serverRack: { defaultWidth: 30, defaultHeight: 54 },
  coffeeBar: { defaultWidth: 56, defaultHeight: 34 },
  sofa: { defaultWidth: 56, defaultHeight: 34 },
  plant: { defaultWidth: 24, defaultHeight: 24 },
  whiteboard: { defaultWidth: 48, defaultHeight: 34 },
  neonSign: { defaultWidth: 54, defaultHeight: 20 },
  wallSegment: { defaultWidth: 18, defaultHeight: 40, editorHitboxWidth: 18, editorHitboxHeight: 40 },
  glassDivider: { defaultWidth: 14, defaultHeight: 80, editorHitboxWidth: 18, editorHitboxHeight: 80 },
  smallTable: { defaultWidth: 56, defaultHeight: 34 },
  floorCable: { defaultWidth: 40, defaultHeight: 10, editorHitboxWidth: 40, editorHitboxHeight: 14 },
  floorLight: { defaultWidth: 18, defaultHeight: 4, editorHitboxWidth: 20, editorHitboxHeight: 12 },
  decorativePanel: { defaultWidth: 20, defaultHeight: 40 },
  console: { defaultWidth: 36, defaultHeight: 24 },
  books: { defaultWidth: 18, defaultHeight: 12 },
  cup: { defaultWidth: 12, defaultHeight: 12 },
  tinyScreen: { defaultWidth: 24, defaultHeight: 24 },
  vent: { defaultWidth: 20, defaultHeight: 20 },
  pipe: { defaultWidth: 24, defaultHeight: 14 },
  floorMark: { defaultWidth: 24, defaultHeight: 24 },
  paperStack: { defaultWidth: 18, defaultHeight: 14 },
  deskLamp: { defaultWidth: 18, defaultHeight: 18 },
  wallSpark: { defaultWidth: 18, defaultHeight: 18 },
  serverLedStrip: { defaultWidth: 24, defaultHeight: 10 },
  entranceStep: { defaultWidth: 48, defaultHeight: 14 },
};

export const getPropDefinition = (prop: Pick<PropConfig, "type" | "width" | "height">) => {
  const definition = PROP_DEFINITIONS[prop.type];
  return {
    width: prop.width ?? definition.defaultWidth,
    height: prop.height ?? definition.defaultHeight,
    editorHitboxWidth: Math.max(prop.width ?? definition.editorHitboxWidth ?? definition.defaultWidth, definition.editorHitboxWidth ?? definition.defaultWidth),
    editorHitboxHeight: Math.max(prop.height ?? definition.editorHitboxHeight ?? definition.defaultHeight, definition.editorHitboxHeight ?? definition.defaultHeight),
  };
};
