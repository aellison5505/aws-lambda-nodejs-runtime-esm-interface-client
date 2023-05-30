/* eslint-disable no-console */
/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This module is the bootstrap entrypoint. It establishes the top-level event
 * listeners and loads the user's code.
 */
"use strict";
import { isHandlerFunction } from "./Common/index.js";
import * as Errors from "./Errors/index.js";
import RuntimeClient from "./RuntimeClient/index.js";
import Runtime from "./Runtime/index.js";
import BeforeExitListener from "./Runtime/BeforeExitListener.js";
import LogPatch from "./utils/LogPatch.js";
import * as UserFunction from "./utils/UserFunction.js";
LogPatch.patchConsole();
export async function run(appRootOrHandler, 
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
handler = "") {
    if (!process.env.AWS_LAMBDA_RUNTIME_API) {
        throw new Error("Missing Runtime API Server configuration.");
    }
    const client = new RuntimeClient(process.env.AWS_LAMBDA_RUNTIME_API);
    const errorCallbacks = {
        uncaughtException: (error) => {
            client.postInitError(error, () => process.exit(129));
        },
        unhandledRejection: (error) => {
            client.postInitError(error, () => process.exit(128));
        },
    };
    process.on("uncaughtException", (error) => {
        console.error("Uncaught Exception", Errors.toFormatted(error));
        errorCallbacks.uncaughtException(error);
    });
    process.on("unhandledRejection", (reason, promise) => {
        const error = new Errors.UnhandledPromiseRejection(reason?.toString(), promise);
        console.error("Unhandled Promise Rejection", Errors.toFormatted(error));
        errorCallbacks.unhandledRejection(error);
    });
    BeforeExitListener.reset();
    process.on("beforeExit", BeforeExitListener.invoke);
    const handlerFunc = isHandlerFunction(appRootOrHandler)
        ? appRootOrHandler
        : await UserFunction.load(appRootOrHandler, handler);
    //console.log(handlerFunc);
    const runtime = new Runtime(client, handlerFunc, errorCallbacks);
    runtime.scheduleIteration();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9COzs7OztHQUtHO0FBRUgsWUFBWSxDQUFDO0FBRWIsT0FBTyxFQUFtQixpQkFBaUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3ZFLE9BQU8sS0FBSyxNQUFNLE1BQU0sbUJBQW1CLENBQUM7QUFDNUMsT0FBTyxhQUFhLE1BQU0sMEJBQTBCLENBQUM7QUFDckQsT0FBTyxPQUFPLE1BQU0sb0JBQW9CLENBQUM7QUFDekMsT0FBTyxrQkFBa0IsTUFBTSxpQ0FBaUMsQ0FBQztBQUNqRSxPQUFPLFFBQVEsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEtBQUssWUFBWSxNQUFNLHlCQUF5QixDQUFDO0FBRXhELFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUt4QixNQUFNLENBQUMsS0FBSyxVQUFVLEdBQUcsQ0FDdkIsZ0JBQTBDO0FBQzFDLGtFQUFrRTtBQUNsRSxVQUFrQixFQUFFO0lBRXBCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFO1FBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztLQUM5RDtJQUNELE1BQU0sTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUVyRSxNQUFNLGNBQWMsR0FBRztRQUNyQixpQkFBaUIsRUFBRSxDQUFDLEtBQVksRUFBRSxFQUFFO1lBQ2xDLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBQ0Qsa0JBQWtCLEVBQUUsQ0FBQyxLQUFZLEVBQUUsRUFBRTtZQUNuQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsQ0FBQztLQUNGLENBQUM7SUFFRixPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDeEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDL0QsY0FBYyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUNuRCxNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyx5QkFBeUIsQ0FDaEQsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUNsQixPQUFPLENBQ1IsQ0FBQztRQUNGLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQztJQUVILGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXBELE1BQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDO1FBQ3JELENBQUMsQ0FBQyxnQkFBZ0I7UUFDbEIsQ0FBQyxDQUFFLE1BQU0sWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQXFCLENBQUM7SUFDMUUsMkJBQTJCO0lBRTdCLE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFakUsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDOUIsQ0FBQyJ9