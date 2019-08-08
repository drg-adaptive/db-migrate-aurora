import {
  InternalOptions,
  CallbackFunction,
  ColumnSpec,
  ColumnDef,
  ForeignKeyRules,
  RemoveForeignKeyOptions
} from "db-migrate-base";

const BaseDriver = require("db-migrate-base");

import * as util from "util";
import * as moment from "moment";
import * as AWS from "aws-sdk";
import Bluebird = require("bluebird");

function getFieldSize(spec: any): string {
  const len = parseInt(spec.length, 10) || 1000;

  if (len > 16777216) return "LONG";
  if (len > 65536) return "MEDIUM";
  if (len > 256) return "";
  return "TINY";
}

function findColumnLength(
  spec: ColumnSpec & IColumnSpec,
  dataType: string,
  type: any
): string | undefined {
  let len;

  if (spec.type === type.TEXT || spec.type === type.BLOB) {
    return len;
  }

  if (spec.length) {
    len = `(${spec.length})`;
  } else if (dataType === "VARCHAR") {
    len = "(255)";
  }

  return len;
}

export interface IInternalOptions extends InternalOptions {
  notransactions?: boolean;
  migrationTable?: string;
  seedTable?: string;
  dryRun?: boolean;
  rdsParams?: RDSParams;
  connection: AWS.RDSDataService;
  currentTransaction: string;
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
  _escapeDDL: string;
  _escapeString: string;

  constructor(private internals: IInternalOptions, rdsParams: RDSParams) {
    super(internals);

    this._escapeDDL = "`";
    this._escapeString = "'";

    this.internals.rdsParams = rdsParams;
    this.internals.connection = new AWS.RDSDataService({
      apiVersion: "2018-08-01",
      region: rdsParams.region
    });
  }

  // @ts-ignore
  async startMigration(): Bluebird<any> {
    if (!this.internals.notransactions) {
      const { transactionId } = await this.connection
        .beginTransaction({
          resourceArn: this.internals.rdsParams.resourceArn,
          secretArn: this.internals.rdsParams.secretArn,
          database: this.internals.rdsParams.database,
          schema: this.internals.rdsParams.schema
        })
        .promise();

      this.internals.currentTransaction = transactionId;
    }
  }

  // @ts-ignore
  async endMigration(): Bluebird<any> {
    if (!this.internals.notransactions) {
      await this.connection
        .commitTransaction({
          resourceArn: this.internals.rdsParams.resourceArn,
          secretArn: this.internals.rdsParams.secretArn,
          transactionId: this.internals.currentTransaction
        })
        .promise();
    }
  }

