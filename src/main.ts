'use strict'

import {ApiService} from "./services";
import {logger, Utils} from "./utils";
import * as Util from "util";

const main = async () => {
  const runService = process.env.__SERVICE_NAME__;
  logger.info("Running service: ", runService);
  switch (runService) {
    default:
      await ApiService.startServe();
      break;
  }
}

main().catch(e => logger.error(e));
