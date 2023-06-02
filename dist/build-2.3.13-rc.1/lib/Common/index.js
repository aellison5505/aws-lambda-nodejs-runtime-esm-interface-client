/**
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This module defines types, enums and interfaces common to the other modules.
 */
// eslint-disable-next-line no-shadow
export var INVOKE_HEADER;
(function (INVOKE_HEADER) {
    INVOKE_HEADER["ClientContext"] = "lambda-runtime-client-context";
    INVOKE_HEADER["CognitoIdentity"] = "lambda-runtime-cognito-identity";
    INVOKE_HEADER["ARN"] = "lambda-runtime-invoked-function-arn";
    INVOKE_HEADER["AWSRequestId"] = "lambda-runtime-aws-request-id";
    INVOKE_HEADER["DeadlineMs"] = "lambda-runtime-deadline-ms";
    INVOKE_HEADER["XRayTrace"] = "lambda-runtime-trace-id";
})(INVOKE_HEADER || (INVOKE_HEADER = {}));
export function isHandlerFunction(value) {
    return typeof value === "function";
}
