"use strict";
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var AuroraDataApiDriver_1 = require("./AuroraDataApiDriver");
describe("can run basic queries", function () {
    test("can run select on db", function () { return __awaiter(_this, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = new AuroraDataApiDriver_1.default({
                        mod: {
                            type: "aurora-data-api",
                            log: {
                                sql: function (err, data) {
                                    if (err) {
                                        console.error(err);
                                    }
                                    if (data) {
                                        console.info("SQL: " + data);
                                    }
                                }
                            }
                        }
                    }, {
                        database: process.env.DB_DATABASE,
                        schema: process.env.DB_DATABASE,
                        secretArn: process.env.DB_SECRET,
                        resourceArn: process.env.DB_ARN,
                        region: process.env.DB_REGION
                    });
                    return [4 /*yield*/, db.runSqlAsync("SELECT * from user")];
                case 1:
                    result = _a.sent();
                    console.info(result);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVyb3JhRGF0YUFwaURyaXZlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0F1cm9yYURhdGFBcGlEcml2ZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkFtQ0E7O0FBbkNBLDZEQUF3RDtBQUV4RCxRQUFRLENBQUMsdUJBQXVCLEVBQUU7SUFDaEMsSUFBSSxDQUFDLHNCQUFzQixFQUFFOzs7OztvQkFDckIsRUFBRSxHQUFHLElBQUksNkJBQW1CLENBQ2hDO3dCQUNFLEdBQUcsRUFBRTs0QkFDSCxJQUFJLEVBQUUsaUJBQWlCOzRCQUN2QixHQUFHLEVBQUU7Z0NBQ0gsR0FBRyxFQUFFLFVBQUMsR0FBUSxFQUFFLElBQVM7b0NBQ3ZCLElBQUksR0FBRyxFQUFFO3dDQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7cUNBQ3BCO29DQUVELElBQUksSUFBSSxFQUFFO3dDQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBUSxJQUFNLENBQUMsQ0FBQztxQ0FDOUI7Z0NBQ0gsQ0FBQzs2QkFDRjt5QkFDRjtxQkFDRixFQUNEO3dCQUNFLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7d0JBQ2pDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7d0JBQy9CLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7d0JBQ2hDLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU07d0JBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7cUJBQzlCLENBQ0YsQ0FBQztvQkFFYSxxQkFBTSxFQUFFLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLEVBQUE7O29CQUFuRCxNQUFNLEdBQUcsU0FBMEM7b0JBRXpELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Ozs7U0FDdEIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMifQ==