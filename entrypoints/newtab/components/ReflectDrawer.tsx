import { createSignal, createEffect } from 'solid-js';
import { IconNotebook, IconAlertCircle, IconCheck, IconCopy } from '@tabler/icons-solidjs';
import type { Plan } from '../types';

interface ReflectDrawerProps {
  open: boolean;
  plan: Plan | null;
  completion: Record<number, boolean[]>;
  isTaskComplete: (taskId: number) => boolean;
  onClose: () => void;
}

export default function ReflectDrawer(props: ReflectDrawerProps) {
  const [wins, setWins] = createSignal('');
  const [losses, setLosses] = createSignal('');
  const [notes, setNotes] = createSignal('');
  const [statusText, setStatusText] = createSignal('');
  const [statusType, setStatusType] = createSignal<'success' | 'error' | ''>('');

  createEffect(() => {
    if (props.open) {
      setWins('');
      setLosses('');
      setNotes('');
      setStatusText('');
      setStatusType('');
    }
  });

  function buildMarkdown(): string {
    const date = props.plan?.date || new Date().toISOString().slice(0, 10);
    const focus = props.plan?.focus || '—';

    const lines: string[] = [];
    lines.push(`## ${date} — Reflection`);
    lines.push('');
    lines.push(`**Focus:** ${focus}`);
    lines.push('');
    lines.push('### Tasks');

    (props.plan?.tasks || []).forEach((task) => {
      const isComplete = props.isTaskComplete(task.id);
      const subtasks = task.subtasks || [];
      const state = props.completion[task.id] || [];
      const doneCount = subtasks.filter((_, idx) => state[idx]).length;
      
      const marker = isComplete ? 'x' : ' ';
      const suffix = subtasks.length > 0 ? ` (${doneCount}/${subtasks.length})` : '';
      lines.push(`- [${marker}] ${task.title}${suffix}`);
    });

    lines.push('');
    lines.push('### Wins');
    lines.push(wins().trim() ? wins().trim() : '_None recorded_');
    lines.push('');
    lines.push('### Losses / friction');
    lines.push(losses().trim() ? losses().trim() : '_None recorded_');
    lines.push('');
    lines.push('### Notes for tomorrow');
    lines.push(notes().trim() ? notes().trim() : '_None recorded_');

    return lines.join('\n');
  }

  async function handleCopy() {
    const markdownText = buildMarkdown();
    try {
      await navigator.clipboard.writeText(markdownText);
      setStatusText('Markdown copied — paste into your daily note.');
      setStatusType('success');
    } catch (err) {
      setStatusText('Could not copy automatically — select and copy manually.');
      setStatusType('error');
    }
  }

  return (
    <div
      class={`drawer-overlay ${props.open ? 'open' : ''}`}
      onClick={(e) => e.target === e.currentTarget && props.onClose()}
    >
      <div class="drawer">
        <div class="drawer-header">
          <IconNotebook class="drawer-header-icon" size="22" stroke={1.8} />
          <h3>Evening reflection</h3>
        </div>
        <p class="drawer-sub">
          Capture your wins, losses, and notes. Vantage formats this as clean markdown for your daily notes.
        </p>

        <label class="field-label">Wins</label>
        <textarea
          value={wins()}
          onInput={(e) => setWins(e.currentTarget.value)}
          placeholder="What went well today?"
          rows="3"
        />

        <label class="field-label">Losses / friction</label>
        <textarea
          value={losses()}
          onInput={(e) => setLosses(e.currentTarget.value)}
          placeholder="What didn't go to plan?"
          rows="3"
        />

        <label class="field-label">Notes for tomorrow</label>
        <textarea
          value={notes()}
          onInput={(e) => setNotes(e.currentTarget.value)}
          placeholder="Anything to carry forward?"
          rows="3"
        />

        <div class={`drawer-status ${statusType()}`}>
          {statusType() === 'error' && <IconAlertCircle size="15" />}
          {statusType() === 'success' && <IconCheck size="15" />}
          <span>{statusText()}</span>
        </div>

        <div class="drawer-actions">
          <button class="ghost-btn" onClick={props.onClose}>
            Close
          </button>
          <button class="primary-btn" onClick={handleCopy}>
            <IconCopy size="16" stroke={1.8} />
            Copy markdown log
          </button>
        </div>
      </div>
    </div>
  );
}
