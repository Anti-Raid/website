import { get } from '../configs/functions/services';
import { fetchClient } from '../fetch/fetch';
import { User } from '../generated/types';
import logger from '../ui/logger';

let cachedUserValue: User | null = null;

export const getUser = async (userId: string) => {
	if (cachedUserValue) {
		return cachedUserValue;
	}

	const res = await fetchClient(`${get('splashtail')}/users/${userId}`);

	if (!res.ok && userId) {
		logger.error('Auth', 'Could not find user perm information from API');
		return;
	}

	let userData: User = await res.json();

	logger.info('Layout', 'Got user information from API', userData);

	cachedUserValue = userData;

	return userData;
};
