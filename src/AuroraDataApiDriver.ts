import {
  Base as BaseDriver,
  InternalOptions,
  CallbackFunction,
  ColumnSpec,
  ColumnDef,
  ForeignKeyRules,
  RemoveForeignKeyOptions
} from "db-migrate-base";

import * as util from "util";
import * as moment from "moment";
import * as AWS from "aws-sdk";
import Bluebird from "bluebird";

export interface IInternalOptions extends InternalOptions {
  notransactions?: boolean;
  migrationTable?: string;
  seedTable?: string;
  dryRun?: boolean;
}

// @ts-ignore
interface IColumnSpec extends ColumnSpec {
  engine?: any;
  rowFormat?: any;
  onUpdate?: string;
  null?: boolean;
  name: string;
  length?: string | number;
}

interface ISwitchDatabaseOptions {
  database: string;
}

interface IDropDatabaseOptions {
  ifExists?: boolean;
}

export interface RDSParams {
  secretArn: string;
  resourceArn: string;
  database?: string;
  schema?: string;
  region: string;
}

export default class AuroraDataApiDriver extends BaseDriver {
  private connection: AWS.RDSDataService;
  private currentTransaction?: string;

  constructor(
    private internals: IInternalOptions,
    private rdsParams: RDSParams
  ) {
    super(internals);

    this.addSyncMethods();

    this.connection = new AWS.RDSDataService({
      apiVersion: "2018-08-01",
      region: rdsParams.region
    });
  }

  addSyncMethods() {
    Object.keys(this).forEach((key: string) => {
      if (!key.endsWith("Async")) {
        return;
      }

      // @ts-ignore
      const original = this[key] as (...args: any[]) => Bluebird<any>;
      const newKey = key.replace("Async", "");

      // @ts-ignore
      this[newKey] = function(...args: any[]) {
        const callback: CallbackFunction = args.pop();

        original.call(this, args).then(callback);
      };
    });
  }

  init() {}

  // @ts-ignore
  async startMigrationAsync(): Bluebird<any> {
    if (!this.internals.notransactions) {
      const { transactionId } = await this.connection
        .beginTransaction({
          resourceArn: this.rdsParams.resourceArn,
          secretArn: this.rdsParams.secretArn,
          database: this.rdsParams.database,
          schema: this.rdsParams.schema
        })
        .promise();

      this.currentTransaction = transactionId;
    }
  }

  // @ts-ignore
  async endMigrationAsync(): Bluebird<any> {
    if (!this.internals.notransactions) {
      await this.connection
        .commitTransaction({
          resourceArn: this.rdsParams.resourceArn,
          secretArn: this.rdsParams.secretArn,
          transactionId: this.currentTransaction
        })
        .promise();
    }
  }

  mapDataType(spec: any) {
    var len;
    const type = this.internals.mod.type;

    switch (spec.type) {
      case type.TEXT:
        len = parseInt(spec.length, 10) || 1000;
        if (len > 16777216) {
          return "LONGTEXT";
        }
        if (len > 65536) {
          return "MEDIUMTEXT";
        }
        if (len > 256) {
          return "TEXT";
        }
        return "TINYTEXT";
      case type.DATE_TIME:
        return "DATETIME";
      case type.BLOB:
        len = parseInt(spec.length, 10) || 1000;
        if (len > 16777216) {
          return "LONGBLOB";
        }
        if (len > 65536) {
          return "MEDIUMBLOB";
        }
        if (len > 256) {
          return "BLOB";
        }
        return "TINYBLOB";
      case type.BOOLEAN:
        return "TINYINT(1)";
    }

    return super.mapDataType(spec.type);
  }

  createColumnDef(
    name: string,
    spec: ColumnSpec & IColumnSpec,
    options?: any,
    tableName?: string
  ): ColumnDef {
    var escapedName = util.format("`%s`", name),
      t = this.mapDataType(spec),
      len;
    const type = this.internals.mod.type;

    if (spec.type !== type.TEXT && spec.type !== type.BLOB) {
      len = spec.length ? util.format("(%s)", spec.length) : "";
      if (t === "VARCHAR" && len === "") {
        len = "(255)";
      }
    }
    var constraint = this.createColumnConstraint(
      spec,
      options,
      tableName,
      name
    );
    return {
      foreignKey: constraint.foreignKey,
      constraints: [escapedName, t, len, constraint.constraints].join(" ")
    };
  }

