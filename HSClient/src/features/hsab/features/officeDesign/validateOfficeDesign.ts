import type { OfficeDesign, WaypointStatusTag } from "./types";

interface OfficeDesignValidationResult {
  valid: boolean;
  warnings: string[];
}

const pointInRect = (x: number, y: number, rect: OfficeDesign["officeBounds"]) =>
  x >= rect.x &&
  x <= rect.x + rect.width &&
  y >= rect.y &&
  y <= rect.y + rect.height;

export function validateOfficeDesign(design: OfficeDesign): OfficeDesignValidationResult {
  const warnings: string[] = [];
  const ids = new Set<string>();
  const validStatusTags = new Set<WaypointStatusTag>(["idle", "working", "coffeeBreak", "lunch", "meeting"]);

  if (!design.officeBounds || !Number.isFinite(design.officeBounds.width) || !Number.isFinite(design.officeBounds.height)) {
    warnings.push("officeBounds is missing or invalid");
  }

  const rememberId = (id: string, kind: string) => {
    if (ids.has(id)) {
      warnings.push(`Duplicate ${kind} id: ${id}`);
      return;
    }
    ids.add(id);
  };

  design.rooms.forEach((room) => {
    rememberId(room.id, "room");
    const insideBounds =
      room.x >= design.officeBounds.x &&
      room.y >= design.officeBounds.y &&
      room.x + room.width <= design.officeBounds.x + design.officeBounds.width &&
      room.y + room.height <= design.officeBounds.y + design.officeBounds.height;
    if (!insideBounds) {
      warnings.push(`Room ${room.id} is outside office bounds`);
    }
    if (!pointInRect(room.labelX, room.labelY, design.officeBounds)) {
      warnings.push(`Room label ${room.id} is outside office bounds`);
    }
  });

  design.floorAreas.forEach((floorArea) => {
    rememberId(floorArea.id, "floor area");
    const insideBounds =
      floorArea.x >= design.officeBounds.x &&
      floorArea.y >= design.officeBounds.y &&
      floorArea.x + floorArea.width <= design.officeBounds.x + design.officeBounds.width &&
      floorArea.y + floorArea.height <= design.officeBounds.y + design.officeBounds.height;
    if (!insideBounds) {
      warnings.push(`Floor area ${floorArea.id} is outside office bounds`);
    }
  });

  design.props.forEach((prop) => {
    rememberId(prop.id, "prop");
    if (!pointInRect(prop.x, prop.y, design.officeBounds)) {
      warnings.push(`Prop ${prop.id} is outside office bounds`);
    }
  });

  design.shapes.forEach((shape) => {
    rememberId(shape.id, "shape");
    if (!pointInRect(shape.x, shape.y, design.officeBounds)) {
      warnings.push(`Shape ${shape.id} is outside office bounds`);
    }
  });

  const routesById = new Map(design.movementRoutes.map((route) => [route.id, route]));
  const homeAnchors = new Set<string>();

  design.characters.forEach((character) => {
    rememberId(character.id, "character");
    if (homeAnchors.has(character.homeAnchorId)) {
      warnings.push(`Home anchor ${character.homeAnchorId} is shared`);
    }
    homeAnchors.add(character.homeAnchorId);
    if (!character.movementRouteId) {
      warnings.push(`Character ${character.id} has no movementRouteId`);
    }
    if (!routesById.has(character.movementRouteId)) {
      warnings.push(`Character ${character.id} references missing route ${character.movementRouteId}`);
    }
    if (!character.appearance) {
      warnings.push(`Character ${character.id} has no appearance config`);
    }
  });

  design.movementRoutes.forEach((route) => {
    rememberId(route.id, "route");
    if (!design.characters.some((character) => character.id === route.characterId)) {
      warnings.push(`Route ${route.id} references missing character ${route.characterId}`);
    }
    if (route.steps.length < 2) {
      warnings.push(`Route ${route.id} must contain at least 2 steps`);
    }
    route.steps.forEach((step) => {
      rememberId(step.id, "route step");
      if (step.statusTag && !validStatusTags.has(step.statusTag)) {
        warnings.push(`Route step ${step.id} has invalid statusTag ${step.statusTag}`);
      }
      if (!pointInRect(step.x, step.y, design.officeBounds)) {
        warnings.push(`Route step ${step.id} is outside office bounds`);
      }
      step.path?.forEach((point, index) => {
        if (!pointInRect(point.x, point.y, design.officeBounds)) {
          warnings.push(`Route step ${step.id} path point ${index + 1} is outside office bounds`);
        }
      });
    });
  });

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
