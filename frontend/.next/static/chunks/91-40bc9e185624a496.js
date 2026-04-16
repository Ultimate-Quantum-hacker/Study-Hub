"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[91],{933:function(t,e,n){n.d(e,{Z:function(){return r}});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(8030).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},4436:function(t,e,n){n.d(e,{Z:function(){return r}});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(8030).Z)("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]])},2873:function(t,e,n){n.d(e,{Z:function(){return r}});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(8030).Z)("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]])},7390:function(t,e,n){n.d(e,{Z:function(){return r}});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(8030).Z)("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]])},4817:function(t,e,n){n.d(e,{Z:function(){return r}});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(8030).Z)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]])},1240:function(t,e,n){n.d(e,{Z:function(){return r}});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(8030).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},6563:function(t,e,n){n.d(e,{Q:function(){return c}});var r=n(1880),a=n(4546);function u(t,e){let n=(0,a.Q)(t),r=(0,a.Q)(e),u=n.getTime()-r.getTime();return u<0?-1:u>0?1:u}var i=n(7283),o=n(3028),l=n(603),s=n(6634);function c(t,e){return function(t,e,n){var r,c,f,d,h,y;let M,m,D;let k=(0,l.j)(),g=null!==(c=null!==(r=null==n?void 0:n.locale)&&void 0!==r?r:k.locale)&&void 0!==c?c:o._,v=u(t,e);if(isNaN(v))throw RangeError("Invalid time value");let x=Object.assign({},n,{addSuffix:null==n?void 0:n.addSuffix,comparison:v});v>0?(M=(0,a.Q)(e),m=(0,a.Q)(t)):(M=(0,a.Q)(t),m=(0,a.Q)(e));let Q=(f=m,d=M,(y=null==void 0?void 0:(void 0).roundingMethod,t=>{let e=(y?Math[y]:Math.trunc)(t);return 0===e?0:e})((+(0,a.Q)(f)-+(0,a.Q)(d))/1e3)),p=Math.round((Q-((0,s.D)(m)-(0,s.D)(M))/1e3)/60);if(p<2){if(null==n?void 0:n.includeSeconds){if(Q<5)return g.formatDistance("lessThanXSeconds",5,x);if(Q<10)return g.formatDistance("lessThanXSeconds",10,x);if(Q<20)return g.formatDistance("lessThanXSeconds",20,x);if(Q<40)return g.formatDistance("halfAMinute",0,x);else if(Q<60)return g.formatDistance("lessThanXMinutes",1,x);else return g.formatDistance("xMinutes",1,x)}return 0===p?g.formatDistance("lessThanXMinutes",1,x):g.formatDistance("xMinutes",p,x)}if(p<45)return g.formatDistance("xMinutes",p,x);if(p<90)return g.formatDistance("aboutXHours",1,x);if(p<i.H_)return g.formatDistance("aboutXHours",Math.round(p/60),x);if(p<2520)return g.formatDistance("xDays",1,x);if(p<i.fH){let t=Math.round(p/i.H_);return g.formatDistance("xDays",t,x)}if(p<2*i.fH)return D=Math.round(p/i.fH),g.formatDistance("aboutXMonths",D,x);if((D=function(t,e){let n;let r=(0,a.Q)(t),i=(0,a.Q)(e),o=u(r,i),l=Math.abs(function(t,e){let n=(0,a.Q)(t),r=(0,a.Q)(e);return 12*(n.getFullYear()-r.getFullYear())+(n.getMonth()-r.getMonth())}(r,i));if(l<1)n=0;else{1===r.getMonth()&&r.getDate()>27&&r.setDate(30),r.setMonth(r.getMonth()-o*l);let e=u(r,i)===-o;(function(t){let e=(0,a.Q)(t);return+function(t){let e=(0,a.Q)(t);return e.setHours(23,59,59,999),e}(e)==+function(t){let e=(0,a.Q)(t),n=e.getMonth();return e.setFullYear(e.getFullYear(),n+1,0),e.setHours(23,59,59,999),e}(e)})((0,a.Q)(t))&&1===l&&1===u(t,i)&&(e=!1),n=o*(l-Number(e))}return 0===n?0:n}(m,M))<12){let t=Math.round(p/i.fH);return g.formatDistance("xMonths",t,x)}{let t=D%12,e=Math.trunc(D/12);return t<3?g.formatDistance("aboutXYears",e,x):t<9?g.formatDistance("overXYears",e,x):g.formatDistance("almostXYears",e+1,x)}}(t,(0,r.L)(t,Date.now()),e)}}}]);