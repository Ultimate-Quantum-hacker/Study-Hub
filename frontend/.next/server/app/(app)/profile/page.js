(()=>{var e={};e.id=915,e.ids=[915],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9491:e=>{"use strict";e.exports=require("assert")},4300:e=>{"use strict";e.exports=require("buffer")},2081:e=>{"use strict";e.exports=require("child_process")},6113:e=>{"use strict";e.exports=require("crypto")},2361:e=>{"use strict";e.exports=require("events")},7147:e=>{"use strict";e.exports=require("fs")},3685:e=>{"use strict";e.exports=require("http")},5158:e=>{"use strict";e.exports=require("http2")},5687:e=>{"use strict";e.exports=require("https")},1808:e=>{"use strict";e.exports=require("net")},2037:e=>{"use strict";e.exports=require("os")},1017:e=>{"use strict";e.exports=require("path")},2781:e=>{"use strict";e.exports=require("stream")},4404:e=>{"use strict";e.exports=require("tls")},6224:e=>{"use strict";e.exports=require("tty")},7310:e=>{"use strict";e.exports=require("url")},3837:e=>{"use strict";e.exports=require("util")},9796:e=>{"use strict";e.exports=require("zlib")},1465:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>l.a,__next_app__:()=>u,originalPathname:()=>c,pages:()=>p,routeModule:()=>y,tree:()=>d}),s(7132),s(9506),s(5866),s(8380);var r=s(3191),a=s(8716),i=s(7922),l=s.n(i),n=s(5231),o={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>n[e]);s.d(t,o);let d=["",{children:["(app)",{children:["profile",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,7132)),"c:\\Users\\SAGE\\OneDrive\\Desktop\\codes\\StudyHub\\frontend\\app\\(app)\\profile\\page.js"]}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,9506)),"c:\\Users\\SAGE\\OneDrive\\Desktop\\codes\\StudyHub\\frontend\\app\\(app)\\layout.js"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,5866,23)),"next/dist/client/components/not-found-error"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,8380)),"c:\\Users\\SAGE\\OneDrive\\Desktop\\codes\\StudyHub\\frontend\\app\\layout.js"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,5866,23)),"next/dist/client/components/not-found-error"]}],p=["c:\\Users\\SAGE\\OneDrive\\Desktop\\codes\\StudyHub\\frontend\\app\\(app)\\profile\\page.js"],c="/(app)/profile/page",u={require:s,loadChunk:()=>Promise.resolve()},y=new r.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/(app)/profile/page",pathname:"/profile",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},8092:(e,t,s)=>{Promise.resolve().then(s.bind(s,8833))},8833:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>y});var r=s(326),a=s(7577),i=s(4040),l=s(9420),n=s(381),o=s(1896),d=s(5932),p=s(165),c=s(9635),u=s(1215);function y(){let{user:e,updateUser:t}=(0,i.tN)(),[s,y]=(0,a.useState)({username:e?.username||"",bio:e?.bio||""}),[h,x]=(0,a.useState)(null),[m,v]=(0,a.useState)(null),[f,g]=(0,a.useState)(!1),k=e=>{let t=e.target.files[0];t&&(v(t),x(URL.createObjectURL(t)))},b=async e=>{e.preventDefault(),g(!0);try{let e=new FormData;e.append("username",s.username),e.append("bio",s.bio),m&&e.append("avatar",m);let r=await l.h3.updateProfile(e);t(r.data.user),n.ZP.success("Profile updated successfully")}catch{n.ZP.error("Failed to update profile")}finally{g(!1)}},j=h||(e?.avatar?`http://localhost:5000${e.avatar}`:null);return(0,r.jsxs)("div",{className:"fifa-entrance",style:{padding:28,maxWidth:600,margin:"0 auto",overflowY:"auto",height:"100%"},children:[(0,r.jsxs)("div",{style:{marginBottom:28},children:[r.jsx("h1",{style:{fontSize:22,fontWeight:800,letterSpacing:-.5},children:"Profile Settings"}),r.jsx("p",{style:{color:"var(--text-muted)",fontSize:13,marginTop:4},children:"Manage your account details and appearance"})]}),r.jsx("div",{className:"card",children:(0,r.jsxs)("form",{onSubmit:b,style:{display:"flex",flexDirection:"column",gap:24},children:[(0,r.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:24},children:[(0,r.jsxs)("div",{className:"avatar avatar-xl",style:{position:"relative",overflow:"hidden"},children:[j?r.jsx("img",{src:j,className:"w-full h-full",style:{objectFit:"cover"}}):e?.username?.[0]?.toUpperCase(),(0,r.jsxs)("label",{style:{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",opacity:0,transition:"opacity 0.2s",color:"white"},onMouseEnter:e=>e.currentTarget.style.opacity=1,onMouseLeave:e=>e.currentTarget.style.opacity=0,children:[r.jsx(o.Z,{size:24}),r.jsx("input",{type:"file",style:{display:"none"},accept:"image/*",onChange:k})]})]}),(0,r.jsxs)("div",{children:[r.jsx("h3",{style:{fontSize:16,fontWeight:600},children:"Profile Picture"}),r.jsx("p",{style:{fontSize:12,color:"var(--text-muted)",marginTop:4},children:"JPG, GIF or PNG. 1MB max."}),(0,r.jsxs)("label",{className:"btn btn-secondary btn-sm",style:{marginTop:10,display:"inline-flex"},children:["Change Avatar ",r.jsx("input",{type:"file",style:{display:"none"},accept:"image/*",onChange:k})]})]})]}),r.jsx("div",{style:{height:1,background:"var(--border)"}}),(0,r.jsxs)("div",{className:"form-group",children:[r.jsx("label",{className:"form-label",children:"Email Address"}),(0,r.jsxs)("div",{style:{position:"relative"},children:[r.jsx(d.Z,{size:15,style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}),r.jsx("input",{className:"form-input",style:{paddingLeft:36,opacity:.6,cursor:"not-allowed"},value:e?.email||"",readOnly:!0,disabled:!0,title:"Email cannot be changed"})]})]}),(0,r.jsxs)("div",{className:"form-group",children:[r.jsx("label",{className:"form-label",children:"Role"}),(0,r.jsxs)("div",{style:{position:"relative"},children:[r.jsx(p.Z,{size:15,style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}),r.jsx("input",{className:"form-input",style:{paddingLeft:36,opacity:.6,cursor:"not-allowed",textTransform:"capitalize"},value:e?.role||"",readOnly:!0,disabled:!0})]})]}),(0,r.jsxs)("div",{className:"form-group",children:[r.jsx("label",{className:"form-label",children:"Username"}),(0,r.jsxs)("div",{style:{position:"relative"},children:[r.jsx(c.Z,{size:15,style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}),r.jsx("input",{className:"form-input",style:{paddingLeft:36},value:s.username,onChange:e=>y({...s,username:e.target.value}),required:!0,minLength:3,maxLength:30})]})]}),(0,r.jsxs)("div",{className:"form-group",children:[r.jsx("label",{className:"form-label",children:"Bio"}),r.jsx("textarea",{className:"form-input",rows:4,placeholder:"Tell us a little bit about yourself",value:s.bio,onChange:e=>y({...s,bio:e.target.value}),maxLength:200})]}),r.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginTop:10},children:r.jsx("button",{type:"submit",className:"btn btn-primary",disabled:f,children:f?r.jsx("span",{className:"spinner"}):(0,r.jsxs)(r.Fragment,{children:[r.jsx(u.Z,{size:16})," Save Changes"]})})})]})})]})}},6343:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("BookOpen",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]])},732:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Bot",[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]])},1896:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]])},8393:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},6633:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]])},9423:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Hash",[["line",{x1:"4",x2:"20",y1:"9",y2:"9",key:"4lhtct"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15",key:"vyu0kd"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21",key:"1ggp8o"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21",key:"weycgp"}]])},1810:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]])},5932:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]])},2607:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]])},2887:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Phone",[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]])},3855:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},1405:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]])},1215:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]])},8378:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},165:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},850:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]])},949:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]])},9635:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},4061:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},4019:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(2881).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},7132:(e,t,s)=>{"use strict";s.r(t),s.d(t,{$$typeof:()=>l,__esModule:()=>i,default:()=>n});var r=s(8570);let a=(0,r.createProxy)(String.raw`c:\Users\SAGE\OneDrive\Desktop\codes\StudyHub\frontend\app\(app)\profile\page.js`),{__esModule:i,$$typeof:l}=a;a.default;let n=(0,r.createProxy)(String.raw`c:\Users\SAGE\OneDrive\Desktop\codes\StudyHub\frontend\app\(app)\profile\page.js#default`)}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[971,593,439,705,926,590],()=>s(1465));module.exports=r})();