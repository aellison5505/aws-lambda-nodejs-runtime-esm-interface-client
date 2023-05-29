/** Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved. */
"use strict";
import { Runner, reporters } from "mocha";
const { EVENT_SUITE_BEGIN, EVENT_SUITE_END, EVENT_RUN_BEGIN, EVENT_RUN_END, EVENT_TEST_PASS, EVENT_TEST_FAIL, } = Runner.constants;
/**
 * Custom reporter does not depend on any of the console.* functions, which
 * enables clean test output even when applying the lambda-runtime console
 * patch.
 */
module.exports = class StdoutReporter extends reporters.Base {
    constructor(runner, options) {
        super(runner, options);
        this._alreadyWritten = false;
        this._report = "";
        this._indents = 0;
        const stats = runner.stats;
        runner
            .once(EVENT_RUN_BEGIN, () => { })
            .on(EVENT_SUITE_BEGIN, (suite) => {
            this.log(suite.title);
            this.increaseIndent();
        })
            .on(EVENT_SUITE_END, () => {
            this.decreaseIndent();
        })
            .on(EVENT_TEST_PASS, (test) => {
            this.log(`✓ ${test.title}`);
        })
            .on(EVENT_TEST_FAIL, (test, err) => {
            this.log(`✗ ${test.title}`);
            this.increaseIndent();
            err.stack.split("\n").forEach((msg) => this.log(msg));
            this.decreaseIndent();
        })
            .once(EVENT_RUN_END, () => {
            this.log("Results " +
                stats.passes +
                " passed out of " +
                (stats.passes + stats.failures) +
                " total tests");
            this.dumpReport();
        });
        // This is hella nice if Mocha crashes for some reason
        // (which turns out is easy to do if you fool around with console.log)
        process.on("exit", () => this.dumpReport());
    }
    indent() {
        return Array(this._indents).join("  ");
    }
    increaseIndent() {
        this._indents++;
    }
    decreaseIndent() {
        this._indents--;
    }
    log(line) {
        this._report += `${this.indent()}${line}\n`;
    }
    dumpReport() {
        if (!this._alreadyWritten) {
            process.stdout.write(this._report);
            this._alreadyWritten = true;
        }
    }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL3Vzci9zcmMvdGFzay90ZXN0L3V0aWxzL1N0ZG91dFJlcG9ydGVyLnRzIiwic291cmNlcyI6WyIvdXNyL3NyYy90YXNrL3Rlc3QvdXRpbHMvU3Rkb3V0UmVwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOEVBQThFO0FBRTlFLFlBQVksQ0FBQztBQUViLE9BQU8sRUFBZ0IsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUV4RCxNQUFNLEVBQ0osaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixlQUFlLEVBQ2YsYUFBYSxFQUNiLGVBQWUsRUFDZixlQUFlLEdBQ2hCLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUVyQjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLGNBQWUsU0FBUSxTQUFTLENBQUMsSUFBSTtJQUsxRCxZQUFtQixNQUFjLEVBQUUsT0FBcUI7UUFDdEQsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztRQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBRTNCLE1BQU07YUFDSCxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQzthQUMvQixFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDeEIsQ0FBQyxDQUFDO2FBQ0QsRUFBRSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7WUFDeEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3hCLENBQUMsQ0FBQzthQUNELEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDO2FBQ0QsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN4QixDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtZQUN4QixJQUFJLENBQUMsR0FBRyxDQUNOLFVBQVU7Z0JBQ1IsS0FBSyxDQUFDLE1BQU07Z0JBQ1osaUJBQWlCO2dCQUNqQixDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztnQkFDL0IsY0FBYyxDQUNqQixDQUFDO1lBQ0YsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBRUwsc0RBQXNEO1FBQ3RELHNFQUFzRTtRQUN0RSxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsTUFBTTtRQUNKLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELGNBQWM7UUFDWixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELGNBQWM7UUFDWixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELEdBQUcsQ0FBQyxJQUFJO1FBQ04sSUFBSSxDQUFDLE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQztJQUM5QyxDQUFDO0lBRUQsVUFBVTtRQUNSLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztTQUM3QjtJQUNILENBQUM7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIENvcHlyaWdodCAyMDE5IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgeyBNb2NoYU9wdGlvbnMsIFJ1bm5lciwgcmVwb3J0ZXJzIH0gZnJvbSBcIm1vY2hhXCI7XG5cbmNvbnN0IHtcbiAgRVZFTlRfU1VJVEVfQkVHSU4sXG4gIEVWRU5UX1NVSVRFX0VORCxcbiAgRVZFTlRfUlVOX0JFR0lOLFxuICBFVkVOVF9SVU5fRU5ELFxuICBFVkVOVF9URVNUX1BBU1MsXG4gIEVWRU5UX1RFU1RfRkFJTCxcbn0gPSBSdW5uZXIuY29uc3RhbnRzO1xuXG4vKipcbiAqIEN1c3RvbSByZXBvcnRlciBkb2VzIG5vdCBkZXBlbmQgb24gYW55IG9mIHRoZSBjb25zb2xlLiogZnVuY3Rpb25zLCB3aGljaFxuICogZW5hYmxlcyBjbGVhbiB0ZXN0IG91dHB1dCBldmVuIHdoZW4gYXBwbHlpbmcgdGhlIGxhbWJkYS1ydW50aW1lIGNvbnNvbGVcbiAqIHBhdGNoLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFN0ZG91dFJlcG9ydGVyIGV4dGVuZHMgcmVwb3J0ZXJzLkJhc2Uge1xuICBwcml2YXRlIF9hbHJlYWR5V3JpdHRlbjogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfcmVwb3J0OiBzdHJpbmc7XG4gIHByaXZhdGUgX2luZGVudHM6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IocnVubmVyOiBSdW5uZXIsIG9wdGlvbnM6IE1vY2hhT3B0aW9ucykge1xuICAgIHN1cGVyKHJ1bm5lciwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9hbHJlYWR5V3JpdHRlbiA9IGZhbHNlO1xuICAgIHRoaXMuX3JlcG9ydCA9IFwiXCI7XG4gICAgdGhpcy5faW5kZW50cyA9IDA7XG4gICAgY29uc3Qgc3RhdHMgPSBydW5uZXIuc3RhdHM7XG5cbiAgICBydW5uZXJcbiAgICAgIC5vbmNlKEVWRU5UX1JVTl9CRUdJTiwgKCkgPT4ge30pXG4gICAgICAub24oRVZFTlRfU1VJVEVfQkVHSU4sIChzdWl0ZSkgPT4ge1xuICAgICAgICB0aGlzLmxvZyhzdWl0ZS50aXRsZSk7XG4gICAgICAgIHRoaXMuaW5jcmVhc2VJbmRlbnQoKTtcbiAgICAgIH0pXG4gICAgICAub24oRVZFTlRfU1VJVEVfRU5ELCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZGVjcmVhc2VJbmRlbnQoKTtcbiAgICAgIH0pXG4gICAgICAub24oRVZFTlRfVEVTVF9QQVNTLCAodGVzdCkgPT4ge1xuICAgICAgICB0aGlzLmxvZyhg4pyTICR7dGVzdC50aXRsZX1gKTtcbiAgICAgIH0pXG4gICAgICAub24oRVZFTlRfVEVTVF9GQUlMLCAodGVzdCwgZXJyKSA9PiB7XG4gICAgICAgIHRoaXMubG9nKGDinJcgJHt0ZXN0LnRpdGxlfWApO1xuICAgICAgICB0aGlzLmluY3JlYXNlSW5kZW50KCk7XG4gICAgICAgIGVyci5zdGFjay5zcGxpdChcIlxcblwiKS5mb3JFYWNoKChtc2cpID0+IHRoaXMubG9nKG1zZykpO1xuICAgICAgICB0aGlzLmRlY3JlYXNlSW5kZW50KCk7XG4gICAgICB9KVxuICAgICAgLm9uY2UoRVZFTlRfUlVOX0VORCwgKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICBcIlJlc3VsdHMgXCIgK1xuICAgICAgICAgICAgc3RhdHMucGFzc2VzICtcbiAgICAgICAgICAgIFwiIHBhc3NlZCBvdXQgb2YgXCIgK1xuICAgICAgICAgICAgKHN0YXRzLnBhc3NlcyArIHN0YXRzLmZhaWx1cmVzKSArXG4gICAgICAgICAgICBcIiB0b3RhbCB0ZXN0c1wiXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZHVtcFJlcG9ydCgpO1xuICAgICAgfSk7XG5cbiAgICAvLyBUaGlzIGlzIGhlbGxhIG5pY2UgaWYgTW9jaGEgY3Jhc2hlcyBmb3Igc29tZSByZWFzb25cbiAgICAvLyAod2hpY2ggdHVybnMgb3V0IGlzIGVhc3kgdG8gZG8gaWYgeW91IGZvb2wgYXJvdW5kIHdpdGggY29uc29sZS5sb2cpXG4gICAgcHJvY2Vzcy5vbihcImV4aXRcIiwgKCkgPT4gdGhpcy5kdW1wUmVwb3J0KCkpO1xuICB9XG5cbiAgaW5kZW50KCkge1xuICAgIHJldHVybiBBcnJheSh0aGlzLl9pbmRlbnRzKS5qb2luKFwiICBcIik7XG4gIH1cblxuICBpbmNyZWFzZUluZGVudCgpIHtcbiAgICB0aGlzLl9pbmRlbnRzKys7XG4gIH1cblxuICBkZWNyZWFzZUluZGVudCgpIHtcbiAgICB0aGlzLl9pbmRlbnRzLS07XG4gIH1cblxuICBsb2cobGluZSkge1xuICAgIHRoaXMuX3JlcG9ydCArPSBgJHt0aGlzLmluZGVudCgpfSR7bGluZX1cXG5gO1xuICB9XG5cbiAgZHVtcFJlcG9ydCgpIHtcbiAgICBpZiAoIXRoaXMuX2FscmVhZHlXcml0dGVuKSB7XG4gICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSh0aGlzLl9yZXBvcnQpO1xuICAgICAgdGhpcy5fYWxyZWFkeVdyaXR0ZW4gPSB0cnVlO1xuICAgIH1cbiAgfVxufTtcbiJdfQ==