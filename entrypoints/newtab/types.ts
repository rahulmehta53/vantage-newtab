export interface TaskLink {
  label: string;
  url: string;
}

export interface Task {
  id: number;
  title: string;
  time?: string;
  subtasks?: string[];
  links?: TaskLink[];
  tip?: string;
}

export interface Plan {
  date: string;
  focus: string;
  tasks: Task[];
}

export interface BgImage {
  url: string;
  id: string;
  author: string;
  seed: string;
}

export interface BgState {
  history: BgImage[];
  pointer: number;
  paused: boolean;
}

export interface BgSettings {
  rotation: string; // "manual" | "15" | "60" | "1440"
  style: string;    // "color" | "grayscale" | "blur"
  overlay: number;   // 0-80
  source: 'picsum' | 'unsplash';
  unsplashWorkerUrl: string;
  unsplashMode: 'official' | 'search';
  unsplashQuery: string;
  unsplashAuthType: 'worker' | 'api';
  unsplashAccessKey: string;
}
