import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import {
  DomainName,
  HttpApi,
  PayloadFormatVersion
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpJwtAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import {
  Duration,
  RemovalPolicy,
  ResourceEnvironment,
  Stack
} from 'aws-cdk-lib';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayv2DomainProperties } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import { PrioritiLambdaProps, PrioritiStackProps } from './interface';

const createNodeJsFunction = (
  stack: Stack,
  props: PrioritiLambdaProps,
  environment?: { [key: string]: string }
) =>
  new NodejsFunction(stack, props.id, {
    description: props.description,
    runtime: Runtime.NODEJS_16_X,
    handler: props.handler,
    entry: props.entry,
    memorySize: props.memorySize,
    timeout: Duration.seconds(props.timeout || 30),
    logRetention: RetentionDays.FIVE_DAYS,
    environment
  });

export class PrioritiCdkStack extends Stack {
  constructor(scope: Construct, id: string, props: PrioritiStackProps) {
    super(scope, id, props);

    // DynamoDB
    const todoTable = new Table(this, 'TodoTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

    // get account and region
    const resourceEnvironment: ResourceEnvironment = {
      account: this.account,
      region: this.region
    };

    // get hosted zone that our domain name is in
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'prioriti.plus'
    });

    // get certificate for our domain name
    const certificate = new DnsValidatedCertificate(this, 'ApiCertificate', {
      domainName: 'api.prioriti.plus',
      hostedZone,
      region: this.region
    });

    const domainName = new DomainName(this, 'ApiDomainName', {
      domainName: 'api.prioriti.plus',
      certificate
    });

    const helloWorldLambdaProps = props.helloWorldLambda;
    const helloWorldLambda = createNodeJsFunction(this, helloWorldLambdaProps);

    const getTodoLambdaProps = props.getTodoLambdaProps;
    const getTodoLambda = createNodeJsFunction(this, getTodoLambdaProps, {
      TODO_TABLE_NAME: todoTable.tableName
    });

    const getAllTodoLambdaProps = props.getAllTodoLambdaProps;
    const getAllTodoLambda = createNodeJsFunction(this, getAllTodoLambdaProps, {
      TODO_TABLE_NAME: todoTable.tableName
    });

    const deleteTodoLambdaProps = props.deleteTodoLambdaProps;
    const deleteTodoLambda = createNodeJsFunction(this, deleteTodoLambdaProps, {
      TODO_TABLE_NAME: todoTable.tableName
    });

    const postTodoLambdaProps = props.postTodoLambdaProps;
    const postTodoLambda = createNodeJsFunction(this, postTodoLambdaProps, {
      TODO_TABLE_NAME: todoTable.tableName
    });

    const putTodoLambdaProps = props.putTodoLambdaProps;
    const putTodoLambda = createNodeJsFunction(this, putTodoLambdaProps, {
      TODO_TABLE_NAME: todoTable.tableName
    });

    todoTable.grantReadData(getTodoLambda);
    todoTable.grantReadData(getAllTodoLambda);
    todoTable.grantReadWriteData(deleteTodoLambda);
    todoTable.grantReadWriteData(putTodoLambda);
    todoTable.grantReadWriteData(postTodoLambda);

    const helloWorldLambdaIntegration = new HttpLambdaIntegration(
      'HelloWorldIntegration',
      helloWorldLambda,
      { payloadFormatVersion: PayloadFormatVersion.VERSION_2_0 }
    );

    const getAllTodoLambdaIntegration = new HttpLambdaIntegration(
      `${getAllTodoLambdaProps.id}Integration`,
      getAllTodoLambda,
      { payloadFormatVersion: PayloadFormatVersion.VERSION_2_0 }
    );

    const getTodoLambdaIntegration = new HttpLambdaIntegration(
      `${getTodoLambdaProps.id}Integration`,
      getTodoLambda,
      { payloadFormatVersion: PayloadFormatVersion.VERSION_2_0 }
    );

    const deleteTodoLambdaIntegration = new HttpLambdaIntegration(
      `${deleteTodoLambdaProps.id}Integration`,
      deleteTodoLambda,
      { payloadFormatVersion: PayloadFormatVersion.VERSION_2_0 }
    );

    const putTodoLambdaIntegration = new HttpLambdaIntegration(
      `${putTodoLambdaProps.id}Integration`,
      putTodoLambda,
      { payloadFormatVersion: PayloadFormatVersion.VERSION_2_0 }
    );

    const postTodoLambdaIntegration = new HttpLambdaIntegration(
      `${postTodoLambdaProps.id}Integration`,
      postTodoLambda,
      { payloadFormatVersion: PayloadFormatVersion.VERSION_2_0 }
    );

    const issuer = props.apiGateway.jwtIssuer;
    const apiAuthorizer = new HttpJwtAuthorizer('ApiAuthorizer', issuer, {
      jwtAudience: ['https://api.prioriti.plus']
    });

    const api = new HttpApi(this, 'PrioritiAPI', {
      description: 'The API for calling the hello world lambda',
      disableExecuteApiEndpoint: true,
      defaultAuthorizer: apiAuthorizer
    });

    const devStage = api.addStage('dev', {
      autoDeploy: true,
      stageName: 'dev',
      throttle: {
        rateLimit: 10,
        burstLimit: 10
      },
      domainMapping: {
        domainName
      }
    });

    api.addRoutes({
      integration: helloWorldLambdaIntegration,
      path: '/helloworld',
      methods: [HttpMethod.GET]
    });

    api.addRoutes({
      integration: getAllTodoLambdaIntegration,
      path: '/todo',
      methods: [HttpMethod.GET]
    });

    api.addRoutes({
      integration: getTodoLambdaIntegration,
      path: '/todo/{todoId}',
      methods: [HttpMethod.GET]
    });

    api.addRoutes({
      integration: deleteTodoLambdaIntegration,
      path: '/todo/{todoId}',
      methods: [HttpMethod.DELETE]
    });

    api.addRoutes({
      integration: putTodoLambdaIntegration,
      path: '/todo/{todoId}',
      methods: [HttpMethod.PUT]
    });

    api.addRoutes({
      integration: postTodoLambdaIntegration,
      path: '/todo',
      methods: [HttpMethod.POST]
    });

    new ARecord(this, 'ApiRecord', {
      recordName: 'api',
      zone: hostedZone,
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId
        )
      )
    });
  }
}
