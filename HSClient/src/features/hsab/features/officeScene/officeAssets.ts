import Phaser from "phaser";
import type { OfficeTheme } from "../../theme/officeThemes";
import type { CharacterAppearance, CharacterConfig } from "../officeDesign/types";

export const OFFICE_ASSET_KEYS = {
  floorTile: "office-floor-tile",
  corridorTile: "office-corridor-tile",
  wallTop: "office-wall-top",
  wallSide: "office-wall-side",
  neonTrim: "office-neon-trim",
  roomShadow: "office-room-shadow",
  monitor: "office-monitor",
  desk: "office-desk",
  chair: "office-chair",
  serverRack: "office-server-rack",
  plant: "office-plant",
  sofa: "office-sofa",
  coffeeBar: "office-coffee-bar",
  whiteboard: "office-whiteboard",
  meetingTable: "office-meeting-table",
  neonSign: "office-neon-sign",
  cable: "office-cable",
  wallPanel: "office-wall-panel",
  console: "office-console",
  cup: "office-cup",
  books: "office-books",
  tinyScreen: "office-tiny-screen",
  vent: "office-vent",
  pipe: "office-pipe",
  floorMark: "office-floor-mark",
  noise: "office-noise",
  agentViktorIdle: "office-agent-viktor-idle",
  agentViktorBlink: "office-agent-viktor-blink",
  agentViktorWalkA: "office-agent-viktor-walk-a",
  agentViktorWalkB: "office-agent-viktor-walk-b",
  agentEmilIdle: "office-agent-emil-idle",
  agentEmilBlink: "office-agent-emil-blink",
  agentEmilWalkA: "office-agent-emil-walk-a",
  agentEmilWalkB: "office-agent-emil-walk-b",
  agentRobinIdle: "office-agent-robin-idle",
  agentRobinBlink: "office-agent-robin-blink",
  agentRobinWalkA: "office-agent-robin-walk-a",
  agentRobinWalkB: "office-agent-robin-walk-b",
  agentAdamIdle: "office-agent-adam-idle",
  agentAdamBlink: "office-agent-adam-blink",
  agentAdamWalkA: "office-agent-adam-walk-a",
  agentAdamWalkB: "office-agent-adam-walk-b",
} as const;

type TextureKey = (typeof OFFICE_ASSET_KEYS)[keyof typeof OFFICE_ASSET_KEYS];

type DrawPixel = [number, number, number, number, string];

interface AgentPalette {
  skin: string;
  shirt: string;
  jacket: string;
  pants: string;
  shoes: string;
  hair: string;
  beard: string;
}

function hexColor(value: number) {
  return `#${value.toString(16).padStart(6, "0")}`;
}

function fillPixels(ctx: CanvasRenderingContext2D, pixels: DrawPixel[]) {
  pixels.forEach(([x, y, width, height, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  });
}

function createTexture(
  scene: Phaser.Scene,
  key: TextureKey,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }

  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) {
    throw new Error(`Failed to create texture: ${key}`);
  }
  const ctx = texture.getContext();

  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
  draw(ctx);
  texture.refresh();
}

function drawBorder(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, 1);
  ctx.fillRect(0, height - 1, width, 1);
  ctx.fillRect(0, 0, 1, height);
  ctx.fillRect(width - 1, 0, 1, height);
}

function drawFloorTile(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.floorTile, 20, 20, (ctx) => {
    ctx.fillStyle = hexColor(theme.floorBase);
    ctx.fillRect(0, 0, 20, 20);
    ctx.fillStyle = hexColor(theme.floorAlt);
    ctx.fillRect(0, 0, 10, 10);
    ctx.fillRect(10, 10, 10, 10);
    drawBorder(ctx, 20, 20, hexColor(theme.floorGrid));
    fillPixels(ctx, [
      [2, 2, 2, 2, "rgba(255,255,255,0.025)"],
      [12, 12, 2, 2, "rgba(255,255,255,0.02)"],
      [10, 0, 1, 20, "rgba(0,0,0,0.12)"],
      [0, 10, 20, 1, "rgba(0,0,0,0.12)"],
      [5, 15, 4, 1, "rgba(255,255,255,0.02)"],
      [14, 4, 3, 1, "rgba(0,0,0,0.1)"],
      [3, 8, 1, 5, "rgba(0,0,0,0.08)"],
    ]);
  });
}

