/** Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved. */
"use strict";
import { isError } from "./index.js";
/**
 * prepare an exception blob for sending to AWS X-Ray
 * transform an Error, or Error-like, into an exception parseable by X-Ray's service.
 *  {
 *      "name": "CustomException",
 *      "message": "Something bad happend!",
 *      "stack": [
 *          "exports.handler (/var/function/node_modules/event_invoke.js:3:502)
 *      ]
 *  }
 * =>
 *  {
 *       "working_directory": "/var/function",
 *       "exceptions": [
 *           {
 *               "type": "CustomException",
 *               "message": "Something bad happend!",
 *               "stack": [
 *                   {
 *                       "path": "/var/function/event_invoke.js",
 *                       "line": 502,
 *                       "label": "exports.throw_custom_exception"
 *                   }
 *               ]
 *           }
 *       ],
 *       "paths": [
 *           "/var/function/event_invoke.js"
 *       ]
 *  }
 */
export const toFormatted = (err) => {
    if (!isError(err)) {
        return "";
    }
    try {
        return JSON.stringify(new XRayFormattedCause(err));
    }
    catch (error) {
        return "";
    }
};
class XRayFormattedCause {
    working_directory;
    exceptions;
    paths;
    constructor(err) {
        this.working_directory = process.cwd(); // eslint-disable-line
        const stack = [];
        if (err.stack) {
            const stackLines = err.stack.split("\n");
            stackLines.shift();
            stackLines.forEach((stackLine) => {
                let line = stackLine.trim().replace(/\(|\)/g, "");
                line = line.substring(line.indexOf(" ") + 1);
                const label = line.lastIndexOf(" ") >= 0
                    ? line.slice(0, line.lastIndexOf(" "))
                    : null;
                const path = label == undefined || label == null || label.length === 0
                    ? line
                    : line.slice(line.lastIndexOf(" ") + 1);
                const pathParts = path.split(":");
                const entry = {
                    path: pathParts[0],
                    line: parseInt(pathParts[1]),
                    label: label || "anonymous",
                };
                stack.push(entry);
            });
        }
        this.exceptions = [
            {
                type: err.name,
                message: err.message,
                stack: stack,
            },
        ];
        const paths = new Set();
        stack.forEach((entry) => {
            paths.add(entry.path);
        });
        this.paths = Array.from(paths);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFJheUVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0Vycm9ycy9YUmF5RXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOEVBQThFO0FBRTlFLFlBQVksQ0FBQztBQUViLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNILE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQVksRUFBVSxFQUFFO0lBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDakIsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELElBQUk7UUFDRixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3BEO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLEVBQUUsQ0FBQztLQUNYO0FBQ0gsQ0FBQyxDQUFDO0FBY0YsTUFBTSxrQkFBa0I7SUFDdEIsaUJBQWlCLENBQVM7SUFDMUIsVUFBVSxDQUFjO0lBQ3hCLEtBQUssQ0FBVztJQUVoQixZQUFZLEdBQVU7UUFDcEIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQjtRQUU5RCxNQUFNLEtBQUssR0FBcUIsRUFBRSxDQUFDO1FBQ25DLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRTtZQUNiLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVuQixVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7Z0JBQy9CLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUU3QyxNQUFNLEtBQUssR0FDVCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ3hCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN0QyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUVYLE1BQU0sSUFBSSxHQUNSLEtBQUssSUFBSSxTQUFTLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUM7b0JBQ3ZELENBQUMsQ0FBQyxJQUFJO29CQUNOLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRTVDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRWxDLE1BQU0sS0FBSyxHQUFHO29CQUNaLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNsQixJQUFJLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUIsS0FBSyxFQUFFLEtBQUssSUFBSSxXQUFXO2lCQUM1QixDQUFDO2dCQUVGLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELElBQUksQ0FBQyxVQUFVLEdBQUc7WUFDaEI7Z0JBQ0UsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO2dCQUNkLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztnQkFDcEIsS0FBSyxFQUFFLEtBQUs7YUFDYjtTQUNGLENBQUM7UUFFRixNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN0QixLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQ0YifQ==