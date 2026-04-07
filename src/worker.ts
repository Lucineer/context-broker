interface Env { CTX_KV: KVNamespace; DEEPSEEK_API_KEY?: string; }

const CSP: Record<string, string> = { 'default-src': "'self'", 'script-src': "'self' 'unsafe-inline' 'unsafe-eval'", 'style-src': "'self' 'unsafe-inline'", 'img-src': "'self' data: https:", 'connect-src': "'self' https://api.deepseek.com https://*" };

function json(data: unknown, s = 200) { return new Response(JSON.stringify(data), { status: s, headers: { 'Content-Type': 'application/json', ...CSP } }); }

interface GoalContext { id: string; goal: string; status: string; phase: string; vessels: string[]; events: { ts: string; vessel: string; action: string; detail?: string }[]; context: string; created: string; updated: string; }

function getLanding(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Context Broker — Cocapn</title><style>
body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e0e0e0;margin:0;min-height:100vh}
.container{max-width:800px;margin:0 auto;padding:40px 20px}
h1{color:#f472b6;font-size:2.2em}a{color:#f472b6;text-decoration:none}
.sub{color:#8A93B4;margin-bottom:2em}
.card{background:#16161e;border:1px solid #2a2a3a;border-radius:12px;padding:24px;margin:20px 0}
.card h3{color:#f472b6;margin:0 0 12px 0}
.btn{background:#f472b6;color:#0a0a0f;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold}
.btn:hover{background:#ec4899}
.btn2{background:#2a2a3a;color:#e0e0e0;border:1px solid #3a3a4a;padding:8px 16px;border-radius:8px;cursor:pointer}
textarea,input{background:#0a0a0f;color:#e0e0e0;border:1px solid #2a2a3a;border-radius:8px;padding:10px;width:100%;box-sizing:border-box}
.goal{padding:16px;background:#1a1a2a;border-left:3px solid #f472b6;margin:8px 0;border-radius:0 8px 8px 0}
.goal .phase{display:inline-block;padding:2px 8px;border-radius:4px;font-size:.8em;margin-left:8px}
.timeline{margin:12px 0;padding-left:20px;border-left:2px solid #2a2a3a}
.timeline .event{padding:6px 0;font-size:.85em;color:#8A93B4}
.timeline .event strong{color:#e0e0e0}
.phase-planning{background:#f59e0b33;color:#f59e0b}.phase-executing{background:#06b6d433;color:#06b6d4}
.phase-learning{background:#a855f733;color:#a855f7}.phase-closed{background:#22c55e33;color:#22c55e}
.phase-failed{background:#ef444433;color:#ef4444}
</style></head><body><div class="container">
<h1>🔗 Context Broker</h1><p class="sub">Unified goal-scoped context management. The thread that holds fleet execution together.</p>
<div class="card"><h3>Create Goal Context</h3>
<input id="goal" placeholder="What is the fleet trying to accomplish?">
<input id="vessels" placeholder="Involved vessels (comma-separated)" style="margin-top:8px">
<div style="margin-top:12px"><button class="btn" onclick="create()">Create Context</button></div></div>
<div class="card"><h3>Update Context</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
<input id="goalId" placeholder="Goal ID">
<select id="phase"><option value="planning">Planning</option><option value="executing">Executing</option><option value="learning">Learning</option><option value="closed">Closed</option><option value="failed">Failed</option></select>
</div>
<input id="vessel" placeholder="Vessel performing action" style="margin-top:8px">
<input id="action" placeholder="Action (e.g. decomposed, workflow-built, step-done)" style="margin-top:4px">
<textarea id="detail" rows="2" placeholder="Additional context to append..." style="margin-top:4px"></textarea>
<div style="margin-top:12px"><button class="btn" onclick="update()">Update</button>
<button class="btn2" onclick="summarize()" style="margin-left:8px">Summarize Context</button></div></div>
<div id="goalsList" class="card"><h3>Active Goal Contexts</h3><p style="color:#8A93B4">Loading...</p></div>
<script>
async function load(){try{const r=await fetch('/api/goals');const g=await r.json();const el=document.getElementById('goalsList');
if(!g.length)el.innerHTML='<h3>Active Goal Contexts</h3><p style="color:#8A93B4">No goals yet.</p>';
else el.innerHTML='<h3>Active Goal Contexts ('+g.length+')</h3>'+g.map(x=>'<div class="goal"><strong>'+x.goal.substring(0,80)+'</strong> <span class="phase phase-'+x.phase+'">'+x.phase+'</span><br><span style="color:#8A93B4;font-size:.85em">ID: '+x.id+' · '+x.vessels.join(', ')+' · '+x.events.length+' events · created '+new Date(x.created).toLocaleString()+'</span>'+(x.events.length?'<div class="timeline">'+x.events.slice(-8).map(e=>'<div class="event"><strong>'+e.vessel+'</strong>: '+e.action+(e.detail?' — '+e.detail:'')+' <span style="color:#475569">'+new Date(e.ts).toLocaleTimeString()+'</span></div>').join('')+'</div>':'')+'</div>').join('');}catch(e){}}
async function create(){const goal=document.getElementById('goal').value.trim(),vessels=document.getElementById('vessels').value.split(',').map(s=>s.trim()).filter(Boolean);
if(!goal)return;await fetch('/api/goal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goal,vessels})});
document.getElementById('goal').value='';document.getElementById('vessels').value='';load();}
async function update(){const id=document.getElementById('goalId').value.trim(),phase=document.getElementById('phase').value,
vessel=document.getElementById('vessel').value.trim(),action=document.getElementById('action').value.trim(),detail=document.getElementById('detail').value.trim();
if(!id||!vessel||!action)return;
await fetch('/api/context',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,phase,vessel,action,detail})});
document.getElementById('action').value='';document.getElementById('detail').value='';load();}
async function summarize(){const id=document.getElementById('goalId').value.trim();if(!id)return;
const r=await fetch('/api/summarize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
const p=await r.json();if(p.summary)alert(p.summary);else alert(p.error||'No summary');}
load();</script>
<div style="text-align:center;padding:24px;color:#475569;font-size:.75rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> · <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>
</div></body></html>`;
}

async function callLLM(key: string, system: string, user: string, max = 800): Promise<string> {
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: max, temperature: 0.3 })
  });
  return (await resp.json()).choices?.[0]?.message?.content || '';
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/health') return json({ status: 'ok', vessel: 'context-broker' });
    if (url.pathname === '/vessel.json') return json({ name: 'context-broker', type: 'cocapn-vessel', version: '1.0.0', description: 'Unified goal-scoped context management for fleet execution', fleet: 'https://the-fleet.casey-digennaro.workers.dev', capabilities: ['context-management', 'goal-scoping', 'execution-thread'] });

    if (url.pathname === '/api/goals') return json((await env.CTX_KV.get('goals', 'json') as GoalContext[] || []).slice(0, 20));
    if (url.pathname === '/api/goal' && req.method === 'POST') {
      const { goal, vessels } = await req.json() as { goal: string; vessels: string[] };
      if (!goal) return json({ error: 'goal required' }, 400);
      const goals = await env.CTX_KV.get('goals', 'json') as GoalContext[] || [];
      const ctx: GoalContext = {
        id: Date.now().toString().substring(-8), goal: goal.substring(0, 500),
        status: 'active', phase: 'planning', vessels: (vessels || []).slice(0, 10).map((v: string) => v.trim()),
        events: [], context: goal, created: new Date().toISOString(), updated: new Date().toISOString()
      };
      goals.unshift(ctx);
      if (goals.length > 100) goals.length = 100;
      await env.CTX_KV.put('goals', JSON.stringify(goals));
      return json({ created: true, id: ctx.id });
    }

    if (url.pathname === '/api/context' && req.method === 'POST') {
      const { id, phase, vessel, action, detail } = await req.json() as { id: string; phase?: string; vessel: string; action: string; detail?: string };
      const goals = await env.CTX_KV.get('goals', 'json') as GoalContext[] || [];
      const ctx = goals.find((g: GoalContext) => g.id === id);
      if (!ctx) return json({ error: 'goal not found' }, 404);
      if (phase) ctx.phase = phase;
      if (phase === 'closed' || phase === 'failed') ctx.status = phase;
      ctx.events.push({ ts: new Date().toISOString(), vessel: vessel.substring(0, 50), action: action.substring(0, 100), detail: detail?.substring(0, 300) });
      if (ctx.events.length > 200) ctx.events = ctx.events.slice(-200);
      if (detail) ctx.context += '\n' + detail;
      if (ctx.context.length > 5000) ctx.context = ctx.context.substring(ctx.context.length - 5000);
      ctx.updated = new Date().toISOString();
      await env.CTX_KV.put('goals', JSON.stringify(goals));
      return json({ updated: true });
    }

    if (url.pathname === '/api/summarize' && req.method === 'POST') {
      const { id } = await req.json() as { id: string };
      const goals = await env.CTX_KV.get('goals', 'json') as GoalContext[] || [];
      const ctx = goals.find((g: GoalContext) => g.id === id);
      if (!ctx) return json({ error: 'goal not found' }, 404);
      if (ctx.events.length < 2) return json({ summary: ctx.goal });
      if (env.DEEPSEEK_API_KEY) {
        const eventStr = ctx.events.map(e => `[${e.vessel}] ${e.action}${e.detail ? ': ' + e.detail : ''}`).join('\n');
        const summary = await callLLM(env.DEEPSEEK_API_KEY,
          'Summarize this fleet execution into 2-3 sentences. What was accomplished? What is the current state?',
          `Goal: ${ctx.goal}\n\nExecution:\n${eventStr}`, 300);
        ctx.context = `## Summary\n${summary.trim()}\n\n## Events\n${eventStr}`;
        ctx.updated = new Date().toISOString();
        await env.CTX_KV.put('goals', JSON.stringify(goals));
        return json({ summary: summary.trim() });
      }
      return json({ summary: `Goal: ${ctx.goal}. ${ctx.events.length} events. Phase: ${ctx.phase}.` });
    }

    return new Response(getLanding(), { headers: { 'Content-Type': 'text/html;charset=UTF-8', ...CSP } });
  }
};
