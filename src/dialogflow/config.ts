import dotenv from "dotenv";

const env = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing config: ${key}`);
  console.log(value);
  return value;
};

dotenv.config();

export const location = env("DIALOGFLOW_LOCATION");
export const apiEndpoint = env("DIALOGFLOW_ENDPOINT");
export const projectId = env("GOOGLE_PROJECT_ID");
export const credentials = env("GOOGLE_APPLICATION_CREDENTIALS");
export const useFake = true;
