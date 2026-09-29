(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s);};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
var reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- WhatsApp / contact wiring ----------
   Homepage is static (not run through bluezone.js's router), so the
   WhatsApp number is mirrored here from CONFIG.whatsapp in js/bluezone.js.
   Update both places together — see src/docs/PLACEHOLDERS.md. */
var BZ_WHATSAPP='920000000001'; /* DUMMY — see src/docs/PLACEHOLDERS.md */
var waHref='https://wa.me/'+BZ_WHATSAPP;
['fab-wa','cta-whatsapp'].forEach(function(id){var el=document.getElementById(id); if(el) el.setAttribute('href',waHref);});

/* ---------- Year ---------- */
var yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();

/* ---------- Header scroll state ---------- */
var header=document.getElementById('site-header');
function onScroll(){
  if(!header) return;
  if(window.scrollY>8) header.classList.add('scrolled'); else header.classList.remove('scrolled');
}
document.addEventListener('scroll',onScroll,{passive:true}); onScroll();

/* ---------- Dropdown (desktop) ---------- */
$$('.has-menu').forEach(function(li){
  var btn=$('.nl',li);
  btn.addEventListener('click',function(){
    var open=li.classList.toggle('open');
    btn.setAttribute('aria-expanded',open?'true':'false');
  });
});
document.addEventListener('click',function(e){
  $$('.has-menu.open').forEach(function(li){
    if(!li.contains(e.target)){ li.classList.remove('open'); $('.nl',li).setAttribute('aria-expanded','false'); }
  });
});

/* ---------- Mobile drawer ---------- */
var menuBtn=$('.menu-btn'), drawer=document.getElementById('mobile-drawer');
if(menuBtn&&drawer){
  menuBtn.addEventListener('click',function(){
    var open=drawer.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',open?'true':'false');
    document.body.style.overflow=open?'hidden':'';
  });
  $$('.drawer .d-link, .drawer .d-cta a, .drawer .sub a').forEach(function(a){
    a.addEventListener('click',function(){ drawer.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; });
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && drawer.classList.contains('open')){
      drawer.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; menuBtn.focus();
    }
  });
  window.addEventListener('resize',function(){
    if(window.innerWidth>1180 && drawer.classList.contains('open')){
      drawer.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); document.body.style.overflow='';
    }
  });
}

/* ---------- Scroll reveal ---------- */
var rvEls=$$('.rv');
if('IntersectionObserver' in window && !reduced){
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  rvEls.forEach(function(el){ io.observe(el); });
}else{
  rvEls.forEach(function(el){ el.classList.add('in'); });
}

/* ---------- Counters ---------- */
function animateCount(el){
  var target=parseInt(el.getAttribute('data-count'),10)||0;
  var suffix=el.getAttribute('data-suffix')||'';
  if(reduced){ el.textContent=target+suffix; return; }
  var dur=850, start=null;
  function step(ts){
    if(!start) start=ts;
    var p=Math.min(1,(ts-start)/dur);
    var eased=1-Math.pow(1-p,3);
    el.textContent=Math.round(eased*target)+suffix;
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
var statEls=$$('.stat .num');
if('IntersectionObserver' in window){
  var io2=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ animateCount(en.target); io2.unobserve(en.target); }
    });
  },{threshold:.4});
  statEls.forEach(function(el){ io2.observe(el); });
}else{ statEls.forEach(animateCount); }

