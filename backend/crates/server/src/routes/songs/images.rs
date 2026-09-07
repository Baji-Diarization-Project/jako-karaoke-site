//! Image upload and delete sub-resource for songs.

use axum::{
    Json,
    extract::{Multipart, Path, State},
    http::StatusCode,
};
use sha2::{Digest, Sha256};
use tracing::error;
use uuid::Uuid;

use api_types::{common::ErrorResponse, songs::SongImageInfo};
use db::{error::DbError, models::NewImage, queries};

use crate::{auth::middleware::AuthUser, capabilities, error::ApiError, media, state::AppState};

/// Placeholder schema for image multipart upload bodies.
#[derive(utoipa::ToSchema)]
#[allow(dead_code)]
pub(crate) struct ImageUpload {
    #[schema(value_type = String, format = Binary)]
    pub file: Vec<u8>,
    /// Semantic role of the image. See [`SongImageKind`](api_types::songs::SongImageKind).
    pub kind: String,
    pub credits: Option<String>,
}

struct ImageFields {
    data: Vec<u8>,
    content_type: String,
    filename: Option<String>,
    kind: String,
    credits: Option<String>,
}

async fn read_image_fields(multipart: &mut Multipart) -> Result<ImageFields, ApiError> {
    let mut data: Option<Vec<u8>> = None;
    let mut content_type = String::new();
    let mut filename: Option<String> = None;
    let mut kind: Option<String> = None;
    let mut credits: Option<String> = None;

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        error!("multipart field error: {e:?}");
        ApiError::BadRequest(e.to_string())
    })? {
        match field.name() {
            Some("file") => {
                content_type = field
                    .content_type()
                    .unwrap_or("application/octet-stream")
                    .to_string();
                filename = field.file_name().map(str::to_string);
                let bytes = field.bytes().await.map_err(|e| {
                    error!("multipart read error: {e:?}");
                    ApiError::BadRequest(e.to_string())
                })?;
                data = Some(bytes.to_vec());
            }
            Some("kind") => {
                let text = field.text().await.map_err(|e| {
                    error!("multipart field error: {e:?}");
                    ApiError::BadRequest(e.to_string())
                })?;
                kind = Some(text);
            }
            Some("credits") => {
                let text = field.text().await.map_err(|e| {
                    error!("multipart field error: {e:?}");
                    ApiError::BadRequest(e.to_string())
                })?;
                if !text.is_empty() {
                    credits = Some(text);
                }
            }
            _ => {}
        }
    }

    Ok(ImageFields {
        data: data.ok_or_else(|| ApiError::BadRequest("missing 'file' field".into()))?,
        content_type,
        filename,
        kind: kind.ok_or_else(|| ApiError::BadRequest("missing 'kind' field".into()))?,
        credits,
    })
}

#[utoipa::path(
    post,
    path = "/api/songs/{id}/images",
    params(("id" = Uuid, Path, description = "Song ID")),
    request_body(content = ImageUpload, content_type = "multipart/form-data"),
    responses(
        (status = 201, description = "Image uploaded and linked", body = SongImageInfo),
        (status = 400, description = "Bad request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 404, description = "Song not found", body = ErrorResponse),
    ),
    tag = "songs",
    security(("session" = []))
)]
pub(crate) async fn upload_song_image(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<SongImageInfo>), ApiError> {
    if !auth.capabilities.contains(capabilities::SONGS_MANAGE_ANY) {
        return Err(ApiError::Forbidden);
    }
    queries::songs::get_by_id(&state.pool, id)
        .await?
        .ok_or(ApiError::NotFound)?;

    let fields = read_image_fields(&mut multipart).await?;

    let kind = match fields.kind.trim() {
        "cover_art" => "cover_art",
        other => {
            return Err(ApiError::BadRequest(format!("invalid kind '{other}'")));
        }
    };

    let ext = media::resolve_ext(
        media::MediaKind::Image,
        &fields.content_type,
        fields.filename.as_deref(),
    )?;
    let hash = hex::encode(Sha256::digest(&fields.data));

    let image = if let Some(existing) = queries::images::get_by_hash(&state.pool, &hash).await? {
        existing
    } else {
        let saved = state.store.save("images", ext, &fields.data).await?;
        let mut conn = state.pool.acquire().await.map_err(DbError::Sqlx)?;
        queries::images::create(
            &mut conn,
            &NewImage {
                hash,
                public_url: saved.public_url,
                internal_path: Some(saved.internal_path),
                credits: fields.credits,
            },
        )
        .await?
    };

    let mut conn = state.pool.acquire().await.map_err(DbError::Sqlx)?;
    queries::songs::link_image(&mut conn, id, image.id, kind).await?;

    Ok((
        StatusCode::CREATED,
        Json(SongImageInfo {
            id: image.id,
            public_url: image.public_url,
            credits: image.credits,
            kind: kind.to_string(),
        }),
    ))
}

#[utoipa::path(
    delete,
    path = "/api/songs/{id}/images/{image_id}",
    params(
        ("id" = Uuid, Path, description = "Song ID"),
        ("image_id" = Uuid, Path, description = "Image ID"),
    ),
    responses(
        (status = 204, description = "Deleted"),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 404, description = "Not found", body = ErrorResponse),
    ),
    tag = "songs",
    security(("session" = []))
)]
pub(crate) async fn delete_song_image(
    State(state): State<AppState>,
    auth: AuthUser,
    Path((id, image_id)): Path<(Uuid, Uuid)>,
) -> Result<StatusCode, ApiError> {
    if !auth.capabilities.contains(capabilities::SONGS_MANAGE_ANY) {
        return Err(ApiError::Forbidden);
    }

    let removed = queries::songs::unlink_image(&state.pool, id, image_id).await?;
    if !removed {
        return Err(ApiError::NotFound);
    }

    let ref_count = queries::images::reference_count(&state.pool, image_id).await?;
    if ref_count == 0
        && let Some(image) = queries::images::get_by_id(&state.pool, image_id).await?
    {
        queries::images::delete(&state.pool, image_id).await?;
        if let Some(path) = &image.internal_path
            && let Err(e) = state.store.delete(path).await
        {
            error!("failed to delete image file {path}: {e}");
        }
    }

    Ok(StatusCode::NO_CONTENT)
}
