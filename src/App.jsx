import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CLASS CONSENT  (IFRS16 Maintained Schools Finance Lease Class Consent 2024)
// ─────────────────────────────────────────────────────────────────────────────
const CLASS_CONSENT = [
  { id:"ict",      label:"IT Equipment",                     leaseAllowed:true,  note:"Class Consent §2", maxYears:5,  ledSavings:false, examples:["Laptops","Tablets","Desktop computers","Printers","Photocopiers","Servers","Door entry systems","CCTV","Whiteboards","Touch screen boards"] },
  { id:"telephony",label:"Telephony",                        leaseAllowed:true,  note:"Class Consent §3", maxYears:5,  ledSavings:false, examples:["Mobile phones","Landline phones","Telephone systems"] },
  { id:"catering", label:"Catering & Cleaning Equipment",    leaseAllowed:true,  note:"Class Consent §4", maxYears:5,  ledSavings:false, examples:["Tills","Water coolers","Dishwashers","Washing machines","Ovens","Fridges","Freezers","Water boilers"] },
  { id:"furniture",label:"Furniture",                        leaseAllowed:true,  note:"Class Consent §5", maxYears:5,  ledSavings:false, examples:["Desks","Tables","Chairs"] },
  { id:"bathroom", label:"Bathroom & Sanitary Items",        leaseAllowed:true,  note:"Class Consent §6", maxYears:5,  ledSavings:false, examples:["Hand dryers","Towel dispensers","Sanitary bins"] },
  { id:"gym",      label:"Gym Equipment",                    leaseAllowed:true,  note:"Class Consent §7", maxYears:5,  ledSavings:false, examples:["Treadmills","Free weights","Rowing machines","Exercise bikes"] },
  { id:"grounds",  label:"Groundskeeping Equipment",         leaseAllowed:true,  note:"Class Consent §8", maxYears:5,  ledSavings:false, examples:["Lawn mowers","String trimmers","Leaf blowers","Salt spreaders"] },
  { id:"led",      label:"LED Lighting Systems",             leaseAllowed:true,  note:"Class Consent §9 — DfE sourcing required", maxYears:7, ledSavings:true, ledNote:true, examples:["Lightbulbs","Control mechanisms","Control panels"] },
  { id:"vehicles", label:"Minibuses & Vehicles",             leaseAllowed:true,  note:"Class Consent §10",maxYears:5,  ledSavings:false, examples:["Minibuses","School vehicles"] },
  { id:"modular",  label:"Temporary Classrooms & Structures",leaseAllowed:true,  note:"Class Consent §11 — land lease requires separate consent", maxYears:10, ledSavings:false, examples:["Temporary classrooms","Equivalent structures"] },
  { id:"other",    label:"Other (Not on Class Consent)",     leaseAllowed:false, note:"CapEx only — not covered by IFRS16 Class Consent 2024", maxYears:0, ledSavings:false, examples:[] },
];


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt   = n => `£${Number(n||0).toLocaleString()}`;
const fmtk  = n => n>=1000?`£${(n/1000).toFixed(1)}k`:`£${Number(n||0)}`;
const AY_START = 2025;
const ayLabel  = yr => `${yr}–${String(yr+1).slice(2)}`;

// Excel: -PMT(8%, years, capital, 0, 1)
// type=1 → payments at the BEGINNING of each period (annuity-due)
// Annuity-due PMT = [PV × r / (1 − (1+r)^−n)] / (1+r)
// Negated because Excel PMT returns a negative value for outflows.
const calcLease = (capital, years) => {
  if(!capital||!years) return {annual:0,monthly:0};
  const r = 0.0875;                                      // annual rate
  const n = years;                                       // number of annual payments
  const annuityImmediate = (capital * r) / (1 - Math.pow(1 + r, -n));
  const annual  = Math.round(annuityImmediate / (1 + r)); // type=1 adjustment
  const monthly = Math.round(annual / 12);
  return { annual, monthly };
};

