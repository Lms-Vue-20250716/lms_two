# Copilot Instructions for lms_two

## Project Overview
- This is a Vue 3 + Vite project for a Learning Management System (LMS).
- Main libraries: Vue 3, Pinia (state management), Vue Router, Element Plus (UI), TailwindCSS, Axios, Vue Query.
- The app is modular, with feature-based directories under `src/components`, `src/views`, and `src/stores`.

## Architecture & Patterns
- **Entry Point:** `src/main.js` mounts the app, sets up Pinia, Vue Router, Element Plus, and Vue Query.
- **Routing:** Defined in `src/router/index.js`. All main features are routed under `/vue` (e.g., `/vue/support/notice`).
- **State Management:** Pinia stores in `src/stores/`. Example: `loginInfoState.js` manages user info and session persistence.
- **UI Components:** Use Element Plus and TailwindCSS. Custom components are in `src/components/` (e.g., `ContentBox.vue` uses Tailwind's `@apply`).
- **API Communication:** All API calls use Axios. Requests to `/api` are proxied to `http://localhost:80` via Vite config (`vite.config.js`).
- **Session Handling:** User info is persisted in `sessionStorage` and loaded on app start.

## Developer Workflows
- **Start Dev Server:** `npm run dev` (uses Vite)
- **Build:** `npm run build`
- **Preview Build:** `npm run preview`
- **Lint & Format:**
  - Lint: `npm run lint` (auto-fixes)
  - Format: `npm run format` (Prettier + Tailwind plugin)
- **Component Styling:** Use TailwindCSS utility classes and `@apply` in scoped CSS blocks.

## Conventions & Patterns
- **Imports:** Use `@` alias for `src/` (see Vite config).
- **Component Structure:** Each feature has its own folder under `src/components` and `src/views`.
- **Scoped Styles:** Prefer `<style scoped>` in Vue SFCs. Use Tailwind's `@apply` for utility classes.
- **State Initialization:** Always call `initializeFromSession()` for user info on app mount.
- **Error Handling:** Catch and log errors for session/user info loading in stores.

## Integration Points
- **Backend:** All `/api` requests are proxied to `http://localhost:80`.
- **External Libraries:**
  - Element Plus for UI
  - TailwindCSS for styling
  - Pinia for state
  - Vue Query for async data

## Key Files & Directories
- `src/main.js` — App entry, plugin setup
- `src/router/index.js` — Route definitions
- `src/stores/loginInfoState.js` — User/session state
- `src/components/common/ContentBox.vue` — Example of Tailwind + Element Plus usage
- `vite.config.js` — Vite, proxy, and alias config

## Example Patterns
```js
// src/stores/loginInfoState.js
const storedUserInfo = sessionStorage.getItem('userInfo');
if (storedUserInfo) {
  this.user = JSON.parse(storedUserInfo);
}
```
```vue
<!-- src/components/common/ContentBox.vue -->
<style lang="css" scoped>
@import 'tailwindcss';
.content-box-container {
  @apply ...;
}
</style>
```

---
If any section is unclear or missing, please provide feedback to improve these instructions.
