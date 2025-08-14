# TODO

- [-] Larger than mobile styling
- [ ] what is the point of /api/comments and /api/comments/[id] when comments are available under each drill down /api/events/[id]/comments? should comment api only be used for posting/editing/deleting comments from Comments component? is it used for listin right now?
- [ ] think of a way to expand linked button to be compatable with profile aside
- [x] notice Start and End don't appear in proper format.

---

## Improvement Suggestions

| File Path | Suggestion | Priority |
| :--- | :--- | :--- |
| **General** |
| `src/routes/` | The API endpoints in `src/routes/(api)/api/` have a lot of repeated code for authorization and error handling. This could be handled by a middleware or a helper function. | High |
| **Svelte Components** |
| `src/lib/Icon.svelte` | The `Icon.svelte` component contains a large number of SVG paths. These could be loaded dynamically to reduce the initial bundle size. | Medium |
| `src/lib/Dialog.svelte` | The `Dialog.svelte` component could be made more generic to handle different types of content, not just forms. | Low |
| `src/lib/Nav.svelte` | The navigation logic could be simplified by using a more data-driven approach, rather than a series of `{#if}` blocks. | Medium |
| `src/routes/(app)/profile/+page.svelte` | The `handleDelete` function is duplicated across multiple components. This could be moved to a central location. | High |
| `src/routes/(app)/**/Add*.svelte` | The `Add*Form.svelte` components share a lot of similar logic for handling form submissions and file uploads. This could be extracted into a reusable component or a set of utility functions. | High |
| **Performance** |
| `src/routes/(app)/+page.server.js` | The `load` function for the homepage fetches data from four different endpoints. These could be combined into a single endpoint to reduce the number of network requests. | High |
| `src/routes/(app)/profile/+page.server.js` | The `load` function for the profile page fetches data from five different endpoints in parallel. While this is good, the data could be combined into a single endpoint to reduce complexity. | Medium |
| **Code Style** |
| General | There are some inconsistencies in code formatting and style. Running a linter and a formatter across the project would improve code quality. | Low |
| `src/lib/utils/vibrate.js` & `src/lib/utils/audio.js` | The `vibrate.js` and `audio.js` utils have a similar structure for handling user settings. This could be abstracted into a more generic "effects" utility. | Low |

---

## Refactoring API Endpoints

- [ ] Create a helper function `withAuth` in `src/lib/utils/api_auth.js` to handle authorization and error handling.
- [ ] Refactor all API endpoints in `src/routes/(api)/api/` to use the `withAuth` helper function.

## Dynamic Icon Loading

- [x] Move each SVG from `Icon.svelte` into its own file in `static/icons/` (Note: Placeholder paths used, manual replacement with original paths required).
- [x] Refactor `Icon.svelte` to dynamically import and render the appropriate SVG based on the `kind` prop (using Svelte 5 runes).

## Centralized Dialog Management

- [ ] Create a `dialog` store in `src/lib/dialog/store.js` to manage the dialog's state.
- [ ] Create a `DialogManager.svelte` component in `src/lib/dialog/` that listens to the store.
- [ ] Add `<DialogManager />` to the root `+layout.svelte` file.
- [ ] Refactor components that use `<Dialog>` to use the new `showDialog` function.

## Data-Driven Navigation

- [ ] Create a `navLinks` data structure in `Nav.svelte` to define all navigation links and their visibility rules.
- [ ] Refactor the `Nav.svelte` template to use an `{#each}` loop to render links from the `navLinks` data structure.

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
