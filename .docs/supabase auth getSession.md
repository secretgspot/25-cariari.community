<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# I'm still seeing

Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.

The warning you're seeing about using `supabase.auth.getSession()` or `onAuthStateChange()` stems from a security concern: **the session object retrieved from `getSession()` comes directly from the client-side storage medium (usually cookies), which may be tampered with and thus is not fully trustworthy or verified by the Supabase server**.

### Key Differences Between `getSession()` and `getUser()`

- **`getSession()`**
    - Retrieves the session (including the user object) locally, often from stored cookies or local storage.
    - It is faster and works well on the client for instant access to session data.
    - **Not fully secure or verified** on the server side because it relies on client-provided data which can be manipulated.
    - Using it on the server or in middleware poses a risk of trusting unauthorized or modified session data.
- **`getUser()`**
    - Makes an **actual network request to the Supabase Auth server** to validate the JWT token and retrieve the user info.
    - Returns **authenticated, verified user data**.
    - Should be used **server-side** or anywhere you require trusted user data for authorization.
    - Slightly slower due to the network request but necessary for security.


### Why the Warning?

Supabase now prints this warning to alert that using `getSession()` on the server or in certain contexts can lead to security vulnerabilities because the session data might be forged or stale. Instead, it recommends:

- Use `getUser()` when you need **verified user data from the server**.
- Use `getSession()` only on the client where perfect security is less critical, and you want fast access.


### How to Fix the Warning in Your SvelteKit Setup

Given your setup using `hooks.server.js`, you should:

1. **Replace calls to `supabase.auth.getSession()` with `supabase.auth.getUser()` on the server (`hooks.server.js` or server routes).** For example:
```js
const { data: { user } } = await event.locals.supabase.auth.getUser();
if (!user) {
  throw redirect(303, '/login');
}
// Use `user` as your authenticated user
```

2. If you need the session token for things like access tokens or refresh tokens, you can still use `getSession()` but **only after you have called `getUser()`** to verify the user, thus silencing the warning and ensuring security.
3. On the **client side**, it's fine to keep using `getSession()` or listen to `onAuthStateChange()` for UI reactivity and user experience reasons, because manipulating client state is expected.

### Summary

| Usage Context | Recommended Method | Reason |
| :-- | :-- | :-- |
| Server (hooks, middleware, endpoints) | `getUser()` | Authenticates JWT with Supabase, secure |
| Client (UI, client stores) | `getSession()` or `onAuthStateChange()` | Fast access to session info, acceptable risk |
| To suppress warnings on server | Call `getUser()` before `getSession()` | Ensures verified user, silences warning |

### Reference Quote from Supabase Docs \& Community

> “If you need verified, trustworthy user data, call `getUser()` instead. `getSession()` loads data directly from storage (cookies) and may not be authentic.”
> — Supabase official docs and multiple user reports [^1][^2][^3][^10]

This approach is the modern best practice for Supabase authentication, especially in server-side frameworks like SvelteKit.

If you want, I can help you update your `hooks.server.js` and related code to properly use `getUser()` and fix this warning securely. Would you like that?

<div style="text-align: center">⁂</div>

[^1]: https://www.reddit.com/r/Supabase/comments/1d8vg80/getuser_vs_getsesssion_to_check_if_user_is_signed/

[^2]: https://supabase.com/docs/reference/javascript/auth-getuser

[^3]: https://stackoverflow.com/questions/78518201/how-to-properly-use-supabase-auth-getsession

[^4]: https://github.com/orgs/supabase/discussions/4400

[^5]: https://authjs.dev/getting-started/migrating-to-v5

[^6]: https://github.com/orgs/supabase/discussions/28983

[^7]: https://www.reddit.com/r/Supabase/comments/1io173w/getsession_vs_getuser/?tl=es-419

[^8]: https://supabase.com/docs/guides/auth/sessions

[^9]: https://supabase.com/docs/guides/auth/users

[^10]: https://supabase.com/docs/guides/auth/server-side/nextjs

