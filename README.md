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

Since I won't be carrying my tower PC around with me throughout the day, there are some plans to explore creating a mobile app, prehaps picking up a new language along the way, such as Dart with the Flutter framework.

Hopefully, this README will be updated as the project progresses.

## Useful commands

- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
