import { DialogflowAgent } from "./client";
import { FakeDialogflowAgent } from "./fakeClient";

import { location, apiEndpoint, projectId, useFake } from "./config";

const fakeAgent = new FakeDialogflowAgent();
const realAgent = new DialogflowAgent({
  location,
  apiEndpoint,
  projectId,
});
export const agent = useFake ? realAgent : fakeAgent;
console.log(agent);
