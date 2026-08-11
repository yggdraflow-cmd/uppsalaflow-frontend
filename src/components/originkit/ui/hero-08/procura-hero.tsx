// Delivered by Originkit · stack: nextjs · styling: tailwind
"use client";

"use client";

import type { ReactNode } from "react";
import TextSphere from "@/components/originkit/ui/hero-08/text-sphere";

function asset(file: string) {
  return `/originkit/hero-08/${file}`;
}

const assets = {
  arrowUpRight: asset("arrow.svg"),
  pattern: asset("pattern.svg"),
  railTexture: asset("rail-texture.svg"),
  avatarOne: asset("avatar-emily.png"),
  avatarTwo: asset("avatar-david.png"),
  cornerMarkPanel: asset("corner-panel.svg"),
  cornerMarkRow: asset("corner-row.svg"),
  logomark: asset("logo-mark.svg"),
  logotype: asset("logo-type.svg"),
  logotype1: asset("logo-ipsum.svg"),
  logotype2: asset("logo-lly.svg"),
  logotype3: asset("logo-looo.svg"),
  menuIcon: asset("menu.svg"),
};

type NavItem = { label: string; href: string };
type Testimonial = { name: string; role: string; avatar: string };
type Stat = { label: string; value: string };

type ProcuraHeroProps = {
  brand?: string;
  navItems?: NavItem[];
  headerCta?: { label: string; href: string };
  title?: string;
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  testimonials?: [Testimonial, Testimonial];
  trustedLabel?: string;
  stats?: [Stat, Stat, Stat];
  /**
   * The word-cloud globe graphic on the right. Pass your own component/markup
   * here (e.g. a canvas/WebGL globe) — it's clipped to the design circle.
   * Falls back to TextSphere.
   */
  globe?: ReactNode;
};

const defaultNavItems: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "Tools", href: "#tools" },
];

const defaultTestimonials: [Testimonial, Testimonial] = [
  { name: "Emily Carter", role: "Design Manager", avatar: assets.avatarOne },
  { name: "David Kim", role: "NovaTech", avatar: assets.avatarTwo },
];

const defaultStats: [Stat, Stat, Stat] = [
  { label: "Total value locked", value: "$1.5M" },
  { label: "Intent processed", value: "3.2M" },
  { label: "Connected chains", value: "300" },
];

function ArrowIcon() {
  return <img alt="" src={assets.arrowUpRight} />;
}

function CornerMarks() {
  return (
    <>
      <img alt="" className="h08-cornerMark h08-tl" src={assets.cornerMarkPanel} />
      <img alt="" className="h08-cornerMark h08-tr" src={assets.cornerMarkPanel} />
      <img alt="" className="h08-cornerMark h08-bl" src={assets.cornerMarkPanel} />
      <img alt="" className="h08-cornerMark h08-br" src={assets.cornerMarkPanel} />
    </>
  );
}

/**
 * Procura AI word-globe hero from
 * https://github.com/moleeforx-del/word-globe-right
 */
