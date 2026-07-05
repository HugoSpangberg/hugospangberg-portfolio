import type Phaser from "phaser";

export type WeekdayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface OfficeTheme {
  day: WeekdayName;
  name: string;
  pageGlow: string;
  shellBackground: string;
  floorBase: number;
  floorAlt: number;
  floorGrid: number;
  corridor: number;
  wallPanel: number;
  wallShadow: number;
  roomFill: number;
  roomAccent: number;
  trim: number;
  glass: number;
  neonPrimary: number;
  neonSecondary: number;
  neonTertiary: number;
  signGlow: number;
  screenGlow: number;
  warmGlow: number;
  entranceGlow: number;
  serverGlow: number;
  plant: number;
  labelBg: string;
  labelBorder: string;
  labelGlow: string;
  agentLabelBg: string;
  agentLabelBorder: string;
}

export const officeThemes: Record<WeekdayName, OfficeTheme> = {
  Monday: {
    day: "Monday",
    name: "Cyber Blue",
    pageGlow: "#4acfff",
    shellBackground: "#09111e",
    floorBase: 0x0b1320,
    floorAlt: 0x101a2a,
    floorGrid: 0x15233a,
    corridor: 0x0e1728,
    wallPanel: 0x293247,
    wallShadow: 0x05080f,
    roomFill: 0x161f31,
    roomAccent: 0x1e2940,
    trim: 0x6fd1ff,
    glass: 0x19344f,
    neonPrimary: 0x4ad9ff,
    neonSecondary: 0x7a8dff,
    neonTertiary: 0x44f6bf,
    signGlow: 0x6bddff,
    screenGlow: 0x7be6ff,
    warmGlow: 0xffba62,
    entranceGlow: 0x52cfff,
    serverGlow: 0x83d3ff,
    plant: 0x3ac08f,
    labelBg: "rgba(8, 18, 32, 0.8)",
    labelBorder: "rgba(86, 213, 255, 0.42)",
    labelGlow: "rgba(74, 217, 255, 0.34)",
    agentLabelBg: "rgba(7, 15, 28, 0.88)",
    agentLabelBorder: "rgba(97, 213, 255, 0.34)",
  },
  Tuesday: {
    day: "Tuesday",
    name: "Neon Purple",
    pageGlow: "#bd6cff",
    shellBackground: "#11091f",
    floorBase: 0x120d1f,
    floorAlt: 0x1a1330,
    floorGrid: 0x25173c,
    corridor: 0x1a1330,
    wallPanel: 0x392354,
    wallShadow: 0x08040f,
    roomFill: 0x1f1532,
    roomAccent: 0x2c1d47,
    trim: 0xc97cff,
    glass: 0x221d3f,
    neonPrimary: 0xcd75ff,
    neonSecondary: 0x69cfff,
    neonTertiary: 0x4af2a4,
    signGlow: 0xdf8bff,
    screenGlow: 0x9f8dff,
    warmGlow: 0xffb76a,
    entranceGlow: 0xe176ff,
    serverGlow: 0x83a8ff,
    plant: 0x38b884,
    labelBg: "rgba(20, 11, 36, 0.82)",
    labelBorder: "rgba(205, 117, 255, 0.42)",
    labelGlow: "rgba(205, 117, 255, 0.36)",
    agentLabelBg: "rgba(18, 10, 32, 0.88)",
    agentLabelBorder: "rgba(180, 109, 255, 0.34)",
  },
  Wednesday: {
    day: "Wednesday",
    name: "Teal Matrix",
    pageGlow: "#34f0d5",
    shellBackground: "#071718",
    floorBase: 0x091718,
    floorAlt: 0x0d2022,
    floorGrid: 0x143033,
    corridor: 0x0a1f21,
    wallPanel: 0x214244,
    wallShadow: 0x040b0c,
    roomFill: 0x102728,
    roomAccent: 0x173639,
    trim: 0x43f0d1,
    glass: 0x12353a,
    neonPrimary: 0x31f1cf,
    neonSecondary: 0x7bffbd,
    neonTertiary: 0x5ad3ff,
    signGlow: 0x6efbe6,
    screenGlow: 0x5affdf,
    warmGlow: 0xffcb6a,
    entranceGlow: 0x47ffd4,
    serverGlow: 0x7efff6,
    plant: 0x63c978,
    labelBg: "rgba(7, 26, 27, 0.82)",
    labelBorder: "rgba(49, 241, 207, 0.42)",
    labelGlow: "rgba(49, 241, 207, 0.32)",
    agentLabelBg: "rgba(7, 21, 22, 0.88)",
    agentLabelBorder: "rgba(94, 244, 212, 0.32)",
  },
  Thursday: {
    day: "Thursday",
    name: "Hot Pink",
    pageGlow: "#ff5db3",
    shellBackground: "#170914",
    floorBase: 0x180a17,
    floorAlt: 0x240f22,
    floorGrid: 0x361732,
    corridor: 0x240f22,
    wallPanel: 0x4c2450,
    wallShadow: 0x0a0508,
    roomFill: 0x28112e,
    roomAccent: 0x3d1a3f,
    trim: 0xff6cc7,
    glass: 0x33192f,
    neonPrimary: 0xff62b9,
    neonSecondary: 0xff8e70,
    neonTertiary: 0x71d8ff,
    signGlow: 0xff88d5,
    screenGlow: 0xff80db,
    warmGlow: 0xffba62,
    entranceGlow: 0xff6cce,
    serverGlow: 0xff99d0,
    plant: 0x58c37c,
    labelBg: "rgba(35, 10, 29, 0.82)",
    labelBorder: "rgba(255, 98, 185, 0.42)",
    labelGlow: "rgba(255, 98, 185, 0.38)",
    agentLabelBg: "rgba(29, 9, 28, 0.88)",
    agentLabelBorder: "rgba(255, 113, 186, 0.34)",
  },
  Friday: {
    day: "Friday",
    name: "Amber Hacker",
    pageGlow: "#ffb347",
    shellBackground: "#181006",
    floorBase: 0x181108,
    floorAlt: 0x24180d,
    floorGrid: 0x392612,
    corridor: 0x22170c,
    wallPanel: 0x4d3519,
    wallShadow: 0x0d0904,
    roomFill: 0x2a1c10,
    roomAccent: 0x3f2a15,
    trim: 0xffc15b,
    glass: 0x352918,
    neonPrimary: 0xffba45,
    neonSecondary: 0x88ff7a,
    neonTertiary: 0x64dfff,
    signGlow: 0xffd18a,
    screenGlow: 0xffd278,
    warmGlow: 0xffaf4e,
    entranceGlow: 0xffaa44,
    serverGlow: 0xb9ff7e,
    plant: 0x6ac36d,
    labelBg: "rgba(40, 24, 8, 0.84)",
    labelBorder: "rgba(255, 186, 69, 0.42)",
    labelGlow: "rgba(255, 179, 71, 0.34)",
    agentLabelBg: "rgba(30, 18, 8, 0.88)",
    agentLabelBorder: "rgba(255, 183, 77, 0.34)",
  },
  Saturday: {
    day: "Saturday",
    name: "Vaporwave",
    pageGlow: "#7ef8ff",
    shellBackground: "#120d24",
    floorBase: 0x140f26,
    floorAlt: 0x1b1536,
    floorGrid: 0x271f45,
    corridor: 0x1c1536,
    wallPanel: 0x3c2c61,
    wallShadow: 0x060510,
    roomFill: 0x21193d,
    roomAccent: 0x30245a,
    trim: 0xff93fa,
    glass: 0x241c44,
    neonPrimary: 0xff93f9,
    neonSecondary: 0x6cf8ff,
    neonTertiary: 0x6effb4,
    signGlow: 0xbcfbff,
    screenGlow: 0xa7f4ff,
    warmGlow: 0xffbe73,
    entranceGlow: 0xff9bf3,
    serverGlow: 0x88dcff,
    plant: 0x6bd39e,
    labelBg: "rgba(22, 15, 47, 0.84)",
    labelBorder: "rgba(124, 248, 255, 0.42)",
    labelGlow: "rgba(255, 147, 249, 0.34)",
    agentLabelBg: "rgba(20, 13, 40, 0.88)",
    agentLabelBorder: "rgba(123, 248, 255, 0.32)",
  },
  Sunday: {
    day: "Sunday",
    name: "Neo Tokyo",
    pageGlow: "#ff6948",
    shellBackground: "#160f16",
    floorBase: 0x141017,
    floorAlt: 0x1d1620,
    floorGrid: 0x2c212d,
    corridor: 0x1d1520,
    wallPanel: 0x42273b,
    wallShadow: 0x09060a,
    roomFill: 0x221827,
    roomAccent: 0x332432,
    trim: 0xff7759,
    glass: 0x2b2132,
    neonPrimary: 0xff6d51,
    neonSecondary: 0x57dfff,
    neonTertiary: 0x8cff8d,
    signGlow: 0xff8a70,
    screenGlow: 0x91ecff,
    warmGlow: 0xffbb69,
    entranceGlow: 0xff7a5a,
    serverGlow: 0x69d4ff,
    plant: 0x62bc83,
    labelBg: "rgba(31, 17, 24, 0.84)",
    labelBorder: "rgba(255, 109, 81, 0.42)",
    labelGlow: "rgba(87, 223, 255, 0.3)",
    agentLabelBg: "rgba(25, 14, 18, 0.88)",
    agentLabelBorder: "rgba(255, 109, 81, 0.32)",
  },
};

export function getWeekdayName(currentDate = new Date()): WeekdayName {
  return currentDate.toLocaleDateString("en-US", { weekday: "long" }) as WeekdayName;
}

export function resolveOfficeTheme(weekdayOverride?: string | null): OfficeTheme {
  const weekday = weekdayOverride && weekdayOverride in officeThemes
    ? (weekdayOverride as WeekdayName)
    : getWeekdayName();

  return officeThemes[weekday];
}

export function applyDailyTheme(scene: Phaser.Scene, theme: OfficeTheme) {
  scene.cameras.main.setBackgroundColor(theme.floorBase);
}
