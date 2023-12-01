import bunyan from "bunyan";

export const log = bunyan.createLogger({
  name: "myapp",
  level: "warn",
  stream: process.stdout,
});
