(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../../node_modules/@medv/finder/dist/index.js"
/*!********************************************************!*\
  !*** ../../../node_modules/@medv/finder/dist/index.js ***!
  \********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var cssesc = __webpack_require__(/*! cssesc */ "../../../node_modules/cssesc/cssesc.js");
var Limit;
(function (Limit) {
    Limit[Limit["All"] = 0] = "All";
    Limit[Limit["Two"] = 1] = "Two";
    Limit[Limit["One"] = 2] = "One";
})(Limit || (Limit = {}));
var config;
var rootDocument;
function default_1(input, options) {
    if (input.nodeType !== Node.ELEMENT_NODE) {
        throw new Error("Can't generate CSS selector for non-element node type.");
    }
    if ('html' === input.tagName.toLowerCase()) {
        return 'html';
    }
    var defaults = {
        root: document.body,
        idName: function (name) { return true; },
        className: function (name) { return true; },
        tagName: function (name) { return true; },
        attr: function (name, value) { return false; },
        seedMinLength: 1,
        optimizedMinLength: 2,
        threshold: 1000,
        maxNumberOfTries: 10000,
    };
    config = __assign({}, defaults, options);
    rootDocument = findRootDocument(config.root, defaults);
    var path = bottomUpSearch(input, Limit.All, function () {
        return bottomUpSearch(input, Limit.Two, function () {
            return bottomUpSearch(input, Limit.One);
        });
    });
    if (path) {
        var optimized = sort(optimize(path, input));
        if (optimized.length > 0) {
            path = optimized[0];
        }
        return selector(path);
    }
    else {
        throw new Error("Selector was not found.");
    }
}
exports["default"] = default_1;
function findRootDocument(rootNode, defaults) {
    if (rootNode.nodeType === Node.DOCUMENT_NODE) {
        return rootNode;
    }
    if (rootNode === defaults.root) {
        return rootNode.ownerDocument;
    }
    return rootNode;
}
function bottomUpSearch(input, limit, fallback) {
    var path = null;
    var stack = [];
    var current = input;
    var i = 0;
    var _loop_1 = function () {
        var level = maybe(id(current)) || maybe.apply(void 0, attr(current)) || maybe.apply(void 0, classNames(current)) || maybe(tagName(current)) || [any()];
        var nth = index(current);
        if (limit === Limit.All) {
            if (nth) {
                level = level.concat(level.filter(dispensableNth).map(function (node) { return nthChild(node, nth); }));
            }
        }
        else if (limit === Limit.Two) {
            level = level.slice(0, 1);
            if (nth) {
                level = level.concat(level.filter(dispensableNth).map(function (node) { return nthChild(node, nth); }));
            }
        }
        else if (limit === Limit.One) {
            var node = (level = level.slice(0, 1))[0];
            if (nth && dispensableNth(node)) {
                level = [nthChild(node, nth)];
            }
        }
        for (var _i = 0, level_1 = level; _i < level_1.length; _i++) {
            var node = level_1[_i];
            node.level = i;
        }
        stack.push(level);
        if (stack.length >= config.seedMinLength) {
            path = findUniquePath(stack, fallback);
            if (path) {
                return "break";
            }
        }
        current = current.parentElement;
        i++;
    };
    while (current && current !== config.root.parentElement) {
        var state_1 = _loop_1();
        if (state_1 === "break")
            break;
    }
    if (!path) {
        path = findUniquePath(stack, fallback);
    }
    return path;
}
function findUniquePath(stack, fallback) {
    var paths = sort(combinations(stack));
    if (paths.length > config.threshold) {
        return fallback ? fallback() : null;
    }
    for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
        var candidate = paths_1[_i];
        if (unique(candidate)) {
            return candidate;
        }
    }
    return null;
}
function selector(path) {
    var node = path[0];
    var query = node.name;
    for (var i = 1; i < path.length; i++) {
        var level = path[i].level || 0;
        if (node.level === level - 1) {
            query = path[i].name + " > " + query;
        }
        else {
            query = path[i].name + " " + query;
        }
        node = path[i];
    }
    return query;
}
function penalty(path) {
    return path.map(function (node) { return node.penalty; }).reduce(function (acc, i) { return acc + i; }, 0);
}
function unique(path) {
    switch (rootDocument.querySelectorAll(selector(path)).length) {
        case 0:
            throw new Error("Can't select any node with this selector: " + selector(path));
        case 1:
            return true;
        default:
            return false;
    }
}
function id(input) {
    var elementId = input.getAttribute('id');
    if (elementId && config.idName(elementId)) {
        return {
            name: '#' + cssesc(elementId, { isIdentifier: true }),
            penalty: 0,
        };
    }
    return null;
}
function attr(input) {
    var attrs = Array.from(input.attributes).filter(function (attr) { return config.attr(attr.name, attr.value); });
    return attrs.map(function (attr) { return ({
        name: '[' + cssesc(attr.name, { isIdentifier: true }) + '="' + cssesc(attr.value) + '"]',
        penalty: 0.5
    }); });
}
function classNames(input) {
    var names = Array.from(input.classList)
        .filter(config.className);
    return names.map(function (name) { return ({
        name: '.' + cssesc(name, { isIdentifier: true }),
        penalty: 1
    }); });
}
function tagName(input) {
    var name = input.tagName.toLowerCase();
    if (config.tagName(name)) {
        return {
            name: name,
            penalty: 2
        };
    }
    return null;
}
function any() {
    return {
        name: '*',
        penalty: 3
    };
}
function index(input) {
    var parent = input.parentNode;
    if (!parent) {
        return null;
    }
    var child = parent.firstChild;
    if (!child) {
        return null;
    }
    var i = 0;
    while (child) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            i++;
        }
        if (child === input) {
            break;
        }
        child = child.nextSibling;
    }
    return i;
}
function nthChild(node, i) {
    return {
        name: node.name + (":nth-child(" + i + ")"),
        penalty: node.penalty + 1
    };
}
function dispensableNth(node) {
    return node.name !== 'html' && !node.name.startsWith('#');
}
function maybe() {
    var level = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        level[_i] = arguments[_i];
    }
    var list = level.filter(notEmpty);
    if (list.length > 0) {
        return list;
    }
    return null;
}
function notEmpty(value) {
    return value !== null && value !== undefined;
}
function combinations(stack, path) {
    var _i, _a, node;
    if (path === void 0) { path = []; }
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(stack.length > 0)) return [3 /*break*/, 5];
                _i = 0, _a = stack[0];
                _b.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                node = _a[_i];
                return [5 /*yield**/, __values(combinations(stack.slice(1, stack.length), path.concat(node)))];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, path];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7: return [2 /*return*/];
        }
    });
}
function sort(paths) {
    return Array.from(paths).sort(function (a, b) { return penalty(a) - penalty(b); });
}
function optimize(path, input, scope) {
    var i, newPath, newPathKey;
    if (scope === void 0) { scope = { counter: 0, visited: new Map() }; }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(path.length > 2 && path.length > config.optimizedMinLength)) return [3 /*break*/, 5];
                i = 1;
                _a.label = 1;
            case 1:
                if (!(i < path.length - 1)) return [3 /*break*/, 5];
                if (scope.counter > config.maxNumberOfTries) {
                    return [2 /*return*/]; // Okay At least I tried!
                }
                scope.counter += 1;
                newPath = path.slice();
                newPath.splice(i, 1);
                newPathKey = selector(newPath);
                if (scope.visited.has(newPathKey)) {
                    return [2 /*return*/];
                }
                if (!(unique(newPath) && same(newPath, input))) return [3 /*break*/, 4];
                return [4 /*yield*/, newPath];
            case 2:
                _a.sent();
                scope.visited.set(newPathKey, true);
                return [5 /*yield**/, __values(optimize(newPath, input, scope))];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/];
        }
    });
}
function same(path, input) {
    return rootDocument.querySelector(selector(path)) === input;
}
//# sourceMappingURL=index.js.map

/***/ },

/***/ "./content/find-select.js"
/*!********************************!*\
  !*** ./content/find-select.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "../../../node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var scroll_into_view_if_needed__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! scroll-into-view-if-needed */ "../../../node_modules/scroll-into-view-if-needed/es/index.js");
/* harmony import */ var _locator_builders__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./locator-builders */ "./content/locator-builders.js");
/* harmony import */ var _target_selector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./target-selector */ "./content/target-selector.js");
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
const locatorBuilders=new _locator_builders__WEBPACK_IMPORTED_MODULE_2__["default"](window);window.addEventListener('message',event=>{if(event.data&&event.data.direction==='from-page-script'&&event.data.action==='find'){const element=window.document.querySelector(event.data.query);highlight(element).then(()=>{event.source.postMessage({id:event.data.id,direction:'from-content-script'},'*');});}});let targetSelector;webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.onMessage.addListener((message,_sender,sendResponse)=>{if(message.action==='select'){sendResponse(true);if(message.selecting){startSelection();}else{cleanSelection();}}});webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.sendMessage({attachSelectorRequest:true}).then(shouldAttach=>{if(shouldAttach){startSelection();}}).catch(()=>{});function startSelection(){targetSelector=new _target_selector__WEBPACK_IMPORTED_MODULE_3__["default"](function(element,win){if(element&&win){const target=locatorBuilders.buildAll(element);if(target!=null&&target instanceof Array){if(target){webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.sendMessage({action:'select',selectTarget:true,target});}}}targetSelector=null;});}function cleanSelection(){targetSelector.cleanup();targetSelector=null;}function highlight(element){return new Promise(res=>{const elementForInjectingStyle=document.createElement('link');elementForInjectingStyle.rel='stylesheet';elementForInjectingStyle.href=webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.getURL('/assets/highlight.css');(document.head||document.documentElement).appendChild(elementForInjectingStyle);const highlightElement=document.createElement('div');highlightElement.id='selenium-highlight';document.body.appendChild(highlightElement);const bodyRects=document.documentElement.getBoundingClientRect();const elementRects=element.getBoundingClientRect();highlightElement.style.left=parseInt(elementRects.left-bodyRects.left)+'px';highlightElement.style.top=parseInt(elementRects.top-bodyRects.top)+'px';highlightElement.style.width=parseInt(elementRects.width)+'px';highlightElement.style.height=parseInt(elementRects.height)+'px';highlightElement.style.position='absolute';highlightElement.style.zIndex='100';highlightElement.style.display='block';highlightElement.style.pointerEvents='none';(0,scroll_into_view_if_needed__WEBPACK_IMPORTED_MODULE_1__["default"])(highlightElement,{centerIfNeeded:true});highlightElement.className='active-selenium-highlight';setTimeout(()=>{document.body.removeChild(highlightElement);elementForInjectingStyle.parentNode.removeChild(elementForInjectingStyle);res();},500);});}

/***/ },

/***/ "./content/locator-builders.js"
/*!*************************************!*\
  !*** ./content/locator-builders.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LocatorBuilders)
/* harmony export */ });
/* harmony import */ var _third_party_find_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../third-party/find-element */ "./third-party/find-element.js");
/* harmony import */ var _third_party_find_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_third_party_find_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./content/utils.js");
/* harmony import */ var _medv_finder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @medv/finder */ "../../../node_modules/@medv/finder/dist/index.js");
/* harmony import */ var _medv_finder__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_medv_finder__WEBPACK_IMPORTED_MODULE_2__);
/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function LocatorBuilders(window){this.window=window;}LocatorBuilders.prototype.detach=function(){};LocatorBuilders.prototype.buildWith=function(name,e,opt_contextNode){return LocatorBuilders.builderMap[name].call(this,e,opt_contextNode);};LocatorBuilders.prototype.elementEquals=function(name,e,locator){let fe=this.findElement(locator);//TODO: add match function to the ui locator builder, note the inverted parameters
return e==fe||LocatorBuilders.builderMap[name]&&LocatorBuilders.builderMap[name].match&&LocatorBuilders.builderMap[name].match(e,fe);};LocatorBuilders.prototype.build=function(e){let locators=this.buildAll(e);if(locators.length>0){return locators[0][0];}else{return'LOCATOR_DETECTION_FAILED';}};LocatorBuilders.prototype.buildAll=function(el){let locator;let locators=[];for(let i=0;i<LocatorBuilders.order.length;i++){let finderName=LocatorBuilders.order[i];try{locator=this.buildWith(finderName,el);if(locator){locator=String(locator);//Samit: The following is a quickfix for above commented code to stop exceptions on almost every locator builder
//TODO: the builderName should NOT be used as a strategy name, create a feature to allow locatorBuilders to specify this kind of behaviour
//TODO: Useful if a builder wants to capture a different element like a parent. Use the this.elementEquals
let fe=this.findElement(locator);if(el==fe){locators.push([locator,finderName]);}}}catch(e){// TODO ignore the buggy locator builder for now
//this.log.debug("locator exception: " + e);
}}return locators;};LocatorBuilders.prototype.findElement=function(loc){try{const locator=(0,_utils__WEBPACK_IMPORTED_MODULE_1__.parse_locator)(loc,true);return _third_party_find_element__WEBPACK_IMPORTED_MODULE_0___default()({[locator.type]:locator.string},this.window.document);}catch(error){//this.log.debug("findElement failed: " + error + ", locator=" + locator);
return null;}};/*
 * Class methods
 */LocatorBuilders.order=[];LocatorBuilders.builderMap={};LocatorBuilders._preferredOrder=[];// NOTE: for some reasons we does not use this part
// classObservable(LocatorBuilders);
LocatorBuilders.add=function(name,finder){this.order.push(name);this.builderMap[name]=finder;this._orderChanged();};/**
 * Call when the order or preferred order changes
 */LocatorBuilders._orderChanged=function(){let changed=this._ensureAllPresent(this.order,this._preferredOrder);this._sortByRefOrder(this.order,this._preferredOrder);if(changed){// NOTE: for some reasons we does not use this part
// this.notify('preferredOrderChanged', this._preferredOrder);
}};/**
 * Set the preferred order of the locator builders
 *
 * @param preferredOrder can be an array or a comma separated string of names
 */LocatorBuilders.setPreferredOrder=function(preferredOrder){if(typeof preferredOrder==='string'){this._preferredOrder=preferredOrder.split(',');}else{this._preferredOrder=preferredOrder;}this._orderChanged();};/**
 * Returns the locator builders preferred order as an array
 */LocatorBuilders.getPreferredOrder=function(){return this._preferredOrder;};/**
 * Sorts arrayToSort in the order of elements in sortOrderReference
 * @param arrayToSort
 * @param sortOrderReference
 */LocatorBuilders._sortByRefOrder=function(arrayToSort,sortOrderReference){let raLen=sortOrderReference.length;arrayToSort.sort(function(a,b){let ai=sortOrderReference.indexOf(a);let bi=sortOrderReference.indexOf(b);return(ai>-1?ai:raLen)-(bi>-1?bi:raLen);});};/**
 * Function to add to the bottom of destArray elements from source array that do not exist in destArray
 * @param sourceArray
 * @param destArray
 */LocatorBuilders._ensureAllPresent=function(sourceArray,destArray){let changed=false;sourceArray.forEach(function(e){if(destArray.indexOf(e)==-1){destArray.push(e);changed=true;}});return changed;};/*
 * Utility function: Encode XPath attribute value.
 */LocatorBuilders.prototype.attributeValue=function(value){if(value.indexOf("'")<0){return"'"+value+"'";}else if(value.indexOf('"')<0){return'"'+value+'"';}else{let result='concat(';let part='';let didReachEndOfValue=false;while(!didReachEndOfValue){let apos=value.indexOf("'");let quot=value.indexOf('"');if(apos<0){result+="'"+value+"'";didReachEndOfValue=true;break;}else if(quot<0){result+='"'+value+'"';didReachEndOfValue=true;break;}else if(quot<apos){part=value.substring(0,apos);result+="'"+part+"'";value=value.substring(part.length);}else{part=value.substring(0,quot);result+='"'+part+'"';value=value.substring(part.length);}result+=',';}result+=')';return result;}};LocatorBuilders.prototype.xpathHtmlElement=function(name){if(this.window.document.contentType=='application/xhtml+xml'){// "x:" prefix is required when testing XHTML pages
return'x:'+name;}else{return name;}};LocatorBuilders.prototype.relativeXPathFromParent=function(current){let index=this.getNodeNbr(current);let currentPath='/'+this.xpathHtmlElement(current.nodeName.toLowerCase());if(index>0){currentPath+='['+(index+1)+']';}return currentPath;};LocatorBuilders.prototype.getNodeNbr=function(current){let childNodes=current.parentNode.childNodes;let total=0;let index=-1;for(let i=0;i<childNodes.length;i++){let child=childNodes[i];if(child.nodeName==current.nodeName){if(child==current){index=total;}total++;}}return index;};LocatorBuilders.prototype.preciseXPath=function(xpath,e){//only create more precise xpath if needed
if(this.findElement(xpath)!=e){let result=e.ownerDocument.evaluate(xpath,e.ownerDocument,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);//skip first element (result:0 xpath index:1)
for(let i=0,len=result.snapshotLength;i<len;i++){let newPath='xpath=('+xpath+')['+(i+1)+']';if(this.findElement(newPath)==e){return newPath;}}}return'xpath='+xpath;};/*
 * ===== builders =====
 */// order listed dictates priority
// e.g., 1st listed is top priority
LocatorBuilders.add('css:data-attr',function cssDataAttr(e){const dataAttributes=['data-test','data-test-id'];for(let i=0;i<dataAttributes.length;i++){const attr=dataAttributes[i];const value=e.getAttribute(attr);if(attr){return`css=*[${attr}="${value}"]`;}}return null;});LocatorBuilders.add('id',function id(e){if(e.id){return'id='+e.id;}return null;});LocatorBuilders.add('linkText',function linkText(e){if(e.nodeName=='A'){let text=e.textContent;if(!text.match(/^\s*$/)){return'linkText='+text.replace(/\xA0/g,' ').replace(/^\s*(.*?)\s*$/,'$1');}}return null;});LocatorBuilders.add('name',function name(e){if(e.name){return'name='+e.name;}return null;});LocatorBuilders.add('css:finder',function cssFinder(e){return'css='+_medv_finder__WEBPACK_IMPORTED_MODULE_2___default()(e);});LocatorBuilders.add('xpath:link',function xpathLink(e){if(e.nodeName=='A'){let text=e.textContent;if(!text.match(/^\s*$/)){return this.preciseXPath('//'+this.xpathHtmlElement('a')+"[contains(text(),'"+text.replace(/^\s+/,'').replace(/\s+$/,'')+"')]",e);}}return null;});LocatorBuilders.add('xpath:img',function xpathImg(e){if(e.nodeName=='IMG'){if(e.alt!=''){return this.preciseXPath('//'+this.xpathHtmlElement('img')+'[@alt='+this.attributeValue(e.alt)+']',e);}else if(e.title!=''){return this.preciseXPath('//'+this.xpathHtmlElement('img')+'[@title='+this.attributeValue(e.title)+']',e);}else if(e.src!=''){return this.preciseXPath('//'+this.xpathHtmlElement('img')+'[contains(@src,'+this.attributeValue(e.src)+')]',e);}}return null;});LocatorBuilders.add('xpath:attributes',function xpathAttr(e){const PREFERRED_ATTRIBUTES=['id','name','value','type','action','onclick'];let i=0;function attributesXPath(name,attNames,attributes){let locator='//'+this.xpathHtmlElement(name)+'[';for(i=0;i<attNames.length;i++){if(i>0){locator+=' and ';}let attName=attNames[i];locator+='@'+attName+'='+this.attributeValue(attributes[attName]);}locator+=']';return this.preciseXPath(locator,e);}if(e.attributes){let atts=e.attributes;let attsMap={};for(i=0;i<atts.length;i++){let att=atts[i];attsMap[att.name]=att.value;}let names=[];// try preferred attributes
for(i=0;i<PREFERRED_ATTRIBUTES.length;i++){let name=PREFERRED_ATTRIBUTES[i];if(attsMap[name]!=null){names.push(name);let locator=attributesXPath.call(this,e.nodeName.toLowerCase(),names,attsMap);if(e==this.findElement(locator)){return locator;}}}}return null;});LocatorBuilders.add('xpath:idRelative',function xpathIdRelative(e){let path='';let current=e;while(current!=null){if(current.parentNode!=null){path=this.relativeXPathFromParent(current)+path;if(1==current.parentNode.nodeType&&// ELEMENT_NODE
current.parentNode.getAttribute('id')){return this.preciseXPath('//'+this.xpathHtmlElement(current.parentNode.nodeName.toLowerCase())+'[@id='+this.attributeValue(current.parentNode.getAttribute('id'))+']'+path,e);}}else{return null;}current=current.parentNode;}return null;});LocatorBuilders.add('xpath:href',function xpathHref(e){if(e.attributes&&e.hasAttribute('href')){let href=e.getAttribute('href');if(href.search(/^http?:\/\//)>=0){return this.preciseXPath('//'+this.xpathHtmlElement('a')+'[@href='+this.attributeValue(href)+']',e);}else{// use contains(), because in IE getAttribute("href") will return absolute path
return this.preciseXPath('//'+this.xpathHtmlElement('a')+'[contains(@href, '+this.attributeValue(href)+')]',e);}}return null;});LocatorBuilders.add('xpath:position',function xpathPosition(e,opt_contextNode){let path='';let current=e;while(current!=null&&current!=opt_contextNode){let currentPath;if(current.parentNode!=null){currentPath=this.relativeXPathFromParent(current);}else{currentPath='/'+this.xpathHtmlElement(current.nodeName.toLowerCase());}path=currentPath+path;let locator='/'+path;if(e==this.findElement(locator)){return'xpath='+locator;}current=current.parentNode;}return null;});LocatorBuilders.add('xpath:innerText',function xpathInnerText(el){if(el.innerText){return`xpath=//${el.nodeName.toLowerCase()}[contains(.,'${el.innerText}')]`;}else{return null;}});

/***/ },

/***/ "./content/prompt-injector.js"
/*!************************************!*\
  !*** ./content/prompt-injector.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   attach: () => (/* binding */ attach),
