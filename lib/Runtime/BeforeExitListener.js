/* eslint-disable @typescript-eslint/no-explicit-any */
/** Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved. */
"use strict";
/**
 * The runtime has a single beforeExit function which is stored in the global
 * object with a symbol key.
 * The symbol is not exported.
 * The process.beforeExit listener is setup in index.js along with all other
 * top-level process event listeners.
 */
// define a named symbol for the handler function
const LISTENER_SYMBOL = Symbol.for("aws.lambda.beforeExit");
const NO_OP_LISTENER = () => {
    /* NoOp */
};
// export a setter
class BeforeExitListener {
    constructor() {
        this.reset();
    }
    /**
     * Call the listener function with no arguments.
     */
    invoke = () => global[LISTENER_SYMBOL]();
    /**
     * Reset the listener to a no-op function.
     */
    reset = () => (global[LISTENER_SYMBOL] = NO_OP_LISTENER);
    /**
     * Set the listener to the provided function.
     */
    set = (listener) => (global[LISTENER_SYMBOL] = listener);
}
const beforeExitListener = new BeforeExitListener();
export default beforeExitListener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmVmb3JlRXhpdExpc3RlbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1J1bnRpbWUvQmVmb3JlRXhpdExpc3RlbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHVEQUF1RDtBQUN2RCw4RUFBOEU7QUFFOUUsWUFBWSxDQUFDO0FBSWI7Ozs7OztHQU1HO0FBRUgsaURBQWlEO0FBQ2pELE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUU1RCxNQUFNLGNBQWMsR0FBRyxHQUFHLEVBQUU7SUFDMUIsVUFBVTtBQUNaLENBQUMsQ0FBQztBQUVGLGtCQUFrQjtBQUNsQixNQUFNLGtCQUFrQjtJQUN0QjtRQUNFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU0sR0FBRyxHQUFTLEVBQUUsQ0FBRSxNQUFjLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztJQUV4RDs7T0FFRztJQUNILEtBQUssR0FBRyxHQUFpQixFQUFFLENBQ3pCLENBQUUsTUFBYyxDQUFDLGVBQWUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDO0lBRXREOztPQUVHO0lBQ0gsR0FBRyxHQUFHLENBQUMsUUFBb0IsRUFBZ0IsRUFBRSxDQUMzQyxDQUFFLE1BQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztDQUNqRDtBQUVELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO0FBRXBELGVBQWUsa0JBQWtCLENBQUMifQ==