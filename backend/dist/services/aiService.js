"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIResponse = void 0;
// aiService stub
const generateAIResponse = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Integrate actual AI provider here (OpenAI, Gemini, Anthropic)
    return `AI Placeholder Response to: ${prompt}`;
});
exports.generateAIResponse = generateAIResponse;
