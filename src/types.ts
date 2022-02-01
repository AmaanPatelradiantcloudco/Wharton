import { AgentParameters } from "./dialogflow/types";

export type ParticipantToAgentMessage = {
  responseId: string;
  message: string;
  agentId: string;
};

export type AgentToParticipantMessage = {
  responseId: string;
  page: string;
  message: string;
  parameters: AgentParameters;
  done: boolean;
};
