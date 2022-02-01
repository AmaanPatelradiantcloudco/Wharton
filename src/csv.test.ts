import { CSV } from "./csv";

interface Foo {
  name: string;
  value: number;
}

const csv = new CSV<Foo>(["name", "value"]);

test("renderHeader", () => {
  expect(csv.renderHeader()).toEqual("name,value\n");
});

test("render", () => {
  const a = { name: "a", value: 1 };
  const b = { name: "b", value: 2 };
  expect(csv.render([a, b])).toEqual("a,1\nb,2\n");
});

test("render escapes", () => {
  const subject = { name: "bond, james bond", value: 1 };
  expect(csv.render([subject])).toEqual('"bond, james bond",1\n');
});