  createColumnConstraint(
    spec: ColumnSpec & IColumnSpec,
    options?: any,
    tableName?: string,
    columnName?: string
  ): any {
    var constraint = [];
    var cb;

    if (spec.unsigned) {
      constraint.push("UNSIGNED");
    }

    if (spec.primaryKey) {
      if (!options || options.emitPrimaryKey) {
        constraint.push("PRIMARY KEY");
      }
    }

    if (spec.autoIncrement) {
      constraint.push("AUTO_INCREMENT");
    }

    if (spec.notNull === true) {
      constraint.push("NOT NULL");
    }

    if (spec.unique) {
      constraint.push("UNIQUE");
    }

    if (spec.engine && typeof spec.engine === "string") {
      constraint.push("ENGINE='" + spec.engine + "'");
    }

    if (spec.rowFormat && typeof spec.rowFormat === "string") {
      constraint.push("ROW_FORMAT='" + spec.rowFormat + "'");
    }

    if (spec.onUpdate && spec.onUpdate.startsWith("CURRENT_TIMESTAMP")) {
      constraint.push("ON UPDATE " + spec.onUpdate);
    }

    if (spec.null || spec.notNull === false) {
      constraint.push("NULL");
    }

    if (spec.defaultValue !== undefined) {
      constraint.push("DEFAULT");

      if (typeof spec.defaultValue === "string") {
        if (spec.defaultValue.startsWith("CURRENT_TIMESTAMP")) {
          constraint.push(spec.defaultValue);
        } else {
          constraint.push("'" + spec.defaultValue + "'");
        }
      } else if (spec.defaultValue === null) {
        constraint.push("NULL");
      } else {
        constraint.push(spec.defaultValue);
      }
    }

    if (spec.foreignKey) {
      cb = this.bindForeignKey(tableName, columnName, spec.foreignKey);
    }

    return { foreignKey: cb, constraints: constraint.join(" ") };
  }

  renameTableAsync(tableName: string, newTableName: string): Bluebird<any> {
    const sql = `RENAME TABLE \`${tableName}\` TO \`${newTableName}\``;
    return this.runSqlAsync(sql);
  }

  createDatabaseAsync(dbName: string, options: any): Bluebird<any> {
    var spec = "";
    const ifNotExists = options.ifNotExists === true ? "IF NOT EXISTS" : "";

    return this.runSqlAsync(
      `CREATE DATABASE ${ifNotExists} \`${dbName}\` ${spec}`
    );
  }

  async switchDatabaseAsync(
    options: ISwitchDatabaseOptions | string
  ): Bluebird<any> {
    if (typeof options === "string") {
      await this.allAsync(`USE \`${options}\``);
    } else if (options && options.database) {
      await this.allAsync(`USE \`${options.database}\``);
    }
  }

  dropDatabaseAsync(
    dbName: string,
    options?: IDropDatabaseOptions
  ): Bluebird<any> {
    let ifExists = "";

    if (options) {
      ifExists = "IF EXISTS";
    }

    return this.runSqlAsync(`DROP DATABASE ${ifExists} \`${dbName}\``);
  }

