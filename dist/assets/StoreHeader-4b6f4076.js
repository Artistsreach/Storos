import{ai as L,am as e,ao as G,ap as E,bi as S,au as p,bl as P,bU as J,aW as W,aj as x,av as X,aq as F,at as Z,aA as V,b7 as K,bI as ee,bJ as ae,bV as te,bj as re,ar as se,bA as ie,bB as le}from"./index-4b0969f0.js";import{M as ne}from"./minus-f3893dc7.js";const oe=({isOpen:a,onClose:i})=>{const{cart:l,removeFromCart:f,updateCartQuantity:h}=L(),m=l.reduce((s,c)=>s+c.price*c.quantity,0),w={hidden:{x:"100%"},visible:{x:0,transition:{duration:.5,ease:"easeInOut"}},exit:{x:"100%",transition:{duration:.5,ease:"easeInOut"}}};return e.jsx(G,{children:a&&e.jsxs(E.div,{className:"fixed inset-0 z-50 flex justify-end",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},children:[e.jsx("div",{className:"fixed inset-0 bg-black/60",onClick:i}),e.jsxs(E.div,{variants:w,initial:"hidden",animate:"visible",exit:"exit",className:"relative z-10 w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col",children:[e.jsxs("div",{className:"flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700",children:[e.jsxs("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3",children:[e.jsx(S,{className:"w-7 h-7"}),"Your Cart"]}),e.jsx(p,{variant:"ghost",size:"icon",onClick:i,children:e.jsx(P,{className:"w-6 h-6"})})]}),l.length===0?e.jsxs("div",{className:"flex-grow flex flex-col items-center justify-center text-center p-6",children:[e.jsx(S,{className:"w-24 h-24 text-gray-300 dark:text-gray-600 mb-6"}),e.jsx("h3",{className:"text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2",children:"Your cart is empty"}),e.jsx("p",{className:"text-gray-500 dark:text-gray-400",children:"Looks like you haven't added anything to your cart yet."})]}):e.jsx("div",{className:"flex-grow overflow-y-auto p-6 space-y-6",children:l.map(s=>{var c,u,g,b;return e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("img",{src:((u=(c=s.image)==null?void 0:c.src)==null?void 0:u.medium)||((b=(g=s.image)==null?void 0:g.src)==null?void 0:b.large)||"",alt:s.name,className:"w-24 h-24 rounded-lg object-cover"}),e.jsxs("div",{className:"flex-grow",children:[e.jsx("h4",{className:"font-semibold text-gray-800 dark:text-gray-200",children:s.name}),e.jsxs("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:["$",s.price.toFixed(2)]}),e.jsxs("div",{className:"flex items-center gap-3 mt-2",children:[e.jsx(p,{size:"icon",variant:"outline",onClick:()=>h(s.id,s.quantity-1),children:e.jsx(ne,{className:"w-4 h-4"})}),e.jsx("span",{className:"font-bold text-lg",children:s.quantity}),e.jsx(p,{size:"icon",variant:"outline",onClick:()=>h(s.id,s.quantity+1),children:e.jsx(J,{className:"w-4 h-4"})})]})]}),e.jsx(p,{variant:"ghost",size:"icon",onClick:()=>f(s.id),children:e.jsx(W,{className:"w-5 h-5 text-red-500"})})]},s.id)})}),l.length>0&&e.jsxs("div",{className:"p-6 border-t border-gray-200 dark:border-gray-700",children:[e.jsxs("div",{className:"flex justify-between items-center mb-4",children:[e.jsx("span",{className:"text-lg font-medium text-gray-600 dark:text-gray-300",children:"Subtotal"}),e.jsxs("span",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:["$",m.toFixed(2)]})]}),e.jsx(p,{className:"w-full text-lg py-3",children:"Proceed to Checkout"})]})]})]})})},t={header:({children:a,...i})=>e.jsx("header",{...i,children:a}),div:({children:a,...i})=>e.jsx("div",{...i,children:a}),button:({children:a,...i})=>e.jsx("button",{...i,children:a}),img:a=>e.jsx("img",{...a}),span:({children:a,...i})=>e.jsx("span",{...i,children:a})},N=({children:a})=>e.jsx(e.Fragment,{children:a}),ce=()=>({scrollY:{get:()=>0,set:()=>{}}}),q=(a,i,l)=>({get:()=>l[0],set:()=>{}}),he=({store:a,isPublishedView:i=!1})=>{var z;const{cart:l,updateStoreTextContent:f}=L(),[h,m]=x.useState(!1),[w,s]=x.useState(!1),[c,u]=x.useState(!1),[g,b]=x.useState(""),[Y,A]=x.useState(!1),{scrollY:T}=ce(),H=q(T,[0,100],[.8,.95]),D=q(T,[0,100],[8,20]),j=(a==null?void 0:a.name)||"Modern Store",U=(a==null?void 0:a.id)||"modern-store",o=((z=a==null?void 0:a.theme)==null?void 0:z.primaryColor)||"#6366F1",v=(a==null?void 0:a.logo_url_light)||null,k=(a==null?void 0:a.logo_url_dark)||null,[d,C]=x.useState(!1),_=()=>{const r=d?"light":"dark";C(!d),localStorage.setItem("theme",r),r==="dark"?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")},I=(l==null?void 0:l.reduce((r,n)=>r+n.quantity,0))||0,$=[{label:"Home",href:"#hero",icon:F},{label:"Products",href:"#products",icon:se},{label:"Collections",href:"#collections",icon:ie},{label:"About",href:"#about",icon:le}];x.useEffect(()=>{const r=()=>{A(window.scrollY>50)};window.addEventListener("scroll",r);const n=localStorage.getItem("theme"),y=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;return C(!!(n==="dark"||!n&&y)),()=>window.removeEventListener("scroll",r)},[]);const M=r=>{const n=document.querySelector(r);n&&n.scrollIntoView({behavior:"smooth",block:"start"}),m(!1)},B={hidden:{y:-100,opacity:0},visible:{y:0,opacity:1,transition:{duration:.6,ease:[.25,.46,.45,.94]}}},Q={hidden:{opacity:0,scale:.95,y:-20},visible:{opacity:1,scale:1,y:0,transition:{duration:.3,ease:"easeOut",staggerChildren:.1}},exit:{opacity:0,scale:.95,y:-20,transition:{duration:.2}}},O={hidden:{opacity:0,x:-20},visible:{opacity:1,x:0,transition:{duration:.3}}},R={hidden:{width:0,opacity:0},visible:{width:"auto",opacity:1,transition:{duration:.4,ease:"easeOut"}}};return e.jsxs(e.Fragment,{children:[e.jsx(t.header,{variants:B,initial:"hidden",animate:"visible",className:`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${Y?"py-2 shadow-2xl border-b border-white/10":"py-4 shadow-lg"} modern-header`,style:{backgroundColor:d?`rgba(17, 24, 39, ${H.get()})`:`rgba(255, 255, 255, ${H.get()})`,backdropFilter:`blur(${D.get()}px)`},children:e.jsx("div",{className:"container mx-auto px-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(t.div,{className:"flex items-center gap-4",whileHover:{scale:1.05},transition:{duration:.2},children:e.jsxs(X,{to:`/store/${U}`,className:"flex items-center gap-3",children:[(d?v:k)?e.jsx(t.img,{src:d?v:k,alt:j,className:"h-10 w-auto object-contain",whileHover:{rotate:5},transition:{duration:.3}}):v||k?e.jsx(t.img,{src:v||k,alt:j,className:"h-10 w-auto object-contain",whileHover:{rotate:5},transition:{duration:.3}}):e.jsx(t.div,{className:"w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg",style:{background:`linear-gradient(135deg, ${o}, ${o}80)`},whileHover:{rotate:10,scale:1.1},transition:{duration:.3},children:e.jsx(F,{className:"w-6 h-6 text-white"})}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx(Z,{initialText:j,onSave:f,identifier:"name",as:"h1",className:"text-xl font-bold text-gray-900 dark:text-white tracking-tight",children:j}),e.jsxs(t.div,{className:"flex items-center gap-1 text-xs text-muted-foreground",initial:{opacity:0},animate:{opacity:1},transition:{delay:.5},children:[e.jsx("div",{className:"w-2 h-2 rounded-full bg-green-500 animate-pulse",style:{backgroundColor:o}}),e.jsx("span",{className:"font-medium",children:"Premium Store"})]})]})]})}),e.jsx("nav",{className:"hidden lg:flex items-center gap-8",children:$.map((r,n)=>{const y=r.icon;return e.jsxs(t.button,{onClick:()=>M(r.href),className:"group flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 relative overflow-hidden",whileHover:{scale:1.05,y:-2},whileTap:{scale:.95},initial:{opacity:0,y:-20},animate:{opacity:1,y:0},transition:{delay:n*.1+.3},children:[e.jsx(t.div,{className:"absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",style:{background:`linear-gradient(90deg, ${o}20, ${o}10)`}}),e.jsx(y,{className:"w-4 h-4 relative z-10"}),e.jsx("span",{className:"font-medium relative z-10 tracking-wide",children:r.label}),e.jsx(t.div,{className:"absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300",style:{backgroundColor:o}})]},r.label)})}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx(N,{children:w&&e.jsx(t.div,{variants:R,initial:"hidden",animate:"visible",exit:"hidden",className:"mr-2",children:e.jsx("input",{type:"text",placeholder:"Search products...",value:g,onChange:r=>b(r.target.value),className:"px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-64",autoFocus:!0})})}),e.jsx(t.button,{onClick:()=>s(!w),className:"w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass",whileHover:{scale:1.1,rotate:5},whileTap:{scale:.9},children:e.jsx(V,{className:"w-5 h-5"})})]}),e.jsxs(t.button,{className:"w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass relative",whileHover:{scale:1.1,rotate:-5},whileTap:{scale:.9},children:[e.jsx(K,{className:"w-5 h-5"}),e.jsx(t.div,{className:"absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold",initial:{scale:0},animate:{scale:1},transition:{delay:.8},children:"0"})]}),e.jsx(t.button,{onClick:_,className:"w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass",whileHover:{scale:1.1,rotate:d?360:-360},whileTap:{scale:.9},children:e.jsx(N,{mode:"wait",children:d?e.jsx(t.div,{initial:{y:-20,opacity:0},animate:{y:0,opacity:1},exit:{y:20,opacity:0},transition:{duration:.2},children:e.jsx(ee,{className:"w-5 h-5"})},"moon"):e.jsx(t.div,{initial:{y:20,opacity:0},animate:{y:0,opacity:1},exit:{y:-20,opacity:0},transition:{duration:.2},children:e.jsx(ae,{className:"w-5 h-5"})},"sun")})}),e.jsxs(t.button,{onClick:()=>u(!0),className:"w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass relative",whileHover:{scale:1.1,rotate:5},whileTap:{scale:.9},children:[e.jsx(S,{className:"w-5 h-5"}),I>0&&e.jsx(t.div,{className:"absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg",style:{backgroundColor:o},initial:{scale:0},animate:{scale:1},whileHover:{scale:1.2},children:I})]}),e.jsx(t.button,{className:"w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass",whileHover:{scale:1.1,rotate:-5},whileTap:{scale:.9},children:e.jsx(te,{className:"w-5 h-5"})}),e.jsx(t.button,{onClick:()=>m(!h),className:"lg:hidden w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-all duration-300 shadow-glass",whileHover:{scale:1.1},whileTap:{scale:.9},children:e.jsx(N,{mode:"wait",children:h?e.jsx(t.div,{initial:{rotate:-90,opacity:0},animate:{rotate:0,opacity:1},exit:{rotate:90,opacity:0},transition:{duration:.2},children:e.jsx(P,{className:"w-5 h-5"})},"close"):e.jsx(t.div,{initial:{rotate:90,opacity:0},animate:{rotate:0,opacity:1},exit:{rotate:-90,opacity:0},transition:{duration:.2},children:e.jsx(re,{className:"w-5 h-5"})},"menu")})})]})]})})}),e.jsx(N,{children:h&&e.jsxs(t.div,{className:"fixed inset-0 z-40 lg:hidden",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},children:[e.jsx(t.div,{className:"absolute inset-0 bg-black/50 backdrop-blur-sm",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:()=>m(!1)}),e.jsxs(t.div,{variants:Q,initial:"hidden",animate:"visible",exit:"exit",className:"absolute top-20 left-6 right-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-6",children:[e.jsx("nav",{className:"space-y-4",children:$.map((r,n)=>{const y=r.icon;return e.jsxs(t.button,{variants:O,onClick:()=>M(r.href),className:"w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-all duration-300 group",whileHover:{scale:1.02,x:5},whileTap:{scale:.98},children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300",style:{background:`linear-gradient(135deg, ${o}30, ${o}10)`},children:e.jsx(y,{className:"w-5 h-5"})}),e.jsx("span",{className:"font-medium text-lg tracking-wide",children:r.label})]},r.label)})}),e.jsx(t.div,{variants:O,className:"mt-6 pt-6 border-t border-gray-200 dark:border-gray-700",children:e.jsxs("div",{className:"relative",children:[e.jsx(V,{className:"absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"}),e.jsx("input",{type:"text",placeholder:"Search products...",value:g,onChange:r=>b(r.target.value),className:"w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/50"})]})})]})]})}),e.jsx("div",{className:"h-20"}),e.jsx(oe,{isOpen:c,onClose:()=>u(!1)})]})};export{he as default};