/* ================= PATH FINDER ================= */
(function(){
  var root=document.getElementById('pathfinder'); if(!root) return;
  var body=document.getElementById('pf-body'), bar=document.getElementById('pf-bar-i'), stepsEl=document.getElementById('pf-steps');
  var steps=['field','dest','level','priority'];
  var state={field:null,dest:null,level:null,priority:null};
  var i=0;

  var FIELD=[
    ['Medicine','stethoscope'],['Dentistry','smile'],['Engineering','cog'],
    ['Business','briefcase'],['IT & Computing','cpu'],['Other','more']
  ];
  var DEST=[['China','🇨🇳'],['Italy','🇮🇹'],['United Kingdom','🇬🇧'],['Lithuania','🇱🇹'],['France','🇫🇷'],['Cyprus','🇨🇾']];
  var LEVEL=[['Bachelor','grad-cap'],['Master','grad-cap'],['PhD','grad-cap']];
  var PRI=[['Affordability','wallet'],['Scholarship chances','award'],['Fast processing','clock'],['Program reputation','star']];

  var ICON={
    stethoscope:'<path d="M4 3v6a4 4 0 0 0 8 0V3"/><path d="M8 13v2a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="10" r="2"/>',
    smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    cog:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.13.36.37.68.7.9.29.2.63.31 1 .33H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
    briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    cpu:'<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
    more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    'grad-cap':'<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/>',
    wallet:'<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h3v-4Z"/>',
    award:'<circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 7 21l5-2.5L17 21l-1.5-8.5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2l-5-4.9 6.9-1L12 2Z"/>'
  };
  function icon(name){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(ICON[name]||ICON.more)+'</svg>'; }

  function renderStepIndicator(){
    $$('li',stepsEl).forEach(function(li,idx){
      li.classList.toggle('active',idx===i);
      li.classList.toggle('done',idx<i);
    });
    bar.style.width=(i/steps.length*100)+'%';
  }

  function optRow(list,key,withIcon){
    return '<div class="pf-opts" role="group">'+list.map(function(item){
      var label=item[0], meta=item[1];
      var pressed=state[key]===label;
      var iconHtml = withIcon ? '<span class="ic">'+icon(meta)+'</span>' : '<span style="font-size:20px">'+meta+'</span>';
      return '<button type="button" class="pf-opt" aria-pressed="'+pressed+'" data-val="'+label+'">'+iconHtml+'<span>'+label+'</span></button>';
    }).join('')+'</div>';
  }

  function render(){
    renderStepIndicator();
    var html='';
    if(i===0){
      html='<div class="pf-step"><h3 class="pf-q">What do you want to study?</h3><p class="pf-hint">Choose the field closest to your interest.</p>'+optRow(FIELD,'field',true)+
      '<div class="pf-nav"><button class="pf-back" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Back</button><span></span></div></div>';
    }else if(i===1){
      html='<div class="pf-step"><h3 class="pf-q">Preferred destination?</h3><p class="pf-hint">Pick a country, or come back to compare later.</p>'+optRow(DEST,'dest',false)+
      '<div class="pf-nav"><button class="pf-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Back</button><span></span></div></div>';
    }else if(i===2){
      html='<div class="pf-step"><h3 class="pf-q">Study level?</h3><p class="pf-hint">Choose the degree you plan to apply for.</p>'+optRow(LEVEL,'level',true)+
      '<div class="pf-nav"><button class="pf-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Back</button><span></span></div></div>';
    }else if(i===3){
      html='<div class="pf-step"><h3 class="pf-q">What matters most?</h3><p class="pf-hint">We\'ll weigh this first when suggesting a plan.</p>'+optRow(PRI,'priority',true)+
      '<div class="pf-nav"><button class="pf-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Back</button><span></span></div></div>';
    }else{
      var destSlug={China:'study-in-china.html',Italy:'study-in-italy.html','United Kingdom':'study-in-uk.html',Lithuania:'study-in-lithuania.html',France:'study-in-france.html',Cyprus:'study-in-cyprus.html'};
      var link=destSlug[state.dest]||'destinations.html';
      html='<div class="pf-step pf-result"><span class="eyebrow">Your starting plan</span><h4>Ready for a personalized shortlist</h4>'+
      '<div class="pf-summary">'+
        '<span><small>Field</small><b>'+(state.field||'—')+'</b></span>'+
        '<span><small>Destination</small><b>'+(state.dest||'Open to options')+'</b></span>'+
        '<span><small>Level</small><b>'+(state.level||'—')+'</b></span>'+
        '<span><small>Priority</small><b>'+(state.priority||'—')+'</b></span>'+
      '</div>'+
      '<p>Bring this summary to your free consultation and a counselor will turn it into a real university shortlist — matched to your academics and budget.</p>'+
      '<div class="row"><a class="btn btn-primary" href="contact.html">Get Personalized Guidance<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>'+
      '<a class="btn btn-outline" href="'+link+'">See '+(state.dest||'Destinations')+'</a></div>'+
      '<div class="pf-nav"><button class="pf-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Start over</button><span></span></div></div>';
      bar.style.width='100%';
    }
    body.innerHTML=html;
    var back=$('.pf-back',body);
    if(back) back.addEventListener('click',function(){ if(i>steps.length-1){ state={field:null,dest:null,level:null,priority:null}; i=0; } else { i=Math.max(0,i-1); } render(); });
    $$('.pf-opt',body).forEach(function(btn){
      btn.addEventListener('click',function(){
        state[steps[i]]=btn.getAttribute('data-val');
        i++; render();
      });
    });
  }
  render();
})();

