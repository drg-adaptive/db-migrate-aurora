"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuroraDataApiDriver_1 = require("./AuroraDataApiDriver");
var AWS = require("aws-sdk");
function connect(config, intern, callback) {
    // @ts-ignore
    callback(null, new AuroraDataApiDriver_1.default(intern, config));
}
exports.connect = connect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSw2REFHK0I7QUFDL0IsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRTdCLFNBQWdCLE9BQU8sQ0FDckIsTUFBaUIsRUFDakIsTUFBdUIsRUFDdkIsUUFBMEI7SUFFMUIsYUFBYTtJQUNiLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSw2QkFBbUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUMxRCxDQUFDO0FBUEQsMEJBT0MifQ==