import AuroraDataApiDriver from "./AuroraDataApiDriver";

describe("can run basic queries", () => {
  test("can run select on db", async () => {
    const db = new AuroraDataApiDriver(
      {
        mod: {
          type: "aurora-data-api",
          log: {
            sql: (err: any, data: any) => {
              if (err) {
                console.error(err);
              }

              if (data) {
                console.info(`SQL: ${data}`);
              }
            }
          }
        }
      },
      {
        database: process.env.DB_DATABASE,
        schema: process.env.DB_DATABASE,
        secretArn: process.env.DB_SECRET,
        resourceArn: process.env.DB_ARN,
        region: process.env.DB_REGION
      }
    );

    const result = await db.runSqlAsync("SELECT * from user");
    expect(result).toBeTruthy();
  });
});
