# Prosper Masuku — developer portfolio

React, TypeScript, Vite and Tailwind CSS, with Vercel Functions and **private Vercel Blob file storage**. No database is required.

## What's included

- A framed portrait matching the existing terminal-inspired theme.
- Champs Order Hub, UFH Opportunity Hub, and MusicInsta, followed by all four original projects. Champs and MusicInsta have private-repository labels.
- Direct, same-origin CV downloads. The original CV is bundled at `public/documents/Prosper-Masuku-CV.docx`.
- `/admin`: password-protected content editor with preview and explicit publishing. Edit section copy, navigation, links, skills, milestones, projects, contact information, footer, search metadata, colors, and section visibility. Add, remove, and reorder list items. Upload section/card images and replacement CVs.
- A private visitor inbox: read/unread state, pagination, deletion, and reply links that open your email application. No messages are sent automatically.

## One-time Vercel setup

Use the existing **my-dev-story** project (`prj_J3bYW7BzuO46OSzq0ucEIXcJryRb`).

1. In Vercel **Storage**, create a **Private Blob** store and connect it to this project. Public storage must not be used: contact messages contain private information.
2. In project **Settings → Environment Variables**, set these server-only values for Production:
   - `BLOB_READ_WRITE_TOKEN`: the read/write token from the connected private store.
   - `ADMIN_PASSWORD`: a unique password of at least 16 characters.
   - `ADMIN_SESSION_SECRET`: at least 32 random characters. A password manager can generate this.
3. Deploy the updated repository, using Node.js 22 or 24 and the included `vercel.json`.
4. Open `/admin`, sign in with your password, edit, preview, and publish.

Use a **separate private Blob store and different secrets for Preview/Development** to avoid test changes affecting the production portfolio or inbox. Never prefix secrets with `VITE_`, commit them, or paste them into public source files. Changing either admin secret invalidates existing sessions; sign-out clears the browser cookie. Sessions otherwise expire after eight hours.

**Provisioning status:** the connected Vercel tool rejected private-store creation with HTTP 403 (“You don't have permission to create the blob”). No store or admin credentials were created by this change, and the changes have not been deployed. A Vercel member with storage permissions must complete the setup above. The portfolio renders its bundled content without these values; admin operations and contact submissions return a clear configuration error rather than claiming success.

## Local development

```sh
npm ci
npm run dev
```

The local server runs at `http://localhost:8080` and serves the frontend and the same API handler used on Vercel. For real publishing/inbox testing, copy `.env.example` to `.env.local` and configure a dedicated development private Blob store and admin secrets. Restart after changing environment variables. `.env.local` is ignored by Git. You can also link the Vercel project and run `vercel env pull .env.local --environment=development` if you have an authenticated Vercel CLI.

```sh
npm run typecheck
npm test
npm run build
```

Tests cover validation, upload signatures, session forgery, anonymous inbox access, cross-origin writes, missing-configuration errors, publishing, conflicts, contact delivery, and message management. The full API workflow test uses an in-memory storage adapter; it does not verify a real Blob connection.

For an isolated admin UI demonstration, run `node tests/preview-admin.mjs`, then visit `http://127.0.0.1:8081/admin` with the test password `local-ui-test-only-123456`. This binds only to the local computer and never connects to Vercel Blob. All changes and messages in this demonstration disappear when it stops. Never use this test password for production.

## Content and storage

- `src/data/content.json` provides the initial content and editor templates.
- Published edits live in `site/content.json` in the private store and appear without a rebuild. Conditional writes reject stale editor sessions; reload before retrying after a conflict.
- Each contact message is stored separately under `messages/`, avoiding lost messages from concurrent submissions. Only authenticated admin APIs can read or modify these files.
- Image and CV uploads live under `media/`. Only that restricted prefix is publicly served through `/api/media`; the store itself remains private. Do not upload confidential files as website media.
- Supported uploads: JPEG, PNG, WebP, GIF, PDF and DOCX, up to 3 MB per file. Replace a file, then publish to apply it. Previously uploaded assets remain in storage so unpublished edits cannot break live content.
- Login and contact endpoints use persistent rate-limit records in Blob (eight sign-in attempts per 15 minutes, five contact submissions per hour per client). Contact has a honeypot as an additional spam measure.
- Back up the private store regularly, including the content file and media. Unused media and old client rate-limit records can be removed from the storage dashboard when no longer needed. Message deletion is permanent and asks for confirmation in the admin UI.
- Object storage has usage-based limits/costs. This design suits a small portfolio, not a high-volume CMS or messaging service.

The admin manages site content and existing layout options. Structural redesigns and new application behavior still require code changes.
