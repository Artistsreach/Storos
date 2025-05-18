# The path is available as blob.original_id.path
# We need to decode it if it's bytes, or handle if it's already a string.
# For safety, let's assume it's bytes and decode.
try:
    path_bytes = blob.original_id.path
    path_str = path_bytes.decode('utf-8', 'surrogateescape')
except AttributeError:
    # Fallback if original_id or path is not found, though it should be.
    # This is unlikely to be hit if the --path .env filter is working.
    path_str = None

if path_str == ".env":
    # Replace a placeholder secret, not the actual one, as this script itself could be committed.
    # The actual secret removal from history should be handled by git-filter-repo's direct text replacement.
    blob.data = blob.data.replace(
        b"PLACEHOLDER_SECRET_TO_REPLACE",
        b"VITE_OPENAI_API_KEY=\"REMOVED_KEY_FOR_SECURITY_REASONS\""
    )
