(this.webpackJsonprater=this.webpackJsonprater||[]).push([[0],{178:function(e,t,a){e.exports=a(277)},228:function(e,t,a){},273:function(e,t,a){},275:function(e,t,a){},277:function(e,t,a){"use strict";a.r(t);var n=a(0),l=a.n(n),r=a(16),c=a.n(r),o=a(96),s=a(21),i=a(11),u=a(29),d=a(19),m=a(117),E=a(46),p=a(34),g=a.n(p),b=a(86),f=a(14),h=a(161),v=a.n(h),O=a(172),y=a(82),_=a(166),j=a(70),S=a(20),w=a(35),k=a(98),N=a(83),C=a(118),x=a(165),D=function(e){for(var t=Object(n.useState)(!1),a=Object(i.a)(t,2),r=(a[0],a[1],Object(n.useState)(!1)),c=Object(i.a)(r,2),o=c[0],s=c[1],d=Object(n.useState)(""),m=Object(i.a)(d,2),E=m[0],p=m[1],b=Object(n.useState)({}),f=Object(i.a)(b,2),h=f[0],v=f[1],O=[],y=0;y<e.topics.length;y++)O.push(e.topics[y].label);return l.a.createElement("div",null,l.a.createElement(k.a,null,l.a.createElement(w.a,{xs:3}),l.a.createElement(w.a,{xs:6},l.a.createElement(N.a,{onClose:function(){return s(!1)},show:o,delay:2e3,autohide:!0,style:h},l.a.createElement(N.a.Body,null,E))),l.a.createElement(w.a,{xs:3})),l.a.createElement(S.a,{onSubmit:function(t){var a=t.currentTarget;t.preventDefault();for(var n=a.user_suggested_topic.value,l=""!=a.comments.value?a.comments.value:"None",r=a.topic_options,c=[],o=0;o<r.length;o++)r.options[o].selected&&c.push(r.options[o].value);""!=n&&c.push(n),console.log(l),console.log(c),0==c.length?(s(!0),p("Please select or enter a topic name!"),v({color:"red"})):g()({method:"post",url:"/ad-topic-suggestion/"+e.ad_id+"/set-topic-and-comments",data:{topics:c,comment:l}}).then((function(e){console.log(e.data),s(!0),p("Topic suggestion submitted successfully."),v({color:"green"})})).catch((function(e){console.log(e),s(!0),p("There was a problem in submitting your suggestion."),v({color:"red"})})).finally((function(){}))}},l.a.createElement(S.a.Row,null,l.a.createElement(C.a,{overlay:l.a.createElement(x.a,null,"[Ctrl/Command + click] to select multiple topics.")},l.a.createElement(S.a.Control,{as:"select",multiple:!0,id:"topic_options"},O.map((function(e){return l.a.createElement("option",null,e)})))),l.a.createElement(S.a.Group,{as:w.a,md:"4"},l.a.createElement(S.a.Label,null,"Or suggest a new topic: "),l.a.createElement(S.a.Control,{type:"text",id:"user_suggested_topic",placeholder:"Enter topic name"}))),l.a.createElement(S.a.Row,null,l.a.createElement(S.a.Group,{as:w.a,md:"4"},l.a.createElement(S.a.Label,null,"Additional Comments"),l.a.createElement(S.a.Control,{as:"textarea",rows:"4",id:"comments"}))),l.a.createElement(u.a,{type:"submit"},"Submit")))},A=function(e,t){return function(a){return a[e]===t}},T=function(e){var t=Object(n.useState)(!1),a=Object(i.a)(t,2),r=a[0],c=a[1],o=e.details.advertiser_info,s=e.details.demo_impression_results.filter(A("gender","female"));s.sort((function(e,t){return e.age_group>t.age_group?1:-1}));var p=e.details.demo_impression_results.filter(A("gender","male"));p.sort((function(e,t){return e.age_group>t.age_group?1:-1}));var g=e.details.demo_impression_results.filter(A("gender","unknown"));g.sort((function(e,t){return e.age_group>t.age_group?1:-1}));var b=e.details.region_impression_results;return b.sort((function(e,t){return e.region>t.region?1:-1})),l.a.createElement("div",null,l.a.createElement(m.a,{defaultActiveKey:"demos"},l.a.createElement(E.a,{eventKey:"demos",title:"Total Demographic Spend",mountOnEnter:!0},l.a.createElement("h3",null,"Female"),l.a.createElement(j.a,{striped:!0,bordered:!0,hover:!0},l.a.createElement("thead",null,l.a.createElement("tr",null,l.a.createElement("th",null,"Age Group"),l.a.createElement("th",null,"Max Spend"),l.a.createElement("th",null,"Max Impressions"))),l.a.createElement("tbody",null,s.map((function(e){return l.a.createElement("tr",{key:e.age_group},l.a.createElement("td",null,e.age_group),l.a.createElement("td",null,e.max_spend),l.a.createElement("td",null,e.max_impressions))})))),l.a.createElement("h3",null,"Male"),l.a.createElement(j.a,{striped:!0,bordered:!0,hover:!0},l.a.createElement("thead",null,l.a.createElement("tr",null,l.a.createElement("th",null,"Age Group"),l.a.createElement("th",null,"Max Spend"),l.a.createElement("th",null,"Max Impressions"))),l.a.createElement("tbody",null,p.map((function(e){return l.a.createElement("tr",{key:e.age_group},l.a.createElement("td",null,e.age_group),l.a.createElement("td",null,e.max_spend),l.a.createElement("td",null,e.max_impressions))})))),l.a.createElement("h3",null,"Unknown"),l.a.createElement(j.a,{striped:!0,bordered:!0,hover:!0},l.a.createElement("thead",null,l.a.createElement("tr",null,l.a.createElement("th",null,"Age Group"),l.a.createElement("th",null,"Max Spend"),l.a.createElement("th",null,"Max Impressions"))),l.a.createElement("tbody",null,g.map((function(e){return l.a.createElement("tr",{key:e.age_group},l.a.createElement("td",null,e.age_group),l.a.createElement("td",null,e.max_spend),l.a.createElement("td",null,e.max_impressions))}))))),l.a.createElement(E.a,{eventKey:"regional",title:"Total Regional Spend",mountOnEnter:!0},l.a.createElement(j.a,{striped:!0,bordered:!0,hover:!0},l.a.createElement("thead",null,l.a.createElement("tr",null,l.a.createElement("th",null,"Region"),l.a.createElement("th",null,"Max Spend"),l.a.createElement("th",null,"Max Impressions"))),l.a.createElement("tbody",null,b.map((function(e){return l.a.createElement("tr",{key:e.region},l.a.createElement("td",null,e.region),l.a.createElement("td",null,e.max_spend),l.a.createElement("td",null,e.max_impressions))}))))),l.a.createElement(E.a,{eventKey:"alternates",title:"Alternate Creatives",mountOnEnter:!0},e.details.archive_ids.map((function(e){return l.a.createElement("div",{className:"ad-image-container",key:e},l.a.createElement("div",null,l.a.createElement("img",{alt:e,src:"https://storage.googleapis.com/facebook_ad_archive_screenshots/"+e+".png"})),l.a.createElement(u.a,{className:"see-in-facebook-ad-library-button",href:"https://www.facebook.com/ads/library/?id="+e,target:"_blank",rel:"noopener noreferrer"},"See in Facebook Ad Library"))}))),l.a.createElement(E.a,{eventKey:"metadata",title:"NYU Metadata",mountOnEnter:!0},l.a.createElement(j.a,{striped:!0,bordered:!0,hover:!0},l.a.createElement("tbody",null,l.a.createElement("tr",null,l.a.createElement("td",null,"Ad Type:"),l.a.createElement("td",null,e.details.type)),l.a.createElement("tr",null,l.a.createElement("td",null,"Cluster Topics:"),l.a.createElement("td",null,e.details.topics,l.a.createElement("br",null),l.a.createElement("a",{href:"#",onClick:function(){return c(!0)}},"Suggest more topics?"))),l.a.createElement("tr",null,l.a.createElement("td",null,"Earliest Ad Creation Date:"),l.a.createElement("td",null,e.details.min_ad_creation_date)),l.a.createElement("tr",null,l.a.createElement("td",null,"Latest Ad Creation Date:"),l.a.createElement("td",null,e.details.max_ad_creation_date)),l.a.createElement("tr",null,l.a.createElement("td",null,"Number of ads in cluster:"),l.a.createElement("td",null,e.details.cluster_size)),l.a.createElement("tr",null,l.a.createElement("td",null,"Languages identified in ads:"),l.a.createElement("td",null,e.details.languages.join(", "))),l.a.createElement("tr",null,l.a.createElement("td",null,"Entities:"),l.a.createElement("td",null,e.details.entities)),l.a.createElement("tr",null,l.a.createElement("td",null,"Canonical ad archive ID:"),l.a.createElement("td",null,e.details.canonical_archive_id)),l.a.createElement("tr",null,l.a.createElement("td",null,"Archive IDs in cluster:"),l.a.createElement("td",null,e.details.archive_ids.join(", ")))))),l.a.createElement(E.a,{eventKey:"advertiser_info",title:"Advertiser Metadata",mountOnEnter:!0},o.map((function(e){return l.a.createElement(j.a,{striped:!0,bordered:!0,hover:!0},l.a.createElement("tbody",{className:"equal-width-columns"},l.a.createElement("tr",null,l.a.createElement("td",null,"Advertiser Type:"),l.a.createElement("td",null,e.advertiser_type)),l.a.createElement("tr",null,l.a.createElement("td",null,"Advertiser Party:"),l.a.createElement("td",null,e.advertiser_party)),l.a.createElement("tr",null,l.a.createElement("td",null,"FEC ID:"),l.a.createElement("td",null,e.advertiser_fec_id)),l.a.createElement("tr",null,l.a.createElement("td",null,"Advertiser website:"),l.a.createElement("td",null,e.advertiser_webiste)),l.a.createElement("tr",null,l.a.createElement("td",null,"Facebook Page ID:"),l.a.createElement("td",null,e.facebook_page_id)),l.a.createElement("tr",null,l.a.createElement("td",null,"Risk Score:"),l.a.createElement("td",null,e.advertiser_risk_score))))})))),l.a.createElement(d.a,{show:r,onHide:function(){return c(!1)},dialogClassName:"modal-90w",size:"lg","aria-labelledby":"contained-modal-title-vcenter",centered:!0},l.a.createElement(d.a.Header,{closeButton:!0},l.a.createElement(d.a.Title,null,"Suggest a new topic")),l.a.createElement(d.a.Body,null,l.a.createElement(D,{ad_id:e.details.ad_cluster_id,topics:e.topics}))))},R=(a(228),function(e){var t=Object(n.useState)(null===e.user_feedback_label_name?"Is this ad problematic?":e.user_feedback_label_name),a=Object(i.a)(t,2),r=a[0],c=a[1],o=function(t){g.a.post("/ad-feedback/"+e.ad_cluster_id+"/set-label/"+t).then((function(e){console.log(e.data),c(t)})).catch((function(t){console.log(t),t.response&&401===t.response.status&&e.handleShowNeedLoginModal()})).finally((function(){}))};return l.a.createElement(_.a,{className:"problematic-ad-button",id:"dropdown-basic-button",title:r},["(No Answer)","No","Misinformation","Scam","Other","Miscategorized"].map((function(t){return l.a.createElement(y.a.Item,{href:"#",key:e.ad_cluster_id+t,eventKey:t,onSelect:o},t)})))}),L=function(e){if(!e.details||0===e.details.length)return l.a.createElement("div",null);e.details.canonical_archive_id;return l.a.createElement(d.a,{show:e.show,onHide:e.handleClose,dialogClassName:"modal-90w",size:"xl"},l.a.createElement(d.a.Header,null,l.a.createElement(d.a.Title,null,"Cluster ID: ",e.details.ad_cluster_id)),l.a.createElement(d.a.Body,null,l.a.createElement(T,{details:e.details,topics:e.topics})),l.a.createElement(d.a.Footer,null,l.a.createElement(u.a,{className:"right",href:"/cluster?ad_id="+e.details.canonical_archive_id,target:"_blank"},"Standalone view of this cluster")," ",l.a.createElement(u.a,{variant:"secondary",onClick:e.handleClose},"Close")))},M=function(e){var t=Object(n.useState)(!1),a=Object(i.a)(t,2),r=a[0],c=a[1],o=Object(n.useState)([]),s=Object(i.a)(o,2),d=s[0],m=s[1],E=Object(n.useState)(e.ad.url),p=Object(i.a)(E,2),b=p[0],f=p[1],h=function(e){g.a.get("/getaddetails/"+e).then((function(e){console.log(e.data),m(e.data),c(!0)})).catch((function(e){console.log(e)})).finally((function(){}))};return l.a.createElement("div",{className:"ad-container"},l.a.createElement("div",{className:"ad-summary"},l.a.createElement("div",{className:"ad-summary-block-1"},l.a.createElement("div",{className:"ad-summary-tuple"},l.a.createElement("div",{className:"ad-summary-field"},"First seen:"),l.a.createElement("div",{className:"ad-summary-field"},"Last seen:"),l.a.createElement("div",{className:"ad-summary-field"},"Cluster Size:")),l.a.createElement("div",{className:"ad-summary-tuple"},l.a.createElement("div",{className:"ad-summary-data"},e.ad.start_date),l.a.createElement("div",{className:"ad-summary-data"},e.ad.end_date),l.a.createElement("div",{className:"ad-summary-data"},e.ad.cluster_size))),l.a.createElement("div",{className:"ad-summary-block-2"},l.a.createElement("div",{className:"ad-summary-spend"},l.a.createElement("div",{className:"ad-summary-field"},"Estimated Total Spend:"),l.a.createElement("div",{className:"ad-summary-field"},"Estimated Total Impressions:"),l.a.createElement("div",{className:"ad-summary-field"},"Number of pages:")),l.a.createElement("div",{className:"ad-summary-spend"},l.a.createElement("div",{className:"ad-summary-data"},e.ad.total_spend),l.a.createElement("div",{className:"ad-summary-data"},e.ad.total_impressions),l.a.createElement("div",{className:"ad-summary-data"},e.ad.num_pages)))),l.a.createElement(u.a,{variant:"primary",onClick:function(){return h(e.ad.ad_cluster_id)}},"Ad Details"),l.a.createElement(R,{ad_cluster_id:e.ad.ad_cluster_id,handleShowNeedLoginModal:e.handleShowNeedLoginModal,user_feedback_label_name:e.ad.user_feedback_label_name}),l.a.createElement(L,{show:r,handleClose:function(){return c(!1)},details:d,key:d.ad_cluster_id,topics:e.topics}),l.a.createElement("div",{className:"ad-image-container"},l.a.createElement("img",{className:"ad-image",alt:b,src:b,onError:function(){return f("https://storage.googleapis.com/facebook_ad_archive_screenshots/error.png")}})))},P=a(136),I=a.n(P),B=(a(229),function(e){var t=Object(f.c)("Start Date",f.b),a=Object(i.a)(t,2),n=(a[0],a[1]),r=Object(f.c)("End Date",f.b),c=Object(i.a)(r,2),o=(c[0],c[1]);return console.log(e.startDate),console.log(e.endDate),l.a.createElement("div",null,l.a.createElement("div",null,"Start Date:"," ",l.a.createElement(I.a,{selected:e.startDate,onChange:function(t){e.setStartDate(t),n(t.toString())},disabled:e.disabled})),l.a.createElement("div",null,"End Date:"," ",l.a.createElement(I.a,{selected:e.endDate,onChange:function(t){e.setEndDate(t),o(t.toString())},disabled:e.disabled})))}),F=a(173),G=function(e){var t=Object(f.c)(e.title?e.title:"Topic",f.b),a=Object(i.a)(t,2),n=(a[0],a[1]);return console.log(e.option),l.a.createElement("div",{className:"filter-selector"},e.title,l.a.createElement(F.a,{value:e.option.selectedOption,onChange:function(t){e.setState({selectedOption:t}),n(t.value),console.log("Option selected:",t)},options:e.options,isSearchable:!0,isMulti:!1,isDisabled:e.disabled,name:e.title}))};var H=function(){var e="",t=Object(n.useState)(!1),a=Object(i.a)(t,2),r=a[0],c=a[1],o=Object(n.useState)(!1),s=Object(i.a)(o,2),d=s[0],m=s[1],E=Object(n.useState)(""),p=Object(i.a)(E,2),b=p[0],f=p[1],h=Object(n.useState)({}),v=Object(i.a)(h,2),O=v[0],y=v[1];return l.a.createElement("div",null,l.a.createElement(k.a,null,l.a.createElement(w.a,{xs:3}),l.a.createElement(w.a,{xs:6},l.a.createElement(N.a,{onClose:function(){return m(!1)},show:d,delay:2e3,autohide:!0,style:O},l.a.createElement(N.a.Body,null,b))),l.a.createElement(w.a,{xs:3})),l.a.createElement(S.a,{noValidate:!0,validated:r,onSubmit:function(t){var a=t.currentTarget;t.preventDefault(),!1===a.checkValidity()?t.stopPropagation():(e=a.topic_name.value,console.log(e),g.a.post("/insert-user-suggested-topic-name/"+e).then((function(e){console.log(e.data),m(!0),f("Topic suggestion submitted successfully."),y({color:"green"})})).catch((function(e){console.log(e),m(!0),f("There was a problem in submitting your suggestion."),y({color:"red"})})).finally((function(){}))),c(!0)}},l.a.createElement(S.a.Row,null,l.a.createElement(S.a.Group,{as:w.a,md:"4"},l.a.createElement(S.a.Label,null,"Suggest Topic"),l.a.createElement(S.a.Control,{required:!0,type:"text",id:"topic_name",placeholder:"Enter topic name"}),l.a.createElement(S.a.Control.Feedback,{type:"invalid",className:"mb-2 mr-sm-2"},"Please enter a topic name."))),l.a.createElement(u.a,{type:"submit"},"Submit")))},K=a(167),z=a(101),V=a(123),U=function(e){var t=Object(n.useRef)(null),a=l.a.createElement(V.a,{id:"popover-basic"},l.a.createElement(V.a.Title,{as:"h3"},"What is full text search?"),l.a.createElement(V.a.Content,null,"This feature searches all text in an ad, page name, funding entity, and many other things."));return l.a.createElement(K.a,null,l.a.createElement(C.a,{placement:"right",overlay:a},l.a.createElement(z.a,{placeholder:"keyword",onChange:function(){e.setState(t.current.value),console.log("Keyword:",t.current.value)},ref:t})))},q=a(302),W=a(303),J=a(304),Y=a(174),X=function(e){var t=[{value:0,label:"Very High"},{value:25,label:"High"},{value:50,label:"Medium"},{value:75,label:"Low"},{value:100,label:"Very Low"}];return l.a.createElement("div",null,l.a.createElement(S.a,null,l.a.createElement(S.a.Group,null,l.a.createElement(S.a.File,{id:"reverse_image_search",label:"Upload an image to search for similar ad creatives",onChange:function(t){e.setFileState({file:t.target.files[0]}),console.log({file:t.target.files[0]})},accept:"image/*"})),l.a.createElement(S.a.Group,{className:"Slider"},l.a.createElement(S.a.Label,null,"Minimum image similarity level",l.a.createElement(q.a,{title:"Image similarity lets you control how narrowly or broadly to match ad creatives images. Very High will match ad creative images nearly identical to the uploaded image. Medium will match ad creative images somewhat similar, very similar, and nearly identical to the uploaded image. Very Low will match ad creatives images anywhere between loosely similar and nearly identical to the uploaded image.",placement:"right"},l.a.createElement(W.a,{"aria-label":"info"},l.a.createElement(Y.a,null)))),l.a.createElement(J.a,{name:"slider",defaultValue:50,onChange:function(a,n){e.setSliderState(t[n/25].label)},"aria-labelledby":"discrete-slider-custom",step:null,valueLabelDisplay:"off",marks:t,track:!1}))))};function $(e,t){return void 0===t?e[0]:e[e.findIndex((function(e){return e.value===t}))]}var Q=function(e){var t=e.showNext>0,a=t&&e.showPrevious;return t?a?l.a.createElement("div",null,l.a.createElement(u.a,{onClick:e.onClickPrevious},"Previous"),l.a.createElement(u.a,{onClick:e.onClickNext},"Next")):l.a.createElement("div",null,l.a.createElement(u.a,{onClick:e.onClickNext},"Next")):null},Z=function(e){var t=e.isGetAdsRequestPending,a=e.isAdDataEmpty,n=e.ads,r=e.handleShowNeedLoginModal,c=e.resultsOffset,o=e.getPreviousPageOfAds,s=e.getNextPageOfAds,i=e.topics;return t?l.a.createElement("div",{align:"center"},l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement(v.a,{type:"spin",color:"#000"})):a?l.a.createElement("div",null,l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("p",null,"No results found")):l.a.createElement("div",null,l.a.createElement("div",{className:"App-ad-pane",align:"center"},n.map((function(e){return l.a.createElement(M,{ad:e,key:e.ad_cluster_id,handleShowNeedLoginModal:r,topics:i})}))),l.a.createElement(Q,{showNext:n.length>0,showPrevious:c.current>0,onClickPrevious:o,onClickNext:s}))},ee=function(e){var t=Object(f.c)("Start Date",f.b),a=Object(i.a)(t,2),r=a[0],c=(a[1],Object(f.c)("End Date",f.b)),o=Object(i.a)(c,2),s=o[0],p=(o[1],Object(f.c)("Topic",f.b)),h=Object(i.a)(p,2),v=h[0],y=h[1],_=Object(f.c)("Region",f.b),j=Object(i.a)(_,2),S=j[0],w=(j[1],Object(f.c)("Gender",f.b)),k=Object(i.a)(w,2),N=k[0],C=(k[1],Object(f.c)("Age Range",f.b)),x=Object(i.a)(C,2),D=x[0],A=(x[1],Object(f.c)("Language",f.b)),T=Object(i.a)(A,2),R=T[0],L=(T[1],Object(f.c)("Risk Score",f.b)),M=Object(i.a)(L,2),P=M[0],I=(M[1],Object(f.c)("Sort By Field",f.b)),F=Object(i.a)(I,2),K=F[0],z=(F[1],Object(f.c)("Sort Order",f.b)),V=Object(i.a)(z,2),q=V[0],W=(V[1],Object(n.useState)(void 0===r?Object(b.default)(new Date,-7):new Date(r))),J=Object(i.a)(W,2),Y=J[0],Q=J[1],ee=Object(n.useState)(void 0===s?new Date:new Date(s)),te=Object(i.a)(ee,2),ae=te[0],ne=te[1],le=Object(n.useState)({selectedOption:$(e.topics,v)}),re=Object(i.a)(le,2),ce=re[0],oe=re[1],se=Object(n.useState)({selectedOption:$(e.regions,S)}),ie=Object(i.a)(se,2),ue=ie[0],de=ie[1],me=Object(n.useState)({selectedOption:$(e.genders,N)}),Ee=Object(i.a)(me,2),pe=Ee[0],ge=Ee[1],be=Object(n.useState)({selectedOption:$(e.ageRanges,D)}),fe=Object(i.a)(be,2),he=fe[0],ve=fe[1],Oe=Object(n.useState)({selectedOption:$(e.languages,R)}),ye=Object(i.a)(Oe,2),_e=ye[0],je=ye[1],Se=Object(n.useState)({selectedOption:$(e.riskScores,P)}),we=Object(i.a)(Se,2),ke=we[0],Ne=we[1],Ce=Object(n.useState)({selectedOption:$(e.orderByOptions,K)}),xe=Object(i.a)(Ce,2),De=xe[0],Ae=xe[1],Te=Object(n.useState)({selectedOption:$(e.orderDirections,q)}),Re=Object(i.a)(Te,2),Le=Re[0],Me=Re[1],Pe=Object(n.useState)(null),Ie=Object(i.a)(Pe,2),Be=Ie[0],Fe=Ie[1],Ge=Object(n.useState)("topics"),He=Object(i.a)(Ge,2),Ke=He[0],ze=He[1],Ve=Object(n.useState)(!1),Ue=Object(i.a)(Ve,2),qe=Ue[0],We=Ue[1],Je=Object(n.useState)([]),Ye=Object(i.a)(Je,2),Xe=Ye[0],$e=Ye[1],Qe=Object(n.useState)(null),Ze=Object(i.a)(Qe,2),et=Ze[0],tt=Ze[1],at=Object(n.useState)(null),nt=Object(i.a)(at,2),lt=nt[0],rt=nt[1],ct=Object(n.useState)("Medium"),ot=Object(i.a)(ct,2),st=ot[0],it=ot[1],ut=Object(n.useState)(!1),dt=Object(i.a)(ut,2),mt=dt[0],Et=dt[1],pt=Object(n.useRef)(0),gt=Object(n.useState)(!1),bt=Object(i.a)(gt,2),ft=bt[0],ht=bt[1],vt=Object(n.useState)(!1),Ot=Object(i.a)(vt,2),yt=Ot[0],_t=Ot[1],jt=Object(n.useState)(!1),St=Object(i.a)(jt,2),wt=St[0],kt=St[1],Nt=function(){return kt(!0)},Ct=Object(n.useState)(!1),xt=Object(i.a)(Ct,2),Dt=xt[0],At=xt[1],Tt=Object(n.useState)(!1),Rt=Object(i.a)(Tt,2),Lt=Rt[0],Mt=Rt[1],Pt=Object(n.useState)([]),It=Object(i.a)(Pt,2),Bt=It[0],Ft=It[1],Gt=function(){if(At(!0),Mt(!0),console.log("in getads"),console.log("topic: ",ce.selectedOption),console.log("page: ",et),console.log("full text: ",Be),console.log("image file: ",lt),console.log("Slider value: ",st),lt||ce.selectedOption||et||Be)if(lt){var e=new FormData;e.append("reverse_image_search",lt.file),e.append("similarity",st);console.log(e.get("reverse_image_search")),console.log(e.get("similarity")),g.a.post("/getads",e,{headers:{"content-type":"multipart/form-data"}}).then((function(e){console.log(e.data),Ft(e.data),Mt(0===e.data.length),At(!1)})).catch((function(e){console.log(e),e.response&&401===e.response.status&&Nt(),Mt(!0),At(!1)})).finally((function(){}))}else g.a.get("/getads",{params:{startDate:Y,endDate:ae,topic:ce.selectedOption.value,region:ue.selectedOption.label,gender:pe.selectedOption.value,ageRange:he.selectedOption.value,language:_e.selectedOption.value,riskScore:ke.selectedOption.value,orderBy:De.selectedOption.value,orderDirection:Le.selectedOption.value,numResults:20,offset:pt.current,full_text_search:Be,page_id:et}}).then((function(e){console.log(e.data),Ft(e.data),Mt(0===e.data.length),At(!1)})).catch((function(e){console.log(e),e.response&&401===e.response.status&&Nt(),Mt(!0),At(!1)})).finally((function(){}));else alert("Invalid search. Please enter a value for one of the search options."),At(!1),Mt(!1)};return l.a.createElement("div",{className:"App"},l.a.createElement("header",{className:"App-header"},l.a.createElement("h1",null,"Welcome to NYU's Ad Screening System")),l.a.createElement("p",null,"Please select filters below and click 'Get Ads' to load content."," ",l.a.createElement("a",{href:"#",onClick:function(){return ht(!0)}},"Click here for more information.")),l.a.createElement("div",{className:"App-filter-selector"},l.a.createElement("div",null,"Search By:",l.a.createElement(m.a,{activeKey:Ke,onSelect:function(e){switch(ze(e),e){case"topics":Fe(null),tt(null),rt(null),Et(!1);break;case"advertiser":Fe(null),oe({selectedOption:""}),y(void 0),rt(null),Et(!1);break;case"fullText":oe({selectedOption:""}),y(void 0),tt(null),rt(null),Et(!1);break;case"image":oe({selectedOption:""}),y(void 0),tt(null),Fe(null),Et(!0);break;default:alert("Select one of the tabs")}}},l.a.createElement(E.a,{eventKey:"topics",title:"Topic",mountOnEnter:!0},l.a.createElement(G,{setState:oe,option:ce,options:e.topics})),l.a.createElement(E.a,{eventKey:"fullText",title:"Full Text",mountOnEnter:!0},l.a.createElement(U,{setState:Fe})),l.a.createElement(E.a,{eventKey:"advertiser",title:"Advertiser",mountOnEnter:!0},l.a.createElement(O.a,{id:"advertiser-search",isLoading:qe,labelKey:"page",minLength:1,onSearch:function(e){We(!0),g.a.get("/search/pages_type_ahead",{params:{q:e}}).then((function(e){console.log(e.data);var t=e.data.data.map((function(e){return{id:e.id,page:e.page_name}}));$e(t),We(!1),console.log(Xe)})).catch((function(e){console.log(e),e.response&&401===e.response.status&&Nt()})).finally((function(){}))},onChange:function(e){try{tt(e[0].id)}catch(t){}},options:Xe,placeholder:"Search for an advertiser page...",renderMenuItemChildren:function(e,t){return l.a.createElement(l.a.Fragment,null,l.a.createElement("span",null,e.page))}})),l.a.createElement(E.a,{eventKey:"image",title:"Image",mountOnEnter:!0},l.a.createElement(X,{setFileState:rt,setSliderState:it})))),l.a.createElement(G,{setState:de,option:ue,title:"Region",options:e.regions,disabled:mt}),l.a.createElement(G,{setState:ge,option:pe,title:"Gender",options:e.genders,disabled:mt}),l.a.createElement(G,{setState:ve,option:he,title:"Age Range",options:e.ageRanges,disabled:mt}),l.a.createElement(G,{setState:je,option:_e,title:"Language",options:e.languages,disabled:mt}),l.a.createElement(G,{setState:Ne,option:ke,title:"Risk Score",options:e.riskScores,disabled:mt}),l.a.createElement(G,{setState:Ae,option:De,title:"Sort By Field",options:e.orderByOptions,disabled:mt}),l.a.createElement(G,{setState:Me,option:Le,title:"Sort Order",options:e.orderDirections,disabled:mt}),l.a.createElement(B,{startDate:Y,setStartDate:Q,endDate:ae,setEndDate:ne,disabled:mt}),l.a.createElement(u.a,{variant:"primary",onClick:function(){pt.current=0,Gt()}},"Get Ads")),l.a.createElement("a",{href:"#",onClick:function(){return _t(!0)}},"Click here to suggest topics."),l.a.createElement(Z,{isGetAdsRequestPending:Dt,isAdDataEmpty:Lt,ads:Bt,handleShowNeedLoginModal:Nt,resultsOffset:pt,getPreviousPageOfAds:function(){var e;e=20,pt.current>=e&&(pt.current=pt.current-e),Gt()},getNextPageOfAds:function(){var e;e=20,pt.current=pt.current+e,Gt()},topics:e.topics}),l.a.createElement(d.a,{show:ft,onHide:function(){return ht(!1)},dialogClassName:"modal-90w",size:"lg"},l.a.createElement(d.a.Header,null,l.a.createElement(d.a.Title,null,"How To Use This Tool")),l.a.createElement(d.a.Body,null,l.a.createElement("h2",null,"Filtering Ads"),l.a.createElement("p",null,"To view ads, select a topic, and a region and/or demographic group of interest. Select a date range, and click 'Get Ads'. If you are interested in a topic that is not available, please contact us so it can be added."),l.a.createElement("h2",null,"Viewing Results"),l.a.createElement("p",null,"To see in-depth data about each ad, click 'Ad Details'."),l.a.createElement("p",null,"Results are for the entire cluster of ads; to see other ad creatives in the cluster, click on the 'Alternate Creatives' tab. Ad type classifications and entities detected are for all ads in the cluster. If you see metadata that you believe to be in error, please let us know!"),l.a.createElement("h2",null,"Limitations"),l.a.createElement("p",null,"Data is delayed approximately 48 hours. All metadata development and risk scores are EXPERIMENTAL."))),l.a.createElement(d.a,{show:yt,onHide:function(){return _t(!1)},dialogClassName:"modal-90w",size:"lg"},l.a.createElement(d.a.Header,{closeButton:!0},l.a.createElement(d.a.Title,null,"Suggest a new topic")),l.a.createElement(d.a.Body,null,l.a.createElement(H,null))),l.a.createElement(d.a,{show:wt,onHide:function(){return kt(!1)},dialogClassName:"modal-90w",size:"lg"},l.a.createElement(d.a.Header,null,l.a.createElement(d.a.Title,null,"Please Login To Use This Tool")),l.a.createElement(d.a.Body,null,l.a.createElement("h2",null,"Please login"),l.a.createElement("p",null,"Either you have not logged in yet, or your session has expired."),l.a.createElement("a",{href:"/login"},"Click here to login or register"))))},te=function(){var e=Object(n.useState)(!1),t=Object(i.a)(e,2),a=t[0],r=t[1],c=Object(n.useState)({}),o=Object(i.a)(c,2),s=o[0],u=o[1];if(Object(n.useEffect)((function(){g.a.get("/filter-options").then((function(e){console.log(e.data),u(e.data),r(!0)})).catch((function(e){console.log(e)})).finally((function(){}))}),[]),!a)return l.a.createElement("h1",null,"Loading...");var d=s.topics,m=s.regions,E=s.genders,p=s.ageRanges,b=s.languages,f=s.riskScores,h=s.orderByOptions,v=s.orderDirections;return l.a.createElement(ee,{topics:d,regions:m,genders:E,ageRanges:p,languages:b,riskScores:f,orderByOptions:h,orderDirections:v})};var ae=function(){var e=Object(f.c)("ad_id",f.b),t=Object(i.a)(e,2),a=t[0],r=(t[1],Object(n.useState)([])),c=Object(i.a)(r,2),o=c[0],s=c[1],u=Object(n.useState)(!1),d=Object(i.a)(u,2),m=d[0],E=d[1],p=Object(n.useState)(!1),b=Object(i.a)(p,2),h=b[0],v=b[1];return Object(n.useEffect)((function(){g.a.get("/archive-id/"+a+"/cluster").then((function(e){console.log(e.data),s(e.data),E(!0)})).catch((function(e){console.log(e),404===e.response.status&&v(!0)})).finally((function(){}))}),[]),h?l.a.createElement("div",null,l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("h3",{align:"center"},"No results found")):m?l.a.createElement("div",{className:"App-ad-cluster-data"},l.a.createElement("h2",null,"Cluster ID: ",o.ad_cluster_id," "),l.a.createElement("hr",null),l.a.createElement(T,{details:o})):l.a.createElement("h1",null,"Loading...")};a(273);var ne=function(){return l.a.createElement(s.c,null," ",l.a.createElement(s.a,{exact:!0,path:"/",component:te}),l.a.createElement(s.a,{path:"/cluster",component:ae}))};a(275),Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));a(276);c.a.render(l.a.createElement(o.a,null,l.a.createElement(f.a,{ReactRouterRoute:s.a},l.a.createElement(ne,null))),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[178,1,2]]]);
//# sourceMappingURL=main.8fadb8c1.chunk.js.map