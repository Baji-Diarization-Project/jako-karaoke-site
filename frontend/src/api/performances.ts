import { api } from "./client";
import type { components } from "./generated";
import type { SearchPaginationParams } from "./types";

export type PerformanceSummary = components["schemas"]["PerformanceSummary"];
export type PerformanceResponse = components["schemas"]["PerformanceResponse"];
export type PerformanceTagKind = components["schemas"]["PerformanceTagKind"];
export type MediaInfo = components["schemas"]["MediaInfo"];

export const PERFORMANCE_TAG_KINDS = [
  "instrument",
  "modifier",
  "misc",
] as const satisfies readonly PerformanceTagKind[];

/** Query parameters accepted by the performances list endpoint. */
export type PerformanceListParams = SearchPaginationParams & {
  /** Field to sort by. Defaults to performance_date. */
  sort?: "performance_date" | "play_count" | "duration";
  /** Sort direction. Defaults to desc. */
  sort_dir?: "asc" | "desc";
};

/** Performance endpoints. */
export const performancesApi = {
  /** Returns a paginated, optionally filtered list of performances. */
  list: (params?: PerformanceListParams) =>
    api.GET("/api/performances", { params: { query: params } }),

  /** Returns a single performance by ID. */
  get: (id: string) => api.GET("/api/performances/{id}", { params: { path: { id } } }),

  /**
   * Returns lyrics for a performance.
   * Falls back to the linked song's lyrics if no performance-specific override is set.
   * Returns 404 if neither the performance nor the song has lyrics.
   */
  getLyrics: (id: string) => api.GET("/api/performances/{id}/lyrics", { params: { path: { id } } }),

  /** Creates a new performance. */
  create: (body: components["schemas"]["CreatePerformanceRequest"]) =>
    api.POST("/api/performances", { body }),

  /** Updates a performance by ID. */
  update: (id: string, body: components["schemas"]["UpdatePerformanceRequest"]) =>
    api.PUT("/api/performances/{id}", { params: { path: { id } }, body }),

  /** Deletes a performance by ID. */
  delete: (id: string) => api.DELETE("/api/performances/{id}", { params: { path: { id } } }),

  /** Uploads an audio file for a performance. */
  uploadAudio: (id: string, file: File) =>
    api.POST("/api/performances/{id}/audio", {
      params: { path: { id } },
      body: { file: "" } satisfies components["schemas"]["FileUpload"],
      bodySerializer: () => {
        const form = new FormData();
        form.append("file", file);
        return form;
      },
    }),

  /** Removes an audio file from a performance. */
  deleteAudio: (id: string, audioId: string) =>
    api.DELETE("/api/performances/{id}/audio/{audio_id}", {
      params: { path: { id, audio_id: audioId } },
    }),
};
