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
exports.InspectionDocument = void 0;
const vscode = require("vscode");
class InspectionDocument {
    constructor(uri, initialContent) {
        this._onDidDisposeEventEmitter = new vscode.EventEmitter();
        this.onDidDispose = this._onDidDisposeEventEmitter.event;
        this._onDidChangeDocumentEventEmitter = new vscode.EventEmitter();
        this.onDidChangeContent = this._onDidChangeDocumentEventEmitter.event;
        this._onDidChangeEventEmitter = new vscode.EventEmitter();
        this.onDidChange = this._onDidChangeEventEmitter.event;
        this._uri = uri;
        this._documentData = initialContent;
        this._inspection = {};
    }
    static create(uri, backupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataFile = typeof backupId === 'string' ? vscode.Uri.parse(backupId) : uri;
            const fileData = yield InspectionDocument.readFile(dataFile);
            return new InspectionDocument(uri, fileData);
        });
    }
    static readFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (uri.scheme === 'untitled') {
                return new Uint8Array();
            }
            return vscode.workspace.fs.readFile(uri);
        });
    }
    get uri() { return this._uri; }
    get documentData() { return this._documentData; }
    dispose() {
        this._onDidDisposeEventEmitter.fire();
    }
    update(inspection) {
        this._inspection = inspection;
        this._onDidChangeEventEmitter.fire(this._inspection);
    }
    save(cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.workspace.fs.writeFile(this._uri, this._documentData);
        });
    }
    saveAs(targetResource, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (cancellation.isCancellationRequested)
                return;
            yield vscode.workspace.fs.writeFile(targetResource, this._documentData);
        });
    }
    revert(cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const diskContent = yield InspectionDocument.readFile(this.uri);
            this._documentData = diskContent;
            this._onDidChangeDocumentEventEmitter.fire({ content: diskContent });
        });
    }
    backup(destination, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveAs(destination, cancellation);
            const rval = {
                id: destination.toString(),
                delete: () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield vscode.workspace.fs.delete(destination);
                    }
                    catch (_a) {
                        // noop
                    }
                })
            };
            return rval;
        });
    }
}
exports.InspectionDocument = InspectionDocument;
//# sourceMappingURL=document.js.map