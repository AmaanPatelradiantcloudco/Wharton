import { Logging } from "@google-cloud/logging";
import { transformMessages } from "./helpers";
import { LogParameter, LogResponse } from "./types";

export async function* readResponses(
  projectId: string,
  month: Date,
  logging = new Logging({ projectId })
): AsyncIterable<LogResponse> {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const stream = logging.getEntriesStream({
    maxApiCalls: 20,
    autoPaginate: true,
    filter: `
      logName = "projects/${projectId}/logs/dialogflow-runtime.googleapis.com%2Frequests"
      timestamp >= "${start.toISOString()}"
      timestamp <= "${end.toISOString()}"
      jsonPayload.responseId=~".+"
    `,
  });

  for await (const { data, metadata } of stream) {
    yield {
      responseId: data.responseId ?? "",
      agentId: metadata.labels?.agent_id ?? "",
      sessionId: metadata.labels?.session_id ?? "",
      timestamp: metadata.timestamp?.toString() ?? "",
      request: data.queryResult?.text ?? "",
      response: transformMessages(data.queryResult?.responseMessages ?? []),
      parameters: data.queryResult?.parameters ?? {},
    };
  }
}

export const expandParameters = (response: LogResponse): LogParameter[] => {
  const { parameters, ...info } = response;

  return Object.entries(parameters).map(([name, value]) => ({
    ...info,
    name,
    value,
  }));
};
