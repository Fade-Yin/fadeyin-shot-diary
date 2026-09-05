'use strict';

// BYO endpoint and key. No credentials or request/response bodies are logged or persisted.
function normalizeEndpoint(value) {
  let url;
  try { url = new URL(String(value || '').trim()); } catch { throw new Error('API 地址无效'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) throw new Error('远程 API 必须使用 HTTPS；本机服务可用 HTTP');
  if (url.username || url.password || url.search || url.hash) throw new Error('API 地址不能包含账号、密钥、查询参数或锚点');
  url.pathname = url.pathname.replace(/\/+$/, '');
  if (!url.pathname.endsWith('/chat/completions')) url.pathname += '/chat/completions';
  return url.href;
}

async function requestAI(options, signal) {
  const endpoint = normalizeEndpoint(options.endpoint);
  const key = String(options.key || '').trim(), model = String(options.model || '').trim();
  if (!model || model.length > 200 || /[\r\n]/.test(model)) throw new Error('请填写有效模型名称');
  if (key.length > 2000 || /[\r\n]/.test(key)) throw new Error('API Key 格式无效');
  const messages = options.messages;
  if (!Array.isArray(messages) || messages.length > 4) throw new Error('无效的 AI 请求');
  const body = JSON.stringify({ model, messages, stream: false });
  if (body.length > 6000000) throw new Error('单次请求画面过大');
  let response;
  try {
    response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body, signal, redirect: 'error', credentials: 'omit' });
  } catch (error) {
    if (signal?.aborted) throw new Error('AI 请求已取消或超时');
    throw new Error('无法连接 API，请检查地址、网络或服务是否可用（不跟随重定向）');
  }
  if (!response.ok) { await response.body?.cancel(); throw new Error(`API 返回 HTTP ${response.status}，请检查密钥、模型权限、额度或限流`); }
  const reader = response.body.getReader();
  const parts = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 2000000) { await reader.cancel(); throw new Error('API 返回内容过大'); } parts.push(Buffer.from(value)); }
  let data;
  try { data = JSON.parse(Buffer.concat(parts).toString('utf8')); } catch { throw new Error('API 未返回有效 JSON'); }
  const message = data.choices?.[0]?.message;
  if (message?.refusal) throw new Error('模型拒绝了本次请求');
  const content = message?.content;
  const text = typeof content === 'string' ? content : Array.isArray(content) ? content.map(p => p.text || '').join('') : '';
  if (!text.trim()) throw new Error('模型未返回分析文本，请确认支持 Chat Completions 与图片输入');
  return text;
}

module.exports = { normalizeEndpoint, requestAI };
