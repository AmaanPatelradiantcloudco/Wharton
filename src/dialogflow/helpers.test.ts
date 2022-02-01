import { transformMessages } from "./helpers";

test("transformMessages", () => {
  const messages = [
    { text: { text: ["I", "am"] } },
    { text: { text: ["a", "message"] } },
  ];

  expect(transformMessages(messages)).toEqual("I am\na message");
});
