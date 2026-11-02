import { For, Show } from 'solid-js';
import { IconTerminal2, IconExternalLink, IconBulb } from '@tabler/icons-solidjs';
import type { Plan } from '../types';

interface ConsoleProps {
  plan: Plan | null;
  completion: Record<number, boolean[]>;
  isTaskComplete: (taskId: number) => boolean;
  onToggleParent: (taskId: number, value: boolean) => void;
  onToggleSubtask: (taskId: number, idx: number, value: boolean) => void;
  onOpenReload: () => void;
}

export default function Console(props: ConsoleProps) {
  return (
    <main class="console">
      <Show
        when={props.plan && props.plan.tasks && props.plan.tasks.length > 0}
        fallback={
          <div class="empty-state">
            <IconTerminal2 class="empty-state-icon" size="48" stroke={1.2} />
            <h2>No plan loaded yet</h2>
            <p>Paste today's structured JSON from Antigravity to render your interactive dashboard.</p>
            <button class="primary-btn" onClick={props.onOpenReload}>
              Paste today's JSON
            </button>
          </div>
        }
      >
        <For each={props.plan!.tasks}>
          {(task) => {
            const completed = () => props.isTaskComplete(task.id);

            return (
              <div class={`task-card ${completed() ? 'completed' : ''}`}>
                <div class="task-body-layout">
                  <input
                    type="checkbox"
                    class="task-checkbox"
                    checked={completed()}
                    onChange={(e) => props.onToggleParent(task.id, e.currentTarget.checked)}
                  />
                  
                  <div class="task-main-content">
                    <div class="task-title-row">
                      <div class="task-title">{task.title}</div>
                    </div>

                    {/* Time Pill */}
                    <Show when={task.time}>
                      <div class="task-time-row">
                        <span class="task-time">{task.time}</span>
                      </div>
                    </Show>

                    {/* Subtask Pills */}
                    <Show when={task.subtasks && task.subtasks.length > 0}>
                      <div class="subtask-list">
                        <For each={task.subtasks}>
                          {(subtask, idx) => {
                            const isDone = () => !!(props.completion[task.id] && props.completion[task.id][idx()]);
                            return (
                              <span
                                class={`subtask-pill ${isDone() ? 'done' : ''}`}
                                onClick={() => props.onToggleSubtask(task.id, idx(), !isDone())}
                              >
                                <span class="pill-label">{subtask}</span>
                              </span>
                            );
                          }}
                        </For>
                      </div>
                    </Show>

                    {/* Link Pills */}
                    <Show when={task.links && task.links.length > 0}>
                      <div class="task-links">
                        <For each={task.links}>
                          {(link) => (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="task-link"
                            >
                              <span>{link.label}</span>
                              <IconExternalLink size="12" stroke={1.5} />
                            </a>
                          )}
                        </For>
                      </div>
                    </Show>

                    {/* Micro Tip */}
                    <Show when={task.tip}>
                      <div class="task-tip">
                        <IconBulb size="15" stroke={1.5} style={{ "margin-top": "2px", "flex-shrink": 0 }} />
                        <span>{task.tip}</span>
                      </div>
                    </Show>
                  </div>
                </div>
              </div>
            );
          }}
        </For>
      </Show>
    </main>
  );
}
