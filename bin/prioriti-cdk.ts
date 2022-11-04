#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { PrioritiCdkStack } from "../lib/prioriti-cdk-stack";
import AppBuilder from "../src/appBuilder";

const appBuilder = new AppBuilder();
const config = appBuilder.getConfig();
appBuilder.build({
  description: "The infrastructure for the Prioriti app",
});
