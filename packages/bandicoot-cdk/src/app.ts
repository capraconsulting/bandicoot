#!/usr/bin/env node
import * as cdk from "@aws-cdk/core"
import { BandicootStack } from "./stack"

// const isSnapshot = process.env.IS_SNAPSHOT === "true"

const app = new cdk.App()

app.node.applyAspect({
  visit(construct: cdk.IConstruct) {
    if (construct instanceof cdk.Construct) {
      const stack = construct.node.scopes.find(cdk.Stack.isStack)
      if (stack != null) {
        cdk.Tag.add(construct, "StackName", stack.stackName)
        cdk.Tag.add(construct, "project", "hackathon-bandicoot")
        cdk.Tag.add(construct, "owner", "hst:sba")
      }
    }
  },
})

new BandicootStack(app, "bandicoot", {
  env: { region: "eu-west-1", account: "001112238813" },
})
