//! Query functions for the `images` table.

use sqlx::{Executor, MySql, MySqlConnection};
use uuid::Uuid;

use crate::error::DbError;
use crate::models::image::{Image, NewImage, UpdateImage};

type Result<T> = std::result::Result<T, DbError>;

/// Fetches an image by ID.
pub async fn get_by_id(
    executor: impl Executor<'_, Database = MySql>,
    id: Uuid,
) -> Result<Option<Image>> {
    sqlx::query_as::<_, Image>(
        "SELECT id, hash, public_url, internal_path, credits FROM images WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(executor)
    .await
    .map_err(DbError::from)
}

/// Fetches an image by its SHA-256 hash.
pub async fn get_by_hash(
    executor: impl Executor<'_, Database = MySql>,
    hash: &str,
) -> Result<Option<Image>> {
    sqlx::query_as::<_, Image>(
        "SELECT id, hash, public_url, internal_path, credits FROM images WHERE hash = ?",
    )
    .bind(hash)
    .fetch_optional(executor)
    .await
    .map_err(DbError::from)
}

/// Returns the total number of join rows referencing this image across all resource types.
///
/// Used to determine whether a physical file and its `images` row can be safely removed.
pub async fn reference_count(
    executor: impl Executor<'_, Database = MySql>,
    image_id: Uuid,
) -> Result<i64> {
    sqlx::query_scalar::<_, i64>(
        "SELECT \
            (SELECT COUNT(*) FROM song_images WHERE image_id = ?) + \
            (SELECT COUNT(*) FROM artist_images WHERE image_id = ?)",
    )
    .bind(image_id)
    .bind(image_id)
    .fetch_one(executor)
    .await
    .map_err(DbError::from)
}

/// Inserts a new image record and returns the created row.
pub async fn create(conn: &mut MySqlConnection, new: &NewImage) -> Result<Image> {
    sqlx::query_as::<_, Image>(
        "INSERT INTO images (hash, public_url, internal_path, credits) VALUES (?, ?, ?, ?) \
         RETURNING id, hash, public_url, internal_path, credits",
    )
    .bind(&new.hash)
    .bind(&new.public_url)
    .bind(&new.internal_path)
    .bind(&new.credits)
    .fetch_one(conn)
    .await
    .map_err(DbError::from)
}

/// Updates an image record's mutable fields. Returns `None` if the ID does not exist.
pub async fn update(
    conn: &mut MySqlConnection,
    id: Uuid,
    upd: &UpdateImage,
) -> Result<Option<Image>> {
    sqlx::query("UPDATE images SET public_url = ?, internal_path = ?, credits = ? WHERE id = ?")
        .bind(&upd.public_url)
        .bind(&upd.internal_path)
        .bind(&upd.credits)
        .bind(id)
        .execute(&mut *conn)
        .await
        .map_err(DbError::from)?;
    get_by_id(&mut *conn, id).await
}

/// Deletes an image record by ID. Returns `true` if a row was deleted.
pub async fn delete(executor: impl Executor<'_, Database = MySql>, id: Uuid) -> Result<bool> {
    sqlx::query("DELETE FROM images WHERE id = ?")
        .bind(id)
        .execute(executor)
        .await
        .map(|r| r.rows_affected() > 0)
        .map_err(DbError::from)
}
