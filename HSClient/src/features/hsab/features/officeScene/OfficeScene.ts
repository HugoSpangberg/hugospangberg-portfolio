import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "../../data/officeRooms";
import { applyDailyTheme, type OfficeTheme } from "../../theme/officeThemes";
import { generateOfficeAssets, getAgentFrameKeys, OFFICE_ASSET_KEYS } from "./officeAssets";
import { ambientEventHooks, ambientZones, type ZoneId } from "./officeLife";
import type { Agent, AgentStatus } from "../../types";
import officeDesign from "../officeDesign/officeDesign";
import { validateOfficeDesign } from "../officeDesign/validateOfficeDesign";
import type {
  AccentName,
  CharacterConfig,
  Facing,
  MovementRouteConfig,
  MovementRouteStep,
  OfficeDesign,
  PropConfig,
  RoomConfig,
  ShapeConfig,
} from "../officeDesign/types";

type AgentFrameSet = ReturnType<typeof getAgentFrameKeys>;

type ShowcaseSelection =
  | { kind: "character"; id: string }
  | { kind: "room"; id: string }
  | { kind: "prop"; id: string }
  | { kind: "floorArea"; id: string }
  | { kind: "shape"; id: string };

interface SceneAgentRefs {
  root: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Ellipse;
  sprite: Phaser.GameObjects.Image;
  status: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Container;
  labelNameText: Phaser.GameObjects.Text;
  labelStatusText: Phaser.GameObjects.Text;
  frames: AgentFrameSet;
  currentStation: string;
  currentZone: ZoneId;
  currentTarget?: string;
  currentStepIndex: number;
  state: "moving" | "idle";
  target?: Phaser.Math.Vector2;
  currentStepId?: string;
  routineSteps: MovementRouteStep[];
  routePoints: Phaser.Math.Vector2[];
  routeIndex: number;
  idleUntil: number;
  speed: number;
  idleType: MovementRouteStep["idleType"];
  moveStartedAt: number;
  visitedStepIds: Set<string>;
  isWalking: boolean;
  walkFrameIndex: 0 | 1;
  failedStations: Set<string>;
  moveTimer?: Phaser.Time.TimerEvent;
  blinkTimer?: Phaser.Time.TimerEvent;
  idleTilt?: Phaser.Time.TimerEvent;
  idleActionTween?: Phaser.Tweens.Tween;
  debugText?: Phaser.GameObjects.Text;
  desiredStep?: MovementRouteStep;
  desiredStatusText?: string;
}

interface RoomLabelRefs {
  id: string;
  label: string;
  container: Phaser.GameObjects.Container;
  bounds: { x: number; y: number; width: number; height: number };
}

interface OfficeSceneData {
  getAgents: () => Agent[];
  theme: OfficeTheme;
  design?: OfficeDesign;
  editorEnabled?: boolean;
}

const tileToPixel = (value: number) => value * TILE_SIZE;
const DEBUG_MOVEMENT = false;
const CHARACTER_LABEL_Y = -80;
const CHARACTER_LABEL_WIDTH = 116;
const CHARACTER_LABEL_HEIGHT = 29;
const CHARACTER_NAME_FONT = "11px";
const CHARACTER_ROLE_FONT = "10px";
const ROOM_LABEL_HEIGHT = 24;
const ROOM_LABEL_FONT = "11px";

interface MovementDebugState {
  name: string;
  currentStepId: string;
  currentStepIndex: number;
  state: "moving" | "idle";
  x: number;
  y: number;
  routineLength: number;
  visitedStepIds: string[];
  routinePoints: Array<{ id: string; x: number; y: number }>;
}

interface LabelDebugState {
  characters: Array<{
    name: string;
    label: string;
    characterX: number;
    characterY: number;
    labelX: number;
    labelY: number;
    offsetX: number;
    offsetY: number;
  }>;
  rooms: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    bounds: { x: number; y: number; width: number; height: number };
  }>;
}

interface OfficeShellDebugState {
  officeBounds: OfficeDesign["officeBounds"];
  outerWallsRendered: boolean;
  outsideChromeEnabled: boolean;
  backgroundDecorationsEnabled: boolean;
}

class AgentMovementController {
  private registered = new Map<Agent["id"], { agent: Agent; refs: SceneAgentRefs }>();
  private updateSeen = false;
  private paused = false;

  constructor(private readonly scene: OfficeScene) {}

  registerAgent(agent: Agent, refs: SceneAgentRefs) {
    this.registered.set(agent.id as Agent["id"], { agent, refs });
  }

  assertRegisteredCount(expected: number) {
    if (this.registered.size !== expected) {
      console.error("Expected 4 registered agents, got", this.registered.size);
    }
  }

  ensureUpdateIsRunning() {
    this.scene.time.delayedCall(1500, () => {
      if (!this.updateSeen) {
        console.warn("[movement] OfficeScene.update() is not being called");
      }
    });
  }

  setPaused(paused: boolean) {
    this.paused = paused;
  }

  update(time: number, delta: number) {
    this.updateSeen = true;
    if (this.paused) {
      return;
    }
    this.registered.forEach(({ agent, refs }) => {
      if (refs.state === "idle") {
        if (time >= refs.idleUntil) {
          this.advanceToNextStep(agent, refs, time);
        } else if (time - refs.idleUntil > 250) {
          console.warn(`[movement:${agent.id}] idle exceeded idleUntil, forcing next step`);
          this.advanceToNextStep(agent, refs, time);
        }
      } else {
        this.moveAgentTowardTarget(agent, refs, delta, time);
      }

      if (DEBUG_MOVEMENT && refs.debugText) {
        refs.debugText.setPosition(refs.root.x + 10, refs.root.y - 40);
        refs.debugText.setText(`${refs.state}\n${refs.currentStepId ?? "none"}`);
      }
    });
  }

  getStates(): MovementDebugState[] {
    return Array.from(this.registered.values()).map(({ agent, refs }) => ({
      name: agent.name,
      currentStepId: refs.currentStepId ?? "unknown",
      currentStepIndex: refs.currentStepIndex,
      state: refs.state,
      x: refs.root.x,
      y: refs.root.y,
      routineLength: refs.routineSteps.length,
      visitedStepIds: Array.from(refs.visitedStepIds),
      routinePoints: refs.routineSteps.map((step) => ({ id: step.id, x: step.x, y: step.y })),
    }));
  }

  private advanceToNextStep(agent: Agent, refs: SceneAgentRefs, time: number) {
    const nextStep = refs.desiredStep ?? refs.routineSteps[refs.currentStepIndex];
    if (!nextStep) {
      console.warn(`[movement:${agent.id}] no routine step at index ${refs.currentStepIndex}`);
      return;
    }

    const distanceFromTarget = Math.hypot(refs.root.x - nextStep.x, refs.root.y - nextStep.y);
    if (refs.desiredStep && refs.currentStation === nextStep.id && distanceFromTarget < 2) {
      refs.currentStepId = nextStep.id;
      refs.currentTarget = nextStep.id;
      refs.idleType = this.scene.idleTypeForStep(nextStep);
      refs.idleUntil = time + Phaser.Math.Clamp(nextStep.idleMs ?? 1000, 800, 2000);
      this.scene.applyFacing(refs, nextStep.facing);
      this.scene.applyIdleAction(refs);
      return;
    }

    const routePoints = [...(nextStep.path ?? []), { x: nextStep.x, y: nextStep.y }]
      .filter((point) => this.scene.isInsideOfficeBounds(point.x, point.y))
      .map((point) => new Phaser.Math.Vector2(point.x, point.y));

    if (routePoints.length === 0) {
      console.warn(`[movement:${agent.id}] invalid target ${nextStep.id}`);
      refs.currentStepIndex = (refs.currentStepIndex + 1) % refs.routineSteps.length;
      return;
    }

    refs.currentStepId = nextStep.id;
    refs.currentTarget = nextStep.id;
    refs.idleType = this.scene.idleTypeForStep(nextStep);
    refs.state = "moving";
    refs.isWalking = true;
    refs.routePoints = routePoints;
    refs.routeIndex = 0;
    refs.target = routePoints[0];
    refs.moveStartedAt = time;
    refs.idleActionTween?.stop();
    refs.idleActionTween = undefined;
    refs.sprite.x = 0;
    this.scene.applyFacing(refs, nextStep.facing);
    this.scene.startWalkCycle(refs);
    this.scene.debugMovement(agent.id, `target ${nextStep.id}`);
  }

