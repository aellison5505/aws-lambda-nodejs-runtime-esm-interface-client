/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This module defines the Runtime client which is responsible for all HTTP
 * interactions with the Runtime layer.
 */

"use strict";

import {
  Agent,
  RequestOptions,
  IncomingMessage,
  ClientRequest,
  OutgoingHttpHeaders,
} from "http";

const _http = await import("node:http");
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { URL } from "url";

import { InvocationResponse, NativeClient } from "../Common/index.js";
import * as Errors from "../Errors/index.js";
import * as XRayError from "../Errors/XRayError.js";

const ERROR_TYPE_HEADER = "Lambda-Runtime-Function-Error-Type";

interface HttpModule {
  Agent: typeof Agent;
  request(
    options: RequestOptions | string | URL,
    callback?: (res: IncomingMessage) => void
  ): ClientRequest;
}

export interface IRuntimeClient {
  nextInvocation: () => Promise<InvocationResponse>;

  postInvocationError: (
    error: unknown,
    id: string,
    callback: () => void
  ) => void;

  postInvocationResponse: (
    response: unknown,
    id: string,
    callback: () => void
  ) => void;
}

function userAgent(): string {
  const pk = require("../../package.json");

  return `aws-lambda-nodejs/${process.version}-${pk.version}`;
}

/**
 * Objects of this class are responsible for all interactions with the Runtime
 * API.
 */
export default class RuntimeClient implements IRuntimeClient {
  agent: Agent;
  http: HttpModule;
  nativeClient: NativeClient;
  userAgent: string;
  useAlternativeClient: boolean;

  hostname: string;
  port: number;

  constructor(
    hostnamePort: string,
    httpClient?: HttpModule,
    nativeClient?: NativeClient
  ) {
    this.http = httpClient || _http;
    this.nativeClient =
      nativeClient || require("../../build/Release/runtime-client.node");
    this.userAgent = userAgent();
    this.nativeClient.initializeClient(this.userAgent);
    this.useAlternativeClient =
      process.env["AWS_LAMBDA_NODEJS_USE_ALTERNATIVE_CLIENT_1"] === "true";

    const [hostname, port] = hostnamePort.split(":");
    this.hostname = hostname;
    this.port = parseInt(port, 10);
    this.agent = new this.http.Agent({
      keepAlive: true,
      maxSockets: 1,
    });
  }

  /**
   * Complete and invocation with the provided response.
   * @param {Object} response
   *   An arbitrary object to convert to JSON and send back as as response.
   * @param {String} id
   *   The invocation ID.
   * @param {function()} callback
   *   The callback to run after the POST response ends
   */
  postInvocationResponse(
    response: unknown,
    id: string,
    callback: () => void
  ): void {
    const bodyString = _trySerializeResponse(response);
    this.nativeClient.done(id, bodyString);
    callback();
  }

  /**
   * Post an initialization error to the Runtime API.
   * @param {Error} error
   * @param {function()} callback
   *   The callback to run after the POST response ends
   */
  postInitError(error: unknown, callback: () => void): void {
    const response = Errors.toRuntimeResponse(error);
    this._post(
      `/2018-06-01/runtime/init/error`,
      response,
      { [ERROR_TYPE_HEADER]: response.errorType },
      callback
    );
  }

  /**
   * Post an invocation error to the Runtime API
   * @param {Error} error
   * @param {String} id
   *   The invocation ID for the in-progress invocation.
   * @param {function()} callback
   *   The callback to run after the POST response ends
   */
  postInvocationError(error: unknown, id: string, callback: () => void): void {
    const response = Errors.toRuntimeResponse(error);
    const bodyString = _trySerializeResponse(response);
    const xrayString = XRayError.toFormatted(error);
    this.nativeClient.error(id, bodyString, xrayString);
    callback();
  }

  /**
   * Get the next invocation.
   * @return {PromiseLike.<Object>}
   *   A promise which resolves to an invocation object that contains the body
   *   as json and the header array. e.g. {bodyJson, headers}
   */
  async nextInvocation(): Promise<InvocationResponse> {
    if (this.useAlternativeClient) {
      const options = {
        hostname: this.hostname,
        port: this.port,
        path: "/2018-06-01/runtime/invocation/next",
        method: "GET",
        agent: this.agent,
        headers: {
          "User-Agent": this.userAgent,
        },
      };
      return new Promise((resolve, reject) => {
        const request = this.http.request(options, (response) => {
          let data = "";
          response
            .setEncoding("utf-8")
            .on("data", (chunk) => {
              data += chunk;
            })
            .on("end", () => {
              resolve({
                bodyJson: data,
                headers: response.headers,
              });
            });
        });
        request
          .on("error", (e) => {
            reject(e);
          })
          .end();
      });
    }

    return this.nativeClient.next();
  }

  /**
   * HTTP Post to a path.
   * @param {String} path
   * @param {Object} body
   *   The body is serialized into JSON before posting.
   * @param {Object} headers
   *   The http headers
   * @param {function()} callback
   *   The callback to run after the POST response ends
   */
  _post(
    path: string,
    body: unknown,
    headers: OutgoingHttpHeaders,
    callback: () => void
  ): void {
    const bodyString = _trySerializeResponse(body);
    const options: RequestOptions = {
      hostname: this.hostname,
      port: this.port,
      path: path,
      method: "POST",
      headers: Object.assign(
        {
          "Content-Type": "application/json",
          "Content-Length": Buffer.from(bodyString).length,
        },
        headers || {}
      ),
      agent: this.agent,
    };
    const request = this.http.request(options, (response) => {
      response
        .on("end", () => {
          callback();
        })
        .on("error", (e) => {
          throw e;
        })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .on("data", () => {});
    });
    request
      .on("error", (e) => {
        throw e;
      })
      .end(bodyString, "utf-8");
  }
}

/**
 * Attempt to serialize an object as json. Capture the failure if it occurs and
 * throw one that's known to be serializable.
 */
function _trySerializeResponse(body: unknown): string {
  try {
    return JSON.stringify(body === undefined ? null : body);
  } catch (err) {
    throw new Error("Unable to stringify response body");
  }
}
