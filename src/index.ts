import { InternalOptions, CallbackFunction } from "db-migrate-base";
import AuroraDataApiDriver, { RDSParams } from "./AuroraDataApiDriver";
var AWS = require("aws-sdk");

export function connect(
  config: RDSParams,
  intern: InternalOptions,
  callback: CallbackFunction
) {
  console.info(config);
  // @ts-ignore
  callback(null, new AuroraDataApiDriver(intern, config));
}
