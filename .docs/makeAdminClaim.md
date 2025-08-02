# Make Claim Admin record in userid

```html
    <form method="POST" action="?/makeAdmin" use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { formMessage = result.data.message; } else if (result.type === 'error') { formMessage = result.data.message; } else if (result.type === 'failure') { formMessage = result.data.message; } update(); }; }} class="temp-admin-form">
      <input type="hidden" name="userId" value={data.user.id} />
      <button type="submit" class="temp-admin-button">Make Admin (Temp)</button>
    </form>
```

```js
// server action
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

 makeAdmin: async ({ request }) => {
  const formData = await request.formData();
  const userId = formData.get('userId');

  if (!SUPABASE_SERVICE_ROLE_KEY) {
   console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
   return fail(500, { message: 'Server configuration error: Supabase service role key is missing.' });
  }

  try {
   const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);


   const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    {
     app_metadata: {
      admin: false
     }
    }
   );

   if (error) {
    console.error('Error updating user claims:', error);
    return fail(500, { message: 'Failed to update user claims: ' + error.message });
   }

   return { success: true, message: 'User claims updated successfully!' };
  } catch (err) {
   console.error('Unexpected error updating user claims:', err);
   return fail(500, { message: 'An unexpected error occurred while updating user claims.' });
  }
 }
```
