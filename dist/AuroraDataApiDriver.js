"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var db_migrate_base_1 = require("db-migrate-base");
var util = require("util");
var moment = require("moment");
var AWS = require("aws-sdk");
var bluebird_1 = require("bluebird");
var AuroraDataApiDriver = /** @class */ (function (_super) {
    __extends(AuroraDataApiDriver, _super);
    function AuroraDataApiDriver(internals, rdsParams) {
        var _this = _super.call(this, internals) || this;
        _this.internals = internals;
        _this.rdsParams = rdsParams;
        _this.addSyncMethods();
        _this.connection = new AWS.RDSDataService({
            apiVersion: "2018-08-01",
            region: rdsParams.region
        });
        return _this;
    }
    AuroraDataApiDriver.prototype.addSyncMethods = function () {
        var _this = this;
        Object.keys(this).forEach(function (key) {
            if (!key.endsWith("Async")) {
                return;
            }
            // @ts-ignore
            var original = _this[key];
            var newKey = key.replace("Async", "");
            // @ts-ignore
            _this[newKey] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var callback = args.pop();
                original.call(this, args).then(callback);
            };
        });
    };
    AuroraDataApiDriver.prototype.init = function () { };
    // @ts-ignore
    AuroraDataApiDriver.prototype.startMigrationAsync = function () {
        return __awaiter(this, void 0, bluebird_1.default, function () {
            var transactionId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.internals.notransactions) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connection
                                .beginTransaction({
                                resourceArn: this.rdsParams.resourceArn,
                                secretArn: this.rdsParams.secretArn,
                                database: this.rdsParams.database,
                                schema: this.rdsParams.schema
                            })
                                .promise()];
                    case 1:
                        transactionId = (_a.sent()).transactionId;
                        this.currentTransaction = transactionId;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    // @ts-ignore
    AuroraDataApiDriver.prototype.endMigrationAsync = function () {
        return __awaiter(this, void 0, bluebird_1.default, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.internals.notransactions) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connection
                                .commitTransaction({
                                resourceArn: this.rdsParams.resourceArn,
                                secretArn: this.rdsParams.secretArn,
                                transactionId: this.currentTransaction
                            })
                                .promise()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    AuroraDataApiDriver.prototype.mapDataType = function (spec) {
        var len;
        var type = this.internals.mod.type;
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
        return _super.prototype.mapDataType.call(this, spec.type);
    };
    AuroraDataApiDriver.prototype.createColumnDef = function (name, spec, options, tableName) {
        var escapedName = util.format("`%s`", name), t = this.mapDataType(spec), len;
        var type = this.internals.mod.type;
        if (spec.type !== type.TEXT && spec.type !== type.BLOB) {
            len = spec.length ? util.format("(%s)", spec.length) : "";
            if (t === "VARCHAR" && len === "") {
                len = "(255)";
            }
        }
        var constraint = this.createColumnConstraint(spec, options, tableName, name);
        return {
            foreignKey: constraint.foreignKey,
            constraints: [escapedName, t, len, constraint.constraints].join(" ")
        };
    };
    AuroraDataApiDriver.prototype.createColumnConstraint = function (spec, options, tableName, columnName) {
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
                }
                else {
                    constraint.push("'" + spec.defaultValue + "'");
                }
            }
            else if (spec.defaultValue === null) {
                constraint.push("NULL");
            }
            else {
                constraint.push(spec.defaultValue);
            }
        }
        if (spec.foreignKey) {
            cb = this.bindForeignKey(tableName, columnName, spec.foreignKey);
        }
        return { foreignKey: cb, constraints: constraint.join(" ") };
    };
    AuroraDataApiDriver.prototype.renameTableAsync = function (tableName, newTableName) {
        var sql = "RENAME TABLE `" + tableName + "` TO `" + newTableName + "`";
        return this.runSqlAsync(sql);
    };
    AuroraDataApiDriver.prototype.createDatabaseAsync = function (dbName, options) {
        var spec = "";
        var ifNotExists = options.ifNotExists === true ? "IF NOT EXISTS" : "";
        return this.runSqlAsync("CREATE DATABASE " + ifNotExists + " `" + dbName + "` " + spec);
    };
    AuroraDataApiDriver.prototype.switchDatabaseAsync = function (options) {
        return __awaiter(this, void 0, bluebird_1.default, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(typeof options === "string")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.allAsync("USE `" + options + "`")];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(options && options.database)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.allAsync("USE `" + options.database + "`")];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AuroraDataApiDriver.prototype.dropDatabaseAsync = function (dbName, options) {
        var ifExists = "";
        if (options) {
            ifExists = "IF EXISTS";
        }
        return this.runSqlAsync("DROP DATABASE " + ifExists + " `" + dbName + "`");
    };
    AuroraDataApiDriver.prototype.removeColumnAsync = function (tableName, columnName) {
        return this.runSqlAsync("ALTER TABLE `" + tableName + "` DROP COLUMN `" + columnName + "`");
    };
    AuroraDataApiDriver.prototype.addIndexAsync = function (tableName, indexName, columns, unique) {
        if (!Array.isArray(columns)) {
            columns = [columns];
        }
        var columnsList = columns.map(function (column) {
            if (typeof column === "string") {
                return "`" + column + "`";
            }
            else if (column.name) {
                return "`" + column.name + "` " + (column.length ? "(" + column.length + ")" : "");
            }
            throw new Error("Invalid column specification");
        });
        var sql = "ALTER TABLE `" + tableName + "` ADD " + (unique ? "UNIQUE " : "") + " INDEX `" + indexName + "` (" + columnsList.join(", ") + ")";
        return this.runSqlAsync(sql);
    };
    AuroraDataApiDriver.prototype.removeIndexAsync = function (tableName, indexName) {
        // tableName is optional for other drivers, but required for mySql.
        // So, check the args to ensure they are valid
        if (!indexName) {
            throw new Error('Illegal arguments, must provide "tableName" and "indexName"');
        }
        return this.runSqlAsync("DROP INDEX `" + indexName + "` ON `" + tableName + "`");
    };
    AuroraDataApiDriver.prototype.renameColumnAsync = function (tableName, oldColumnName, newColumnName) {
        return __awaiter(this, void 0, bluebird_1.default, function () {
            var columnTypeSql, result, columnType, alterSql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        columnTypeSql = "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tableName + "' AND COLUMN_NAME = '" + oldColumnName + "'";
                        return [4 /*yield*/, this.runSqlAsync(columnTypeSql)];
                    case 1:
                        result = _a.sent();
                        columnType = result[0].COLUMN_TYPE;
                        alterSql = "ALTER TABLE `" + tableName + "` CHANGE `" + oldColumnName + "` `" + newColumnName + "` " + columnType;
                        return [2 /*return*/, this.runSqlAsync(alterSql)];
                }
            });
        });
    };
    AuroraDataApiDriver.prototype.changeColumnAsync = function (tableName, columnName, columnSpec) {
        return __awaiter(this, void 0, bluebird_1.default, function () {
            var constraint, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        constraint = this.createColumnDef(columnName, columnSpec);
                        sql = "ALTER TABLE `" + tableName + "` CHANGE COLUMN `" + columnName + "` " + constraint.constraints;
                        if (!(columnSpec.unique === false)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.removeIndexAsync(tableName, columnName)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.runSqlAsync(sql)];
                    case 3:
                        _a.sent();
                        if (constraint.foreignKey) {
                            return [2 /*return*/, constraint.foreignKey()];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AuroraDataApiDriver.prototype.addMigrationRecordAsync = function (name) {
        var formattedDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        return this.runSqlAsync(AuroraDataApiDriver.getInternalTableInsert(this.internals.migrationTable), [
            { name: "name", value: { stringValue: name } },
            { name: "run_on", value: { stringValue: formattedDate } }
        ]);
    };
    AuroraDataApiDriver.prototype.addSeedRecordAsync = function (name) {
        var formattedDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        return this.runSqlAsync(AuroraDataApiDriver.getInternalTableInsert(this.internals.seedTable), [
            { name: "name", value: { stringValue: name } },
            { name: "run_on", value: { stringValue: formattedDate } }
        ]);
    };
    AuroraDataApiDriver.prototype.addForeignKeyAsync = function (tableName, referencedTableName, keyName, fieldMapping, rules) {
        if (rules === void 0) { rules = {}; }
        var columns = Object.keys(fieldMapping);
        var referencedColumns = columns.map(function (key) { return fieldMapping[key]; });
        var sql = util.format("ALTER TABLE `%s` ADD CONSTRAINT `%s` FOREIGN KEY (%s) REFERENCES `%s` (%s) ON DELETE %s ON UPDATE %s", tableName, keyName, this.quoteDDLArr(columns), referencedTableName, this.quoteDDLArr(referencedColumns), rules.onDelete || "NO ACTION", rules.onUpdate || "NO ACTION");
        return this.runSqlAsync(sql);
    };
    AuroraDataApiDriver.prototype.removeForeignKeyAsync = function (tableName, keyName, options) {
        return __awaiter(this, void 0, bluebird_1.default, function () {
            var sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "ALTER TABLE `" + tableName + "` DROP FOREIGN KEY `" + keyName + "`";
                        return [4 /*yield*/, this.runSqlAsync(sql)];
                    case 1:
                        _a.sent();
                        if (options && options.dropIndex) {
                            return [2 /*return*/, this.runSqlAsync("ALTER TABLE `" + tableName + "` DROP INDEX `" + keyName + "`")];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AuroraDataApiDriver.prototype.runSqlAsync = function (sql, parameters) {
        this.logSqlArgs(arguments);
        if (this.internals.dryRun) {
            return bluebird_1.default.resolve();
        }
        console.info(parameters);
        var params = {
            secretArn: this.rdsParams.secretArn,
            resourceArn: this.rdsParams.resourceArn,
            database: this.rdsParams.database,
            schema: this.rdsParams.schema,
            transactionId: this.currentTransaction,
            parameters: parameters,
            sql: sql
        };
        var executeStatement = bluebird_1.default.promisify(this.connection.executeStatement).bind(this.connection);
        return executeStatement(params);
    };
    AuroraDataApiDriver.prototype.logSqlArgs = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.internals.mod.log.sql.apply(null, args);
    };
    AuroraDataApiDriver.prototype.allAsync = function (sql, parameters) {
        return this.runSqlAsync(sql, parameters);
    };
    AuroraDataApiDriver.prototype.closeAsync = function () {
        return bluebird_1.default.resolve();
    };
    AuroraDataApiDriver.getInternalTableInsert = function (tableName) {
        return "INSERT INTO `" + tableName + " (`name`, `run_on`) VALUES (:name, :run_on)";
    };
    return AuroraDataApiDriver;
}(db_migrate_base_1.Base));
exports.default = AuroraDataApiDriver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVyb3JhRGF0YUFwaURyaXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9BdXJvcmFEYXRhQXBpRHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBUXlCO0FBRXpCLDJCQUE2QjtBQUM3QiwrQkFBaUM7QUFDakMsNkJBQStCO0FBQy9CLHFDQUFnQztBQW1DaEM7SUFBaUQsdUNBQVU7SUFJekQsNkJBQ1UsU0FBMkIsRUFDM0IsU0FBb0I7UUFGOUIsWUFJRSxrQkFBTSxTQUFTLENBQUMsU0FRakI7UUFYUyxlQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUMzQixlQUFTLEdBQVQsU0FBUyxDQUFXO1FBSTVCLEtBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUV0QixLQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQztZQUN2QyxVQUFVLEVBQUUsWUFBWTtZQUN4QixNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU07U0FDekIsQ0FBQyxDQUFDOztJQUNMLENBQUM7SUFFRCw0Q0FBYyxHQUFkO1FBQUEsaUJBaUJDO1FBaEJDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBVztZQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDMUIsT0FBTzthQUNSO1lBRUQsYUFBYTtZQUNiLElBQU0sUUFBUSxHQUFHLEtBQUksQ0FBQyxHQUFHLENBQXNDLENBQUM7WUFDaEUsSUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFeEMsYUFBYTtZQUNiLEtBQUksQ0FBQyxNQUFNLENBQUMsR0FBRztnQkFBUyxjQUFjO3FCQUFkLFVBQWMsRUFBZCxxQkFBYyxFQUFkLElBQWM7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