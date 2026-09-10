import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import type { ArtistSortField } from "@/api/artists";
import { useInfiniteArtists } from "@/hooks/api/artists";
import { useDebounced } from "@/hooks/use-debounced";

import { ArtistCard } from "./artist-card";

type SortOption = `${ArtistSortField}-${"asc" | "desc"}`;

interface ArtistState {
  q?: string;
  sort?: ArtistSortField;
  sort_dir?: "asc" | "desc";
}

const SORT_OPTIONS: { value: SortOption; label: string; params: Partial<ArtistState> }[] = [
  { value: "name-asc", label: "A-Z", params: {} },
  { value: "name-desc", label: "Z-A", params: { sort_dir: "desc" } },
  {
    value: "song_count-desc",
    label: "Most songs",
    params: { sort: "song_count", sort_dir: "desc" },
  },
  { value: "song_count-asc", label: "Fewest songs", params: { sort: "song_count" } },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function encodeArtistState(state: ArtistState): string {
  return btoa(JSON.stringify(state)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeArtistState(encoded: string): ArtistState {
  if (!encoded) return {};
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const remainder = padded.length % 4;
    const normalized = remainder > 0 ? padded + "=".repeat(4 - remainder) : padded;
    const parsed: unknown = JSON.parse(atob(normalized));
    if (!isRecord(parsed)) return {};
    const state: ArtistState = {};
    if (typeof parsed.q === "string" && parsed.q) state.q = parsed.q;
    if (parsed.sort === "name" || parsed.sort === "song_count") state.sort = parsed.sort;
    if (parsed.sort_dir === "asc" || parsed.sort_dir === "desc") state.sort_dir = parsed.sort_dir;
    return state;
  } catch {
    return {};
  }
}

function compactState(state: ArtistState): ArtistState {
  const compact: ArtistState = {};
  if (state.q) compact.q = state.q;
  if (state.sort && state.sort !== "name") compact.sort = state.sort;
  if (state.sort_dir && state.sort_dir !== "asc") compact.sort_dir = state.sort_dir;
  return compact;
}

function stateToParam(state: ArtistState): string | null {
  const compact = compactState(state);
  return Object.keys(compact).length > 0 ? encodeArtistState(compact) : null;
}

export function ArtistsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const artistState = decodeArtistState(searchParams.get("query") ?? "");

  const q = artistState.q ?? "";
  const sort = artistState.sort ?? "name";
  const sortDir = artistState.sort_dir ?? "asc";

  const [inputValue, setInputValue] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  const debouncedInput = useDebounced(inputValue);
  const sentinelRef = useRef<HTMLDivElement>(null);

  if (q !== prevQ) {
    setPrevQ(q);
    setInputValue(q);
  }

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const current = decodeArtistState(prev.get("query") ?? "");
        const next = stateToParam({ ...current, q: debouncedInput.trim() || undefined });
        const params = new URLSearchParams(prev);
        if (next) {
          params.set("query", next);
        } else {
          params.delete("query");
        }
        return params;
      },
      { replace: true },
    );
  }, [debouncedInput, setSearchParams]);

  function updateSearch(partial: Partial<ArtistState>) {
    setSearchParams((prev) => {
      const current = decodeArtistState(prev.get("query") ?? "");
      const next = stateToParam({ ...current, ...partial });
      const params = new URLSearchParams(prev);
      if (next) {
        params.set("query", next);
      } else {
        params.delete("query");
      }
      return params;
    });
  }

  const currentSortOption: SortOption = `${sort}-${sortDir}`;

  function handleSortChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const option = SORT_OPTIONS.find((opt) => opt.value === event.target.value);
    if (option) {
      updateSearch({ sort: undefined, sort_dir: undefined, ...option.params });
    }
  }

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteArtists({
    q: q || undefined,
    sort,
    sort_dir: sortDir,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const total = data?.pages[0]?.total ?? 0;
  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div>
      <div className="artists-header">
        <div className="artists-controls">
          <div className="artists-search-wrapper">
            <MagnifyingGlassIcon size={16} className="artists-search-icon" />
            <input
              type="search"
              className="form-input artists-search-input"
              placeholder="Search artists…"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
              }}
              aria-label="Search artists"
            />
          </div>
          <select
            className="artists-sort-select"
            value={currentSortOption}
            onChange={handleSortChange}
            aria-label="Sort artists"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="artists-meta">
        {isLoading ? (
          "Loading…"
        ) : (
          <>
            {total.toLocaleString()} artist{total !== 1 ? "s" : ""}
            {q && <> matching &ldquo;{q}&rdquo;</>}
          </>
        )}
      </div>

      <div className="artists-grid">
        {items.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
        {!isLoading && items.length === 0 && <div className="artists-empty">No artists found.</div>}
      </div>

      <div ref={sentinelRef} />

      {isFetchingNextPage && <div className="artists-loading-more">Loading more…</div>}
    </div>
  );
}
