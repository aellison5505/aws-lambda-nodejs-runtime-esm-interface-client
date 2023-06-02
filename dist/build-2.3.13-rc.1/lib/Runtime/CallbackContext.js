/* eslint-disable no-console */
/** Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved. */
"use strict";
import BeforeExitListener from "./BeforeExitListener.js";
import * as Errors from "../Errors/XRayError.js";
/**
 * Construct the base-context object which includes the required flags and
 * callback methods for the Node programming model.
 *
 * @param client {Client}
 *   The Runtime client used to post results/errors.
 * @param id {string}
 *   The invokeId for the current invocation.
 * @param scheduleNext {function}
 *   A function which takes no params and immediately schedules the next
 *   iteration of the invoke loop.
 * @returns [callback, context]
 *   The same function and context object, but wrapped such that only the
 *   first call to any function will be successful. All subsequent calls are
 *   a no-op.
 */
export const build = function (client, id, scheduleNext) {
    const [callback, context] = _rawCallbackContext(client, id, scheduleNext);
    return _wrappedCallbackContext(callback, context);
};
function _homogeneousError(err) {
    if (err instanceof Error) {
        return err;
    }
    else {
        return new Error(err);
    }
}
/**
 * Build the callback function and the part of the context which exposes
 * the succeed/fail/done callbacks.
 * @param client {Client}
 *   The Runtime client used to post results/errors.
 * @param id {string}
 *   The invokeId for the current invocation.
 * @param scheduleNext {function}
 *   A function which takes no params and immediately schedules the next
 *   iteration of the invoke loop.
 */
function _rawCallbackContext(client, id, scheduleNext) {
    const postError = (err, callback) => {
        const homogeneousError = _homogeneousError(err);
        console.error("Invoke Error", Errors.toFormatted(homogeneousError));
        client.postInvocationError(err, id, callback);
    };
    const complete = (result, callback) => {
        client.postInvocationResponse(result, id, callback);
    };
    let waitForEmptyEventLoop = true;
    const callback = (err, result) => {
        BeforeExitListener.reset();
        if (err !== undefined && err !== null) {
            postError(err, scheduleNext);
        }
        else {
            complete(result, () => {
                if (!waitForEmptyEventLoop) {
                    scheduleNext();
                }
                else {
                    BeforeExitListener.set(scheduleNext);
                }
            });
        }
    };
    const done = (err, result) => {
        BeforeExitListener.reset();
        if (err !== undefined && err !== null) {
            postError(err, scheduleNext);
        }
        else {
            complete(result, scheduleNext);
        }
    };
    const succeed = (result) => {
        done(null, result);
    };
    const fail = (err) => {
        if (err === undefined || err === null) {
            done("handled");
        }
        else {
            done(err);
        }
    };
    const callbackContext = {
        get callbackWaitsForEmptyEventLoop() {
            return waitForEmptyEventLoop;
        },
        set callbackWaitsForEmptyEventLoop(value) {
            waitForEmptyEventLoop = value;
        },
        succeed,
        fail,
        done,
    };
    return [callback, callbackContext];
}
/**
 * Wraps the callback and context so that only the first call to any callback
 * succeeds.
 * @param callback {function}
 *   the node-style callback function that was previously generated but not
 *   yet wrapped.
 * @param callbackContext {object}
 *   The previously generated callbackContext object that contains
 *   getter/setters for the contextWaitsForEmptyeventLoop flag and the
 *   succeed/fail/done functions.
 * @return [callback, context]
 */
function _wrappedCallbackContext(callback, callbackContext) {
    let finished = false;
    // eslint-disable-next-line @typescript-eslint/ban-types
    const onlyAllowFirstCall = function (toWrap) {
        return function (...args) {
            if (!finished) {
                // eslint-disable-next-line prefer-spread
                toWrap.apply(null, args);
                finished = true;
            }
        };
    };
    callbackContext.succeed = onlyAllowFirstCall(callbackContext.succeed);
    callbackContext.fail = onlyAllowFirstCall(callbackContext.fail);
    callbackContext.done = onlyAllowFirstCall(callbackContext.done);
    return [onlyAllowFirstCall(callback), callbackContext];
}
