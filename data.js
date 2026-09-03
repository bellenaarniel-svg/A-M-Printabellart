/* ===== A&M PrintabelleArt — data layer (static, localStorage-backed) ===== */
const FX = 58.0; // 1 USD = 58 PHP (edit here)

const OWNERS = ["magellebellena@gmail.com", "bellenaarniel@gmail.com"];

const SEED_ADMINS = OWNERS.map(e => ({
  email: e, role: "owner", pass: "amprint2024", added: "2024-01-15"
}));

/* Services exactly as on the "WE OFFER" poster */
const SEED_PRODUCTS = [
  { id:"photo",   emoji:"🖼️", name:"Photo Print",             desc:"Instax-style up to A4 size. Glossy or matte premium photo paper.", unit:"per print", php:25,   stock:480 },
  { id:"sticker", emoji:"🏷️", name:"Sticker",                 desc:"Decals, labels, die-cut, waterproof vinyl and more.",              unit:"per sheet", php:75,   stock:320 },
  { id:"sintra",  emoji:"🪧", name:"Sintra Boards",            desc:"Durable PVC board printing for signage and display.",             unit:"per board", php:650,  stock:64  },
  { id:"items",   emoji:"🎁", name:"Personal Items",           desc:"Mugs, tumblers, keychains, and custom personalized giveaways.",   unit:"per item",  php:180,  stock:210 },
  { id:"invite",  emoji:"💌", name:"Invitation Cards / Ref Magnet", desc:"Birthdays, debut, weddings — with matching ref magnets.",   unit:"per pc",    php:45,   stock:150 },
  { id:"docs",    emoji:"🖨️", name:"Docs Print",               desc:"Documents, reports, forms — B/W or full color, A4 & Long.",       unit:"per page",  php:5,    stock:2000},
  { id:"book",    emoji:"📖", name:"Photo Book & Magazine",     desc:"Bound photo books and magazine layouts, softbound or hardbound.", unit:"per book",  php:950,  stock:38  },
  { id:"id",      emoji:"🪪", name:"Rush ID",                  desc:"1x1 / 2x2 / Passport size. Ready in minutes.",                    unit:"per set",   php:60,   stock:12  },
  { id:"more",    emoji:"✨", name:"And More!",                 desc:"Tarpaulins, layout design, custom requests — just message us.",   unit:"per project", php:300, stock:99 }
];

/* 2025 → 2026 monthly sales (PHP) */
const SEED_SALES = [
  { m:"Sep 25", v: 42800, o: 61 }, { m:"Oct 25", v: 51300, o: 74 },
  { m:"Nov 25", v: 68900, o: 96 }, { m:"Dec 25", v: 94500, o:132 },
  { m:"Jan 26", v: 47200, o: 68 }, { m:"Feb 26", v: 72400, o:101 },
  { m:"Mar 26", v: 58600, o: 83 }, { m:"Apr 26", v: 61900, o: 88 },
  { m:"May 26", v: 79300, o:110 }, { m:"Jun 26", v: 66700, o: 94 },
  { m:"Jul 26", v: 71500, o:103 }, { m:"Aug 26", v: 88200, o:121 }
];

const DB = {
  get(k, seed){ try{ const r = localStorage.getItem("amp_"+k); return r ? JSON.parse(r) : seed; }catch(e){ return seed; } },
  set(k, v){ try{ localStorage.setItem("amp_"+k, JSON.stringify(v)); }catch(e){} },
  admins(){ return this.get("admins", SEED_ADMINS); },
  products(){ return this.get("products", SEED_PRODUCTS); },
  sales(){ return this.get("sales", SEED_SALES); },
  orders(){ return this.get("orders", []); },
  session(){ return this.get("session", null); }
};
