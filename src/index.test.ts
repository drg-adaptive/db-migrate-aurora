const target = require("./index");

describe("connect function", () => {
  test("connect function should return a valid constructor", async () => {
    const result = await new Promise((resolve, reject) => {
      target.connect({}, {}, (error: any, data: any) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(data);
      });
    });

    expect(result).toHaveProperty("prototype.runSql");

    // @ts-ignore
    expect(typeof result.prototype.runSql).toEqual("function");

    console.info(JSON.stringify(result, null, 2));
  });
});