/* harmony export */   detach: () => (/* binding */ detach)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "../../../node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__);
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
let elementForInjectingScript;elementForInjectingScript=document.createElement('script');elementForInjectingScript.src=webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.getURL('/assets/prompt.js');(document.head||document.documentElement).appendChild(elementForInjectingScript);function attach(record){window.postMessage({direction:'from-content-script',attach:true},'*');attachPromptRecorder(record);}function detach(){window.postMessage({direction:'from-content-script',detach:true},'*');}function attachPromptRecorder(record){if(window===window.top){window.addEventListener('message',function(event){if(event.source&&event.source.top==window&&event.data&&event.data.direction=='from-page-script'){if(event.data.recordedType){switch(event.data.recordedType){case'prompt':record('assertPrompt',event.data.recordedMessage,'',false,event.data.frameLocation);if(event.data.recordedResult!=null){record('answerPrompt',event.data.recordedResult,'',false,event.data.frameLocation);}else{record('dismissPrompt','','',false,event.data.frameLocation);}break;case'confirm':record('assertConfirmation',event.data.recordedMessage,'',false,event.data.frameLocation);if(event.data.recordedResult==true){record('acceptConfirmation','','',false,event.data.frameLocation);}else{record('dismissConfirmation','','',false,event.data.frameLocation);}break;case'alert':record('assertAlert',event.data.recordedMessage,'',false,event.data.frameLocation);record('acceptAlert','','',false,event.data.frameLocation);break;}}}});}}

/***/ },

/***/ "./content/record-handlers.js"
/*!************************************!*\
  !*** ./content/record-handlers.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handlers: () => (/* binding */ handlers),
/* harmony export */   observers: () => (/* binding */ observers)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "../../../node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _locator_builders__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./locator-builders */ "./content/locator-builders.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./content/utils.js");
/* eslint no-unused-vars: off, no-useless-escape: off */// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
const locatorBuilders=new _locator_builders__WEBPACK_IMPORTED_MODULE_1__["default"](window);const handlers=[];const observers=[];function eventIsTrusted(event){return _utils__WEBPACK_IMPORTED_MODULE_2__.isTest?true:event.isTrusted;}handlers.push(['type','change',function(event){// © Chen-Chieh Ping, SideeX Team
if(event.target.tagName&&!this.recordingState.preventType&&this.recordingState.typeLock==0&&(this.recordingState.typeLock=1)){// END
let tagName=event.target.tagName.toLowerCase();let type=event.target.type;if('input'==tagName&&this.inputTypes.indexOf(type)>=0){if(event.target.value.length>0){this.record('type',locatorBuilders.buildAll(event.target),event.target.value);// © Chen-Chieh Ping, SideeX Team
if(this.recordingState.enterTarget!=null){let tempTarget=event.target.parentElement;let formChk=tempTarget.tagName.toLowerCase();while(formChk!='form'&&formChk!='body'){tempTarget=tempTarget.parentElement;formChk=tempTarget.tagName.toLowerCase();}this.record('sendKeys',locatorBuilders.buildAll(this.recordingState.enterTarget),'${KEY_ENTER}');this.recordingState.enterTarget=null;}// END
}else{this.record('type',locatorBuilders.buildAll(event.target),event.target.value);}}else if('textarea'==tagName){this.record('type',locatorBuilders.buildAll(event.target),event.target.value);}}this.recordingState.typeLock=0;}]);handlers.push(['type','input',function(event){this.recordingState.typeTarget=event.target;}]);// © Jie-Lin You, SideeX Team
handlers.push(['clickAt','click',function(event){if(event.button==0&&!this.recordingState.preventClick&&eventIsTrusted(event)){if(!this.recordingState.preventClickTwice){this.record('click',locatorBuilders.buildAll(event.target),'');this.recordingState.preventClickTwice=true;}setTimeout(()=>{this.recordingState.preventClickTwice=false;},30);}},true]);// END
// © Chen-Chieh Ping, SideeX Team
handlers.push(['doubleClickAt','dblclick',function(event){this.record('doubleClick',locatorBuilders.buildAll(event.target),'');},true]);// END
handlers.push(['sendKeys','keydown',function(event){if(event.target.tagName){let key=event.keyCode;let tagName=event.target.tagName.toLowerCase();let type=event.target.type;if(tagName=='input'&&this.inputTypes.indexOf(type)>=0){if(key==13){this.recordingState.enterTarget=event.target;this.recordingState.enterValue=this.recordingState.enterTarget.value;let tempTarget=event.target.parentElement;let formChk=tempTarget.tagName.toLowerCase();if(this.recordingState.tempValue==this.recordingState.enterTarget.value&&this.recordingState.tabCheck==this.recordingState.enterTarget){this.record('sendKeys',locatorBuilders.buildAll(this.recordingState.enterTarget),'${KEY_ENTER}');this.recordingState.enterTarget=null;this.recordingState.preventType=true;}else if(this.recordingState.focusValue==this.recordingState.enterValue){while(formChk!='form'&&formChk!='body'){tempTarget=tempTarget.parentElement;formChk=tempTarget.tagName.toLowerCase();}this.record('sendKeys',locatorBuilders.buildAll(this.recordingState.enterTarget),'${KEY_ENTER}');this.recordingState.enterTarget=null;}if(this.recordingState.typeTarget&&this.recordingState.typeTarget.tagName&&!this.recordingState.preventType&&(this.recordingState.typeLock=1)){// END
tagName=this.recordingState.typeTarget.tagName.toLowerCase();type=this.recordingState.typeTarget.type;if('input'==tagName&&this.inputTypes.indexOf(type)>=0){if(this.recordingState.typeTarget.value.length>0){this.record('type',locatorBuilders.buildAll(this.recordingState.typeTarget),this.recordingState.typeTarget.value);// © Chen-Chieh Ping, SideeX Team
if(this.recordingState.enterTarget!=null){tempTarget=this.recordingState.typeTarget.parentElement;formChk=tempTarget.tagName.toLowerCase();while(formChk!='form'&&formChk!='body'){tempTarget=tempTarget.parentElement;formChk=tempTarget.tagName.toLowerCase();}this.record('sendKeys',locatorBuilders.buildAll(this.recordingState.enterTarget),'${KEY_ENTER}');this.recordingState.enterTarget=null;}// END
}else{this.record('type',locatorBuilders.buildAll(this.recordingState.typeTarget),this.recordingState.typeTarget.value);}}else if('textarea'==tagName){this.record('type',locatorBuilders.buildAll(this.recordingState.typeTarget),this.recordingState.typeTarget.value);}}this.recordingState.preventClick=true;setTimeout(()=>{this.recordingState.preventClick=false;},500);setTimeout(()=>{if(this.recordingState.enterValue!=event.target.value)this.recordingState.enterTarget=null;},50);}let tempbool=false;if((key==38||key==40)&&event.target.value!=''){if(this.recordingState.focusTarget!=null&&this.recordingState.focusTarget.value!=this.recordingState.tempValue){tempbool=true;this.recordingState.tempValue=this.recordingState.focusTarget.value;}if(tempbool){this.record('type',locatorBuilders.buildAll(event.target),this.recordingState.tempValue);}setTimeout(()=>{this.recordingState.tempValue=this.recordingState.focusTarget.value;},250);if(key==38)this.record('sendKeys',locatorBuilders.buildAll(event.target),'${KEY_UP}');else this.record('sendKeys',locatorBuilders.buildAll(event.target),'${KEY_DOWN}');this.recordingState.tabCheck=event.target;}if(key==9){if(this.recordingState.tabCheck==event.target){this.record('sendKeys',locatorBuilders.buildAll(event.target),'${KEY_TAB}');this.recordingState.preventType=true;}}}}},true]);// END
let mousedown,mouseup,selectMouseup,selectMousedown,mouseoverQ,clickLocator;// © Shuo-Heng Shih, SideeX Team
handlers.push(['dragAndDrop','mousedown',function(event){if(event.clientX<window.document.documentElement.clientWidth&&event.clientY<window.document.documentElement.clientHeight){mousedown=event;mouseup=setTimeout(()=>{mousedown=undefined;},200);selectMouseup=setTimeout(()=>{selectMousedown=event;},200);}mouseoverQ=[];if(event.target.nodeName){let tagName=event.target.nodeName.toLowerCase();if('option'==tagName){let parent=event.target.parentNode;if(parent.multiple){let options=parent.options;for(let i=0;i<options.length;i++){options[i]._wasSelected=options[i].selected;}}}}},true]);// END
// © Shuo-Heng Shih, SideeX Team
handlers.push(['dragAndDrop','mouseup',function(event){function getSelectionText(){let text='';let activeEl=window.document.activeElement;let activeElTagName=activeEl?activeEl.tagName.toLowerCase():null;if(activeElTagName=='textarea'||activeElTagName=='input'){text=activeEl.value.slice(activeEl.selectionStart,activeEl.selectionEnd);}else if(window.getSelection){text=window.getSelection().toString();}return text.trim();}clearTimeout(selectMouseup);if(selectMousedown){let x=event.clientX-selectMousedown.clientX;let y=event.clientY-selectMousedown.clientY;if(selectMousedown&&event.button===0&&x+y&&event.clientX<window.document.documentElement.clientWidth&&event.clientY<window.document.documentElement.clientHeight&&getSelectionText()===''){let sourceRelateX=selectMousedown.pageX-selectMousedown.target.getBoundingClientRect().left-window.scrollX;let sourceRelateY=selectMousedown.pageY-selectMousedown.target.getBoundingClientRect().top-window.scrollY;let targetRelateX,targetRelateY;if(!!mouseoverQ.length&&mouseoverQ[1].relatedTarget==mouseoverQ[0].target&&mouseoverQ[0].target==event.target){targetRelateX=event.pageX-mouseoverQ[1].target.getBoundingClientRect().left-window.scrollX;targetRelateY=event.pageY-mouseoverQ[1].target.getBoundingClientRect().top-window.scrollY;this.record('mouseDownAt',locatorBuilders.buildAll(selectMousedown.target),sourceRelateX+','+sourceRelateY);this.record('mouseMoveAt',locatorBuilders.buildAll(mouseoverQ[1].target),targetRelateX+','+targetRelateY);this.record('mouseUpAt',locatorBuilders.buildAll(mouseoverQ[1].target),targetRelateX+','+targetRelateY);}else{targetRelateX=event.pageX-event.target.getBoundingClientRect().left-window.scrollX;targetRelateY=event.pageY-event.target.getBoundingClientRect().top-window.scrollY;this.record('mouseDownAt',locatorBuilders.buildAll(event.target),targetRelateX+','+targetRelateY);this.record('mouseMoveAt',locatorBuilders.buildAll(event.target),targetRelateX+','+targetRelateY);this.record('mouseUpAt',locatorBuilders.buildAll(event.target),targetRelateX+','+targetRelateY);}}}else{clickLocator=undefined;mouseup=undefined;let x=event.clientX-mousedown.clientX;let y=event.clientY-mousedown.clientY;if(mousedown&&mousedown.target!==event.target&&!(x+y)){this.record('mouseDown',locatorBuilders.buildAll(mousedown.target),'');this.record('mouseUp',locatorBuilders.buildAll(event.target),'');}else if(mousedown&&mousedown.target===event.target){let target=locatorBuilders.buildAll(mousedown.target);// setTimeout(function() {
//     if (!self.clickLocator)
//         this.record("click", target, '');
// }.bind(this), 100);
}}mousedown=undefined;selectMousedown=undefined;mouseoverQ=undefined;},true]);// END
let dropLocator,dragstartLocator;// © Shuo-Heng Shih, SideeX Team
handlers.push(['dragAndDropToObject','dragstart',function(event){dropLocator=setTimeout(()=>{dragstartLocator=event;},200);},true]);// END
// © Shuo-Heng Shih, SideeX Team
handlers.push(['dragAndDropToObject','drop',function(event){clearTimeout(dropLocator);if(dragstartLocator&&event.button==0&&dragstartLocator.target!==event.target){//value no option
this.record('dragAndDropToObject',locatorBuilders.buildAll(dragstartLocator.target),locatorBuilders.buildAll(event.target));}dragstartLocator=undefined;selectMousedown=undefined;},true]);// END
// © Shuo-Heng Shih, SideeX Team
let prevTimeOut=null,scrollDetector;handlers.push(['runScript','scroll',function(event){if(pageLoaded===true){scrollDetector=event.target;clearTimeout(prevTimeOut);prevTimeOut=setTimeout(()=>{scrollDetector=undefined;},500);}},true]);// END
// © Shuo-Heng Shih, SideeX Team
let nowNode=0,mouseoverLocator,nodeInsertedLocator,nodeInsertedAttrChange;handlers.push(['mouseOver','mouseover',function(event){if(window.document.documentElement)nowNode=window.document.documentElement.getElementsByTagName('*').length;if(pageLoaded===true){let clickable=findClickableElement(event.target);if(clickable){nodeInsertedLocator=event.target;nodeInsertedAttrChange=locatorBuilders.buildAll(event.target);setTimeout(()=>{nodeInsertedLocator=undefined;nodeInsertedAttrChange=undefined;},500);}//drop target overlapping
if(mouseoverQ){//mouse keep down
if(mouseoverQ.length>=3)mouseoverQ.shift();mouseoverQ.push(event);}}},true]);// END
let mouseoutLocator=undefined;// © Shuo-Heng Shih, SideeX Team
handlers.push(['mouseOut','mouseout',function(event){if(mouseoutLocator!==null&&event.target===mouseoutLocator){this.record('mouseOut',locatorBuilders.buildAll(event.target),'');}mouseoutLocator=undefined;},true]);// END
observers.push(['FrameDeleted',function(mutations){mutations.forEach(async mutation=>{const removedNodes=await mutation.removedNodes;if(removedNodes.length&&removedNodes[0].nodeName==='IFRAME'){webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.sendMessage({frameRemoved:true}).catch(()=>{});}});},{childList:true}]);observers.push(['DOMNodeInserted',function(mutations){if(pageLoaded===true&&window.document.documentElement.getElementsByTagName('*').length>nowNode){// Get list of inserted nodes from the mutations list to simulate 'DOMNodeInserted'.
const insertedNodes=mutations.reduce((nodes,mutation)=>{if(mutation.type==='childList'){nodes.push.apply(nodes,mutation.addedNodes);}return nodes;},[]);// If no nodes inserted, just bail.
if(!insertedNodes.length){return;}if(scrollDetector){//TODO: fix target
this.record('runScript','window.scrollTo(0,'+window.scrollY+')','');pageLoaded=false;setTimeout(()=>{pageLoaded=true;},550);scrollDetector=undefined;nodeInsertedLocator=undefined;}if(nodeInsertedLocator){this.record('mouseOver',nodeInsertedAttrChange,'');mouseoutLocator=nodeInsertedLocator;nodeInsertedLocator=undefined;nodeInsertedAttrChange=undefined;mouseoverLocator=undefined;}}},{childList:true,subtree:true}]);// © Shuo-Heng Shih, SideeX Team
let readyTimeOut=null;let pageLoaded=true;handlers.push(['checkPageLoaded','readystatechange',function(event){if(window.document.readyState==='loading'){pageLoaded=false;}else{pageLoaded=false;clearTimeout(readyTimeOut);readyTimeOut=setTimeout(()=>{pageLoaded=true;},1500);//setReady after complete 1.5s
}},true]);// END
// © Yun-Wen Lin, SideeX Team
let getEle;let checkFocus=0;let contentTest;handlers.push(['editContent','focus',function(event){let editable=event.target.contentEditable;if(editable=='true'){getEle=event.target;contentTest=getEle.innerHTML;checkFocus=1;}},true]);// END
// © Yun-Wen Lin, SideeX Team
handlers.push(['editContent','blur',function(event){if(checkFocus==1){if(event.target==getEle){if(getEle.innerHTML!=contentTest){this.record('editContent',locatorBuilders.buildAll(event.target),getEle.innerHTML);}checkFocus=0;}}},true]);// END
function findClickableElement(e){if(!e.tagName)return null;let tagName=e.tagName.toLowerCase();let type=e.type;if(e.hasAttribute('onclick')||e.hasAttribute('href')||tagName=='button'||tagName=='input'&&(type=='submit'||type=='button'||type=='image'||type=='radio'||type=='checkbox'||type=='reset')){return e;}else{if(e.parentNode!=null){return findClickableElement(e.parentNode);}else{return null;}}}//select / addSelect / removeSelect
handlers.push(['select','focus',function(event){if(event.target.nodeName){let tagName=event.target.nodeName.toLowerCase();if('select'==tagName&&event.target.multiple){let options=event.target.options;for(let i=0;i<options.length;i++){if(options[i]._wasSelected==null){// is the focus was gained by mousedown event, _wasSelected would be already set
options[i]._wasSelected=options[i].selected;}}}}},true]);handlers.push(['select','change',function(event){if(event.target.tagName){let tagName=event.target.tagName.toLowerCase();if('select'==tagName){if(!event.target.multiple){let option=event.target.options[event.target.selectedIndex];this.record('select',locatorBuilders.buildAll(event.target),getOptionLocator(option));}else{let options=event.target.options;for(let i=0;i<options.length;i++){if(options[i]._wasSelected!=options[i].selected){let value=getOptionLocator(options[i]);if(options[i].selected){this.record('addSelection',locatorBuilders.buildAll(event.target),value);}else{this.record('removeSelection',locatorBuilders.buildAll(event.target),value);}options[i]._wasSelected=options[i].selected;}}}}}}]);function getOptionLocator(option){let label=option.text.replace(/^ *(.*?) *$/,'$1');if(label.match(/\xA0/)){// if the text contains &nbsp;
return'label=regexp:'+label.replace(/[(\)\[\]\\\^\$\*\+\?\.\|\{\}]/g,function(str){// eslint-disable-line no-useless-escape
return'\\'+str;}).replace(/\s+/g,function(str){if(str.match(/\xA0/)){if(str.length>1){return'\\s+';}else{return'\\s';}}else{return str;}});}else{return'label='+label;}}

/***/ },

/***/ "./content/recorder.js"
/*!*****************************!*\
  !*** ./content/recorder.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Recorder)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "../../../node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _record_handlers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./record-handlers */ "./content/record-handlers.js");
/* harmony import */ var _prompt_injector__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./prompt-injector */ "./content/prompt-injector.js");
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
/**
 * @param {Window} window
 */class Recorder{constructor(window){this.window=window;this.eventListeners={};this.attached=false;this.recordingState={};this.frameLocation='';this.inputTypes=Recorder.inputTypes;this.recalculateFrameLocation=this.recalculateFrameLocation.bind(this);this.attachRecorderHandler=this.attachRecorderHandler.bind(this);this.detachRecorderHandler=this.detachRecorderHandler.bind(this);this.setWindowHandle=this.setWindowHandle.bind(this);this.window.addEventListener('message',this.setWindowHandle);this.window.addEventListener('message',this.setActiveContext);webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.onMessage.addListener(this.recalculateFrameLocation);webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.onMessage.addListener(this.attachRecorderHandler);webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.onMessage.addListener(this.detachRecorderHandler);webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.sendMessage({attachRecorderRequest:true}).then(shouldAttach=>{if(shouldAttach){this.addRecorderTracingAttribute();this.attach();}}).catch(()=>{})// runs in the content script of each frame
// e.g., once on load
;(async()=>{await this.getFrameLocation();})();}addRecorderTracingAttribute(){this.window.document.body.setAttribute('data-side-attach-once-loaded','');}attachRecorderHandler(message,_sender,sendResponse){if(message.attachRecorder){this.attach();sendResponse(true);}}detachRecorderHandler(message,_sender,sendResponse){if(message.detachRecorder){this.detach();sendResponse(true);}}/* record */record(command,target,value,insertBeforeLastCommand,actualFrameLocation){return webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.sendMessage({command:command,target:target,value:value,insertBeforeLastCommand:insertBeforeLastCommand,frameLocation:actualFrameLocation!=undefined?actualFrameLocation:this.frameLocation}).catch(()=>{this.detach();});}setWindowHandle(event){if(event.data&&event.data.direction==='from-page-script'&&event.data.action==='set-handle'){webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.sendMessage({setWindowHandle:true,handle:event.data.args.handle,sessionId:event.data.args.sessionId}).then(()=>{event.source.postMessage({id:event.data.id,direction:'from-content-script'},'*');});}}setActiveContext(event){if(event.data&&event.data.direction==='from-page-script'&&event.data.action==='set-frame'){webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.sendMessage({setActiveContext:true,frameLocation:event.data.args.frameLocation,sessionId:event.data.args.sessionId}).then(()=>{event.source.postMessage({id:event.data.id,direction:'from-content-script'},'*');});}}/**
   * @param {string} eventKey
   */parseEventKey(eventKey){if(eventKey.match(/^C_/)){return{eventName:eventKey.substring(2),capture:true};}else{return{eventName:eventKey,capture:false};}}attach(){if(!this.attached){for(let eventKey in Recorder.eventHandlers){const eventInfo=this.parseEventKey(eventKey);const eventName=eventInfo.eventName;const capture=eventInfo.capture;const handlers=Recorder.eventHandlers[eventKey];this.eventListeners[eventKey]=[];for(let i=0;i<handlers.length;i++){this.window.document.addEventListener(eventName,handlers[i].bind(this),capture);this.eventListeners[eventKey].push(handlers[i]);}}for(let observerName in Recorder.mutationObservers){const observer=Recorder.mutationObservers[observerName];observer.observe(this.window.document.body,observer.config);}this.attached=true;this.recordingState={typeTarget:undefined,typeLock:0,focusTarget:null,focusValue:null,tempValue:null,preventType:false,preventClickTwice:false,preventClick:false,enterTarget:null,enterValue:null,tabCheck:null};attachInputListeners(this.recordingState,this.window);(0,_prompt_injector__WEBPACK_IMPORTED_MODULE_2__.attach)(this.record.bind(this));}}detach(){for(let eventKey in this.eventListeners){const eventInfo=this.parseEventKey(eventKey);const eventName=eventInfo.eventName;const capture=eventInfo.capture;for(let i=0;i<this.eventListeners[eventKey].length;i++){this.window.document.removeEventListener(eventName,this.eventListeners[eventKey][i],capture);}}for(let observerName in Recorder.mutationObservers){const observer=Recorder.mutationObservers[observerName];observer.disconnect();}this.eventListeners={};this.attached=false;detachInputListeners(this.recordingState,this.window);(0,_prompt_injector__WEBPACK_IMPORTED_MODULE_2__.detach)();}// set frame id
getFrameLocation(){let currentWindow=this.window;let currentParentWindow;while(currentWindow!==this.window.top){currentParentWindow=currentWindow.parent;if(!currentParentWindow.frames.length){break;}for(let idx=0;idx<currentParentWindow.frames.length;idx++){const frame=currentParentWindow.frames[idx];if(frame===currentWindow){this.frameLocation=':'+this.frameLocation;currentWindow=currentParentWindow;break;}}}this.frameLocation='root'+this.frameLocation;return webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.sendMessage({frameLocation:this.frameLocation}).catch(()=>{});}recalculateFrameLocation(message,_sender,sendResponse){if(message.recalculateFrameLocation){;(async()=>{this.frameLocation='';await this.getFrameLocation();sendResponse(true);})();return true;}}}/** @type {{ [key: string]: EventListener[] }} */Recorder.eventHandlers={};/** @type {{ [observerName: string]: MutationObserver }} */Recorder.mutationObservers={};/**
 * @param {string} handlerName
 * @param {string} eventName
 * @param {EventListener} handler
 * @param {boolean} options
 */Recorder.addEventHandler=function(handlerName,eventName,handler,options){handler.handlerName=handlerName;if(!options)options=false;let key=options?'C_'+eventName:eventName;if(!this.eventHandlers[key]){this.eventHandlers[key]=[];}this.eventHandlers[key].push(handler);};/**
 * @param {string} observerName
 * @param {MutationCallback} callback
 */Recorder.addMutationObserver=function(observerName,callback,config){const observer=new MutationObserver(callback);observer.observerName=observerName;observer.config=config;this.mutationObservers[observerName]=observer;};Recorder.inputTypes=['text','password','file','datetime','datetime-local','date','month','time','week','number','range','email','url','search','tel','color'];_record_handlers__WEBPACK_IMPORTED_MODULE_1__.handlers.forEach(handler=>{Recorder.addEventHandler(...handler);});_record_handlers__WEBPACK_IMPORTED_MODULE_1__.observers.forEach(observer=>{Recorder.addMutationObserver(...observer);});function updateInputElementsOfRelevantType(action,win){let inp=win.document.getElementsByTagName('input');for(let i=0;i<inp.length;i++){if(Recorder.inputTypes.indexOf(inp[i].type)>=0){action(inp[i]);}}}function focusEvent(recordingState,event){recordingState.focusTarget=event.target;recordingState.focusValue=recordingState.focusTarget.value;recordingState.tempValue=recordingState.focusValue;recordingState.preventType=false;}function blurEvent(recordingState){recordingState.focusTarget=null;recordingState.focusValue=null;recordingState.tempValue=null;}function attachInputListeners(recordingState,win){updateInputElementsOfRelevantType(input=>{input.addEventListener('focus',focusEvent.bind(null,recordingState));input.addEventListener('blur',blurEvent.bind(null,recordingState));},win);}function detachInputListeners(recordingState,win){updateInputElementsOfRelevantType(input=>{input.removeEventListener('focus',focusEvent.bind(null,recordingState));input.removeEventListener('blur',blurEvent.bind(null,recordingState));},win);}

