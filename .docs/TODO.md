# TODO

- [ ] what is the point of /api/comments and /api/comments/[id] when comments are available under each drill down /api/events/[id]/comments? should comment api only be used for posting/editing/deleting comments from Comments component? is it used for listin right now?
- [ ] when new item added, should it go to the new item page instead of main page?
- [x] confirmation dialog for deleting ad in admin?

---

## Refactoring API Endpoints

- [ ] Create a helper function `withAuth` in `src/lib/utils/api_auth.js` to handle authorization and error handling.
- [ ] Refactor all API endpoints in `src/routes/(api)/api/` to use the `withAuth` helper function.

## Centralized Dialog Management

- [ ] Create a `dialog` store in `src/lib/dialog/store.js` to manage the dialog's state.
- [ ] Create a `DialogManager.svelte` component in `src/lib/dialog/` that listens to the store.
- [ ] Add `<DialogManager />` to the root `+layout.svelte` file.
- [ ] Refactor components that use `<Dialog>` to use the new `showDialog` function.

## Centralized Deletion Logic

- [ ] Create a generic `handleDelete` function in `src/lib/utils/api_helpers.js` that encapsulates the entire deletion process (API call, toast notifications, and UI updates).
- [ ] Refactor all components with delete functionality (`ManageEvent.svelte`, `ManageNotice.svelte`, `profile/+page.svelte`, etc.) to use the centralized `handleDelete` function.

## Reusable Form Submission Logic

- [ ] Create a reusable Svelte action (e.g., `use:enhancedForm`) in `src/lib/actions/form.js` to handle common form submission logic (loading states, toast notifications, success/error handling).
- [ ] Refactor `AddNoticeForm.svelte`, `AddEventForm.svelte`, `AddLostFoundForm.svelte`, and `AddServiceForm.svelte` to use the new `enhancedForm` action, reducing duplicated code.

## Homepage Data Optimization

- [ ] Create a PostgreSQL view `homepage_data_view` that combines data from `notices`, `events`, `lost_and_found`, and `services` tables, mimicking the current homepage API response structure.
- [ ] Update `src/routes/(api)/api/homepage/+server.js` to query the new `homepage_data_view` instead of making multiple Supabase calls.

## Profile Page Data Optimization

- [ ] Create a new API endpoint (e.g., `src/routes/(api)/api/users/[uuid]/all-content/+server.js`) that fetches all user-related content (lost and found, events, notices, comments, services) in a single request.
- [ ] Update `src/routes/(app)/profile/+page.server.js` to fetch data from this new consolidated endpoint instead of making multiple individual requests.
