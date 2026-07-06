-- Migration 010: Promo codes for beta invitations
CREATE TABLE IF NOT EXISTS promo_codes (
    code        text PRIMARY KEY,
    max_uses    integer NOT NULL DEFAULT 10,
    used_count  integer NOT NULL DEFAULT 0,
    expires_at  timestamptz,
    created_at  timestamptz NOT NULL DEFAULT now()
);