/***/ },

/***/ "./content/target-selector.js"
/*!************************************!*\
  !*** ./content/target-selector.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TargetSelector)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "../../../node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__);
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
class TargetSelector{constructor(callback,cleanupCallback){this.callback=callback;this.cleanupCallback=cleanupCallback;// Instead, we simply assign global content window to this.win
this.win=window;const doc=this.win.document;const div=doc.createElement('div');div.setAttribute('style','display: none;');doc.body.insertBefore(div,doc.body.firstChild);this.div=div;this.e=null;this.r=null;if(window===window.top){this.showBanner(doc);doc.body.insertBefore(this.banner,div);}doc.addEventListener('mousemove',this,true);doc.addEventListener('click',this,true);doc.addEventListener('mouseout',this,true);}cleanup(){try{if(this.div){if(this.div.parentNode){this.div.parentNode.removeChild(this.div);}this.div=null;}if(this.header){if(this.header.parentNode){this.header.parentNode.removeChild(this.header);}this.header=null;}if(this.win){const doc=this.win.document;doc.removeEventListener('mousemove',this,true);doc.removeEventListener('click',this,true);doc.removeEventListener('mouseout',this,true);}}catch(e){if(e!="TypeError: can't access dead object"){throw e;}}this.win=null;if(this.cleanupCallback){this.cleanupCallback();}}handleEvent(evt){switch(evt.type){case'mousemove':this.highlight(evt.target.ownerDocument,evt.clientX,evt.clientY);break;case'click':if(evt.button==0&&this.e&&this.callback){this.callback(this.e,this.win);}//Right click would cancel the select
evt.preventDefault();evt.stopPropagation();this.cleanup();break;case'mouseout':this.removeHighlight();this.e=null;break;}}highlight(doc,x,y){if(doc){const e=doc.elementFromPoint(x,y);if(e&&e.tagName==='IFRAME'){this.removeHighlight();this.e=null;}else if(e&&e!=this.e){this.highlightElement(e);}}}highlightElement(element){if(element&&element!=this.e&&element!==this.banner){this.e=element;}else{return;}const r=element.getBoundingClientRect();const or=this.r;if(r.left>=0&&r.top>=0&&r.width>0&&r.height>0){if(or&&r.top==or.top&&r.left==or.left&&r.width==or.width&&r.height==or.height){return;}this.r=r;const style='pointer-events: none; position: absolute; background-color: rgb(78, 171, 230); opacity: 0.4; border: 1px solid #0e0e0e; z-index: 1000000;';const pos=`top:${r.top+this.win.scrollY}px; left:${r.left+this.win.scrollX}px; width:${r.width}px; height:${r.height}px;`;this.div.setAttribute('style',style+pos);}else if(or){this.div.setAttribute('style','display: none;');}}removeHighlight(){this.div.setAttribute('style','display: none;');}showBanner(doc){this.banner=doc.createElement('div');this.banner.setAttribute('style','position: fixed;top: 0;left: 0;bottom: 0;right: 0;background: trasparent;z-index: 10000;');const header=doc.createElement('div');header.setAttribute('style',"pointer-events: none;display: flex;align-items: center;justify-content: center;flex-direction: row;position: fixed;top: 20%;left: 50%;transform: translateX(-50%);background: #f7f7f7;color: #114990;font-size: 22px;font-weight: 200;z-index: 10001;font-family: system, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;box-shadow: 0 7px 10px 0 rgba(0,0,0,0.1);border: 1px black solid; border-radius: 50px;padding: 10px;");const img=doc.createElement('img');img.src=webextension_polyfill__WEBPACK_IMPORTED_MODULE_0___default().runtime.getURL('/icons/icon128.png');img.setAttribute('style','width: 28px;margin: 0 10px;');header.appendChild(img);const span=doc.createElement('span');span.setAttribute('style','border-left: 1px solid #c6c6c6;padding: 3px 10px;');span.innerText='Select an element';header.appendChild(span);setTimeout(()=>{// this has to happen after a timeout, since adding it sync will add the event
// before the window is focused which will case mousemove to fire before the
// user actually moves the mouse
this.banner.addEventListener('mousemove',()=>{setTimeout(()=>{this.banner.style.visibility='hidden';},300);},false);},300);this.banner.appendChild(header);}}

/***/ },

/***/ "./content/utils.js"
/*!**************************!*\
  !*** ./content/utils.js ***!
  \**************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getTagName: () => (/* binding */ getTagName),
/* harmony export */   isChrome: () => (/* binding */ isChrome),
/* harmony export */   isFirefox: () => (/* binding */ isFirefox),
/* harmony export */   isTest: () => (/* binding */ isTest),
/* harmony export */   parse_locator: () => (/* binding */ parse_locator),
/* harmony export */   userAgent: () => (/* binding */ userAgent)
/* harmony export */ });
/* harmony import */ var ua_parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ua-parser-js */ "../../../node_modules/ua-parser-js/src/ua-parser.js");
/* harmony import */ var ua_parser_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(ua_parser_js__WEBPACK_IMPORTED_MODULE_0__);
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
const isTest="development"==='test';const userAgent=ua_parser_js__WEBPACK_IMPORTED_MODULE_0___default()(window.navigator.userAgent);function isChrome(){userAgent.browser.name==='Chrome';}function isFirefox(){userAgent.browser.name==='Firefox';}/**
 * Parses a Selenium locator, returning its type and the unprefixed locator
 * string as an object.
 *
 * @param locator  the locator to parse
 */function parse_locator(locator){if(!locator){throw new TypeError('Locator cannot be empty');}const result=locator.match(/^([A-Za-z]+)=.+/);if(result){let type=result[1];const length=type.length;const actualLocator=locator.substring(length+1);return{type:type,string:actualLocator};}throw new Error('Implicit locators are obsolete, please prepend the strategy (e.g. id=element).');}/**
 * Returns the tag name of an element lowercased.
 *
 * @param element  an HTMLElement
 */function getTagName(element){let tagName;if(element&&element.tagName&&element.tagName.toLowerCase){tagName=element.tagName.toLowerCase();}return tagName;}

/***/ },

/***/ "./third-party/find-element.js"
/*!*************************************!*\
  !*** ./third-party/find-element.js ***!
  \*************************************/
