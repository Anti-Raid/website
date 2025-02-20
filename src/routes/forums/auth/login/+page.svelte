<script lang="ts">
	import { initializeApp } from 'firebase/app';
	import {
		getAuth,
		getIdToken,
		signInWithEmailAndPassword,
		sendPasswordResetEmail,
		createUserWithEmailAndPassword,
		type UserCredential,
		setPersistence,
		browserLocalPersistence
	} from 'firebase/auth';
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';
	import Swal from 'sweetalert2';
	import Modal from '@components/Modal.svelte';
	import Breadcrumb from '@components/Breadcrumb.svelte';
	import Meta from '@components/Meta.svelte';

	const API_URL =
		PUBLIC_ENVIRONMENT === 'production' ? 'https://potsypaw.purrquinox.com' : 'http://localhost:5590';

	const auth = getAuth(
		initializeApp({
			apiKey: 'AIzaSyCo52oK3v250G95yxGcvrcwkinY4EZdYP4',
			authDomain: 'antiraid-forums.firebaseapp.com',
			projectId: 'antiraid-forums',
			storageBucket: 'antiraid-forums.appspot.com',
			messagingSenderId: '951021197906',
			appId: '1:951021197906:web:4130474b132ffceb1add8b'
		})
	);

	// auth shit
	let username: string = '';
	let email: string = '';
	let password: string = '';
	let apitoken: string = '';

	let ModalOpened: boolean = false;
	let UsernameAvailable: boolean | null = null;

	const handleModalClose = () => {
		ModalOpened = false;
	};

	const checkUsernameAvailability = async () => {
		const check = await fetch(`${API_URL}/validate/username?tag=${username}`)
			.then(async (res: Response) => await res.json())
			.catch(() => {
				return;
			});

		if (check.exists === true) UsernameAvailable = false;
		else if (check.exists === false) UsernameAvailable = true;
	};

	const finishAccountCreation = async () => {
		const firebaseUser = auth.currentUser;

		if (UsernameAvailable === true) {
			if (firebaseUser) {
				const ree = await fetch(`${API_URL}/auth/signup?uid=${firebaseUser.uid}&tag=${username}`, {
					headers: {
						'Content-Type': 'application/json',
						Authorization: await firebaseUser.getIdToken(true)
					}
				})
					.then(async (res: Response) => await res.json())
					.catch(() => {
						return;
					});

				if (ree) {
					if (!ree.error) window.location.href = `/forums/auth/callback?token=${apitoken}`;
					else return Swal.fire('Error', ree.message, 'error');
				} else return Swal.fire('Error', 'Server did not respond.', 'error');
			} else return Swal.fire(`Error`, 'You are not logged in.', 'error');
		} else
			return Swal.fire(
				`Error`,
				'The username you have provided is not available. Please make a new one.',
				'error'
			);
	};

	const callback = (userCredential: UserCredential) => {
		getIdToken(userCredential.user, true)
			.then(async (idToken) => {
				const user = await fetch(`${API_URL}/auth/callback`, {
					headers: {
						'Content-Type': 'application/json',
						Authorization: idToken
					}
				})
					.then(async (res: Response) => await res.json())
					.catch(() => {
						return;
					});

				if (user) {
					if (!user.error) window.location.href = `/forums/auth/callback?token=${user.token}`;
					else if (user.message === 'User does not exist.') {
						ModalOpened = true;
						apitoken = user.token;
					} else return Swal.fire('Error', user.message, 'error');
				}
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;

				return Swal.fire(`Error ${errorCode}`, errorMessage, 'error');
			});
	};

	const login = () => {
		if (email === '' || password === '')
			return Swal.fire(
				'Error:',
				'One of the fields provided down below are empty. Please ensure that they are filled.',
				'error'
			);

		setPersistence(auth, browserLocalPersistence)
			.then(() => {
				signInWithEmailAndPassword(auth, email, password)
					.then(callback)
					.catch((error) => {
						const errorCode = error.code;
						const errorMessage = error.message;

						return Swal.fire(`Error ${errorCode}`, errorMessage, 'error');
					});
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;

				return Swal.fire(`Error ${errorCode}`, errorMessage, 'error');
			});
	};

	const signup = () => {
		if (email === '' || password === '')
			return Swal.fire(
				'Error:',
				'One of the fields provided down below are empty. Please ensure that they are filled.',
				'error'
			);

		setPersistence(auth, browserLocalPersistence)
			.then(() => {
				createUserWithEmailAndPassword(auth, email, password)
					.then(callback)
					.catch((error) => {
						const errorCode = error.code;
						const errorMessage = error.message;

						return Swal.fire(`Error ${errorCode}`, errorMessage, 'error');
					});
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;

				return Swal.fire(`Error ${errorCode}`, errorMessage, 'error');
			});
	};

	const forgotpasswd = () => {
		if (email === '')
			return Swal.fire(
				'Error:',
				'The "email" field is empty. Please ensure that all fields are filled.',
				'error'
			);

		sendPasswordResetEmail(auth, email)
			.then(() => {
				return Swal.fire(
					'Password Reset',
					'We have sent an email to the address provided. Please visit the link provided to reset your password.',
					'success'
				);
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;

				return Swal.fire(`Error ${errorCode}`, errorMessage, 'error');
			});
	};
