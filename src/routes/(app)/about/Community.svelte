<script>
	import { onMount } from 'svelte';

	let users = $state([]);
	let centerImage = '/logos/logo_basic_gold.svg';
	let imageSize = 36;

	onMount(async () => {
		try {
			const response = await fetch('/api/users');
			if (response.ok) {
				users = await response.json();
			} else {
				console.error('Failed to fetch users:', response.statusText);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
		}
	});

	function calculatePositions(userList, size) {
		if (userList.length === 0) return [];

		const positions = [];
		const radius = size;

		if (userList.length <= 6) {
			for (let i = 0; i < userList.length; i++) {
				const angle = (2 * Math.PI * i) / userList.length;
				positions.push({
					src: userList[i].avatar_url,
					username: userList[i].username, // Add username
					x: radius * Math.cos(angle),
					y: radius * Math.sin(angle),
				});
			}
			return positions;
		}

		let remaining = userList.length;
		let userIndex = 0;
		let ringIndex = 1;

		while (remaining > 0) {
			const ringRadius = radius * ringIndex;
			const usersInRing = Math.min(6 * ringIndex, remaining);

			for (let i = 0; i < usersInRing; i++) {
				const angle = (2 * Math.PI * i) / usersInRing;
				positions.push({
					src: userList[userIndex].avatar_url,
					username: userList[userIndex].username, // Add username
					x: ringRadius * Math.cos(angle),
					y: ringRadius * Math.sin(angle),
				});
				userIndex++;
			}

			remaining -= usersInRing;
			ringIndex++;
		}

		return positions;
	}

	const imagePositions = $derived(calculatePositions(users, imageSize));

	const minSize = imageSize * 6;
	const maxX = $derived(
		imagePositions.length === 0
			? 0
			: Math.max(0, ...imagePositions.map((p) => Math.abs(p.x))),
	);
	const maxY = $derived(
		imagePositions.length === 0
			? 0
			: Math.max(0, ...imagePositions.map((p) => Math.abs(p.y))),
	);

	const containerWidth = $derived(
		imagePositions.length === 0
			? minSize
			: Math.max((maxX + imageSize / 2 + 20) * 2, minSize),
	);
	const containerHeight = $derived(
		imagePositions.length === 0
			? minSize
			: Math.max((maxY + imageSize / 2 + 20) * 2, minSize),
	);
</script>

<div
	class="avatar-container"
	style="width: {containerWidth}px; height: {containerHeight}px;">
	<img
		src={centerImage}
		alt="Center"
		class="avatar center"
		style="width: {imageSize}px; height: {imageSize}px;" />

	{#each imagePositions as image}
		<img
			src={image.src || '/placeholder/avatar.png'}
			alt="Avatar"
			title={image.username}
			class="avatar"
			style="
        width: {imageSize}px;
        height: {imageSize}px;
        left: calc(50% + {image.x}px);
        top: calc(50% + {image.y}px);
      " />
	{/each}
</div>

<style>
	.avatar-container {
		position: relative;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.avatar {
		position: absolute;
		border-radius: 50%;
		transform: translate(-50%, -50%);

		&:hover {
			transform: translate(-50%, -50%) scale(1.1);
		}

		&.center {
			z-index: 5;
			left: 50%;
			top: 50%;
		}
	}
</style>