(module) {

/* eslint-disable */// GENERATED CODE - DO NOT EDIT
module.exports=function(){return function(){var k=this;function l(a){return void 0!==a;}function n(a){return"string"==typeof a;}function aa(a,b){a=a.split(".");var c=k;a[0]in c||!c.execScript||c.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)!a.length&&l(b)?c[d]=b:c[d]&&c[d]!==Object.prototype[d]?c=c[d]:c=c[d]={};}function ba(a){var b=typeof a;if("object"==b){if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function";}else return"null";}else if("function"==b&&"undefined"==typeof a.call)return"object";return b;}function ca(a){return"function"==ba(a);}function da(a){var b=typeof a;return"object"==b&&null!=a||"function"==b;}function fa(a,b,c){return a.call.apply(a.bind,arguments);}function ha(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c);};}return function(){return a.apply(b,arguments);};}function ia(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ia=fa:ia=ha;return ia.apply(null,arguments);}function ja(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b);};}function p(a,b){function c(){}c.prototype=b.prototype;a.U=b.prototype;a.prototype=new c();a.prototype.constructor=a;a.T=function(a,c,f){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];return b.prototype[c].apply(a,d);};};var ka=window;function q(a,b){this.code=a;this.a=r[a]||la;this.message=b||"";a=this.a.replace(/((?:^|\s+)[a-z])/g,function(a){return a.toUpperCase().replace(/^[\s\xa0]+/g,"");});b=a.length-5;if(0>b||a.indexOf("Error",b)!=b)a+="Error";this.name=a;a=Error(this.message);a.name=this.name;this.stack=a.stack||"";}p(q,Error);var la="unknown error",r={15:"element not selectable",11:"element not visible"};r[31]=la;r[30]=la;r[24]="invalid cookie domain";r[29]="invalid element coordinates";r[12]="invalid element state";r[32]="invalid selector";r[51]="invalid selector";r[52]="invalid selector";r[17]="javascript error";r[405]="unsupported operation";r[34]="move target out of bounds";r[27]="no such alert";r[7]="no such element";r[8]="no such frame";r[23]="no such window";r[28]="script timeout";r[33]="session not created";r[10]="stale element reference";r[21]="timeout";r[25]="unable to set cookie";r[26]="unexpected alert open";r[13]=la;r[9]="unknown command";q.prototype.toString=function(){return this.name+": "+this.message;};var ma={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"};var na;function oa(a,b){this.width=a;this.height=b;}oa.prototype.toString=function(){return"("+this.width+" x "+this.height+")";};oa.prototype.aspectRatio=function(){return this.width/this.height;};oa.prototype.ceil=function(){this.width=Math.ceil(this.width);this.height=Math.ceil(this.height);return this;};oa.prototype.floor=function(){this.width=Math.floor(this.width);this.height=Math.floor(this.height);return this;};oa.prototype.round=function(){this.width=Math.round(this.width);this.height=Math.round(this.height);return this;};function pa(a,b){var c=qa;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a);};function ra(a){var b=a.length-1;return 0<=b&&a.indexOf(" ",b)==b;}var sa=String.prototype.trim?function(a){return a.trim();}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"");};function ta(a,b){var c=0;a=sa(String(a)).split(".");b=sa(String(b)).split(".");for(var d=Math.max(a.length,b.length),e=0;0==c&&e<d;e++){var f=a[e]||"",g=b[e]||"";do{f=/(\d*)(\D*)(.*)/.exec(f)||["","","",""];g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];if(0==f[0].length&&0==g[0].length)break;c=ua(0==f[1].length?0:parseInt(f[1],10),0==g[1].length?0:parseInt(g[1],10))||ua(0==f[2].length,0==g[2].length)||ua(f[2],g[2]);f=f[3];g=g[3];}while(0==c);}return c;}function ua(a,b){return a<b?-1:a>b?1:0;}function va(a){return String(a).replace(/\-([a-z])/g,function(a,c){return c.toUpperCase();});};/*

 The MIT License

 Copyright (c) 2007 Cybozu Labs, Inc.
 Copyright (c) 2012 Google Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to
 deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
*/function wa(a,b,c){this.a=a;this.b=b||1;this.f=c||1;};function xa(a){this.b=a;this.a=0;}function ya(a){a=a.match(za);for(var b=0;b<a.length;b++)Ba.test(a[b])&&a.splice(b,1);return new xa(a);}var za=/\$?(?:(?![0-9-\.])(?:\*|[\w-\.]+):)?(?![0-9-\.])(?:\*|[\w-\.]+)|\/\/|\.\.|::|\d+(?:\.\d*)?|\.\d+|"[^"]*"|'[^']*'|[!<>]=|\s+|./g,Ba=/^\s/;function u(a,b){return a.b[a.a+(b||0)];}function w(a){return a.b[a.a++];}function Ca(a){return a.b.length<=a.a;};var Da={o:function(a,b){if(""===a)throw new q(32,'Unable to locate an element with the tagName ""');return b.getElementsByTagName(a)[0]||null;},s:function(a,b){if(""===a)throw new q(32,'Unable to locate an element with the tagName ""');return b.getElementsByTagName(a);}};var x;a:{var Ea=k.navigator;if(Ea){var Fa=Ea.userAgent;if(Fa){x=Fa;break a;}}x="";}function y(a){return-1!=x.indexOf(a);};function z(a,b){this.h=a;this.c=l(b)?b:null;this.b=null;switch(a){case"comment":this.b=8;break;case"text":this.b=3;break;case"processing-instruction":this.b=7;break;case"node":break;default:throw Error("Unexpected argument");}}function Ga(a){return"comment"==a||"text"==a||"processing-instruction"==a||"node"==a;}z.prototype.a=function(a){return null===this.b||this.b==a.nodeType;};z.prototype.f=function(){return this.h;};z.prototype.toString=function(){var a="Kind Test: "+this.h;null===this.c||(a+=A(this.c));return a;};function Ha(a,b){this.j=a.toLowerCase();a="*"==this.j?"*":"http://www.w3.org/1999/xhtml";this.c=b?b.toLowerCase():a;}Ha.prototype.a=function(a){var b=a.nodeType;if(1!=b&&2!=b)return!1;b=l(a.localName)?a.localName:a.nodeName;return"*"!=this.j&&this.j!=b.toLowerCase()?!1:"*"==this.c?!0:this.c==(a.namespaceURI?a.namespaceURI.toLowerCase():"http://www.w3.org/1999/xhtml");};Ha.prototype.f=function(){return this.j;};Ha.prototype.toString=function(){return"Name Test: "+("http://www.w3.org/1999/xhtml"==this.c?"":this.c+":")+this.j;};function Ia(a){switch(a.nodeType){case 1:return ja(Ja,a);case 9:return Ia(a.documentElement);case 11:case 10:case 6:case 12:return Ka;default:return a.parentNode?Ia(a.parentNode):Ka;}}function Ka(){return null;}function Ja(a,b){if(a.prefix==b)return a.namespaceURI||"http://www.w3.org/1999/xhtml";var c=a.getAttributeNode("xmlns:"+b);return c&&c.specified?c.value||null:a.parentNode&&9!=a.parentNode.nodeType?Ja(a.parentNode,b):null;};function La(a,b){if(n(a))return n(b)&&1==b.length?a.indexOf(b,0):-1;for(var c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1;}function B(a,b){for(var c=a.length,d=n(a)?a.split(""):a,e=0;e<c;e++)e in d&&b.call(void 0,d[e],e,a);}function Ma(a,b){for(var c=a.length,d=[],e=0,f=n(a)?a.split(""):a,g=0;g<c;g++)if(g in f){var h=f[g];b.call(void 0,h,g,a)&&(d[e++]=h);}return d;}function Na(a,b,c){var d=c;B(a,function(c,f){d=b.call(void 0,d,c,f,a);});return d;}function Oa(a,b){for(var c=a.length,d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a))return!0;return!1;}function Pa(a,b){for(var c=a.length,d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&!b.call(void 0,d[e],e,a))return!1;return!0;}function Qa(a,b){a:{for(var c=a.length,d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a;}b=-1;}return 0>b?null:n(a)?a.charAt(b):a[b];}function Ra(a){return Array.prototype.concat.apply([],arguments);}function Sa(a,b,c){return 2>=arguments.length?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c);};function Ta(){return y("iPhone")&&!y("iPod")&&!y("iPad");};var Ua="backgroundColor borderTopColor borderRightColor borderBottomColor borderLeftColor color outlineColor".split(" "),Va=/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/,Wa=/^#(?:[0-9a-f]{3}){1,2}$/i,Xa=/^(?:rgba)?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3}),\s?(0|1|0\.\d*)\)$/i,Ya=/^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;function Za(){return(y("Chrome")||y("CriOS"))&&!y("Edge");};function $a(a,b){this.x=l(a)?a:0;this.y=l(b)?b:0;}$a.prototype.toString=function(){return"("+this.x+", "+this.y+")";};$a.prototype.ceil=function(){this.x=Math.ceil(this.x);this.y=Math.ceil(this.y);return this;};$a.prototype.floor=function(){this.x=Math.floor(this.x);this.y=Math.floor(this.y);return this;};$a.prototype.round=function(){this.x=Math.round(this.x);this.y=Math.round(this.y);return this;};var ab=y("Opera"),C=y("Trident")||y("MSIE"),bb=y("Edge"),cb=y("Gecko")&&!(-1!=x.toLowerCase().indexOf("webkit")&&!y("Edge"))&&!(y("Trident")||y("MSIE"))&&!y("Edge"),db=-1!=x.toLowerCase().indexOf("webkit")&&!y("Edge");function eb(){var a=k.document;return a?a.documentMode:void 0;}var fb;a:{var gb="",hb=function(){var a=x;if(cb)return /rv:([^\);]+)(\)|;)/.exec(a);if(bb)return /Edge\/([\d\.]+)/.exec(a);if(C)return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(db)return /WebKit\/(\S+)/.exec(a);if(ab)return /(?:Version)[ \/]?(\S+)/.exec(a);}();hb&&(gb=hb?hb[1]:"");if(C){var ib=eb();if(null!=ib&&ib>parseFloat(gb)){fb=String(ib);break a;}}fb=gb;}var qa={};function jb(a){return pa(a,function(){return 0<=ta(fb,a);});}var D;var kb=k.document;D=kb&&C?eb()||("CSS1Compat"==kb.compatMode?parseInt(fb,10):5):void 0;function lb(a,b,c,d){this.c=a;this.a=b;this.b=c;this.f=d;}lb.prototype.toString=function(){return"("+this.c+"t, "+this.a+"r, "+this.b+"b, "+this.f+"l)";};lb.prototype.ceil=function(){this.c=Math.ceil(this.c);this.a=Math.ceil(this.a);this.b=Math.ceil(this.b);this.f=Math.ceil(this.f);return this;};lb.prototype.floor=function(){this.c=Math.floor(this.c);this.a=Math.floor(this.a);this.b=Math.floor(this.b);this.f=Math.floor(this.f);return this;};lb.prototype.round=function(){this.c=Math.round(this.c);this.a=Math.round(this.a);this.b=Math.round(this.b);this.f=Math.round(this.f);return this;};var mb=y("Firefox"),nb=Ta()||y("iPod"),ob=y("iPad"),pb=y("Android")&&!(Za()||y("Firefox")||y("Opera")||y("Silk")),qb=Za(),rb=y("Safari")&&!(Za()||y("Coast")||y("Opera")||y("Edge")||y("Silk")||y("Android"))&&!(Ta()||y("iPad")||y("iPod"));var F=C&&!(9<=Number(D)),sb=C&&!(8<=Number(D));function G(a,b,c,d){this.a=a;this.b=b;this.width=c;this.height=d;}G.prototype.toString=function(){return"("+this.a+", "+this.b+" - "+this.width+"w x "+this.height+"h)";};G.prototype.ceil=function(){this.a=Math.ceil(this.a);this.b=Math.ceil(this.b);this.width=Math.ceil(this.width);this.height=Math.ceil(this.height);return this;};G.prototype.floor=function(){this.a=Math.floor(this.a);this.b=Math.floor(this.b);this.width=Math.floor(this.width);this.height=Math.floor(this.height);return this;};G.prototype.round=function(){this.a=Math.round(this.a);this.b=Math.round(this.b);this.width=Math.round(this.width);this.height=Math.round(this.height);return this;};function tb(a){return(a=a.exec(x))?a[1]:"";}(function(){if(mb)return tb(/Firefox\/([0-9.]+)/);if(C||bb||ab)return fb;if(qb)return Ta()||y("iPad")||y("iPod")?tb(/CriOS\/([0-9.]+)/):tb(/Chrome\/([0-9.]+)/);if(rb&&!(Ta()||y("iPad")||y("iPod")))return tb(/Version\/([0-9.]+)/);if(nb||ob){var a=/Version\/(\S+).*Mobile\/(\S+)/.exec(x);if(a)return a[1]+"."+a[2];}else if(pb)return(a=tb(/Android\s+([0-9.]+)/))?a:tb(/Version\/([0-9.]+)/);return"";})();function ub(a,b,c,d){this.a=a;this.nodeName=c;this.nodeValue=d;this.nodeType=2;this.parentNode=this.ownerElement=b;}function vb(a,b){var c=sb&&"href"==b.nodeName?a.getAttribute(b.nodeName,2):b.nodeValue;return new ub(b,a,b.nodeName,c);};var wb,xb,yb=function(){if(!cb)return!1;var a=k.Components;if(!a)return!1;try{if(!a.classes)return!1;}catch(f){return!1;}var b=a.classes;a=a.interfaces;var c=b["@mozilla.org/xpcom/version-comparator;1"].getService(a.nsIVersionComparator);b=b["@mozilla.org/xre/app-info;1"].getService(a.nsIXULAppInfo);var d=b.platformVersion,e=b.version;wb=function(){return 0<=c.compare(d,"8");};xb=function(a){c.compare(e,""+a);};return!0;}(),zb=C&&!(8<=Number(D)),Ab=C&&!(9<=Number(D));pb&&yb&&xb(2.3);pb&&yb&&xb(4);rb&&yb&&xb(6);function H(a){return a?new Bb(I(a)):na||(na=new Bb());}function Cb(a){for(;a&&1!=a.nodeType;)a=a.previousSibling;return a;}function Db(a,b){if(!a||!b)return!1;if(a.contains&&1==b.nodeType)return a==b||a.contains(b);if("undefined"!=typeof a.compareDocumentPosition)return a==b||!!(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b.parentNode;return b==a;}function Eb(a,b){if(a==b)return 0;if(a.compareDocumentPosition)return a.compareDocumentPosition(b)&2?1:-1;if(C&&!(9<=Number(D))){if(9==a.nodeType)return-1;if(9==b.nodeType)return 1;}if("sourceIndex"in a||a.parentNode&&"sourceIndex"in a.parentNode){var c=1==a.nodeType,d=1==b.nodeType;if(c&&d)return a.sourceIndex-b.sourceIndex;var e=a.parentNode,f=b.parentNode;return e==f?Fb(a,b):!c&&Db(e,b)?-1*Gb(a,b):!d&&Db(f,a)?Gb(b,a):(c?a.sourceIndex:e.sourceIndex)-(d?b.sourceIndex:f.sourceIndex);}d=I(a);c=d.createRange();c.selectNode(a);c.collapse(!0);a=d.createRange();a.selectNode(b);a.collapse(!0);return c.compareBoundaryPoints(k.Range.START_TO_END,a);}function Gb(a,b){var c=a.parentNode;if(c==b)return-1;for(;b.parentNode!=c;)b=b.parentNode;return Fb(b,a);}function Fb(a,b){for(;b=b.previousSibling;)if(b==a)return-1;return 1;}function I(a){return 9==a.nodeType?a:a.ownerDocument||a.document;}function Hb(a,b){a&&(a=a.parentNode);for(var c=0;a;){if(b(a))return a;a=a.parentNode;c++;}return null;}function Bb(a){this.a=a||k.document||document;}Bb.prototype.getElementsByTagName=function(a,b){return(b||this.a).getElementsByTagName(String(a));};function Ib(a,b,c,d){a=d||a.a;var e=b&&"*"!=b?String(b).toUpperCase():"";if(a.querySelectorAll&&a.querySelector&&(e||c))c=a.querySelectorAll(e+(c?"."+c:""));else if(c&&a.getElementsByClassName){if(b=a.getElementsByClassName(c),e){a={};for(var f=d=0,g;g=b[f];f++)e==g.nodeName&&(a[d++]=g);a.length=d;c=a;}else c=b;}else if(b=a.getElementsByTagName(e||"*"),c){a={};for(f=d=0;g=b[f];f++){e=g.className;var h;if(h="function"==typeof e.split)h=0<=La(e.split(/\s+/),c);h&&(a[d++]=g);}a.length=d;c=a;}else c=b;return c;};function J(a){var b=null,c=a.nodeType;1==c&&(b=a.textContent,b=void 0==b||null==b?a.innerText:b,b=void 0==b||null==b?"":b);if("string"!=typeof b)if(F&&"title"==a.nodeName.toLowerCase()&&1==c)b=a.text;else if(9==c||1==c){a=9==c?a.documentElement:a.firstChild;c=0;var d=[];for(b="";a;){do 1!=a.nodeType&&(b+=a.nodeValue),F&&"title"==a.nodeName.toLowerCase()&&(b+=a.text),d[c++]=a;while(a=a.firstChild);for(;c&&!(a=d[--c].nextSibling););}}else b=a.nodeValue;return b;}function Jb(a,b,c){if(null===b)return!0;try{if(!a.getAttribute)return!1;}catch(d){return!1;}sb&&"class"==b&&(b="className");return null==c?!!a.getAttribute(b):a.getAttribute(b,2)==c;}function Kb(a,b,c,d,e){return(F?Lb:Mb).call(null,a,b,n(c)?c:null,n(d)?d:null,e||new K());}function Lb(a,b,c,d,e){if(a instanceof Ha||8==a.b||c&&null===a.b){var f=b.all;if(!f)return e;a=Nb(a);if("*"!=a&&(f=b.getElementsByTagName(a),!f))return e;if(c){for(var g=[],h=0;b=f[h++];)Jb(b,c,d)&&g.push(b);f=g;}for(h=0;b=f[h++];)"*"==a&&"!"==b.tagName||e.add(b);return e;}Ob(a,b,c,d,e);return e;}function Mb(a,b,c,d,e){b.getElementsByName&&d&&"name"==c&&!C?(b=b.getElementsByName(d),B(b,function(b){a.a(b)&&e.add(b);})):b.getElementsByClassName&&d&&"class"==c?(b=b.getElementsByClassName(d),B(b,function(b){b.className==d&&a.a(b)&&e.add(b);})):a instanceof z?Ob(a,b,c,d,e):b.getElementsByTagName&&(b=b.getElementsByTagName(a.f()),B(b,function(a){Jb(a,c,d)&&e.add(a);}));return e;}function Pb(a,b,c,d,e){var f;if((a instanceof Ha||8==a.b||c&&null===a.b)&&(f=b.childNodes)){var g=Nb(a);if("*"!=g&&(f=Ma(f,function(a){return a.tagName&&a.tagName.toLowerCase()==g;}),!f))return e;c&&(f=Ma(f,function(a){return Jb(a,c,d);}));B(f,function(a){"*"==g&&("!"==a.tagName||"*"==g&&1!=a.nodeType)||e.add(a);});return e;}return Qb(a,b,c,d,e);}function Qb(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)Jb(b,c,d)&&a.a(b)&&e.add(b);return e;}function Ob(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)Jb(b,c,d)&&a.a(b)&&e.add(b),Ob(a,b,c,d,e);}function Nb(a){if(a instanceof z){if(8==a.b)return"!";if(null===a.b)return"*";}return a.f();};function Rb(a,b){b=b.toLowerCase();return"style"==b?Sb(a.style.cssText):zb&&"value"==b&&L(a,"INPUT")?a.value:Ab&&!0===a[b]?String(a.getAttribute(b)):(a=a.getAttributeNode(b))&&a.specified?a.value:null;}var Tb=/[;]+(?=(?:(?:[^"]*"){2})*[^"]*$)(?=(?:(?:[^']*'){2})*[^']*$)(?=(?:[^()]*\([^()]*\))*[^()]*$)/;function Sb(a){var b=[];B(a.split(Tb),function(a){var c=a.indexOf(":");0<c&&(a=[a.slice(0,c),a.slice(c+1)],2==a.length&&b.push(a[0].toLowerCase(),":",a[1],";"));});b=b.join("");return b=";"==b.charAt(b.length-1)?b:b+";";}function L(a,b){b&&"string"!==typeof b&&(b=b.toString());return!!a&&1==a.nodeType&&(!b||a.tagName.toUpperCase()==b);};var Ub={A:function(a){return!(!a.querySelectorAll||!a.querySelector);},o:function(a,b){if(!a)throw new q(32,"No class name specified");a=sa(a);if(-1!==a.indexOf(" "))throw new q(32,"Compound class names not permitted");if(Ub.A(b))try{return b.querySelector("."+a.replace(/\./g,"\\."))||null;}catch(c){throw new q(32,"An invalid or illegal class name was specified");}a=Ib(H(b),"*",a,b);return a.length?a[0]:null;},s:function(a,b){if(!a)throw new q(32,"No class name specified");a=sa(a);if(-1!==a.indexOf(" "))throw new q(32,"Compound class names not permitted");if(Ub.A(b))try{return b.querySelectorAll("."+a.replace(/\./g,"\\."));}catch(c){throw new q(32,"An invalid or illegal class name was specified");}return Ib(H(b),"*",a,b);}};var Vb={o:function(a,b){if(!ca(b.querySelector)&&C&&(yb?wb():C?0<=ta(D,8):jb(8))&&!da(b.querySelector))throw Error("CSS selection is not supported");if(!a)throw new q(32,"No selector specified");a=sa(a);try{var c=b.querySelector(a);}catch(d){throw new q(32,"An invalid or illegal selector was specified");}return c&&1==c.nodeType?c:null;},s:function(a,b){if(!ca(b.querySelectorAll)&&C&&(yb?wb():C?0<=ta(D,8):jb(8))&&!da(b.querySelector))throw Error("CSS selection is not supported");if(!a)throw new q(32,"No selector specified");a=sa(a);try{return b.querySelectorAll(a);}catch(c){throw new q(32,"An invalid or illegal selector was specified");}}};function K(){this.b=this.a=null;this.l=0;}function Wb(a){this.f=a;this.a=this.b=null;}function Xb(a,b){if(!a.a)return b;if(!b.a)return a;var c=a.a;b=b.a;for(var d=null,e,f=0;c&&b;){e=c.f;var g=b.f;e==g||e instanceof ub&&g instanceof ub&&e.a==g.a?(e=c,c=c.a,b=b.a):0<Eb(c.f,b.f)?(e=b,b=b.a):(e=c,c=c.a);(e.b=d)?d.a=e:a.a=e;d=e;f++;}for(e=c||b;e;)e.b=d,d=d.a=e,f++,e=e.a;a.b=d;a.l=f;return a;}function Yb(a,b){b=new Wb(b);b.a=a.a;a.b?a.a.b=b:a.a=a.b=b;a.a=b;a.l++;}K.prototype.add=function(a){a=new Wb(a);a.b=this.b;this.a?this.b.a=a:this.a=this.b=a;this.b=a;this.l++;};function Zb(a){return(a=a.a)?a.f:null;}function $b(a){return(a=Zb(a))?J(a):"";}function ac(a,b){return new bc(a,!!b);}function bc(a,b){this.f=a;this.b=(this.v=b)?a.b:a.a;this.a=null;}function M(a){var b=a.b;if(null==b)return null;var c=a.a=b;a.b=a.v?b.b:b.a;return c.f;};function N(a){this.i=a;this.b=this.g=!1;this.f=null;}function A(a){return"\n  "+a.toString().split("\n").join("\n  ");}function cc(a,b){a.g=b;}function dc(a,b){a.b=b;}function O(a,b){a=a.a(b);return a instanceof K?+$b(a):+a;}function Q(a,b){a=a.a(b);return a instanceof K?$b(a):""+a;}function ec(a,b){a=a.a(b);return a instanceof K?!!a.l:!!a;};function fc(a,b,c){N.call(this,a.i);this.c=a;this.h=b;this.u=c;this.g=b.g||c.g;this.b=b.b||c.b;this.c==gc&&(c.b||c.g||4==c.i||0==c.i||!b.f?b.b||b.g||4==b.i||0==b.i||!c.f||(this.f={name:c.f.name,w:b}):this.f={name:b.f.name,w:c});}p(fc,N);function hc(a,b,c,d,e){b=b.a(d);c=c.a(d);var f;if(b instanceof K&&c instanceof K){b=ac(b);for(d=M(b);d;d=M(b))for(e=ac(c),f=M(e);f;f=M(e))if(a(J(d),J(f)))return!0;return!1;}if(b instanceof K||c instanceof K){b instanceof K?(e=b,d=c):(e=c,d=b);f=ac(e);for(var g=typeof d,h=M(f);h;h=M(f)){switch(g){case"number":h=+J(h);break;case"boolean":h=!!J(h);break;case"string":h=J(h);break;default:throw Error("Illegal primitive type for comparison.");}if(e==b&&a(h,d)||e==c&&a(d,h))return!0;}return!1;}return e?"boolean"==typeof b||"boolean"==typeof c?a(!!b,!!c):"number"==typeof b||"number"==typeof c?a(+b,+c):a(b,c):a(+b,+c);}fc.prototype.a=function(a){return this.c.m(this.h,this.u,a);};fc.prototype.toString=function(){var a="Binary Expression: "+this.c;a+=A(this.h);return a+=A(this.u);};function ic(a,b,c,d){this.R=a;this.K=b;this.i=c;this.m=d;}ic.prototype.toString=function(){return this.R;};var jc={};function R(a,b,c,d){if(jc.hasOwnProperty(a))throw Error("Binary operator already created: "+a);a=new ic(a,b,c,d);return jc[a.toString()]=a;}R("div",6,1,function(a,b,c){return O(a,c)/O(b,c);});R("mod",6,1,function(a,b,c){return O(a,c)%O(b,c);});R("*",6,1,function(a,b,c){return O(a,c)*O(b,c);});R("+",5,1,function(a,b,c){return O(a,c)+O(b,c);});R("-",5,1,function(a,b,c){return O(a,c)-O(b,c);});R("<",4,2,function(a,b,c){return hc(function(a,b){return a<b;},a,b,c);});R(">",4,2,function(a,b,c){return hc(function(a,b){return a>b;},a,b,c);});R("<=",4,2,function(a,b,c){return hc(function(a,b){return a<=b;},a,b,c);});R(">=",4,2,function(a,b,c){return hc(function(a,b){return a>=b;},a,b,c);});var gc=R("=",3,2,function(a,b,c){return hc(function(a,b){return a==b;},a,b,c,!0);});R("!=",3,2,function(a,b,c){return hc(function(a,b){return a!=b;},a,b,c,!0);});R("and",2,2,function(a,b,c){return ec(a,c)&&ec(b,c);});R("or",1,2,function(a,b,c){return ec(a,c)||ec(b,c);});function kc(a,b){if(b.a.length&&4!=a.i)throw Error("Primary expression must evaluate to nodeset if filter has predicate(s).");N.call(this,a.i);this.c=a;this.h=b;this.g=a.g;this.b=a.b;}p(kc,N);kc.prototype.a=function(a){a=this.c.a(a);return lc(this.h,a);};kc.prototype.toString=function(){var a="Filter:"+A(this.c);return a+=A(this.h);};function mc(a,b){if(b.length<a.J)throw Error("Function "+a.j+" expects at least"+a.J+" arguments, "+b.length+" given");if(null!==a.D&&b.length>a.D)throw Error("Function "+a.j+" expects at most "+a.D+" arguments, "+b.length+" given");a.P&&B(b,function(b,d){if(4!=b.i)throw Error("Argument "+d+" to function "+a.j+" is not of type Nodeset: "+b);});N.call(this,a.i);this.B=a;this.c=b;cc(this,a.g||Oa(b,function(a){return a.g;}));dc(this,a.O&&!b.length||a.N&&!!b.length||Oa(b,function(a){return a.b;}));}p(mc,N);mc.prototype.a=function(a){return this.B.m.apply(null,Ra(a,this.c));};mc.prototype.toString=function(){var a="Function: "+this.B;if(this.c.length){var b=Na(this.c,function(a,b){return a+A(b);},"Arguments:");a+=A(b);}return a;};function nc(a,b,c,d,e,f,g,h){this.j=a;this.i=b;this.g=c;this.O=d;this.N=!1;this.m=e;this.J=f;this.D=l(g)?g:f;this.P=!!h;}nc.prototype.toString=function(){return this.j;};var oc={};function S(a,b,c,d,e,f,g,h){if(oc.hasOwnProperty(a))throw Error("Function already created: "+a+".");oc[a]=new nc(a,b,c,d,e,f,g,h);}S("boolean",2,!1,!1,function(a,b){return ec(b,a);},1);S("ceiling",1,!1,!1,function(a,b){return Math.ceil(O(b,a));},1);S("concat",3,!1,!1,function(a,b){return Na(Sa(arguments,1),function(b,d){return b+Q(d,a);},"");},2,null);S("contains",2,!1,!1,function(a,b,c){b=Q(b,a);a=Q(c,a);return-1!=b.indexOf(a);},2);S("count",1,!1,!1,function(a,b){return b.a(a).l;},1,1,!0);S("false",2,!1,!1,function(){return!1;},0);S("floor",1,!1,!1,function(a,b){return Math.floor(O(b,a));},1);S("id",4,!1,!1,function(a,b){function c(a){if(F){var b=e.all[a];if(b){if(b.nodeType&&a==b.id)return b;if(b.length)return Qa(b,function(b){return a==b.id;});}return null;}return e.getElementById(a);}var d=a.a,e=9==d.nodeType?d:d.ownerDocument;a=Q(b,a).split(/\s+/);var f=[];B(a,function(a){a=c(a);!a||0<=La(f,a)||f.push(a);});f.sort(Eb);var g=new K();B(f,function(a){g.add(a);});return g;},1);S("lang",2,!1,!1,function(){return!1;},1);S("last",1,!0,!1,function(a){if(1!=arguments.length)throw Error("Function last expects ()");return a.f;},0);S("local-name",3,!1,!0,function(a,b){return(a=b?Zb(b.a(a)):a.a)?a.localName||a.nodeName.toLowerCase():"";},0,1,!0);S("name",3,!1,!0,function(a,b){return(a=b?Zb(b.a(a)):a.a)?a.nodeName.toLowerCase():"";},0,1,!0);S("namespace-uri",3,!0,!1,function(){return"";},0,1,!0);S("normalize-space",3,!1,!0,function(a,b){return(b?Q(b,a):J(a.a)).replace(/[\s\xa0]+/g," ").replace(/^\s+|\s+$/g,"");},0,1);S("not",2,!1,!1,function(a,b){return!ec(b,a);},1);S("number",1,!1,!0,function(a,b){return b?O(b,a):+J(a.a);},0,1);S("position",1,!0,!1,function(a){return a.b;},0);S("round",1,!1,!1,function(a,b){return Math.round(O(b,a));},1);S("starts-with",2,!1,!1,function(a,b,c){b=Q(b,a);a=Q(c,a);return 0==b.lastIndexOf(a,0);},2);S("string",3,!1,!0,function(a,b){return b?Q(b,a):J(a.a);},0,1);S("string-length",1,!1,!0,function(a,b){return(b?Q(b,a):J(a.a)).length;},0,1);S("substring",3,!1,!1,function(a,b,c,d){c=O(c,a);if(isNaN(c)||Infinity==c||-Infinity==c)return"";d=d?O(d,a):Infinity;if(isNaN(d)||-Infinity===d)return"";c=Math.round(c)-1;var e=Math.max(c,0);a=Q(b,a);return Infinity==d?a.substring(e):a.substring(e,c+Math.round(d));},2,3);S("substring-after",3,!1,!1,function(a,b,c){b=Q(b,a);a=Q(c,a);c=b.indexOf(a);return-1==c?"":b.substring(c+a.length);},2);S("substring-before",3,!1,!1,function(a,b,c){b=Q(b,a);a=Q(c,a);a=b.indexOf(a);return-1==a?"":b.substring(0,a);},2);S("sum",1,!1,!1,function(a,b){a=ac(b.a(a));b=0;for(var c=M(a);c;c=M(a))b+=+J(c);return b;},1,1,!0);S("translate",3,!1,!1,function(a,b,c,d){b=Q(b,a);c=Q(c,a);var e=Q(d,a);a={};for(d=0;d<c.length;d++){var f=c.charAt(d);f in a||(a[f]=e.charAt(d));}c="";for(d=0;d<b.length;d++)f=b.charAt(d),c+=f in a?a[f]:f;return c;},3);S("true",2,!1,!1,function(){return!0;},0);function pc(a){N.call(this,3);this.c=a.substring(1,a.length-1);}p(pc,N);pc.prototype.a=function(){return this.c;};pc.prototype.toString=function(){return"Literal: "+this.c;};function qc(a){N.call(this,1);this.c=a;}p(qc,N);qc.prototype.a=function(){return this.c;};qc.prototype.toString=function(){return"Number: "+this.c;};function rc(a,b){N.call(this,a.i);this.h=a;this.c=b;this.g=a.g;this.b=a.b;1==this.c.length&&(a=this.c[0],a.C||a.c!=sc||(a=a.u,"*"!=a.f()&&(this.f={name:a.f(),w:null})));}p(rc,N);function tc(){N.call(this,4);}p(tc,N);tc.prototype.a=function(a){var b=new K();a=a.a;9==a.nodeType?b.add(a):b.add(a.ownerDocument);return b;};tc.prototype.toString=function(){return"Root Helper Expression";};function uc(){N.call(this,4);}p(uc,N);uc.prototype.a=function(a){var b=new K();b.add(a.a);return b;};uc.prototype.toString=function(){return"Context Helper Expression";};function vc(a){return"/"==a||"//"==a;}rc.prototype.a=function(a){var b=this.h.a(a);if(!(b instanceof K))throw Error("Filter expression must evaluate to nodeset.");a=this.c;for(var c=0,d=a.length;c<d&&b.l;c++){var e=a[c],f=ac(b,e.c.v);if(e.g||e.c!=wc){if(e.g||e.c!=xc){var g=M(f);for(b=e.a(new wa(g));null!=(g=M(f));)g=e.a(new wa(g)),b=Xb(b,g);}else g=M(f),b=e.a(new wa(g));}else{for(g=M(f);(b=M(f))&&(!g.contains||g.contains(b))&&b.compareDocumentPosition(g)&8;g=b);b=e.a(new wa(g));}}return b;};rc.prototype.toString=function(){var a="Path Expression:"+A(this.h);if(this.c.length){var b=Na(this.c,function(a,b){return a+A(b);},"Steps:");a+=A(b);}return a;};function yc(a,b){this.a=a;this.v=!!b;}function lc(a,b,c){for(c=c||0;c<a.a.length;c++)for(var d=a.a[c],e=ac(b),f=b.l,g,h=0;g=M(e);h++){var v=a.v?f-h:h+1;g=d.a(new wa(g,v,f));if("number"==typeof g)v=v==g;else if("string"==typeof g||"boolean"==typeof g)v=!!g;else if(g instanceof K)v=0<g.l;else throw Error("Predicate.evaluate returned an unexpected type.");if(!v){v=e;g=v.f;var t=v.a;if(!t)throw Error("Next must be called at least once before remove.");var m=t.b;t=t.a;m?m.a=t:g.a=t;t?t.b=m:g.b=m;g.l--;v.a=null;}}return b;}yc.prototype.toString=function(){return Na(this.a,function(a,b){return a+A(b);},"Predicates:");};function zc(a){N.call(this,1);this.c=a;this.g=a.g;this.b=a.b;}p(zc,N);zc.prototype.a=function(a){return-O(this.c,a);};zc.prototype.toString=function(){return"Unary Expression: -"+A(this.c);};function Ac(a){N.call(this,4);this.c=a;cc(this,Oa(this.c,function(a){return a.g;}));dc(this,Oa(this.c,function(a){return a.b;}));}p(Ac,N);Ac.prototype.a=function(a){var b=new K();B(this.c,function(c){c=c.a(a);if(!(c instanceof K))throw Error("Path expression must evaluate to NodeSet.");b=Xb(b,c);});return b;};Ac.prototype.toString=function(){return Na(this.c,function(a,b){return a+A(b);},"Union Expression:");};function Bc(a,b,c,d){N.call(this,4);this.c=a;this.u=b;this.h=c||new yc([]);this.C=!!d;b=this.h;b=0<b.a.length?b.a[0].f:null;a.S&&b&&(a=b.name,a=F?a.toLowerCase():a,this.f={name:a,w:b.w});a:{a=this.h;for(b=0;b<a.a.length;b++)if(c=a.a[b],c.g||1==c.i||0==c.i){a=!0;break a;}a=!1;}this.g=a;}p(Bc,N);Bc.prototype.a=function(a){var b=a.a,c=this.f,d=null,e=null,f=0;c&&(d=c.name,e=c.w?Q(c.w,a):null,f=1);if(this.C){if(this.g||this.c!=Cc){if(b=ac(new Bc(Dc,new z("node")).a(a)),c=M(b))for(a=this.m(c,d,e,f);null!=(c=M(b));)a=Xb(a,this.m(c,d,e,f));else a=new K();}else a=Kb(this.u,b,d,e),a=lc(this.h,a,f);}else a=this.m(a.a,d,e,f);return a;};Bc.prototype.m=function(a,b,c,d){a=this.c.B(this.u,a,b,c);return a=lc(this.h,a,d);};Bc.prototype.toString=function(){var a="Step:"+A("Operator: "+(this.C?"//":"/"));this.c.j&&(a+=A("Axis: "+this.c));a+=A(this.u);if(this.h.a.length){var b=Na(this.h.a,function(a,b){return a+A(b);},"Predicates:");a+=A(b);}return a;};function Ec(a,b,c,d){this.j=a;this.B=b;this.v=c;this.S=d;}Ec.prototype.toString=function(){return this.j;};var Fc={};function T(a,b,c,d){if(Fc.hasOwnProperty(a))throw Error("Axis already created: "+a);b=new Ec(a,b,c,!!d);return Fc[a]=b;}T("ancestor",function(a,b){for(var c=new K();b=b.parentNode;)a.a(b)&&Yb(c,b);return c;},!0);T("ancestor-or-self",function(a,b){var c=new K();do a.a(b)&&Yb(c,b);while(b=b.parentNode);return c;},!0);var sc=T("attribute",function(a,b){var c=new K(),d=a.f();if("style"==d&&F&&b.style)return c.add(new ub(b.style,b,"style",b.style.cssText)),c;var e=b.attributes;if(e)if(a instanceof z&&null===a.b||"*"==d)for(a=0;d=e[a];a++)F?d.nodeValue&&c.add(vb(b,d)):c.add(d);else(d=e.getNamedItem(d))&&(F?d.nodeValue&&c.add(vb(b,d)):c.add(d));return c;},!1),Cc=T("child",function(a,b,c,d,e){return(F?Pb:Qb).call(null,a,b,n(c)?c:null,n(d)?d:null,e||new K());},!1,!0);T("descendant",Kb,!1,!0);var Dc=T("descendant-or-self",function(a,b,c,d){var e=new K();Jb(b,c,d)&&a.a(b)&&e.add(b);return Kb(a,b,c,d,e);},!1,!0),wc=T("following",function(a,b,c,d){var e=new K();do for(var f=b;f=f.nextSibling;)Jb(f,c,d)&&a.a(f)&&e.add(f),e=Kb(a,f,c,d,e);while(b=b.parentNode);return e;},!1,!0);T("following-sibling",function(a,b){for(var c=new K();b=b.nextSibling;)a.a(b)&&c.add(b);return c;},!1);T("namespace",function(){return new K();},!1);var Gc=T("parent",function(a,b){var c=new K();if(9==b.nodeType)return c;if(2==b.nodeType)return c.add(b.ownerElement),c;b=b.parentNode;a.a(b)&&c.add(b);return c;},!1),xc=T("preceding",function(a,b,c,d){var e=new K(),f=[];do f.unshift(b);while(b=b.parentNode);for(var g=1,h=f.length;g<h;g++){var v=[];for(b=f[g];b=b.previousSibling;)v.unshift(b);for(var t=0,m=v.length;t<m;t++)b=v[t],Jb(b,c,d)&&a.a(b)&&e.add(b),e=Kb(a,b,c,d,e);}return e;},!0,!0);T("preceding-sibling",function(a,b){for(var c=new K();b=b.previousSibling;)a.a(b)&&Yb(c,b);return c;},!0);var Hc=T("self",function(a,b){var c=new K();a.a(b)&&c.add(b);return c;},!1);function Ic(a,b){this.a=a;this.b=b;}function Jc(a){for(var b,c=[];;){U(a,"Missing right hand side of binary expression.");b=Kc(a);var d=w(a.a);if(!d)break;var e=(d=jc[d]||null)&&d.K;if(!e){a.a.a--;break;}for(;c.length&&e<=c[c.length-1].K;)b=new fc(c.pop(),c.pop(),b);c.push(b,d);}for(;c.length;)b=new fc(c.pop(),c.pop(),b);return b;}function U(a,b){if(Ca(a.a))throw Error(b);}function Lc(a,b){a=w(a.a);if(a!=b)throw Error("Bad token, expected: "+b+" got: "+a);}function Mc(a){a=w(a.a);if(")"!=a)throw Error("Bad token: "+a);}function Nc(a){a=w(a.a);if(2>a.length)throw Error("Unclosed literal string");return new pc(a);}function Oc(a){var b=[];if(vc(u(a.a))){var c=w(a.a);var d=u(a.a);if("/"==c&&(Ca(a.a)||"."!=d&&".."!=d&&"@"!=d&&"*"!=d&&!/(?![0-9])[\w]/.test(d)))return new tc();d=new tc();U(a,"Missing next location step.");c=Pc(a,c);b.push(c);}else{a:{c=u(a.a);d=c.charAt(0);switch(d){case"$":throw Error("Variable reference not allowed in HTML XPath");case"(":w(a.a);c=Jc(a);U(a,'unclosed "("');Lc(a,")");break;case'"':case"'":c=Nc(a);break;default:if(isNaN(+c)){if(!Ga(c)&&/(?![0-9])[\w]/.test(d)&&"("==u(a.a,1)){c=w(a.a);c=oc[c]||null;w(a.a);for(d=[];")"!=u(a.a);){U(a,"Missing function argument list.");d.push(Jc(a));if(","!=u(a.a))break;w(a.a);}U(a,"Unclosed function argument list.");Mc(a);c=new mc(c,d);}else{c=null;break a;}}else c=new qc(+w(a.a));}"["==u(a.a)&&(d=new yc(Qc(a)),c=new kc(c,d));}if(c){if(vc(u(a.a)))d=c;else return c;}else c=Pc(a,"/"),d=new uc(),b.push(c);}for(;vc(u(a.a));)c=w(a.a),U(a,"Missing next location step."),c=Pc(a,c),b.push(c);return new rc(d,b);}function Pc(a,b){if("/"!=b&&"//"!=b)throw Error('Step op should be "/" or "//"');if("."==u(a.a)){var c=new Bc(Hc,new z("node"));w(a.a);return c;}if(".."==u(a.a))return c=new Bc(Gc,new z("node")),w(a.a),c;if("@"==u(a.a)){var d=sc;w(a.a);U(a,"Missing attribute name");}else if("::"==u(a.a,1)){if(!/(?![0-9])[\w]/.test(u(a.a).charAt(0)))throw Error("Bad token: "+w(a.a));var e=w(a.a);d=Fc[e]||null;if(!d)throw Error("No axis with name: "+e);w(a.a);U(a,"Missing node name");}else d=Cc;e=u(a.a);if(/(?![0-9])[\w\*]/.test(e.charAt(0))){if("("==u(a.a,1)){if(!Ga(e))throw Error("Invalid node type: "+e);e=w(a.a);if(!Ga(e))throw Error("Invalid type name: "+e);Lc(a,"(");U(a,"Bad nodetype");var f=u(a.a).charAt(0),g=null;if('"'==f||"'"==f)g=Nc(a);U(a,"Bad nodetype");Mc(a);e=new z(e,g);}else if(e=w(a.a),f=e.indexOf(":"),-1==f)e=new Ha(e);else{g=e.substring(0,f);if("*"==g)var h="*";else if(h=a.b(g),!h)throw Error("Namespace prefix not declared: "+g);e=e.substr(f+1);e=new Ha(e,h);}}else throw Error("Bad token: "+w(a.a));a=new yc(Qc(a),d.v);return c||new Bc(d,e,a,"//"==b);}function Qc(a){for(var b=[];"["==u(a.a);){w(a.a);U(a,"Missing predicate expression.");var c=Jc(a);b.push(c);U(a,"Unclosed predicate expression.");Lc(a,"]");}return b;}function Kc(a){if("-"==u(a.a))return w(a.a),new zc(Kc(a));var b=Oc(a);if("|"!=u(a.a))a=b;else{for(b=[b];"|"==w(a.a);)U(a,"Missing next union location path."),b.push(Oc(a));a.a.a--;a=new Ac(b);}return a;};function Rc(a,b){if(!a.length)throw Error("Empty XPath expression.");a=ya(a);if(Ca(a))throw Error("Invalid XPath expression.");b?ca(b)||(b=ia(b.lookupNamespaceURI,b)):b=function(){return null;};var c=Jc(new Ic(a,b));if(!Ca(a))throw Error("Bad token: "+w(a));this.evaluate=function(a,b){a=c.a(new wa(a));return new V(a,b);};}function V(a,b){if(0==b)if(a instanceof K)b=4;else if("string"==typeof a)b=2;else if("number"==typeof a)b=1;else if("boolean"==typeof a)b=3;else throw Error("Unexpected evaluation result.");if(2!=b&&1!=b&&3!=b&&!(a instanceof K))throw Error("value could not be converted to the specified type");this.resultType=b;switch(b){case 2:this.stringValue=a instanceof K?$b(a):""+a;break;case 1:this.numberValue=a instanceof K?+$b(a):+a;break;case 3:this.booleanValue=a instanceof K?0<a.l:!!a;break;case 4:case 5:case 6:case 7:var c=ac(a);var d=[];for(var e=M(c);e;e=M(c))d.push(e instanceof ub?e.a:e);this.snapshotLength=a.l;this.invalidIteratorState=!1;break;case 8:case 9:a=Zb(a);this.singleNodeValue=a instanceof ub?a.a:a;break;default:throw Error("Unknown XPathResult type.");}var f=0;this.iterateNext=function(){if(4!=b&&5!=b)throw Error("iterateNext called with wrong result type");return f>=d.length?null:d[f++];};this.snapshotItem=function(a){if(6!=b&&7!=b)throw Error("snapshotItem called with wrong result type");return a>=d.length||0>a?null:d[a];};}V.ANY_TYPE=0;V.NUMBER_TYPE=1;V.STRING_TYPE=2;V.BOOLEAN_TYPE=3;V.UNORDERED_NODE_ITERATOR_TYPE=4;V.ORDERED_NODE_ITERATOR_TYPE=5;V.UNORDERED_NODE_SNAPSHOT_TYPE=6;V.ORDERED_NODE_SNAPSHOT_TYPE=7;V.ANY_UNORDERED_NODE_TYPE=8;V.FIRST_ORDERED_NODE_TYPE=9;function Sc(a){this.lookupNamespaceURI=Ia(a);}function Tc(a,b){a=a||k;var c=a.Document&&a.Document.prototype||a.document;if(!c.evaluate||b)a.XPathResult=V,c.evaluate=function(a,b,c,g){return new Rc(a,c).evaluate(b,g);},c.createExpression=function(a,b){return new Rc(a,b);},c.createNSResolver=function(a){return new Sc(a);};}aa("wgxpath.install",Tc);var W={};W.F=function(){var a={V:"http://www.w3.org/2000/svg"};return function(b){return a[b]||null;};}();W.m=function(a,b,c){var d=I(a);if(!d.documentElement)return null;(C||pb)&&Tc(d?d.parentWindow||d.defaultView:window);try{var e=d.createNSResolver?d.createNSResolver(d.documentElement):W.F;if(C&&!jb(7))return d.evaluate.call(d,b,a,e,c,null);if(!C||9<=Number(D)){for(var f={},g=d.getElementsByTagName("*"),h=0;h<g.length;++h){var v=g[h],t=v.namespaceURI;if(t&&!f[t]){var m=v.lookupPrefix(t);if(!m){var E=t.match(".*/(\\w+)/?$");m=E?E[1]:"xhtml";}f[t]=m;}}var P={},ea;for(ea in f)P[f[ea]]=ea;e=function(a){return P[a]||null;};}try{return d.evaluate(b,a,e,c,null);}catch(Aa){if("TypeError"===Aa.name)return e=d.createNSResolver?d.createNSResolver(d.documentElement):W.F,d.evaluate(b,a,e,c,null);throw Aa;}}catch(Aa){if(!cb||"NS_ERROR_ILLEGAL_VALUE"!=Aa.name)throw new q(32,"Unable to locate an element with the xpath expression "+b+" because of the following error:\n"+Aa);}};W.G=function(a,b){if(!a||1!=a.nodeType)throw new q(32,'The result of the xpath expression "'+b+'" is: '+a+". It should be an element.");};W.o=function(a,b){var c=function(){var c=W.m(b,a,9);return c?c.singleNodeValue||null:b.selectSingleNode?(c=I(b),c.setProperty&&c.setProperty("SelectionLanguage","XPath"),b.selectSingleNode(a)):null;}();null===c||W.G(c,a);return c;};W.s=function(a,b){var c=function(){var c=W.m(b,a,7);if(c){for(var e=c.snapshotLength,f=[],g=0;g<e;++g)f.push(c.snapshotItem(g));return f;}return b.selectNodes?(c=I(b),c.setProperty&&c.setProperty("SelectionLanguage","XPath"),b.selectNodes(a)):[];}();B(c,function(b){W.G(b,a);});return c;};var Uc="function"===typeof ShadowRoot;function Vc(a){for(a=a.parentNode;a&&1!=a.nodeType&&9!=a.nodeType&&11!=a.nodeType;)a=a.parentNode;return L(a)?a:null;}function X(a,b){b=va(b);if("float"==b||"cssFloat"==b||"styleFloat"==b)b=Ab?"styleFloat":"cssFloat";a:{var c=b;var d=I(a);if(d.defaultView&&d.defaultView.getComputedStyle&&(d=d.defaultView.getComputedStyle(a,null))){c=d[c]||d.getPropertyValue(c)||"";break a;}c="";}a=c||Wc(a,b);if(null===a)a=null;else if(0<=La(Ua,b)){b:{var e=a.match(Xa);if(e&&(b=Number(e[1]),c=Number(e[2]),d=Number(e[3]),e=Number(e[4]),0<=b&&255>=b&&0<=c&&255>=c&&0<=d&&255>=d&&0<=e&&1>=e)){b=[b,c,d,e];break b;}b=null;}if(!b)b:{if(d=a.match(Ya))if(b=Number(d[1]),c=Number(d[2]),d=Number(d[3]),0<=b&&255>=b&&0<=c&&255>=c&&0<=d&&255>=d){b=[b,c,d,1];break b;}b=null;}if(!b)b:{b=a.toLowerCase();c=ma[b.toLowerCase()];if(!c&&(c="#"==b.charAt(0)?b:"#"+b,4==c.length&&(c=c.replace(Va,"#$1$1$2$2$3$3")),!Wa.test(c))){b=null;break b;}b=[parseInt(c.substr(1,2),16),parseInt(c.substr(3,2),16),parseInt(c.substr(5,2),16),1];}a=b?"rgba("+b.join(", ")+")":a;}return a;}function Wc(a,b){var c=a.currentStyle||a.style,d=c[b];!l(d)&&ca(c.getPropertyValue)&&(d=c.getPropertyValue(b));return"inherit"!=d?l(d)?d:null:(a=Vc(a))?Wc(a,b):null;}function Xc(a,b,c){function d(a){var b=Yc(a);return 0<b.height&&0<b.width?!0:L(a,"PATH")&&(0<b.height||0<b.width)?(a=X(a,"stroke-width"),!!a&&0<parseInt(a,10)):"hidden"!=X(a,"overflow")&&Oa(a.childNodes,function(a){return 3==a.nodeType||L(a)&&d(a);});}function e(a){return Zc(a)==Y&&Pa(a.childNodes,function(a){return!L(a)||e(a)||!d(a);});}if(!L(a))throw Error("Argument to isShown must be of type Element");if(L(a,"BODY"))return!0;if(L(a,"OPTION")||L(a,"OPTGROUP"))return a=Hb(a,function(a){return L(a,"SELECT");}),!!a&&Xc(a,!0,c);var f=$c(a);if(f)return!!f.H&&0<f.rect.width&&0<f.rect.height&&Xc(f.H,b,c);if(L(a,"INPUT")&&"hidden"==a.type.toLowerCase()||L(a,"NOSCRIPT"))return!1;f=X(a,"visibility");return"collapse"!=f&&"hidden"!=f&&c(a)&&(b||0!=ad(a))&&d(a)?!e(a):!1;}function bd(a){function b(a){if(L(a)&&"none"==X(a,"display"))return!1;var c;(c=a.parentNode)&&c.shadowRoot&&void 0!==a.assignedSlot?c=a.assignedSlot?a.assignedSlot.parentNode:null:a.getDestinationInsertionPoints&&(a=a.getDestinationInsertionPoints(),0<a.length&&(c=a[a.length-1]));if(Uc&&c instanceof ShadowRoot){if(c.host.shadowRoot!==c)return!1;c=c.host;}return!c||9!=c.nodeType&&11!=c.nodeType?c&&b(c):!0;}return Xc(a,!1,b);}var Y="hidden";function Zc(a){function b(a){function b(a){return a==g?!0:0==X(a,"display").lastIndexOf("inline",0)||"absolute"==c&&"static"==X(a,"position")?!1:!0;}var c=X(a,"position");if("fixed"==c)return t=!0,a==g?null:g;for(a=Vc(a);a&&!b(a);)a=Vc(a);return a;}function c(a){var b=a;if("visible"==v)if(a==g&&h)b=h;else if(a==h)return{x:"visible",y:"visible"};b={x:X(b,"overflow-x"),y:X(b,"overflow-y")};a==g&&(b.x="visible"==b.x?"auto":b.x,b.y="visible"==b.y?"auto":b.y);return b;}function d(a){if(a==g){var b=new Bb(f).a;a=b.scrollingElement?b.scrollingElement:db||"CSS1Compat"!=b.compatMode?b.body||b.documentElement:b.documentElement;b=b.parentWindow||b.defaultView;a=C&&jb("10")&&b.pageYOffset!=a.scrollTop?new $a(a.scrollLeft,a.scrollTop):new $a(b.pageXOffset||a.scrollLeft,b.pageYOffset||a.scrollTop);}else a=new $a(a.scrollLeft,a.scrollTop);return a;}var e=cd(a),f=I(a),g=f.documentElement,h=f.body,v=X(g,"overflow"),t;for(a=b(a);a;a=b(a)){var m=c(a);if("visible"!=m.x||"visible"!=m.y){var E=Yc(a);if(0==E.width||0==E.height)return Y;var P=e.a<E.a,ea=e.b<E.b;if(P&&"hidden"==m.x||ea&&"hidden"==m.y)return Y;if(P&&"visible"!=m.x||ea&&"visible"!=m.y){P=d(a);ea=e.b<E.b-P.y;if(e.a<E.a-P.x&&"visible"!=m.x||ea&&"visible"!=m.x)return Y;e=Zc(a);return e==Y?Y:"scroll";}P=e.f>=E.a+E.width;E=e.c>=E.b+E.height;if(P&&"hidden"==m.x||E&&"hidden"==m.y)return Y;if(P&&"visible"!=m.x||E&&"visible"!=m.y){if(t&&(m=d(a),e.f>=g.scrollWidth-m.x||e.a>=g.scrollHeight-m.y))return Y;e=Zc(a);return e==Y?Y:"scroll";}}}return"none";}function Yc(a){var b=$c(a);if(b)return b.rect;if(L(a,"HTML"))return a=I(a),a=((a?a.parentWindow||a.defaultView:window)||window).document,a="CSS1Compat"==a.compatMode?a.documentElement:a.body,a=new oa(a.clientWidth,a.clientHeight),new G(0,0,a.width,a.height);try{var c=a.getBoundingClientRect();}catch(d){return new G(0,0,0,0);}b=new G(c.left,c.top,c.right-c.left,c.bottom-c.top);C&&a.ownerDocument.body&&(a=I(a),b.a-=a.documentElement.clientLeft+a.body.clientLeft,b.b-=a.documentElement.clientTop+a.body.clientTop);return b;}function $c(a){var b=L(a,"MAP");if(!b&&!L(a,"AREA"))return null;var c=b?a:L(a.parentNode,"MAP")?a.parentNode:null,d=null,e=null;c&&c.name&&(d=W.o('/descendant::*[@usemap = "#'+c.name+'"]',I(c)))&&(e=Yc(d),b||"default"==a.shape.toLowerCase()||(a=dd(a),b=Math.min(Math.max(a.a,0),e.width),c=Math.min(Math.max(a.b,0),e.height),e=new G(b+e.a,c+e.b,Math.min(a.width,e.width-b),Math.min(a.height,e.height-c))));return{H:d,rect:e||new G(0,0,0,0)};}function dd(a){var b=a.shape.toLowerCase();a=a.coords.split(",");if("rect"==b&&4==a.length){b=a[0];var c=a[1];return new G(b,c,a[2]-b,a[3]-c);}if("circle"==b&&3==a.length)return b=a[2],new G(a[0]-b,a[1]-b,2*b,2*b);if("poly"==b&&2<a.length){b=a[0];c=a[1];for(var d=b,e=c,f=2;f+1<a.length;f+=2)b=Math.min(b,a[f]),d=Math.max(d,a[f]),c=Math.min(c,a[f+1]),e=Math.max(e,a[f+1]);return new G(b,c,d-b,e-c);}return new G(0,0,0,0);}function cd(a){a=Yc(a);return new lb(a.b,a.a+a.width,a.b+a.height,a.a);}function ed(a){return a.replace(/^[^\S\xa0]+|[^\S\xa0]+$/g,"");}function fd(a){var b=[];Uc?gd(a,b):hd(a,b);var c=b;a=c.length;b=Array(a);c=n(c)?c.split(""):c;for(var d=0;d<a;d++)d in c&&(b[d]=ed.call(void 0,c[d]));return ed(b.join("\n")).replace(/\xa0/g," ");}function id(a,b,c){if(L(a,"BR"))b.push("");else{var d=L(a,"TD"),e=X(a,"display"),f=!d&&!(0<=La(jd,e)),g=l(a.previousElementSibling)?a.previousElementSibling:Cb(a.previousSibling);g=g?X(g,"display"):"";var h=X(a,"float")||X(a,"cssFloat")||X(a,"styleFloat");!f||"run-in"==g&&"none"==h||/^[\s\xa0]*$/.test(b[b.length-1]||"")||b.push("");var v=bd(a),t=null,m=null;v&&(t=X(a,"white-space"),m=X(a,"text-transform"));B(a.childNodes,function(a){c(a,b,v,t,m);});a=b[b.length-1]||"";!d&&"table-cell"!=e||!a||ra(a)||(b[b.length-1]+=" ");f&&"run-in"!=e&&!/^[\s\xa0]*$/.test(a)&&b.push("");}}function hd(a,b){id(a,b,function(a,b,e,f,g){3==a.nodeType&&e?kd(a,b,f,g):L(a)&&hd(a,b);});}var jd="inline inline-block inline-table none table-cell table-column table-column-group".split(" ");function kd(a,b,c,d){a=a.nodeValue.replace(/[\u200b\u200e\u200f]/g,"");a=a.replace(/(\r\n|\r|\n)/g,"\n");if("normal"==c||"nowrap"==c)a=a.replace(/\n/g," ");a="pre"==c||"pre-wrap"==c?a.replace(/[ \f\t\v\u2028\u2029]/g,"\u00a0"):a.replace(/[ \f\t\v\u2028\u2029]+/g," ");"capitalize"==d?a=a.replace(/(^|\s)(\S)/g,function(a,b,c){return b+c.toUpperCase();}):"uppercase"==d?a=a.toUpperCase():"lowercase"==d&&(a=a.toLowerCase());c=b.pop()||"";ra(c)&&0==a.lastIndexOf(" ",0)&&(a=a.substr(1));b.push(c+a);}function ad(a){if(Ab){if("relative"==X(a,"position"))return 1;a=X(a,"filter");return(a=a.match(/^alpha\(opacity=(\d*)\)/)||a.match(/^progid:DXImageTransform.Microsoft.Alpha\(Opacity=(\d*)\)/))?Number(a[1])/100:1;}return ld(a);}function ld(a){var b=1,c=X(a,"opacity");c&&(b=Number(c));(a=Vc(a))&&(b*=ld(a));return b;}function md(a,b,c,d,e){if(3==a.nodeType&&c)kd(a,b,d,e);else if(L(a))if(L(a,"CONTENT")||L(a,"SLOT")){for(var f=a;f.parentNode;)f=f.parentNode;f instanceof ShadowRoot?(a=L(a,"CONTENT")?a.getDistributedNodes():a.assignedNodes(),B(a,function(a){md(a,b,c,d,e);})):gd(a,b);}else if(L(a,"SHADOW")){for(f=a;f.parentNode;)f=f.parentNode;if(f instanceof ShadowRoot&&(a=f))for(a=a.olderShadowRoot;a;)B(a.childNodes,function(a){md(a,b,c,d,e);}),a=a.olderShadowRoot;}else gd(a,b);}function gd(a,b){a.shadowRoot&&B(a.shadowRoot.childNodes,function(a){md(a,b,!0,null,null);});id(a,b,function(a,b,e,f,g){var c=null;1==a.nodeType?c=a:3==a.nodeType&&(c=a);null!=c&&(null!=c.assignedSlot||c.getDestinationInsertionPoints&&0<c.getDestinationInsertionPoints().length)||md(a,b,e,f,g);});};var nd={A:function(a,b){return!(!a.querySelectorAll||!a.querySelector)&&!/^\d.*/.test(b);},o:function(a,b){var c=H(b),d=n(a)?c.a.getElementById(a):a;return d?Rb(d,"id")==a&&b!=d&&Db(b,d)?d:Qa(Ib(c,"*"),function(c){return Rb(c,"id")==a&&b!=c&&Db(b,c);}):null;},s:function(a,b){if(!a)return[];if(nd.A(b,a))try{return b.querySelectorAll("#"+nd.M(a));}catch(c){return[];}b=Ib(H(b),"*",null,b);return Ma(b,function(b){return Rb(b,"id")==a;});},M:function(a){return a.replace(/([\s'"\\#.:;,!?+<>=~*^$|%&@`{}\-\/\[\]\(\)])/g,"\\$1");}};var Z={},od={};Z.L=function(a,b,c){try{var d=Vb.s("a",b);}catch(e){d=Ib(H(b),"A",null,b);}return Qa(d,function(b){b=fd(b);b=b.replace(/^[\s]+|[\s]+$/g,"");return c&&-1!=b.indexOf(a)||b==a;});};Z.I=function(a,b,c){try{var d=Vb.s("a",b);}catch(e){d=Ib(H(b),"A",null,b);}return Ma(d,function(b){b=fd(b);b=b.replace(/^[\s]+|[\s]+$/g,"");return c&&-1!=b.indexOf(a)||b==a;});};Z.o=function(a,b){return Z.L(a,b,!1);};Z.s=function(a,b){return Z.I(a,b,!1);};od.o=function(a,b){return Z.L(a,b,!0);};od.s=function(a,b){return Z.I(a,b,!0);};var pd={className:Ub,"class name":Ub,css:Vb,"css selector":Vb,id:nd,linkText:Z,"link text":Z,name:{o:function(a,b){b=Ib(H(b),"*",null,b);return Qa(b,function(b){return Rb(b,"name")==a;});},s:function(a,b){b=Ib(H(b),"*",null,b);return Ma(b,function(b){return Rb(b,"name")==a;});}},partialLinkText:od,"partial link text":od,tagName:Da,"tag name":Da,xpath:W};aa("_",function(a,b){a:{for(c in a)if(a.hasOwnProperty(c))break a;var c=null;}if(c){var d=pd[c];if(d&&ca(d.o))return d.o(a[c],b||ka.document);}throw new q(61,"Unsupported locator strategy: "+c);});;return this._.apply(null,arguments);}.apply({navigator:typeof window!='undefined'?window.navigator:null,document:typeof window!='undefined'?window.document:null},arguments);};