/* ================= JOURNEY STEPPER ================= */
(function(){
  var track=document.getElementById('j-track'); if(!track) return;
  var fill=document.getElementById('j-fill'), n=document.getElementById('j-n'), copy=document.getElementById('j-copy');
  var DATA=[
    ['01','Counseling','A free, no-obligation session to understand your academics, budget and goals — and map out realistic destinations.'],
    ['02','Shortlisting','Universities matched against your profile, budget and city preferences, so every option is genuinely within reach.'],
    ['03','Application','Forms, documents and fees prepared and filed through the correct channel, tracked until a decision arrives.'],
    ['04','Offer','Your admission letter arrives — we review conditions with you and plan the next steps together.'],
    ['05','Visa','Documentation, financial evidence and interview preparation, guided step by step. Outcomes rest with the embassy.'],
    ['06','Departure','Pre-departure briefing, travel planning and arrival support — so day one abroad feels planned, not improvised.']
  ];
  var btns=$$('.j-step',track);
  function go(idx){
    btns.forEach(function(b,bi){
      b.classList.toggle('on',bi===idx);
      b.classList.toggle('past',bi<idx);
      b.setAttribute('aria-selected',bi===idx?'true':'false');
    });
    fill.style.width=(idx/(DATA.length-1)*100)+'%';
    n.textContent=DATA[idx][0];
    copy.innerHTML='<h4>'+DATA[idx][1]+'</h4><p>'+DATA[idx][2]+'</p>';
  }
  btns.forEach(function(b,idx){ b.addEventListener('click',function(){ go(idx); }); });
  go(0);
})();

/* ================= STORY SLIDER ================= */
(function(){
  var vp=document.getElementById('story-viewport'); if(!vp) return;
  var prev=document.getElementById('st-prev'), next=document.getElementById('st-next');
  function amount(){ var card=vp.querySelector('.story'); return card ? card.offsetWidth+20 : 300; }
  function update(){
    prev.disabled = vp.scrollLeft<=4;
    next.disabled = vp.scrollLeft+vp.clientWidth >= vp.scrollWidth-4;
  }
  prev.addEventListener('click',function(){ vp.scrollBy({left:-amount(),behavior:'smooth'}); });
  next.addEventListener('click',function(){ vp.scrollBy({left:amount(),behavior:'smooth'}); });
  vp.addEventListener('scroll',update,{passive:true});
  update();
})();

/* ================= FAQ ACCORDION ================= */
(function(){
  var acc=document.getElementById('faq-acc'); if(!acc) return;
  $$('.acc-item',acc).forEach(function(item){
    var q=$('.acc-q',item);
    q.addEventListener('click',function(){
      var willOpen=!item.classList.contains('open');
      $$('.acc-item',acc).forEach(function(o){ o.classList.remove('open'); $('.acc-q',o).setAttribute('aria-expanded','false'); });
      if(willOpen){ item.classList.add('open'); q.setAttribute('aria-expanded','true'); }
    });
  });
})();

/* ================= OFFICES / MAP SWITCH ================= */
(function(){
  var list=document.getElementById('office-list'); if(!list) return;
  var frame=document.getElementById('map-frame');
  $$('.office[data-q]',list).forEach(function(btn){
    btn.addEventListener('click',function(){
      $$('.office',list).forEach(function(o){ o.classList.remove('sel'); });
      btn.classList.add('sel');
      var q=btn.getAttribute('data-q'), title=btn.getAttribute('data-title');
      frame.src='https://www.google.com/maps?q='+q+'&output=embed';
      frame.title='Map: '+title;
    });
  });
})();

/* ================= UNIVERSITY SEARCH (honest no-results state) ================= */
(function(){
  var btn=document.getElementById('u-search'); if(!btn) return;
  btn.addEventListener('click',function(){
    var state=document.querySelector('.uni-state');
    if(state){ state.scrollIntoView({behavior: reduced?'auto':'smooth',block:'center'}); }
  });
})();

})();
