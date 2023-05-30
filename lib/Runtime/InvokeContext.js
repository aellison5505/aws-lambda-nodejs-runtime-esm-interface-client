/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This module defines the InvokeContext and supporting functions. The
 * InvokeContext is responsible for pulling information from the invoke headers
 * and for wrapping the Runtime Client object's error and response functions.
 */
"use strict";
import { strict as assert } from "assert";
import { INVOKE_HEADER, } from "../Common/index.js";
import LogPatch from "../utils/LogPatch.js";
const setCurrentRequestId = LogPatch.setCurrentRequestId;
export default class InvokeContext {
    headers;
    constructor(headers) {
        this.headers = _enforceLowercaseKeys(headers);
    }
    getHeaderValue(key) {
        const headerVal = this.headers[key];
        switch (typeof headerVal) {
            case "undefined":
                return undefined;
            case "string":
                return headerVal;
            default:
                if (headerVal.length == 0) {
                    return undefined;
                }
                return headerVal[0];
        }
    }
    /**
     * The invokeId for this request.
     */
    get invokeId() {
        const id = this.getHeaderValue(INVOKE_HEADER.AWSRequestId);
        assert.ok(id, "invocation id is missing or invalid");
        return id;
    }
    /**
     * The header data for this request.
     */
    get headerData() {
        return this._headerData();
    }
    /**
     * Push relevant invoke data into the logging context.
     */
    updateLoggingContext() {
        setCurrentRequestId(this.invokeId);
    }
    /**
     * Attach all of the relavant environmental and invocation data to the
     * provided object.
     * This method can throw if the headers are malformed and cannot be parsed.
     * @param callbackContext {Object}
     *   The callbackContext object returned by a call to buildCallbackContext().
     * @return {Object}
     *   The user context object with all required data populated from the headers
     *   and environment variables.
     */
    attachEnvironmentData(callbackContext) {
        this._forwardXRay();
        return Object.assign(callbackContext, this._environmentalData(), this._headerData());
    }
    /**
     * All parts of the user-facing context object which are provided through
     * environment variables.
     */
    _environmentalData() {
        return {
            functionVersion: process.env["AWS_LAMBDA_FUNCTION_VERSION"],
            functionName: process.env["AWS_LAMBDA_FUNCTION_NAME"],
            memoryLimitInMB: process.env["AWS_LAMBDA_FUNCTION_MEMORY_SIZE"],
            logGroupName: process.env["AWS_LAMBDA_LOG_GROUP_NAME"],
            logStreamName: process.env["AWS_LAMBDA_LOG_STREAM_NAME"],
        };
    }
    /**
     * All parts of the user-facing context object which are provided through
     * request headers.
     */
    _headerData() {
        const deadline = parseInt(this.getHeaderValue(INVOKE_HEADER.DeadlineMs) || "");
        return {
            clientContext: _parseJson(this.getHeaderValue(INVOKE_HEADER.ClientContext), "ClientContext"),
            identity: _parseJson(this.getHeaderValue(INVOKE_HEADER.CognitoIdentity), "CognitoIdentity"),
            invokedFunctionArn: this.getHeaderValue(INVOKE_HEADER.ARN),
            awsRequestId: this.getHeaderValue(INVOKE_HEADER.AWSRequestId),
            getRemainingTimeInMillis: function () {
                return deadline - Date.now();
            },
        };
    }
    /**
     * Forward the XRay header into the environment variable.
     */
    _forwardXRay() {
        if (this.getHeaderValue(INVOKE_HEADER.XRayTrace)) {
            process.env["_X_AMZN_TRACE_ID"] = this.getHeaderValue(INVOKE_HEADER.XRayTrace);
        }
        else {
            delete process.env["_X_AMZN_TRACE_ID"];
        }
    }
}
/**
 * Parse a JSON string and throw a readable error if something fails.
 * @param jsonString {string} - the string to attempt to parse
 * @param name {string} - the name to use when describing the string in an error
 * @return object - the parsed object
 * @throws if jsonString cannot be parsed
 */
function _parseJson(jsonString, name) {
    if (jsonString !== undefined) {
        try {
            return JSON.parse(jsonString);
        }
        catch (err) {
            throw new Error(`Cannot parse ${name} as json: ${err.toString()}`);
        }
    }
    else {
        return undefined;
    }
}
/**
 * Construct a copy of an object such that all of its keys are lowercase.
 */
function _enforceLowercaseKeys(original) {
    return Object.keys(original).reduce((enforced, originalKey) => {
        enforced[originalKey.toLowerCase()] = original[originalKey];
        return enforced;
    }, {});
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW52b2tlQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9SdW50aW1lL0ludm9rZUNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsWUFBWSxDQUFDO0FBRWIsT0FBTyxFQUFFLE1BQU0sSUFBSSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFMUMsT0FBTyxFQUlMLGFBQWEsR0FDZCxNQUFNLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sUUFBUSxNQUFNLHNCQUFzQixDQUFDO0FBRTVDLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLG1CQUFtQixDQUFDO0FBRXpELE1BQU0sQ0FBQyxPQUFPLE9BQU8sYUFBYTtJQUNoQyxPQUFPLENBQXNCO0lBRTdCLFlBQVksT0FBNEI7UUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8sY0FBYyxDQUFDLEdBQVc7UUFDaEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVwQyxRQUFRLE9BQU8sU0FBUyxFQUFFO1lBQ3hCLEtBQUssV0FBVztnQkFDZCxPQUFPLFNBQVMsQ0FBQztZQUNuQixLQUFLLFFBQVE7Z0JBQ1gsT0FBTyxTQUFTLENBQUM7WUFDbkI7Z0JBQ0UsSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDekIsT0FBTyxTQUFTLENBQUM7aUJBQ2xCO2dCQUVELE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSSxRQUFRO1FBQ1YsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUscUNBQXFDLENBQUMs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