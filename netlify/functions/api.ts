import serverless from "serverless-http";
import { app } from "../../src/server-api";

export const handler = serverless(app);
