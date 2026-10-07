export async function onRequestPost({request,env}) {
  let d;
  try { d = await request.json(); } catch { return new Response("Bad request",{status:400}); }

  const clean=(v,max=5000)=>String(v||"").trim().slice(0,max);
  const name=clean(d.name,200);
  const email=clean(d.email,320);
  const message=clean(d.message,5000);
  const organization=clean(d.organization,300);
  const type=clean(d.type||"Inquiry",100);
  const artwork=clean(d.artwork||"General inquiry",200);
  const artworkReference=clean(d.artwork_reference,200);
  const budget=clean(d.budget,200);
  const honeypot=clean(d.website,200);

  if (honeypot) return Response.json({ok:true});
  if (!name || !email || !message || !email.includes("@")) return new Response("Missing fields",{status:400});
  if (!env.DB) return new Response("Inquiry service not configured",{status:503});

  const ua=(request.headers.get("user-agent")||"").slice(0,500);
  try {
    await env.DB.prepare(
      "INSERT INTO inquiries (name,email,organization,inquiry_type,artwork,artwork_reference,budget,message,user_agent,status) VALUES (?,?,?,?,?,?,?,?,?,?)"
    ).bind(name,email,organization,type,artwork,artworkReference,budget,message,ua,"new").run();
  } catch (e) {
    return new Response("Storage failed",{status:500});
  }

  if (env.RESEND_API_KEY && env.INQUIRY_TO_EMAIL && env.INQUIRY_FROM_EMAIL) {
    const html=`<h2>${esc(type)} — ${esc(artworkReference||artwork)}</h2><p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}<br><b>Organization:</b> ${esc(organization||"—")}<br><b>Budget / offer:</b> ${esc(budget||"—")}</p><p>${esc(message).replace(/\n/g,"<br>")}</p>`;
    try {
      await fetch("https://api.resend.com/emails",{
        method:"POST",
        headers:{authorization:`Bearer ${env.RESEND_API_KEY}`,"content-type":"application/json"},
        body:JSON.stringify({
          from:env.INQUIRY_FROM_EMAIL,
          to:[env.INQUIRY_TO_EMAIL],
          reply_to:email,
          subject:`BEFORE 24.02 — ${type} — ${artworkReference||artwork}`,
          html
        })
      });
    } catch {}
  }

  return Response.json({ok:true});
}
function esc(s){return String(s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
