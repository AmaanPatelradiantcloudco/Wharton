import type { Request } from "express";

export const acceptsJson = (req: Request): boolean => {
  const accept = req.header("Accept");
  return accept?.includes("json") || false;
};

export const getMonth = (req: Request): Date => {
  const value = req.query.month;

  if (typeof value === "string") {
    const date = new Date(value);

    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
};
