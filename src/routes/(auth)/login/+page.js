
/** @type {import('./$types').PageLoad} */
export function load({ url }) {
    const message = url.searchParams.get('message');
    return { message };
}
