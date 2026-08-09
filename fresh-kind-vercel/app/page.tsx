"use client";

import NextImage, { type ImageProps } from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const products = [
  { name: "Papaya Juice", flavour: "Papaya", size: "250 ML", image: "/assets/papaya-full.png", accent: "#ee8b35", note: "A sunny tropical sip with real papaya character and satisfying pulp." },
  { name: "Guava Juice", flavour: "Pink Guava", size: "250 ML", image: "/assets/guava-full.png", accent: "#75a93e", note: "Bright, fragrant guava refreshment with a smooth, pulpy finish." },
  { name: "Litchi Juice", flavour: "Litchi", size: "250 ML", image: "/assets/litchi-full.png", accent: "#df6f80", note: "Delicately floral and delightfully refreshing — a crowd favourite." },
  { name: "Chiku Juice", flavour: "Chiku", size: "250 ML", image: "/assets/chiku-full.png", accent: "#b58a5b", note: "A mellow, creamy fruit experience inspired by familiar chiku." },
  { name: "Pineapple Juice", flavour: "Pineapple", size: "250 ML", image: "/assets/pineapple-full.png", accent: "#e3ad20", note: "Tropical energy with a vibrant pineapple taste and pulpy texture." },
  { name: "Blueberry Boba", flavour: "Blueberry Blast", size: "250 ML", image: "/assets/blueberry-full.png", accent: "#7257a8", note: "A playful blueberry cocktail drink finished with chewy boba pearls." },
];

const wa = (message: string) => `https://wa.me/919741189488?text=${encodeURIComponent(message)}`;
const Image = (props: ImageProps) => <NextImage {...props} unoptimized />;
const banners = ["/assets/banner-1.png","/assets/banner-2.png","/assets/banner-3.png","/assets/banner-4.png"];

const liquidDrops = [
  { x: 3, y: 40, size: 18, speed: .55, delay: 0, shape: "drop-a" },
  { x: 96, y: 280, size: 31, speed: .72, delay: 42, shape: "drop-b" },
  { x: 8, y: 510, size: 11, speed: .48, delay: 90, shape: "drop-c" },
  { x: 91, y: 730, size: 22, speed: .82, delay: 18, shape: "drop-d" },
  { x: 4, y: 910, size: 40, speed: .64, delay: 70, shape: "drop-e" },
  { x: 97, y: 1120, size: 15, speed: .78, delay: 110, shape: "drop-a" },
  { x: 12, y: 1320, size: 26, speed: .58, delay: 24, shape: "drop-c" },
  { x: 87, y: 1510, size: 10, speed: .9, delay: 55, shape: "drop-d" },
  { x: 2, y: 1710, size: 19, speed: .69, delay: 12, shape: "drop-b" },
];
const scrollFruits = [{icon:"🍊",x:6,speed:.2,offset:160},{icon:"🥝",x:91,speed:.27,offset:680},{icon:"🥭",x:9,speed:.16,offset:1180},{icon:"🍍",x:88,speed:.22,offset:1580}];

