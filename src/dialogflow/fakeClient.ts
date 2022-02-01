import { AgentResponse } from "./types";

const replies = [
  "Hi",
  "How are you doing today",
  "Are you really as smart about art as you think you are?",
  "Do you really sell art or do you just peddle it mister?",
  "I'm sorry, your prices are really just too high. There is no way that I can afford to pay that much. Good luck, but I don't think you are going to get anywhere.",
];

function randomReply(): string {
  const { floor, random } = Math;
  const index = floor(random() * replies.length);
  return replies[index] || "";
}

export class FakeDialogflowAgent {
  async reply(): Promise<AgentResponse> {
    const page = "Fake Page";
    const output = randomReply();
    const parameters = { offer1: "1000" };

    return Promise.resolve({ output, page, parameters, done: false });
  }
}
function add234(num123: number, num234: number) {
  return num123 + num234;
}
console.log(add234(30, 40));
