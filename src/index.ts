import type { JsonValue } from "type-fest";
import { HTTPError } from "./errors/http-error.js";
import type {
  EtaInput,
  EtaInstance,
  EtaOptions,
  EtaResponse
} from "./types/index.js";
import { mergeHeaders, mergeOptions } from "./utils/merge.js";

export const create = (defaults: EtaOptions = {}) => {
  const eta = (async (input: EtaInput, options: EtaOptions = {}) => {
    const { baseURL, data, onBeforeRequest, onAfterResponse, ...init } =
      options;

    if (data !== undefined) {
      if (init.body !== undefined) {
        throw new Error("`json` and `body` cannot be used together");
      }
      init.body = JSON.stringify(data);
      init.headers = mergeHeaders(
        { "content-type": "application/json" },
        init.headers ?? {},
        { "content-length": init.body.length.toString() }
      );
    }

    if (baseURL) {
      if (input instanceof Request) {
        throw new TypeError(
          "`input` must be a string or URL when using `baseURL`"
        );
      }
      input = new URL(input, baseURL);
    }

    const request = new Request(input, init);
    for (const hook of onBeforeRequest ?? []) await hook(request);
    const response = (await fetch(request)) as EtaResponse;

    if (response.headers.get("content-type")?.includes("application/json")) {
      try {
        response.data = (await response.json()) as JsonValue;
      } catch (_) {
        /* empty */
      }
    }

    for (const hook of onAfterResponse ?? []) await hook(response);
    if (!response.ok) throw new HTTPError(request, response, options);
    return response;
  }) as EtaInstance;

  (["get", "post", "put", "delete", "patch", "head"] as const).forEach(
    (method) => {
      eta[method] = (input: EtaInput, options: EtaOptions = {}) =>
        eta(input, mergeOptions(defaults, { ...options, method }));
    }
  );

  return eta;
};

export default create();
