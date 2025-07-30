<script>
    import { createEventDispatcher } from 'svelte';
    import Button from '$lib/buttons/Button.svelte';

    const dispatch = createEventDispatcher();

    let title = '';
    let description = '';
    let urgency = 'Default'; // Default value
    let startDate = '';
    let endDate = '';
    let loading = false;
    let error = null;
    let success = false;

    const urgencyOptions = ['Default', 'Low', 'Medium', 'High'];

    async function handleSubmit() {
        loading = true;
        error = null;
        success = false;

        const newNotice = {
            title,
            description,
            urgency,
            start_date: startDate || null, // Send null if empty
            end_date: endDate || null,     // Send null if empty
        };

        try {
            const response = await fetch('/api/notices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNotice),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to add notice.');
            }

            const result = await response.json();
            success = true;
            dispatch('noticeAdded', result.notice); // Dispatch event on success
            // Optionally clear form
            title = '';
            description = '';
            urgency = 'Default';
            startDate = '';
            endDate = '';

        } catch (e) {
            error = e.message;
            console.error('Error adding notice:', e);
        } finally {
            loading = false;
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4 p-4 border rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Add New Notice</h2>

    <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input
            type="text"
            id="title"
            bind:value={title}
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
    </div>

    <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Description (supports Markdown)</label>
        <textarea
            id="description"
            bind:value={description}
            required
            rows="5"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        ></textarea>
    </div>

    <div>
        <label for="urgency" class="block text-sm font-medium text-gray-700">Urgency</label>
        <select
            id="urgency"
            bind:value={urgency}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        >
            {#each urgencyOptions as option}
                <option value={option}>{option}</option>
            {/each}
        </select>
    </div>

    <div>
        <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date (Optional)</label>
        <input
            type="date"
            id="startDate"
            bind:value={startDate}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
    </div>

    <div>
        <label for="endDate" class="block text-sm font-medium text-gray-700">End Date (Optional)</label>
        <input
            type="date"
            id="endDate"
            bind:value={endDate}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
    </div>

    {#if error}
        <p class="text-red-500 text-sm">{error}</p>
    {/if}

    {#if success}
        <p class="text-green-500 text-sm">Notice added successfully!</p>
    {/if}

    <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Notice'}
    </Button>
</form>
