import { SessionsClient } from "@google-cloud/dialogflow-cx";
import { google } from "@google-cloud/dialogflow-cx/build/protos/protos";


import { transformMessages } from "./helpers";

import {
  AgentQuery,
  AgentResponse,
  DialogflowConfig,
  AgentParameters,
} from "./types";

//const client = new SessionsClient();

const transformParameters = (parameters: google.protobuf.IStruct) => {
 const  fields = parameters?.fields;
  const result: AgentParameters = {};

  if (!fields) {
    return result;
  }

  Object.keys(fields).forEach((key: string) => {
    const field: google.protobuf.IValue | undefined = fields[key];
    if (field?.numberValue !== null && field?.numberValue !== undefined) {
      result[key] = field.numberValue;
      console.log(result[key]+"inside client.ts session.parameters")
    } else if (field?.stringValue) {
      result[key] = field.stringValue;
      //console.log(result+"inside client.ts")
    } else if (field?.boolValue) {
      result[key] = field.boolValue;
      //console.log(result+"inside client.ts")
    } else {
      result[key] = null;
      //console.log(result+"inside client.ts")
    }
  });
 
  return result;
};


export class DialogflowAgent {
  client: SessionsClient;
  
  location: string;
  projectId: string;
  endPage = "End Session";

  

  constructor({ projectId, apiEndpoint, location }: DialogflowConfig) {
    this.location = location;
    this.projectId = projectId;
    this.client = new SessionsClient({
      projectId,
      apiEndpoint,
    });
  }

  async reply({
    input,
    sessionId,
    agentId,
  }: AgentQuery): Promise<AgentResponse> {
    const session = this.client.projectLocationAgentSessionPath(
      this.projectId,
      this.location,
      agentId,
      sessionId
    );

   
    console.info(session + "inside client.ts");
  
 
    const [response] = await this.client.detectIntent({
      session,
     
      queryInput: {
        text: { text: input },
        languageCode: "en-US",
      },
    });

    let parameterName="";
    let parameterValue=null;
   
    
    const parameters = transformParameters(
      response?.queryResult?.parameters || {} );
    const page = response?.queryResult?.currentPage?.displayName || "unknown";
    
      const keyValue = (par:any) => Object.entries(par).forEach(([key,value]) => {
        parameterName=key;
        parameterValue=value;
       console.log(key,value)
     })
     keyValue(parameters)
      
   const output = transformMessages(
      response?.queryResult?.responseMessages || []
    );
   
    

   console.info(response?.queryResult?.parameters?.fields+"inside client.ts, response parameters")
    console.info(response?.queryResult?.intent?.displayName+"displayname client.ts")

     //const sessionParams:[string,number]=JSON.stringify(parameters);
     console.log(JSON.stringify(parameters)+"inside client.ts variable parameters")

     console.log(Object.keys(parameters)+"trying to print sesion parameter key and value")
    
   
   
   
    console.log(output+"inside client.ts output");
 
    /*app.post("/",express.json(),(request,response)=>{

      console.log("inside webhookCall")
      const webagent =new webClient.WebhookClient({request:request,response:response})
      function welcome(){
      output="hello webhook"}
    
      let intents = new Map();
      intents.set("negbot1",welcome)
      webagent.handleRequest(intents)
    }
    
    )*/

     
   
   
    const done = page === this.endPage;

    return { output, page, parameters, done };
  }
}
