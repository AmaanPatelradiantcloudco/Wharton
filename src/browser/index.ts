import { createAgent } from "./agent";
import { UI } from "./ui";
import { AgentToParticipantMessage } from "../types";
/* --------- UI -------------------------------------*/
const ui = new UI(
  {
    messages: document.getElementById("messages") as HTMLElement,
    form: document.getElementById("form") as HTMLFormElement,
    input: document.getElementById("input") as HTMLInputElement,
    submit: document.getElementById("submit") as HTMLButtonElement,
    errors: document.getElementById("errors") as HTMLElement,
    info: document.getElementById("info") as HTMLElement,
  },
  { onSubmit: participantMessage }
);
/* --------- Agent -------------------------------------*/
const params = new URLSearchParams(location.search);
//const responseId = params.get("responseId");
//const agentId = params.get("agentId");
const debug = Boolean(params.get("debug"));
//const responseId = "qwerty";
//const agentId = "5e2cead0-2a3c-40bc-b788-6a07ba76ddd7";
//const sessionId="qwerty"
console.log("inside browser index.ts");
let agent: (message: string) => Promise<AgentToParticipantMessage>;
try {
  //agent = createAgent(responseId, agentId);
  agent = createAgent("qwerty", "5e2cead0-2a3c-40bc-b788-6a07ba76ddd7");
} catch (e: any) {
  ui.setErrors([e]);
  throw e;
}
/* --------- Submission ---------------------------------*/
const delay = (minSeconds = 2, maxSeconds = 5) => {
  const min = minSeconds * 1000;
  const max = maxSeconds * 1000;
  const ms = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};
const typingDelay = (length: number) => {
  const minDelay = 0.5;
  const minTypingDelay = 0.08 * length + minDelay;
  const maxTypingDelay = 0.1 * length + minDelay;
  return delay(minTypingDelay, maxTypingDelay);
};
let participantQueue: string[] = ["Hello"];
let waitingToSend = false;
const agentQueue: AgentToParticipantMessage[] = [];
let agentTyping = false;
let chatTerminated = false;
function participantMessage(value: string): void {
  // print the participant message to the screen
  ui.appendParticipantMessage(value);
  // push the message to the queue to be sent soon
  participantQueue.push(value);
  // if there is no timer running, set one, so that we can
  if (!waitingToSend) {
    participantSendProcess();
  }
}
async function participantSendProcess(): Promise<void> {
  // Set send timer state so we can avoid running this
  // process twice and sending an empty message
  waitingToSend = true;
  // Create a delay and allow any messages in
  // that time to be added to the queue.
  await delay(2, 3);
  // Join the messages in the queue
  const messages = participantQueue.join("\n");
  // Clear the queue
  participantQueue = [];
  // Clear the timer
  waitingToSend = false;
  // Check to see if the agent has arrived in the end state
  if (chatTerminated) {
    return;
  }
  // Send the messages as one
  const agentMessage = await agent(messages);
  // Update the debug panel
  if (debug) {
    ui.setParameters(agentMessage.parameters);
    ui.setPage(agentMessage.page);
  }
  // Push the message on a queue and trigger the response
  agentQueue.push(agentMessage);
  if (!agentTyping) {
    agentResponseProcess();
  }
}
async function agentResponseProcess(): Promise<void> {
  agentTyping = true;
  while (agentTyping) {
    const message = agentQueue.shift();
    if (message && !chatTerminated) {
      await typeAgentMessage(message);
    }
    await delay(1, 1);
    if (agentQueue.length === 0) {
      agentTyping = false;
    }
  }
}
async function typeAgentMessage(
  agentMessage: AgentToParticipantMessage
): Promise<void> {
  // Set chat state if conversation is over,
  // but do not yet end conversation as agent
  // has yet to finish fake typing
  if (agentMessage.done) {
    chatTerminated = true;
  }
  // Show typing indicator if it is not being shown
  ui.setTypingStatus(true);
  // Wait while agent is fake typing
  await typingDelay(agentMessage.message.length);
  // Set typing status to false because this message is done
  ui.setTypingStatus(false);
  // Update ui
  ui.appendAgentMessage(agentMessage.message);
  // Now end conversation if the agent is done
  if (agentMessage.done) {
    endConversation();
  }
}
async function endConversation(): Promise<void> {
  await delay(3, 5);
  ui.setConversationEnded(true);
}
export async function sendStartMessage(): Promise<void> {
  waitingToSend = true;
  await delay(1, 1);
  participantSendProcess();
}
sendStartMessage();
