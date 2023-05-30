/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This module defines the functions for loading the user's code as specified
 * in a handler string.
 */
"use strict";
import path from "path";
import fs from "fs";
//import { HandlerFunction } from "../Common/index.js";
import { HandlerNotFound, MalformedHandlerName, ImportModuleError, UserCodeSyntaxError, } from "../Errors/index.js";
const FUNCTION_EXPR = /^([^.]*)\.(.*)$/;
const RELATIVE_PATH_SUBSTRING = "..";
/**
 * Break the full handler string into two pieces, the module root and the actual
 * handler string.
 * Given './somepath/something/module.nestedobj.handler' this returns
 * ['./somepath/something', 'module.nestedobj.handler']
 */
function _moduleRootAndHandler(fullHandlerString) {
    const handlerString = path.basename(fullHandlerString);
    const moduleRoot = fullHandlerString.substring(0, fullHandlerString.indexOf(handlerString));
    return [moduleRoot, handlerString];
}
/**
 * Split the handler string into two pieces: the module name and the path to
 * the handler function.
 */
function _splitHandlerString(handler) {
    const match = handler.match(FUNCTION_EXPR);
    if (!match || match.length != 3) {
        throw new MalformedHandlerName("Bad handler");
    }
    return [match[1], match[2]]; // [module, function-path]
}
/**
 * Resolve the user's handler function from the module.
 */
function _resolveHandler(object, nestedProperty) {
    return nestedProperty.split(".").reduce(async (nested, key) => {
        //console.log(nested);
        return nested && nested[key];
    }, object);
}
/**
 * Verify that the provided path can be loaded as a file per:
 * https://nodejs.org/dist/latest-v10.x/docs/api/modules.html#modules_all_together
 * @param string - the fully resolved file path to the module
 * @return bool
 */
function _canLoadAsFile(modulePath) {
    try {
        fs.existsSync(modulePath + ".mjs");
        return ".mjs";
    }
    catch (e) {
        fs.existsSync(modulePath + ".js");
        return ".js";
    }
}
/**
 * Attempt to load the user's module.
 * Attempts to directly resolve the module relative to the application root,
 * then falls back to the more general require().
 */
/*
function _tryRequire(appRoot: string, moduleRoot: string, module: string): any {
  const lambdaStylePath = path.resolve(appRoot, moduleRoot, module);
  if (_canLoadAsFile(lambdaStylePath)) {
    return require(lambdaStylePath);
  } else {
    // Why not just require(module)?
    // Because require() is relative to __dirname, not process.cwd()
    const nodeStylePath = require.resolve(module, {
      paths: [appRoot, moduleRoot],
    });
    return require(nodeStylePath);
  }
}
*/
/**
 * Load the user's application or throw a descriptive error.
 * @throws Runtime errors in two cases
 *   1 - UserCodeSyntaxError if there's a syntax error while loading the module
 *   2 - ImportModuleError if the module cannot be found
 */
async function _loadUserApp(appRoot, moduleRoot, module) {
    try {
        return await _loadModule(appRoot, moduleRoot, module);
    }
    catch (e) {
        if (e instanceof SyntaxError) {
            throw new UserCodeSyntaxError(e);
        }
        else if (e.code !== undefined && e.code === "MODULE_NOT_FOUND") {
            throw new ImportModuleError(e);
        }
        else {
            throw e;
        }
    }
}
async function _loadModule(appRoot, moduleRoot, module) {
    const lambdaStylePath = path.resolve(appRoot, moduleRoot, module);
    //console.log(lambdaStylePath);
    const ext = _canLoadAsFile(lambdaStylePath);
    try {
        //console.log("waiting....");
        const mod = await import(lambdaStylePath + ext);
        return mod;
    }
    catch (e) {
        throw Error("MODULE_NOT_FOUND");
    }
}
function _throwIfInvalidHandler(fullHandlerString) {
    if (fullHandlerString.includes(RELATIVE_PATH_SUBSTRING)) {
        throw new MalformedHandlerName(`'${fullHandlerString}' is not a valid handler name. Use absolute paths when specifying root directories in handler names.`);
    }
}
/**
 * Load the user's function with the approot and the handler string.
 * @param appRoot {string}
 *   The path to the application root.
 * @param handlerString {string}
 *   The user-provided handler function in the form 'module.function'.
 * @return userFuction {function}
 *   The user's handler function. This function will be passed the event body,
 *   the context object, and the callback function.
 * @throws In five cases:-
 *   1 - if the handler string is incorrectly formatted an error is thrown
 *   2 - if the module referenced by the handler cannot be loaded
 *   3 - if the function in the handler does not exist in the module
 *   4 - if a property with the same name, but isn't a function, exists on the
 *       module
 *   5 - the handler includes illegal character sequences (like relative paths
 *       for traversing up the filesystem '..')
 *   Errors for scenarios known by the runtime, will be wrapped by Runtime.* errors.
 */
export const load = async function (appRoot, fullHandlerString) {
    _throwIfInvalidHandler(fullHandlerString);
    const [moduleRoot, moduleAndHandler] = _moduleRootAndHandler(fullHandlerString);
    const [module, handlerPath] = _splitHandlerString(moduleAndHandler);
    const userApp = await _loadUserApp(appRoot, moduleRoot, module);
    //console.log(userApp);
    const handlerFunc = await _resolveHandler(userApp, handlerPath);
    //console.log(handlerFunc);
    if (!handlerFunc) {
        throw new HandlerNotFound(`${fullHandlerString} is undefined or not exported`);
    }
    if (typeof handlerFunc !== typeof Function) {
        throw new HandlerNotFound(`${fullHandlerString} is not a function`);
    }
    return handlerFunc;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlckZ1bmN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1VzZXJGdW5jdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx1REFBdUQ7QUFDdkQ7Ozs7O0dBS0c7QUFFSCxZQUFZLENBQUM7QUFFYixPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3BCLHVEQUF1RDtBQUN2RCxPQUFPLEVBQ0wsZUFBZSxFQUNmLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsbUJBQW1CLEdBQ3BCLE1BQU0sb0JBQW9CLENBQUM7QUFHNUIsTUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUM7QUFDeEMsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUM7QUFFckM7Ozs7O0dBS0c7QUFDSCxTQUFTLHFCQUFxQixDQUFDLGlCQUF5QjtJQUN0RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdkQsTUFBTSxVQUFVLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUM1QyxDQUFDLEVBQ0QsaUJBQWlCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUN6QyxDQUFDO0lBQ0YsT0FBTyxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxtQkFBbUIsQ0FBQyxPQUFlO0lBQzFDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUMvQixNQUFNLElBQUksb0JBQW9CLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDL0M7SUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FB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