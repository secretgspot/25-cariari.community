import { redirect } from '@sveltejs/kit';

export const POST = async ({ locals: { supabase }, request }) => {
  console.log('logout/+server.js: POST request received.');
  console.log('logout/+server.js: Cookies BEFORE signOut:', request.headers.get('cookie'));

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('logout/+server.js: Error during signOut:', error);
  } else {
    console.log('logout/+server.js: signOut successful.');
  }

  // After signOut, the cookies should be cleared by Supabase's setAll method in hooks.server.js
  // However, we can't directly inspect the *response* cookies here before the redirect.
  // The next request to '/' will show the updated cookie state in hooks.server.js

  console.log('logout/+server.js: Redirecting to /.');
  throw redirect(303, '/');
};