  private moveAgentTowardTarget(agent: Agent, refs: SceneAgentRefs, delta: number, time: number) {
    const target = refs.target ?? refs.routePoints[refs.routeIndex];
    if (!target) {
      console.warn(`[movement:${agent.id}] missing target, advancing`);
      refs.state = "idle";
      refs.idleUntil = time + 100;
      return;
    }

    if (time - refs.moveStartedAt > 7000) {
      console.warn(`[movement:${agent.id}] stuck moving to ${refs.currentStepId}, snapping forward`);
      this.finishStep(agent, refs, time, target);
      return;
    }

    const dx = target.x - refs.root.x;
    const dy = target.y - refs.root.y;
    const distance = Math.hypot(dx, dy);
    const step = refs.speed * (delta / 1000);

    if (Math.abs(dx) > 0.5) {
      refs.sprite.setFlipX(dx < 0);
    }

    if (distance <= step || distance < 2) {
      refs.root.setPosition(target.x, target.y);
      refs.shadow.setPosition(target.x, target.y + 1);
      refs.routeIndex += 1;
      if (refs.routeIndex >= refs.routePoints.length) {
        this.finishStep(agent, refs, time, target);
      } else {
        refs.target = refs.routePoints[refs.routeIndex];
      }
      this.scene.syncAgentDepth(refs);
      return;
    }

    refs.root.x += (dx / distance) * step;
    refs.root.y += (dy / distance) * step;
    refs.shadow.setPosition(refs.root.x, refs.root.y + 1);
    this.scene.syncAgentDepth(refs);
  }

  private finishStep(agent: Agent, refs: SceneAgentRefs, time: number, point: Phaser.Math.Vector2) {
    refs.root.setPosition(point.x, point.y);
    refs.shadow.setPosition(point.x, point.y + 1);
    refs.currentStation = refs.currentTarget ?? refs.currentStation;
    const currentStep = refs.desiredStep ?? refs.routineSteps[(refs.currentStepIndex - 1 + refs.routineSteps.length) % refs.routineSteps.length];
    refs.currentZone = (currentStep?.zoneId as ZoneId | undefined) ?? this.scene.zoneForPoint(point.x, point.y);
    refs.visitedStepIds.add(refs.currentStepId ?? refs.currentStation);
    if (!refs.desiredStep) {
      refs.currentStepIndex = (refs.currentStepIndex + 1) % refs.routineSteps.length;
    }
    refs.idleUntil = time + Phaser.Math.Clamp(
      currentStep?.idleMs ?? 1000,
      800,
      2000,
    );
    this.scene.setAgentIdle(refs);
    this.scene.triggerAmbientHooks(refs.currentZone, "agent-pause");
    this.scene.debugMovement(agent.id, `arrived ${refs.currentStepId}`);
  }
}

export default class OfficeScene extends Phaser.Scene {
  private design: OfficeDesign = structuredClone(officeDesign);
  private getAgents?: () => Agent[];
  private theme?: OfficeTheme;
  private agentRefs = new Map<string, SceneAgentRefs>();
  private roomLabelRefs: RoomLabelRefs[] = [];
  private propRefs = new Map<string, Array<Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform>>();
  private floorAreaRefs = new Map<string, Phaser.GameObjects.Container>();
  private shapeRefs = new Map<string, Phaser.GameObjects.Container>();
  private ambienceLayer?: Phaser.GameObjects.Container;
  private debugMovementLayer?: Phaser.GameObjects.Container;
  private movementController = new AgentMovementController(this);
  private lastLabelValidationAt = 0;
  private editorPaused = false;
  private shellState: OfficeShellDebugState = {
    officeBounds: structuredClone(officeDesign.officeBounds),
    outerWallsRendered: false,
    outsideChromeEnabled: false,
    backgroundDecorationsEnabled: false,
  };

  constructor() {
    super("office-scene");
  }

  init(data: OfficeSceneData) {
    this.getAgents = data.getAgents;
    this.theme = data.theme;
    this.design = structuredClone(data.design ?? officeDesign);
    this.agentRefs.clear();
    this.roomLabelRefs = [];
    this.propRefs.clear();
    this.floorAreaRefs.clear();
    this.shapeRefs.clear();
    this.debugMovementLayer = undefined;
    this.ambienceLayer = undefined;
    this.editorPaused = Boolean(data.editorEnabled);
    this.movementController.setPaused(this.editorPaused);
    this.shellState = {
      officeBounds: structuredClone(this.design.officeBounds),
      outerWallsRendered: false,
      outsideChromeEnabled: false,
      backgroundDecorationsEnabled: false,
    };
  }

  create() {
    const theme = this.requireTheme();
    const validation = validateOfficeDesign(this.design);
    if (!validation.valid && typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      validation.warnings.forEach((warning) => console.warn(`[office-design] ${warning}`));
    }
    applyDailyTheme(this, theme);
    generateOfficeAssets(this, theme, this.design.characters);
    this.drawOffice();
    this.createAgents();
    this.setEditorPaused(this.editorPaused);
    this.movementController.ensureUpdateIsRunning();
  }

  update(time: number, delta: number) {
    const liveAgents = this.getAgents?.() ?? [];
    liveAgents.forEach((agent) => {
      const refs = this.agentRefs.get(agent.id);
      if (!refs) {
        return;
      }
      this.syncAgentVisualState(agent, refs);
    });
    this.movementController.update(time, delta);
    this.validateLabelAnchors(time);
  }

  shutdown() {
    this.agentRefs.forEach((refs) => {
      refs.blinkTimer?.remove(false);
      refs.idleTilt?.remove(false);
      refs.idleActionTween?.stop();
    });
  }

  syncAgents() {
    const liveAgents = this.getAgents?.() ?? [];

    liveAgents.forEach((agent) => {
      const refs = this.agentRefs.get(agent.id);
      if (!refs) {
        return;
      }
      this.syncAgentVisualState(agent, refs);
    });
  }

  isMovementDebugEnabled() {
    return DEBUG_MOVEMENT;
  }

  getOfficeDesign() {
    return this.design;
  }

  setDesign(design: OfficeDesign) {
    if (!this.getAgents || !this.theme) {
      return;
    }
    this.scene.restart({
      getAgents: this.getAgents,
      theme: this.theme,
      design: structuredClone(design),
      editorEnabled: this.editorPaused,
    } satisfies OfficeSceneData);
  }

  setEditorPaused(paused: boolean) {
    this.editorPaused = paused;
    this.movementController.setPaused(paused);
    this.time.paused = paused;
    if (paused) {
      this.tweens.pauseAll();
    } else {
      this.tweens.resumeAll();
    }
    this.agentRefs.forEach((refs) => {
      if (paused) {
        if (refs.isWalking) {
          refs.isWalking = false;
          refs.sprite.setTexture(refs.frames.idle);
          refs.sprite.y = -4;
          refs.sprite.setAngle(0);
        }
        refs.idleActionTween?.pause();
        return;
      }

      if (refs.state === "moving" && !refs.isWalking) {
        refs.moveStartedAt = this.time.now;
        refs.isWalking = true;
        this.startWalkCycle(refs);
      }
      refs.idleActionTween?.resume();
    });
  }

  getMovementStates() {
    return this.movementController.getStates();
  }