export function ProcuraHero({
  brand = "Procura AI",
  navItems = defaultNavItems,
  headerCta = { label: "Get Started", href: "#get-started" },
  title = "Every Purchase Starts With a Conversation.",
  description = "Meet Procura AI, the intelligent procurement assistant that captures purchase requests,  without losing control.",
  primaryCta = { label: "Get Started", href: "#get-started" },
  secondaryCta = { label: "Book a Call", href: "#book-a-call" },
  testimonials = defaultTestimonials,
  trustedLabel = "Trusted by people from",
  stats = defaultStats,
  globe,
}: ProcuraHeroProps) {
  return (
    <section className="h08-hero" data-node-id="384:2415">
      <header className="h08-nav">
        <div className="h08-navInner">
          <a className="h08-brand" href="#">
            {brand}
          </a>
          <nav className="h08-navLinks" aria-label="Main navigation">
            {navItems.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>
          <a className="h08-ctaButton" href={headerCta.href}>
            <span>{headerCta.label}</span>
            <ArrowIcon />
          </a>
          <button className="h08-menuButton" type="button" aria-label="Open menu">
            <img alt="" src={assets.menuIcon} />
          </button>
        </div>
      </header>

      <div className="h08-main">
        <div className="h08-rail h08-railLeft" aria-hidden="true">
          <img alt="" src={assets.railTexture} />
        </div>

        <img
          alt=""
          aria-hidden="true"
          className="h08-cornerMark h08-canvasOriginMark"
          src={assets.cornerMarkPanel}
        />

        <div className="h08-canvas">
          <img alt="" aria-hidden="true" className="h08-pattern" src={assets.pattern} />

          <div className="h08-contentRow">
            <div className="h08-copy">
              <div className="h08-headingGroup">
                <h1 className="h08-title">{title}</h1>
                <p className="h08-description">{description}</p>
              </div>
              <div className="h08-ctaRow">
                <a className="h08-primaryCta" href={primaryCta.href}>
                  <span>{primaryCta.label}</span>
                  <ArrowIcon />
                </a>
                <a className="h08-secondaryCta" href={secondaryCta.href}>
                  {secondaryCta.label}
                </a>
              </div>
            </div>

            <div className="h08-visual">
              <CornerMarks />
              <div className="h08-sphereSlot">
                {globe ?? <TextSphere word="procura" speed={6} twist={50} letterSpacing={800} />}
              </div>

              <div className="h08-testimonial h08-testimonialFirst">
                <img alt="" className="h08-avatar" src={testimonials[0].avatar} />
                <div>
                  <p className="h08-testimonialName">{testimonials[0].name}</p>
                  <p className="h08-testimonialRole">{testimonials[0].role}</p>
                </div>
              </div>

              <div className="h08-testimonial h08-testimonialSecond">
                <img alt="" className="h08-avatar" src={testimonials[1].avatar} />
                <div>
                  <p className="h08-testimonialName">{testimonials[1].name}</p>
                  <p className="h08-testimonialRole">{testimonials[1].role}</p>
                </div>
              </div>
            </div>
          </div>

          <p className="h08-trustedLabel">{trustedLabel}</p>

          <div className="h08-trustedRow">
            <div className="h08-logoStrip">
              <div className="h08-logoCell">
                <span className="h08-logoMark">
                  <img alt="" src={assets.logomark} />
                  <img alt="Logoipsum" src={assets.logotype} />
                </span>
              </div>
              <div className="h08-logoCell">
                <img alt="Partner logo" src={assets.logotype1} />
              </div>
              <div className="h08-logoCell">
                <img alt="Partner logo" src={assets.logotype2} />
              </div>
              <div className="h08-logoCell">
                <img alt="Partner logo" src={assets.logotype3} />
              </div>

              <img alt="" className="h08-cornerMark" style={{ top: -7, left: -8 }} src={assets.cornerMarkRow} />
              <img alt="" className="h08-cornerMark" style={{ bottom: -7, left: -8 }} src={assets.cornerMarkRow} />
              <img alt="" className="h08-cornerMark" style={{ bottom: -7, right: -7 }} src={assets.cornerMarkRow} />
              <img alt="" className="h08-cornerMark h08-tabletLogoTopRight" src={assets.cornerMarkRow} />
            </div>

            <div className="h08-statsStrip">
              {stats.map((stat) => (
                <div className="h08-statCell" key={stat.label}>
                  <p className="h08-statLabel">{stat.label}</p>
                  <p className="h08-statValue">{stat.value}</p>
                </div>
              ))}

              <img alt="" className="h08-cornerMark" style={{ bottom: -7, right: -7 }} src={assets.cornerMarkRow} />
              <img alt="" className="h08-cornerMark h08-tabletStatsBottomLeft" src={assets.cornerMarkRow} />
            </div>
          </div>
        </div>

        <div className="h08-rail h08-railRight" aria-hidden="true">
          <img alt="" src={assets.railTexture} />
        </div>
      </div>
    </section>
  );
}
