// ===== 你的 Apps Script Web App 地址 =====
const SHEETS_API = 'https://script.google.com/macros/s/你的部署URL/exec';

// ===== 分步切换（很轻）=====
const steps = Array.from(document.querySelectorAll('.step'));
const dots  = Array.from(document.querySelectorAll('.wizard-steps .dot'));
let current = 0;
function goStep(i){
  current = Math.max(0, Math.min(steps.length - 1, i));
  steps.forEach((s,idx)=> s.classList.toggle('is-active', idx === current));
  dots.forEach((d,idx)=> d.classList.toggle('is-active', idx === current));
  syncSubmitEnabled();
}
document.addEventListener('click', (ev)=>{
  if (ev.target.matches('[data-next]')) goStep(current+1);
  if (ev.target.matches('[data-prev]')) goStep(current-1);
});

// ===== 表单序列化 & 语言/UA/来源 =====
function getCurrentLang(){
  const active = document.querySelector('.langs .lang.is-active');
  return active ? active.dataset.lang : (document.documentElement.dataset.lang || 'en');
}
function formToJSON(form){
  const fd = new FormData(form), out = {};
  for (const [k,v] of fd.entries()){
    if (k.endsWith('[]')) { (out[k.slice(0,-2)] ||= []).push(v); }
    else if (out[k] !== undefined) { out[k] = Array.isArray(out[k]) ? out[k].concat(v) : [out[k], v]; }
    else { out[k] = v; }
  }
  out.lang = getCurrentLang();
  out.user_agent = navigator.userAgent || '';
  out.referer = location.href;
  return out;
}

// ===== 多选字段：没勾选也发 []，避免列右移 =====
const MULTI_KEYS = [
  'lang_qual','interests','goals','task_prefs','obstacles',
  'weekly_pattern','devices','channels','supports','env_life'
];
function normalizeArrays(data){
  for (const k of MULTI_KEYS) {
    if (!Array.isArray(data[k])) data[k] = data[k] ? [data[k]] : [];
  }
  return data;
}

// ===== 同意才可提交（且仅在最后一步启用按钮）=====
const consent   = document.getElementById('consent');
const btnSubmit = document.getElementById('btn-submit');
function syncSubmitEnabled(){
  if (btnSubmit && consent) btnSubmit.disabled = !consent.checked || (current !== steps.length-1);
}
if (consent) consent.addEventListener('change', syncSubmitEnabled);

// ===== 提交 =====
async function submit(){
  const form = document.getElementById('intake');
  const data = normalizeArrays(formToJSON(form));
  document.getElementById('out').textContent = JSON.stringify(data, null, 2);

  btnSubmit.disabled = true;
  btnSubmit.textContent = (getCurrentLang()==='cn'?'提交中…': getCurrentLang()==='jp'?'送信中…':'Submitting…');
  try {
    const res = await fetch(SHEETS_API, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 简单请求，避免预检
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(()=>({}));
    if (!res.ok || json.ok === false) throw new Error(json.error || ('HTTP '+res.status));

    showFeedback(
      getCurrentLang()==='cn'?'提交成功，感谢参与。': getCurrentLang()==='jp'?'送信完了。ありがとう。':'Submitted successfully. Thank you.',
      true
    );
  } catch (err) {
    showFeedback(
      (getCurrentLang()==='cn'?'提交失败，请重试或联系维护者。': getCurrentLang()==='jp'?'送信に失敗。再試行するか連絡してくれ。':'Submission failed. Please try again or contact us.')
      + ' ' + String(err), false
    );
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = (getCurrentLang()==='cn'?'提交': getCurrentLang()==='jp'?'送信':'Submit');
  }
}
function showFeedback(msg, ok){
  const el = document.getElementById('feedback');
  el.hidden = false;
  el.className = 'result-card ' + (ok ? 'ok' : 'err');
  el.textContent = msg;
}
if (btnSubmit) btnSubmit.addEventListener('click', submit);

// 初始化到第 1 步
goStep(0);