function drawCorridorTile(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.corridorTile, 20, 20, (ctx) => {
    ctx.fillStyle = hexColor(theme.corridor);
    ctx.fillRect(0, 0, 20, 20);
    fillPixels(ctx, [
      [2, 2, 2, 2, "rgba(255,255,255,0.02)"],
      [12, 4, 3, 1, "rgba(255,255,255,0.015)"],
      [5, 15, 4, 1, "rgba(0,0,0,0.08)"],
      [9, 0, 1, 20, "rgba(0,0,0,0.06)"],
      [0, 9, 20, 1, "rgba(0,0,0,0.06)"],
    ]);
  });
}

function drawWallTop(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.wallTop, 20, 20, (ctx) => {
    ctx.fillStyle = hexColor(theme.wallPanel);
    ctx.fillRect(0, 0, 20, 20);
    fillPixels(ctx, [
      [0, 14, 20, 6, hexColor(theme.wallShadow)],
      [0, 0, 20, 2, "rgba(255,255,255,0.07)"],
      [0, 18, 20, 2, "rgba(0,0,0,0.32)"],
      [2, 10, 16, 1, hexColor(theme.trim)],
      [2, 4, 16, 1, "rgba(255,255,255,0.03)"],
      [3, 6, 4, 3, "rgba(0,0,0,0.08)"],
      [12, 6, 5, 3, "rgba(255,255,255,0.02)"],
      [9, 12, 2, 2, hexColor(theme.neonSecondary)],
    ]);
  });
}

function drawWallSide(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.wallSide, 20, 20, (ctx) => {
    ctx.fillStyle = hexColor(theme.wallShadow);
    ctx.fillRect(0, 0, 20, 20);
    ctx.fillStyle = hexColor(theme.wallPanel);
    ctx.fillRect(0, 0, 16, 20);
    fillPixels(ctx, [
      [0, 0, 1, 20, "rgba(255,255,255,0.08)"],
      [15, 0, 5, 20, "rgba(0,0,0,0.28)"],
      [4, 3, 8, 1, "rgba(255,255,255,0.02)"],
      [4, 8, 8, 1, hexColor(theme.trim)],
      [4, 14, 6, 1, "rgba(0,0,0,0.12)"],
    ]);
  });
}

function drawNeonTrim(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.neonTrim, 20, 8, (ctx) => {
    fillPixels(ctx, [
      [4, 2, 12, 2, hexColor(theme.signGlow)],
      [7, 3, 6, 1, hexColor(theme.neonPrimary)],
      [5, 1, 10, 1, "rgba(255,255,255,0.14)"],
    ]);
  });
}

function drawRoomShadow(scene: Phaser.Scene) {
  createTexture(scene, OFFICE_ASSET_KEYS.roomShadow, 24, 24, (ctx) => {
    ctx.fillStyle = "rgba(0,0,0,0.34)";
    ctx.fillRect(0, 0, 24, 24);
    ctx.clearRect(0, 0, 18, 18);
  });
}

function drawMonitor(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.monitor, 24, 18, (ctx) => {
    fillPixels(ctx, [
      [4, 2, 16, 10, "#0b1018"],
      [5, 3, 14, 8, hexColor(theme.screenGlow)],
      [6, 4, 12, 1, "rgba(255,255,255,0.24)"],
      [7, 7, 8, 1, hexColor(theme.neonSecondary)],
      [10, 12, 4, 2, "#293247"],
      [8, 14, 8, 2, "#1b2334"],
    ]);
    drawBorder(ctx, 24, 18, "#090d14");
  });
}

function drawDesk(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.desk, 44, 28, (ctx) => {
    fillPixels(ctx, [
      [4, 6, 36, 14, "#2a2436"],
      [5, 7, 34, 3, "#3d314d"],
      [7, 11, 30, 1, "rgba(255,255,255,0.05)"],
      [5, 18, 34, 1, hexColor(theme.neonSecondary)],
      [8, 19, 28, 1, hexColor(theme.neonPrimary)],
      [6, 20, 4, 6, "#221d2e"],
      [34, 20, 4, 6, "#221d2e"],
      [20, 20, 4, 5, "#1b1626"],
    ]);
    drawBorder(ctx, 44, 28, "#17131f");
  });
}

