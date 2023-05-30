/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This module defines the top-level Runtime class which controls the
 * bootstrap's execution flow.
 */
"use strict";
import BeforeExitListener from "./BeforeExitListener.js";
import * as CallbackContext from "./CallbackContext.js";
import InvokeContext from "./InvokeContext.js";
export default class Runtime {
    client;
    errorCallbacks;
    handler;
    constructor(client, handler, errorCallbacks) {
        this.client = client;
        this.handler = handler;
        this.errorCallbacks = errorCallbacks;
    }
    /**
     * Schedule the next loop iteration to start at the beginning of the next time
     * around the event loop.
     */
    scheduleIteration() {
        setImmediate(() => {
            this.handleOnce().then(
            // Success is a no-op at this level. There are 2 cases:
            // 1 - The user used one of the callback functions which already
            //     schedules the next iteration.
            // 2 - The next iteration is not scheduled because the
            //     waitForEmptyEventLoop was set. In this case the beforeExit
            //     handler will automatically start the next iteration.
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            () => { }, 
            // Errors should not reach this level in typical execution. If they do
            // it's a sign of an issue in the Client or a bug in the runtime. So
            // dump it to the console and attempt to report it as a Runtime error.
            (err) => {
                // eslint-disable-next-line no-console
                console.log(`Unexpected Top Level Error: ${err.toString()}`);
                this.errorCallbacks.uncaughtException(err);
            });
        });
    }
    /**
     * Wait for the next invocation, process it, and schedule the next iteration.
     */
    async handleOnce() {
        const { bodyJson, headers } = await this.client.nextInvocation();
        const invokeContext = new InvokeContext(headers);
        invokeContext.updateLoggingContext();
        const [callback, callbackContext] = CallbackContext.build(this.client, invokeContext.invokeId, this.scheduleIteration.bind(this));
        try {
            this._setErrorCallbacks(invokeContext.invokeId);
            this._setDefaultExitListener(invokeContext.invokeId);
            const result = this.handler(JSON.parse(bodyJson), invokeContext.attachEnvironmentData(callbackContext), callback);
            if (_isPromise(result)) {
                result
                    .then(callbackContext.succeed, callbackContext.fail)
                    .catch(callbackContext.fail);
            }
        }
        catch (err) {
            callback(err);
        }
    }
    /**
     * Replace the error handler callbacks.
     * @param {String} invokeId
     */
    _setErrorCallbacks(invokeId) {
        this.errorCallbacks.uncaughtException = (error) => {
            this.client.postInvocationError(error, invokeId, () => {
                process.exit(129);
            });
        };
        this.errorCallbacks.unhandledRejection = (error) => {
            this.client.postInvocationError(error, invokeId, () => {
                process.exit(128);
            });
        };
    }
    /**
     * Setup the 'beforeExit' listener that is used if the callback is never
     * called and the handler is not async.
     * CallbackContext replaces the listener if a callback is invoked.
     */
    _setDefaultExitListener(invokeId) {
        BeforeExitListener.set(() => {
            this.client.postInvocationResponse(null, invokeId, () => this.scheduleIteration());
        });
    }
}
function _isPromise(obj) {
    return obj instanceof Promise;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9SdW50aW1lL1J1bnRpbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFFSCxZQUFZLENBQUM7QUFFYixPQUFPLGtCQUFrQixNQUFNLHlCQUF5QixDQUFDO0FBRXpELE9BQU8sS0FBSyxlQUFlLE1BQU0sc0JBQXNCLENBQUM7QUFDeEQsT0FBTyxhQUFhLE1BQU0sb0JBQW9CLENBQUM7QUFHL0MsTUFBTSxDQUFDLE9BQU8sT0FBTyxPQUFPO0lBQzFCLE1BQU0sQ0FBaUI7SUFDdkIsY0FBYyxDQUFrQjtJQUNoQyxPQUFPLENBQWtCO0lBRXpCLFlBQ0UsTUFBc0IsRUFDdEIsT0FBd0IsRUFDeEIsY0FBK0I7UUFFL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7T0FHRztJQUNILGlCQUFpQjtRQUNmLFlBQVksQ0FBQyxHQUFHLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUk7WUFDcEIsdURBQXVEO1lBQ3ZELGdFQUFnRTtZQUNoRSxvQ0FBb0M7WUFDcEMsc0RBQXNEO1lBQ3RELGlFQUFpRTtZQUNqRSwyREFBMkQ7WUFDM0QsZ0VBQWdFO1lBQ2hFLEdBQUcsRUFBRSxHQUFFLENBQUM7WUFFUixzRUFBc0U7WUFDdEUsb0VBQW9FO1lBQ3BFLHNFQUFzRTtZQUN0RSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNOLHNDQUFzQztnQkFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQ0YsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFVBQVU7UUFDZCxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNqRSxNQUFNLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqRCxhQUFhLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUVyQyxNQUFNLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQ3ZELElBQUksQ0FBQyxNQUFNLEVBQ1gsYUFBYSxDQUFDLFFBQVEsRUFDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDbEMsQ0FBQztRQUVGLElBQUk7WUFDRixJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFckQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFDcEIsYUFBYSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxFQUNwRCxRQUFRLENBQ1QsQ0FBQztZQUVGLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN0QixNQUFNO3FCQUNILElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUM7cUJBQ25ELEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDaEM7U0FDRjtRQUFDLE9BQU8sR0FBWSxFQUFFO1lBQ3JCLFFBQVEsQ0FBQyxHQUFZLENBQUMsQ0FBQztTQUN4QjtJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSyxrQkFBa0IsQ0FBQyxRQUFnQjtRQUN6QyxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixHQUFHLENBQUMsS0FBWSxFQUFRLEVBQUU7WUFDN0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRTtnQkFDcEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztRQUNGLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxLQUFZLEVBQVEsRUFBRTtZQUM5RCxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFO2dCQUNwRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSyx1QkFBdUIsQ0FBQyxRQUFnQjtRQUM5QyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FDdEQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQ3pCLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQUVELFNBQVMsVUFBVSxDQUFDLEdBQStCO0lBQ2pELE9BQU8sR0FBRyxZQUFZLE9BQU8sQ0FBQztBQUNoQyxDQUFDIn0=