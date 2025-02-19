import { AUDIO_API_BASE_URL } from '$lib/constants';
import { Client } from "@gradio/client";

export const getAudioConfig = async (token: string) => {
	let error = null;

	const res = await fetch(`${AUDIO_API_BASE_URL}/config`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

type OpenAIConfigForm = {
	url: string;
	key: string;
	papareo_token: string;
};

export const updateAudioConfig = async (token: string, payload: OpenAIConfigForm) => {
	let error = null;

	const res = await fetch(`${AUDIO_API_BASE_URL}/config/update`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			...payload
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const transcribeAudio = async (token: string, file: File) => {
	const data = new FormData();
	data.append('file', file);

	let error = null;
	const res = await fetch(`${AUDIO_API_BASE_URL}/transcriptions`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			authorization: `Bearer ${token}`
		},
		body: data
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err.detail;
			console.log(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const synthesizeOpenAISpeech = async (
	token: string = '',
	speaker: string = 'alloy',
	text: string = '',
	voice_speed: number = 1
) => {
	let error = null;

	const res = await fetch(`${AUDIO_API_BASE_URL}/speech`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'tts-1',
			input: text,
			voice: speaker
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res;
		})
		.catch((err) => {
			error = err.detail;
			console.log(err);

			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const synthesizePapaReo = async (
	token: string = '',
	speaker: string = 'pita',
	text: string = '',
	voice_speed: number = 1
) => {
	let error = null;



	const client = await Client.connect("https://reo-hou.papareo.io/");
	const result = await client.predict("/synth_haw", {
		text: token,
		speed: voice_speed,
		filter_factor: 0,
	});

	console.log(result.data as unknown[]);
	let data = result.data as unknown[]
	return URL.createObjectURL(data[1] as Blob)

	// const res = await fetch(`https://staging-api.papareo.io/reo/synthesize`, {
	// 	method: 'POST',
	// 	headers: {
	// 		Authorization: `Token ${token}`,
	// 		'Content-Type': 'application/json'
	// 	},
	// 	body: JSON.stringify({
	// 		speed: voice_speed,
	// 		text: text,
	// 		voice_id: speaker,
	// 		response_type: "stream"
	// 	})
	// })
	// 	.then(async (res) => {
	// 		if (!res.ok) throw await res.json();
	// 		return res;
	// 	})
	// 	.catch((err) => {
	// 		error = err.detail;
	// 		console.log(err);

	// 		return null;
	// 	});

	// if (error) {
	// 	throw error;
	// }

	// return res;
};


type PapaReoAPITranscribePayload = {
	transcription: string;
}

export const transcribePapaReo = async (token: string, file: File) => {
	const data = new FormData();
	data.append('audio_file', file);

	let error = null;
	const res = await fetch(`https://staging-api.papareo.io/tuhi/transcribe`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			authorization: `Token ${token}`
		},
		body: data
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			const data = await res.json() as any as PapaReoAPITranscribePayload
			if (data.transcription === '') throw { text: "I couldn't understand you." }
			console.log(data)
			const result = {
				...data,
				text: data.transcription
			};
			return result;
		})
		.catch((err) => {
			error = err.detail;
			console.log(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};