import { createSignal, onCleanup, onMount, For } from 'solid-js';
import { IconTerminal2, IconPencil, IconSettings } from '@tabler/icons-solidjs';
import type { Plan } from '../types';

interface TopbarProps {
  plan: Plan | null;
  completion: Record<number, boolean[]>;
  onReload: () => void;
  onReflect: () => void;
  onSettings: () => void;
}

export default function Topbar(props: TopbarProps) {
  const [time, setTime] = createSignal('');
  const [dateStr, setDateStr] = createSignal('');

  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setTime(`${hh}:${mm}`);

    setDateStr(
      now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    );
  }

  onMount(() => {
    updateClock();
    const interval = setInterval(updateClock, 15 * 1000);
    onCleanup(() => clearInterval(interval));
  });

  // Calculate dots progress
  const progressDots = () => {
    const activePlan = props.plan;
    if (!activePlan) return [];
    
    let total = 0;
    let done = 0;

    activePlan.tasks.forEach((task) => {
      const subtasks = task.subtasks || [];
      const state = props.completion[task.id] || [];
      
      if (subtasks.length === 0) {
        total++;
        if (state[0]) done++;
      } else {
        subtasks.forEach((_, idx) => {
          total++;
          if (state[idx]) done++;
        });
      }
    });

    if (total === 0) return [];
    const maxDots = 12;
    const dotsToShow = Math.min(total, maxDots);
    const filledDots = Math.round((done / total) * dotsToShow);

    return Array.from({ length: dotsToShow }, (_, i) => i < filledDots);
  };

  return (
    <header class="topbar">
      <div class="clock-block">
        <div class="clock">{time()}</div>
        <div class="date-label">{dateStr()}</div>
      </div>

      <div class="focus-rail">
        <span class="focus-eyebrow">Today's focus</span>
        <span class="focus-text" title={props.plan?.focus || 'No focus set'}>
          {props.plan?.focus || 'No focus set'}
        </span>
        <div class="focus-progress" title="Overall subtask progress">
          <For each={progressDots()}>
            {(isFilled) => (
              <span class={`progress-dot ${isFilled ? 'filled' : ''}`} />
            )}
          </For>
        </div>
      </div>

      <div class="topbar-actions">
        <button class="icon-btn" onClick={props.onReload} title="Paste today's JSON">
          <IconTerminal2 size="20" stroke={1.5} />
        </button>
        <button class="icon-btn" onClick={props.onReflect} title="Evening reflection">
          <IconPencil size="20" stroke={1.5} />
        </button>
        <button class="icon-btn" onClick={props.onSettings} title="Background settings">
          <IconSettings size="20" stroke={1.5} />
        </button>
      </div>
    </header>
  );
}
