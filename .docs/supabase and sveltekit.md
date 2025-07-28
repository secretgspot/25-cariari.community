<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# I am not using typescript. I want it done with hooks.server.js and app.d.ts. I just need basic most modern way to integrate supabase with sveltekit svelte5 with runes

To integrate Supabase authentication with SvelteKit (Svelte 5) in a **basic, modern way without TypeScript**, you can use `hooks.server.js` for server-side client setup and define types in `app.d.ts` for your own convenience without using full TypeScript in your app.

Here's a minimal, clear approach using the latest recommended `@supabase/ssr` package for SSR support and cookies, in JavaScript (`.js`):

### 1. Install Required Packages

```bash
npm install @supabase/ssr @supabase/supabase-js
```


### 2. Create `src/hooks.server.js`

This configures Supabase server client per request and handles cookies properly:

```js
// src/hooks.server.js
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/** 
 * @type {import('@sveltejs/kit').Handle} 
 */
export async function handle({ event, resolve }) {
  // Create Supabase client for this request with cookie management
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      }
    }
  });

  // Helper to get current session from Supabase client
  event.locals.getSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    return session;
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      // Filter headers for Supabase compatibility
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
}
```


### 3. Protect Routes and Access Session

In server load functions (for example, `src/routes/protected/+page.server.js`):

```js
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/login');
  return { session };
}
```


### 4. Use Supabase Client on Client / Auth UI

Create a client-side Supabase client (e.g., `src/lib/supabaseClient.js`):

```js
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
```

Use this client with Supabase's official Auth UI, or your own forms.

### 5. (Optional) Add `app.d.ts` for Types (to aid IDEs)

If you want some types without rewriting your whole app in TS, create `src/app.d.ts`:

```ts
// src/app.d.ts
/// <reference types="@sveltejs/kit" />

declare namespace App {
  interface Locals {
    supabase: import('@supabase/supabase-js').SupabaseClient;
    getSession: () => Promise<import('@supabase/supabase-js').Session | null>;
  }
  // You can add other types as needed here
}
```

This file helps your editor understand the augmented locals without requiring TS in your `.js` files.

### Summary

| Step | Action |
| :-- | :-- |
| Install packages | `npm install @supabase/ssr @supabase/supabase-js` |
| Setup server hook | `src/hooks.server.js` with `createServerClient` and cookie handling |
| Protect routes | Check session in `load` functions, redirect if none |
| Use supabase client on client side | Create client in `src/lib/supabaseClient.js` and use Auth UI or custom components |
| Add minimal type hinting | Optional `src/app.d.ts` for IDE type support |

This is the **most modern and clean setup** using JavaScript, SSR, cookie support, and effective session management in SvelteKit with Supabase authentication using Svelte 5 and the `runes` package ecosystem (if you meant runes as related to the modern Svelte package environment).

If you want, I can also help you with sample Svelte components for login or further integration steps. Would you like that?

<div style="text-align: center">⁂</div>

[^1]: https://docs-451de2d9m-supabase.vercel.app/docs/guides/getting-started/tutorials/with-sveltekit

[^2]: https://supabase.com/docs/guides/auth/server-side/sveltekit

[^3]: https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit

[^4]: https://www.npmjs.com/package/@supabase%2Fauth-helpers-sveltekit

[^5]: https://github.com/j4w8n/sveltekit-supabase-ssr/blob/main/src/hooks.server.ts

[^6]: https://supabase.com/docs/guides/getting-started/quickstarts/sveltekit

[^7]: https://www.reddit.com/r/sveltejs/comments/1eudi9r/supabase_auth_with_sveltekit/

[^8]: https://dev.to/jdgamble555/perfect-local-sveltekit-supabase-setup-in-2025-4adp

[^9]: https://supabase.com/docs/guides/auth/auth-helpers/sveltekit

[^10]: https://github.com/orgs/supabase/discussions/13835

