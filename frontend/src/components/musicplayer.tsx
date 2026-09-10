import {
  ShuffleIcon,
  MusicNotesPlusIcon,
  PlayIcon,
  RepeatIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SpeakerHighIcon,
  QueueIcon,
  InfoIcon,
  ClockCountdownIcon,
  CornersOutIcon,
} from "@phosphor-icons/react";

export function MusicPlayer() {
  return (
    <div
      id="music-player"
      className="grid h-24 grid-cols-[280px_1fr_320px] items-center bg-neutral-900 px-4 text-white"
    >
      <div id="song-info" className="flex min-w-0 items-center gap-4 pl-2">
        <div className="h-16 w-16 shrink-0 bg-neutral-800" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Song Title</p>
          <p className="truncate text-xs text-white/60">Artist</p>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 cursor-pointer items-center justify-center text-white/70 hover:text-white"
          aria-label="Add to favorite"
        >
          <MusicNotesPlusIcon size={20} />
        </button>
      </div>

      <div className="flex min-w-0 flex-col items-center gap-2">
        <div id="playback-control" className="flex items-center gap-4">
          <button className="hidden h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white md:flex">
            <ShuffleIcon size={18} aria-label="Shuffle" />
          </button>

          <button className="flex h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white">
            <SkipBackIcon size={18} weight="fill" aria-label="Previous" />
          </button>

          <button className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-neutral-700 hover:bg-neutral-500">
            <PlayIcon size={22} weight="fill" aria-label="Play" />
          </button>

          <button className="flex h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white">
            <SkipForwardIcon size={18} weight="fill" aria-label="Next" />
          </button>

          <button className="hidden h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white md:flex">
            <RepeatIcon size={18} aria-label="Repeat" />
          </button>
        </div>

        <div id="progress-control" className="hidden w-full max-w-xl items-center gap-3 lg:flex">
          <span className="w-10 text-right text-xs text-white/40">0:00</span>

          <input
            type="range"
            min="0"
            max="100"
            defaultValue="0"
            className="min-w-0 flex-1 cursor-pointer accent-neutral-200"
          />
          <span className="w-10 text-xs text-white/40">6:70</span>
        </div>
      </div>

      <div id="button-controls" className="hidden items-center justify-end gap-1 lg:flex">
        <button
          type="button"
          className="flex h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white"
          aria-label="Sleep timer"
        >
          <ClockCountdownIcon size={20} />
        </button>

        <button
          type="button"
          className="flex h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white"
          aria-label="Song info"
        >
          <InfoIcon size={20} />
        </button>

        <button
          type="button"
          className="flex h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white"
          aria-label="Queue"
        >
          <QueueIcon size={20} />
        </button>

        <div id="volume-control" className="flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white lg:flex"
            aria-label="Volume"
          >
            <SpeakerHighIcon size={20} />
          </button>

          <input
            type="range"
            min="0"
            max="100"
            defaultValue="70"
            className="w-24 cursor-pointer accent-neutral-200"
          />
        </div>

        <button
          type="button"
          className="flex h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white"
          aria-label="Fullscreen"
        >
          <CornersOutIcon size={20} />
        </button>
      </div>
    </div>
  );
}