function drawChair(scene: Phaser.Scene) {
  createTexture(scene, OFFICE_ASSET_KEYS.chair, 16, 20, (ctx) => {
    fillPixels(ctx, [
      [3, 1, 10, 5, "#30354a"],
      [2, 6, 12, 7, "#1c2232"],
      [6, 13, 4, 5, "#262c3c"],
    ]);
    drawBorder(ctx, 16, 20, "#10131b");
  });
}

function drawServerRack(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.serverRack, 24, 48, (ctx) => {
    ctx.fillStyle = "#0a1017";
    ctx.fillRect(0, 0, 24, 48);
    ctx.fillStyle = "#141d29";
    ctx.fillRect(2, 2, 20, 44);
    for (let y = 6; y < 42; y += 8) {
      ctx.fillStyle = hexColor(theme.serverGlow);
      ctx.fillRect(5, y, 2, 2);
      ctx.fillStyle = hexColor(theme.neonTertiary);
      ctx.fillRect(9, y, 8, 1);
      ctx.fillStyle = hexColor(theme.neonPrimary);
      ctx.fillRect(18, y + 1, 2, 1);
      ctx.fillStyle = "#1c2636";
      ctx.fillRect(5, y + 3, 12, 2);
    }
    drawBorder(ctx, 24, 48, "#05070c");
  });
}

function drawPlant(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.plant, 20, 24, (ctx) => {
    fillPixels(ctx, [
      [5, 16, 10, 6, "#4b372a"],
      [8, 8, 4, 8, hexColor(theme.plant)],
      [5, 9, 4, 6, hexColor(theme.plant)],
      [11, 9, 4, 6, hexColor(theme.plant)],
      [6, 4, 3, 6, hexColor(theme.neonTertiary)],
      [11, 5, 3, 5, hexColor(theme.neonTertiary)],
    ]);
  });
}

function drawSofa(scene: Phaser.Scene) {
  createTexture(scene, OFFICE_ASSET_KEYS.sofa, 34, 26, (ctx) => {
    fillPixels(ctx, [
      [2, 8, 30, 12, "#4a2e59"],
      [3, 3, 28, 7, "#392147"],
      [5, 10, 8, 8, "#5e3a70"],
      [13, 10, 8, 8, "#5a356b"],
      [21, 10, 8, 8, "#633d76"],
      [0, 18, 4, 6, "#301d3b"],
      [30, 18, 4, 6, "#301d3b"],
    ]);
  });
}

function drawCoffeeBar(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.coffeeBar, 52, 28, (ctx) => {
    fillPixels(ctx, [
      [2, 12, 48, 12, "#342518"],
      [3, 10, 46, 3, "#513926"],
      [6, 4, 10, 8, "#121720"],
      [20, 4, 10, 8, "#121720"],
      [34, 4, 8, 12, "#151c27"],
      [8, 6, 6, 4, hexColor(theme.warmGlow)],
      [22, 6, 6, 4, hexColor(theme.neonPrimary)],
      [36, 6, 4, 7, "#3c2a1d"],
    ]);
  });
}

function drawWhiteboard(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.whiteboard, 48, 30, (ctx) => {
    fillPixels(ctx, [
      [1, 1, 46, 28, "#dfe9f4"],
      [5, 7, 10, 2, hexColor(theme.neonPrimary)],
      [18, 10, 18, 2, hexColor(theme.neonSecondary)],
      [10, 16, 28, 2, hexColor(theme.warmGlow)],
      [8, 22, 12, 2, hexColor(theme.neonTertiary)],
    ]);
    drawBorder(ctx, 48, 30, "#5d6674");
  });
}

function drawMeetingTable(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.meetingTable, 60, 28, (ctx) => {
    fillPixels(ctx, [
      [4, 5, 52, 18, "#402d4b"],
      [8, 9, 44, 3, "#553660"],
      [10, 18, 40, 2, hexColor(theme.neonPrimary)],
      [8, 23, 4, 4, "#24192b"],
      [48, 23, 4, 4, "#24192b"],
    ]);
  });
}

