# Welcome to the Prioriti project

This repo is intended to demonstrate professional DevOps practices that take a project from conception all the way to production.
These practices include

- Git branch protections with GitHub Actions for CI/CD
- Unit, integration and e2e testing
- IaC
- Logging and observability principles
- Automatic documentation deployment to Confluence

The project itself is a simple To Do app where each task is dropped into a priority queue type of data structure which will hopefully help me to complete my daily errands.

Sadly, not a revolutionary idea but it is simple enough to be an achievable goal whilst adhering to professional DevOps practices. This app is intended to be deployed into the AWS Cloud, making use of Lambda, DynamoDB and API Gateway. To interact with this app, checkout `prioriti-web` for the NextJS web app.

Since I won't be carrying my tower PC around with me throughout the day, there are some plans to explore creating a mobile app, prehaps picking up a new language along the way, such as Dart with the Flutter framework!

Hopefully, this README will be updated as the project progresses.

## Updates

### March 2023

Currently have lambdas for all endpoints implemented in `src/lambda/todo`. Each endpoint is fully integrated with DynamoDB. A maximum number of todos has been configured to prevent malicious intent which is enforced by DynamoDB transaction writes.

We have middlewares configured for JWT validation so API is fully secured against unwanted visitors.

Next steps:

- Complete integration tests for each endpoint
- Complete E2E tests for each endpoint
- Extract interfaces into a separate repository
