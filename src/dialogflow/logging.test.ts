import { Readable } from "stream";
import { expandParameters, readResponses } from "./logging";
import { LogResponse } from "./types";
import logs from "./__fixtures__/logs.json";

const createLogging = () => ({
  getEntriesStream: jest.fn(() => {
    const stream = new Readable({ objectMode: true });
    logs.forEach((log) => stream.push(log));
    stream.push(null);
    return stream;
  }),
});

test("readResponses", async () => {
  const month = new Date();
  const logging = createLogging();
  const stream = readResponses("project id", month, logging as any);
  const responses: LogResponse[] = [];

  for await (const response of stream) {
    responses.push(response);
  }

  expect(responses).toHaveLength(3);
  expect(responses).toMatchSnapshot();
});

test("expandParameters", () => {
  const shared = {
    agentId: "agentId",
    request: "request",
    response: "response",
    responseId: "responseId",
    sessionId: "sessionId",
    timestamp: "timestamp",
  };

  const response: LogResponse = {
    ...shared,
    parameters: { a: 1, b: 2 },
  };

  expect(expandParameters(response)).toEqual([
    { ...shared, name: "a", value: 1 },
    { ...shared, name: "b", value: 2 },
  ]);
});