  getLabelState(): LabelDebugState {
    return {
      characters: Array.from(this.agentRefs.entries()).map(([agentId, refs]) => {
        const agent = this.getAgents?.().find((candidate) => candidate.id === agentId);
        const world = refs.label.getWorldTransformMatrix();
        return {
          name: agent?.name ?? agentId,
          label: refs.desiredStatusText ?? `${agent?.name ?? agentId} — ${agent?.role ?? ""}`.trim(),
          characterX: refs.root.x,
          characterY: refs.root.y,
          labelX: world.tx,
          labelY: world.ty,
          offsetX: world.tx - refs.root.x,
          offsetY: world.ty - refs.root.y,
        };
      }),
      rooms: this.roomLabelRefs.map((room) => ({
        id: room.id,
        label: room.label,
        x: room.container.x,
        y: room.container.y,
        bounds: room.bounds,
      })),
    };
  }

  getOfficeShellState(): OfficeShellDebugState {
    return structuredClone(this.shellState);
  }

  previewSelectionPosition(selection: ShowcaseSelection | null, x: number, y: number) {
    if (!selection) {
      return;
    }

    if (selection.kind === "character") {
      const refs = this.agentRefs.get(selection.id);
      if (!refs) {
        return;
      }
      refs.root.setPosition(x, y);
      refs.shadow.setPosition(x, y + 1);
      this.syncAgentDepth(refs);
      return;
    }

    if (selection.kind === "room") {
      const room = this.roomLabelRefs.find((entry) => entry.id === selection.id);
      room?.container.setPosition(x, y);
      return;
    }

    if (selection.kind === "prop") {
      this.propRefs.get(selection.id)?.forEach((ref) => ref.setPosition(x, y));
      return;
    }

    if (selection.kind === "floorArea") {
      this.floorAreaRefs.get(selection.id)?.setPosition(x, y);
      return;
    }

    if (selection.kind === "shape") {
      this.shapeRefs.get(selection.id)?.setPosition(x, y);
    }
  }

  private drawOffice() {
    const centerX = tileToPixel(MAP_WIDTH / 2);
    const centerY = tileToPixel(MAP_HEIGHT / 2);

    this.add.rectangle(centerX, centerY, tileToPixel(MAP_WIDTH), tileToPixel(MAP_HEIGHT), 0x05070c, 0.8)
      .setDepth(0.1);
    this.renderOfficeShell();
    this.renderConfiguredFloorAreas();
    this.renderConfiguredShapes();
    this.addZoneLabelsAndAnchors();
    this.populateOpenOffice();
  }

  private renderOfficeShell() {
    const theme = this.requireTheme();
    const { x, y, width, height } = this.design.officeBounds;
    const wallThickness = 18;
    const topWall = this.add.tileSprite(x + width / 2, y + wallThickness / 2, width, wallThickness, OFFICE_ASSET_KEYS.wallTop).setDepth(2.2);
    const bottomWall = this.add.tileSprite(x + width / 2, y + height - wallThickness / 2, width, wallThickness, OFFICE_ASSET_KEYS.wallTop).setDepth(2.2).setAlpha(0.92);
    const leftWall = this.add.tileSprite(x + wallThickness / 2, y + height / 2, wallThickness, height, OFFICE_ASSET_KEYS.wallSide).setDepth(2.2);
    const rightWall = this.add.tileSprite(x + width - wallThickness / 2, y + height / 2, wallThickness, height, OFFICE_ASSET_KEYS.wallSide).setDepth(2.2).setFlipX(true);

    [
      [x + wallThickness / 2, y + wallThickness / 2],
      [x + width - wallThickness / 2, y + wallThickness / 2],
      [x + wallThickness / 2, y + height - wallThickness / 2],
      [x + width - wallThickness / 2, y + height - wallThickness / 2],
    ].forEach(([cornerX, cornerY]) => {
      this.add.rectangle(cornerX, cornerY, wallThickness, wallThickness, theme.wallPanel, 1).setDepth(2.25);
      this.add.rectangle(cornerX, cornerY, wallThickness - 6, 2, theme.neonSecondary, 0.18).setDepth(2.3);
    });

    this.add.rectangle(x + width / 2, y + wallThickness + 2, width - wallThickness * 2, 2, 0xffffff, 0.03).setDepth(2.15);
    this.add.rectangle(x + width / 2, y + height - wallThickness - 2, width - wallThickness * 2, 2, 0x000000, 0.12).setDepth(2.15);

    void topWall;
    void bottomWall;
    void leftWall;
    void rightWall;
    this.shellState.outerWallsRendered = true;
  }

  private renderConfiguredFloorAreas() {
    this.design.floorAreas.forEach((floorArea) => {
      const container = this.add.container(floorArea.x, floorArea.y).setDepth(1.4);
      const width = floorArea.width;
      const height = Math.max(floorArea.height, 2);
      const centerX = width / 2;
      const centerY = height / 2;
      const fill = this.hexColor(floorArea.fillColor ?? "#141c2a");
      const accent = this.hexColor(floorArea.accentColor ?? "#66d9ff");
      const alpha = floorArea.opacity ?? floorArea.fillAlpha ?? 0.9;
      const patternKey =
        floorArea.pattern === "metalPanel" || floorArea.pattern === "concrete"
          ? OFFICE_ASSET_KEYS.corridorTile
          : OFFICE_ASSET_KEYS.floorTile;

      container.add(this.add.rectangle(centerX, centerY, width, height, fill, Math.min(alpha, 0.96)));
      container.add(this.add.tileSprite(centerX, centerY, width, height, patternKey).setAlpha(Math.min(alpha, 0.52)));
      container.add(this.add.rectangle(centerX, 8, width - 8, 2, 0xffffff, 0.04));
      container.add(this.add.rectangle(centerX, height - 8, width - 8, 2, accent, 0.08));

      if (floorArea.pattern === "grid") {
        for (let x = 12; x < width; x += 24) {
          container.add(this.add.rectangle(x, centerY, 1, height - 12, accent, 0.08));
        }
        for (let y = 12; y < height; y += 24) {
          container.add(this.add.rectangle(centerX, y, width - 12, 1, accent, 0.08));
        }
      } else if (floorArea.pattern === "checker") {
        for (let x = 8; x < width; x += 24) {
          for (let y = 8; y < height; y += 24) {
            if (((x + y) / 24) % 2 === 0) {
              container.add(this.add.rectangle(x, y, 12, 12, 0xffffff, 0.03));
            }
          }
        }
      } else if (floorArea.pattern === "carpet") {
        container.add(this.add.rectangle(centerX, centerY, width - 10, height - 10, accent, 0.05));
      } else if (floorArea.pattern === "tile") {
        for (let x = 12; x < width; x += 20) {
          container.add(this.add.rectangle(x, centerY, 1, height - 8, 0xffffff, 0.03));
        }
        for (let y = 12; y < height; y += 20) {
          container.add(this.add.rectangle(centerX, y, width - 8, 1, 0xffffff, 0.03));
        }
      }

      this.floorAreaRefs.set(floorArea.id, container);
    });
  }

  private addWalkwayBands() {
    const bands = this.add.container(0, 0).setDepth(2);
    [
      [28, 15.8, 39.8, 3.2],
      [25.4, 20.5, 28.6, 3.1],
      [31.8, 28.5, 33.2, 2.8],
    ].forEach(([x, y, width, height]) => {
      bands.add(this.add.rectangle(tileToPixel(x), tileToPixel(y), tileToPixel(width), tileToPixel(height), 0x1a2232, 0.14));
      bands.add(this.add.rectangle(tileToPixel(x), tileToPixel(y - height / 2 + 0.12), tileToPixel(width - 0.8), 1, 0xffffff, 0.045));
      bands.add(this.add.rectangle(tileToPixel(x), tileToPixel(y + height / 2 - 0.12), tileToPixel(width - 0.8), 1, 0x000000, 0.1));
    });

    [
      [12.5, 20.5, 2.4, 7.6],
      [39.6, 20.4, 2.6, 8.2],
      [22.1, 15.9, 2.2, 4.2],
    ].forEach(([x, y, width, height]) => {
      bands.add(this.add.rectangle(tileToPixel(x), tileToPixel(y), tileToPixel(width), tileToPixel(height), 0x1d2637, 0.16));
    });
  }

