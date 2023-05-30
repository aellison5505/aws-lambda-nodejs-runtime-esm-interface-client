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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvQ29tbW9uL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFnQkgscUNBQXFDO0FBQ3JDLE1BQU0sQ0FBTixJQUFZLGFBT1g7QUFQRCxXQUFZLGFBQWE7SUFDdkIsZ0VBQStDLENBQUE7SUFDL0Msb0VBQW1ELENBQUE7SUFDbkQsNERBQTJDLENBQUE7SUFDM0MsK0RBQThDLENBQUE7SUFDOUMsMERBQXlDLENBQUE7SUFDekMsc0RBQXFDLENBQUE7QUFDdkMsQ0FBQyxFQVBXLGFBQWEsS0FBYixhQUFhLFFBT3hCO0FBc0RELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxLQUFjO0lBQzlDLE9BQU8sT0FBTyxLQUFLLEtBQUssVUFBVSxDQUFDO0FBQ3JDLENBQUMifQ==