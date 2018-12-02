// @flow
import axios from "axios";
import config from "../config.json";
import type {Api, FetchKittiesParams, FetchKittyParams, Kitty} from "./types";

const url = "http://thecatapi.com";

class ApiIml implements Api {
	+fetchRandomKitty = params => {
		const r = this.fetchKitties({...params, count: 1});
		return {
			cancel: r.cancel,
			promise: r.promise.then(response =>
				Array.isArray(response) ? response[0] : response
			)
		};
	};

	+fetchKitty = kittyId => {
		const r = requestGet({
			url: `${url}/api/images/get`,
			params: {
				format: "json",
				size: "med",
				image_id: kittyId
			}
		});

		return {
			cancel: r.cancel,
			promise: r.promise.then(r => r.response.data)
		};
	};

	fetchKitties = params => {
		const r = requestGet({
			url: `${url}/api/images/get`,
			params: {
				format: "json",
				type: params.type === "gif" ? "gif" : "png,jpg",
				size: "med",
				results_per_page: params.count
			}
		});

		return {
			cancel: r.cancel,
			promise: r.promise.then(r => r.data)
		};
	};

	voteKitty = params => {
		const r = requestGet({
			url: `${url}/api/images/vote`,
			params: {
				image_id: params.kittyId,
				score: params.score
			}
		});

		return {
			cancel: r.cancel,
			promise: r.promise.then(r => r.data)
		};
	};

	getVotes = () => {
		const r = requestGet({
			url: `${url}/api/images/getvotes`,
			params: {
				api_key: config.api_key
			}
		});

		return {
			cancel: r.cancel,
			promise: r.promise.then(r => r.data)
		};
	};
}

type Response = {data: string};

type CancelPromise = {
	cancel: (reason?: string) => void,
	promise: Promise<Response>
};

axios.interceptors.request.use(data => {
	console.log({data});
	return data;
});

const requestGet = <T>(data: {url: string, params: {}}): CancelPromise => {
	const cancelSource = axios.CancelToken.source();

	const request = {
		method: "get",
		url: data.url,
		params: {
			...data.params,
			api_key: config.api_key
		},
		cancelToken: cancelSource.token
	};

	const promise: Promise<{data: string}> = axios(request);

	return {
		promise,
		cancel: cancelSource.cancel
	};
};

const api: Api = new ApiIml();

export default api;