</script>

<Meta
	title="Login - AntiRaid Forums"
	description="Login into your AntiRaid Forums account to unlock more features!"
/>

<Breadcrumb
	Title="Login"
	Description="Oh, hello there. By logging into AntiRaid Forums, you can access even more AntiRaid Forums features. By continuing, you agree to our <a class='underline' href='/legal/terms'>Terms of Service</a> and
	<a class='underline' href='/legal/privacy'>Privacy Policy</a>. We hope you enjoy your experience here!"
/>

<div class="flex min-h-full flex-col justify-center px-2 py-5">
	<div class="mt-2 sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="space-y-6">
			<div>
				<label for="email" class="block text-sm font-bold leading-6 text-white">Email address</label
				>
				<div class="mt-2">
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						placeholder="Email Address"
						bind:value={email}
						required
						class="block w-full font-monster tracking-tight bg-primary-500 text-white font-semibold rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-primary-400 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-surface-400 sm:text-sm sm:leading-6"
					/>
				</div>
			</div>

			<div>
				<div class="flex items-center justify-between">
					<label for="password" class="block text-sm font-bold leading-6 text-white">Password</label
					>
					<div class="text-sm">
						<button
							on:click={forgotpasswd}
							type="button"
							class="font-bold text-white/75 hover:text-white/95">Forgot password?</button
						>
					</div>
				</div>
				<div class="mt-2">
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						placeholder="Password"
						bind:value={password}
						required
						class="block w-full font-monster tracking-tight bg-primary-500 text-white font-semibold rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-primary-400 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-surface-400 sm:text-sm sm:leading-6"
					/>
				</div>
			</div>

			<div class="flex justify-center">
				<button
					type="button"
					class="flex justify-center w-half rounded-md bg-primary-400/75 text-white px-3 py-1.5 text-sm font-bold leading-6 shadow-sm hover:bg-surface-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-600"
					on:click={login}>Login</button
				>

				<button
					type="button"
					class="flex ml-2 justify-center w-half rounded-md bg-primary-400/75 text-white px-3 py-1.5 text-sm font-bold leading-6 shadow-sm hover:bg-surface-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-600"
					on:click={signup}>Register</button
				>
			</div>
		</form>
	</div>
</div>

<Modal
	title="Account Creation"
	logo="/logo.webp"
	showModal={ModalOpened}
	on:close={handleModalClose}
>
	<p class="text-base font-bold text-white">
		To finish creating your account, you need to create a Username.
	</p>
	<div class="p-2" />

	<label for="password" class="block text-sm font-bold leading-6 text-white">Username</label>
	<input
		id="username"
		name="username"
		type="text"
		placeholder="Username"
		bind:value={username}
		on:input={checkUsernameAvailability}
		required
		class="block w-full rounded-md border-0 py-1.5 text-black font-monster font-semibold shadow-sm ring-1 ring-inset ring-gray-900 placeholder:text-gray-900 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
	/>

	{#if UsernameAvailable != null}
		<p class="text-base font-bold {UsernameAvailable ? 'text-green-600' : 'text-red-600'}">
			<i class="mt-1 ml-1 fa-solid {UsernameAvailable ? 'fa-check' : 'fa-xmark'}" />
			{UsernameAvailable ? 'Username Available' : 'Username not Available'}
		</p>
	{/if}

	<div class="p-2" />

	<button
		type="button"
		class="flex justify-center w-half rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
		on:click={finishAccountCreation}>Finish Account Creation</button
	>
</Modal>