function drawNeonSign(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.neonSign, 64, 20, (ctx) => {
    fillPixels(ctx, [
      [0, 0, 64, 20, "#100d17"],
      [2, 2, 60, 16, "#1b1426"],
      [4, 8, 56, 4, hexColor(theme.signGlow)],
      [6, 9, 52, 2, hexColor(theme.neonPrimary)],
    ]);
    drawBorder(ctx, 64, 20, "#2b2035");
  });
}

function drawCable(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.cable, 24, 12, (ctx) => {
    fillPixels(ctx, [
      [0, 6, 24, 2, "#11151f"],
      [5, 4, 2, 6, hexColor(theme.neonSecondary)],
      [15, 4, 2, 6, hexColor(theme.neonPrimary)],
    ]);
  });
}

function drawWallPanel(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.wallPanel, 24, 24, (ctx) => {
    fillPixels(ctx, [
      [0, 0, 24, 24, "#1b2230"],
      [2, 2, 20, 20, "#20293a"],
      [4, 6, 16, 2, hexColor(theme.trim)],
      [6, 12, 12, 1, "#11161f"],
      [6, 15, 10, 1, hexColor(theme.neonSecondary)],
      [4, 18, 16, 1, "rgba(255,255,255,0.04)"],
      [3, 3, 2, 18, "rgba(0,0,0,0.12)"],
    ]);
  });
}

function drawConsole(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.console, 20, 32, (ctx) => {
    fillPixels(ctx, [
      [2, 1, 16, 30, "#161d29"],
      [4, 4, 12, 8, "#0b1119"],
      [5, 5, 10, 6, hexColor(theme.neonPrimary)],
      [4, 15, 12, 2, hexColor(theme.neonSecondary)],
      [4, 20, 12, 2, hexColor(theme.neonTertiary)],
      [6, 25, 8, 1, hexColor(theme.warmGlow)],
    ]);
  });
}

function drawCup(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.cup, 10, 12, (ctx) => {
    fillPixels(ctx, [
      [2, 4, 5, 5, "#ece8ef"],
      [7, 5, 1, 3, hexColor(theme.neonSecondary)],
      [2, 3, 5, 1, hexColor(theme.warmGlow)],
      [3, 9, 3, 1, "#6c5a71"],
    ]);
  });
}

function drawBooks(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.books, 16, 10, (ctx) => {
    fillPixels(ctx, [
      [1, 2, 4, 6, hexColor(theme.neonSecondary)],
      [5, 1, 4, 7, "#586786"],
      [9, 3, 5, 5, hexColor(theme.warmGlow)],
      [0, 8, 15, 1, "#141922"],
    ]);
  });
}

function drawTinyScreen(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.tinyScreen, 14, 12, (ctx) => {
    fillPixels(ctx, [
      [1, 1, 12, 8, "#0a0f16"],
      [2, 2, 10, 6, hexColor(theme.neonPrimary)],
      [3, 4, 6, 1, hexColor(theme.neonSecondary)],
      [5, 9, 4, 1, "#293247"],
    ]);
  });
}

function drawVent(scene: Phaser.Scene) {
  createTexture(scene, OFFICE_ASSET_KEYS.vent, 20, 10, (ctx) => {
    fillPixels(ctx, [
      [0, 0, 20, 10, "#222938"],
      [2, 2, 16, 1, "#566176"],
      [2, 4, 16, 1, "#10141c"],
      [2, 6, 16, 1, "#566176"],
    ]);
  });
}

function drawPipe(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.pipe, 24, 24, (ctx) => {
    fillPixels(ctx, [
      [10, 0, 4, 24, "#2c3241"],
      [0, 10, 24, 4, "#3a4355"],
      [10, 10, 4, 4, hexColor(theme.trim)],
      [11, 0, 1, 24, "rgba(255,255,255,0.08)"],
    ]);
  });
}

function drawFloorMark(scene: Phaser.Scene, theme: OfficeTheme) {
  createTexture(scene, OFFICE_ASSET_KEYS.floorMark, 24, 16, (ctx) => {
    fillPixels(ctx, [
      [1, 7, 22, 2, hexColor(theme.neonPrimary)],
      [1, 5, 4, 2, hexColor(theme.warmGlow)],
      [19, 9, 4, 2, hexColor(theme.neonSecondary)],
      [8, 6, 8, 4, "rgba(255,255,255,0.05)"],
    ]);
  });
}