  mapDataType(spec: any) {
    const size = getFieldSize(spec);
    const type = this.internals.mod.type;

    switch (spec.type) {
      case type.TEXT:
        return `${size}TEXT`;
      case type.DATE_TIME:
        return "DATETIME";
      case type.BLOB:
        return `${size}BLOB`;
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
    const escapedName = util.format("`%s`", name);
    const dataType = this.mapDataType(spec);

    let len = findColumnLength(spec, dataType, this.internals.mod.type);
    var constraint = this.createColumnConstraint(
      spec,
      options,
      tableName,
      name
    );
    return {
      foreignKey: constraint.foreignKey,
      constraints: [escapedName, dataType, len, constraint.constraints].join(
        " "
      )
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

    function addConstraint(label: string, value?: string) {
      if (!value || typeof value !== "string") return;

      constraint.push(`${label}='${value}'`);
    }

    addConstraint("ENGINE", spec.engine);
    addConstraint("ROW_FORMAT", spec.rowFormat);

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

  renameTable(tableName: string, newTableName: string): Bluebird<any> {
    const sql = `RENAME TABLE \`${tableName}\` TO \`${newTableName}\``;
    return this.runSql(sql);
  }

  createDatabase(dbName: string, options: any): Bluebird<any> {
    var spec = "";
    const ifNotExists = options.ifNotExists === true ? "IF NOT EXISTS" : "";

    return this.runSql(`CREATE DATABASE ${ifNotExists} \`${dbName}\` ${spec}`);
  }

  async switchDatabase(
    options: ISwitchDatabaseOptions | string
  ): Bluebird<any> {
    if (typeof options === "string") {
      await this.all(`USE \`${options}\``);
    } else if (options && options.database) {
      await this.all(`USE \`${options.database}\``);
    }
  }

  dropDatabase(dbName: string, options?: IDropDatabaseOptions): Bluebird<any> {
    let ifExists = "";

    if (options) {
      ifExists = "IF EXISTS";
    }

    return this.runSql(`DROP DATABASE ${ifExists} \`${dbName}\``);
  }

  removeColumn(tableName: string, columnName: string): Bluebird<any> {
    return this.runSql(
      `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``
    );
  }

  addIndex(
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
    return this.runSql(sql);
  }

  removeIndex(tableName: string, indexName?: string): Bluebird<any> {
    // tableName is optional for other drivers, but required for mySql.
    // So, check the args to ensure they are valid
    if (!indexName) {
      throw new Error(
        'Illegal arguments, must provide "tableName" and "indexName"'
      );
    }

    return this.runSql(`DROP INDEX \`${indexName}\` ON \`${tableName}\``);
  }

  async renameColumn(
    tableName: string,
    oldColumnName: string,
    newColumnName: string
  ): Bluebird<any> {
    const columnTypeSql = `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}' AND COLUMN_NAME = '${oldColumnName}'`;

    const result = await this.runSql(columnTypeSql);
    const columnType = result[0].COLUMN_TYPE;
    const alterSql = `ALTER TABLE \`${tableName}\` CHANGE \`${oldColumnName}\` \`${newColumnName}\` ${columnType}`;

    return this.runSql(alterSql);
  }

  async changeColumn(
    tableName: string,
    columnName: string,
    columnSpec: ColumnSpec & IColumnSpec
  ): Bluebird<any> {
    var constraint = this.createColumnDef(columnName, columnSpec);
    var sql = `ALTER TABLE \`${tableName}\` CHANGE COLUMN \`${columnName}\` ${
      constraint.constraints
    }`;

    if (columnSpec.unique === false) {
      await this.removeIndex(tableName, columnName);
    }

    await this.runSql(sql);

    if (constraint.foreignKey) {
      return constraint.foreignKey();
    }
  }

  protected addPrivateTableData(
    name: string,
    tableName: string
  ): Bluebird<any> {
    var formattedDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return this.runSql(
      `INSERT INTO \`${tableName}\ (\`name\`, \`run_on\`) VALUES (:name, :run_on)`,
      [
        { name: "name", value: { stringValue: name } },
        { name: "run_on", value: { stringValue: formattedDate } }
      ]
    );
  }

  addMigrationRecord(name: string): Bluebird<any> {
    return this.addPrivateTableData(name, this.internals.migrationTable);
  }

  addSeedRecord(name: string): Bluebird<any> {
    return this.addPrivateTableData(name, this.internals.seedTable);
  }

  addForeignKey(
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

    return this.runSql(sql);
  }

  async removeForeignKey(
    tableName: string,
    keyName: string,
    options?: RemoveForeignKeyOptions
  ): Bluebird<any> {
    const sql = `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${keyName}\``;

    await this.runSql(sql);

    if (options && options.dropIndex) {
      return this.runSql(
        `ALTER TABLE \`${tableName}\` DROP INDEX \`${keyName}\``
      );
    }
  }

  runSql(
    sql?: string,
    parameters?: Array<AWS.RDSDataService.SqlParameter>
  ): Bluebird<any> {
    this.internals.mod.log.sql.apply(null, arguments);

    if (this.internals.dryRun) {
      return Bluebird.resolve();
    }

    const params: AWS.RDSDataService.ExecuteStatementRequest = {
      secretArn: this.internals.rdsParams.secretArn,
      resourceArn: this.internals.rdsParams.resourceArn,
      database: this.internals.rdsParams.database,
      schema: this.internals.rdsParams.schema,
      transactionId: this.internals.currentTransaction,
      parameters,
      sql
    };

    // @ts-ignore
    const exec = Bluebird.promisify(this.internals.connection.executeStatement);
    return exec.call(this.internals.connection, params);
  }

  all(
    sql: string,
    parameters?: Array<AWS.RDSDataService.SqlParameter>
  ): Bluebird<any> {
    return this.runSql(sql, parameters);
  }

  close(): Bluebird<any> {
    return Bluebird.resolve();
  }
}

// function addSyncMethods() {
//   Object.keys(AuroraDataApiDriver.prototype).forEach((key: string) => {
//     if (!key.endsWith("Async")) {
//       return;
//     }

//     // @ts-ignore
//     const original = AuroraDataApiDriver.prototype[key] as (
//       ...args: any[]
//     ) => Bluebird<any>;
//     const newKey = key.replace("Async", "");

//     // @ts-ignore
//     AuroraDataApiDriver.prototype[newKey] = function(...args: any[]) {
//       const callback: CallbackFunction = args.pop();

//       original.apply(this, args).then(callback);
//     };
//   });

//   return AuroraDataApiDriver;
// }

// export default addSyncMethods();
