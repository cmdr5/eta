export type ResponseType =
  | "arrayBuffer"
  | "blob"
  | "formData"
  | "json"
  | "text";

export type EtaResponse<T = unknown> = Response & { data: T };

export type EtaConfig = {
  baseURL?: string;
  headers?: HeadersInit;
  hooks?: {
    beforeRequest?: ((request: Request) => Promise<void> | void)[];
    afterResponse?: ((response: Response) => Promise<void> | void)[];
  };
  responseType?: ResponseType;
  timeout?: number;
};

type Fn = <T>(
  input: string | URL,
  init?: Omit<RequestInit, "headers"> & {
    headers?:
      | [string, string | undefined][]
      | Record<string, string | undefined>
      | Headers;
    json?: unknown;
    responseType?: ResponseType | undefined;
    timeout?: number | undefined;
  }
) => Promise<EtaResponse<T>>;

export type Eta = Fn & { [K in (typeof methods)[number]]: Fn };

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

const methods = ["get", "post", "put", "delete", "patch", "head"] as const;
const create = (config: EtaConfig = {}) => {
  const eta = (async (input, opts = {}) => {
    const skipTimeout = "timeout" in opts && opts.timeout === undefined;
    const skipDecoding =
      "responseType" in opts && opts.responseType === undefined;

    const { json, responseType, timeout, ...init } = opts;

    const headers = new Headers(config.headers);
    for (const [key, value] of new Headers(init.headers as HeadersInit))
      if (value === "undefined") headers.delete(key);
      else headers.set(key, value);
    init.headers = headers;

    if (config.baseURL) {
      if (typeof input === "string" && input.startsWith("/"))
        throw new Error(
          "`input` must not begin with a slash when using `baseURL`"
        );
      if (!config.baseURL.endsWith("/")) config.baseURL += "/";
      input = new URL(input, config.baseURL);
    }

    if (json !== undefined) {
      if (init.body !== undefined)
        throw new Error("`json` and `body` must not be used together");
      init.body = JSON.stringify(json);
      init.headers.set("content-length", init.body.length.toString());
      init.headers.set(
        "content-type",
        init.headers.get("content-type") ?? "application/json"
      );
    }

    if (!skipTimeout && (config.timeout !== undefined || timeout !== undefined))
      init.signal = AbortSignal.timeout(timeout ?? config.timeout!);

    const request = new Request(input, init as RequestInit);
    for (const hook of config.hooks?.beforeRequest ?? []) await hook(request);
    const response = (await fetch(request)) as EtaResponse;

    if (!skipDecoding && (config.responseType || responseType)) {
      try {
        response.data = await response[responseType ?? config.responseType!]();
      } catch (_) {
        /* empty */
      }
    }

    for (const hook of config.hooks?.afterResponse ?? []) await hook(response);
    if (!response.ok) throw new HTTPError(request, response);

    return response;
  }) as Eta;

  methods.forEach((method) => {
    eta[method] = (input, init) => eta(input, { ...init, method });
  });

  return eta;
};

export default create;
