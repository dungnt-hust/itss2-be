'use strict'

import {ApiService, WsService} from "./services";
import {logger, Utils} from "./utils";
import * as Util from "util";

const main = async () => {
  const runService = process.env.__SERVICE_NAME__;
  logger.info("Running service: ", runService);
  switch (runService) {
    default:
      await ApiService.startServe();
      await WsService.startServe();
      break;
  }
}

main().catch(e => logger.error(e));