function drawNoise(scene: Phaser.Scene) {
  createTexture(scene, OFFICE_ASSET_KEYS.noise, 64, 64, (ctx) => {
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 120; i += 1) {
      const x = (i * 13) % 64;
      const y = (i * 29) % 64;
      ctx.fillStyle = i % 3 === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";
      ctx.fillRect(x, y, 1, 1);
    }
  });
}

function drawAgentTexture(
  scene: Phaser.Scene,
  key: TextureKey,
  palette: AgentPalette,
  variant: CharacterAppearance["hairStyle"],
  pose: "idle" | "blink" | "walkA" | "walkB",
) {
  createTexture(scene, key, 28, 40, (ctx) => {
    const legOffsetLeft = pose === "walkA" ? -1 : pose === "walkB" ? 1 : 0;
    const legOffsetRight = pose === "walkA" ? 1 : pose === "walkB" ? -1 : 0;
    const armOffset = pose === "walkA" ? 1 : pose === "walkB" ? -1 : 0;
    const eyeHeight = pose === "blink" ? 1 : 2;
    const headTurnOffset = pose === "walkA" ? 1 : pose === "walkB" ? -1 : 0;
    const pixels: DrawPixel[] = [
      [8, 30, 5, 4, palette.shoes],
      [15, 30, 5, 4, palette.shoes],
      [9 + legOffsetLeft, 21, 4, 10, palette.pants],
      [15 + legOffsetRight, 21, 4, 10, palette.pants],
      [6, 12, 16, 11, palette.jacket],
      [9, 13, 10, 9, palette.shirt],
      [7, 12, 3, 11, palette.jacket],
      [18, 12, 3, 11, palette.jacket],
      [7, 2, 14, 12, palette.skin],
      [5 - armOffset, 8, 2, 5, palette.skin],
      [21 + armOffset, 8, 2, 5, palette.skin],
      [10 + headTurnOffset, 8, 2, eyeHeight, "#151515"],
      [16 + headTurnOffset, 8, 2, eyeHeight, "#151515"],
      [12, 11, 4, 1, "#b78366"],
    ];

    if (variant === "bald") {
      pixels.push([7, 12, 14, 1, palette.beard], [8, 14, 12, 3, palette.beard], [11, 0, 6, 1, "#f2c590"]);
    }

    if (variant === "long") {
      pixels.push([6, 1, 16, 5, palette.hair], [4, 4, 5, 12, palette.hair], [19, 4, 5, 12, palette.hair], [7, 13, 14, 2, palette.beard], [20, 15, 2, 4, palette.hair]);
    }

    if (variant === "parted") {
      pixels.push([6, 1, 15, 5, palette.hair], [4, 4, 5, 7, palette.hair], [18, 4, 6, 6, palette.hair], [16, 8, 4, 2, palette.hair], [7, 13, 13, 3, palette.beard], [19, 10, 3, 3, palette.hair]);
    }

    if (variant === "bun") {
      pixels.push([7, 1, 14, 5, palette.hair], [19, 2, 4, 6, palette.hair], [20, 0, 4, 4, palette.hair], [8, 13, 12, 3, palette.beard], [18, 12, 2, 2, palette.hair]);
    }

    fillPixels(ctx, pixels);
  });
}

const characterTextureKeys: Record<string, { idle: TextureKey; blink: TextureKey; walkA: TextureKey; walkB: TextureKey }> = {
  viktor: {
    idle: OFFICE_ASSET_KEYS.agentViktorIdle,
    blink: OFFICE_ASSET_KEYS.agentViktorBlink,
    walkA: OFFICE_ASSET_KEYS.agentViktorWalkA,
    walkB: OFFICE_ASSET_KEYS.agentViktorWalkB,
  },
  emil: {
    idle: OFFICE_ASSET_KEYS.agentEmilIdle,
    blink: OFFICE_ASSET_KEYS.agentEmilBlink,
    walkA: OFFICE_ASSET_KEYS.agentEmilWalkA,
    walkB: OFFICE_ASSET_KEYS.agentEmilWalkB,
  },
  robin: {
    idle: OFFICE_ASSET_KEYS.agentRobinIdle,
    blink: OFFICE_ASSET_KEYS.agentRobinBlink,
    walkA: OFFICE_ASSET_KEYS.agentRobinWalkA,
    walkB: OFFICE_ASSET_KEYS.agentRobinWalkB,
  },
  adam: {
    idle: OFFICE_ASSET_KEYS.agentAdamIdle,
    blink: OFFICE_ASSET_KEYS.agentAdamBlink,
    walkA: OFFICE_ASSET_KEYS.agentAdamWalkA,
    walkB: OFFICE_ASSET_KEYS.agentAdamWalkB,
  },
};

