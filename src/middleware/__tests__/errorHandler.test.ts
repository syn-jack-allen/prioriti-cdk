import { errorHandler, defaultOptions } from "../errorHandler";
import middy from "@middy/core";

describe("errorHandler", () => {
  const errorhandler = errorHandler();
  test("formats the response correctly when given a runtime error", () => {
    const error = new Error("Some runtime error");
    const request = {
      error,
    } as middy.Request;

    errorhandler.onError(request);

    expect(request.response).toMatchObject({
      statusCode: 500,
      body: JSON.stringify({
        error: { message: defaultOptions.fallbackMessage },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  test("formats the response correctly when given a 4XX error", () => {
    const error = new Error("Some runtime error") as any;
    error.statusCode = 400;

    const request = {
      error,
    } as middy.Request;

    errorhandler.onError(request);

    expect(request.response).toMatchObject({
      statusCode: 400,
      body: JSON.stringify({
        error: { message: "Some runtime error" },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
  test("formats the response correctly when given a 5XX error", () => {
    const error = new Error("Some runtime error") as any;
    error.statusCode = 500;

    const request = {
      error,
    } as middy.Request;

    errorhandler.onError(request);

    expect(request.response).toMatchObject({
      statusCode: 500,
      body: JSON.stringify({
        error: { message: defaultOptions.fallbackMessage },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  test("allows the default message to be customised", () => {
    const customErrorHandler = errorHandler({
      fallbackMessage: "Custom response",
    });

    const error = new Error("Some runtime error") as any;
    error.statusCode = 500;

    const request = {
      error,
    } as middy.Request;

    customErrorHandler.onError(request);

    expect(request.response).toMatchObject({
      statusCode: 500,
      body: JSON.stringify({
        error: { message: "Custom response" },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
});
