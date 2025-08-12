# TODO

- [/] Larger than mobile styling
- [ ] Avoid using `history.pushState(...)` and `history.replaceState(...)` as these will conflict with SvelteKit's router. Use the `pushState` and `replaceState` imports from `$app/navigation` instead.
- [ ] what is the point of /api/comments and /api/comments/[id] when comments are available under each drill down /api/events/[id]/comments? should comment api only be used for posting/editing/deleting comments from Comments component? is it used for listin right now?
- [x] logout button moved into profile next to username
- [ ] think of a way to expand linked button to be compatable with profile aside
