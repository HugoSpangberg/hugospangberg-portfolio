import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { initialAgents } from '../data/agents';
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from '../data/officeRooms';
import officeDesign from '../features/officeDesign/officeDesign';
import { getMockGitHubOfficeState } from '../features/githubOfficeState/mockGitHubOfficeState';
import { resolveAgentOfficeState } from '../features/githubOfficeState/resolveAgentOfficeState';
import { resolveOfficeTheme } from '../theme/officeThemes';
import type { Agent } from '../types';

type SceneStatus = 'idle' | 'loading' | 'ready' | 'fallback';

type HsabShowcaseCanvasProps = {
  active: boolean;
  sceneLabel: string;
  loadingLabel: string;
  fallbackLabel: string;
};

const GAME_WIDTH = MAP_WIDTH * TILE_SIZE;
const GAME_HEIGHT = MAP_HEIGHT * TILE_SIZE;

const buildShowcaseAgents = (): Agent[] => {
  const mockState = getMockGitHubOfficeState('davidAndLuddeAssigned');
  const resolvedOfficeState = resolveAgentOfficeState({
    now: new Date('2026-07-05T10:30:00'),
    githubState: mockState,
    design: officeDesign,
    editorMode: false,
  });

  return initialAgents.map((agent) => {
    const officeState = resolvedOfficeState[agent.id];
    const activeIssue = officeState?.activeItem ? `Mock task #${officeState.activeItem.number}` : 'Showcase mode';

    return {
      ...agent,
      status: officeState?.statusTag === 'working' ? 'working' : 'idle',
      currentTask: activeIssue,
      lastActivity: officeState?.labelText ?? agent.lastActivity,
      officeState,
    } satisfies Agent;
  });
};

function HsabShowcaseCanvas({
  active,
  sceneLabel,
  loadingLabel,
  fallbackLabel,
}: HsabShowcaseCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<import('phaser').Game | null>(null);
  const sceneRef = useRef<unknown>(null);
  const visibleRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const agentsRef = useRef<Agent[]>(buildShowcaseAgents());
  const [status, setStatus] = useState<SceneStatus>('idle');
  const theme = resolveOfficeTheme('Wednesday');

  useEffect(() => {
    reducedMotionRef.current =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount || !('IntersectionObserver' in window)) {
      visibleRef.current = true;
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = Boolean(entry?.isIntersecting);
        const scene = sceneRef.current as { setEditorPaused?: (paused: boolean) => void } | null;
        scene?.setEditorPaused?.(!visibleRef.current || reducedMotionRef.current);
      },
      { threshold: 0.08 },
    );

    observer.observe(mount);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;

    if (!active || !mount || gameRef.current) {
      return undefined;
    }

    visibleRef.current = true;

    if (import.meta.env.MODE === 'test') {
      setStatus('fallback');
      return undefined;
    }

    let cancelled = false;
    setStatus('loading');

    void Promise.all([import('phaser'), import('../features/officeScene/OfficeScene')])
      .then(([PhaserModule, sceneModule]) => {
        if (cancelled || !mountRef.current) {
          return;
        }

        const Phaser = PhaserModule.default ?? PhaserModule;
        const OfficeScene = sceneModule.default;
        const scene = new OfficeScene();
        sceneRef.current = scene;

        const game = new Phaser.Game({
          type: Phaser.CANVAS,
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          parent: mountRef.current,
          backgroundColor: theme.shellBackground,
          pixelArt: true,
          antialias: false,
          roundPixels: true,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          scene,
        });

        gameRef.current = game;
        game.scene.start('office-scene', {
          getAgents: () => agentsRef.current,
          theme,
          design: officeDesign,
          editorEnabled: reducedMotionRef.current || !visibleRef.current,
        });
        setStatus('ready');
      })
      .catch((error) => {
        console.warn('HSAB showcase scene unavailable; using static fallback.', error);
        setStatus('fallback');
      });

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [active, theme]);

  return (
    <div
      className="hsab-showcase-canvas"
      data-scene-status={status}
      data-testid="hsab-showcase-canvas"
      style={
        {
          '--page-glow': theme.pageGlow,
          '--room-label-bg': theme.labelBg,
          '--room-label-border': theme.labelBorder,
          '--room-label-glow': theme.labelGlow,
          '--agent-label-bg': theme.agentLabelBg,
          '--agent-label-border': theme.agentLabelBorder,
        } as CSSProperties
      }
    >
      <div
        ref={mountRef}
        className="hsab-showcase-canvas__mount"
        aria-label={sceneLabel}
        role="img"
      />
      {status !== 'ready' && (
        <div className="hsab-showcase-canvas__fallback" role="img" aria-label={fallbackLabel}>
          <span>{status === 'loading' ? loadingLabel : fallbackLabel}</span>
        </div>
      )}
    </div>
  );
}

export default HsabShowcaseCanvas;
