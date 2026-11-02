import type { Plan } from './types';

const PLAN_STORAGE_KEY = 'vantage_plan';
const COMPLETION_STORAGE_KEY = 'vantage_completion';

export function loadFromStorage(): Promise<{ plan: Plan | null; completion: Record<number, boolean[]> }> {
  return new Promise((resolve) => {
    chrome.storage.local.get([PLAN_STORAGE_KEY, COMPLETION_STORAGE_KEY], (res) => {
      resolve({
        plan: res[PLAN_STORAGE_KEY] || null,
        completion: res[COMPLETION_STORAGE_KEY] || {},
      });
    });
  });
}

export function savePlan(plan: Plan | null) {
  chrome.storage.local.set({ [PLAN_STORAGE_KEY]: plan });
}

export function saveCompletion(completion: Record<number, boolean[]>) {
  chrome.storage.local.set({ [COMPLETION_STORAGE_KEY]: completion });
}