/***/ },

/***/ "../../../node_modules/cssesc/cssesc.js"
/*!**********************************************!*\
  !*** ../../../node_modules/cssesc/cssesc.js ***!
  \**********************************************/
(module) {

"use strict";
/*! https://mths.be/cssesc v1.0.1 by @mathias */


var object = {};
var hasOwnProperty = object.hasOwnProperty;
var merge = function merge(options, defaults) {
	if (!options) {
		return defaults;
	}
	var result = {};
	for (var key in defaults) {
		// `if (defaults.hasOwnProperty(key) { … }` is not needed here, since
		// only recognized option names are used.
		result[key] = hasOwnProperty.call(options, key) ? options[key] : defaults[key];
	}
	return result;
};

var regexAnySingleEscape = /[ -,\.\/;-@\[-\^`\{-~]/;
var regexSingleEscape = /[ -,\.\/;-@\[\]\^`\{-~]/;
var regexAlwaysEscape = /['"\\]/;
var regexExcessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;

// https://mathiasbynens.be/notes/css-escapes#css
var cssesc = function cssesc(string, options) {
	options = merge(options, cssesc.options);
	if (options.quotes != 'single' && options.quotes != 'double') {
		options.quotes = 'single';
	}
	var quote = options.quotes == 'double' ? '"' : '\'';
	var isIdentifier = options.isIdentifier;

	var firstChar = string.charAt(0);
	var output = '';
	var counter = 0;
	var length = string.length;
	while (counter < length) {
		var character = string.charAt(counter++);
		var codePoint = character.charCodeAt();
		var value = void 0;
		// If it’s not a printable ASCII character…
		if (codePoint < 0x20 || codePoint > 0x7E) {
			if (codePoint >= 0xD800 && codePoint <= 0xDBFF && counter < length) {
				// It’s a high surrogate, and there is a next character.
				var extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) {
					// next character is low surrogate
					codePoint = ((codePoint & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
				} else {
					// It’s an unmatched surrogate; only append this code unit, in case
					// the next code unit is the high surrogate of a surrogate pair.
					counter--;
				}
			}
			value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
		} else {
			if (options.escapeEverything) {
				if (regexAnySingleEscape.test(character)) {
					value = '\\' + character;
				} else {
					value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
				}
				// Note: `:` could be escaped as `\:`, but that fails in IE < 8.
			} else if (/[\t\n\f\r\x0B:]/.test(character)) {
				if (!isIdentifier && character == ':') {
					value = character;
				} else {
					value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
				}
			} else if (character == '\\' || !isIdentifier && (character == '"' && quote == character || character == '\'' && quote == character) || isIdentifier && regexSingleEscape.test(character)) {
				value = '\\' + character;
			} else {
				value = character;
			}
		}
		output += value;
	}

	if (isIdentifier) {
		if (/^_/.test(output)) {
			// Prevent IE6 from ignoring the rule altogether (in case this is for an
			// identifier used as a selector)
			output = '\\_' + output.slice(1);
		} else if (/^-[-\d]/.test(output)) {
			output = '\\-' + output.slice(1);
		} else if (/\d/.test(firstChar)) {
			output = '\\3' + firstChar + ' ' + output.slice(1);
		}
	}

	// Remove spaces after `\HEX` escapes that are not followed by a hex digit,
	// since they’re redundant. Note that this is only possible if the escape
	// sequence isn’t preceded by an odd number of backslashes.
	output = output.replace(regexExcessiveSpaces, function ($0, $1, $2) {
		if ($1 && $1.length % 2) {
			// It’s not safe to remove the space, so don’t.
			return $0;
		}
		// Strip the space.
		return ($1 || '') + $2;
	});

	if (!isIdentifier && options.wrap) {
		return quote + output + quote;
	}
	return output;
};

// Expose default options (so they can be overridden globally).
cssesc.options = {
	'escapeEverything': false,
	'isIdentifier': false,
	'quotes': 'single',
	'wrap': false
};

cssesc.version = '1.0.1';

module.exports = cssesc;


/***/ },

/***/ "../../../node_modules/scroll-into-view-if-needed/es/index.js"
/*!********************************************************************!*\
  !*** ../../../node_modules/scroll-into-view-if-needed/es/index.js ***!
  \********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var compute_scroll_into_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! compute-scroll-into-view */ "../../../node_modules/compute-scroll-into-view/dist/index.mjs");

function isOptionsObject(options) {
  return options === Object(options) && Object.keys(options).length !== 0;
}
function defaultBehavior(actions, behavior) {
  if (behavior === void 0) {
    behavior = 'auto';
  }
  var canSmoothScroll = ('scrollBehavior' in document.body.style);
  actions.forEach(function (_ref) {
    var el = _ref.el,
      top = _ref.top,
      left = _ref.left;
    if (el.scroll && canSmoothScroll) {
      el.scroll({
        top: top,
        left: left,
        behavior: behavior
      });
    } else {
      el.scrollTop = top;
      el.scrollLeft = left;
    }
  });
}
function getOptions(options) {
  if (options === false) {
    return {
      block: 'end',
      inline: 'nearest'
    };
  }
  if (isOptionsObject(options)) {
    return options;
  }
  return {
    block: 'start',
    inline: 'nearest'
  };
}
function scrollIntoView(target, options) {
  var isTargetAttached = target.isConnected || target.ownerDocument.documentElement.contains(target);
  if (isOptionsObject(options) && typeof options.behavior === 'function') {
    return options.behavior(isTargetAttached ? (0,compute_scroll_into_view__WEBPACK_IMPORTED_MODULE_0__["default"])(target, options) : []);
  }
  if (!isTargetAttached) {
    return;
  }
  var computeOptions = getOptions(options);
  return defaultBehavior((0,compute_scroll_into_view__WEBPACK_IMPORTED_MODULE_0__["default"])(target, computeOptions), computeOptions.behavior);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (scrollIntoView);

/***/ },

/***/ "../../../node_modules/ua-parser-js/src/ua-parser.js"
/*!***********************************************************!*\
  !*** ../../../node_modules/ua-parser-js/src/ua-parser.js ***!
  \***********************************************************/
(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/////////////////////////////////////////////////////////////////////////////////
/* UAParser.js v0.7.41
   Copyright © 2012-2025 Faisal Salman <f@faisalman.com>
   MIT License *//*
   Detect Browser, Engine, OS, CPU, and Device type/model from User-Agent data.
   Supports browser & node.js environment. 
   Demo   : https://faisalman.github.io/ua-parser-js
   Source : https://github.com/faisalman/ua-parser-js */
/////////////////////////////////////////////////////////////////////////////////

(function (window, undefined) {

    'use strict';

    //////////////
    // Constants
    /////////////


    var LIBVERSION  = '0.7.41',
        EMPTY       = '',
        UNKNOWN     = '?',
        FUNC_TYPE   = 'function',
        UNDEF_TYPE  = 'undefined',
        OBJ_TYPE    = 'object',
        STR_TYPE    = 'string',
        MAJOR       = 'major',
        MODEL       = 'model',
        NAME        = 'name',
        TYPE        = 'type',
        VENDOR      = 'vendor',
        VERSION     = 'version',
        ARCHITECTURE= 'architecture',
        CONSOLE     = 'console',
        MOBILE      = 'mobile',
        TABLET      = 'tablet',
        SMARTTV     = 'smarttv',
        WEARABLE    = 'wearable',
        EMBEDDED    = 'embedded',
        UA_MAX_LENGTH = 500;

    var AMAZON  = 'Amazon',
        APPLE   = 'Apple',
        ASUS    = 'ASUS',
        BLACKBERRY = 'BlackBerry',
        BROWSER = 'Browser',
        CHROME  = 'Chrome',
        EDGE    = 'Edge',
        FIREFOX = 'Firefox',
        GOOGLE  = 'Google',
        HONOR   = 'Honor',
        HUAWEI  = 'Huawei',
        LENOVO  = 'Lenovo',
        LG      = 'LG',
        MICROSOFT = 'Microsoft',
        MOTOROLA  = 'Motorola',
        NVIDIA  = 'Nvidia',
        ONEPLUS = 'OnePlus',
        OPERA   = 'Opera',
        OPPO    = 'OPPO',
        SAMSUNG = 'Samsung',
        SHARP   = 'Sharp',
        SONY    = 'Sony',
        XIAOMI  = 'Xiaomi',
        ZEBRA   = 'Zebra',
        FACEBOOK    = 'Facebook',
        CHROMIUM_OS = 'Chromium OS',
        MAC_OS  = 'Mac OS',
        SUFFIX_BROWSER = ' Browser';

    ///////////
    // Helper
    //////////

    var extend = function (regexes, extensions) {
            var mergedRegexes = {};
            for (var i in regexes) {
                if (extensions[i] && extensions[i].length % 2 === 0) {
                    mergedRegexes[i] = extensions[i].concat(regexes[i]);
                } else {
                    mergedRegexes[i] = regexes[i];
                }
            }
            return mergedRegexes;
        },
        enumerize = function (arr) {
            var enums = {};
            for (var i=0; i<arr.length; i++) {
                enums[arr[i].toUpperCase()] = arr[i];
            }
            return enums;
        },
        has = function (str1, str2) {
            return typeof str1 === STR_TYPE ? lowerize(str2).indexOf(lowerize(str1)) !== -1 : false;
        },
        lowerize = function (str) {
            return str.toLowerCase();
        },
        majorize = function (version) {
            return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g, EMPTY).split('.')[0] : undefined;
        },
        trim = function (str, len) {
            if (typeof(str) === STR_TYPE) {
                str = str.replace(/^\s\s*/, EMPTY);
                return typeof(len) === UNDEF_TYPE ? str : str.substring(0, UA_MAX_LENGTH);
            }
    };

    ///////////////
    // Map helper
    //////////////

    var rgxMapper = function (ua, arrays) {

            var i = 0, j, k, p, q, matches, match;

            // loop through all regexes maps
            while (i < arrays.length && !matches) {

                var regex = arrays[i],       // even sequence (0,2,4,..)
                    props = arrays[i + 1];   // odd sequence (1,3,5,..)
                j = k = 0;

                // try matching uastring with regexes
                while (j < regex.length && !matches) {

                    if (!regex[j]) { break; }
                    matches = regex[j++].exec(ua);

                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof q === OBJ_TYPE && q.length > 0) {
                                if (q.length === 2) {
                                    if (typeof q[1] == FUNC_TYPE) {
                                        // assign modified match
                                        this[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        this[q[0]] = q[1];
                                    }
                                } else if (q.length === 3) {
                                    // check whether function or regex
                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        this[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length === 4) {
                                        this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                this[q] = match ? match : undefined;
                            }
                        }
                    }
                }
                i += 2;
            }
        },

        strMapper = function (str, map) {

            for (var i in map) {
                // check if current value is array
                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                    for (var j = 0; j < map[i].length; j++) {
                        if (has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return map.hasOwnProperty('*') ? map['*'] : str;
    };

    ///////////////
    // String map
    //////////////

    // Safari < 3.0
    var oldSafariMap = {
            '1.0'   : '/8',
            '1.2'   : '/1',
            '1.3'   : '/3',
            '2.0'   : '/412',
            '2.0.2' : '/416',
            '2.0.3' : '/417',
            '2.0.4' : '/419',
            '?'     : '/'
        },
        windowsVersionMap = {
            'ME'        : '4.90',
            'NT 3.11'   : 'NT3.51',
            'NT 4.0'    : 'NT4.0',
            '2000'      : 'NT 5.0',
            'XP'        : ['NT 5.1', 'NT 5.2'],
            'Vista'     : 'NT 6.0',
            '7'         : 'NT 6.1',
            '8'         : 'NT 6.2',
            '8.1'       : 'NT 6.3',
            '10'        : ['NT 6.4', 'NT 10.0'],
            'RT'        : 'ARM'
    };

    //////////////
    // Regex map
    /////////////

    var regexes = {

        browser : [[

            /\b(?:crmo|crios)\/([\w\.]+)/i                                      // Chrome for Android/iOS
            ], [VERSION, [NAME, 'Chrome']], [
            /edg(?:e|ios|a)?\/([\w\.]+)/i                                       // Microsoft Edge
            ], [VERSION, [NAME, 'Edge']], [

            // Presto based
            /(opera mini)\/([-\w\.]+)/i,                                        // Opera Mini
            /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,                 // Opera Mobi/Tablet
            /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i                           // Opera
            ], [NAME, VERSION], [
            /opios[\/ ]+([\w\.]+)/i                                             // Opera mini on iphone >= 8.0
            ], [VERSION, [NAME, OPERA+' Mini']], [
            /\bop(?:rg)?x\/([\w\.]+)/i                                          // Opera GX
            ], [VERSION, [NAME, OPERA+' GX']], [
            /\bopr\/([\w\.]+)/i                                                 // Opera Webkit
            ], [VERSION, [NAME, OPERA]], [

            // Mixed
            /\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i            // Baidu
            ], [VERSION, [NAME, 'Baidu']], [
            /\b(?:mxbrowser|mxios|myie2)\/?([-\w\.]*)\b/i                       // Maxthon
            ], [VERSION, [NAME, 'Maxthon']], [
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer|sleipnir)[\/ ]?([\w\.]*)/i,      
                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer/Sleipnir
            // Trident based
            /(avant|iemobile|slim(?:browser|boat|jet))[\/ ]?([\d\.]*)/i,        // Avant/IEMobile/SlimBrowser/SlimBoat/Slimjet
            /(?:ms|\()(ie) ([\w\.]+)/i,                                         // Internet Explorer

            // Blink/Webkit/KHTML based                                         // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
            /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|duckduckgo|klar|helio|(?=comodo_)?dragon)\/([-\w\.]+)/i,
                                                                                // Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ//Vivaldi/DuckDuckGo/Klar/Helio/Dragon
            /(heytap|ovi|115)browser\/([\d\.]+)/i,                              // HeyTap/Ovi/115
            /(weibo)__([\d\.]+)/i                                               // Weibo
            ], [NAME, VERSION], [
            /quark(?:pc)?\/([-\w\.]+)/i                                         // Quark
            ], [VERSION, [NAME, 'Quark']], [
            /\bddg\/([\w\.]+)/i                                                 // DuckDuckGo
            ], [VERSION, [NAME, 'DuckDuckGo']], [
            /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i                 // UCBrowser
            ], [VERSION, [NAME, 'UC'+BROWSER]], [
            /microm.+\bqbcore\/([\w\.]+)/i,                                     // WeChat Desktop for Windows Built-in Browser
            /\bqbcore\/([\w\.]+).+microm/i,
            /micromessenger\/([\w\.]+)/i                                        // WeChat
            ], [VERSION, [NAME, 'WeChat']], [
            /konqueror\/([\w\.]+)/i                                             // Konqueror
            ], [VERSION, [NAME, 'Konqueror']], [
            /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i                       // IE11
            ], [VERSION, [NAME, 'IE']], [
            /ya(?:search)?browser\/([\w\.]+)/i                                  // Yandex
            ], [VERSION, [NAME, 'Yandex']], [
            /slbrowser\/([\w\.]+)/i                                             // Smart Lenovo Browser
            ], [VERSION, [NAME, 'Smart Lenovo '+BROWSER]], [
            /(avast|avg)\/([\w\.]+)/i                                           // Avast/AVG Secure Browser
            ], [[NAME, /(.+)/, '$1 Secure '+BROWSER], VERSION], [
            /\bfocus\/([\w\.]+)/i                                               // Firefox Focus
            ], [VERSION, [NAME, FIREFOX+' Focus']], [
            /\bopt\/([\w\.]+)/i                                                 // Opera Touch
            ], [VERSION, [NAME, OPERA+' Touch']], [
            /coc_coc\w+\/([\w\.]+)/i                                            // Coc Coc Browser
            ], [VERSION, [NAME, 'Coc Coc']], [
            /dolfin\/([\w\.]+)/i                                                // Dolphin
            ], [VERSION, [NAME, 'Dolphin']], [
            /coast\/([\w\.]+)/i                                                 // Opera Coast
            ], [VERSION, [NAME, OPERA+' Coast']], [
            /miuibrowser\/([\w\.]+)/i                                           // MIUI Browser
            ], [VERSION, [NAME, 'MIUI' + SUFFIX_BROWSER]], [
            /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
            ], [VERSION, [NAME, FIREFOX]], [
            /\bqihoobrowser\/?([\w\.]*)/i                                       // 360
            ], [VERSION, [NAME, '360']], [
            /\b(qq)\/([\w\.]+)/i                                                // QQ
            ], [[NAME, /(.+)/, '$1Browser'], VERSION], [
            /(oculus|sailfish|huawei|vivo|pico)browser\/([\w\.]+)/i
            ], [[NAME, /(.+)/, '$1' + SUFFIX_BROWSER], VERSION], [              // Oculus/Sailfish/HuaweiBrowser/VivoBrowser/PicoBrowser
            /samsungbrowser\/([\w\.]+)/i                                        // Samsung Internet
            ], [VERSION, [NAME, SAMSUNG + ' Internet']], [
            /metasr[\/ ]?([\d\.]+)/i                                            // Sogou Explorer
            ], [VERSION, [NAME, 'Sogou Explorer']], [
            /(sogou)mo\w+\/([\d\.]+)/i                                          // Sogou Mobile
            ], [[NAME, 'Sogou Mobile'], VERSION], [
            /(electron)\/([\w\.]+) safari/i,                                    // Electron-based App
            /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,                   // Tesla
            /m?(qqbrowser|2345(?=browser|chrome|explorer))\w*[\/ ]?v?([\w\.]+)/i   // QQ/2345
            ], [NAME, VERSION], [
            /(lbbrowser|rekonq)/i,                                              // LieBao Browser/Rekonq
            /\[(linkedin)app\]/i                                                // LinkedIn App for iOS & Android
            ], [NAME], [
            /ome\/([\w\.]+) \w* ?(iron) saf/i,                                  // Iron
            /ome\/([\w\.]+).+qihu (360)[es]e/i                                  // 360
            ], [VERSION, NAME], [

            // WebView
            /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i       // Facebook App for iOS & Android
            ], [[NAME, FACEBOOK], VERSION], [
            /(Klarna)\/([\w\.]+)/i,                                             // Klarna Shopping Browser for iOS & Android
            /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,                             // Kakao App
            /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,                                  // Naver InApp
            /(daum)apps[\/ ]([\w\.]+)/i,                                        // Daum App
            /safari (line)\/([\w\.]+)/i,                                        // Line App for iOS
            /\b(line)\/([\w\.]+)\/iab/i,                                        // Line App for Android
            /(alipay)client\/([\w\.]+)/i,                                       // Alipay
            /(twitter)(?:and| f.+e\/([\w\.]+))/i,                               // Twitter
            /(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i                     // Chromium/Instagram/Snapchat
            ], [NAME, VERSION], [
            /\bgsa\/([\w\.]+) .*safari\//i                                      // Google Search Appliance on iOS
            ], [VERSION, [NAME, 'GSA']], [
            /musical_ly(?:.+app_?version\/|_)([\w\.]+)/i                        // TikTok
            ], [VERSION, [NAME, 'TikTok']], [

            /headlesschrome(?:\/([\w\.]+)| )/i                                  // Chrome Headless
            ], [VERSION, [NAME, CHROME+' Headless']], [

            / wv\).+(chrome)\/([\w\.]+)/i                                       // Chrome WebView
            ], [[NAME, CHROME+' WebView'], VERSION], [

            /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i           // Android Browser
            ], [VERSION, [NAME, 'Android '+BROWSER]], [

            /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i       // Chrome/OmniWeb/Arora/Tizen/Nokia
            ], [NAME, VERSION], [

            /version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i                      // Mobile Safari
            ], [VERSION, [NAME, 'Mobile Safari']], [
            /version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i                // Safari & Safari Mobile
            ], [VERSION, NAME], [
            /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i                      // Safari < 3.0
            ], [NAME, [VERSION, strMapper, oldSafariMap]], [

            /(webkit|khtml)\/([\w\.]+)/i
            ], [NAME, VERSION], [

            // Gecko based
            /(navigator|netscape\d?)\/([-\w\.]+)/i                              // Netscape
            ], [[NAME, 'Netscape'], VERSION], [
            /(wolvic|librewolf)\/([\w\.]+)/i                                    // Wolvic/LibreWolf
            ], [NAME, VERSION], [
            /mobile vr; rv:([\w\.]+)\).+firefox/i                               // Firefox Reality
            ], [VERSION, [NAME, FIREFOX+' Reality']], [
            /ekiohf.+(flow)\/([\w\.]+)/i,                                       // Flow
            /(swiftfox)/i,                                                      // Swiftfox
            /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror)[\/ ]?([\w\.\+]+)/i,
                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
            /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(firefox)\/([\w\.]+)/i,                                            // Other Firefox-based
            /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,                         // Mozilla

            // Other
            /(amaya|dillo|doris|icab|ladybird|lynx|mosaic|netsurf|obigo|polaris|w3m|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Obigo/Mosaic/Go/ICE/UP.Browser/Ladybird
            /\b(links) \(([\w\.]+)/i                                            // Links
            ], [NAME, [VERSION, /_/g, '.']], [
            
            /(cobalt)\/([\w\.]+)/i                                              // Cobalt
            ], [NAME, [VERSION, /master.|lts./, ""]]
        ],

        cpu : [[

            /\b((amd|x|x86[-_]?|wow|win)64)\b/i                                 // AMD64 (x64)
            ], [[ARCHITECTURE, 'amd64']], [

            /(ia32(?=;))/i,                                                     // IA32 (quicktime)
            /\b((i[346]|x)86)(pc)?\b/i                                          // IA32 (x86)
            ], [[ARCHITECTURE, 'ia32']], [

            /\b(aarch64|arm(v?[89]e?l?|_?64))\b/i                               // ARM64
            ], [[ARCHITECTURE, 'arm64']], [

            /\b(arm(v[67])?ht?n?[fl]p?)\b/i                                     // ARMHF
            ], [[ARCHITECTURE, 'armhf']], [

            // PocketPC mistakenly identified as PowerPC
            /( (ce|mobile); ppc;|\/[\w\.]+arm\b)/i
            ], [[ARCHITECTURE, 'arm']], [

            /((ppc|powerpc)(64)?)( mac|;|\))/i                                  // PowerPC
            ], [[ARCHITECTURE, /ower/, EMPTY, lowerize]], [

            / sun4\w[;\)]/i                                                     // SPARC
            ], [[ARCHITECTURE, 'sparc']], [

            /\b(avr32|ia64(?=;)|68k(?=\))|\barm(?=v([1-7]|[5-7]1)l?|;|eabi)|(irix|mips|sparc)(64)?\b|pa-risc)/i
                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
            ], [[ARCHITECTURE, lowerize]]
        ],

        device : [[

            //////////////////////////
            // MOBILES & TABLETS
            /////////////////////////

            // Samsung
            /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i
            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, TABLET]], [
            /\b((?:s[cgp]h|gt|sm)-(?![lr])\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
            /samsung[- ]((?!sm-[lr])[-\w]+)/i,
            /sec-(sgh\w+)/i
            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, MOBILE]], [

            // Apple
            /(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i                          // iPod/iPhone
            ], [MODEL, [VENDOR, APPLE], [TYPE, MOBILE]], [
            /\((ipad);[-\w\),; ]+apple/i,                                       // iPad
            /applecoremedia\/[\w\.]+ \((ipad)/i,
            /\b(ipad)\d\d?,\d\d?[;\]].+ios/i
            ], [MODEL, [VENDOR, APPLE], [TYPE, TABLET]], [
            /(macintosh);/i
            ], [MODEL, [VENDOR, APPLE]], [

            // Sharp
            /\b(sh-?[altvz]?\d\d[a-ekm]?)/i
            ], [MODEL, [VENDOR, SHARP], [TYPE, MOBILE]], [

            // Honor
            /\b((?:brt|eln|hey2?|gdi|jdn)-a?[lnw]09|(?:ag[rm]3?|jdn2|kob2)-a?[lw]0[09]hn)(?: bui|\)|;)/i
            ], [MODEL, [VENDOR, HONOR], [TYPE, TABLET]], [
            /honor([-\w ]+)[;\)]/i
            ], [MODEL, [VENDOR, HONOR], [TYPE, MOBILE]], [

            // Huawei
            /\b((?:ag[rs][2356]?k?|bah[234]?|bg[2o]|bt[kv]|cmr|cpn|db[ry]2?|jdn2|got|kob2?k?|mon|pce|scm|sht?|[tw]gr|vrd)-[ad]?[lw][0125][09]b?|605hw|bg2-u03|(?:gem|fdr|m2|ple|t1)-[7a]0[1-4][lu]|t1-a2[13][lw]|mediapad[\w\. ]*(?= bui|\)))\b(?!.+d\/s)/i
            ], [MODEL, [VENDOR, HUAWEI], [TYPE, TABLET]], [
            /(?:huawei)([-\w ]+)[;\)]/i,
            /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i
            ], [MODEL, [VENDOR, HUAWEI], [TYPE, MOBILE]], [

            // Xiaomi
            /oid[^\)]+; (2[\dbc]{4}(182|283|rp\w{2})[cgl]|m2105k81a?c)(?: bui|\))/i,
            /\b((?:red)?mi[-_ ]?pad[\w- ]*)(?: bui|\))/i                                // Mi Pad tablets
            ],[[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, TABLET]], [

            /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,                  // Xiaomi POCO
            /\b; (\w+) build\/hm\1/i,                                           // Xiaomi Hongmi 'numeric' models
            /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,                             // Xiaomi Hongmi
            /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,                   // Xiaomi Redmi
            /oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,        // Xiaomi Redmi 'numeric' models
            /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite|pro)?)(?: bui|\))/i, // Xiaomi Mi
            / ([\w ]+) miui\/v?\d/i
            ], [[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, MOBILE]], [

            // OPPO
            /; (\w+) bui.+ oppo/i,
            /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i
            ], [MODEL, [VENDOR, OPPO], [TYPE, MOBILE]], [
            /\b(opd2(\d{3}a?))(?: bui|\))/i
            ], [MODEL, [VENDOR, strMapper, { 'OnePlus' : ['304', '403', '203'], '*' : OPPO }], [TYPE, TABLET]], [

            // Vivo
            /vivo (\w+)(?: bui|\))/i,
            /\b(v[12]\d{3}\w?[at])(?: bui|;)/i
            ], [MODEL, [VENDOR, 'Vivo'], [TYPE, MOBILE]], [

            // Realme
            /\b(rmx[1-3]\d{3})(?: bui|;|\))/i
            ], [MODEL, [VENDOR, 'Realme'], [TYPE, MOBILE]], [

            // Motorola
            /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
            /\bmot(?:orola)?[- ](\w*)/i,
            /((?:moto(?! 360)[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, MOBILE]], [
            /\b(mz60\d|xoom[2 ]{0,2}) build\//i
            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, TABLET]], [

            // LG
            /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i
            ], [MODEL, [VENDOR, LG], [TYPE, TABLET]], [
            /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
            /\blg[-e;\/ ]+((?!browser|netcast|android tv|watch)\w+)/i,
            /\blg-?([\d\w]+) bui/i
            ], [MODEL, [VENDOR, LG], [TYPE, MOBILE]], [

            // Lenovo
            /(ideatab[-\w ]+|602lv|d-42a|a101lv|a2109a|a3500-hv|s[56]000|pb-6505[my]|tb-?x?\d{3,4}(?:f[cu]|xu|[av])|yt\d?-[jx]?\d+[lfmx])( bui|;|\)|\/)/i,
            /lenovo ?(b[68]0[08]0-?[hf]?|tab(?:[\w- ]+?)|tb[\w-]{6,7})( bui|;|\)|\/)/i
            ], [MODEL, [VENDOR, LENOVO], [TYPE, TABLET]], [

            // Nokia
            /(nokia) (t[12][01])/i
            ], [VENDOR, MODEL, [TYPE, TABLET]], [
            /(?:maemo|nokia).*(n900|lumia \d+|rm-\d+)/i,
            /nokia[-_ ]?(([-\w\. ]*))/i
            ], [[MODEL, /_/g, ' '], [TYPE, MOBILE], [VENDOR, 'Nokia']], [

            // Google
            /(pixel (c|tablet))\b/i                                             // Google Pixel C/Tablet
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, TABLET]], [
            /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i                         // Google Pixel
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, MOBILE]], [

            // Sony
            /droid.+; (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i
            ], [MODEL, [VENDOR, SONY], [TYPE, MOBILE]], [
            /sony tablet [ps]/i,
            /\b(?:sony)?sgp\w+(?: bui|\))/i
            ], [[MODEL, 'Xperia Tablet'], [VENDOR, SONY], [TYPE, TABLET]], [

            // OnePlus
            / (kb2005|in20[12]5|be20[12][59])\b/i,
            /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i
            ], [MODEL, [VENDOR, ONEPLUS], [TYPE, MOBILE]], [

            // Amazon
            /(alexa)webm/i,
            /(kf[a-z]{2}wi|aeo(?!bc)\w\w)( bui|\))/i,                           // Kindle Fire without Silk / Echo Show
            /(kf[a-z]+)( bui|\)).+silk\//i                                      // Kindle Fire HD
            ], [MODEL, [VENDOR, AMAZON], [TYPE, TABLET]], [
            /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i                     // Fire Phone
            ], [[MODEL, /(.+)/g, 'Fire Phone $1'], [VENDOR, AMAZON], [TYPE, MOBILE]], [

            // BlackBerry
            /(playbook);[-\w\),; ]+(rim)/i                                      // BlackBerry PlayBook
            ], [MODEL, VENDOR, [TYPE, TABLET]], [
            /\b((?:bb[a-f]|st[hv])100-\d)/i,
            /\(bb10; (\w+)/i                                                    // BlackBerry 10
            ], [MODEL, [VENDOR, BLACKBERRY], [TYPE, MOBILE]], [

            // Asus
            /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i
            ], [MODEL, [VENDOR, ASUS], [TYPE, TABLET]], [
            / (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i
            ], [MODEL, [VENDOR, ASUS], [TYPE, MOBILE]], [

            // HTC
            /(nexus 9)/i                                                        // HTC Nexus 9
            ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [
            /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,                         // HTC

            // ZTE
            /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
            /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i         // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

            // TCL
            /droid [\w\.]+; ((?:8[14]9[16]|9(?:0(?:48|60|8[01])|1(?:3[27]|66)|2(?:6[69]|9[56])|466))[gqswx])\w*(\)| bui)/i
            ], [MODEL, [VENDOR, 'TCL'], [TYPE, TABLET]], [

            // itel
            /(itel) ((\w+))/i
            ], [[VENDOR, lowerize], MODEL, [TYPE, strMapper, { 'tablet' : ['p10001l', 'w7001'], '*' : 'mobile' }]], [

            // Acer
            /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i
            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

            // Meizu
            /droid.+; (m[1-5] note) bui/i,
            /\bmz-([-\w]{2,})/i
            ], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [
                
            // Ulefone
            /; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i
            ], [MODEL, [VENDOR, 'Ulefone'], [TYPE, MOBILE]], [

            // Energizer
            /; (energy ?\w+)(?: bui|\))/i,
            /; energizer ([\w ]+)(?: bui|\))/i
            ], [MODEL, [VENDOR, 'Energizer'], [TYPE, MOBILE]], [

            // Cat
            /; cat (b35);/i,
            /; (b15q?|s22 flip|s48c|s62 pro)(?: bui|\))/i
            ], [MODEL, [VENDOR, 'Cat'], [TYPE, MOBILE]], [

            // Smartfren
            /((?:new )?andromax[\w- ]+)(?: bui|\))/i
            ], [MODEL, [VENDOR, 'Smartfren'], [TYPE, MOBILE]], [

            // Nothing
            /droid.+; (a(?:015|06[35]|142p?))/i
            ], [MODEL, [VENDOR, 'Nothing'], [TYPE, MOBILE]], [

            // Archos
            /; (x67 5g|tikeasy \w+|ac[1789]\d\w+)( b|\))/i,
            /archos ?(5|gamepad2?|([\w ]*[t1789]|hello) ?\d+[\w ]*)( b|\))/i
            ], [MODEL, [VENDOR, 'Archos'], [TYPE, TABLET]], [
            /archos ([\w ]+)( b|\))/i,
            /; (ac[3-6]\d\w{2,8})( b|\))/i 
            ], [MODEL, [VENDOR, 'Archos'], [TYPE, MOBILE]], [

            // MIXED
            /(imo) (tab \w+)/i,                                                 // IMO
            /(infinix) (x1101b?)/i                                              // Infinix XPad
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus(?! zenw)|dell|jolla|meizu|motorola|polytron|infinix|tecno|micromax|advan)[-_ ]?([-\w]*)/i,
                                                                                // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron/Infinix/Tecno/Micromax/Advan
            /; (hmd|imo) ([\w ]+?)(?: bui|\))/i,                                // HMD/IMO
            /(hp) ([\w ]+\w)/i,                                                 // HP iPAQ
            /(microsoft); (lumia[\w ]+)/i,                                      // Microsoft Lumia
            /(lenovo)[-_ ]?([-\w ]+?)(?: bui|\)|\/)/i,                          // Lenovo
            /(oppo) ?([\w ]+) bui/i                                             // OPPO
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /(kobo)\s(ereader|touch)/i,                                         // Kobo
            /(hp).+(touchpad(?!.+tablet)|tablet)/i,                             // HP TouchPad
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(nook)[\w ]+build\/(\w+)/i,                                        // Nook
            /(dell) (strea[kpr\d ]*[\dko])/i,                                   // Dell Streak
            /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,                                  // Le Pan Tablets
            /(trinity)[- ]*(t\d{3}) bui/i,                                      // Trinity Tablets
            /(gigaset)[- ]+(q\w{1,9}) bui/i,                                    // Gigaset Tablets
            /(vodafone) ([\w ]+)(?:\)| bui)/i                                   // Vodafone
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(surface duo)/i                                                    // Surface Duo
            ], [MODEL, [VENDOR, MICROSOFT], [TYPE, TABLET]], [
            /droid [\d\.]+; (fp\du?)(?: b|\))/i                                 // Fairphone
            ], [MODEL, [VENDOR, 'Fairphone'], [TYPE, MOBILE]], [
            /(u304aa)/i                                                         // AT&T
            ], [MODEL, [VENDOR, 'AT&T'], [TYPE, MOBILE]], [
            /\bsie-(\w*)/i                                                      // Siemens
            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [
            /\b(rct\w+) b/i                                                     // RCA Tablets
            ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [
            /\b(venue[\d ]{2,7}) b/i                                            // Dell Venue Tablets
            ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [
            /\b(q(?:mv|ta)\w+) b/i                                              // Verizon Tablet
            ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [
            /\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i                       // Barnes & Noble Tablet
            ], [MODEL, [VENDOR, 'Barnes & Noble'], [TYPE, TABLET]], [
            /\b(tm\d{3}\w+) b/i
            ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [
            /\b(k88) b/i                                                        // ZTE K Series Tablet
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [
            /\b(nx\d{3}j) b/i                                                   // ZTE Nubia
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [
            /\b(gen\d{3}) b.+49h/i                                              // Swiss GEN Mobile
            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [
            /\b(zur\d{3}) b/i                                                   // Swiss ZUR Tablet
            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [
            /\b((zeki)?tb.*\b) b/i                                              // Zeki Tablets
            ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [
            /\b([yr]\d{2}) b/i,
            /\b(dragon[- ]+touch |dt)(\w{5}) b/i                                // Dragon Touch Tablet
            ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [
            /\b(ns-?\w{0,9}) b/i                                                // Insignia Tablets
            ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [
            /\b((nxa|next)-?\w{0,9}) b/i                                        // NextBook Tablets
            ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [
            /\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i                  // Voice Xtreme Phones
            ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [
            /\b(lvtel\-)?(v1[12]) b/i                                           // LvTel Phones
            ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [
            /\b(ph-1) /i                                                        // Essential PH-1
            ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [
            /\b(v(100md|700na|7011|917g).*\b) b/i                               // Envizen Tablets
            ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [
            /\b(trio[-\w\. ]+) b/i                                              // MachSpeed Tablets
            ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [
            /\btu_(1491) b/i                                                    // Rotor Tablets
            ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [
            /((?:tegranote|shield t(?!.+d tv))[\w- ]*?)(?: b|\))/i              // Nvidia Tablets
            ], [MODEL, [VENDOR, NVIDIA], [TYPE, TABLET]], [
            /(sprint) (\w+)/i                                                   // Sprint Phones
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
            ], [[MODEL, /\./g, ' '], [VENDOR, MICROSOFT], [TYPE, MOBILE]], [
            /droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i             // Zebra
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, TABLET]], [
            /droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, MOBILE]], [

            ///////////////////
            // SMARTTVS
            ///////////////////

            /smart-tv.+(samsung)/i                                              // Samsung
            ], [VENDOR, [TYPE, SMARTTV]], [
            /hbbtv.+maple;(\d+)/i
            ], [[MODEL, /^/, 'SmartTV'], [VENDOR, SAMSUNG], [TYPE, SMARTTV]], [
            /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i        // LG SmartTV
            ], [[VENDOR, LG], [TYPE, SMARTTV]], [
            /(apple) ?tv/i                                                      // Apple TV
            ], [VENDOR, [MODEL, APPLE+' TV'], [TYPE, SMARTTV]], [
            /crkey/i                                                            // Google Chromecast
            ], [[MODEL, CHROME+'cast'], [VENDOR, GOOGLE], [TYPE, SMARTTV]], [
            /droid.+aft(\w+)( bui|\))/i                                         // Fire TV
            ], [MODEL, [VENDOR, AMAZON], [TYPE, SMARTTV]], [
            /(shield \w+ tv)/i                                                  // Nvidia Shield TV
            ], [MODEL, [VENDOR, NVIDIA], [TYPE, SMARTTV]], [
            /\(dtv[\);].+(aquos)/i,
            /(aquos-tv[\w ]+)\)/i                                               // Sharp
            ], [MODEL, [VENDOR, SHARP], [TYPE, SMARTTV]],[
            /(bravia[\w ]+)( bui|\))/i                                              // Sony
            ], [MODEL, [VENDOR, SONY], [TYPE, SMARTTV]], [
            /(mi(tv|box)-?\w+) bui/i                                            // Xiaomi
            ], [MODEL, [VENDOR, XIAOMI], [TYPE, SMARTTV]], [
            /Hbbtv.*(technisat) (.*);/i                                         // TechniSAT
            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
            /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,                          // Roku
            /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i         // HbbTV devices
            ], [[VENDOR, trim], [MODEL, trim], [TYPE, SMARTTV]], [
                                                                                // SmartTV from Unidentified Vendors
            /droid.+; ([\w- ]+) (?:android tv|smart[- ]?tv)/i
            ], [MODEL, [TYPE, SMARTTV]], [
            /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i
            ], [[TYPE, SMARTTV]], [

            ///////////////////
            // CONSOLES
            ///////////////////

            /(ouya)/i,                                                          // Ouya
            /(nintendo) ([wids3utch]+)/i                                        // Nintendo
            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [
            /droid.+; (shield)( bui|\))/i                                       // Nvidia Portable
            ], [MODEL, [VENDOR, NVIDIA], [TYPE, CONSOLE]], [
            /(playstation \w+)/i                                                // Playstation
            ], [MODEL, [VENDOR, SONY], [TYPE, CONSOLE]], [
            /\b(xbox(?: one)?(?!; xbox))[\); ]/i                                // Microsoft Xbox
            ], [MODEL, [VENDOR, MICROSOFT], [TYPE, CONSOLE]], [

            ///////////////////
            // WEARABLES
            ///////////////////

            /\b(sm-[lr]\d\d[0156][fnuw]?s?|gear live)\b/i                       // Samsung Galaxy Watch
            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, WEARABLE]], [
            /((pebble))app/i,                                                   // Pebble
            /(asus|google|lg|oppo) ((pixel |zen)?watch[\w ]*)( bui|\))/i        // Asus ZenWatch / LG Watch / Pixel Watch
            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
            /(ow(?:19|20)?we?[1-3]{1,3})/i                                      // Oppo Watch
            ], [MODEL, [VENDOR, OPPO], [TYPE, WEARABLE]], [
            /(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i                              // Apple Watch
            ], [MODEL, [VENDOR, APPLE], [TYPE, WEARABLE]], [
            /(opwwe\d{3})/i                                                     // OnePlus Watch
            ], [MODEL, [VENDOR, ONEPLUS], [TYPE, WEARABLE]], [
            /(moto 360)/i                                                       // Motorola 360
            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, WEARABLE]], [
            /(smartwatch 3)/i                                                   // Sony SmartWatch
            ], [MODEL, [VENDOR, SONY], [TYPE, WEARABLE]], [
            /(g watch r)/i                                                      // LG G Watch R
            ], [MODEL, [VENDOR, LG], [TYPE, WEARABLE]], [
            /droid.+; (wt63?0{2,3})\)/i
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, WEARABLE]], [

            ///////////////////
            // XR
            ///////////////////

            /droid.+; (glass) \d/i                                              // Google Glass
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, WEARABLE]], [
            /(pico) (4|neo3(?: link|pro)?)/i                                    // Pico
            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
            /; (quest( \d| pro)?)/i                                             // Oculus Quest
            ], [MODEL, [VENDOR, FACEBOOK], [TYPE, WEARABLE]], [

            ///////////////////
            // EMBEDDED
            ///////////////////

            /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i                              // Tesla
            ], [VENDOR, [TYPE, EMBEDDED]], [
            /(aeobc)\b/i                                                        // Echo Dot
            ], [MODEL, [VENDOR, AMAZON], [TYPE, EMBEDDED]], [
            /(homepod).+mac os/i                                                // Apple HomePod
            ], [MODEL, [VENDOR, APPLE], [TYPE, EMBEDDED]], [
            /windows iot/i
            ], [[TYPE, EMBEDDED]], [

            ////////////////////
            // MIXED (GENERIC)
            ///////////////////

            /droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i    // Android Phones from Unidentified Vendors
            ], [MODEL, [TYPE, MOBILE]], [
            /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i       // Android Tablets from Unidentified Vendors
            ], [MODEL, [TYPE, TABLET]], [
            /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i                      // Unidentifiable Tablet
            ], [[TYPE, TABLET]], [
            /(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i    // Unidentifiable Mobile
            ], [[TYPE, MOBILE]], [
            /droid .+?; ([\w\. -]+)( bui|\))/i                                  // Generic Android Device
            ], [MODEL, [VENDOR, 'Generic']]
        ],

        engine : [[

            /windows.+ edge\/([\w\.]+)/i                                       // EdgeHTML
            ], [VERSION, [NAME, EDGE+'HTML']], [

            /(arkweb)\/([\w\.]+)/i                                              // ArkWeb
            ], [NAME, VERSION], [

            /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i                         // Blink
            ], [VERSION, [NAME, 'Blink']], [

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna|servo)\/([\w\.]+)/i, // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna/Servo
            /ekioh(flow)\/([\w\.]+)/i,                                          // Flow
            /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,                           // KHTML/Tasman/Links
            /(icab)[\/ ]([23]\.[\d\.]+)/i,                                      // iCab

            /\b(libweb)/i                                                       // LibWeb
            ], [NAME, VERSION], [
            /ladybird\//i
            ], [[NAME, 'LibWeb']], [

            /rv\:([\w\.]{1,9})\b.+(gecko)/i                                     // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows
            /microsoft (windows) (vista|xp)/i                                   // Windows (iTunes)
            ], [NAME, VERSION], [
            /(windows (?:phone(?: os)?|mobile|iot))[\/ ]?([\d\.\w ]*)/i         // Windows Phone
            ], [NAME, [VERSION, strMapper, windowsVersionMap]], [
            /windows nt 6\.2; (arm)/i,                                          // Windows RT
            /windows[\/ ]([ntce\d\. ]+\w)(?!.+xbox)/i,
            /(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i
            ], [[VERSION, strMapper, windowsVersionMap], [NAME, 'Windows']], [

            // iOS/macOS
            /[adehimnop]{4,7}\b(?:.*os ([\w]+) like mac|; opera)/i,             // iOS
            /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
            /cfnetwork\/.+darwin/i
            ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [
            /(mac os x) ?([\w\. ]*)/i,
            /(macintosh|mac_powerpc\b)(?!.+haiku)/i                             // Mac OS
            ], [[NAME, MAC_OS], [VERSION, /_/g, '.']], [

            // Mobile OSes
            /droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i                    // Android-x86/HarmonyOS
            ], [VERSION, NAME], [                                               
            /(ubuntu) ([\w\.]+) like android/i                                  // Ubuntu Touch
            ], [[NAME, /(.+)/, '$1 Touch'], VERSION], [
                                                                                // Android/Blackberry/WebOS/QNX/Bada/RIM/KaiOS/Maemo/MeeGo/S40/Sailfish OS/OpenHarmony/Tizen
            /(android|bada|blackberry|kaios|maemo|meego|openharmony|qnx|rim tablet os|sailfish|series40|symbian|tizen|webos)\w*[-\/; ]?([\d\.]*)/i
            ], [NAME, VERSION], [
            /\(bb(10);/i                                                        // BlackBerry 10
            ], [VERSION, [NAME, BLACKBERRY]], [
            /(?:symbian ?os|symbos|s60(?=;)|series ?60)[-\/ ]?([\w\.]*)/i       // Symbian
            ], [VERSION, [NAME, 'Symbian']], [
            /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i // Firefox OS
            ], [VERSION, [NAME, FIREFOX+' OS']], [
            /web0s;.+rt(tv)/i,
            /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i                              // WebOS
            ], [VERSION, [NAME, 'webOS']], [
            /watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i                              // watchOS
            ], [VERSION, [NAME, 'watchOS']], [

            // Google Chromecast
            /crkey\/([\d\.]+)/i                                                 // Google Chromecast
            ], [VERSION, [NAME, CHROME+'cast']], [
            /(cros) [\w]+(?:\)| ([\w\.]+)\b)/i                                  // Chromium OS
            ], [[NAME, CHROMIUM_OS], VERSION],[

            // Smart TVs
            /panasonic;(viera)/i,                                               // Panasonic Viera
            /(netrange)mmh/i,                                                   // Netrange
            /(nettv)\/(\d+\.[\w\.]+)/i,                                         // NetTV

            // Console
            /(nintendo|playstation) ([wids345portablevuch]+)/i,                 // Nintendo/Playstation
            /(xbox); +xbox ([^\);]+)/i,                                         // Microsoft Xbox (360, One, X, S, Series X, Series S)

            // Other
            /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,                            // Joli/Palm
            /(mint)[\/\(\) ]?(\w*)/i,                                           // Mint
            /(mageia|vectorlinux)[; ]/i,                                        // Mageia/VectorLinux
            /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
                                                                                // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
            /(hurd|linux)(?: arm\w*| x86\w*| ?)([\w\.]*)/i,                     // Hurd/Linux
            /(gnu) ?([\w\.]*)/i,                                                // GNU
            /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, // FreeBSD/NetBSD/OpenBSD/PC-BSD/GhostBSD/DragonFly
            /(haiku) (\w+)/i                                                    // Haiku
            ], [NAME, VERSION], [
            /(sunos) ?([\w\.\d]*)/i                                             // Solaris
            ], [[NAME, 'Solaris'], VERSION], [
            /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,                              // Solaris
            /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,                                  // AIX
            /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, // BeOS/OS2/AmigaOS/MorphOS/OpenVMS/Fuchsia/HP-UX/SerenityOS
            /(unix) ?([\w\.]*)/i                                                // UNIX
            ], [NAME, VERSION]
        ]
    };

    /////////////////
    // Constructor
    ////////////////

    var UAParser = function (ua, extensions) {

        if (typeof ua === OBJ_TYPE) {
            extensions = ua;
            ua = undefined;
        }

        if (!(this instanceof UAParser)) {
            return new UAParser(ua, extensions).getResult();
        }

        var _navigator = (typeof window !== UNDEF_TYPE && window.navigator) ? window.navigator : undefined;
        var _ua = ua || ((_navigator && _navigator.userAgent) ? _navigator.userAgent : EMPTY);
        var _uach = (_navigator && _navigator.userAgentData) ? _navigator.userAgentData : undefined;
        var _rgxmap = extensions ? extend(regexes, extensions) : regexes;
        var _isSelfNav = _navigator && _navigator.userAgent == _ua;

        this.getBrowser = function () {
            var _browser = {};
            _browser[NAME] = undefined;
            _browser[VERSION] = undefined;
            rgxMapper.call(_browser, _ua, _rgxmap.browser);
            _browser[MAJOR] = majorize(_browser[VERSION]);
            // Brave-specific detection
            if (_isSelfNav && _navigator && _navigator.brave && typeof _navigator.brave.isBrave == FUNC_TYPE) {
                _browser[NAME] = 'Brave';
            }
            return _browser;
        };
        this.getCPU = function () {
            var _cpu = {};
            _cpu[ARCHITECTURE] = undefined;
            rgxMapper.call(_cpu, _ua, _rgxmap.cpu);
            return _cpu;
        };
        this.getDevice = function () {
            var _device = {};
            _device[VENDOR] = undefined;
            _device[MODEL] = undefined;
            _device[TYPE] = undefined;
            rgxMapper.call(_device, _ua, _rgxmap.device);
            if (_isSelfNav && !_device[TYPE] && _uach && _uach.mobile) {
                _device[TYPE] = MOBILE;
            }
            // iPadOS-specific detection: identified as Mac, but has some iOS-only properties
            if (_isSelfNav && _device[MODEL] == 'Macintosh' && _navigator && typeof _navigator.standalone !== UNDEF_TYPE && _navigator.maxTouchPoints && _navigator.maxTouchPoints > 2) {
                _device[MODEL] = 'iPad';
                _device[TYPE] = TABLET;
            }
            return _device;
        };
        this.getEngine = function () {
            var _engine = {};
            _engine[NAME] = undefined;
            _engine[VERSION] = undefined;
            rgxMapper.call(_engine, _ua, _rgxmap.engine);
            return _engine;
        };
        this.getOS = function () {
            var _os = {};
            _os[NAME] = undefined;
            _os[VERSION] = undefined;
            rgxMapper.call(_os, _ua, _rgxmap.os);
            if (_isSelfNav && !_os[NAME] && _uach && _uach.platform && _uach.platform != 'Unknown') {
                _os[NAME] = _uach.platform  
                                    .replace(/chrome os/i, CHROMIUM_OS)
                                    .replace(/macos/i, MAC_OS);           // backward compatibility
            }
            return _os;
        };
        this.getResult = function () {
            return {
                ua      : this.getUA(),
                browser : this.getBrowser(),
                engine  : this.getEngine(),
                os      : this.getOS(),
                device  : this.getDevice(),
                cpu     : this.getCPU()
            };
        };
        this.getUA = function () {
            return _ua;
        };
        this.setUA = function (ua) {
            _ua = (typeof ua === STR_TYPE && ua.length > UA_MAX_LENGTH) ? trim(ua, UA_MAX_LENGTH) : ua;
            return this;
        };
        this.setUA(_ua);
        return this;
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER =  enumerize([NAME, VERSION, MAJOR]);
    UAParser.CPU = enumerize([ARCHITECTURE]);
    UAParser.DEVICE = enumerize([MODEL, VENDOR, TYPE, CONSOLE, MOBILE, SMARTTV, TABLET, WEARABLE, EMBEDDED]);
    UAParser.ENGINE = UAParser.OS = enumerize([NAME, VERSION]);

    ///////////
    // Export
    //////////

    // check js environment
    if (typeof(exports) !== UNDEF_TYPE) {
        // nodejs env
        if ("object" !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        // requirejs env (optional)
        if ("function" === FUNC_TYPE && __webpack_require__.amdO) {
            !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
                return UAParser;
            }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        } else if (typeof window !== UNDEF_TYPE) {
            // browser env
            window.UAParser = UAParser;
        }
    }

    // jQuery/Zepto specific (optional)
    // Note:
    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
    //   and we should catch that.
    var $ = typeof window !== UNDEF_TYPE && (window.jQuery || window.Zepto);
    if ($ && !$.ua) {
        var parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function () {
            return parser.getUA();
        };
        $.ua.set = function (ua) {
            parser.setUA(ua);
            var result = parser.getResult();
            for (var prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }

})(typeof window === 'object' ? window : this);


/***/ },

/***/ "../../../node_modules/webextension-polyfill/dist/browser-polyfill.js"
/*!****************************************************************************!*\
  !*** ../../../node_modules/webextension-polyfill/dist/browser-polyfill.js ***!
  \****************************************************************************/
(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else // removed by dead control flow
{ var mod; }
})(this, function (module) {
  /* webextension-polyfill - v0.5.0 - Thu Sep 26 2019 22:22:26 */
  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */
  /* vim: set sts=2 sw=2 et tw=80: */
  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
    const SEND_RESPONSE_DEPRECATION_WARNING = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)";

    // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.
    const wrapAPIs = extensionAPIs => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }

      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */
      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }
      }

      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */
      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };

      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.rejection
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {integer} metadata.maxResolvedArgs
       *        The maximum number of arguments which may be passed to the
       *        callback created by the wrapped async function.
       *
       * @returns {function}
       *        The generated callback function.
       */
      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (extensionAPIs.runtime.lastError) {
            promise.reject(extensionAPIs.runtime.lastError);
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";

      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxResolvedArgs
       *        The maximum number of arguments which may be passed to the
       *        callback created by the wrapped async function.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */
      const wrapAsyncFunction = (name, metadata) => {
        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name](...args, makeCallback({ resolve, reject }, metadata));
              } catch (cbError) {
                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);

                target[name](...args);

                // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.
                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;

                resolve();
              }
            } else if (metadata.noCallback) {
              target[name](...args);
              resolve();
            } else {
              target[name](...args, makeCallback({ resolve, reject }, metadata));
            }
          });
        };
      };

      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */
      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }
        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);

      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */
      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);
        let handlers = {
          has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },

          get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.

              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,
                get() {
                  return target[prop];
                },
                set(value) {
                  target[prop] = value;
                }
              });

              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }
            return true;
          },

          defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }
        };

        // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.
        let proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };

      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */
      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }
      });

      // Keep track if the deprecation warning has been logged at least once.
      let loggedSendResponseDeprecationWarning = false;

      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }

        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */
        return function onMessage(message, sender, sendResponse) {
          let didCallSendResponse = false;

          let wrappedSendResponse;
          let sendResponsePromise = new Promise(resolve => {
            wrappedSendResponse = function (response) {
              if (!loggedSendResponseDeprecationWarning) {
                console.warn(SEND_RESPONSE_DEPRECATION_WARNING, new Error().stack);
                loggedSendResponseDeprecationWarning = true;
              }
              didCallSendResponse = true;
              resolve(response);
            };
          });

          let result;
          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }

          const isResultThenable = result !== true && isThenable(result);

          // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.
          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          }

          // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).
          const sendPromisedResult = promise => {
            promise.then(msg => {
              // send the message value.
              sendResponse(msg);
            }, error => {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              let message;
              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }

              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message
              });
            }).catch(err => {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          };

          // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.
          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          }

          // Let Chrome know that the listener is replying.
          return true;
        };
      });

      const wrappedSendMessageCallback = ({ reject, resolve }, reply) => {
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(extensionAPIs.runtime.lastError);
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };

      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          const wrappedCb = wrappedSendMessageCallback.bind(null, { resolve, reject });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage(...args);
        });
      };

      const staticWrappers = {
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", { minArgs: 1, maxArgs: 3 })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", { minArgs: 2, maxArgs: 3 })
        }
      };
      const settingMetadata = {
        clear: { minArgs: 1, maxArgs: 1 },
        get: { minArgs: 1, maxArgs: 1 },
        set: { minArgs: 1, maxArgs: 1 }
      };
      apiMetadata.privacy = {
        network: {
          networkPredictionEnabled: settingMetadata,
          webRTCIPHandlingPolicy: settingMetadata
        },
        services: {
          passwordSavingEnabled: settingMetadata
        },
        websites: {
          hyperlinkAuditingEnabled: settingMetadata,
          referrersEnabled: settingMetadata
        }
      };

      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    };

    if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
      throw new Error("This script should only be loaded in a browser extension.");
    }

    // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.
    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = browser;
  }
});
//# sourceMappingURL=browser-polyfill.js.map


