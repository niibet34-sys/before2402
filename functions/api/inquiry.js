export async function onRequestPost(context) {
  const { request, env } = context;

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
  } catch {
    return new Response("Storage failed",{status:500});
  }

  if (env.MAILER) {
    const payload={name,email,organization,type,artwork,artwork_reference:artworkReference,budget,message};
    const notify=env.MAILER.fetch("https://mailer.internal/inquiry",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify(payload)
    }).then(async res=>{
      if(!res.ok) console.error("Inquiry notification failed",res.status,await res.text());
    }).catch(err=>console.error("Inquiry notification error",String(err)));

    if (context.waitUntil) context.waitUntil(notify);
    else await notify;
  }

  return Response.json({ok:true});
}