  private addOpenZonePanels() {
    this.design.rooms.forEach((zone) => {
      const accent = this.roomAccentColor(zone.accent);
      const x = zone.x + zone.width / 2;
      const y = zone.y + zone.height / 2;
      const width = zone.width;
      const height = zone.height;

      const aura = this.add.ellipse(x, y - height * 0.14, width * 0.56, height * 0.34, accent, 0.04).setDepth(2.3);
      this.pulse(aura, 0.02, 0.08, 2200 + zone.width * 40);
    });
  }

  private addOpenSeparators() {
    const theme = this.requireTheme();
    const separators = this.add.container(0, 0).setDepth(3);

    [
      this.neonRailing(31.2, 14.4, 12, "cyan"),
      this.neonRailing(39.2, 22.2, 10, "purple"),
      this.neonRailing(19.2, 27.1, 8, "orange"),
      this.neonRailing(8.1, 22.2, 7.4, "pink"),
      this.neonRailing(45.8, 22.15, 10.6, "green"),
    ].forEach((item) => separators.add(item));

    separators.add(this.add.rectangle(tileToPixel(28), tileToPixel(4.9), tileToPixel(47), 2, theme.trim, 0.18));
    separators.add(this.add.rectangle(tileToPixel(28), tileToPixel(31.8), tileToPixel(47), 2, theme.trim, 0.08));
  }

  private addArchitecturalDepth() {
    const theme = this.requireTheme();
    const structure = this.add.container(0, 0).setDepth(3.4);

    [
      [5.4, 7.6, 1.4, 4.4],
      [18.2, 7.5, 1.2, 4.2],
      [30.4, 7.6, 1.2, 4.6],
      [49, 7.9, 1.4, 4.3],
      [6.1, 29.6, 1.4, 3.6],
      [34.7, 29.8, 1.2, 4.4],
      [48.6, 29.8, 1.2, 4.4],
    ].forEach(([x, y, width, height]) => {
      structure.add(this.add.tileSprite(tileToPixel(x), tileToPixel(y), tileToPixel(width), tileToPixel(height), OFFICE_ASSET_KEYS.wallPanel).setAlpha(0.88));
      structure.add(this.add.rectangle(tileToPixel(x - width / 2 + 0.08), tileToPixel(y), 2, tileToPixel(height - 0.2), theme.trim, 0.16));
      structure.add(this.add.rectangle(tileToPixel(x + width / 2 - 0.08), tileToPixel(y), 2, tileToPixel(height - 0.2), 0x0a0f17, 0.42));
      structure.add(this.add.rectangle(tileToPixel(x), tileToPixel(y - height / 2 + 0.18), tileToPixel(width - 0.08), 2, 0xffffff, 0.05));
    });

    [
      [8.4, 12.7, 7.2, 0.5],
      [22.2, 16.2, 14.4, 0.5],
      [41, 11.7, 10.4, 0.5],
      [39.2, 21.8, 11, 0.5],
      [18.8, 26.9, 8.8, 0.5],
      [45.9, 31.8, 10.6, 0.5],
    ].forEach(([x, y, width, height]) => {
      structure.add(this.add.rectangle(tileToPixel(x), tileToPixel(y), tileToPixel(width), tileToPixel(height), 0xffffff, 0.03));
      structure.add(this.add.rectangle(tileToPixel(x), tileToPixel(y + 0.3), tileToPixel(width), tileToPixel(height), 0x06080d, 0.16));
    });

    [
      [8.4, 4.95, 9.2, 0.7, theme.neonSecondary, 0.14],
      [22.2, 4.95, 13.8, 0.7, theme.neonPrimary, 0.14],
      [41, 4.95, 11.6, 0.7, theme.signGlow, 0.14],
      [6.8, 14.2, 7.2, 0.6, theme.neonSecondary, 0.12],
      [39.2, 14.1, 11.5, 0.6, theme.neonSecondary, 0.12],
      [18.8, 20.2, 10.2, 0.6, theme.warmGlow, 0.12],
      [46, 23.0, 10.6, 0.6, theme.neonTertiary, 0.12],
    ].forEach(([x, y, width, height, color, alpha]) => {
      structure.add(this.add.rectangle(tileToPixel(x), tileToPixel(y), tileToPixel(width), tileToPixel(height), color as number, alpha as number));
    });

    [
      [4.4, 6.4, 2.6, 2.6],
      [51.2, 6.4, 2.4, 2.6],
      [4.6, 31.2, 2.8, 2.2],
      [51.1, 31.2, 2.7, 2.2],
    ].forEach(([x, y, width, height]) => {
      structure.add(this.add.ellipse(tileToPixel(x), tileToPixel(y), tileToPixel(width), tileToPixel(height), 0x000000, 0.16));
    });
  }

  private addZoneLabelsAndAnchors() {
    this.design.rooms.forEach((zone) => {
      if (zone.labelEnabled === false) {
        return;
      }
      const accent = this.roomAccentColor(zone.accent);
      const anchor = this.add.ellipse(zone.labelX, zone.labelY + 14, 18, 8, accent, 0.12).setDepth(4);
      this.pulse(anchor, 0.05, 0.18, 1800 + zone.x * 0.35);
      this.createRoomLabel(zone);
    });
  }

  private populateOpenOffice() {
    this.renderConfiguredProps();
  }

  private renderConfiguredProps() {
    this.design.props.forEach((prop) => this.renderProp(prop));
  }

  private renderConfiguredShapes() {
    this.design.shapes.forEach((shape) => this.renderShape(shape));
  }

  private registerPropRef(propId: string, ...refs: Array<Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform>) {
    const current = this.propRefs.get(propId) ?? [];
    current.push(...refs);
    this.propRefs.set(propId, current);
  }

