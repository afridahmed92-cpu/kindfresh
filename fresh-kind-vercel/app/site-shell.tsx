"use client";

import { useEffect, useRef, useState } from "react";

const nav = [["Home","/"],["Our Story","/our-story"],["Our Juices","/our-juices"],["Partnership","/partnership"],["Contact","/contact"]];
const fruit = [{icon:"🍊",x:7,s:.11,r:22},{icon:"🥭",x:87,s:.16,r:-18},{icon:"🍍",x:14,s:.08,r:12},{icon:"🥝",x:76,s:.13,r:30},{icon:"🍓",x:93,s:.1,r:-25}];
const drops = [{x:5,s:.28,z:19},{x:22,s:.4,z:9},{x:39,s:.19,z:30},{x:58,s:.34,z:13},{x:71,s:.23,z:24},{x:89,s:.38,z:11},{x:49,s:.46,z:7}];

export function ScrollJuice({accent="#f19a38"}:{accent?:string}) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const el=ref.current;if(!el||matchMedia("(prefers-reduced-motion: reduce)").matches)return;let sy=scrollY,last=scrollY,vel=0,id=0;const tick=()=>{vel+=((scrollY-last)-vel)*.14;vel=Math.max(-20,Math.min(32,vel));sy+=(scrollY-sy)*.1;el.querySelectorAll<HTMLElement>("[data-speed]").forEach((n,i)=>{const speed=Number(n.dataset.speed);const offset=(sy*speed+(i*137))%(innerHeight+380)-190;n.style.setProperty("--fall",`${offset}px`);n.style.setProperty("--stretch",`${1+Math.abs(vel)/105}`)});last=scrollY;id=requestAnimationFrame(tick)};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id)},[]);
  return <div className="page-liquid" ref={ref} style={{"--page-accent":accent} as React.CSSProperties} aria-hidden="true">
    {drops.map((d,i)=><i key={`d${i}`} className={`page-drop pd-${i}`} data-speed={d.s} style={{left:`${d.x}%`,width:d.z,height:d.z*1.25}}><b/></i>)}
    {fruit.map((f,i)=><span key={`f${i}`} className="falling-fruit" data-speed={f.s} style={{left:`${f.x}%`,"--fruit-rotate":`${f.r}deg`} as React.CSSProperties}>{f.icon}</span>)}
  </div>
}

export function SiteHeader(){const [open,setOpen]=useState(false);return <><header className="header"><a href="/" className="brand"><img src="/assets/logo.jpg" alt="Fresh Kind"/></a><nav className="desktop-nav">{nav.map(x=><a href={x[1]} key={x[1]}>{x[0]}</a>)}</nav><div className="header-actions"><a className="button small" href="/partnership">Become a partner</a></div><button className="menu-button" onClick={()=>setOpen(true)} aria-label="Open menu">☰</button></header>{open&&<div className="mobile-menu"><button onClick={()=>setOpen(false)}>×</button>{nav.map(x=><a key={x[1]} href={x[1]}>{x[0]}</a>)}</div>}</>}

export function SiteFooter(){return <footer><div className="footer-top"><img src="/assets/logo.jpg" alt="Fresh Kind" width="126"/><p>Fresh fruit beverages from Mangalore, Karnataka — made for consumers and partners looking for refreshing variety.</p><div><b>Explore</b>{nav.slice(1).map(x=><a href={x[1]} key={x[1]}>{x[0]}</a>)}</div><div><b>Contact</b><a href="tel:+919741189488">+91 97411 89488</a><a href="tel:+916360321543">+91 6360 321 543</a><a href="mailto:info@fresh-kind.com">info@fresh-kind.com</a><a href="https://instagram.com/fresh._kind">@fresh._kind</a></div></div><div className="footer-bottom"><span>© 2026 Fresh Kind.</span><em>Goodness in every sip.</em></div></footer>}

export function PageShell({children,accent}:{children:React.ReactNode;accent?:string}){return <main><ScrollJuice accent={accent}/><SiteHeader/>{children}<SiteFooter/><a className="floating-wa" href="https://wa.me/919741189488" target="_blank">◉<span>Chat with us</span></a></main>}
