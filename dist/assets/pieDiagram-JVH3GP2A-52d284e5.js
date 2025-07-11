import{p as B}from"./chunk-44GW5IO5-d60e20f9.js";import{C as U,n as H,o as K,s as V,g as Z,c as j,b as q,_ as i,l as C,t as J,d as Q,D as X,H as Y,K as ee,L as z,M as te,k as ae,N as re}from"./index-4b0969f0.js";import{p as ie}from"./mermaid-parser.core-52a115f7.js";import"./_baseUniq-ec2c206a.js";import"./_basePickBy-167aafc4.js";import"./clone-91603e92.js";var F=U.pie,D={sections:new Map,showData:!1,config:F},h=D.sections,w=D.showData,se=structuredClone(F),oe=i(()=>structuredClone(se),"getConfig"),ne=i(()=>{h=new Map,w=D.showData,J()},"clear"),le=i(({label:e,value:a})=>{h.has(e)||(h.set(e,a),C.debug(`added new section: ${e}, with value: ${a}`))},"addSection"),ce=i(()=>h,"getSections"),de=i(e=>{w=e},"setShowData"),pe=i(()=>w,"getShowData"),G={getConfig:oe,clear:ne,setDiagramTitle:H,getDiagramTitle:K,setAccTitle:V,getAccTitle:Z,setAccDescription:j,getAccDescription:q,addSection:le,getSections:ce,setShowData:de,getShowData:pe},ge=i((e,a)=>{B(e,a),a.setShowData(e.showData),e.sections.map(a.addSection)},"populateDb"),ue={parse:i(async e=>{const a=await ie("pie",e);C.debug(a),ge(a,G)},"parse")},fe=i(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),he=fe,me=i(e=>{const a=[...e.entries()].map(s=>({label:s[0],value:s[1]})).sort((s,n)=>n.value-s.value);return re().value(s=>s.value)(a)},"createPieArcs"),Se=i((e,a,M,s)=>{C.debug(`rendering pie chart
`+e);const n=s.db,y=Q(),T=X(n.getConfig(),y.pie),$=40,o=18,p=4,l=450,m=l,S=Y(a),c=S.append("g");c.attr("transform","translate("+m/2+","+l/2+")");const{themeVariables:r}=y;let[A]=ee(r.pieOuterStrokeWidth);A??(A=2);const _=T.textPosition,g=Math.min(m,l)/2-$,W=z().innerRadius(0).outerRadius(g),L=z().innerRadius(g*_).outerRadius(g*_);c.append("circle").attr("cx",0).attr("cy",0).attr("r",g+A/2).attr("class","pieOuterCircle");const b=n.getSections(),v=me(b),O=[r.pie1,r.pie2,r.pie3,r.pie4,r.pie5,r.pie6,r.pie7,r.pie8,r.pie9,r.pie10,r.pie11,r.pie12],d=te(O);c.selectAll("mySlices").data(v).enter().append("path").attr("d",W).attr("fill",t=>d(t.data.label)).attr("class","pieCircle");let k=0;b.forEach(t=>{k+=t}),c.selectAll("mySlices").data(v).enter().append("text").text(t=>(t.data.value/k*100).toFixed(0)+"%").attr("transform",t=>"translate("+L.centroid(t)+")").style("text-anchor","middle").attr("class","slice"),c.append("text").text(n.getDiagramTitle()).attr("x",0).attr("y",-(l-50)/2).attr("class","pieTitleText");const x=c.selectAll(".legend").data(d.domain()).enter().append("g").attr("class","legend").attr("transform",(t,u)=>{const f=o+p,R=f*d.domain().length/2,I=12*o,N=u*f-R;return"translate("+I+","+N+")"});x.append("rect").attr("width",o).attr("height",o).style("fill",d).style("stroke",d),x.data(v).append("text").attr("x",o+p).attr("y",o-p).text(t=>{const{label:u,value:f}=t.data;return n.getShowData()?`${u} [${f}]`:u});const P=Math.max(...x.selectAll("text").nodes().map(t=>(t==null?void 0:t.getBoundingClientRect().width)??0)),E=m+$+o+p+P;S.attr("viewBox",`0 0 ${E} ${l}`),ae(S,l,E,T.useMaxWidth)},"draw"),ve={draw:Se},$e={parser:ue,db:G,renderer:ve,styles:he};export{$e as diagram};
