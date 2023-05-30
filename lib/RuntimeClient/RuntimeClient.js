/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This module defines the Runtime client which is responsible for all HTTP
 * interactions with the Runtime layer.
 */
"use strict";
const _http = await import("node:http");
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import * as Errors from "../Errors/index.js";
import * as XRayError from "../Errors/XRayError.js";
const ERROR_TYPE_HEADER = "Lambda-Runtime-Function-Error-Type";
function userAgent() {
    const pk = require("../../package.json");
    return `aws-lambda-nodejs/${process.version}-${pk.version}`;
}
/**
 * Objects of this class are responsible for all interactions with the Runtime
 * API.
 */
export default class RuntimeClient {
    agent;
    http;
    nativeClient;
    userAgent;
    useAlternativeClient;
    hostname;
    port;
    constructor(hostnamePort, httpClient, nativeClient) {
        this.http = httpClient || _http;
        this.nativeClient =
            nativeClient || require('../../build/Release/runtime-client.node');
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
    postInvocationResponse(response, id, callback) {
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
    postInitError(error, callback) {
        const response = Errors.toRuntimeResponse(error);
        this._post(`/2018-06-01/runtime/init/error`, response, { [ERROR_TYPE_HEADER]: response.errorType }, callback);
    }
    /**
     * Post an invocation error to the Runtime API
     * @param {Error} error
     * @param {String} id
     *   The invocation ID for the in-progress invocation.
     * @param {function()} callback
     *   The callback to run after the POST response ends
     */
    postInvocationError(error, id, callback) {
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
    async nextInvocation() {
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
    _post(path, body, headers, callback) {
        const bodyString = _trySerializeResponse(body);
        const options = {
            hostname: this.hostname,
            port: this.port,
            path: path,
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json",
                "Content-Length": Buffer.from(bodyString).length,
            }, headers || {}),
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
                .on("data", () => { });
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
function _trySerializeResponse(body) {
    try {
        return JSON.stringify(body === undefined ? null : body);
    }
    catch (err) {
        throw new Error("Unable to stringify response body");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVudGltZUNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9SdW50aW1lQ2xpZW50L1J1bnRpbWVDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFFSCxZQUFZLENBQUM7QUFVYixNQUFNLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN4QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ3ZDLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBSy9DLE9BQU8sS0FBSyxNQUFNLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxLQUFLLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQztBQUVwRCxNQUFNLGlCQUFpQixHQUFHLG9DQUFvQyxDQUFDO0FBMEIvRCxTQUFTLFNBQVM7SUFFaEIsTUFBTSxFQUFFLEdBQUksT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFFekMsT0FBTyxxQkFBcUIsT0FBTyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUQsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sYUFBYTtJQUNoQyxLQUFLLENBQVE7SUFDYixJQUFJLENBQWE7SUFDakIsWUFBWSxDQUFlO0lBQzNCLFNBQVMsQ0FBUztJQUNsQixvQkFBb0IsQ0FBVTtJQUU5QixRQUFRLENBQVM7SUFDakIsSUFBSSxDQUFTO0lBRWIsWUFDRSxZQUFvQixFQUNwQixVQUF1QixFQUN2QixZQUEyQjtRQUUzQixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsSUFBSSxLQUFLLENBQUM7UUFDaEMsSUFBSSxDQUFDLFlBQVk7WUFDZixZQUFZLElBQUksT0FBTyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLFNBQVMsR0FBRyxT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