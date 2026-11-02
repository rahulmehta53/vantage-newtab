/**
 * Vantage — Root App Component
 * Orchestrates the new tab page: background, topbar, console, drawers.
 */

import { createSignal, onCleanup, onMount } from 'solid-js';
import type { Plan } from './types';
import { loadFromStorage, savePlan, saveCompletion } from './storage';
import { VantageBackground } from './background';
import Topbar from './components/Topbar';
import Console from './components/Console';
import BgFooter from './components/BgFooter';
import ReloadDrawer from './components/ReloadDrawer';
import ReflectDrawer from './components/ReflectDrawer';
import SettingsDrawer from './components/SettingsDrawer';

export default function App() {
  const [plan, setPlan] = createSignal<Plan | null>(null);
  const [completion, setCompletion] = createSignal<Record<number, boolean[]>>({});
  const [reloadOpen, setReloadOpen] = createSignal(false);
  const [reflectOpen, setReflectOpen] = createSignal(false);
  const [settingsOpen, setSettingsOpen] = createSignal(false);

  // ── Key handler ────────────────────────────────────────────
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setReloadOpen(false);
      setReflectOpen(false);
      setSettingsOpen(false);
    }
  }

  // ── Completion helpers ──────────────────────────────────────
  function isTaskComplete(taskId: number): boolean {
    const subtasks = plan()?.tasks.find((t) => t.id === taskId)?.subtasks ?? [];
    const state = completion()[taskId] ?? [];
    if (subtasks.length === 0) return !!state[0];
    return subtasks.every((_, idx) => !!state[idx]);
  }

  function toggleParentTask(taskId: number, value: boolean) {
    const subtasks = plan()?.tasks.find((t) => t.id === taskId)?.subtasks ?? [];
    const newState = subtasks.length === 0 ? [value] : subtasks.map(() => value);
    const updated = { ...completion(), [taskId]: newState };
    setCompletion(updated);
    saveCompletion(updated);
  }

  function toggleSubtask(taskId: number, idx: number, value: boolean) {
    const prev = completion()[taskId] ?? [];
    const newState = [...prev];
    newState[idx] = value;
    const updated = { ...completion(), [taskId]: newState };
    setCompletion(updated);
    saveCompletion(updated);
  }

  // ── Plan apply ──────────────────────────────────────────────
  function applyPlan(data: Plan) {
    // Preserve completion state for tasks with matching ids
    const prev = completion();
    const newCompletion: Record<number, boolean[]> = {};
    data.tasks.forEach((task) => {
      if (prev[task.id]) newCompletion[task.id] = prev[task.id];
    });
    setPlan(data);
    setCompletion(newCompletion);
    savePlan(data);
    saveCompletion(newCompletion);
  }

  // ── Init ────────────────────────────────────────────────────
  onMount(async () => {
    document.addEventListener('keydown', onKeyDown);
    const { plan: p, completion: c } = await loadFromStorage();
    if (p) setPlan(p);
    if (c) setCompletion(c);
    VantageBackground.init();
  });

  onCleanup(() => {
    document.removeEventListener('keydown', onKeyDown);
  });

  return (
    <>
      {/* Ambient background layers */}
      <div class="bg-layer" id="bgLayerA" />
      <div class="bg-layer" id="bgLayerB" />
      <div class="bg-scrim" />

      <Topbar
        plan={plan()}
        completion={completion()}
        onReload={() => setReloadOpen(true)}
        onReflect={() => setReflectOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      />

      <Console
        plan={plan()}
        completion={completion()}
        isTaskComplete={isTaskComplete}
        onToggleParent={toggleParentTask}
        onToggleSubtask={toggleSubtask}
        onOpenReload={() => setReloadOpen(true)}
      />

      <BgFooter />

      <ReloadDrawer
        open={reloadOpen()}
        currentPlan={plan()}
        onClose={() => setReloadOpen(false)}
        onApply={applyPlan}
      />

      <ReflectDrawer
        open={reflectOpen()}
        plan={plan()}
        completion={completion()}
        isTaskComplete={isTaskComplete}
        onClose={() => setReflectOpen(false)}
      />

      <SettingsDrawer
        open={settingsOpen()}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
