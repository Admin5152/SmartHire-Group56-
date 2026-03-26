

## Plan: Increase Resume Upload File Size Limit

Currently, the upload limit is **10MB**. I'll increase it to **50MB** across the application.

### Changes

1. **`src/pages/applicant/ApplyJob.tsx`** — Update the file size check from `10 * 1024 * 1024` to `50 * 1024 * 1024` and update the error message accordingly.

2. **`supabase/config.toml`** — Add/update the storage file size limit configuration to allow 50MB uploads if needed.

3. **`supabase/functions/analyze-resume/index.ts`** — No changes needed since it receives base64 data, but worth verifying no body size limits are imposed.

This is a straightforward change — just bumping the client-side validation limit from 10MB to 50MB.

