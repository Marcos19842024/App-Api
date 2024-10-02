"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dependency_injection_1 = require("node-dependency-injection");
const venom_repository_1 = require("./repositories/venom.repository");
const lead_create_1 = require("../application/lead.create");
const lead_ctrl_1 = __importDefault(require("./controller/lead.ctrl"));
const status_create_1 = require("../application/status.create");
const status_ctrl_1 = __importDefault(require("./controller/status.ctrl"));
const container = new node_dependency_injection_1.ContainerBuilder();
/**
 * Iniciamos servicio de WS / Bot / Twilio
 */
container.register("ws.transporter", venom_repository_1.VenomTransporter);
const wsTransporter = container.get("ws.transporter");
container.register("lead.creator", lead_create_1.LeadCreate).addArgument(wsTransporter);
container.register("status.creator", status_create_1.StatusCreate).addArgument(wsTransporter);
const leadCreator = container.get("lead.creator");
const statusCreator = container.get("status.creator");
container.register("lead.ctrl", lead_ctrl_1.default).addArgument(leadCreator);
container.register("status.ctrl", status_ctrl_1.default).addArgument(statusCreator);
exports.default = container;
