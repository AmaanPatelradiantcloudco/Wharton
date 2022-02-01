# Wharton Dialog Bot

An embeddable chat interface which wraps the [Dialogflow](https://cloud.google.com/dialogflow/cx/docs/) API for the purpose of research. Designed to be embedded in a [Qualtrics](https://www.qualtrics.com/) study

## Dependencies
- Nodejs 14.x
- Yarn
- Google Cloud SDK including gcloud CLI

## Local Setup

1. Install Nodejs runtime, Yarn package manager, and Google CLI
2. Clone repository `git clone git@github.com:promptworks/wharton-dialog-bot.git`
3. Change into root directory `cd wharton-dialog-bot`
4. Install node dependecies `yarn install`

## Dialogflow API
This project relies heavily on the Dialogflow API and service which is part of Google Cloud Platform.  It is not possible to run the Dialogflow service locally (AFAIK). For development purposes, there is a fake Dialogflow client which does not make external requests. The response from the bot will always be one of several phrases with some echoed parameters.

## Running without Dialogflow dependency
To use the fake client:

1. Change `CONNECT_TO_DIALOGFLOW` to false in the file `dialogflow/index.ts`.
2. Run `yarn dev`

## Running with Dialogflow in development
To connect to the Dialogflow API, you will need to get a set of API credentials for a service account.

1. Create a set of credentials for the correct project here: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Create and download a key to the service account in the json format
3. Move the key to the root of the repository. The example env expects the file to be named `credentials.json`.
4. `cp .env.example .env`
5. Edit `.env`
  - `GOOGLE_APPLICATION_CREDENTIALS` should point to the key from step 2
  - `GOOGLE_PRODUCT_ID` should be the ID of the project you will use
  - `DIALOGFLOW_LOCATION` and `DIALOGFLOW_ENDPOINT` will be dependent on the location you create your agents in.
6. Make sure `CONNECT_TO_DIALOGFLOW` is true in the file `dialogflow/index.tx`
7. Run `yarn dev`

## Viewing the app in the browser
The `yarn dev` command will run Google's functions framework locally and make the app available on localhost. The app will be at: ``
http://localhost:8080/index?agentId=<agentId>&sessionId=<sessionId>
There are several url parameters, some of which are required
1. `agentId` - GUID required - This parameter lets you set the agent you want to use. The agent id can be found in the Dialogflow console by examining the name of the agent, or the url when viewing an agent.
2. `responseId` - string required - This parameter is used to identify individual sessions, or chat threads, in Dialogflow, scoped to an agent. A new value will start a new chat. Reusing old ones can lead to unexpected behavior.
3. `debug` - boolean - This parameter will add extra UI for the purpose of seeing session parameters and the current page of the session.

## Check code
To check types, code style, and code formatting, run `yarn lint`

## Manual build
The developement server and the deploy process both build the app for you. If you are troubleshooting and want to build the app manually run `yarn build`

## Deploy
The app is deployed to a series of cloud functions which make calls to and from the Dialogflow API. You must have the glcoud command line tool installed, and be authenticated with a user that has access to the correct project.

The production functions are deployed to the `heartschat-prod-a505` project, but you may want to test your deployment first using a test project.

1. Authenticate with Google Cloud using `gcloud auth login`
2. Review the project variables in `.env` (see [Running with Dialogflow in development](#running-without-dialogflow-dependency) for more info)
4. Run `yarn deploy`
