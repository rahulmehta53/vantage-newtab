import { createSignal, onMount } from 'solid-js';
import { IconChevronLeft, IconChevronRight, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-solidjs';
import { VantageBackground } from '../background';

export default function BgFooter() {
  const [isPaused, setIsPaused] = createSignal(false);

  onMount(() => {
    // Sync initial state after a short delay to ensure background is loaded
    setTimeout(() => {
      setIsPaused(VantageBackground.isPaused());
    }, 200);
  });

  function handlePrev() {
    VantageBackground.prev();
  }

  function handleNext() {
    VantageBackground.next();
  }

  function handlePlayPause() {
    const paused = VantageBackground.togglePause();
    setIsPaused(paused);
  }

  return (
    <footer class="bg-footer">
      <div class="bg-credit" id="bgCredit" />
      <div class="bg-nav">
        <button class="nav-btn" onClick={handlePrev} title="Previous photo">
          <IconChevronLeft size="18" stroke={1.8} />
        </button>
        <button class="nav-btn" onClick={handlePlayPause} title={isPaused() ? 'Resume rotation' : 'Pause rotation'}>
          {isPaused() ? <IconPlayerPlay size="18" stroke={1.8} /> : <IconPlayerPause size="18" stroke={1.8} />}
        </button>
        <button class="nav-btn" onClick={handleNext} title="Next photo">
          <IconChevronRight size="18" stroke={1.8} />
        </button>
      </div>
    </footer>
  );
}