/***/ },

/***/ "../../../node_modules/compute-scroll-into-view/dist/index.mjs"
/*!*********************************************************************!*\
  !*** ../../../node_modules/compute-scroll-into-view/dist/index.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ i)
/* harmony export */ });
function t(t){return"object"==typeof t&&null!=t&&1===t.nodeType}function e(t,e){return(!e||"hidden"!==t)&&"visible"!==t&&"clip"!==t}function n(t,n){if(t.clientHeight<t.scrollHeight||t.clientWidth<t.scrollWidth){var r=getComputedStyle(t,null);return e(r.overflowY,n)||e(r.overflowX,n)||function(t){var e=function(t){if(!t.ownerDocument||!t.ownerDocument.defaultView)return null;try{return t.ownerDocument.defaultView.frameElement}catch(t){return null}}(t);return!!e&&(e.clientHeight<t.scrollHeight||e.clientWidth<t.scrollWidth)}(t)}return!1}function r(t,e,n,r,i,o,l,d){return o<t&&l>e||o>t&&l<e?0:o<=t&&d<=n||l>=e&&d>=n?o-t-r:l>e&&d<n||o<t&&d>n?l-e+i:0}var i=function(e,i){var o=window,l=i.scrollMode,d=i.block,f=i.inline,h=i.boundary,u=i.skipOverflowHiddenElements,s="function"==typeof h?h:function(t){return t!==h};if(!t(e))throw new TypeError("Invalid target");for(var a,c,g=document.scrollingElement||document.documentElement,p=[],m=e;t(m)&&s(m);){if((m=null==(c=(a=m).parentElement)?a.getRootNode().host||null:c)===g){p.push(m);break}null!=m&&m===document.body&&n(m)&&!n(document.documentElement)||null!=m&&n(m,u)&&p.push(m)}for(var w=o.visualViewport?o.visualViewport.width:innerWidth,v=o.visualViewport?o.visualViewport.height:innerHeight,W=window.scrollX||pageXOffset,H=window.scrollY||pageYOffset,b=e.getBoundingClientRect(),y=b.height,E=b.width,M=b.top,V=b.right,x=b.bottom,I=b.left,C="start"===d||"nearest"===d?M:"end"===d?x:M+y/2,R="center"===f?I+E/2:"end"===f?V:I,T=[],k=0;k<p.length;k++){var B=p[k],D=B.getBoundingClientRect(),O=D.height,X=D.width,Y=D.top,L=D.right,S=D.bottom,j=D.left;if("if-needed"===l&&M>=0&&I>=0&&x<=v&&V<=w&&M>=Y&&x<=S&&I>=j&&V<=L)return T;var N=getComputedStyle(B),q=parseInt(N.borderLeftWidth,10),z=parseInt(N.borderTopWidth,10),A=parseInt(N.borderRightWidth,10),F=parseInt(N.borderBottomWidth,10),G=0,J=0,K="offsetWidth"in B?B.offsetWidth-B.clientWidth-q-A:0,P="offsetHeight"in B?B.offsetHeight-B.clientHeight-z-F:0,Q="offsetWidth"in B?0===B.offsetWidth?0:X/B.offsetWidth:0,U="offsetHeight"in B?0===B.offsetHeight?0:O/B.offsetHeight:0;if(g===B)G="start"===d?C:"end"===d?C-v:"nearest"===d?r(H,H+v,v,z,F,H+C,H+C+y,y):C-v/2,J="start"===f?R:"center"===f?R-w/2:"end"===f?R-w:r(W,W+w,w,q,A,W+R,W+R+E,E),G=Math.max(0,G+H),J=Math.max(0,J+W);else{G="start"===d?C-Y-z:"end"===d?C-S+F+P:"nearest"===d?r(Y,S,O,z,F+P,C,C+y,y):C-(Y+O/2)+P/2,J="start"===f?R-j-q:"center"===f?R-(j+X/2)+K/2:"end"===f?R-L+A+K:r(j,L,X,q,A+K,R,R+E,E);var Z=B.scrollLeft,$=B.scrollTop;C+=$-(G=Math.max(0,Math.min($+G/U,B.scrollHeight-O/U+P))),R+=Z-(J=Math.max(0,Math.min(Z+J/Q,B.scrollWidth-X/Q+K)))}T.push({el:B,top:G,left:J})}return T};
//# sourceMappingURL=index.mjs.map


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd options */
/******/ 	(() => {
/******/ 		__webpack_require__.amdO = {};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!**************************!*\
  !*** ./content/index.js ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _find_select__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./find-select */ "./content/find-select.js");
/* harmony import */ var _recorder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./recorder */ "./content/recorder.js");
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
new _recorder__WEBPACK_IMPORTED_MODULE_1__["default"](window);
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=record.js.map