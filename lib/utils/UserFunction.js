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
