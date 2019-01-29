# SDK Reference

This SDK can be used by browsers or the Node.js environment. However,
certain methods may only be available in one environment. There will also be
different functional behaviors between the two environments as well.

This document will tag methods, properties or behaviors with `[web]` and
`[node]` to indicate what environment they are available in.

For the convenience, the SDK object will be referred as `kloudless`
through this document.


## Table of contents
* [Core Concepts](#core-concepts)
* [API Request](#api-request)
  * [Request Options](#request-options)
* [kloudless](#kloudless)
* [Account](#account)
* [Response](#response)
* [Resource](#resource)
* [ResourceList](#resourcelist)
* [Binary](#binary)
* [Exception](#exception)


## Core Concepts

- Due to the variety of our API categories, the SDK does not abstract each
  type of resource in the API like most SDKs would do. Instead, the SDK provides
  many utilities and classes to make working with Kloudless API easier.

- Hence, it is highly recommended that you refer to our
  [API documentation](https://developers.kloudless.com/docs/latest/core)
  when using this SDK.
  We also encourage making API requests to our Kloudless service
  directly through http.

- The SDK uses [axios](https://github.com/axios/axios) to make API requests
internally. The options schema is basically the same as axios' schema. **Note
that you have to put "url" and "data" in the config object. e.g. The
`kloudless.post(url[, data[, config]]` alias WILL NOT work**.

- axios utilizes javascript's
  [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
to make http requests, thus this SDK also handled API requests with Promise
whenever possible.


## API Request

The following objects can all make API requests with the folllowing http
methods `get()`, `put()`, `post()`, `patch()`, and `delete()`:
  - [kloudless](#kloudless-kloudless.sdk)
  - [Account](#account)
  - [Response](#response), and all of its sub classes

Each method takes an `options` Object as argument for request URLs and other
request parameters (see below for details).

The returned value is a Promise that will be resolved with a
[Response](#response) object once the request succeeds.
An [Exception](#exception) object is thrown if the request has failed.

### Request Options
- `url`: _Required_: String  
  API endpoint URL, you can omit certain parts of URLs based on which objects
  you are making request with:
  * `Account`: remove 'accounts' and account ID.
    * Example: pass `storage/folders/{folder_id}` for
    `/accounts/{account_id}/storage/folders/{folder_id}`
  * `Response` or its subclasses: anything that is part of `url` property
    * Example: for a `Resource` representing
    `/accounts/{account_id}/cal/calenders/{calendar_id}`,
    you only need to pass `events` for `cal/calendars/{calendar_id}/events`.
  * __DO NOT__ include query params in URL, use `params` option instead.
- `headers`: _Optional_: Object  
  Request headers. Some of common headers used for Kloudless API:
  - [X-Kloudless-Raw-Headers](https://developers.kloudless.com/docs/latest/team#team)
  - [X-Kloudless-Raw-Data](https://developers.kloudless.com/docs/latest/core#api-wide-options)
  - [X-Kloudless-As-User](https://developers.kloudless.com/docs/latest/core#api-wide-options)
  - Authorization:
    _Required_ if you are making request from `kloudless` object.
    _Optional_ for the other objects, as this header will be automatically
    filled.
- `data`: _Optional_: Object  
  Request body, if supported by the request method.
- `params`: _Optional_: Object  
  Query parameters.
- `wrapResponse`: _Optional_: Object  
  If `false`, resolve promise with axios response object instead of a
  `Response` object.
- [Other axios options](https://github.com/axios/axios#request-config):
  _Optional_  
  These options will be passed through axios without any processing from SDK.
  - Note that `baseURL` is overwritten by SDK, to set API server URL or api
    version, use `kloudless.setBaseUrl` and `kloudless.setApiVersion`.


## kloudless

The Main SDK Object, it contains references to all classes provided by the SDK
described below. For example, you can create an account object by
`new kloudless.Account(options)`.

This object will be available at `window.Kloudless.sdk` if the SDK is installed
by using provided script tag in README.

Check the [Installation Guide](README.MD#installation) to see how to import the
main SDK Object.

### Properties
- References to all classes in SDK
- `axios`: The axios instance used to make API requests.  
  The SDK uses this axios instance to make API requests, you can utilize
  axios' [defaults](https://github.com/axios/axios#config-defaults) or
  [interceptors](https://github.com/axios/axios#interceptors) API for your
  needs.
- `version`: _String_: SDK version

### Methods

- `[web]` **connectAccount(options)**  
  Connect an account with OAuth 2.0 Implicit Grant flow.
  - options (Object):
    - `scope`: _Required_: String  
      A string to specify services, api and permissions, check
      [API documentation](https://developers.kloudless.com/docs/v1/authentication#oauth-2.0)
      for string format and examples.
    - `appId`: _Required_: String  
      Your App Id.

- `[node]` **getAuthorizationUrl(options)**  
  Return a URL to connect account with OAuth 2.0 Authorization Code Grant flow,
  you will need to redirect user to the returned URL.
  - options (Object):
    - `scope`: _Required_: String  
      A string to specify services, api and permissions, check
      [API documentation](https://developers.kloudless.com/docs/v1/authentication#oauth-2.0)
      for string format and examples.
    - `appId`: _Required_: String  
      Your App Id.
    - `redirectUri`: _Required_: String  
      The redirect Uri after the user connects an account.
    - `state`: _Optional_: String  
      A string that will be passed as part of callback URL. If not provided,
      the function will generate a random string and include it in
      the returned object.
    - `extraData`: _Optional_: JSON Object  
      Extra data needed for specific services.
    - `params`: _Optional_: Object  
      Query parameters attached to the returned URL.
  - Return value: an object containing `state` and `url`.  
    You will need to record the returned state (e.g. into user session),
    this is needed to retrieve access token in the callback.
    Check `completeAuth` method below for detail.

- `[node]` **completeAuth(options)**  
  Get account's Bearer Token from OAuth callback URL, this method should be
  called in the callback after the user connects an account.
  - options (Object):
    - `appId`: _Required_: String  
        Your App Id.
    - `apiKey`: _Required_: String  
        Your API Key.
    - `redirectUri`: _Required_: String  
        The `redirectUri` passed into `getOAuthUrl` method.
    - `state`: _Required_: String  
        The state string returned by `getOAuthUrl` method.
    - `oauthCallbackUrl`: _Required_: String  
        the callback URL after connecting account sent by browser.
  - Return value: A Promise resolved with the bearer token of the connected
    account.
  - Exception: If the `state` parameter and the state in `requestUri`
  does not match, an exception will be thrown.

- **verifyToken(options)**  
  Verify if the token is valid / belong to this app, recommend to use if the
  token is not acquired from the provided methods above.
  - options (Object):
    - `appId`: _Required_: String  
      Your App Id.
    - `token`: _Required_: String  
      Access token to be verified.
    - `initAccount`: _Optional_: Boolean  
      If set to `true`, a Account object is created and attached to `account` property.
  - Return value: a Promise resolved with an object containing the
      following keys:
      * `valid`: Boolean, the token is valid or not.
      * `error`: String, only provided if the token is not valid. Contains
        reason why the token is not valid.
      * `account`: Account, only available when `initAccount` option is `true`.

- **setBaseUrl(url)**  
  Change API Server URL for all API requests
  - url: _String_: API server Url

- **setApiVersion(version)**  
  Change API Version for all API requests
  - url: _Number_: API version number

- [API Request methods](#api-request)

## Account

An object representing an connected account.

### Properties

- `id`: _String_  
  Account ID
- `token`: _String_  
  - `[web]` Bearer token
  - `[node]` Bearer token or API Key, depends on `tokenType` property
- `tokenType`: _String_  
  - `[web]` always `"Bearer"`
  - `[node]` `"Bearer"` or `"APIKey"`
- `data`: _Object_  
  Details of this account, this will be available once `getDetail()`
  is called, it can also be specified in the constructor.
- `defaults`: _Object_  
  Default options that will be applied to requests made from this object.
  The options passed into http request methods will be deep merged with default
  options (default options have lower priority when there are conflicts).

### Methods

- **constructor(options)**  
  - options (Object):
    - `token`: _String_: Required  
      Account Bearer token
    - `data`: _Object_: Optional  
      Account detail data
    - `[node]` `tokenType`: _String_: Optional  
      Use `"APIKey" if you wish to use api key instead of bearer token,
      otherwise leave this as empty.
    - `[node]` `accountId`: _String_: Optional  
    Account ID. Only required if `tokenType` is `"APIKey"`
- **getDetail()**  
  Retrieve account detail from API, the details will be stored in `data`
  property. You don't need to call this method if the account is created by
  `[web] kloudless.connectAccount()` or
  `[node] kloudless.createAccountFromOAuthCallBack()` as the details are
  already retrieved beforehand.
  - Return value: a Promise resolved after account detail is retrieved.
- **raw(options)**  
  Make pass-through requests.
  - options (Object):
    - Same as [other request options](#request-options)
    - Additional `method`: _String_ is required to specify http method. The
    value should be one of these: "get", "put", "patch", "post", "delete".
  - Return value and exception are the same as
  [other request methods](#api-request), but the resolved value is the
  response object from axios, no Response object will be created for
  pass-through requests.
- **encodeRawId(rawIdData)**  
  Encode Raw ID.
  - rawIdData: _Object_: Required
  The upstream service ID to be encoded.
  - Return value and exception are the same as
  [other request methods](#api-request)
- [API Request methods](#api-request)

## Response

An object to represent any response from Kloudless API

### Properties

- `url`: _String_  
  The url used to make the API Request that returned this response.
- `data`: _Any_  
  Response body. If the response is JSON, it will be converted to object.
- `defaults`: _Object_  
  Default options applied to requests made from this object.
  The options passed into http request methods will be deep merged with default
  options (default options have lower priority when there are conflicts).

- Properties from axios response object (if provided):
  - `status`, `statusText`, `headers`, `config`, `request`

### Methods

- **constructor(options)**  
  - options (Object):
    - `url`: _String_: Required  
      Url used to make this request. This will be the default url when making
      requests from this object.
    - `authorization`: _String_: Required  
      `Authorization` header that will be the default authorization value
      used to make requests from this object.
    - `response`: _Object_: Optional  
      the returned response object from axios.
    - `data`: _Object_: Required if `response` is not presented  
      The response body. Use this option when you want to manually create
      Response objects instead of making API request.
    - `requestOptions`: _Object_: Optional  
      The request options used to get this response.
      This object is used for
      2 purposes, if you're not using these features you don't need to pass
      in this object:
        * Record `params` and `headers` for `refresh()` calls
        * Create `defaults` property for making further requests.
          The created default object will be identical to `requestOptions` but
          with some exceptions:
          * `headers`: only `Authorization`, `X-Kloudless-As-User`, and
            `X-Kloudless-Raw-Data` will be recorded. But all passed in headers
            will still be applied when calling `refresh()`
          * `url`, `data`, `params`: These options are discarded.

- **refresh()**  
  Call `GET ${response.url}` again and update this object's properties
  from response. All headers will be applied as contrast to other request
  methods.
- [API Request methods](#api-request)
  - If the object was created with a request with query params, any
  request made from the object will have those query params applied be default.
  You can still override each query param by using `params` option



## Resource

Subclass of [Response](#response).
An object representing an object with `id` property from API response.

### Properties

- `id`: _String_: Resource ID
- `type`: _String_: Resource Type
- `api`: _String_: API category of the resource


## ResourceList

Subclass of [Response](#response).
An object representing a list of resources from API response.

### Properties
- `api`: _String_
  API category of the resource list.
- `objects`: _[Resource]_
  A list of [Resource](#resource) objects under this resource list.
  Each resource in this list will not have properties from axios response
  since there is no request made for each resource object:
  - `status, statusText, headers, config, request`

### Methods

- **getNextPage()**  
  Get the resources of the next page, if any.
  - Return Value: a Promise resolved with ResourceList object
  representing next page. If the current resource list is already at the last
  page, a ResourceList object with empty `objects` list will be used as resolve
  value. The next page will use the same `page_size` query param to make the
  request.

- **iterate(options)**  
  Iterate through all resources under this resource list and all
  resources in the following pages, if any.
  - options (Object):
    - `callback`: _Function_: Required  
    A function with the first argument as the  Resource object. It will be
    called for every resource in the list and in the following pages, if any.
    - `maxResources`: _Number_: Optional  
    Max number of resources you would like to visit. If not provided, all
    resources will be visited.
  - Return value: A Promise resolved once all resources or max number of
  resources have been iterated through.
  The first argument of the resolve function is a boolean
  flag `hasRemainResources`. If true, there are resources not been visited yet
  due to reaching maxResources limitation, you would need to call `iterate`
  again to continue iterating through the rest of resources.

- **resetIterateIndex()**  
  Let _iterate()_ function go back to the first resource in this resource
  list object, used to reset iteration progress when you'd like to do it from
  the beginning again.


## Binary

Subclass of [Response](#response).
An object representing binary files from API response.

### Properties

- `data`:
  - `[web]`: The binary content
  - `[node]`: A readable Stream object passed from axios

### Methods

- `[web]` **getBlobUrl()**  
  Create blob url from `data` property and return blob url. Internally the blob
  URL is created by using
  [URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL).

- `[web]` **removeBlobUrl()**  
  Revoke the reference to this blob url to release the reference to the blob.
  Call this method when you no longer need the blob url. Internally the blob
  url is revoked by using
  [URL.revokeObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL).

  - See
  [URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
  and
  [URL.revokeObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL) for
  more information regarding to blob url.

- `[web]` **download(filename)**  
  Prompt browser dialog to download the binary. It will call `getBlobUrl` first
  if the blob url is not created yet. **Remember to call `removeBlobUrl` when
  you no longer need download url for this resource.**
  - `filename`: _String_: Optional  
    Default filename when prompting download, will be `"binary"` if not
    provided.


## Exception

Subclass of global [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) class.
An object representing any API response that is not 2XX status, or there is no
response from API, or if there is an error before making API request.

### Properties
- Properties from axios error object
  - `request`, `response`, `config`
  - `message` property only if axios throw an error before making a request.
- `message`: _String_
  1. If there is a response and `message` field is presented in response body,
  this field is used.
  2. If the response does not have `message` field, `response.status_text` is
  used.
  3. If the request is made but there is no response from API, the message will
  be `"There is no response from API Server"`
  4. If the exception was thrown before sending a request, the `message`
  property from axios error object is used.
message || this.response.statusText
- `statusCode`: _Number_ or _undefined_
  1. If there is a response and `status_code` field in the response body, this
  field is used.
  2. If there is a response but `status_code` field is not in response body,
  `response.status` is used.
  3. `undefined` if there is not response or the exception was thrown before
  making a request.
- `errorCode`: _String_ or _null_ or _undefined_
  1. If there is a response and `error_code` field in the response body, this
  field is used.
  2. If there is a response but `error_code` field is not in response body,
  `null` is used.
  3. `undefined` if there is not response or the exception was thrown before
  making a request.
