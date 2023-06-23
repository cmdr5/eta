import type { Jsonifiable, JsonValue } from "type-fest";

export type EtaInput = URL | RequestInfo;

export interface EtaResponse extends Response {
  data?: JsonValue;
}

export interface EtaOptions extends RequestInit {
  baseURL?: string | URL;
  data?: Jsonifiable;
  onBeforeRequest?: ((request: Request) => Promise<void> | void)[];
  onAfterResponse?: ((response: EtaResponse) => Promise<void> | void)[];
}

export interface EtaInstance {
  (input: EtaInput, options?: EtaOptions): Promise<EtaResponse>;

  get: (input: EtaInput, options?: EtaOptions) => Promise<EtaResponse>;
  post: (input: EtaInput, options?: EtaOptions) => Promise<EtaResponse>;
  put: (input: EtaInput, options?: EtaOptions) => Promise<EtaResponse>;
  delete: (input: EtaInput, options?: EtaOptions) => Promise<EtaResponse>;
  patch: (input: EtaInput, options?: EtaOptions) => Promise<EtaResponse>;
  head: (input: EtaInput, options?: EtaOptions) => Promise<EtaResponse>;
}
