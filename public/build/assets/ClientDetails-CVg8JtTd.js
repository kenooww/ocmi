import{r as n,j as e,L as a}from"./app-CNDl1KRN.js";import{A as c}from"./AdminTabs-Di0HakT8.js";import d from"./Profile-Dcrlmt4I.js";import{A as m}from"./arrow-left-C6p7OCdu.js";import{P as i}from"./printer-DoA40JJ4.js";import{X as p}from"./x-kAL5UHVC.js";import{F as x}from"./file-text-DVujbfBJ.js";import"./settings-Bja7bfmJ.js";import"./createLucideIcon-8e2UGrfz.js";import"./user-round-DfcQ7sJw.js";import"./ship-Cw83kuDD.js";import"./anchor-BbJhiRjF.js";import"./mail-BUXGlfS2.js";import"./phone-Ci_Hl71Q.js";import"./download-CuqGfDrj.js";import"./upload-37AhjIri.js";import"./trash-2-CemgrIYo.js";const f=[{key:"complete",title:"Complete Alpha Omega Application Form",description:"Personal data, documents, certificates, sea service, and deck officer experience."},{key:"zmi",title:"ZMI Application Form",description:"ZMI applicant details, certificates, offshore training, references, sea service, and deck experience."},{key:"flex_fleet",title:"Flex Fleet Application Form",description:"Flex Fleet personal particulars, documents, certificate courses, and sea service."},{key:"dynamic",title:"Dynamic Application Form",description:"Dynamic personal particulars, documents, certificate courses, and sea service."}];function b(t){return[t?.first_name,t?.middle_name,t?.last_name].filter(Boolean).join(" ")||t?.name||"Seafarer"}function E({client:t}){const l=b(t),[o,s]=n.useState(!1);return e.jsxs(c,{activeTab:"clients",title:"Seafarer Details",children:[e.jsx("style",{children:`
                .print-form-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #94a3b8 #f1f5f9;
                }

                .print-form-scroll::-webkit-scrollbar {
                    width: 10px;
                }

                .print-form-scroll::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 999px;
                }

                .print-form-scroll::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #94a3b8, #64748b);
                    border: 2px solid #f1f5f9;
                    border-radius: 999px;
                }

                .print-form-scroll::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #64748b, #475569);
                }
            `}),e.jsxs("div",{className:"mx-auto max-w-6xl",children:[e.jsx("div",{className:"mb-5",children:e.jsxs(a,{href:route("admin.seafarers.index"),className:"inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900",children:[e.jsx(m,{size:16}),"Back to Seafarers"]})}),e.jsx(d,{client:t,updateRouteName:"admin.seafarers.update",updateRouteParams:t.id,methodOverride:"PUT",headerActions:e.jsxs("button",{type:"button",onClick:()=>s(!0),className:"inline-flex items-center justify-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50",children:[e.jsx(i,{size:16}),"Print Forms"]})})]}),o&&e.jsx("div",{className:"fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4",children:e.jsxs("div",{className:"flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded bg-white shadow-xl",children:[e.jsxs("div",{className:"flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-slate-900",children:"Print Forms"}),e.jsx("p",{className:"mt-1 text-sm text-slate-500",children:l})]}),e.jsx("button",{type:"button",onClick:()=>s(!1),className:"text-slate-400 hover:text-slate-600","aria-label":"Close print forms",children:e.jsx(p,{size:20})})]}),e.jsx("div",{className:"print-form-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5",children:f.map(r=>e.jsxs(a,{href:route("admin.seafarers.print-preview",t.id)+`?form=${r.key}`,className:"flex items-start gap-3 rounded border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50",children:[e.jsx("span",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#E1EBE6] text-[#1F6F5C]",children:e.jsx(x,{size:18})}),e.jsxs("span",{className:"min-w-0 flex-1",children:[e.jsx("span",{className:"block text-sm font-semibold text-slate-900",children:r.title}),e.jsx("span",{className:"mt-1 block text-sm leading-5 text-slate-500",children:r.description})]}),e.jsx(i,{className:"mt-1 shrink-0 text-slate-400",size:17})]},r.key))}),e.jsx("div",{className:"flex shrink-0 justify-end border-t border-slate-200 px-6 py-4",children:e.jsx("button",{type:"button",onClick:()=>s(!1),className:"rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",children:"Cancel"})})]})})]})}export{E as default};
