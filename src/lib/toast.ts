import { toast } from '@zerodevx/svelte-toast';
import { ApiError } from './generated/types';

export const success = (m: string) =>
	toast.push(m, {
		theme: {
			'--toastBackground': 'black',
			'--toastColor': 'white',
			'--toastBarBackground': 'olive'
		}
	});

export const warning = (m: string) =>
	toast.push(m, {
		theme: {
			'--toastBackground': 'black',
			'--toastColor': 'white',
			'--toastBarBackground': 'orange'
		}
	});

export const error = (m: string) =>
	toast.push(m, {
		theme: {
			'--toastBackground': 'black',
			'--toastColor': 'white',
			'--toastBarBackground': 'maroon'
		}
	});