const buildSchedule = (capital, years, startYear=AY_START) => {
  const {annual} = calcLease(capital, years);
  return Array.from({length:years},(_,i)=>({label:ayLabel(startYear+i), payment:annual}));
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGO  (base64 embedded — will be replaced by script)
// ─────────────────────────────────────────────────────────────────────────────
// Logo rendered as inline SVG — matches Room Twelve brand (grey wordmark + blue door/12)
const Logo = ({ height=32, light=true }) => {
  const grey  = light ? "#fff"     : "#6b6b6b";
  const blue  = light ? "#fff"     : "#3a6ea8";
  const small = light ? "rgba(255,255,255,0.75)" : "#8a8a8a";
  const h = height;
  const w = Math.round(h * 3.2);
  return (
    <svg width={w} height={h} viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
      {/* ROOM wordmark */}
      <text x="2" y="28" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="900" letterSpacing="2" fill={grey}>ROOM</text>
      {/* TWELVE LTD */}
      <text x="2" y="42" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="700" letterSpacing="3.5" fill={small}>TWELVE LTD</text>
      {/* Divider */}
      <line x1="90" y1="6" x2="90" y2="44" stroke={blue} strokeWidth="2"/>
      {/* Blue door shape */}
      <rect x="96" y="8" width="20" height="34" rx="1" fill={blue}/>
      <rect x="99" y="11" width="14" height="28" rx="1" fill={light?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.2)"}/>
      <rect x="109" y="22" width="2.5" height="5" rx="1" fill="#fff"/>
      {/* 12 */}
      <text x="120" y="36" fontFamily="Arial,sans-serif" fontSize="28" fontWeight="900" fill={blue}>12</text>
    </svg>
  );
};



// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --b:#3a6ea8; --bd:#2d5585; --navy:#1e3558; --sky:#4a8ec2;
    --sl:#ddeaf5; --sx:#f0f6fb; --white:#fff; --bg:#f4f7fb;
    --brd:rgba(58,110,168,0.18);
    --t:#1e3558; --t2:#4a5f78; --t3:#8da3bc;
    --amber:#d48a0a; --al:#fef5e4;
    --red:#c0392b; --rl:#fdf0ee;
    --green:#2d7d5a; --gl:#e6f5ee;
    --purple:#6b4fa0; --pl:#f0ebfa;
    --r:12px; --rs:8px; --font:'Open Sans',sans-serif;
  }
  body{font-family:var(--font);background:var(--bg);color:var(--t)}
  .app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);padding-bottom:82px;font-family:var(--font)}

  /* ── Topbar ── */
  .topbar{background:var(--b);padding:0 16px;height:56px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;box-shadow:0 2px 8px rgba(30,53,88,0.18)}
  .role-pill{font-size:10px;font-weight:700;background:rgba(255,255,255,0.18);color:#fff;padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.25)}
  .av{width:30px;height:30px;border-radius:50%;background:var(--navy);border:2px solid rgba(255,255,255,0.3);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800}
  .sub-hdr{background:var(--navy);padding:5px 16px;display:flex;justify-content:space-between;align-items:center}
  .sub-hdr-t{font-size:10px;color:rgba(255,255,255,0.6);font-weight:600}

  /* ── Bottom nav ── */
  .bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--white);border-top:2px solid var(--b);display:flex;z-index:100}
  .ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px 11px;cursor:pointer;border:none;background:transparent;transition:background 0.15s;font-family:var(--font)}
  .ni.active{background:var(--sx)}
  .ni-ico{font-size:15px;line-height:1}
  .ni-lbl{font-size:9px;font-weight:700;color:var(--t3);letter-spacing:0.3px;text-transform:uppercase}
  .ni.active .ni-lbl{color:var(--b)}
  .ni-bar{height:2px;width:20px;border-radius:2px;background:transparent;margin-top:2px}
  .ni.active .ni-bar{background:var(--b)}

  /* ── Screens ── */
  .scr{padding:16px;animation:fd 0.18s ease}
  @keyframes fd{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}

  /* ── Welcome ── */
  .welcome-wrap{padding:24px 20px}
  .welcome-logo{display:flex;justify-content:center;margin-bottom:20px}
  .welcome-title{font-size:20px;font-weight:800;color:var(--navy);text-align:center;line-height:1.3;margin-bottom:10px}
  .welcome-sub{font-size:13px;color:var(--t2);text-align:center;line-height:1.6;margin-bottom:24px}
  .welcome-info{background:var(--sx);border-radius:var(--r);padding:14px 16px;border-left:3px solid var(--b);margin-bottom:20px}
  .welcome-info-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.6px;color:var(--b);margin-bottom:6px}
  .welcome-info-text{font-size:12px;color:var(--navy);font-weight:600;line-height:1.6}
  .welcome-btn-primary{width:100%;padding:14px;background:var(--b);color:#fff;border:none;border-radius:var(--rs);font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);margin-bottom:10px;transition:background 0.15s}
  .welcome-btn-primary:hover{background:var(--bd)}
  .welcome-btn-ghost{width:100%;padding:13px;background:transparent;color:var(--b);border:1.5px solid var(--brd);border-radius:var(--rs);font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all 0.15s;margin-bottom:8px}
  .welcome-btn-ghost:hover{border-color:var(--b);background:var(--sx)}
  .guest-note{font-size:10px;color:var(--t3);text-align:center;margin-top:4px;font-weight:600}

  /* ── Modal / overlay ── */
  .overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(30,53,88,0.52);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
  .modal{background:var(--white);border-radius:var(--r);padding:22px;width:100%;max-width:385px;max-height:88vh;overflow-y:auto}
  .modal-title{font-size:16px;font-weight:800;color:var(--navy);margin-bottom:4px}
  .modal-sub{font-size:12px;color:var(--t3);margin-bottom:18px}
  .modal-close{float:right;background:none;border:none;font-size:18px;cursor:pointer;color:var(--t3);margin-top:-4px}

  /* ── Cards ── */
  .card{background:var(--white);border-radius:var(--r);border:1px solid var(--brd);padding:14px}
  .card+.card{margin-top:10px}

  /* ── Section head ── */
  .sh{font-size:14px;font-weight:700;color:var(--sky);margin:18px 0 10px}
  .sh:first-child{margin-top:4px}

  /* ── Metric grid ── */
  .mg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .mc{background:var(--white);border-radius:var(--rs);padding:13px 12px;border:1px solid var(--brd);border-top:3px solid var(--b)}
  .ml{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--t3);margin-bottom:6px}
  .mv{font-size:19px;font-weight:800;color:var(--navy);letter-spacing:-0.5px}
  .mv.blue{color:var(--b)} .mv.amber{color:var(--amber)} .mv.green{color:var(--green)} .mv.red{color:var(--red)} .mv.purple{color:var(--purple)}
  .ms{font-size:11px;color:var(--t3);margin-top:3px}

  /* ── Hero ── */
  .hero{background:var(--b);border-radius:var(--r);padding:18px;margin-bottom:14px;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;bottom:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.07);pointer-events:none}
  .hero-ey{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-bottom:6px}
  .hero-val{font-size:30px;font-weight:800;color:#fff;letter-spacing:-1px;line-height:1}
  .hero-sub{font-size:12px;color:rgba(255,255,255,0.65);margin-top:6px;font-weight:600}

  /* ── Info strip ── */
  .istrip{background:var(--sl);border-radius:var(--rs);padding:10px 13px;display:flex;align-items:flex-start;gap:9px;margin-bottom:12px;border-left:3px solid var(--b)}
  .istrip-ico{font-size:12px;margin-top:1px;color:var(--b);flex-shrink:0}
  .istrip-t{font-size:11px;font-weight:700;color:var(--navy);line-height:1.5}

  /* ── Insight ── */
  .ins{background:var(--sx);border-radius:var(--rs);padding:13px;border:1px solid var(--brd);margin-bottom:10px}
  .ins.amber{background:var(--al);border-color:rgba(212,138,10,0.2)}
  .ins.green{background:var(--gl);border-color:rgba(45,125,90,0.2)}
  .ins.red{background:var(--rl);border-color:rgba(192,57,43,0.2)}
  .ins.purple{background:var(--pl);border-color:rgba(107,79,160,0.2)}
  .ins-tag{font-size:9px;font-weight:800;letter-spacing:0.7px;text-transform:uppercase;color:var(--sky);margin-bottom:5px}
  .ins.amber .ins-tag{color:var(--amber)} .ins.green .ins-tag{color:var(--green)} .ins.red .ins-tag{color:var(--red)} .ins.purple .ins-tag{color:var(--purple)}
  .ins-t{font-size:12px;font-weight:600;color:var(--navy);line-height:1.55}
  .ins.amber .ins-t{color:#7a4d06} .ins.green .ins-t{color:#1a5c3a} .ins.red .ins-t{color:#7a2222} .ins.purple .ins-t{color:#3d2a6e}

  /* ── Badges ── */
  .badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:700}
  .badge.blue{background:var(--sl);color:var(--b)} .badge.amber{background:var(--al);color:var(--amber)}
  .badge.red{background:var(--rl);color:var(--red)} .badge.green{background:var(--gl);color:var(--green)}
  .badge.grey{background:#eee;color:#666} .badge.purple{background:var(--pl);color:var(--purple)}

  /* ── Mix bar ── */
  .mxb{height:5px;border-radius:3px;background:#d9e5f2;overflow:hidden;margin:8px 0 4px}
  .mxf{height:100%;border-radius:3px;background:var(--b);transition:width 0.4s}
  .mxl{display:flex;justify-content:space-between;font-size:10px;color:var(--t3);font-weight:700}

  /* ── Form elements ── */
  .fld{margin-bottom:13px}
  .lbl{font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;display:block}
  .lbl .req{color:var(--b)}
  .inp,.sel{width:100%;padding:10px 12px;border:1.5px solid var(--brd);border-radius:var(--rs);font-size:13px;font-family:var(--font);color:var(--navy);background:var(--white);appearance:none;outline:none;transition:border-color 0.15s}
  .inp:focus,.sel:focus{border-color:var(--b)}
  .sel-w{position:relative} .sel-w::after{content:'▾';position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--t3);pointer-events:none;font-size:12px}

  /* ── Buttons ── */
  .btn-row{display:flex;gap:8px;margin-top:14px}
  .btn{padding:11px 12px;border-radius:var(--rs);font-size:12px;font-weight:700;cursor:pointer;border:none;font-family:var(--font);transition:all 0.15s;flex:1}
  .btn.pri{background:var(--b);color:#fff} .btn.pri:hover{background:var(--bd)}
  .btn.grn{background:var(--green);color:#fff} .btn.grn:hover{background:#236247}
  .btn.out{background:transparent;border:1.5px solid var(--brd);color:var(--t2)} .btn.out:hover{border-color:var(--b);color:var(--b)}
  .btn.amber-btn{background:var(--amber);color:#fff}
  .btn.purple-btn{background:var(--purple);color:#fff}
  .btn-full{width:100%;padding:13px;display:flex;align-items:center;justify-content:center;gap:8px}

  /* ── Toggle pills ── */
  .tog-row{display:flex;gap:6px;flex-wrap:wrap}
  .tog-btn{padding:8px 10px;border:1.5px solid var(--brd);border-radius:var(--rs);background:var(--white);font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);color:var(--t2);transition:all 0.15s;flex:0 0 auto;min-width:44px;text-align:center}
  .tog-btn.active-b{border-color:var(--b);background:var(--sl);color:var(--b)}

  /* ── Funding toggle ── */
  .fund-tog{display:flex;gap:8px}
  .fund-btn{flex:1;padding:11px 8px;border:1.5px solid var(--brd);border-radius:var(--rs);background:var(--white);font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);color:var(--t3);transition:all 0.15s;text-align:center}
  .fund-btn.act-lease{border-color:var(--b);background:var(--sl);color:var(--b)}
  .fund-btn.act-capex{border-color:var(--red);background:var(--rl);color:var(--red)}
  .fund-btn.dis{opacity:0.35;cursor:not-allowed}

  /* ── Lease summary box ── */
  .ls-box{background:var(--sl);border-radius:var(--rs);padding:13px;border:1px solid var(--brd);margin-top:4px}
  .ls-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.6px;color:var(--b);margin-bottom:10px}
  .ls-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(58,110,168,0.1)}
  .ls-row:last-child{border-bottom:none}
  .ls-lbl{font-size:11px;color:var(--t2);font-weight:600}
  .ls-val{font-size:13px;font-weight:800;color:var(--navy)}
  .ls-val.hi{color:var(--b);font-size:15px}

  /* ── CapEx notice ── */
  .cx-box{background:var(--rl);border-radius:var(--rs);padding:12px 13px;border:1px solid rgba(192,57,43,0.2);margin-top:4px}
  .cx-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.6px;color:var(--red);margin-bottom:6px}
  .cx-text{font-size:12px;font-weight:600;color:#7a2a22;line-height:1.55}

  /* ── Consent tag ── */
  .ctag{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700}
  .ctag.ok{background:var(--gl);color:var(--green)} .ctag.no{background:var(--rl);color:var(--red)}

  /* ── School section header ── */
  .school-sect{background:var(--navy);border-radius:var(--r);padding:12px 14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center}
  .school-sect-name{font-size:14px;font-weight:800;color:#fff}
  .school-sect-meta{font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px}
  .school-sect-actions{display:flex;gap:6px}
  .school-sect-btn{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);color:#fff;border-radius:6px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font)}
  .school-sect-btn:hover{background:rgba(255,255,255,0.25)}

  /* ── Asset card ── */
  .acard{background:var(--white);border:1px solid var(--brd);border-radius:var(--rs);padding:12px;margin-bottom:8px}
  .acard-name{font-size:12px;font-weight:700;color:var(--navy)}
  .acard-det{font-size:11px;color:var(--t3);margin-top:2px}
  .del-btn{background:none;border:none;color:var(--t3);cursor:pointer;font-size:14px;padding:2px 6px;font-family:var(--font)}
  .del-btn:hover{color:var(--red)}

  /* ── School card ── */
  .school-card{cursor:pointer;transition:all 0.15s;margin-bottom:10px}
  .school-card:hover{border-color:var(--sky);box-shadow:0 3px 10px rgba(58,110,168,0.1);transform:translateY(-1px)}
  .school-nm{font-size:14px;font-weight:700;color:var(--navy)}
  .school-mt{font-size:11px;color:var(--t3);margin-top:2px;font-weight:600}

  /* ── Check list ── */
  .check-list{list-style:none;padding:0;margin:0}
  .check-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--brd)}
  .check-item:last-child{border-bottom:none}
  .check-icon{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;margin-top:1px}
  .check-icon.ok{background:var(--gl);color:var(--green)}
  .check-icon.no{background:#f0f0f0;color:#999}
  .check-text{font-size:12px;font-weight:600;color:var(--navy);line-height:1.5}
  .check-sub{font-size:11px;color:var(--t3);margin-top:2px;line-height:1.4}

  /* ── Summary table ── */
  .sum-table{width:100%;border-collapse:collapse;font-size:11px}
  .sum-table th{text-align:left;padding:6px 8px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:var(--t3);border-bottom:2px solid var(--brd);background:var(--sx)}
  .sum-table td{padding:8px;border-bottom:1px solid var(--brd);color:var(--navy);font-weight:600}
  .sum-table tr:last-child td{border-bottom:none}
  .sum-table td.num{text-align:right;font-weight:800}
  .sum-table td.grn{color:var(--green);font-weight:800;text-align:right}
  .sum-table td.bl{color:var(--b);font-weight:800;text-align:right}
  .sum-table td.pu{color:var(--purple);font-weight:800;text-align:right}

  /* ── Back btn ── */
  .back-btn{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--sky);cursor:pointer;margin-bottom:14px;padding:4px 0;background:none;border:none;font-family:var(--font)}
  .back-btn:hover{color:var(--b)}
  .pg-title{font-size:17px;font-weight:800;color:var(--navy);letter-spacing:-0.3px;margin-bottom:3px}
  .pg-sub{font-size:12px;color:var(--t3);font-weight:600}

  /* ── Scenario list ── */
  .scen-card{background:var(--white);border-radius:var(--rs);border:1px solid var(--brd);padding:13px;margin-bottom:8px;cursor:pointer;transition:all 0.15s}
  .scen-card:hover{border-color:var(--sky);transform:translateY(-1px);box-shadow:0 3px 8px rgba(58,110,168,0.1)}
  .scen-head{display:flex;justify-content:space-between;align-items:flex-start}
  .scen-nm{font-size:13px;font-weight:700;color:var(--navy)}
  .scen-meta{font-size:11px;color:var(--t3);margin-top:3px}
  .scen-figures{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
  .scen-fig{background:var(--sx);border-radius:6px;padding:6px 10px}
  .scen-fig-lbl{font-size:9px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:0.4px}
  .scen-fig-val{font-size:13px;font-weight:800;color:var(--navy)}
  .scen-fig-val.b{color:var(--b)} .scen-fig-val.g{color:var(--green)} .scen-fig-val.p{color:var(--purple)}

  /* ── File upload ── */
  .file-lbl{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px dashed var(--brd);border-radius:var(--rs);cursor:pointer;background:var(--sx)}

  /* ── LED savings box ── */
  .led-box{background:#f0fdf4;border-radius:var(--rs);padding:13px;border:1px solid rgba(45,125,90,0.25);margin-top:8px}

  /* ── Tab row ── */
  .tab-row{display:flex;background:#dce8f3;border-radius:var(--rs);padding:3px;gap:2px;margin-bottom:13px}
  .tab-btn{flex:1;padding:7px 4px;border:none;background:transparent;border-radius:6px;font-size:11px;font-weight:700;color:var(--t3);cursor:pointer;transition:all 0.15s;font-family:var(--font)}
  .tab-btn.active{background:var(--white);color:var(--navy);box-shadow:0 1px 3px rgba(0,0,0,0.1)}

  /* ── Export bar ── */
  .export-bar{display:flex;gap:8px;padding:12px 0 4px}
  .export-note{font-size:10px;color:var(--t3);font-weight:600;text-align:center}

  /* ── Info btn ── */
  .info-btn{background:var(--sl);border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;color:var(--b);font-weight:800;font-family:var(--font);display:inline-flex;align-items:center;justify-content:center;margin-left:4px}

  /* ── Link btn ── */
  .link-btn{background:none;border:none;color:var(--b);font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);text-decoration:underline;padding:0}

  /* ── Notice ── */
  .notice{background:var(--al);border-radius:var(--rs);padding:11px 13px;border:1px solid rgba(212,138,10,0.25);font-size:11px;color:#7a4d06;font-weight:600;line-height:1.5;margin-bottom:10px}
  .notice.blue{background:var(--sx);border-color:var(--brd);color:var(--navy)}

  /* ── More screen ── */
  .prof-row{display:flex;align-items:center;gap:12px;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid var(--brd)}
  .prof-av{width:42px;height:42px;border-radius:50%;background:var(--b);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:800}
  .set-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--brd)}
  .set-row:last-child{border-bottom:none}
  .set-lbl{font-size:13px;font-weight:700;color:var(--navy)}
  .set-val{font-size:11px;color:var(--t3)}
  .accred-wrap{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
  .accred-tag{font-size:10px;font-weight:700;background:var(--sl);color:var(--b);padding:4px 10px;border-radius:20px;border:1px solid var(--brd)}

  /* ── SVG Chart ── */
  .chart-wrap{width:100%;overflow:hidden;border-radius:var(--rs)}
  .chart-legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;font-size:10px;font-weight:700;color:var(--t3)}
  .chart-legend-item{display:flex;align-items:center;gap:5px}
  .chart-legend-swatch{width:10px;height:10px;border-radius:2px;display:inline-block;flex-shrink:0}
`;

// ─────────────────────────────────────────────────────────────────────────────
// CHART COMPONENT  — pure SVG, no external library
// ─────────────────────────────────────────────────────────────────────────────
const BudgetChart = ({ yearData, title, subtitle }) => {
  // yearData: [{label, leasePayments, slbCapital, capex, ledSaving}]
  if(!yearData||yearData.length===0) return null;
  const W=360, H=160, PAD={t:20,r:10,b:36,l:48};
  const chartW=W-PAD.l-PAD.r, chartH=H-PAD.t-PAD.b;
  const maxVal=Math.max(...yearData.map(d=>(d.leasePayments||0)+(d.slbCapital||0)+(d.capex||0)), 1);
  const barW=Math.min(32, (chartW/yearData.length)-8);
  const gap=(chartW/yearData.length);

  const yTick = v => PAD.t + chartH - (v/maxVal)*chartH;
  const ticks = [0,0.25,0.5,0.75,1].map(f=>Math.round(maxVal*f/1000)*1000);

  return (
    <div>
      {title&&<div style={{fontSize:12,fontWeight:700,color:"var(--navy)",marginBottom:6}}>{title}</div>}
      {subtitle&&<div style={{fontSize:10,color:"var(--t3)",marginBottom:8,fontWeight:600}}>{subtitle}</div>}
      <div className="chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{display:"block"}}>
          {/* Grid lines */}
          {ticks.map((v,i)=>(
            <g key={i}>
              <line x1={PAD.l} y1={yTick(v)} x2={W-PAD.r} y2={yTick(v)} stroke="#e2e8f0" strokeWidth="1"/>
              <text x={PAD.l-4} y={yTick(v)+4} textAnchor="end" fontSize="8" fill="#8da3bc" fontFamily="Open Sans,sans-serif">{fmtk(v)}</text>
            </g>
          ))}

          {/* Bars per year */}
          {yearData.map((d,i)=>{
            const cx=PAD.l+i*gap+gap/2;
            const x=cx-barW/2;
            const lease=d.leasePayments||0;
            const slb=d.slbCapital||0;
            const capex=d.capex||0;

            // Stack: capex (bottom, red), lease (middle, blue), slb (top, green)
            const capexH=(capex/maxVal)*chartH;
            const leaseH=(lease/maxVal)*chartH;
            const slbH=(slb/maxVal)*chartH;

            const capexY=yTick(capex);
            const leaseY=yTick(capex+lease);
            const slbY=yTick(capex+lease+slb);

            return (
              <g key={i}>
                {capex>0&&<rect x={x} y={capexY} width={barW} height={capexH} fill="#e05a50" rx="2"/>}
                {lease>0&&<rect x={x} y={leaseY} width={barW} height={leaseH} fill="#3a6ea8" rx="2"/>}
                {slb>0&&<rect x={x} y={slbY} width={barW} height={slbH} fill="#2d7d5a" rx="2"/>}
                <text x={cx} y={H-PAD.b+12} textAnchor="middle" fontSize="8" fill="#8da3bc" fontFamily="Open Sans,sans-serif">{d.label}</text>
              </g>
            );
          })}
          {/* Axis */}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H-PAD.b} stroke="#d9e5f2" strokeWidth="1"/>
          <line x1={PAD.l} y1={H-PAD.b} x2={W-PAD.r} y2={H-PAD.b} stroke="#d9e5f2" strokeWidth="1"/>
        </svg>
      </div>
      <div className="chart-legend">
        {yearData.some(d=>d.leasePayments>0)&&<span className="chart-legend-item"><span className="chart-legend-swatch" style={{background:"#3a6ea8"}}/>Lease payments</span>}
        {yearData.some(d=>d.slbCapital>0)&&<span className="chart-legend-item"><span className="chart-legend-swatch" style={{background:"#2d7d5a"}}/>Capital raised (S&LB)</span>}
        {yearData.some(d=>d.capex>0)&&<span className="chart-legend-item"><span className="chart-legend-swatch" style={{background:"#e05a50"}}/>CapEx spend</span>}
      </div>
    </div>
  );
};

// Line chart for capital position over time
const CapitalLineChart = ({ yearData, title }) => {
  if(!yearData||yearData.length<2) return null;
  const W=360, H=140, PAD={t:20,r:16,b:32,l:48};
  const chartW=W-PAD.l-PAD.r, chartH=H-PAD.t-PAD.b;

  const allVals = yearData.flatMap(d=>[d.capitalPreserved||0, d.totalBudget||0]);
  const maxVal  = Math.max(...allVals, 1);
  const minVal  = Math.min(...allVals, 0);
  const range   = maxVal-minVal||1;

  const xPos = i => PAD.l+(i/(yearData.length-1))*chartW;
  const yPos = v => PAD.t+chartH-((v-minVal)/range)*chartH;

  const toPath = vals => vals.map((v,i)=>`${i===0?"M":"L"}${xPos(i)},${yPos(v)}`).join(" ");

  const capPts = yearData.map(d=>d.capitalPreserved||0);
  const totPts = yearData.map(d=>d.totalBudget||0);

  return (
    <div>
      {title&&<div style={{fontSize:12,fontWeight:700,color:"var(--navy)",marginBottom:6}}>{title}</div>}
      <div className="chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{display:"block"}}>
          {/* Grid */}
          {[0,0.5,1].map((f,i)=>{
            const v=minVal+f*range;
            return <g key={i}>
              <line x1={PAD.l} y1={yPos(v)} x2={W-PAD.r} y2={yPos(v)} stroke="#e2e8f0" strokeWidth="1"/>
              <text x={PAD.l-4} y={yPos(v)+4} textAnchor="end" fontSize="8" fill="#8da3bc" fontFamily="Open Sans,sans-serif">{fmtk(v)}</text>
            </g>;
          })}
          {/* Lines */}
          <path d={toPath(capPts)} fill="none" stroke="#2d7d5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d={toPath(totPts)} fill="none" stroke="#3a6ea8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3"/>
          {/* Dots */}
          {capPts.map((v,i)=><circle key={i} cx={xPos(i)} cy={yPos(v)} r="3.5" fill="#2d7d5a"/>)}
          {/* X labels */}
          {yearData.map((d,i)=><text key={i} x={xPos(i)} y={H-PAD.b+12} textAnchor="middle" fontSize="8" fill="#8da3bc" fontFamily="Open Sans,sans-serif">{d.label}</text>)}
          {/* Axes */}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H-PAD.b} stroke="#d9e5f2" strokeWidth="1"/>
          <line x1={PAD.l} y1={H-PAD.b} x2={W-PAD.r} y2={H-PAD.b} stroke="#d9e5f2" strokeWidth="1"/>
        </svg>
      </div>
      <div className="chart-legend">
        <span className="chart-legend-item"><span className="chart-legend-swatch" style={{background:"#2d7d5a"}}/>Capital preserved</span>
        <span className="chart-legend-item"><span className="chart-legend-swatch" style={{background:"#3a6ea8",opacity:0.7}}/>Total budget impact</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT TO CSV
// ─────────────────────────────────────────────────────────────────────────────
const exportToExcel = (scenarios, schoolName, trustName, mode="individual") => {
  const MAX_YR=10;
  // Clean, minimal headers — £ where relevant, no prefixes
  const yearHeaders = Array.from({length:MAX_YR},(_,i)=>ayLabel(AY_START+i));
  const headers = [
    "School",
    "Asset Category",
    "Description",
    "Type",
    "Capital (£)",
    "Lease Term (yrs)",
    ...yearHeaders,
    "Total Lease (£)",
    "Capital Preserved (£)",
    "S&LB Capital Raised (£)",
  ];
  const rows=[];
  const groups=mode==="consolidated"?scenarios:scenarios.filter(s=>!schoolName||s.schoolName===schoolName);
  groups.forEach(sc=>{
    (sc.assets||[]).forEach(a=>{
      if(a.fundingChoice!=="lease") return;
      const sched=buildSchedule(Number(a.capital||0),a.replacementYears);
      const yearCols=Array.from({length:MAX_YR},(_,i)=>sched[i]?sched[i].payment:"");
      const totalLease=sched.reduce((s,y)=>s+y.payment,0);
      const capPreserved=Number(a.capital||0);
      const slbRaised=a.isSaleLeaseback?Number(a.capital||0):0;
      rows.push([
        sc.schoolName||schoolName||"",   // School name always included
        a.categoryLabel,
        a.subtype||"",
        a.isSaleLeaseback?"Sale & Leaseback":"Lease",
        Number(a.capital||0),
        a.replacementYears,
        ...yearCols,
        totalLease,
        capPreserved,
        slbRaised,
      ]);
    });
  });
  const csv=[headers,...rows].map(r=>r.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv"});
  const url=URL.createObjectURL(blob);
  const fileName=`Room_Twelve_Lease_Plan_${(schoolName||trustName||"Export").replace(/\s/g,"_")}.csv`;
  const a=document.createElement("a"); a.href=url; a.download=fileName;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────────
// ADD ASSET FORM
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_ASSET={categoryId:"",categoryLabel:"",leaseAllowed:false,ledNote:false,ledSavings:false,subtype:"",quantity:"",capital:"",replacementYears:3,fundingChoice:"lease",annualPayment:0,monthlyPayment:0,annualSaving:0,isSaleLeaseback:false,ageMonths:""};

const AddAssetForm = ({ onAdd, onCancel, isSaleLeaseback=false }) => {
  const [form,setForm]=useState({...EMPTY_ASSET,isSaleLeaseback});
  const [showInfo,setShowInfo]=useState(false);

  const update=patch=>setForm(prev=>{
    const next={...prev,...patch};
    if(patch.categoryId!==undefined){
      const cat=CLASS_CONSENT.find(c=>c.id===patch.categoryId);
      next.categoryLabel=cat?.label||""; next.leaseAllowed=cat?.leaseAllowed??false;
      next.ledNote=cat?.ledNote??false; next.ledSavings=cat?.ledSavings??false;
      if(!next.leaseAllowed) next.fundingChoice="capex"; else next.fundingChoice="lease";
      next.replacementYears=3; next.annualSaving=0;
    }
    const cap=Number(next.capital)||0; const yrs=Number(next.replacementYears)||3;
    if(next.leaseAllowed&&next.fundingChoice==="lease"&&cap>0){
      const {annual,monthly}=calcLease(cap,yrs);
      next.annualPayment=annual; next.monthlyPayment=monthly;
    } else {next.annualPayment=0; next.monthlyPayment=0;}
    return next;
  });

  const cat=CLASS_CONSENT.find(c=>c.id===form.categoryId);
  const policyYears=form.categoryId==="modular"?[3,4,5,6,7,8,9,10]:form.categoryId==="led"?[3,4,5,6,7]:[3,4,5];
  const cap=Number(form.capital)||0;
  const ledNetPosition=form.ledSavings&&form.annualSaving>0?(form.annualSaving*form.replacementYears)-(form.annualPayment*form.replacementYears):0;
  const canAdd=form.categoryId&&form.capital;

  return (
    <div className="card" style={{marginBottom:12}}>
      <div style={{fontSize:13,fontWeight:800,color:"var(--navy)",marginBottom:14}}>{isSaleLeaseback?"Sale & leaseback asset":"New asset"}</div>

      {isSaleLeaseback&&(
        <div className="ins amber" style={{marginBottom:14}}>
          <div className="ins-tag">Sale & Leaseback</div>
          <div className="ins-t">Sell assets purchased within the last 12 months back to a leasing company and lease them back — releasing capital in year one with known payments spread over the term.</div>
        </div>
      )}

      <div className="fld">
        <label className="lbl">Asset category <span className="req">*</span><button className="info-btn" onClick={()=>setShowInfo(v=>!v)}>i</button></label>
        <div className="sel-w">
          <select className="sel" value={form.categoryId} onChange={e=>update({categoryId:e.target.value})}>
            <option value="">Select category...</option>
            {CLASS_CONSENT.map(c=><option key={c.id} value={c.id}>{c.label}{!c.leaseAllowed?" (CapEx only)":""}</option>)}
          </select>
        </div>
        {showInfo&&(<div style={{marginTop:8,padding:"10px 12px",background:"var(--sx)",borderRadius:8,fontSize:11,color:"var(--navy)",lineHeight:1.6}}><strong>IFRS16 Class Consent 2024</strong> covers: IT equipment, telephony, catering, furniture, bathroom items, gym equipment, groundskeeping, LED lighting (DfE sourced), vehicles, and temporary classrooms.</div>)}
        {cat&&(
          <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <span className={`ctag ${cat.leaseAllowed?"ok":"no"}`}>{cat.leaseAllowed?"✓ Lease eligible":"✕ CapEx only"} — {cat.note}</span>
            {cat.ledNote&&<div style={{fontSize:11,color:"var(--amber)",fontWeight:600,marginTop:4,width:"100%"}}>⚠ DfE sourcing required (Get Help Buying / Find a Framework)</div>}
            {cat.examples.length>0&&<div style={{fontSize:10,color:"var(--t3)",width:"100%",lineHeight:1.4}}>e.g. {cat.examples.slice(0,4).join(", ")}</div>}
          </div>
        )}
      </div>

      <div className="fld">
        <label className="lbl">Asset description</label>
        {cat&&cat.examples.length>0&&(<div className="sel-w" style={{marginBottom:6}}><select className="sel" value={form.subtype} onChange={e=>update({subtype:e.target.value})}><option value="">Select from list or type below...</option>{cat.examples.map(ex=><option key={ex} value={ex}>{ex}</option>)}</select></div>)}
        <input className="inp" value={form.subtype} onChange={e=>update({subtype:e.target.value})} placeholder="e.g. Laptops, interactive boards..."/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div className="fld"><label className="lbl">Quantity</label><input className="inp" type="number" min="1" value={form.quantity} onChange={e=>update({quantity:e.target.value})} placeholder="e.g. 30"/></div>
        <div className="fld"><label className="lbl">Total capital (£) <span className="req">*</span></label><input className="inp" type="number" min="0" value={form.capital} onChange={e=>update({capital:e.target.value})} placeholder="e.g. 25000"/></div>
      </div>

      {isSaleLeaseback&&(
        <div className="fld">
          <label className="lbl">Age of equipment (months) <span className="req">*</span></label>
          <div className="sel-w"><select className="sel" value={form.ageMonths} onChange={e=>update({ageMonths:e.target.value})}><option value="">Select age...</option>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1} month{i+1>1?"s":""}</option>)}</select></div>
          <div style={{fontSize:10,color:"var(--t3)",marginTop:4,fontWeight:600}}>Available for assets purchased within the last 12 months only</div>
        </div>
      )}

      <div className="fld">
        <label className="lbl">Replacement policy {form.categoryId==="modular"?"(up to 10 years)":form.categoryId==="led"?"(up to 7 years)":"(3–5 years)"}</label>
        <div className="tog-row">{policyYears.map(yr=><button key={yr} className={`tog-btn${form.replacementYears===yr?" active-b":""}`} onClick={()=>update({replacementYears:yr})}>{yr}yr</button>)}</div>
        <div style={{fontSize:10,color:"var(--t3)",marginTop:4,fontWeight:600}}>Lease term mirrors replacement policy period</div>
      </div>

      {form.categoryId&&(
        <div className="fld">
          <label className="lbl">Funding method</label>
          <div className="fund-tog">
            <button className={`fund-btn${form.fundingChoice==="lease"?" act-lease":""}${!form.leaseAllowed?" dis":""}`} onClick={()=>form.leaseAllowed&&update({fundingChoice:"lease"})}>Lease</button>
            <button className={`fund-btn${form.fundingChoice==="capex"?" act-capex":""}`} onClick={()=>update({fundingChoice:"capex"})}>Buy (CapEx)</button>
          </div>
          {!form.leaseAllowed&&(<div className="cx-box" style={{marginTop:8}}><div className="cx-title">CapEx only</div><div className="cx-text">This asset is not on the IFRS16 Class Consent 2024. Leasing is not permitted.</div></div>)}
        </div>
      )}

      {form.ledSavings&&form.fundingChoice==="lease"&&cap>0&&(
        <div className="fld">
          <label className="lbl">Projected annual energy saving (£)</label>
          <input className="inp" type="number" min="0" value={form.annualSaving} onChange={e=>update({annualSaving:Number(e.target.value)||0})} placeholder="e.g. 3500"/>
        </div>
      )}

      {form.fundingChoice==="lease"&&form.leaseAllowed&&cap>0&&(
        <div className="ls-box">
          <div className="ls-title">Indicative lease budget</div>
          <div className="ls-row"><div className="ls-lbl">Annual payment</div><div className="ls-val hi">{fmt(form.annualPayment)}</div></div>
          <div className="ls-row"><div className="ls-lbl">Monthly payment</div><div className="ls-val">{fmt(form.monthlyPayment)}</div></div>
          <div className="ls-row"><div className="ls-lbl">Lease term</div><div className="ls-val">{form.replacementYears} years</div></div>
          {form.ledSavings&&form.annualSaving>0&&(
            <>
              <div className="ls-row"><div className="ls-lbl">Annual energy saving</div><div className="ls-val" style={{color:"var(--green)"}}>{fmt(form.annualSaving)}</div></div>
              <div className="ls-row"><div className="ls-lbl">Net capital position over {form.replacementYears}yr</div><div className="ls-val" style={{color:ledNetPosition>=0?"var(--green)":"var(--red)"}}>{ledNetPosition>=0?"+":""}{fmt(ledNetPosition)}</div></div>
              {ledNetPosition>0&&<div style={{fontSize:10,color:"var(--green)",marginTop:6,fontWeight:700}}>✓ LED savings exceed lease cost — positive capital position</div>}
            </>
          )}
          <div style={{fontSize:10,color:"var(--t3)",marginTop:8,fontWeight:600}}>Indicative budget rate. Contact Room Twelve for a formal quote.</div>
        </div>
      )}

      {form.fundingChoice==="capex"&&cap>0&&(
        <div className="cx-box"><div className="cx-title">Capital purchase</div><div className="cx-text">Upfront cost: <strong>{fmt(cap)}</strong> — full payment from capital budget.</div></div>
      )}

      <div className="btn-row" style={{marginTop:16}}>
        <button className="btn out" onClick={onCancel}>Cancel</button>
        <button className="btn pri" onClick={()=>canAdd&&onAdd({...form})} style={{opacity:canAdd?1:0.45}} disabled={!canAdd}>Add to plan</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// QUOTE MODAL
// ─────────────────────────────────────────────────────────────────────────────
const FORMSPREE_ID = "mvzlkeyn";
const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_ID}`;

const QuoteModal = ({ assets, schoolName, onClose }) => {
  const [step,     setStep]     = useState("form"); // "form"|"sending"|"sent"|"error"
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [leaseTerm,setLeaseTerm]= useState("");
  const [payFreq,  setPayFreq]  = useState("");
  const [notes,    setNotes]    = useState("");
  const [fileObj,  setFileObj]  = useState(null);
  const [fileName, setFileName] = useState("");

  const [errorDetail, setErrorDetail] = useState("");

  const leaseAssets = assets.filter(a=>a.fundingChoice==="lease");
  const total       = leaseAssets.reduce((s,a)=>s+Number(a.capital||0),0);
  const canSend     = name&&email&&leaseTerm&&payFreq&&leaseAssets.length>0;

  const handleFile = e => {
    const f = e.target.files[0];
    if(f){ setFileObj(f); setFileName(f.name); }
  };

  const handleSend = () => {
    if(!canSend) return;
    setStep("sending");
    setErrorDetail("");

    const assetSummary = leaseAssets.map((a,i) => [
      (i+1)+". "+a.categoryLabel+(a.subtype?" — "+a.subtype:""),
      "   Quantity: "+(a.quantity||"Not specified"),
      "   Capital value: £"+Number(a.capital||0).toLocaleString(),
      "   Lease term: "+a.replacementYears+" years",
      "   Indicative annual rental: £"+Number(a.annualPayment||0).toLocaleString(),
      "   Indicative monthly rental: £"+Number(a.monthlyPayment||0).toLocaleString(),
    ].join("\n")).join("\n\n");

    const fd = new FormData();
    fd.append("_subject",          "Formal Lease Quote Request — "+(schoolName||name||"School"));
    fd.append("School",            schoolName||"Not provided");
    fd.append("Contact name",      name);
    fd.append("Email",             email);
    fd.append("Phone",             phone||"Not provided");
    fd.append("Lease term",        leaseTerm);
    fd.append("Payment frequency", payFreq);
    fd.append("Total capital",     "£"+total.toLocaleString());
    fd.append("Assets",            assetSummary);
    fd.append("Notes",             notes||"None");
    if(fileObj) fd.append("attachment", fileObj, fileName);

    fetch(FORMSPREE_URL, {
      method:  "POST",
      headers: { "Accept": "application/json" },
      body:    fd,
    })
    .then(function(res) {
      return res.json().then(function(data) {
        if(res.ok) {
          setStep("sent");
        } else {
          var msg = (data && data.error) || (data && data.errors && data.errors[0] && data.errors[0].message) || ("HTTP "+res.status);
          setErrorDetail(msg);
          setStep("error");
        }
      });
    })
    .catch(function(err) {
      // Network blocked (e.g. sandbox/preview environment) — fall back to mailto
      var subject = encodeURIComponent("Formal Lease Quote Request — "+(schoolName||name||"School"));
      var body = encodeURIComponent(
        "Dear Room Twelve,\n\nPlease provide a formal lease quote.\n\n"+
        "School: "+(schoolName||"Not provided")+"\n"+
        "Contact: "+name+"\n"+
        "Email: "+email+"\n"+
        "Phone: "+(phone||"Not provided")+"\n"+
        "Lease term: "+leaseTerm+"\n"+
        "Payment frequency: "+payFreq+"\n"+
        "Total capital: £"+total.toLocaleString()+"\n\n"+
        "Assets:\n"+assetSummary+"\n\n"+
        (notes?"Notes: "+notes+"\n\n":"")+
        (fileName?"Please attach: "+fileName+"\n\n":"")+
        "Kind regards,\n"+name
      );
      window.location.href = "mailto:info@room12.com?subject="+subject+"&body="+body;
      setStep("sent");
      setErrorDetail("mailto");
    });
  };

  // ── SENT ──────────────────────────────────────────────────────────────────
  if(step==="sent") return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">{errorDetail==="mailto" ? "Email client opened ✓" : "Quote request sent ✓"}</div>
        <div className="ins green" style={{marginTop:16,marginBottom:12}}>
          <div className="ins-tag">{errorDetail==="mailto" ? "Check your email client" : "Sent directly to Room Twelve"}</div>
          <div className="ins-t">
            {errorDetail==="mailto"
              ? <>Your email client has opened with all quote details pre-filled, addressed to <strong>info@room12.com</strong>.{fileName&&<><br/><br/>Remember to attach <strong>{fileName}</strong> before sending.</>}</>
              : <>Your request has been sent directly to <strong>info@room12.com</strong> including all asset details and rental figures.{fileName&&<><br/><br/>Your equipment quote <strong>{fileName}</strong> has been attached.</>}<br/><br/>Room Twelve will be in touch shortly.</>
            }
          </div>
        </div>
        <div style={{fontSize:11,color:"var(--t3)",marginBottom:16,fontWeight:600,textAlign:"center"}}>
          Or call Room Twelve on <strong>020 3301 1240</strong>
        </div>
        <button className="btn pri" onClick={onClose} style={{width:"100%"}}>Close</button>
      </div>
    </div>
  );

  // ── SENDING ────────────────────────────────────────────────────────────────
  if(step==="sending") return (
    <div className="overlay">
      <div className="modal" style={{textAlign:"center",padding:"40px 24px"}}>
        <div style={{fontSize:36,marginBottom:16}}>⏳</div>
        <div style={{fontSize:16,fontWeight:800,color:"var(--navy)",marginBottom:8}}>Sending to Room Twelve...</div>
        <div style={{fontSize:12,color:"var(--t3)"}}>Please wait — this usually takes a few seconds</div>
      </div>
    </div>
  );

  if(step==="error") return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Could not send</div>
        <div className="ins amber" style={{marginTop:16,marginBottom:16}}>
          <div className="ins-tag">Submission failed</div>
          <div className="ins-t">
            {errorDetail==="Host not in allowlist"
              ? <>The app's domain hasn't been whitelisted in Formspree yet.<br/><br/>
                  <strong>Fix:</strong> Log into formspree.io → open form <strong>mvzlkeyn</strong> → Settings → Allowed Domains → remove all restrictions (or add this domain).</>
              : <>Something went wrong: {errorDetail||"unknown error"}<br/><br/>Please contact Room Twelve directly.</>
            }
          </div>
        </div>
        <div style={{fontSize:13,fontWeight:700,color:"var(--navy)",marginBottom:4}}>Contact Room Twelve directly:</div>
        <div style={{fontSize:13,color:"var(--t2)",marginBottom:16,lineHeight:1.7}}>
          📧 info@room12.com<br/>📞 020 3301 1240
        </div>
        <div className="btn-row">
          <button className="btn out" onClick={()=>setStep("form")}>← Try again</button>
          <button className="btn pri" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  // ── FORM ──────────────────────────────────────────────────────────────────
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Request formal quote</div>
        <div className="modal-sub">Sent directly to info@room12.com — no email client needed</div>

        {/* Asset summary */}
        <div style={{marginBottom:14,padding:"10px 12px",background:"var(--sx)",borderRadius:8,borderLeft:"3px solid var(--b)"}}>
          <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.5px",color:"var(--b)",marginBottom:6}}>Assets for quotation</div>
          {leaseAssets.length===0
            ?<div style={{fontSize:12,color:"var(--t3)"}}>No lease assets added.</div>
            :leaseAssets.map((a,i)=>(
              <div key={i} style={{fontSize:11,fontWeight:600,color:"var(--navy)",padding:"5px 0",borderBottom:"1px solid var(--brd)"}}>
                {a.categoryLabel}{a.subtype?` — ${a.subtype}`:""}
                <div style={{fontSize:10,color:"var(--t3)",marginTop:2}}>
                  {fmt(Number(a.capital||0))} · {a.replacementYears}yr · ~{fmt(a.annualPayment||0)}/yr · ~{fmt(a.monthlyPayment||0)}/mo
                </div>
              </div>
            ))
          }
          {leaseAssets.length>0&&(
            <div style={{fontSize:12,fontWeight:800,color:"var(--navy)",marginTop:8}}>Total capital: {fmt(total)}</div>
          )}
        </div>

        {/* File attachment */}
        <div className="fld">
          <label className="lbl">Equipment quote <span style={{fontSize:10,color:"var(--t3)",textTransform:"none",letterSpacing:0,fontWeight:600}}>(PDF, Word or Excel — attached automatically)</span></label>
          <label className="file-lbl">
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg" style={{display:"none"}} onChange={handleFile}/>
            <span style={{fontSize:16,color:"var(--b)"}}>📎</span>
            <span style={{fontSize:12,fontWeight:600,color:fileName?"var(--navy)":"var(--t3)"}}>
              {fileName||"Select supplier quote (optional)"}
            </span>
          </label>
          {fileName&&<div style={{fontSize:10,color:"var(--green)",fontWeight:700,marginTop:4}}>✓ {fileName} — will be attached automatically</div>}
        </div>

        {/* Lease details */}
        <div className="fld">
          <label className="lbl">Lease term required <span className="req">*</span></label>
          <div className="sel-w">
            <select className="sel" value={leaseTerm} onChange={e=>setLeaseTerm(e.target.value)}>
              <option value="">Select term...</option>
              {[1,2,3,4,5,6,7,8,9,10].map(y=>(
                <option key={y} value={`${y} year${y>1?"s":""}`}>{y} year{y>1?"s":""}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="fld">
          <label className="lbl">Payment frequency <span className="req">*</span></label>
          <div className="tog-row">
            {["Monthly","Quarterly","Annual"].map(f=>(
              <button key={f} className={`tog-btn${payFreq===f?" active-b":""}`} style={{flex:1}} onClick={()=>setPayFreq(f)}>{f}</button>
            ))}
          </div>
        </div>

        {/* Contact details */}
        <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.5px",color:"var(--t3)",margin:"14px 0 10px"}}>Your details</div>
        <div className="fld"><label className="lbl">Full name <span className="req">*</span></label><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sarah Fletcher"/></div>
        <div className="fld"><label className="lbl">Email address <span className="req">*</span></label><input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@school.org"/></div>
        <div className="fld"><label className="lbl">Phone number</label><input className="inp" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01234 567890"/></div>
        <div className="fld"><label className="lbl">Additional notes</label><input className="inp" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Budget constraints, preferred start date..."/></div>

        <div className="btn-row">
          <button className="btn out" onClick={onClose}>Cancel</button>
          <button className="btn grn" onClick={handleSend} style={{opacity:canSend?1:0.45}} disabled={!canSend}>
            Send to Room Twelve →
          </button>
        </div>
        <div style={{fontSize:10,color:"var(--t3)",marginTop:10,textAlign:"center",lineHeight:1.6}}>
          Sent directly to info@room12.com · no email client needed
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// BAR CHART
// ─────────────────────────────────────────────────────────────────────────────
const BarChart = ({ yearData, title, subtitle }) => {
  if(!yearData||yearData.length===0) return null;
  const W=360,H=160,PAD={t:20,r:10,b:36,l:48};
  const chartW=W-PAD.l-PAD.r, chartH=H-PAD.t-PAD.b;
  const maxVal=Math.max(...yearData.map(d=>(d.leasePayments||0)+(d.slbCapital||0)+(d.capex||0)),1);
  const gap=(chartW/yearData.length);
  const barW=Math.min(32,(chartW/yearData.length)-8);
  const yTick=v=>PAD.t+chartH-(v/maxVal)*chartH;
  const ticks=[0,0.25,0.5,0.75,1].map(f=>Math.round(maxVal*f/1000)*1000);
  return (
    <div>
      {title&&<div style={{fontSize:12,fontWeight:700,color:"var(--navy)",marginBottom:6}}>{title}</div>}
      {subtitle&&<div style={{fontSize:10,color:"var(--t3)",marginBottom:8,fontWeight:600}}>{subtitle}</div>}
      <div className="chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{display:"block"}}>
          {ticks.map((v,i)=>(
            <g key={i}>
              <line x1={PAD.l} y1={yTick(v)} x2={W-PAD.r} y2={yTick(v)} stroke="#e2e8f0" strokeWidth="1"/>
              <text x={PAD.l-4} y={yTick(v)+4} textAnchor="end" fontSize="8" fill="#8da3bc" fontFamily="Open Sans,sans-serif">{fmtk(v)}</text>
            </g>
          ))}
          {yearData.map((d,i)=>{
            const cx=PAD.l+i*gap+gap/2;
            const x=cx-barW/2;
            const lease=d.leasePayments||0;
            const slb=d.slbCapital||0;
            const capex=d.capex||0;
            const capexH=(capex/maxVal)*chartH;
            const leaseH=(lease/maxVal)*chartH;
            const slbH=(slb/maxVal)*chartH;
            const capexY=yTick(capex);
            const leaseY=yTick(capex+lease);
            const slbY=yTick(capex+lease+slb);
            return (
              <g key={i}>
                {capex>0&&<rect x={x} y={capexY} width={barW} height={capexH} fill="#e05a50" rx="2"/>}
                {lease>0&&<rect x={x} y={leaseY} width={barW} height={leaseH} fill="#3a6ea8" rx="2"/>}
                {slb>0&&<rect x={x} y={slbY} width={barW} height={slbH} fill="#2d7d5a" rx="2"/>}
                <text x={cx} y={H-PAD.b+12} textAnchor="middle" fontSize="8" fill="#8da3bc" fontFamily="Open Sans,sans-serif">{d.label}</text>
              </g>
            );
          })}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H-PAD.b} stroke="#d9e5f2" strokeWidth="1"/>
          <line x1={PAD.l} y1={H-PAD.b} x2={W-PAD.r} y2={H-PAD.b} stroke="#d9e5f2" strokeWidth="1"/>
        </svg>
      </div>
      <div className="chart-legend">
        {yearData.some(d=>d.leasePayments>0)&&<span className="chart-legend-item"><span className="chart-legend-swatch" style={{background:"#3a6ea8"}}/>Lease payments</span>}
        {yearData.some(d=>d.slbCapital>0)&&<span className="chart-legend-item"><span className="chart-legend-swatch" style={{background:"#2d7d5a"}}/>Capital raised (S&LB)</span>}
        {yearData.some(d=>d.capex>0)&&<span className="chart-legend-item"><span className="chart-legend-swatch" style={{background:"#e05a50"}}/>CapEx spend</span>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const InputScreen = ({ schools, setSchools }) => {
  const [view,        setView]        = useState("list");
  const [activeSchId, setActiveSchId] = useState(null);
  const [activePlanId,setActivePlanId]= useState(null);
  const [mode,        setMode]        = useState("normal");
  const [addingAsset, setAddingAsset] = useState(false);
  const [showQuote,   setShowQuote]   = useState(false);
  const [newSchName,  setNewSchName]  = useState("");
  const [newPlanName, setNewPlanName] = useState("");

  const activeSch  = schools.find(s=>s.id===activeSchId);
  const activePlan = activeSch?.plans?.find(p=>p.id===activePlanId);

  const addSchool = () => {
    if(!newSchName.trim()) return;
    const sch={id:Date.now(),name:newSchName.trim(),plans:[]};
    setSchools(p=>[...p,sch]); setNewSchName(""); setActiveSchId(sch.id); setView("school");
  };

  const addPlan = () => {
    const plan={id:Date.now(),name:newPlanName||`Plan ${new Date().toLocaleDateString("en-GB")}`,savedAt:new Date().toLocaleDateString("en-GB"),mode,assets:[]};
    setSchools(p=>p.map(s=>s.id===activeSchId?{...s,plans:[...s.plans,plan]}:s));
    setActivePlanId(plan.id); setNewPlanName(""); setView("addAsset");
  };

  const addAsset = asset => {
    setSchools(p=>p.map(s=>s.id!==activeSchId?s:{...s,plans:s.plans.map(pl=>pl.id!==activePlanId?pl:{...pl,assets:[...pl.assets,{...asset,id:Date.now()}]})}));
    setAddingAsset(false);
  };

  const removeAsset = assetId => {
    setSchools(p=>p.map(s=>s.id!==activeSchId?s:{...s,plans:s.plans.map(pl=>pl.id!==activePlanId?pl:{...pl,assets:pl.assets.filter(a=>a.id!==assetId)})}));
  };

  const removeSchool = schId => { setSchools(p=>p.filter(s=>s.id!==schId)); setView("list"); };
  const removePlan   = planId => {
    setSchools(p=>p.map(s=>s.id!==activeSchId?s:{...s,plans:s.plans.filter(pl=>pl.id!==planId)}));
    setView("school");
  };

  // LIST view
  if(view==="list") return (
    <div className="scr">
      <div className="sh" style={{marginTop:4}}>Budget planner</div>
      <div style={{fontSize:12,color:"var(--t3)",marginBottom:14,fontWeight:600}}>Build lease budget plans by school.</div>
      {schools.length===0&&(
        <div style={{textAlign:"center",padding:"24px 0",color:"var(--t3)"}}>
          <div style={{fontSize:32,marginBottom:8}}>🏫</div>
          <div style={{fontSize:13,fontWeight:600}}>No schools added yet</div>
          <div style={{fontSize:12,marginTop:4}}>Add your first school to start building a budget plan</div>
        </div>
      )}
      {schools.map(sch=>{
        const allAssets=sch.plans.flatMap(p=>p.assets||[]);
        const la=allAssets.filter(a=>a.fundingChoice==="lease");
        const totalAnnual=la.reduce((s,a)=>s+a.annualPayment,0);
        const slbCap=la.filter(a=>a.isSaleLeaseback).reduce((s,a)=>s+Number(a.capital||0),0);
        return (
          <div key={sch.id} className="card school-card" onClick={()=>{setActiveSchId(sch.id);setView("school")}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div className="school-nm">{sch.name}</div>
                <div className="school-mt">{sch.plans.length} plan{sch.plans.length!==1?"s":""} · {la.length} lease asset{la.length!==1?"s":""}</div>
              </div>
              <span style={{fontSize:12,color:"var(--t3)"}}>›</span>
            </div>
            {totalAnnual>0&&(
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <span className="badge blue">~{fmt(totalAnnual)}/yr</span>
                {slbCap>0&&<span className="badge purple">S&LB: {fmt(slbCap)}</span>}
              </div>
            )}
          </div>
        );
      })}
      <div className="sh">Add school</div>
      <div className="card">
        <div className="fld" style={{marginBottom:10}}>
          <label className="lbl">School name</label>
          <input className="inp" value={newSchName} onChange={e=>setNewSchName(e.target.value)} placeholder="e.g. Greenfield Academy" onKeyDown={e=>e.key==="Enter"&&addSchool()}/>
        </div>
        <button className="btn pri btn-full" onClick={addSchool} style={{opacity:newSchName.trim()?1:0.45}} disabled={!newSchName.trim()}>+ Add school</button>
      </div>
    </div>
  );

  // SCHOOL view
  if(view==="school"&&activeSch) return (
    <div className="scr">
      <button className="back-btn" onClick={()=>setView("list")}>« All schools</button>
      <div className="school-sect">
        <div>
          <div className="school-sect-name">{activeSch.name}</div>
          <div className="school-sect-meta">{activeSch.plans.length} plan{activeSch.plans.length!==1?"s":""}</div>
        </div>
        <div className="school-sect-actions">
          <button className="school-sect-btn" onClick={()=>{setMode("normal");setView("addPlan")}}>+ New plan</button>
          <button className="school-sect-btn" style={{background:"rgba(192,57,43,0.3)"}} onClick={()=>{if(window.confirm(`Remove ${activeSch.name}?`))removeSchool(activeSchId)}}>✕</button>
        </div>
      </div>
      {activeSch.plans.length===0&&(
        <div style={{textAlign:"center",padding:"24px 0",color:"var(--t3)"}}>
          <div style={{fontSize:28,marginBottom:8}}>📋</div>
          <div style={{fontSize:13,fontWeight:600}}>No plans yet</div>
          <div style={{fontSize:12,marginTop:4}}>Tap "+ New plan" to start adding assets</div>
        </div>
      )}
      {activeSch.plans.map(plan=>{
        const la=(plan.assets||[]).filter(a=>a.fundingChoice==="lease");
        const yr1=la.reduce((s,a)=>s+a.annualPayment,0);
        const capPres=la.reduce((s,a)=>s+Number(a.capital||0),0);
        const slbCap=la.filter(a=>a.isSaleLeaseback).reduce((s,a)=>s+Number(a.capital||0),0);
        return (
          <div key={plan.id} className="scen-card" onClick={()=>{setActivePlanId(plan.id);setAddingAsset(false);setView("addAsset")}}>
            <div className="scen-head">
              <div>
                <div className="scen-nm">{plan.name}</div>
                <div className="scen-meta">Saved {plan.savedAt} · {plan.assets.length} asset{plan.assets.length!==1?"s":""}</div>
              </div>
              <span style={{fontSize:12,color:"var(--t3)"}}>›</span>
            </div>
            <div className="scen-figures">
              {yr1>0&&<div className="scen-fig"><div className="scen-fig-lbl">Annual lease</div><div className="scen-fig-val b">{fmt(yr1)}/yr</div></div>}
              {capPres>0&&<div className="scen-fig"><div className="scen-fig-lbl">Capital saved</div><div className="scen-fig-val g">{fmt(capPres)}</div></div>}
              {slbCap>0&&<div className="scen-fig"><div className="scen-fig-lbl">S&LB raised</div><div className="scen-fig-val p">{fmt(slbCap)}</div></div>}
              <div className="scen-fig"><div className="scen-fig-lbl">Assets</div><div className="scen-fig-val">{plan.assets.length}</div></div>
            </div>
          </div>
        );
      })}
      <button className="btn pri btn-full" style={{marginTop:8}} onClick={()=>{setMode("normal");setView("addPlan")}}>+ Add new plan for {activeSch.name}</button>
    </div>
  );

  // ADD PLAN view
  if(view==="addPlan") return (
    <div className="scr">
      <button className="back-btn" onClick={()=>setView("school")}>« {activeSch?.name}</button>
      <div className="pg-title">New plan</div>
      <div className="pg-sub">for {activeSch?.name}</div>
      <div className="card" style={{marginTop:14}}>
        <div className="fld">
          <label className="lbl">Plan name</label>
          <input className="inp" value={newPlanName} onChange={e=>setNewPlanName(e.target.value)} placeholder="e.g. ICT refresh 2025–26"/>
        </div>
        <div className="fld">
          <label className="lbl">Plan type</label>
          <div className="tab-row" style={{marginBottom:0}}>
            <button className={`tab-btn${mode==="normal"?" active":""}`} onClick={()=>setMode("normal")}>Asset planner</button>
            <button className={`tab-btn${mode==="slb"?" active":""}`} onClick={()=>setMode("slb")}>Sale & leaseback</button>
          </div>
        </div>
        {mode==="slb"&&(
          <div className="ins amber">
            <div className="ins-tag">Sale & leaseback</div>
            <div className="ins-t">Add assets purchased within the last 12 months to release capital.</div>
          </div>
        )}
      </div>
      <div className="btn-row" style={{marginTop:14}}>
        <button className="btn out" onClick={()=>setView("school")}>Cancel</button>
        <button className="btn pri" onClick={addPlan}>Create plan & add assets</button>
      </div>
    </div>
  );

  // ADD ASSET view
  if(view==="addAsset"&&activePlan) {
    const la=activePlan.assets.filter(a=>a.fundingChoice==="lease");
    const ca=activePlan.assets.filter(a=>a.fundingChoice==="capex");
    const totalAnnual=la.reduce((s,a)=>s+a.annualPayment,0);
    const totalCapex=ca.reduce((s,a)=>s+Number(a.capital||0),0);
    const slbCap=la.filter(a=>a.isSaleLeaseback).reduce((s,a)=>s+Number(a.capital||0),0);
    const capPres=la.reduce((s,a)=>s+Number(a.capital||0),0);
    const isSLB=activePlan.mode==="slb";
    return (
      <div className="scr">
        {showQuote&&<QuoteModal assets={la} schoolName={activeSch?.name} onClose={()=>setShowQuote(false)}/>}
        <button className="back-btn" onClick={()=>{setAddingAsset(false);setView("school")}}>« {activeSch?.name}</button>
        <div className="pg-title">{activePlan.name}</div>
        <div className="pg-sub">{activeSch?.name} · {isSLB?"Sale & leaseback":"Asset planner"} · {activePlan.savedAt}</div>
        {activePlan.assets.length>0&&(
          <>
            <div className="sh" style={{marginTop:14}}>{isSLB?"Sale & leaseback assets":"Assets"}</div>
            {activePlan.assets.map(a=>(
              <div key={a.id} className="acard">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div className="acard-name">{a.categoryLabel}{a.subtype?` — ${a.subtype}`:""}</div>
                    <div className="acard-det">Qty: {a.quantity||"—"} · {fmt(Number(a.capital||0))} · {a.replacementYears}yr{a.ageMonths?` · ${a.ageMonths}mo old`:""}</div>
                    <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                      {a.fundingChoice==="lease"?<><span className="badge blue">Lease</span><span style={{fontSize:11,color:"var(--b)",fontWeight:700}}>~{fmt(a.annualPayment)}/yr · {fmt(a.monthlyPayment)}/mo</span></>:<span className="badge red">CapEx</span>}
                      {a.isSaleLeaseback&&<span className="badge purple">S&LB</span>}
                      {a.ledSavings&&a.annualSaving>0&&<span className="badge green">LED: {fmt(a.annualSaving)}/yr saving</span>}
                    </div>
                  </div>
                  <button className="del-btn" onClick={()=>removeAsset(a.id)}>✕</button>
                </div>
              </div>
            ))}
            <div className="card" style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.5px",color:"var(--t3)",marginBottom:10}}>Plan summary</div>
              <div className="mg">
                <div><div style={{fontSize:10,color:"var(--t3)",fontWeight:700}}>Annual lease budget</div><div style={{fontSize:17,fontWeight:800,color:"var(--b)"}}>{fmt(totalAnnual)}/yr</div></div>
                <div><div style={{fontSize:10,color:"var(--t3)",fontWeight:700}}>Capital preserved</div><div style={{fontSize:17,fontWeight:800,color:"var(--green)"}}>{fmt(capPres)}</div></div>
                {totalCapex>0&&<div><div style={{fontSize:10,color:"var(--t3)",fontWeight:700}}>CapEx required</div><div style={{fontSize:15,fontWeight:800,color:"var(--red)"}}>{fmt(totalCapex)}</div></div>}
                {slbCap>0&&<div><div style={{fontSize:10,color:"var(--t3)",fontWeight:700}}>Capital raised (S&LB yr 1)</div><div style={{fontSize:15,fontWeight:800,color:"var(--purple)"}}>{fmt(slbCap)}</div></div>}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <button className="btn grn btn-full" onClick={()=>setShowQuote(true)}>✉ Get formal quote from Room Twelve</button>
            </div>
          </>
        )}
        {!addingAsset?(
          <button className="btn pri btn-full" style={{width:"100%"}} onClick={()=>setAddingAsset(true)}>+ Add {isSLB?"sale & leaseback ":""}asset</button>
        ):(
          <AddAssetForm onAdd={addAsset} onCancel={()=>setAddingAsset(false)} isSaleLeaseback={isSLB}/>
        )}
        {activePlan.assets.length===0&&!addingAsset&&(
          <div style={{textAlign:"center",padding:"24px 0",color:"var(--t3)"}}>
            <div style={{fontSize:28,marginBottom:8}}>◫</div>
            <div style={{fontSize:13,fontWeight:600}}>No assets in this plan yet</div>
            <div style={{fontSize:12,marginTop:4}}>Tap "+ Add asset" below to begin</div>
          </div>
        )}
        {!addingAsset&&(
          <div style={{marginTop:32,paddingTop:16,borderTop:"1px solid var(--brd)"}}>
            <button className="btn out btn-full" style={{color:"var(--red)",borderColor:"rgba(192,57,43,0.3)",fontSize:12}} onClick={()=>{if(window.confirm("Delete this plan? This cannot be undone."))removePlan(activePlanId);}}>🗑 Delete this plan</button>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const HomeScreen = ({ schools, onNavigate }) => {
  const [showConsentInfo,setShowConsentInfo]=useState(false);
  const allPlans    = schools.flatMap(s=>s.plans||[]);
  const allAssets   = allPlans.flatMap(p=>p.assets||[]);
  const la          = allAssets.filter(a=>a.fundingChoice==="lease");
  const totalAnnual = la.reduce((s,a)=>s+a.annualPayment,0);
  const totalCapPres= la.reduce((s,a)=>s+Number(a.capital||0),0);
  const slbCap      = la.filter(a=>a.isSaleLeaseback).reduce((s,a)=>s+Number(a.capital||0),0);
  const ledSavings  = la.filter(a=>a.categoryId==="led").reduce((s,a)=>s+(a.annualSaving||0),0);
  const MAX_YR=5;
  const chartData=Array.from({length:MAX_YR},(_,yi)=>({
    label:ayLabel(AY_START+yi),
    leasePayments:la.reduce((s,a)=>yi<(a.replacementYears||0)?s+a.annualPayment:s,0),
    slbCapital:yi===0?slbCap:0,
    capex:yi===0?allAssets.filter(a=>a.fundingChoice==="capex").reduce((s,a)=>s+Number(a.capital||0),0):0,
  })).filter(d=>d.leasePayments>0||d.slbCapital>0||d.capex>0);

  return (
    <div className="scr">
      <div className="hero">
        <div className="hero-ey">Room Twelve · Strategic Funding Planner</div>
        <div className="hero-val">{schools.length>0?`${schools.length} school${schools.length>1?"s":""} · ${allPlans.length} plan${allPlans.length!==1?"s":""}`:""}</div>
        <div className="hero-sub">{schools.length>0?`${la.length} lease asset${la.length!==1?"s":""} planned`:"Add a school in the Planner tab to get started"}</div>
      </div>
      {schools.length>0&&(
        <>
          <div className="mg" style={{marginBottom:14}}>
            <div className="mc"><div className="ml">Annual lease budget</div><div className="mv blue">{fmt(totalAnnual)}</div><div className="ms">across all plans</div></div>
            <div className="mc"><div className="ml">Capital preserved</div><div className="mv green">{fmt(totalCapPres)}</div><div className="ms">freed by leasing</div></div>
            {slbCap>0&&<div className="mc"><div className="ml">Capital raised (S&LB)</div><div className="mv purple">{fmt(slbCap)}</div><div className="ms">year 1</div></div>}
            <div className="mc"><div className="ml">Schools</div><div className="mv">{schools.length}</div><div className="ms">{allPlans.length} plan{allPlans.length!==1?"s":""}</div></div>
          </div>
          {chartData.length>0&&(
            <div className="card" style={{padding:14,marginBottom:14}}>
              <BudgetChart yearData={chartData} title="Budget overview" subtitle="Lease payments, capital raised & CapEx by academic year"/>
            </div>
          )}
        </>
      )}
      <div className="sh">Smart insights</div>
      {totalCapPres>0?(
        <div className="ins green">
          <div className="ins-tag">Capital position</div>
          <div className="ins-t">Leasing preserves <strong>{fmt(totalCapPres)}</strong> in upfront capital — available for curriculum, maintenance and other priorities.{slbCap>0&&<> Sale & leaseback raises an additional <strong>{fmt(slbCap)}</strong> in year one.</>}{ledSavings>0&&<> LED leases generate an estimated <strong>{fmt(ledSavings)}/yr</strong> in energy savings.</>}</div>
        </div>
      ):(
        <div className="ins green">
          <div className="ins-tag">Leasing opportunity</div>
          <div className="ins-t">Use the planner to identify which equipment can be leased, freeing capital for teaching and learning.</div>
        </div>
      )}
      <div className="ins amber">
        <div className="ins-tag">Capital deficit or unexpected cost?<button className="info-btn" style={{marginLeft:6}} onClick={()=>setShowConsentInfo(v=>!v)}>i</button></div>
        <div className="ins-t">If you've purchased assets on the approved list within the last 12 months, use <strong>sale and leaseback</strong> to release capital.</div>
        {showConsentInfo&&(<div style={{marginTop:8,padding:"8px 10px",background:"rgba(255,255,255,0.6)",borderRadius:6,fontSize:11,color:"var(--navy)",lineHeight:1.6}}><strong>IFRS16 Class Consent 2024 approved assets:</strong><br/>{CLASS_CONSENT.filter(c=>c.leaseAllowed).map(c=>c.label).join(" · ")}</div>)}
        <button className="btn amber-btn" style={{marginTop:10,width:"100%",padding:"10px",fontSize:12}} onClick={()=>onNavigate("input")}>Show me what that looks like →</button>
      </div>
      <div className="ins" style={{background:"var(--sl)",borderColor:"var(--brd)"}}>
        <div className="ins-tag" style={{color:"var(--b)"}}>Secure equipment now — pay in next year's budget</div>
        <div className="ins-t" style={{color:"var(--navy)"}}>In times where equipment is scarce, costs are rising and demand is high, leasing lets you <strong>secure the equipment you need now</strong> and defer the rental payments until the next financial year — protecting this year's budget while guaranteeing supply.</div>
      </div>
      <div className="ins green">
        <div className="ins-tag">Predictable costs protect your budget</div>
        <div className="ins-t" style={{color:"#1a5c3a"}}>Unlike outright purchases, lease payments are <strong>fixed for the full term</strong> — giving you certainty over your budget regardless of inflation, supply chain pressures or future price rises.</div>
      </div>
      <div className="ins" style={{background:"var(--pl)",borderColor:"rgba(107,79,160,0.2)"}}>
        <div className="ins-tag" style={{color:"var(--purple)"}}>Always have the latest technology</div>
        <div className="ins-t" style={{color:"#3d2a6e"}}>Leasing ties your refresh cycle to your lease term — so when the lease ends, you upgrade. <strong>No more using outdated equipment</strong> simply because capital isn't available.</div>
      </div>
      <div className="ins" style={{background:"var(--sl)",borderColor:"var(--brd)"}}>
        <div className="ins-tag" style={{color:"var(--sky)"}}>Spread the cost fairly across beneficiaries</div>
        <div className="ins-t" style={{color:"var(--navy)"}}>When you buy outright, today's budget funds equipment used by students for years to come. Leasing spreads the cost across the period the equipment is in use — <strong>each year's budget pays for that year's benefit</strong>.</div>
      </div>
      <div className="ins" style={{background:"#fff8e6",borderColor:"rgba(212,138,10,0.25)"}}>
        <div className="ins-tag" style={{color:"var(--amber)"}}>Extended warranty — built into the lease</div>
        <div className="ins-t" style={{color:"#7a4d06"}}>If your lease term extends beyond the manufacturer's warranty, consider adding an <strong>extended warranty into your lease payments</strong> — spread at a fixed monthly cost across the term.</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET PLANNING SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const BudgetPlanningScreen = ({ schools }) => {
  const allPlans=schools.flatMap(s=>s.plans||[]);
  if(allPlans.length===0) return (
    <div className="scr">
      <div className="sh" style={{marginTop:4}}>Budget planning</div>
      <div style={{textAlign:"center",padding:"32px 0",color:"var(--t3)"}}>
        <div style={{fontSize:32,marginBottom:8}}>📋</div>
        <div style={{fontSize:13,fontWeight:600}}>No plans saved yet</div>
        <div style={{fontSize:12,marginTop:4}}>Add schools and plans in the Planner tab</div>
      </div>
    </div>
  );
  return (
    <div className="scr">
      <div className="sh" style={{marginTop:4}}>Budget planning</div>
      {schools.map(sch=>{
        const la=sch.plans.flatMap(p=>(p.assets||[]).filter(a=>a.fundingChoice==="lease"));
        const ca=sch.plans.flatMap(p=>(p.assets||[]).filter(a=>a.fundingChoice==="capex"));
        const slbAssets=la.filter(a=>a.isSaleLeaseback);
        const regAssets=la.filter(a=>!a.isSaleLeaseback);
        const annualLease=la.reduce((s,a)=>s+a.annualPayment,0);
        const capPreserved=regAssets.reduce((s,a)=>s+Number(a.capital||0),0);
        const slbCapRaised=slbAssets.reduce((s,a)=>s+Number(a.capital||0),0);
        const MAX_SCH_YR=Math.max(5,...la.map(a=>a.replacementYears||0));
        const schYears=Array.from({length:Math.min(MAX_SCH_YR,10)},(_,yi)=>({
          label:ayLabel(AY_START+yi),
          leasePayments:la.reduce((s,a)=>yi<(a.replacementYears||0)?s+a.annualPayment:s,0),
          slbCapital:yi===0?slbCapRaised:0,
          capex:yi===0?ca.reduce((s,a)=>s+Number(a.capital||0),0):0,
        })).filter(d=>d.leasePayments>0||d.slbCapital>0||d.capex>0);
        return (
          <div key={sch.id} className="card" style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div><div className="school-nm">{sch.name}</div><div className="school-mt">{sch.plans.length} plan{sch.plans.length!==1?"s":""}</div></div>
              <button className="btn grn" style={{flex:"none",padding:"6px 12px",fontSize:11}} onClick={()=>exportToExcel(sch.plans,sch.name,"","individual")}>📥 Export</button>
            </div>
            <div className="mg" style={{marginBottom:12}}>
              <div><div style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>Annual lease</div><div style={{fontSize:15,fontWeight:800,color:"var(--b)"}}>{fmt(annualLease)}/yr</div></div>
              {capPreserved>0&&<div><div style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>Capital saved</div><div style={{fontSize:15,fontWeight:800,color:"var(--green)"}}>{fmt(capPreserved)}</div></div>}
              {slbCapRaised>0&&<div><div style={{fontSize:9,color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>S&LB raised</div><div style={{fontSize:15,fontWeight:800,color:"var(--purple)"}}>{fmt(slbCapRaised)}</div></div>}
            </div>
            {slbCapRaised>0&&(<div className="ins purple" style={{marginBottom:10}}><div className="ins-tag">Sale & leaseback</div><div className="ins-t"><strong>{fmt(slbCapRaised)}</strong> capital raised in year one · lease payments of <strong>{fmt(annualLease)}/yr</strong> spread over the term.</div></div>)}
            {schYears.length>0&&<BudgetChart yearData={schYears}/>}
          </div>
        );
      })}
      {schools.length>0&&(
        <>
          <div className="export-bar"><button className="btn grn btn-full" style={{flex:1}} onClick={()=>exportToExcel(allPlans,"","","consolidated")}>📥 Export all schools (CSV)</button></div>
          <div className="export-note">Year-by-year lease schedule · all schools · asset descriptions</div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const SummaryScreen = ({ schools }) => {
  const allPlans  = schools.flatMap(s=>s.plans||[]);
  const allAssets = allPlans.flatMap(p=>p.assets||[]);
  const la        = allAssets.filter(a=>a.fundingChoice==="lease");
  const ca        = allAssets.filter(a=>a.fundingChoice==="capex");
  const newLeaseCapital  = la.filter(a=>!a.isSaleLeaseback).reduce((s,a)=>s+Number(a.capital||0),0);
  const totalCapex       = ca.reduce((s,a)=>s+Number(a.capital||0),0);
  const totalIfBoughtOut = newLeaseCapital+totalCapex;
  const totalAnnual      = la.reduce((s,a)=>s+a.annualPayment,0);
  const slbCapital       = la.filter(a=>a.isSaleLeaseback).reduce((s,a)=>s+Number(a.capital||0),0);
  const totalCapPres     = la.reduce((s,a)=>s+Number(a.capital||0),0);
  const ledSavings       = la.filter(a=>a.categoryId==="led").reduce((s,a)=>s+(a.annualSaving||0),0);
  const MAX_YR=10;
  const yearSched=Array.from({length:MAX_YR},(_,yi)=>{
    const lease=la.reduce((s,a)=>yi<(a.replacementYears||0)?s+a.annualPayment:s,0);
    const slb=yi===0?slbCapital:0;
    return {label:ayLabel(AY_START+yi),leasePayments:lease,slbCapital:slb,ledSaving:yi<7?ledSavings:0};
  }).filter(d=>d.leasePayments>0||d.slbCapital>0);
  const chartData=yearSched.map(d=>({...d,capex:0}));

  if(schools.length===0||allPlans.length===0) return (
    <div className="scr">
      <div className="sh" style={{marginTop:4}}>Summary</div>
      <div className="ins"><div className="ins-tag">No data yet</div><div className="ins-t">Add schools and save plans in the planner to see your summary here.</div></div>
    </div>
  );
  return (
    <div className="scr">
      <div className="sh" style={{marginTop:4}}>Summary</div>
      <div className="hero" style={{marginBottom:14}}>
        <div className="hero-ey">Upfront capital preserved by leasing</div>
        <div className="hero-val">{fmt(totalCapPres)}</div>
        <div className="hero-sub">available for curriculum, maintenance & priorities</div>
      </div>
      <div className="mg" style={{marginBottom:14}}>
        <div className="mc"><div className="ml">If purchased outright (yr 1)</div><div className="mv red">{fmt(totalIfBoughtOut)}</div></div>
        <div className="mc"><div className="ml">Using lease strategy</div><div className="mv blue">{fmt(totalAnnual)}/yr</div></div>
        {totalCapex>0&&<div className="mc"><div className="ml">CapEx committed</div><div className="mv amber">{fmt(totalCapex)}</div></div>}
        {slbCapital>0&&<div className="mc"><div className="ml">Capital raised via S&LB</div><div className="mv purple">{fmt(slbCapital)}</div></div>}
      </div>
      <div className="ins green">
        <div className="ins-tag">Capital position</div>
        <div className="ins-t">By leasing rather than buying outright, <strong>{fmt(totalCapPres)}</strong> of capital is preserved in year one.{slbCapital>0&&<> Sale and leaseback raises an additional <strong>{fmt(slbCapital)}</strong> in year one.</>}{ledSavings>0&&<> LED leases generate <strong>{fmt(ledSavings)}/yr</strong> in energy savings.</>}</div>
      </div>
      {chartData.length>0&&(
        <div className="card" style={{padding:14,marginBottom:12}}>
          <BudgetChart yearData={chartData} title="Budget over time" subtitle="Annual lease payments & capital raised through sale and leaseback"/>
        </div>
      )}
      {yearSched.length>0&&(
        <>
          <div className="sh">Lease payment schedule</div>
          <div className="card" style={{padding:14,marginBottom:12}}>
            <table className="sum-table">
              <thead><tr><th>Academic year</th><th style={{textAlign:"right"}}>Lease payments</th>{slbCapital>0&&<th style={{textAlign:"right"}}>S&LB capital raised</th>}{ledSavings>0&&<th style={{textAlign:"right"}}>LED savings</th>}</tr></thead>
              <tbody>{yearSched.map((y,i)=><tr key={i}><td>{y.label}</td><td className="bl">{fmt(y.leasePayments)}</td>{slbCapital>0&&<td className="pu">{y.slbCapital>0?fmt(y.slbCapital):"—"}</td>}{ledSavings>0&&<td className="grn">{fmt(y.ledSaving)}</td>}</tr>)}</tbody>
            </table>
          </div>
        </>
      )}
      <div className="export-bar"><button className="btn grn btn-full" style={{flex:1}} onClick={()=>exportToExcel(allPlans,"","","consolidated")}>📥 Export summary to CSV</button></div>
      <div className="export-note">Year-by-year lease payments · all schools · asset descriptions</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MORE SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const MoreScreen = () => (
  <div className="scr">
    <div className="sh" style={{marginTop:4}}>Powered by Room Twelve</div>
    <div className="card">
      <div style={{marginBottom:12}}><Logo height={28} light={false}/></div>
      <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.65}}>Room Twelve is a profit-for-purpose funding specialist for UK Education institutions and the wider Public Sector, offering fully compliant leases on several Government approved Frameworks.</p>
      <div className="accred-wrap">{["Everything ICT Framework","ASCL Preferred Supplier","DfE Compliant","Hertfordshire DPS"].map(t=><div key={t} className="accred-tag">{t}</div>)}</div>
      <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid var(--brd)",fontSize:11,color:"var(--t3)",lineHeight:1.7,fontWeight:600}}>
        020 3301 1240 · info@room12.com<br/>London: Peek House, 20 Eastcheap, EC3M 1EB<br/>Lincoln: Unit 1, Marine Studios, Burton Waters, LN1 2UA
      </div>
      <div style={{fontSize:10,color:"var(--t3)",marginTop:8,fontWeight:600}}>Strategic Funding Planner v2.1</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
const NAV=[
  {id:"home",    icon:"⌂",  label:"Home"},
  {id:"input",   icon:"＋",  label:"Planner"},
  {id:"budget",  icon:"◫",  label:"Budget"},
  {id:"summary", icon:"📊", label:"Summary"},
  {id:"more",    icon:"···",label:"More"},
];

export default function RoomTwelve() {
  const [tab,     setTab]     = useState("home");
  const [schools, setSchools] = useState([]);
  const navigateTo = (t) => setTab(t);

  const screens={
    home:    <HomeScreen    schools={schools} onNavigate={navigateTo}/>,
    input:   <InputScreen   schools={schools} setSchools={setSchools}/>,
    budget:  <BudgetPlanningScreen schools={schools}/>,
    summary: <SummaryScreen schools={schools}/>,
    more:    <MoreScreen/>,
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="topbar"><Logo/></div>
        <div className="sub-hdr">
          <div className="sub-hdr-t">Strategic Funding Planner</div>
          <div className="sub-hdr-t">2025–26</div>
        </div>
        <div key={tab}>{screens[tab]}</div>
        <div className="bnav">
          {NAV.map(item=>(
            <button key={item.id} className={`ni${tab===item.id?" active":""}`} onClick={()=>setTab(item.id)}>
              <span className="ni-ico">{item.icon}</span>
              <span className="ni-lbl">{item.label}</span>
              <div className="ni-bar"/>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