const paletteForCharacter = (appearance: CharacterAppearance): AgentPalette => ({
  skin: appearance.skinColor,
  shirt: appearance.shirtColor,
  jacket: appearance.jacketColor,
  pants: appearance.pantsColor,
  shoes: appearance.shoesColor,
  hair: appearance.hairColor,
  beard: appearance.hairColor,
});

export function generateOfficeAssets(scene: Phaser.Scene, theme: OfficeTheme, characters: CharacterConfig[]) {
  drawFloorTile(scene, theme);
  drawCorridorTile(scene, theme);
  drawWallTop(scene, theme);
  drawWallSide(scene, theme);
  drawNeonTrim(scene, theme);
  drawRoomShadow(scene);
  drawMonitor(scene, theme);
  drawDesk(scene, theme);
  drawChair(scene);
  drawServerRack(scene, theme);
  drawPlant(scene, theme);
  drawSofa(scene);
  drawCoffeeBar(scene, theme);
  drawWhiteboard(scene, theme);
  drawMeetingTable(scene, theme);
  drawNeonSign(scene, theme);
  drawCable(scene, theme);
  drawWallPanel(scene, theme);
  drawConsole(scene, theme);
  drawCup(scene, theme);
  drawBooks(scene, theme);
  drawTinyScreen(scene, theme);
  drawVent(scene);
  drawPipe(scene, theme);
  drawFloorMark(scene, theme);
  drawNoise(scene);
  characters.forEach((character) => {
    const keys = characterTextureKeys[character.id];
    if (!keys) {
      return;
    }
    const palette = paletteForCharacter(character.appearance);
    drawAgentTexture(scene, keys.idle, palette, character.appearance.hairStyle, "idle");
    drawAgentTexture(scene, keys.blink, palette, character.appearance.hairStyle, "blink");
    drawAgentTexture(scene, keys.walkA, palette, character.appearance.hairStyle, "walkA");
    drawAgentTexture(scene, keys.walkB, palette, character.appearance.hairStyle, "walkB");
  });
}

export function getAgentFrameKeys(agentId: string) {
  switch (agentId) {
    case "viktor":
      return {
        idle: OFFICE_ASSET_KEYS.agentViktorIdle,
        blink: OFFICE_ASSET_KEYS.agentViktorBlink,
        walkA: OFFICE_ASSET_KEYS.agentViktorWalkA,
        walkB: OFFICE_ASSET_KEYS.agentViktorWalkB,
      };
    case "emil":
      return {
        idle: OFFICE_ASSET_KEYS.agentEmilIdle,
        blink: OFFICE_ASSET_KEYS.agentEmilBlink,
        walkA: OFFICE_ASSET_KEYS.agentEmilWalkA,
        walkB: OFFICE_ASSET_KEYS.agentEmilWalkB,
      };
    case "robin":
      return {
        idle: OFFICE_ASSET_KEYS.agentRobinIdle,
        blink: OFFICE_ASSET_KEYS.agentRobinBlink,
        walkA: OFFICE_ASSET_KEYS.agentRobinWalkA,
        walkB: OFFICE_ASSET_KEYS.agentRobinWalkB,
      };
    case "adam":
      return {
        idle: OFFICE_ASSET_KEYS.agentAdamIdle,
        blink: OFFICE_ASSET_KEYS.agentAdamBlink,
        walkA: OFFICE_ASSET_KEYS.agentAdamWalkA,
        walkB: OFFICE_ASSET_KEYS.agentAdamWalkB,
      };
    default:
      return {
        idle: OFFICE_ASSET_KEYS.agentViktorIdle,
        blink: OFFICE_ASSET_KEYS.agentViktorBlink,
        walkA: OFFICE_ASSET_KEYS.agentViktorWalkA,
        walkB: OFFICE_ASSET_KEYS.agentViktorWalkB,
      };
  }
}
