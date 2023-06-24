export type EtaInput = RequestInfo | URL;

export type EtaRequestInit = Omit<RequestInit, "body"> & {
  timeout?: number;
  responseType?: EtaResponseType;
} & (
    | { json?: unknown; body?: never }
    | { json?: never; body?: BodyInit | null }
  );

export type EtaResponseType =
  | "arrayBuffer"
  | "blob"
  | "formData"
  | "json"
  | "text";

export type EtaResponse = Response & { data?: unknown };

export type EtaConfig = {
  baseURL?: string | URL;
  hooks?: {
    onBeforeRequest?: ((request: Request) => Promise<void> | void)[];
    onAfterResponse?: ((response: Response) => Promise<void> | void)[];
  };
  headers?: HeadersInit;
  timeout?: number;
  responseType?: EtaResponseType;
};

export interface EtaInstance {
  (input: EtaInput, init?: EtaRequestInit): Promise<EtaResponse>;
  get: (input: EtaInput, init?: EtaRequestInit) => Promise<EtaResponse>;
  post: (input: EtaInput, init?: EtaRequestInit) => Promise<EtaResponse>;
  put: (input: EtaInput, init?: EtaRequestInit) => Promise<EtaResponse>;
  delete: (input: EtaInput, init?: EtaRequestInit) => Promise<EtaResponse>;
  patch: (input: EtaInput, init?: EtaRequestInit) => Promise<EtaResponse>;
  head: (input: EtaInput, init?: EtaRequestInit) => Promise<EtaResponse>;
}

export class HTTPError extends Error {
  constructor(public request: Request, public response: EtaResponse) {
    super(
      `Request failed with code \`${response.status}\`${
        response.statusText ? ` and status \`${response.statusText}\`` : ""
      }`
    );
    this.name = "HTTPError";
  }
}

const create = (config: EtaConfig = {}) => {
  const eta = (async (
    input: EtaInput,
    { json, timeout, responseType, ...init }: EtaRequestInit = {}
  ) => {
    if (config.baseURL) {
      if (input instanceof Request)
        throw new TypeError(
          "`input` must be a string or URL when using `baseURL`"
        );
      input = new URL(input, config.baseURL);
    }

    const headers = new Headers(config.headers);
    for (const [key, value] of new Headers(init.headers))
      headers.set(key, value);
    init.headers = headers;

    if (config.timeout !== undefined || timeout !== undefined) {
      init.signal = AbortSignal.timeout(timeout ?? config.timeout!);
    }

    if (json !== undefined) {
      if (init.body !== undefined)
        throw new Error("`json` and `body` cannot be used together");
      init.body = JSON.stringify(json);
      init.headers.set("content-length", init.body.length.toString());
      init.headers.set(
        "content-type",
        init.headers.get("content-type") ?? "application/json"
      );
    }

    const request = new Request(input, init);
    for (const hook of config.hooks?.onBeforeRequest ?? []) await hook(request);
    const response = (await fetch(request)) as EtaResponse;

    if (config.responseType || responseType) {
      try {
        response.data = await response[responseType ?? config.responseType!]();
      } catch (_) {
        /* empty */
      }
    }

    for (const hook of config.hooks?.onAfterResponse ?? [])
      await hook(response);

    if (!response.ok) throw new HTTPError(request, response);
    return response;
  }) as EtaInstance;

  (["get", "post", "put", "delete", "patch", "head"] as const).forEach(
    (method) => {
      eta[method] = (input: EtaInput, init?: EtaRequestInit) =>
        eta(input, { ...init, method });
    }
  );

  return eta;
};

export default create;
