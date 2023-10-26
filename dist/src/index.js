"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var _a = require("apollo-cache-inmemory"), InMemoryCache = _a.InMemoryCache, IntrospectionFragmentMatcher = _a.IntrospectionFragmentMatcher;
var ApolloClient = require("apollo-client").ApolloClient;
var gql = require("graphql-tag");
var createPrismicLink = require("apollo-link-prismic").createPrismicLink;
var _get = require("lodash.get");
var axios = require("axios");
var AxiosResponse = require("axios").AxiosResponse;
var fs = require("fs");
var parts = require("./parts");
var MNPG = /** @class */ (function () {
    function MNPG(repo, accessToken) {
        this.repo = repo;
        this.accessToken = accessToken;
        this.fragmentMatcher = "";
    }
    MNPG.prototype.createFragments = function (filePath) {
        var tempClient = new ApolloClient({
            link: createPrismicLink({
                repositoryName: this.repo,
                accessToken: this.accessToken,
            }),
            cache: new InMemoryCache(),
        });
        return new Promise(function (resolve, reject) {
            tempClient
                .query({
                query: gql(__makeTemplateObject(["\n            ", "\n          "], ["\n            ", "\n          "]), parts.schemaQuery),
            })
                .then(function (response) {
                var data = JSON.stringify(response.data, null, 2);
                fs.writeFile(filePath, data, function (err) {
                    if (err)
                        return reject(err);
                    resolve(true);
                });
            })
                .catch(reject);
        });
    };
    MNPG.prototype.createClient = function (introspectionQueryResultData) {
        if (introspectionQueryResultData === void 0) { introspectionQueryResultData = null; }
        if (introspectionQueryResultData) {
            var fragmentMatcher = new IntrospectionFragmentMatcher({
                introspectionQueryResultData: introspectionQueryResultData,
            });
            this.client = new ApolloClient({
                link: createPrismicLink({
                    repositoryName: this.repo,
                    accessToken: this.accessToken,
                }),
                cache: new InMemoryCache({ fragmentMatcher: fragmentMatcher }),
            });
        }
        else {
            this.client = new ApolloClient({
                link: createPrismicLink({
                    repositoryName: this.repo,
                    accessToken: this.accessToken,
                }),
                cache: new InMemoryCache(),
            });
        }
    };
    MNPG.prototype.entryQuery = function (firstEntriesQuery, paginatedQuery, edges) {
        var _this = this;
        if (edges === void 0) { edges = []; }
        return new Promise(function (resolve, reject) {
            _this.client
                .query({
                query: gql(__makeTemplateObject(["\n            ", "\n          "], ["\n            ", "\n          "]), firstEntriesQuery),
            })
                .then(function (response) {
                var newEdges = _get(response, "data.allEntrys.edges", []);
                edges.push.apply(edges, newEdges);
                var hasNextPage = _get(response, "data.allEntrys.pageInfo.hasNextPage", false);
                var lastEntryCursor = _get(newEdges[newEdges.length - 1], "cursor");
                if (hasNextPage) {
                    resolve(_this.entryQuery(paginatedQuery(lastEntryCursor), paginatedQuery, edges));
                }
                else {
                    resolve(edges);
                }
            })
                .catch(reject);
        });
    };
    MNPG.prototype.getEntries = function (firstEntriesQuery, paginatedQuery) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var edges, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.entryQuery(firstEntriesQuery, paginatedQuery)];
                    case 1:
                        edges = _a.sent();
                        resolve(edges);
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        reject(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    MNPG.prototype.getBasePages = function (basePagesQuery) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client
                .query({
                query: gql(__makeTemplateObject(["\n            ", "\n          "], ["\n            ", "\n          "]), basePagesQuery),
            })
                .then(function (response) {
                resolve(response.data);
            })
                .catch(reject);
        });
    };
    return MNPG;
}());
module.exports = {
    MNPG: MNPG,
};
