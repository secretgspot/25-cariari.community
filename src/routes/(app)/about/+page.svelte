<script>
	import Contact from '$lib/Contact.svelte';
	import Divider from '$lib/Divider.svelte';
	import { Button } from '$lib/buttons';

	// let { data } = $props();
</script>

<article class="about-container">
	<h1>About Cariari Community!</h1>
	<p>
		Welcome to our digital home for the Cariari community! We're here to help neighbors
		connect, share information, find local services, keep track of events, and quickly
		reunite lost items with their owners. Our goal is to foster a stronger, more connected
		neighborhood for everyone.
	</p>

	<div id="privacy">
		<Divider>Privacy Policy</Divider>
		<p>
			We value your privacy. This site collects only the information necessary for its
			functions (e.g., your username and content you post). We do not share your personal
			data with third parties.
		</p>
	</div>

	<div id="terms">
		<Divider>Terms of Service</Divider>
		<p>
			By using this site, you agree to treat others with respect and use the platform
			responsibly. Do not post illegal, hateful, or harmful content. We reserve the right
			to remove content or suspend accounts that violate these terms, to ensure a safe and
			positive environment for all community members.
		</p>
	</div>

	<div id="contacts">
		<Divider>Contact Us</Divider>
		<p>Have a question, suggestion, or need assistance? We're here to help!</p>

		<Contact />
	</div>

	<div id="spirit">
		<Divider>Built with Community Spirit!</Divider>
		<p>
			This website is a labor of love, built and maintained by a fellow Cariari community
			member. It's a passion project aimed at serving our neighborhood. If you find this
			platform valuable and wish to support its continued development and maintenance,
			tips are always welcome and greatly appreciated!
		</p>

		<Button href="https://buymeacoffee.com/artbyxyu" external size="small" green>
			{#snippet icon()}
				☕
			{/snippet}
			Tip the Developer
		</Button>
	</div>
</article>

<style>
	.about-container {
		/* Tablets and small laptops (769px - 1024px) */
		@media (min-width: 769px) {
			max-width: 666px;
			justify-self: center;
			margin-block: var(--size-8);
		}
		/* Large desktops and high-resolution screens (1025px and up) */
		@media (min-width: 1025px) {
		}

		h1 {
			place-self: center;
			margin-block-end: var(--size-9);
		}

		p {
			text-align: justify;
		}

		#contacts {
			p {
				/* Small tablets and larger mobile devices (481px - 768px) */
				@media (min-width: 481px) {
					text-align: center;
				}
			}
		}

		#privacy,
		#terms,
		#contacts,
		#spirit {
			scroll-margin-top: var(--size-11);
			margin-block-start: var(--size-9);
		}

		:global(.text-divider) {
			margin-block-end: var(--size-6);
		}

		:global(.small) {
			margin-block-start: var(--size-6);
			width: min-content;
		}
	}
</style>
