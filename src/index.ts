import type { HttpFunction } from "@google-cloud/functions-framework/build/src/functions";
import path from "path";

import { ParticipantToAgentMessage, AgentToParticipantMessage } from "./types";
import { acceptsJson, getMonth } from "./helpers";
import { agent } from "./dialogflow/index";
import { projectId } from "./dialogflow/config";
import { CSV } from "./csv";
import { LogResponse, LogParameter } from "./dialogflow/types";
import { readResponses, expandParameters } from "./dialogflow/logging";
import { normalize } from "./normalize";

//import express from 'express';

//const https = require('https');
//import bodyParser from "body-parser";

//const app =express().use(bodyParser.json())

//const webClient=require('dialogflow-fulfillment');

const STATIC_DIR = path.join(__dirname, "../static/");
let negotiatedPrice:number;

export const index: HttpFunction = (_, res) => {
  const template = path.join(STATIC_DIR, "index.html");
  res.status(200).sendFile(template);
};

export const bundle: HttpFunction = (_, res) => {
  const bundle = path.join(STATIC_DIR, "bundle.js");
  res.status(200).sendFile(bundle);
};

export const message: HttpFunction = async (req, res) => {
  const { responseId, message, agentId } =
    req.body as ParticipantToAgentMessage;

  if (!acceptsJson(req)) {
    res.status(406).send("406 Not Acceptable");
  } else if (req.method !== "POST") {
    res.status(405).send("405 Method Not Allowed");
  } else {
    try {
      const { page, output, parameters, done } = await agent.reply({
        input: normalize(message),
        agentId,
        sessionId: responseId,
      });

      const response: AgentToParticipantMessage = {
        page,
        message: output,
        responseId,
        parameters,
        done,
      };
      res.status(200).json(response);
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .send("500 Server Error: There was an error with the chat service");
    }
  }
};

export const conversations: HttpFunction = async (req, res) => {
  const month = getMonth(req);
  const responses = readResponses(projectId, month);
  const csv = new CSV<LogResponse>([
    "responseId",
    "agentId",
    "sessionId",
    "timestamp",
    "request",
    "response",
  ]);

  res.set("transfer-encoding", "chunked");
  res.set("content-type", "text/csv");
  res.set("content-disposition", 'attachment; filename="conversations.csv"');
  res.write(csv.renderHeader());

  for await (const response of responses) {
    res.write(csv.render([response]));
  }

  res.end();
};

export const parameters: HttpFunction = async (req, res) => {
  const month = getMonth(req);
  const responses = readResponses(projectId, month);
  const csv = new CSV<LogParameter>([
    "responseId",
    "agentId",
    "sessionId",
    "timestamp",
    "name",
    "value",
  ]);

  res.set("transfer-encoding", "chunked");
  res.set("content-type", "text/csv");
  res.set("content-disposition", 'attachment; filename="parameters.csv"');
  res.write(csv.renderHeader());

  for await (const response of responses) {
    res.write(csv.render(expandParameters(response)));
  }

  res.end();
};

export const webhookCall: HttpFunction = async (req, res) => {
 
  console.log("inside webhookCall") 
  console.log(req.body)
  let jsonResponse = {};
try{
  let tag = req.body.fulfillmentInfo.tag;
  
  let params=req.body.sessionInfo.parameters
  let offer:any=Object.values(params); 
  console.log(offer+ "parameter value")
  
  if (tag == "negotiation_webhook1") {    
     negotiatedPrice = offer-(offer*0.4);
  }
  else if  (tag == "negotiation_webhook2") {    
     negotiatedPrice = offer-(offer*0.2);
  }
  else{
     negotiatedPrice = offer-(offer*0.1);
  }
    console.log(negotiatedPrice+"negotiated price")
    //fulfillment response to be sent to the agent if the request tag is equal to "welcome tag"
    jsonResponse = {
      fulfillment_response: {
        messages: [
          {
            text: {
              //fulfillment text response to be sent to the agent
              text: [`Good but that would be more, can you make it ${negotiatedPrice}`]
            }
          }
        ]
      }
    };
    res.json(jsonResponse);
  } 
  
     catch (e) {
      console.log(e);
      res
        .status(500)
        .send("500 Server Error: There was an error with the chat service");
    }
  
 
  }
  

export const devIndex: HttpFunction = (req, res) => {
  switch (req.path) {
    case "/index":
      return index(req, res);
    case "/message":
      return message(req, res);
    case "/bundle":
      return bundle(req, res);
    case "/conversations.csv":
      return conversations(req, res);
    case "/parameters.csv":
      return parameters(req, res);
     case "/webh":
      return webhookCall(req,res);
    default:
      res.status(404).send("Not found");
  }
};
