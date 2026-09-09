//! Query functions for the `performance_audios` table.

use sqlx::{Executor, MySql, MySqlConnection};
use uuid::Uuid;

use crate::error::DbError;
use crate::models::performance_audio::{NewPerformanceAudio, PerformanceAudio};

type Result<T> = std::result::Result<T, DbError>;

/// Fetches a performance audio record by ID.
pub async fn get_by_id(
    executor: impl Executor<'_, Database = MySql>,
    id: Uuid,
) -> Result<Option<PerformanceAudio>> {
    sqlx::query_as::<_, PerformanceAudio>(
        "SELECT id, performance_id, public_url, internal_path, kind \
         FROM performance_audios WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(executor)
    .await
    .map_err(DbError::from)
}

/// Returns all audio records for a given performance.
pub async fn list_for_performance(
    executor: impl Executor<'_, Database = MySql>,
    performance_id: Uuid,
) -> Result<Vec<PerformanceAudio>> {
    sqlx::query_as::<_, PerformanceAudio>(
        "SELECT id, performance_id, public_url, internal_path, kind \
         FROM performance_audios WHERE performance_id = ?",
    )
    .bind(performance_id)
    .fetch_all(executor)
    .await
    .map_err(DbError::from)
}

/// Inserts a new performance audio record and returns it.
pub async fn create(
    conn: &mut MySqlConnection,
    new: &NewPerformanceAudio,
) -> Result<PerformanceAudio> {
    sqlx::query_as::<_, PerformanceAudio>(
        "INSERT INTO performance_audios (performance_id, public_url, internal_path, kind) \
         VALUES (?, ?, ?, ?) \
         RETURNING id, performance_id, public_url, internal_path, kind",
    )
    .bind(new.performance_id)
    .bind(&new.public_url)
    .bind(&new.internal_path)
    .bind(&new.kind)
    .fetch_one(conn)
    .await
    .map_err(DbError::from)
}

/// Demotes any existing `"primary"` audio for the given performance to `"misc"`.
pub async fn unset_primary(
    executor: impl Executor<'_, Database = MySql>,
    performance_id: Uuid,
) -> Result<()> {
    sqlx::query(
        "UPDATE performance_audios SET kind = 'misc' \
         WHERE performance_id = ? AND kind = 'primary'",
    )
    .bind(performance_id)
    .execute(executor)
    .await
    .map(|_| ())
    .map_err(DbError::from)
}

/// Updates the kind of a performance audio record. Returns `true` if a row was updated.
pub async fn update_kind(conn: &mut MySqlConnection, id: Uuid, kind: &str) -> Result<bool> {
    sqlx::query("UPDATE performance_audios SET kind = ? WHERE id = ?")
        .bind(kind)
        .bind(id)
        .execute(conn)
        .await
        .map(|r| r.rows_affected() > 0)
        .map_err(DbError::from)
}

/// Deletes a performance audio record by ID. Returns `true` if a row was deleted.
pub async fn delete(executor: impl Executor<'_, Database = MySql>, id: Uuid) -> Result<bool> {
    sqlx::query("DELETE FROM performance_audios WHERE id = ?")
        .bind(id)
        .execute(executor)
        .await
        .map(|r| r.rows_affected() > 0)
        .map_err(DbError::from)
}