  private renderShape(shape: ShapeConfig) {
    const container = this.add.container(shape.x, shape.y).setDepth(shape.depth ?? 6);
    const width = shape.width;
    const height = shape.height;
    const fill = this.hexColor(shape.fillColor ?? "#1a2232");
    const stroke = this.hexColor(shape.strokeColor ?? "#66d9ff");
    const accent = this.hexColor(shape.accentColor ?? "#66d9ff");
    const alpha = shape.opacity ?? 0.9;

    switch (shape.type) {
      case "rectangle":
      case "panel":
      case "wallBlock":
      case "divider":
      case "counter":
      case "shelf":
        container.add(this.add.rectangle(0, 0, width, height, fill, alpha).setStrokeStyle(1, stroke, 0.65));
        break;
      case "roundedRectangle":
      case "glassPanel":
      case "rug":
        container.add(this.add.rectangle(0, 0, width, height, fill, shape.type === "glassPanel" ? 0.28 : alpha).setStrokeStyle(1, stroke, 0.6));
        container.add(this.add.rectangle(0, -height / 2 + 3, width - 8, 2, 0xffffff, 0.08));
        break;
      case "circle":
      case "ellipse":
        container.add(this.add.ellipse(0, 0, width, height, fill, alpha).setStrokeStyle(1, stroke, 0.7));
        break;
      case "neonStrip":
      case "line":
      case "thickLine":
      case "cable":
        container.add(this.add.rectangle(0, 0, width, Math.max(2, height), accent, alpha));
        break;
      case "floorTile":
      case "pixelBlock":
        container.add(this.add.rectangle(0, 0, width, height, fill, alpha).setStrokeStyle(1, stroke, 0.5));
        container.add(this.add.tileSprite(0, 0, width, height, OFFICE_ASSET_KEYS.floorTile).setAlpha(0.18));
        break;
      case "triangle":
      case "polygon":
      default:
        container.add(this.add.rectangle(0, 0, width, height, fill, alpha).setStrokeStyle(1, stroke, 0.6));
        break;
    }

    if (shape.pattern === "grid") {
      for (let x = -width / 2 + 8; x < width / 2; x += 16) {
        container.add(this.add.rectangle(x, 0, 1, height - 4, accent, 0.12));
      }
      for (let y = -height / 2 + 8; y < height / 2; y += 16) {
        container.add(this.add.rectangle(0, y, width - 4, 1, accent, 0.12));
      }
    } else if (shape.pattern === "checker") {
      for (let x = -width / 2 + 6; x < width / 2; x += 16) {
        for (let y = -height / 2 + 6; y < height / 2; y += 16) {
          if ((Math.round((x + width / 2) / 16) + Math.round((y + height / 2) / 16)) % 2 === 0) {
            container.add(this.add.rectangle(x, y, 8, 8, 0xffffff, 0.05));
          }
        }
      }
    } else if (shape.pattern === "neonEdge") {
      container.add(this.add.rectangle(0, -height / 2 + 2, width - 4, 2, accent, 0.25));
      container.add(this.add.rectangle(0, height / 2 - 2, width - 4, 2, accent, 0.18));
    } else if (shape.pattern === "glass") {
      container.add(this.add.rectangle(0, 0, width - 4, height - 4, 0xffffff, 0.04));
    }

    if (shape.rotation) {
      container.setRotation(Phaser.Math.DegToRad(shape.rotation));
    }

    this.shapeRefs.set(shape.id, container);
  }

  private renderProp(prop: PropConfig) {
    switch (prop.type) {
      case "neonSign":
        this.registerPropRef(prop.id, this.sign(prop.x / TILE_SIZE, prop.y / TILE_SIZE, prop.accent ?? "cyan", prop.scaleX ?? 1));
        return;
      case "monitorCluster":
        this.registerPropRef(
          prop.id,
          this.deskWithMonitors(prop.x / TILE_SIZE, prop.y / TILE_SIZE, prop.accent ?? "cyan", prop.dual ?? true),
          this.deskAccessories(prop.x / TILE_SIZE, prop.y / TILE_SIZE, prop.accent ?? "cyan", prop.dual ?? true),
        );
        return;
      case "desk":
      case "monitor":
      case "chair":
      case "serverRack":
      case "plant":
      case "sofa":
      case "coffeeBar":
      case "whiteboard":
      case "console":
      case "books":
      case "cup":
      case "tinyScreen":
      case "vent":
      case "pipe":
      case "floorMark":
        this.registerPropRef(
          prop.id,
          this.prop(prop.type, prop.x / TILE_SIZE, prop.y / TILE_SIZE, prop.scaleX ?? 1, prop.scaleY ?? 1, prop.flipX ?? false),
        );
        return;
      case "keyboard":
        this.registerPropRef(
          prop.id,
          this.add.rectangle(prop.x, prop.y, prop.width ?? 18, prop.height ?? 8, 0x1b2433, 0.96)
            .setStrokeStyle(1, this.roomAccentColor(prop.accent ?? "cyan"), 0.35)
            .setDepth(6.4),
        );
        return;
      case "smallTable":
        this.registerPropRef(
          prop.id,
          this.prop("meetingTable", prop.x / TILE_SIZE, prop.y / TILE_SIZE, prop.scaleX ?? 1, prop.scaleY ?? 1, prop.flipX ?? false),
        );
        return;
      case "decorativePanel":
        this.registerPropRef(
          prop.id,
          this.prop("wallPanel", prop.x / TILE_SIZE, prop.y / TILE_SIZE, prop.scaleX ?? 1, prop.scaleY ?? 1, prop.flipX ?? false),
        );
        return;
      case "floorCable":
        this.registerPropRef(
          prop.id,
          this.prop("cable", prop.x / TILE_SIZE, prop.y / TILE_SIZE, prop.scaleX ?? 1, prop.scaleY ?? 1, prop.flipX ?? false),
        );
        return;
      case "paperStack":
        this.registerPropRef(prop.id, this.paperStack(prop.x / TILE_SIZE, prop.y / TILE_SIZE, prop.accent ?? "purple"));
        return;
      case "deskLamp":
        this.registerPropRef(prop.id, this.deskLamp(prop.x / TILE_SIZE, prop.y / TILE_SIZE, prop.accent ?? "cyan"));
        return;
      case "glassDivider":
        this.registerPropRef(
          prop.id,
          this.glassDivider(
            prop.x / TILE_SIZE,
            prop.y / TILE_SIZE,
            prop.width ? prop.width / TILE_SIZE : 0.7,
            prop.height ? prop.height / TILE_SIZE : 7,
            prop.accent ?? "cyan",
          ).setDepth(3.2),
        );
        return;
      case "wallSegment":
        this.registerPropRef(
          prop.id,
          this.prop("wallPanel", prop.x / TILE_SIZE, prop.y / TILE_SIZE, prop.scaleX ?? 0.8, prop.scaleY ?? 2),
        );
        return;
      case "floorLight":
        this.registerPropRef(
          prop.id,
          this.add.rectangle(prop.x, prop.y, prop.width ?? 18, prop.height ?? 4, this.roomAccentColor(prop.accent ?? "cyan"), 0.32).setDepth(4.8),
        );
        return;
      default:
        return;
    }
  }

  private createAtmosphere() {
    this.ambienceLayer = this.add.container(0, 0).setDepth(20);
    const subtleNoise = this.add.image(tileToPixel(28), tileToPixel(18.5), OFFICE_ASSET_KEYS.noise)
      .setDisplaySize(tileToPixel(47.5), tileToPixel(27))
      .setAlpha(0.045);
    this.ambienceLayer.add(subtleNoise);

    ambientZones.forEach((zone) => {
      const aura = this.add.ellipse(
        tileToPixel(zone.center.x),
        tileToPixel(zone.center.y),
        tileToPixel(zone.radius * 0.95),
        tileToPixel(zone.radius * 0.55),
        this.roomAccentColor(zone.colorIntent),
        0.022,
      );
      this.ambienceLayer?.add(aura);
      this.pulse(aura, 0.008, 0.035, 2600 + zone.radius * 130);
    });
  }

