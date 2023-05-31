/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Defines custom error types throwable by the runtime.
 */
"use strict";
import util from "util";
export function isError(obj) {
    return (obj &&
        obj.name &&
        obj.message &&
        obj.stack &&
        typeof obj.name === "string" &&
        typeof obj.message === "string" &&
        typeof obj.stack === "string");
}
/**
 * Attempt to convert an object into a response object.
 * This method accounts for failures when serializing the error object.
 */
export function toRuntimeResponse(error) {
    try {
        if (util.types.isNativeError(error) || isError(error)) {
            if (!error.stack) {
                throw new Error("Error stack is missing.");
            }
            return {
                errorType: error.name,
                errorMessage: error.message,
                trace: error.stack.split("\n") || [],
            };
        }
        else {
            return {
                errorType: typeof error,
                errorMessage: error.toString(),
                trace: [],
            };
        }
    }
    catch (_err) {
        return {
            errorType: "handled",
            errorMessage: "callback called with Error argument, but there was a problem while retrieving one or more of its message, name, and stack",
            trace: [],
        };
    }
}
/**
 * Format an error with the expected properties.
 * For compatability, the error string always starts with a tab.
 */
export const toFormatted = (error) => {
    try {
        return ("\t" + JSON.stringify(error, (_k, v) => _withEnumerableProperties(v)));
    }
    catch (err) {
        return "\t" + JSON.stringify(toRuntimeResponse(error));
    }
};
/**
 * Error name, message, code, and stack are all members of the superclass, which
 * means they aren't enumerable and don't normally show up in JSON.stringify.
 * This method ensures those interesting properties are available along with any
 * user-provided enumerable properties.
 */
function _withEnumerableProperties(error) {
    if (error instanceof Error) {
        const extendedError = error;
        const ret = Object.assign({
            errorType: extendedError.name,
            errorMessage: extendedError.message,
            code: extendedError.code,
        }, extendedError);
        if (typeof extendedError.stack == "string") {
            ret.stack = extendedError.stack.split("\n");
        }
        return ret;
    }
    else {
        return error;
    }
}
export class ExtendedError extends Error {
    code;
    custom;
    reason;
    promise;
    constructor(reason) {
        super(reason); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}
export class ImportModuleError extends ExtendedError {
}
export class HandlerNotFound extends ExtendedError {
}
export class MalformedHandlerName extends ExtendedError {
}
export class UserCodeSyntaxError extends ExtendedError {
}
export class UnhandledPromiseRejection extends ExtendedError {
    constructor(reason, promise) {
        super(reason);
        this.reason = reason;
        this.promise = promise;
    }
}
const errorClasses = [
    ImportModuleError,
    HandlerNotFound,
    MalformedHandlerName,
    UserCodeSyntaxError,
    UnhandledPromiseRejection,
];
errorClasses.forEach((e) => {
    e.prototype.name = `Runtime.${e.name}`;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvRXJyb3JzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHNFQUFzRTtBQUN0RSx1REFBdUQ7QUFDdkQ7Ozs7R0FJRztBQUVILFlBQVksQ0FBQztBQUViLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUV4QixNQUFNLFVBQVUsT0FBTyxDQUFDLEdBQVE7SUFDOUIsT0FBTyxDQUNMLEdBQUc7UUFDSCxHQUFHLENBQUMsSUFBSTtRQUNSLEdBQUcsQ0FBQyxPQUFPO1FBQ1gsR0FBRyxDQUFDLEtBQUs7UUFDVCxPQUFPLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUTtRQUM1QixPQUFPLEdBQUcsQ0FBQyxPQUFPLEtBQUssUUFBUTtRQUMvQixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUM5QixDQUFDO0FBQ0osQ0FBQztBQVFEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxLQUFjO0lBQzlDLElBQUk7UUFDRixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtnQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2FBQzVDO1lBQ0QsT0FBTztnQkFDTCxTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUk7Z0JBQ3JCLFlBQVksRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDM0IsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7YUFDckMsQ0FBQztTQUNIO2FBQU07WUFDTCxPQUFPO2dCQUNMLFNBQVMsRUFBRSxPQUFPLEtBQUs7Z0JBQ3ZCLFlBQVksRUFBRyxLQUFhLENBQUMsUUFBUSxFQUFFO2dCQUN2QyxLQUFL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