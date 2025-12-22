'use client';

import { Droplets, Layers, Square } from 'lucide-react';
import { useBoundaryMode } from './BoundaryProvider';
import type { BoundaryMode } from './BoundaryProvider';

const modes: { icon: React.ReactNode; label: string; mode: BoundaryMode }[] = [
  { icon: '', label: 'Off', mode: 'off' },
  {
    icon: <Droplets className="size-4" />,
    label: 'Hydration',
    mode: 'hydration',
  },
  {
    icon: <Layers className="size-4" />,
    label: 'Rendering',
    mode: 'rendering',
  },
];

export default function BoundaryToggle() {
  const { mode, setMode } = useBoundaryMode();

  return (
    <div className="fixed right-4 bottom-[50%] z-50">
      <div
        className="flex flex-col gap-1 rounded-md bg-white/90 p-1 shadow-lg backdrop-blur dark:bg-gray-900/90"
        role="radiogroup"
        aria-label="Boundary mode"
      >
        {modes.map(({ icon, label, mode: modeOption }) => {
          const isActive = mode === modeOption;

          return (
            <button
              key={modeOption}
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium tracking-wide uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-gray-900 ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-transparent text-black hover:bg-gray-200 dark:text-white dark:hover:bg-gray-800'
              }`}
              onClick={() => {
                setMode(modeOption);
              }}
              title={`Switch to ${label} boundaries`}
              type="button"
              role="radio"
              aria-checked={isActive}
            >
              <span
                aria-hidden
                className={`flex size-4 items-center justify-center rounded-full border ${
                  isActive
                    ? 'border-current'
                    : 'border-black/40 dark:border-white/40'
                }`}
              >
                {isActive ? (
                  <span className="size-2 rounded-full bg-current" />
                ) : null}
              </span>
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
