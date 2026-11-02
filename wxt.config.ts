import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-solid'],
  manifest: {
    name: 'Vantage',
    description: 'A premium glassmorphism New Tab dashboard for your daily plan, tasks, and reflections.',
    permissions: ['storage'],
  }
});
