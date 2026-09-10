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
    <div id="music-player" className="player-bar">
      <div id="song-info" className="flex min-w-0 items-center gap-4 pl-2">
        <div className="player-thumbnail" />
        <div className="min-w-0">
          <p className="player-title">Song Title</p>
          <p className="player-artist">Artist</p>
        </div>
        <button type="button" className="player-btn-sm" aria-label="Add to favorite">
          <MusicNotesPlusIcon size={20} />
        </button>
      </div>

      <div className="player-col">
        <div id="playback-control" className="flex items-center gap-4">
          <button type="button" className="player-btn hidden md:flex" aria-label="Shuffle">
            <ShuffleIcon size={18} />
          </button>

          <button type="button" className="player-btn" aria-label="Previous">
            <SkipBackIcon size={18} weight="fill" />
          </button>

          <button type="button" className="player-btn-play" aria-label="Play">
            <PlayIcon size={22} weight="fill" />
          </button>

          <button type="button" className="player-btn" aria-label="Next">
            <SkipForwardIcon size={18} weight="fill" />
          </button>

          <button type="button" className="player-btn hidden md:flex" aria-label="Repeat">
            <RepeatIcon size={18} />
          </button>
        </div>

        <div id="progress-control" className="hidden w-full max-w-xl items-center gap-3 lg:flex">
          <span className="w-10 text-right player-time">0:00</span>

          <input type="range" min="0" max="100" defaultValue="0" className="player-range" />
          <span className="w-10 player-time">6:70</span>
        </div>
      </div>

      <div id="button-controls" className="hidden items-center justify-end gap-1 lg:flex">
        <button type="button" className="player-btn" aria-label="Sleep timer">
          <ClockCountdownIcon size={20} />
        </button>

        <button type="button" className="player-btn" aria-label="Song info">
          <InfoIcon size={20} />
        </button>

        <button type="button" className="player-btn" aria-label="Queue">
          <QueueIcon size={20} />
        </button>

        <div id="volume-control" className="player-volume-control">
          <button type="button" className="player-btn hidden lg:flex" aria-label="Volume">
            <SpeakerHighIcon size={20} />
          </button>

          <input type="range" min="0" max="100" defaultValue="70" className="player-volume-range" />
        </div>

        <button type="button" className="player-btn" aria-label="Fullscreen">
          <CornersOutIcon size={20} />
        </button>
      </div>
    </div>
  );
}