  removeColumnAsync(tableName: string, columnName: string): Bluebird<any> {
    return this.runSqlAsync(
      `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``
    );
  }

  addIndexAsync(
    tableName: string,
    indexName: string,
    columns: string | Array<string | IColumnSpec>,
    unique?: boolean
  ): Bluebird<any> {
    if (!Array.isArray(columns)) {
      columns = [columns];
    }

    var columnsList = columns.map((column: string | IColumnSpec) => {
      if (typeof column === "string") {
        return `\`${column}\``;
      } else if (column.name) {
        return `\`${column.name}\` ${
          column.length ? `(${column.length})` : ""
        }`;
      }

      throw new Error("Invalid column specification");
    });

    var sql = `ALTER TABLE \`${tableName}\` ADD ${
      unique ? "UNIQUE " : ""
    } INDEX \`${indexName}\` (${columnsList.join(", ")})`;
    return this.runSqlAsync(sql);
  }

  removeIndexAsync(tableName: string, indexName?: string): Bluebird<any> {
    // tableName is optional for other drivers, but required for mySql.
    // So, check the args to ensure they are valid
    if (!indexName) {
      throw new Error(
        'Illegal arguments, must provide "tableName" and "indexName"'
      );
    }

    return this.runSqlAsync(`DROP INDEX \`${indexName}\` ON \`${tableName}\``);
  }

  async renameColumnAsync(
    tableName: string,
    oldColumnName: string,
    newColumnName: string
  ): Bluebird<any> {
    const columnTypeSql = `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}' AND COLUMN_NAME = '${oldColumnName}'`;

    const result = await this.runSqlAsync(columnTypeSql);
    const columnType = result[0].COLUMN_TYPE;
    const alterSql = `ALTER TABLE \`${tableName}\` CHANGE \`${oldColumnName}\` \`${newColumnName}\` ${columnType}`;

    return this.runSqlAsync(alterSql);
  }

  async changeColumnAsync(
    tableName: string,
    columnName: string,
    columnSpec: ColumnSpec & IColumnSpec
  ): Bluebird<any> {
    var constraint = this.createColumnDef(columnName, columnSpec);
    var sql = `ALTER TABLE \`${tableName}\` CHANGE COLUMN \`${columnName}\` ${
      constraint.constraints
    }`;

    if (columnSpec.unique === false) {
      await this.removeIndexAsync(tableName, columnName);
    }

    await this.runSqlAsync(sql);

    if (constraint.foreignKey) {
      return constraint.foreignKey();
    }
  }

  private static getInternalTableInsert = (tableName: string): string =>
    `INSERT INTO \`${tableName}\ (\`name\`, \`run_on\`) VALUES (:name, :run_on)`;

  addMigrationRecordAsync(name: string): Bluebird<any> {
    var formattedDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return this.runSqlAsync(
      AuroraDataApiDriver.getInternalTableInsert(this.internals.migrationTable),
      [
        { name: "name", value: { stringValue: name } },
        { name: "run_on", value: { stringValue: formattedDate } }
      ]
    );
  }

  addSeedRecordAsync(name: string): Bluebird<any> {
    var formattedDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return this.runSqlAsync(
      AuroraDataApiDriver.getInternalTableInsert(this.internals.seedTable),
      [
        { name: "name", value: { stringValue: name } },
        { name: "run_on", value: { stringValue: formattedDate } }
      ]
    );
  }

  addForeignKeyAsync(
    tableName: string,
    referencedTableName: string,
    keyName: string,
    fieldMapping: any,
    rules: ForeignKeyRules | any = {}
  ): Bluebird<any> {
    var columns = Object.keys(fieldMapping);
    var referencedColumns = columns.map((key: string) => fieldMapping[key]);

    var sql = util.format(
      "ALTER TABLE `%s` ADD CONSTRAINT `%s` FOREIGN KEY (%s) REFERENCES `%s` (%s) ON DELETE %s ON UPDATE %s",
      tableName,
      keyName,
      this.quoteDDLArr(columns),
      referencedTableName,
      this.quoteDDLArr(referencedColumns),
      rules.onDelete || "NO ACTION",
      rules.onUpdate || "NO ACTION"
    );

    return this.runSqlAsync(sql);
  }

  async removeForeignKeyAsync(
    tableName: string,
    keyName: string,
    options?: RemoveForeignKeyOptions
  ): Bluebird<any> {
    const sql = `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${keyName}\``;

    await this.runSqlAsync(sql);

    if (options && options.dropIndex) {
      return this.runSqlAsync(
        `ALTER TABLE \`${tableName}\` DROP INDEX \`${keyName}\``
      );
    }
  }

  runSqlAsync(
    sql?: string,
    parameters?: Array<AWS.RDSDataService.SqlParameter>
  ): Bluebird<any> {
    this.logSqlArgs(arguments);

    if (this.internals.dryRun) {
      return Bluebird.resolve();
    }

    console.info(parameters);

    const params: AWS.RDSDataService.ExecuteStatementRequest = {
      secretArn: this.rdsParams.secretArn,
      resourceArn: this.rdsParams.resourceArn,
      database: this.rdsParams.database,
      schema: this.rdsParams.schema,
      transactionId: this.currentTransaction,
      parameters,
      sql
    };

    const executeStatement = Bluebird.promisify(
      this.connection.executeStatement
    ).bind(this.connection);
    return executeStatement(params);
  }

  private logSqlArgs(...args: any[]) {
    this.internals.mod.log.sql.apply(null, args);
  }

  allAsync(
    sql: string,
    parameters?: Array<AWS.RDSDataService.SqlParameter>
  ): Bluebird<any> {
    return this.runSqlAsync(sql, parameters);
  }

  closeAsync(): Bluebird<any> {
    return Bluebird.resolve();
  }
}
