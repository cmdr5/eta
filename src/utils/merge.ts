import deepmerge from "deepmerge";
import type { EtaOptions } from "../types/index.js";

export const mergeHeaders = (...sources: HeadersInit[]) => {
  const result = new Headers();
  for (const source of sources) {
    for (const [key, value] of new Headers(source).entries())
      result.set(key, value);
  }
  return result;
};

export const mergeOptions = (
  { headers: _headers, ...a }: EtaOptions,
  { headers, ...b }: EtaOptions
) => {
  const result = deepmerge(a, b) as EtaOptions;
  if (_headers || headers) {
    result.headers = mergeHeaders(_headers ?? {}, headers ?? {});
  }
  return result;
};
