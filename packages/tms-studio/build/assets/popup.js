/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
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

/***/ "./popup/index.js"
/*!************************!*\
  !*** ./popup/index.js ***!
  \************************/
() {

eval("{const api=typeof browser!=='undefined'?browser:chrome;const statusEl=document.getElementById('status');const stepsEl=document.getElementById('steps');const startBtn=document.getElementById('start');const stopBtn=document.getElementById('stop');const clearBtn=document.getElementById('clear');const renderSteps=steps=>{if(!steps||steps.length===0){stepsEl.innerHTML='<div class=\"empty\">No recorded steps yet.</div>';return;}stepsEl.innerHTML=steps.map((s,i)=>{const target=Array.isArray(s.target)?s.target.map(t=>t[0]).join(' | '):s.target;const value=s.value?` = ${s.value}`:'';return`<div class=\"step\">${i+1}. ${s.command} ${target||''}${value}</div>`;}).join('');};const refresh=async()=>{const status=await api.runtime.sendMessage({tmrRecorder:'status'});const steps=await api.runtime.sendMessage({tmrRecorder:'steps'});statusEl.textContent=status.isRecording?'Recording':'Idle';startBtn.disabled=status.isRecording;stopBtn.disabled=!status.isRecording;renderSteps(steps.steps);};startBtn.addEventListener('click',async()=>{await api.runtime.sendMessage({tmrRecorder:'start'});await refresh();});stopBtn.addEventListener('click',async()=>{await api.runtime.sendMessage({tmrRecorder:'stop'});await refresh();});clearBtn.addEventListener('click',async()=>{await api.runtime.sendMessage({tmrRecorder:'clear'});await refresh();});refresh();\n\n//# sourceURL=webpack:///./popup/index.js?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./popup/index.js"]();
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});