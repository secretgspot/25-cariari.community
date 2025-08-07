<!-- src/lib/components/Settings.svelte -->
<script>
    import { button_sounds, button_buzz, navigation_sound, navigation_buzz, notification_sound } from '$lib/stores/settings';
</script>

<fieldset>
    <legend>Site Settings</legend>
    <div class="form-group">
        <input type="checkbox" id="button_sounds" bind:checked={$button_sounds} />
        <label for="button_sounds">Button sound effects</label>
    </div>
    <div class="form-group">
        <input type="checkbox" id="button_buzz" bind:checked={$button_buzz} />
        <label for="button_buzz">Button vibration effects</label>
    </div>
    <div class="form-group">
        <input type="checkbox" id="navigation_sound" bind:checked={$navigation_sound} />
        <label for="navigation_sound">Navigation sound effects</label>
    </div>
    <div class="form-group">
        <input type="checkbox" id="navigation_buzz" bind:checked={$navigation_buzz} />
        <label for="navigation_buzz">Navigation vibration effects</label>
    </div>
    <div class="form-group">
        <input type="checkbox" id="notification_sound" bind:checked={$notification_sound} />
        <label for="notification_sound">Notification sound effects</label>
    </div>
</fieldset>