function LiquidMotionLayer() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = layer.current;
    if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lastY = scrollY, smoothY = scrollY, velocity = 0, frame = 0;
    const drops = Array.from(node.querySelectorAll<HTMLElement>(".juice-drop"));
    const fruits = Array.from(node.querySelectorAll<HTMLElement>(".scroll-fruit"));
    const update = () => {
      const target = scrollY;
      velocity += ((target - lastY) - velocity) * .16;
      velocity = Math.max(-24, Math.min(34, velocity));
      smoothY += (target - smoothY) * .11;
      node.style.setProperty("--liquid-scroll", `${smoothY}px`);
      node.style.setProperty("--liquid-velocity", `${velocity}`);
      node.style.setProperty("--liquid-stretch", `${1 + Math.min(Math.abs(velocity) / 90, .22)}`);
      const runway = innerHeight + 420;
      drops.forEach((drop, i) => drop.style.setProperty("--drop-y", `${((smoothY * liquidDrops[i].speed + liquidDrops[i].y) % runway) - 180}px`));
      fruits.forEach((fruit,i)=>{const y=((smoothY*scrollFruits[i].speed+scrollFruits[i].offset)%runway)-210;fruit.style.setProperty("--fruit-y",`${y}px`);fruit.style.setProperty("--fruit-rot",`${y*.035}deg`)});
      lastY = target;
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <div ref={layer} className="liquid-motion" aria-hidden="true">
    <div className="liquid-ambient ambient-one"/><div className="liquid-ambient ambient-two"/>
    {liquidDrops.map((d,i)=><span key={i} className={`juice-drop ${d.shape} ${d.size>24?"feature-drop":""}`} style={{left:`${d.x}%`,top:0,width:d.size,height:d.size*1.15,"--drop-speed":d.speed,"--drop-delay":`${d.delay}px`} as React.CSSProperties}><i/></span>)}
    {scrollFruits.map((f,i)=><span key={f.icon} className={`scroll-fruit sf-${i}`} style={{left:`${f.x}%`} as React.CSSProperties}>{f.icon}</span>)}
  </div>;
}

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<(typeof products)[number] | null>(null);
  const [sent, setSent] = useState(false);
  const [slide, setSlide] = useState(0);
  const filtered = useMemo(() => filter === "All" ? products : products.filter((p) => filter === "Juices" ? !p.name.includes("Boba") : p.name.includes("Boba")), [filter]);

  useEffect(() => { document.body.style.overflow = menu || selected ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menu, selected]);
  useEffect(() => { const timer=setInterval(()=>setSlide(current=>(current+1)%banners.length),2000); return()=>clearInterval(timer); },[]);

  return (
    <main>
      <LiquidMotionLayer />
      <header className="header">
        <a href="/" className="brand" aria-label="Fresh Kind home"><Image src="/assets/logo.jpg" alt="Fresh Kind" width={88} height={66} priority /></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="/">Home</a><a href="/our-story">Our Story</a><a href="/our-juices">Our Juices</a><a href="/partnership">Partnership</a><a href="/contact">Contact</a>
        </nav>
        <div className="header-actions"><a className="text-link" href="/our-juices">Explore juices</a><a className="button small" href="/partnership">Become a partner</a></div>
        <button className="menu-button" onClick={() => setMenu(true)} aria-label="Open menu">☰</button>
      </header>

      {menu && <div className="mobile-menu"><button onClick={() => setMenu(false)} aria-label="Close menu">×</button>{[["Home","/"],["Our Story","/our-story"],["Our Juices","/our-juices"],["Partnership","/partnership"],["Contact","/contact"]].map(x => <a key={x[1]} href={x[1]} onClick={() => setMenu(false)}>{x[0]}</a>)}<a className="button" href={wa("Hi Fresh Kind, I found you through your website and would like to know more about your products.")}>WhatsApp us</a></div>}

      <section className="banner-hero liquid-zone" id="home" aria-label="Fresh Kind featured products">
        <div className="banner-stage"><Image key={banners[slide]} src={banners[slide]} alt={`Fresh Kind promotional banner ${slide+1}`} width={1774} height={887} priority={slide===0} /></div>
        <div className="banner-controls"><div className="hero-buttons"><a className="button" href="/our-juices">Explore our juices <span>↗</span></a><a className="button light" href="/partnership">Partner with us</a></div><div className="banner-dots" role="group" aria-label="Choose banner">{banners.map((_,i)=><button key={i} className={slide===i?"active":""} onClick={()=>setSlide(i)} aria-label={`Show banner ${i+1}`}/>)}</div></div>
      </section>

      <section className="marquee" aria-label="Brand promises"><div>FRESH FRUIT FLAVOURS ✦ GOODNESS IN EVERY SIP ✦ MADE FOR MORE MARKETS ✦ FRESH FRUIT FLAVOURS ✦ GOODNESS IN EVERY SIP ✦ MADE FOR MORE MARKETS ✦</div></section>

      <div className="liquid-divider orange-divider" aria-hidden="true"><span/><i/><b/></div>
      <section className="section products liquid-zone" id="juices">
        <div className="section-head"><div><p className="eyebrow">The Fresh Kind family</p><h2>Find your<br/><i>Fresh Kind.</i></h2></div><div className="section-intro"><p>From familiar classics to tropical favourites and playful boba drinks — there is a Fresh Kind for every mood.</p><div className="filters" role="group" aria-label="Filter products">{["All","Juices","Boba"].map(x=><button className={filter===x?"active":""} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></div></div>
        <div className="product-grid">{filtered.map((p, i) => <article className="product-card" key={p.name} style={{"--accent":p.accent} as React.CSSProperties}>
          <button className="product-image" onClick={()=>setSelected(p)} aria-label={`View ${p.name}`}><Image src={p.image} alt={p.name} fill sizes="(max-width: 700px) 90vw, 31vw" /></button>
          <div className="product-meta"><span>{String(i+1).padStart(2,"0")} — {p.flavour}</span><span>{p.size}</span></div><h3>{p.name}</h3><p>{p.note}</p><button className="arrow-link" onClick={()=>setSelected(p)}>Discover this flavour <span>↗</span></button>
        </article>)}</div>
        <div className="center"><a className="button outline" href="#contact">Ask for our full catalogue</a></div>
      </section>

      <div className="liquid-divider green-divider" aria-hidden="true"><span/><i/></div>
      <section className="story liquid-zone calm-liquid" id="story">
        <div className="story-photo story-campaign"><Image src="/assets/just-fruit-in-a-bottle.png" alt="Fresh Kind pineapple juice prepared with real fruit" fill sizes="50vw" /></div>
        <div className="story-copy"><p className="eyebrow">Our point of view</p><h2>Just fruit<br/>in a bottle.</h2><p className="lead">Fresh Kind began with a simple ambition: make fruit beverages people enjoy, while building a dependable portfolio for stores and partners.</p><p>From Mangalore, Karnataka, our product family continues to grow — bringing familiar fruits, tropical flavour and distinctive shelf presence to more customers and markets.</p><div className="story-points"><span>01 <b>Taste that invites another sip</b></span><span>02 <b>Variety that creates opportunity</b></span><span>03 <b>Partnerships built to grow</b></span></div></div>
      </section>

      <section className="proposition section"><p className="eyebrow">A range made to move</p><div className="section-head"><h2>More fruit.<br/>More flavours.<br/><i>More freshness.</i></h2><p>Fresh Kind brings together joyful products and serious commercial potential.</p></div><div className="feature-grid">{[["01","Fruit-first flavour","Beverages built around familiar, refreshing fruit experiences."],["02","30+ products","A growing portfolio designed for different tastes and occasions."],["03","Standout shelf presence","Distinctive bottles and bold flavour-led product presentation."],["04","Distribution ready","Created for retailers, distributors and regional partners."]].map(x=><article key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></section>

      <section className="partner liquid-zone calm-liquid" id="partner"><div className="partner-stream" aria-hidden="true"><i/><i/><i/></div><div className="partner-image market-campaign"><Image src="/assets/bring-fresh-kind-market.png" alt="Fresh Kind real fruit, real goodness product range" fill sizes="45vw" /></div><div className="partner-copy"><p className="eyebrow">A fresh opportunity</p><h2>Bring Fresh Kind<br/>to your market.</h2><p>We’re growing our distribution network and looking to work with ambitious distributors, super stockists, retailers and institutional buyers.</p><div className="partner-types"><span>Distributor</span><span>Super stockist</span><span>Retail partner</span><span>Institutional buyer</span></div><a className="button yellow" href="#contact">Start a partnership enquiry <span>↗</span></a><a className="whatsapp-link" href={wa("Hi Fresh Kind, I'm interested in becoming a Fresh Kind distribution partner. Please share the partnership details.")} target="_blank">Or talk to our team on WhatsApp →</a></div></section>

      <section className="instagram-campaign"><div className="instagram-art"><Image src="/assets/why-choose-fresh-kind.png" alt="Why choose Fresh Kind product range" width={1800} height={900} /></div><div className="instagram-action"><div><p className="eyebrow">Fresh from Instagram</p><h2>Follow the Fresh Kind journey.</h2></div><a className="button" href="https://instagram.com/fresh._kind" target="_blank" rel="noreferrer">Follow @fresh._kind <span>↗</span></a></div></section>

      <section className="contact section" id="contact"><div><p className="eyebrow">Let’s talk fresh</p><h2>Where should<br/>Fresh Kind go next?</h2><p>Products, retail supply, distribution or bulk orders — tell us what you’re looking for.</p><div className="contact-details"><a href="tel:+919741189488">+91 97411 89488</a><a href="tel:+916360321543">+91 6360 321 543</a><a href="mailto:info@fresh-kind.com">info@fresh-kind.com</a><span>Mangalore, Dakshina Kannada, Karnataka</span></div></div><form onSubmit={(e)=>{e.preventDefault(); setSent(true)}}>{sent ? <div className="success"><span>✓</span><h3>Thank you.</h3><p>Your enquiry is ready for the Fresh Kind team. For the quickest response, you can also reach us on WhatsApp.</p><a className="button" href={wa("Hi Fresh Kind, I just submitted an enquiry through your website.")}>Continue on WhatsApp</a></div> : <><label>Your name<input required name="name" placeholder="Full name" /></label><label>Phone number<input required name="phone" type="tel" placeholder="+91" /></label><label>I’m interested in<select required defaultValue=""><option value="" disabled>Select enquiry type</option><option>Product enquiry</option><option>Distributor opportunity</option><option>Super stockist opportunity</option><option>Retail supply</option><option>Bulk order</option></select></label><label>Message<textarea required rows={4} placeholder="Tell us about your market or requirement" /></label><label className="consent"><input type="checkbox" required /> I agree to be contacted by Fresh Kind about this enquiry.</label><button className="button" type="submit">Send enquiry <span>↗</span></button></>}</form></section>

      <footer><div className="footer-top"><Image src="/assets/logo.jpg" alt="Fresh Kind" width={126} height={94}/><p>Fresh fruit beverages from Mangalore, Karnataka — made for consumers and partners looking for refreshing variety.</p><div><b>Explore</b><a href="#story">Our story</a><a href="#juices">Our juices</a><a href="#partner">Partnership</a></div><div><b>Contact</b><a href="tel:+919741189488">+91 97411 89488</a><a href="tel:+916360321543">+91 6360 321 543</a><a href="mailto:info@fresh-kind.com">info@fresh-kind.com</a><a href="https://instagram.com/fresh._kind">@fresh._kind</a></div></div><div className="footer-bottom"><span>© 2026 Fresh Kind. All rights reserved.</span><span>Privacy · Terms</span><em>Goodness in every sip.</em></div></footer>

      <a className="floating-wa" href={wa("Hi Fresh Kind, I found you through your website and would like to know more about your products.")} target="_blank" aria-label="Chat with Fresh Kind on WhatsApp">◉<span>Chat with us</span></a>
      {selected && <div className="modal" role="dialog" aria-modal="true" aria-label={selected.name}><button className="modal-close" onClick={()=>setSelected(null)}>×</button><div className="modal-image" style={{background:selected.accent}}><Image src={selected.image} alt={selected.name} fill sizes="50vw" /></div><div className="modal-copy"><p className="eyebrow">{selected.flavour} · {selected.size}</p><h2>{selected.name}</h2><p>{selected.note}</p><ul><li>Distinctive fruit-led flavour</li><li>Convenient 250 ML bottle</li><li>Shake well · enjoy fresh</li></ul><a className="button" target="_blank" href={wa(`Hi Fresh Kind, I'm interested in ${selected.name}. Please share more details.`)}>Enquire on WhatsApp <span>↗</span></a><button className="arrow-link" onClick={()=>{setSelected(null); document.querySelector("#partner")?.scrollIntoView()}}>Become a distributor</button></div></div>}
    </main>
  );
}
