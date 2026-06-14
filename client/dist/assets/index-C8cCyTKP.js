(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function s(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=s(n);fetch(n.href,a)}})();const M="";async function R(e,t={}){const s=await fetch(`${M}${e}`,{headers:{"Content-Type":"application/json",...t.headers},...t}),i=await s.json().catch(()=>({}));if(!s.ok){const n=new Error(i.message||"Request failed");throw n.status=s.status,n.data=i,n}return i}async function A(){try{return(await fetch(`${M}/campaign`,{method:"OPTIONS"})).status!==0}catch{return!1}}async function k(e){return R("/campaign",{method:"POST",body:JSON.stringify({prompt:e})})}async function x(e){return R(`/campaign/${e}/stats`,{method:"GET"})}const $=document.getElementById("campaign-prompt"),v=document.getElementById("launch-btn"),c=document.getElementById("campaign-results"),I=document.getElementById("api-status"),j=document.getElementById("toast-container"),p=document.getElementById("stats-content"),F=document.getElementById("stats-campaign-label"),z=document.getElementById("stats-campaign-meta"),l=document.getElementById("refresh-stats-btn"),T=document.querySelectorAll(".nav-btn"),G=document.querySelectorAll(".view");let m=null,f=null,L=null,h=!1,u=!1;function d(e,t="info"){const s=document.createElement("div");s.className=`toast ${t}`,s.textContent=e,j.appendChild(s),setTimeout(()=>s.remove(),4e3)}function P(e,t){const s=e.querySelector(".btn-label"),i=e.querySelector(".spinner");e.disabled=t,s.classList.toggle("hidden",t),i.classList.toggle("hidden",!t)}function S(e){T.forEach(t=>{t.classList.toggle("active",t.dataset.view===e)}),G.forEach(t=>{t.classList.toggle("active",t.id===`view-${e}`)})}function g(e){return`${(e*100).toFixed(1)}%`}function y(e,t,s){return e>=t?"good":e>=s?"warn":"bad"}function b(){m&&(clearInterval(m),m=null)}function J(e,t){return{...e,prompt:t,campaignMessage:e.campaignMessage??e.campaign_message??null,channel:e.channel??null,goal:e.goal??null}}function _(e){if(!(e!=null&&e.campaignMessage))return"";const t=e.channel?e.channel.charAt(0).toUpperCase()+e.channel.slice(1):null;return`
    <div class="campaign-message">
      <span class="campaign-message-label">Campaign message${t?` · ${t}`:""}</span>
      <p>${e.campaignMessage}</p>
    </div>
  `}function O(e){return e?`
    <div class="campaign-message">
      <span class="campaign-message-label">Your prompt</span>
      <p>${e}</p>
    </div>
  `:""}function H(e){return e?`
    ${e.goal?`<p class="campaign-goal"><strong>Goal:</strong> ${e.goal}</p>`:""}
    ${_(e)}
    ${e.campaignMessage?"":O(e.prompt)}
  `:""}function K(e,t){var i;const s=H(e);return`
    <div class="card campaign-summary result-success">
      <h3>${e.message||"Campaign started"}</h3>
      <p>Audience: <strong>${((i=e.audienceSize)==null?void 0:i.toLocaleString())??"—"}</strong> customers</p>
      ${e.campaignId?`<p>Campaign ID: <code>${e.campaignId}</code></p>`:""}
      ${s?`<div class="campaign-details">${s}</div>`:""}
      ${e.campaignMessage?O(t):""}
      <p class="stats-hint">Stats are loading in the <button type="button" class="link-btn" id="go-to-stats-btn">Campaign Stats</button> tab.</p>
    </div>
  `}function Q(e){const{stats:t,insights:s}=e;return`
    <div class="metric-grid">
      <div class="metric-card">
        <div class="label">Delivery Rate</div>
        <div class="value ${y(t.deliveryRate,.85,.7)}">${g(t.deliveryRate)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Open Rate</div>
        <div class="value ${y(t.openRate,.25,.15)}">${g(t.openRate)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Click-through Rate</div>
        <div class="value ${y(t.ctr,.2,.1)}">${g(t.ctr)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Failure Rate</div>
        <div class="value ${t.failureRate<=.1?"good":t.failureRate<=.2?"warn":"bad"}">${g(t.failureRate)}</div>
      </div>
    </div>

    <div class="card insights-card">
      <h3>AI Insights</h3>
      <div class="insight-summary">${s.summary}</div>
      <div class="insight-lists">
        <div class="insight-list positives">
          <h4>What worked</h4>
          <ul>${s.positives.length?s.positives.map(i=>`<li>${i}</li>`).join(""):"<li>None noted</li>"}</ul>
        </div>
        <div class="insight-list issues">
          <h4>Issues</h4>
          <ul>${s.issues.length?s.issues.map(i=>`<li>${i}</li>`).join(""):"<li>None noted</li>"}</ul>
        </div>
        <div class="insight-list actions">
          <h4>Recommended actions</h4>
          <ul>${s.actions.length?s.actions.map(i=>`<li>${i}</li>`).join(""):"<li>None noted</li>"}</ul>
        </div>
      </div>
    </div>
  `}function U(){return`
    <div class="stats-loading">
      <span class="spinner"></span>
      <span>Loading campaign stats…</span>
    </div>
  `}function V(e){return`
    <div class="result-error">
      <h3>Could not load stats</h3>
      <p>${e||"Something went wrong. Please try again."}</p>
    </div>
  `}function W(e,t){c.classList.remove("hidden"),c.innerHTML=`
    <div class="result-error">
      <h3>Campaign failed</h3>
      <p>${e||"Something went wrong. Please try again."}</p>
      ${t?`<p><strong>Query:</strong> ${JSON.stringify(t)}</p>`:""}
    </div>
  `}function N(e,t=null){F.textContent=e?`Campaign ${e}`:"No campaign selected";const s=[];t!=null&&t.audienceSize&&s.push(`Audience: ${t.audienceSize.toLocaleString()} customers`),t!=null&&t.channel&&s.push(`Channel: ${t.channel}`),z.textContent=s.join(" · "),l.disabled=!e}function Y(e){const t=H(e);return t?`<div class="card campaign-info-card">${t}</div>`:""}function X(){p.innerHTML=U()}function Z(){p.innerHTML=`
    <div class="stats-empty">
      <p>Launch a campaign to view live stats here.</p>
    </div>
  `}function B(e){l.disabled=e||!f;const t=l.querySelector(".btn-label"),s=l.querySelector(".spinner");t&&s?(t.classList.toggle("hidden",e),s.classList.toggle("hidden",!e)):l.textContent=e?"Refreshing…":"Refresh stats"}async function w(e,{silent:t=!1}={}){var i,n;if(!e||h)return;!t&&!u?X():t||B(!0),h=!0;try{const a=await x(e);return p.innerHTML=Q(a),u=!0,a}catch(a){throw(!t||!u)&&(p.innerHTML=V(((i=a.data)==null?void 0:i.message)||a.message)),t||d(((n=a.data)==null?void 0:n.message)||a.message,"error"),a}finally{h=!1,B(!1)}}function D(e){b();let t=0;const s=20;m=setInterval(async()=>{t+=1;try{await w(e,{silent:!0})}catch{}t>=s&&b()},3e3)}function ee(e,t){f=e,L=t,u=!1,N(e,t),q(t),w(e),D(e)}function q(e){const t=document.getElementById("stats-campaign-info");if(!t)return;const s=Y(e);t.innerHTML=s,t.classList.toggle("hidden",!s)}T.forEach(e=>{e.addEventListener("click",()=>{S(e.dataset.view),e.dataset.view==="stats"&&L&&q(L)})});document.querySelectorAll(".chip").forEach(e=>{e.addEventListener("click",()=>{$.value=e.dataset.example,$.focus()})});l.addEventListener("click",()=>{f&&w(f)});v.addEventListener("click",async()=>{var t,s,i,n,a,o;const e=$.value.trim();if(!e){d("Please enter a campaign prompt.","error");return}P(v,!0),c.classList.add("hidden"),c.innerHTML="",b(),u=!1;try{const r=await k(e),C=((s=(t=r.campaignId)==null?void 0:t.toString)==null?void 0:s.call(t))??r.campaignId,E=J(r,e);c.classList.remove("hidden"),c.innerHTML=K(E,e),(i=document.getElementById("go-to-stats-btn"))==null||i.addEventListener("click",()=>{S("stats")}),d("Campaign launched successfully.","success"),C?(ee(C,E),S("stats")):d("Campaign started but no ID was returned — stats unavailable.","error")}catch(r){W(((n=r.data)==null?void 0:n.message)||r.message,(a=r.data)==null?void 0:a.query),d(((o=r.data)==null?void 0:o.message)||r.message,"error")}finally{P(v,!1)}});async function te(){const e=await A();I.textContent=e?"connected":"offline",I.className=e?"online":"offline",e||d("Backend is not reachable. Start the server on port 8000.","error"),N(null),Z()}te();
