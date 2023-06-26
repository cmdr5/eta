# @cmdr5/eta

> A tiny wrapper around Fetch API to make life easier.

## Install

```sh
npm install @cmdr5/eta
```

## Usage

1. Import the `create` function from the Eta library:

```js
import create from "@cmdr5/eta";
```

2. Create an instance of Eta with optional configuration:

```js
const eta = create({
  baseURL: "https://api.example.com",
  headers: {
    Authorization: "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
  },
  responseType: "json",
  timeout: 5000
});
```

3. Make HTTP requests using the available methods (`get`, `post`, `put`, `delete`, `patch`, `head`):

```js
eta
  .get("/users")
  .then(({ data }) => {
    console.log(data); // Process the response data
  })
  .catch((error) => {
    console.error(error); // Handle errors
  });
```

## API

### `create(config?: EtaConfig): Eta`

Creates an instance of Eta with optional configuration.

- `config` (optional): Configuration options for the Eta instance. It can contain the following properties:
  - `baseURL` (optional): The base URL for all requests. If provided, relative URLs passed to the methods will be resolved against this URL.
  - `headers` (optional): Additional headers to include in all requests. It can be an object, an array of key-value pairs, or a `Headers` object.
  - `hooks` (optional): Request and response hooks to modify requests and process responses. It should be an object with the following optional properties:
    - `beforeRequest` (optional): An array of functions to be executed before sending the request. Each function receives the `Request` object and can modify it or perform additional actions.
    - `afterResponse` (optional): An array of functions to be executed after receiving the response. Each function receives the `EtaResponse` object and can modify it or perform additional actions.
  - `responseType` (optional): The desired response type for all requests. It can be one of the following values: `arrayBuffer`, `blob`, `formData`, `json`, or `text`.
  - `timeout` (optional): The timeout duration in milliseconds for all requests. If a request exceeds this timeout, it will be aborted.

### `eta(input: string | URL, init?: RequestOptions): Promise<EtaResponse<T>>`

Sends an HTTP request using the specified method and returns a promise that resolves to the response.

- `input`: The URL or path of the resource to request. If a relative path is provided and a `baseURL` is set in the configuration, the path will be resolved against the `baseURL`.
- `init` (optional): Additional request options. It can contain the following properties:
  - `headers` (optional): Additional headers to include in the request. It can be an object, an array of key-value pairs, or a `Headers` object.
  - `json` (optional): A JSON payload to include in the request body. This property should not be used together with the `body` property.
  - `responseType` (optional): The desired response type for this request. It overrides the `responseType` set in the configuration.
  - `timeout` (optional): The timeout duration in milliseconds for this request. If not specified, the `timeout` value set in the configuration will be used.

### `eta.<method>(input: string | URL, init?: RequestOptions): Promise<EtaResponse<T>>`

Shortcut methods for common HTTP methods: `get`, `post`, `put`, `delete`, `patch`, and `head`. These methods have the same signature as the `eta` function.

### `EtaResponse<T>`

An extended `Response` object that includes a `data` property representing the parsed response body.

### `HTTPError`

An error class that extends the base `Error` class. It is thrown when an HTTP request fails, indicating the status code and status text of the response.

## License

This library is released under the [MIT License](LICENSE).
