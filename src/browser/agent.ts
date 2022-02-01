import { ParticipantToAgentMessage, AgentToParticipantMessage } from "../types";

export const createAgent = (
  responseId: string | null,
  agentId: string | null
): ((message: string) => Promise<AgentToParticipantMessage>) => {
  if (responseId === undefined || responseId === null) {
    throw "Error, cannot connect to chat without a response id";
  } else if (agentId === undefined || agentId === null) {
    throw "Error, cannot connect to chat without an agent id";
  }

  return async (message: string): Promise<AgentToParticipantMessage> => {
    const body: ParticipantToAgentMessage = { message, responseId, agentId };
    const request = {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    };

    try {
      const response = await fetch("/message", request);
      const message: AgentToParticipantMessage = await response.json();
      return message;
    } catch {
      return {
        message: "I'm sorry, there was a problem connecting",
        responseId,
        page: "none",
        parameters: {},
        done: true,
      };
    }
  };
};
