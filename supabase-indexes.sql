-- Performance indexes for ~1000 concurrent users
-- Run in Supabase Dashboard → SQL Editor

-- wishlists: frequent lookups by owner
CREATE INDEX IF NOT EXISTS idx_wishlists_owner_id ON wishlists (owner_id);

-- wishes: frequent lookups by user
CREATE INDEX IF NOT EXISTS idx_wishes_user_id ON wishes (user_id);
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes (created_at DESC);

-- wishlist_items: junction table — both FKs need indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items (wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wish_id ON wishlist_items (wish_id);

-- categories: lookups by user
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories (user_id);

-- reservations: lookups by wish_id (most common), user_id
CREATE INDEX IF NOT EXISTS idx_reservations_wish_id ON reservations (wish_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations (user_id);

-- wishlist_collaborators: lookups by user_id and wishlist_id
CREATE INDEX IF NOT EXISTS idx_wl_collab_user_id ON wishlist_collaborators (user_id);
CREATE INDEX IF NOT EXISTS idx_wl_collab_wishlist_id ON wishlist_collaborators (wishlist_id);

-- followed_public_wishlists: lookups by user_id
CREATE INDEX IF NOT EXISTS idx_followed_pub_wl_user_id ON followed_public_wishlists (user_id);
