import type { EtaOptions, EtaResponse } from "../types/index.js";

export class HTTPError extends Error {
  constructor(
    public request: Request,
    public response: EtaResponse,
    public options: EtaOptions
  ) {
    super(
      `Request failed with code \`${response.status}\`${
        response.statusText ? ` and status \`${response.statusText}\`` : ""
      }`
    );
    this.name = "HTTPError";
  }
}