  private createPerimeterPlants() {
    [4, 6.5, 11.8, 43.6, 47.9, 51.2].forEach((x, index) => {
      const plant = this.add.image(tileToPixel(x), tileToPixel(32.05 + (index % 2) * 0.28), OFFICE_ASSET_KEYS.plant)
        .setDepth(8)
        .setScale(1 + (index % 2) * 0.05);
      this.tweens.add({
        targets: plant,
        y: plant.y - 2,
        duration: 2200 + index * 120,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    [4.4, 52].forEach((x, index) => {
      const plant = this.add.image(tileToPixel(x), tileToPixel(6.3 + index * 0.4), OFFICE_ASSET_KEYS.plant)
        .setDepth(8)
        .setScale(0.94);
      this.tweens.add({
        targets: plant,
        y: plant.y - 1.5,
        duration: 2500 + index * 180,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private createCharacterNameLabel(agent: Agent) {
    const container = this.add.container(0, CHARACTER_LABEL_Y);
    const background = this.add.rectangle(0, 0, CHARACTER_LABEL_WIDTH, CHARACTER_LABEL_HEIGHT, 0x08101c, 0.9)
      .setStrokeStyle(1, this.requireTheme().neonSecondary, 0.34);
    const name = this.add.text(0, -6.2, agent.name, {
      fontFamily: "monospace",
      fontSize: CHARACTER_NAME_FONT,
      color: "#f4f8ff",
      align: "center",
    }).setOrigin(0.5, 0.5);
    const statusText = this.add.text(0, 5.2, agent.role, {
      fontFamily: "monospace",
      fontSize: CHARACTER_ROLE_FONT,
      color: "#b7d8f2",
      align: "center",
    }).setOrigin(0.5, 0.5);
    container.add([background, name, statusText]);
    return { container, name, statusText };
  }

  private syncAgentVisualState(agent: Agent, refs: SceneAgentRefs) {
    refs.status.setFillStyle(this.statusColor(agent.status), 1);
    refs.desiredStatusText = agent.officeState?.labelText ?? `${agent.name} — ${agent.role}`;
    refs.labelNameText.setText(agent.name);
    refs.labelStatusText.setText(agent.officeState?.labelText?.replace(`${agent.name} — `, "") ?? agent.role);

    const desiredStepId = agent.officeState?.targetWaypointId;
    refs.desiredStep =
      desiredStepId ?
        refs.routineSteps.find((step) => step.id === desiredStepId) :
        undefined;
  }

  private createRoomLabel(zone: RoomConfig) {
    const { x, y } = this.roomLabelWorldPosition(zone);
    const container = this.add.container(x, y).setDepth(9.5);
    const width = Math.max(100, zone.label.length * 7 + 16);
    const background = this.add.rectangle(0, 0, width, ROOM_LABEL_HEIGHT, 0x0c1826, 0.82)
      .setStrokeStyle(1, this.roomAccentColor(zone.accent), 0.34);
    const text = this.add.text(0, 0, zone.label, {
      fontFamily: "monospace",
      fontSize: ROOM_LABEL_FONT,
      color: "#f7fbff",
      align: "center",
    }).setOrigin(0.5, 0.5);
    container.add([background, text]);
    this.roomLabelRefs.push({
      id: zone.id,
      label: zone.label,
      container,
      bounds: {
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
      },
    });
  }

  private createAgents() {
    const agents = this.getAgents?.() ?? [];
    if (DEBUG_MOVEMENT) {
      this.debugMovementLayer = this.add.container(0, 0).setDepth(1000);
    }
    agents.forEach((agent) => {
      const character = this.characterConfigFor(agent.id);
      const route = this.routeForCharacter(agent.id);
      this.createAgent(agent, character, route);
      this.drawDebugRoutine(agent);
    });
    this.movementController.assertRegisteredCount(4);
    this.validateDebugRoutines(agents);
  }

  private createAgent(agent: Agent, character: CharacterConfig, route: MovementRouteConfig) {
    const frames = getAgentFrameKeys(agent.id);
    const position = new Phaser.Math.Vector2(character.x, character.y);
    const initialStep = route.steps[0];
    const root = this.add.container(position.x, position.y).setDepth(12 + position.y * 0.01);
    const shadow = this.add.ellipse(position.x, position.y + 1, 15, 6, 0x000000, 0.28).setDepth(11.8 + position.y * 0.01);
    const sprite = this.add.image(0, -4, frames.idle).setOrigin(0.5, 1).setScale(1.42);
    const status = this.add.circle(0, -31, 3, this.statusColor(agent.status), 1);
    const labelRefs = this.createCharacterNameLabel(agent);
    root.add([sprite, status, labelRefs.container]);

    const refs: SceneAgentRefs = {
      root,
      shadow,
      sprite,
      status,
      label: labelRefs.container,
      labelNameText: labelRefs.name,
      labelStatusText: labelRefs.statusText,
      frames,
      currentStation: initialStep?.id ?? character.homeAnchorId,
      currentZone: (initialStep?.zoneId as ZoneId | undefined) ?? this.zoneForPoint(character.x, character.y),
      currentTarget: initialStep?.id ?? character.homeAnchorId,
      routineSteps: route.steps.map((step) => ({ ...step, path: step.path ? step.path.map((point) => ({ ...point })) : undefined })),
      currentStepIndex: 1 % Math.max(1, route.steps.length),
      state: "idle",
      target: undefined,
      currentStepId: initialStep?.id,
      routePoints: [],
      routeIndex: 0,
      idleUntil: this.time.now + 700 + this.agentRefs.size * 220,
      speed: 42,
      idleType: initialStep?.idleType ?? "typing",
      moveStartedAt: 0,
      visitedStepIds: new Set([initialStep?.id ?? "unknown"]),
      isWalking: false,
      walkFrameIndex: 0,
      failedStations: new Set(),
      desiredStep: initialStep,
      desiredStatusText: undefined,
    };

    this.agentRefs.set(agent.id, refs);
    this.movementController.registerAgent(agent, refs);
    this.syncAgentVisualState(agent, refs);
    this.startIdleAnimation(agent, refs);
    this.scheduleBlink(agent, refs);
    this.applyFacing(refs, initialStep?.facing ?? "right");
    this.applyIdleAction(refs);
    if (DEBUG_MOVEMENT && this.debugMovementLayer) {
      refs.debugText = this.add.text(position.x + 10, position.y - 40, "idle", {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#dff4ff",
      }).setDepth(1000);
      this.debugMovementLayer.add(refs.debugText);
    }
  }

  private startIdleAnimation(agent: Agent, refs: SceneAgentRefs) {
    this.tweens.add({
      targets: refs.sprite,
      y: { from: -4, to: -4.45 },
      duration: 1900 + agent.name.length * 110,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: refs.sprite,
      scaleY: { from: 1.42, to: 1.435 },
      scaleX: { from: 1.42, to: 1.41 },
      duration: 2200 + agent.name.length * 90,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: refs.shadow,
      scaleX: { from: 1, to: 0.94 },
      alpha: { from: 0.28, to: 0.22 },
      duration: 1900 + agent.name.length * 110,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.pulse(refs.status, 0.4, 1, 860);
    refs.idleTilt = this.time.addEvent({
      delay: 1800 + agent.name.length * 60,
      loop: true,
      callback: () => {
        if (refs.isWalking) {
          return;
        }
        refs.sprite.setAngle(refs.sprite.angle === 0 ? 1.1 : 0);
        this.time.delayedCall(240, () => {
          if (!refs.isWalking) {
            refs.sprite.setAngle(0);
          }
        });
      },
    });
  }

  private scheduleBlink(agent: Agent, refs: SceneAgentRefs) {
    refs.blinkTimer?.remove(false);
    refs.blinkTimer = this.time.addEvent({
      delay: 2400 + agent.name.length * 170,
      loop: true,
      callback: () => {
        if (refs.isWalking) {
          return;
        }
        refs.sprite.setTexture(refs.frames.blink);
        this.time.delayedCall(140, () => {
          if (!refs.isWalking) {
            refs.sprite.setTexture(refs.frames.idle);
          }
        });
      },
    });
  }

  startWalkCycle(refs: SceneAgentRefs) {
    refs.sprite.setScale(1.42);
    refs.sprite.setAngle(0);
    const cycle = () => {
      if (!refs.isWalking) {
        return;
      }
      refs.walkFrameIndex = refs.walkFrameIndex === 0 ? 1 : 0;
      refs.sprite.setTexture(refs.walkFrameIndex === 0 ? refs.frames.walkA : refs.frames.walkB);
      refs.sprite.y = refs.walkFrameIndex === 0 ? -4.02 : -4.24;
      this.time.delayedCall(260, cycle);
    };
    cycle();
  }

  setAgentIdle(refs: SceneAgentRefs) {
    refs.state = "idle";
    refs.isWalking = false;
    refs.sprite.setTexture(refs.frames.idle);
    refs.sprite.y = -4;
    refs.sprite.setAngle(0);
    refs.sprite.x = 0;
    refs.routePoints = [];
    refs.routeIndex = 0;
    refs.target = undefined;
    this.applyFacing(refs);
    this.syncAgentDepth(refs);
    this.applyIdleAction(refs);
  }

  isInsideOfficeBounds(x: number, y: number) {
    return x >= tileToPixel(3) && x <= tileToPixel(53) && y >= tileToPixel(5) && y <= tileToPixel(33);
  }

  syncAgentDepth(refs: SceneAgentRefs) {
    refs.shadow.setDepth(11.8 + refs.root.y * 0.01);
    refs.root.setDepth(12 + refs.root.y * 0.01);
  }

  applyIdleAction(refs: SceneAgentRefs) {
    refs.idleActionTween?.stop();
    refs.idleActionTween = undefined;
    if (refs.isWalking) {
      return;
    }

    const idle = refs.idleType;
    if (idle === "typing" || idle === "qa" || idle === "whiteboard" || idle === "thinking") {
      refs.idleActionTween = this.tweens.add({
        targets: refs.sprite,
        x: { from: -0.6, to: 0.8 },
        angle: { from: -1, to: 1.2 },
        duration: 780,
        yoyo: true,
        repeat: 2,
        ease: "Sine.easeInOut",
      });
      return;
    }

    if (idle === "coffee") {
      refs.idleActionTween = this.tweens.add({
        targets: refs.sprite,
        angle: { from: -1.4, to: 1.4 },
        duration: 1100,
        yoyo: true,
        repeat: 1,
        ease: "Sine.easeInOut",
      });
      return;
    }

    if (idle === "server") {
      refs.idleActionTween = this.tweens.add({
        targets: refs.sprite,
        x: { from: 0, to: 0.7 },
        angle: { from: 0, to: -1.8 },
        duration: 900,
        yoyo: true,
        repeat: 2,
        ease: "Sine.easeInOut",
      });
    }
  }

  idleTypeForStep(step: MovementRouteStep): MovementRouteStep["idleType"] {
    switch (step.statusTag) {
      case "working":
        return "typing";
      case "coffeeBreak":
      case "lunch":
        return "coffee";
      case "meeting":
        return "whiteboard";
      case "idle":
        return "idle";
      default:
        return step.idleType;
    }
  }

  private characterConfigFor(agentId: Agent["id"]) {
    const character = this.design.characters.find((candidate) => candidate.id === agentId);
    if (!character) {
      throw new Error(`Missing character config for ${agentId}`);
    }
    return character;
  }

  private routeForCharacter(agentId: Agent["id"]) {
    const route = this.design.movementRoutes.find((candidate) => candidate.characterId === agentId);
    if (!route) {
      throw new Error(`Missing movement route for ${agentId}`);
    }
    return route;
  }

  zoneForPoint(x: number, y: number): ZoneId {
    const room = this.design.rooms.find(
      (candidate) =>
        x >= candidate.x &&
        x <= candidate.x + candidate.width &&
        y >= candidate.y &&
        y <= candidate.y + candidate.height,
    );
    return (room?.id ?? "lobby") as ZoneId;
  }

  applyFacing(refs: SceneAgentRefs, facing?: Facing) {
    const resolvedFacing = facing ?? refs.routineSteps[(refs.currentStepIndex - 1 + refs.routineSteps.length) % refs.routineSteps.length]?.facing;
    if (resolvedFacing === "left") {
      refs.sprite.setFlipX(true);
    } else if (resolvedFacing === "right") {
      refs.sprite.setFlipX(false);
    }
  }

  debugMovement(agentId: string, message: string) {
    if (!DEBUG_MOVEMENT) {
      return;
    }
    console.debug(`[movement:${agentId}] ${message}`);
  }

  private drawDebugRoutine(agent: Agent) {
    if (!DEBUG_MOVEMENT || !this.debugMovementLayer) {
      return;
    }

    const colorMap: Record<Agent["id"], number> = {
      viktor: 0xffa347,
      emil: 0x4fd5ff,
      robin: 0x7ef7c9,
      adam: 0xff6bb6,
    };

    this.routeForCharacter(agent.id).steps.forEach((step, index) => {
      const point = { x: step.x, y: step.y };
      this.debugMovementLayer?.add(this.add.circle(point.x, point.y, 3, colorMap[agent.id], 0.95).setDepth(1000));
      this.debugMovementLayer?.add(
        this.add.text(point.x + 5, point.y - 7, `${agent.name} ${index + 1}`, {
          fontFamily: "monospace",
          fontSize: "8px",
          color: "#f4f8ff",
        }).setDepth(1000),
      );
    });
  }

  private validateDebugRoutines(agents: Agent[]) {
    if (!DEBUG_MOVEMENT) {
      return;
    }

    const seen = new Map<string, string>();
    agents.forEach((agent) => {
      const steps = this.routeForCharacter(agent.id).steps;
      if (steps.length < 3) {
        console.warn(`[movement:${agent.id}] has less than 3 routine points`);
      }

      steps.forEach((step, index) => {
        if (!this.isInsideOfficeBounds(step.x, step.y)) {
          console.warn(`[movement:${agent.id}] invalid target at step ${index + 1}`, step.id);
          return;
        }
        const key = `${step.x}:${step.y}`;
        const owner = seen.get(key);
        if (owner) {
          console.warn(`[movement:${agent.id}] shares target coordinates with ${owner} at ${step.id}`);
        } else {
          seen.set(key, `${agent.id}:${step.id}`);
        }
      });
    });
  }

  private prop(
    kind: "desk" | "monitor" | "chair" | "serverRack" | "plant" | "sofa" | "coffeeBar" | "whiteboard" | "meetingTable" | "wallPanel" | "console" | "cable" | "cup" | "books" | "tinyScreen" | "vent" | "pipe" | "floorMark",
    x: number,
    y: number,
    scaleX = 1,
    scaleY = 1,
    flipX = false,
  ) {
    const keyMap = {
      desk: OFFICE_ASSET_KEYS.desk,
      monitor: OFFICE_ASSET_KEYS.monitor,
      chair: OFFICE_ASSET_KEYS.chair,
      serverRack: OFFICE_ASSET_KEYS.serverRack,
      plant: OFFICE_ASSET_KEYS.plant,
      sofa: OFFICE_ASSET_KEYS.sofa,
      coffeeBar: OFFICE_ASSET_KEYS.coffeeBar,
      whiteboard: OFFICE_ASSET_KEYS.whiteboard,
      meetingTable: OFFICE_ASSET_KEYS.meetingTable,
      wallPanel: OFFICE_ASSET_KEYS.wallPanel,
      console: OFFICE_ASSET_KEYS.console,
      cable: OFFICE_ASSET_KEYS.cable,
      cup: OFFICE_ASSET_KEYS.cup,
      books: OFFICE_ASSET_KEYS.books,
      tinyScreen: OFFICE_ASSET_KEYS.tinyScreen,
      vent: OFFICE_ASSET_KEYS.vent,
      pipe: OFFICE_ASSET_KEYS.pipe,
      floorMark: OFFICE_ASSET_KEYS.floorMark,
    } as const;

    const depth = 12 + y * 0.01;
    const shadowKinds = new Set(["desk", "chair", "serverRack", "plant", "sofa", "coffeeBar", "meetingTable", "console", "whiteboard"]);
    if (shadowKinds.has(kind)) {
      const shadowWidth =
        kind === "serverRack" ? 20 :
          kind === "coffeeBar" ? 34 :
            kind === "meetingTable" ? 34 :
              kind === "sofa" ? 26 :
                kind === "whiteboard" ? 24 :
                  16;
      this.add.ellipse(tileToPixel(x), tileToPixel(y + 0.75), shadowWidth * scaleX, 7 * scaleY, 0x000000, 0.18).setDepth(depth - 0.2);
    }

    return this.add.image(tileToPixel(x), tileToPixel(y), keyMap[kind]).setScale(scaleX, scaleY).setFlipX(flipX).setDepth(depth);
  }

  private deskWithMonitors(x: number, y: number, accent: AccentName, dual: boolean) {
    const container = this.add.container(tileToPixel(x), tileToPixel(y)).setDepth(12 + y * 0.01);
    container.add(this.add.ellipse(0, 16, 34, 8, 0x000000, 0.18));
    container.add(this.add.image(0, 0, OFFICE_ASSET_KEYS.desk));
    const leftMonitor = this.add.image(-11, -7, OFFICE_ASSET_KEYS.monitor).setTint(this.roomAccentColor(accent));
    container.add(leftMonitor);
    this.pulse(leftMonitor, 0.82, 1, 940 + Math.round(x * 12));

    if (dual) {
      const rightMonitor = this.add.image(11, -7, OFFICE_ASSET_KEYS.monitor).setTint(this.roomAccentColor(accent));
      container.add(rightMonitor);
      this.pulse(rightMonitor, 0.8, 1, 980 + Math.round(y * 10));
    }

    container.add(this.add.image(0, 18, OFFICE_ASSET_KEYS.chair));
    return container;
  }

  private deskAccessories(x: number, y: number, accent: AccentName, dual: boolean) {
    const container = this.add.container(tileToPixel(x), tileToPixel(y)).setDepth(12.2 + y * 0.01);
    container.add(this.add.rectangle(-7, 5, 12, 3, 0x1b2231, 1));
    container.add(this.add.rectangle(6, 6, 8, 2, 0x6f7582, 1));
    container.add(this.add.rectangle(6, 5, 6, 1, this.roomAccentColor(accent), 0.55));
    container.add(this.add.rectangle(-15, -10, 2, 8, 0x262d3d, 1));
    container.add(this.add.rectangle(-13, -13, 5, 2, this.roomAccentColor(accent), 0.7));
    if (dual) {
      container.add(this.add.rectangle(14, 5, 5, 3, 0xd6dbe4, 0.9));
      container.add(this.add.rectangle(13, 4, 5, 1, 0x98a5ba, 0.9));
    }
    return container;
  }

  private deskLamp(x: number, y: number, accent: AccentName) {
    const container = this.add.container(tileToPixel(x), tileToPixel(y)).setDepth(12 + y * 0.01);
    container.add(this.add.ellipse(0, 2, 10, 4, 0x000000, 0.15));
    container.add(this.add.rectangle(0, 0, 4, 2, 0x1d2432, 1));
    container.add(this.add.rectangle(2, -4, 1, 6, 0x2c3447, 1));
    container.add(this.add.rectangle(4, -6, 4, 2, this.roomAccentColor(accent), 0.75));
    return container;
  }

  private paperStack(x: number, y: number, accent: AccentName) {
    const container = this.add.container(tileToPixel(x), tileToPixel(y)).setDepth(11.9 + y * 0.01);
    container.add(this.add.rectangle(0, 0, 7, 4, 0xd3d9e4, 0.94));
    container.add(this.add.rectangle(1, -1, 7, 4, 0xeff3f8, 0.92));
    container.add(this.add.rectangle(0, 0, 5, 1, this.roomAccentColor(accent), 0.45));
    return container;
  }

  private sign(x: number, y: number, accent: AccentName, scale = 1) {
    this.add.ellipse(tileToPixel(x), tileToPixel(y + 0.15), 52 * scale, 14 * scale, this.roomAccentColor(accent), 0.08).setDepth(6.8);
    const sign = this.add.image(tileToPixel(x), tileToPixel(y), OFFICE_ASSET_KEYS.neonSign)
      .setTint(this.roomAccentColor(accent))
      .setScale(scale, 0.95 * scale)
      .setDepth(7);
    this.pulse(sign, 0.7, 1, 1100);
    return sign;
  }

  private glassDivider(x: number, y: number, width: number, height: number, accent: AccentName) {
    const container = this.add.container(tileToPixel(x), tileToPixel(y));
    const pane = this.add.rectangle(0, 0, tileToPixel(width), tileToPixel(height), 0x6ad4ff, 0.08)
      .setStrokeStyle(1, this.roomAccentColor(accent), 0.25);
    const edgeColor = 0x202b3f;
    const postA = this.add.rectangle(-tileToPixel(width) / 2, 0, 2, tileToPixel(height), edgeColor, 0.92);
    const postB = this.add.rectangle(tileToPixel(width) / 2, 0, 2, tileToPixel(height), edgeColor, 0.92);
    const glowA = this.add.rectangle(-tileToPixel(width) / 2 + 1, 0, 1, tileToPixel(height - 0.4), this.roomAccentColor(accent), 0.22);
    const glowB = this.add.rectangle(tileToPixel(width) / 2 - 1, 0, 1, tileToPixel(height - 0.4), this.roomAccentColor(accent), 0.22);
    container.add([pane, postA, postB, glowA, glowB]);
    return container;
  }

  private hexColor(value: string) {
    return Phaser.Display.Color.HexStringToColor(value).color;
  }

  private neonRailing(x: number, y: number, width: number, accent: AccentName) {
    const line = this.add.container(tileToPixel(x), tileToPixel(y));
    const rail = this.add.rectangle(0, 0, tileToPixel(width), 3, this.roomAccentColor(accent), 0.36);
    const base = this.add.rectangle(0, 3, tileToPixel(width), 2, 0x101622, 1);
    line.add([rail, base]);
    this.pulse(rail, 0.12, 0.42, 1500 + width * 20);
    return line;
  }

  private pulse(target: Phaser.GameObjects.GameObject, from: number, to: number, duration: number) {
    this.tweens.add({
      targets: target,
      alpha: { from, to },
      duration,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  triggerAmbientHooks(zone: ZoneId, trigger: "agent-arrive" | "agent-pause") {
    ambientEventHooks
      .filter((hook) => hook.roomId === zone && hook.trigger === trigger)
      .forEach((hook) => this.events.emit("office-ambient-hook", hook));
  }

  private roomLabelWorldPosition(room: RoomConfig) {
    const officeMinX = tileToPixel(3) + 28;
    const officeMaxX = tileToPixel(53) - 28;
    const officeMinY = tileToPixel(5) + 18;
    const officeMaxY = tileToPixel(33) - 18;
    const rawX = room.x + Math.min(room.width * 0.5, tileToPixel(5.2));
    const rawY = room.y + tileToPixel(1.4);
    return {
      x: Phaser.Math.Clamp(rawX, officeMinX, officeMaxX),
      y: Phaser.Math.Clamp(rawY, officeMinY, officeMaxY),
    };
  }

  private roomAccentColor(accent: AccentName) {
    const theme = this.requireTheme();
    switch (accent) {
      case "cyan":
        return theme.neonPrimary;
      case "purple":
        return theme.neonSecondary;
      case "green":
        return theme.neonTertiary;
      case "orange":
        return theme.warmGlow;
      case "pink":
        return theme.signGlow;
    }
  }

  private statusColor(status: AgentStatus) {
    const theme = this.requireTheme();
    switch (status) {
      case "blocked":
        return 0xff6f7d;
      case "done":
        return theme.neonTertiary;
      case "working":
        return theme.neonPrimary;
      case "idle":
        return theme.warmGlow;
    }
  }

  private validateLabelAnchors(time: number) {
    const isLocalDev =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (!isLocalDev || time - this.lastLabelValidationAt < 1200) {
      return;
    }

    this.lastLabelValidationAt = time;
    this.agentRefs.forEach((refs, agentId) => {
      const world = refs.label.getWorldTransformMatrix();
      const offsetX = Math.abs(world.tx - refs.root.x);
      const offsetY = world.ty - refs.root.y;
      if (offsetX > 1.5) {
        console.warn(`[label:${agentId}] horizontal drift detected`, { offsetX });
      }
      if (offsetY > -38) {
        console.warn(`[label:${agentId}] label may overlap sprite`, { offsetY });
      }
    });
  }

  private requireTheme() {
    if (!this.theme) {
      throw new Error("Office theme is required.");
    }
    return this.theme;
  }
}
