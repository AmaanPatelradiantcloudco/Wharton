import { normalize } from "./normalize";

describe("normalize", () => {
  it("replaces words", () => {
    expect(normalize("three")).toEqual("3");
    expect(normalize("three hundred")).toEqual("300");
    expect(normalize("athree")).toEqual("athree");
    expect(normalize("threea")).toEqual("threea");
  });

  it("leaves articles alone", () => {
    expect(normalize("a dog")).toEqual("a dog");
  });

  it("removes commas", () => {
    expect(normalize("12,000")).toEqual("12000");
    expect(normalize("12,000,000")).toEqual("12000000");
    expect(normalize("12,00")).toEqual("12,00");
    expect(normalize(",000")).toEqual(",000");
    expect(normalize("a,000")).toEqual("a,000");
    expect(normalize("12,aaa,000")).toEqual("12,aaa,000");
  });

  it("removes dollar signs", () => {
    expect(normalize("$1")).toEqual("1");
    expect(normalize("$100")).toEqual("100");
    expect(normalize("$1000")).toEqual("1000");
    expect(normalize("$10.50")).toEqual("10.50");
    expect(normalize("a$1")).toEqual("a$1");
    expect(normalize("$1a")).toEqual("$1a");
  });

  it("treats 'k' as thousands", () => {
    expect(normalize("12k")).toEqual("12000");
    expect(normalize("120k")).toEqual("120000");
    expect(normalize("12,000k")).toEqual("12000000");
    expect(normalize("12ka")).toEqual("12ka");
    expect(normalize("a12k")).toEqual("a12k");
  });

  it("removes dollars and cents", () => {
    expect(normalize("4 dollars")).toEqual("4");
    expect(normalize("50 cents")).toEqual("0.50");
    expect(normalize("4 dollars and 50 cents")).toEqual("4.50");
    expect(normalize("a4 dollars")).toEqual("a4 dollars");
    expect(normalize("4 dollarsa")).toEqual("4 dollarsa");
  });
});
