//! Shared types used across multiple route modules.

/// Sort direction for list endpoints.
#[derive(Debug, Clone, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "snake_case")]
pub(crate) enum SortDir {
    Asc,
    Desc,
}

impl SortDir {
    pub(crate) fn as_str(&self) -> &'static str {
        match self {
            Self::Asc => "ASC",
            Self::Desc => "DESC",
        }
    }
}
