
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	register: async ({ request, locals: { supabase } }) => {
		const body = Object.fromEntries(await request.formData());

        if (body.password !== body.passwordConfirm) {
            return fail(400, {
                error: 'Passwords do not match',
                values: {
                    email: body.email
                }
            });
        }

		const { error: err } = await supabase.auth.signUp({
			email: body.email,
			password: body.password
		});

		if (err) {
			if (err instanceof AuthApiError && err.status >= 400 && err.status < 500) {
				return fail(400, {
					error: 'Invalid credentials',
					values: {
						email: body.email
					}
				});
			}
			return fail(500, {
				error: 'Server error. Please try again later.',
				values: {
					email: body.email
				}
			});
		}

		throw redirect(303, '/');
	}
};
