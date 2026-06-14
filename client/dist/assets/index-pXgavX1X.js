(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function s(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=s(n);fetch(n.href,i)}})();const P="";async function B(e,t={}){const s=await fetch(`${P}${e}`,{headers:{"Content-Type":"application/json",...t.headers},...t}),a=await s.json().catch(()=>({}));if(!s.ok){const n=new Error(a.message||"Request failed");throw n.status=s.status,n.data=a,n}return a}async function O(){try{return(await fetch(`${P}/campaign`,{method:"OPTIONS"})).status!==0}catch{return!1}}async function H(e){return B("/campaign",{method:"POST",body:JSON.stringify({prompt:e})})}async function N(e){return B(`/campaign/${e}/stats`,{method:"GET"})}const S=document.getElementById("campaign-prompt"),v=document.getElementById("launch-btn"),c=document.getElementById("campaign-results"),C=document.getElementById("api-status"),q=document.getElementById("toast-container"),p=document.getElementById("stats-content"),A=document.getElementById("stats-campaign-label"),k=document.getElementById("stats-campaign-meta"),l=document.getElementById("refresh-stats-btn"),R=document.querySelectorAll(".nav-btn"),x=document.querySelectorAll(".view");let m=null,f=null,h=!1,g=!1;function d(e,t="info"){const s=document.createElement("div");s.className=`toast ${t}`,s.textContent=e,q.appendChild(s),setTimeout(()=>s.remove(),4e3)}function E(e,t){const s=e.querySelector(".btn-label"),a=e.querySelector(".spinner");e.disabled=t,s.classList.toggle("hidden",t),a.classList.toggle("hidden",!t)}function $(e){R.forEach(t=>{t.classList.toggle("active",t.dataset.view===e)}),x.forEach(t=>{t.classList.toggle("active",t.id===`view-${e}`)})}function u(e){return`${(e*100).toFixed(1)}%`}function y(e,t,s){return e>=t?"good":e>=s?"warn":"bad"}function L(){m&&(clearInterval(m),m=null)}function T(e){if(!(e!=null&&e.campaignMessage))return"";const t=e.channel?e.channel.charAt(0).toUpperCase()+e.channel.slice(1):null;return`
    <div class="campaign-message">
      <span class="campaign-message-label">Campaign message${t?` · ${t}`:""}</span>
      <p>${e.campaignMessage}</p>
    </div>
  `}function j(e,t){var s;return`
    <div class="card campaign-summary result-success">
      <h3>${e.message||"Campaign started"}</h3>
      <p>Audience: <strong>${((s=e.audienceSize)==null?void 0:s.toLocaleString())??"—"}</strong> customers</p>
      ${e.campaignId?`<p>Campaign ID: <code>${e.campaignId}</code></p>`:""}
      ${e.goal?`<p class="campaign-goal"><strong>Goal:</strong> ${e.goal}</p>`:""}
      ${T(e)}
      <div class="campaign-message">
        <span class="campaign-message-label">Your prompt</span>
        <p>${t}</p>
      </div>
      <p class="stats-hint">Stats are loading in the <button type="button" class="link-btn" id="go-to-stats-btn">Campaign Stats</button> tab.</p>
    </div>
  `}function F(e){const{stats:t,insights:s}=e;return`
    <div class="metric-grid">
      <div class="metric-card">
        <div class="label">Delivery Rate</div>
        <div class="value ${y(t.deliveryRate,.85,.7)}">${u(t.deliveryRate)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Open Rate</div>
        <div class="value ${y(t.openRate,.25,.15)}">${u(t.openRate)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Click-through Rate</div>
        <div class="value ${y(t.ctr,.2,.1)}">${u(t.ctr)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Failure Rate</div>
        <div class="value ${t.failureRate<=.1?"good":t.failureRate<=.2?"warn":"bad"}">${u(t.failureRate)}</div>
      </div>
    </div>

    <div class="card insights-card">
      <h3>AI Insights</h3>
      <div class="insight-summary">${s.summary}</div>
      <div class="insight-lists">
        <div class="insight-list positives">
          <h4>What worked</h4>
          <ul>${s.positives.length?s.positives.map(a=>`<li>${a}</li>`).join(""):"<li>None noted</li>"}</ul>
        </div>
        <div class="insight-list issues">
          <h4>Issues</h4>
          <ul>${s.issues.length?s.issues.map(a=>`<li>${a}</li>`).join(""):"<li>None noted</li>"}</ul>
        </div>
        <div class="insight-list actions">
          <h4>Recommended actions</h4>
          <ul>${s.actions.length?s.actions.map(a=>`<li>${a}</li>`).join(""):"<li>None noted</li>"}</ul>
        </div>
      </div>
    </div>
  `}function z(){return`
    <div class="stats-loading">
      <span class="spinner"></span>
      <span>Loading campaign stats…</span>
    </div>
  `}function G(e){return`
    <div class="result-error">
      <h3>Could not load stats</h3>
      <p>${e||"Something went wrong. Please try again."}</p>
    </div>
  `}function J(e,t){c.classList.remove("hidden"),c.innerHTML=`
    <div class="result-error">
      <h3>Campaign failed</h3>
      <p>${e||"Something went wrong. Please try again."}</p>
      ${t?`<p><strong>Query:</strong> ${JSON.stringify(t)}</p>`:""}
    </div>
  `}function M(e,t=null){A.textContent=e?`Campaign ${e}`:"No campaign selected";const s=[];t!=null&&t.audienceSize&&s.push(`Audience: ${t.audienceSize.toLocaleString()} customers`),t!=null&&t.channel&&s.push(`Channel: ${t.channel}`),k.textContent=s.join(" · "),l.disabled=!e}function K(e){return e!=null&&e.campaignMessage?`
    <div class="card campaign-info-card">
      ${e.goal?`<p class="campaign-goal"><strong>Goal:</strong> ${e.goal}</p>`:""}
      ${T(e)}
    </div>
  `:""}function Q(){p.innerHTML=z()}function U(){p.innerHTML=`
    <div class="stats-empty">
      <p>Launch a campaign to view live stats here.</p>
    </div>
  `}function I(e){l.disabled=e||!f;const t=l.querySelector(".btn-label"),s=l.querySelector(".spinner");t&&s?(t.classList.toggle("hidden",e),s.classList.toggle("hidden",!e)):l.textContent=e?"Refreshing…":"Refresh stats"}async function b(e,{silent:t=!1}={}){var a,n;if(!e||h)return;!t&&!g?Q():t||I(!0),h=!0;try{const i=await N(e);return p.innerHTML=F(i),g=!0,i}catch(i){throw(!t||!g)&&(p.innerHTML=G(((a=i.data)==null?void 0:a.message)||i.message)),t||d(((n=i.data)==null?void 0:n.message)||i.message,"error"),i}finally{h=!1,I(!1)}}function V(e){L();let t=0;const s=20;m=setInterval(async()=>{t+=1;try{await b(e,{silent:!0})}catch{}t>=s&&L()},3e3)}function W(e,t){f=e,g=!1,M(e,t),Y(t),b(e),V(e)}function Y(e){const t=document.getElementById("stats-campaign-info");if(!t)return;const s=K(e);t.innerHTML=s,t.classList.toggle("hidden",!s)}R.forEach(e=>{e.addEventListener("click",()=>$(e.dataset.view))});document.querySelectorAll(".chip").forEach(e=>{e.addEventListener("click",()=>{S.value=e.dataset.example,S.focus()})});l.addEventListener("click",()=>{f&&b(f)});v.addEventListener("click",async()=>{var t,s,a,n,i,o;const e=S.value.trim();if(!e){d("Please enter a campaign prompt.","error");return}E(v,!0),c.classList.add("hidden"),c.innerHTML="",L(),g=!1;try{const r=await H(e),w=((s=(t=r.campaignId)==null?void 0:t.toString)==null?void 0:s.call(t))??r.campaignId;c.classList.remove("hidden"),c.innerHTML=j(r,e),(a=document.getElementById("go-to-stats-btn"))==null||a.addEventListener("click",()=>{$("stats")}),d("Campaign launched successfully.","success"),w?(W(w,r),$("stats")):d("Campaign started but no ID was returned — stats unavailable.","error")}catch(r){J(((n=r.data)==null?void 0:n.message)||r.message,(i=r.data)==null?void 0:i.query),d(((o=r.data)==null?void 0:o.message)||r.message,"error")}finally{E(v,!1)}});async function _(){const e=await O();C.textContent=e?"connected":"offline",C.className=e?"online":"offline",e||d("Backend is not reachable. Start the server on port 8000.","error"),M(null),U()}_();
