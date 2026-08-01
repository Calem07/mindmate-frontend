// Vite probes Windows network mappings with `net use` during startup.
// Some managed Windows shells deny child_process.spawn, although local builds
// do not need that optional network-mapping probe.
const childProcess = require("node:child_process");
const originalExec = childProcess.exec;

childProcess.exec = function patchedExec(command, ...args) {
  if (typeof command === "string" && command.trim().toLowerCase() === "net use") {
    const callback = args.find((arg) => typeof arg === "function");
    if (callback) callback(null, "", "");
    return {
      on() {
        return this;
      },
    };
  }
  return originalExec.call(this, command, ...args);
};
