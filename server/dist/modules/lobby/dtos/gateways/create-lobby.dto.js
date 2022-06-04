"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLobbyDto = void 0;
const class_validator_1 = require("class-validator");
class CreateLobbyDto {
}
__decorate([
    (0, class_validator_1.IsString)({
        message: "Username must be a type of string",
    }),
    __metadata("design:type", String)
], CreateLobbyDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)(null, {
        message: "Avatar must be a type of number",
    }),
    __metadata("design:type", Number)
], CreateLobbyDto.prototype, "avatar", void 0);
exports.CreateLobbyDto = CreateLobbyDto;
//# sourceMappingURL=create-lobby.dto.js.map