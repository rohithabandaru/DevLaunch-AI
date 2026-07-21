import { getSeoDescription, getSeoTitle, SKILL_CATEGORIES } from "@/lib/portfolio";
import type { PortfolioData } from "@/types/portfolio";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sectionTitle(text: string): string {
  return `<h2 class="section-title">${escapeHtml(text)}</h2>`;
}

/** Generate a self-contained static HTML portfolio for download/deploy. */
export function buildStaticPortfolioHtml(data: PortfolioData): string {
  const title = escapeHtml(getSeoTitle(data));
  const description = escapeHtml(getSeoDescription(data));
  const isDark = data.themeMode === "dark";
  const accent = data.accentColor || "#4f46e5";
  const bg = isDark ? "#0b1220" : "#ffffff";
  const fg = isDark ? "#e2e8f0" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#64748b";
  const card = isDark ? "#111827" : "#f8fafc";
  const border = isDark ? "#1f2937" : "#e2e8f0";

  const skillsByCat = SKILL_CATEGORIES.map((cat) => {
    const items = data.skills.filter(
      (s) => s.category === cat.id && s.name.trim()
    );
    if (!items.length) return "";
    return `
      <div class="skill-group">
        <h3>${escapeHtml(cat.label)}</h3>
        <div class="skill-list">
          ${items
            .map(
              (s) => `
            <div class="skill-row">
              <div class="skill-meta"><span>${escapeHtml(s.name)}</span><span>${s.level}%</span></div>
              <div class="bar"><span style="width:${Math.min(100, Math.max(0, s.level))}%"></span></div>
            </div>`
            )
            .join("")}
        </div>
      </div>`;
  }).join("");

  const projects = data.projects
    .filter((p) => p.name.trim() || p.description.trim())
    .map(
      (p) => `
      <article class="card project">
        ${p.featured ? `<span class="badge">Featured</span>` : ""}
        <h3>${escapeHtml(p.name || "Project")}</h3>
        <p>${escapeHtml(p.description || "")}</p>
        <p class="tech">${escapeHtml(p.technologies.join(" · "))}</p>
        <div class="links">
          ${p.github ? `<a href="${escapeHtml(p.github)}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
          ${p.liveDemo ? `<a href="${escapeHtml(p.liveDemo)}" target="_blank" rel="noreferrer">Live Demo</a>` : ""}
        </div>
      </article>`
    )
    .join("");

  const timeline = (items: PortfolioData["experience"], heading: string) => {
    const rows = items
      .filter((i) => i.title.trim() || i.organization.trim())
      .map(
        (i) => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div>
            <h3>${escapeHtml(i.title || "Role")}</h3>
            <p class="meta">${escapeHtml(i.organization)}${i.location ? ` · ${escapeHtml(i.location)}` : ""}</p>
            <p class="meta">${escapeHtml(i.startDate)}${i.current ? " – Present" : i.endDate ? ` – ${escapeHtml(i.endDate)}` : ""}</p>
            <p>${escapeHtml(i.description)}</p>
          </div>
        </div>`
      )
      .join("");
    if (!rows) return "";
    return `<section id="${heading.toLowerCase()}">${sectionTitle(heading)}<div class="timeline">${rows}</div></section>`;
  };

  const certs = data.certifications
    .filter((c) => c.name.trim())
    .map(
      (c) =>
        `<li><strong>${escapeHtml(c.name)}</strong> — ${escapeHtml(c.issuer)}${c.date ? ` (${escapeHtml(c.date)})` : ""}</li>`
    )
    .join("");

  const achievements = data.achievements
    .filter((a) => a.title.trim())
    .map(
      (a) =>
        `<li><strong>${escapeHtml(a.title)}</strong>${a.year ? ` (${escapeHtml(a.year)})` : ""} — ${escapeHtml(a.description)}</li>`
    )
    .join("");

  const services =
    data.showServices && data.services.some((s) => s.title.trim())
      ? `<section id="services">${sectionTitle("Services")}<div class="grid">${data.services
          .filter((s) => s.title.trim())
          .map(
            (s) =>
              `<article class="card"><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.description)}</p></article>`
          )
          .join("")}</div></section>`
      : "";

  const testimonials = data.testimonials
    .filter((t) => t.quote.trim())
    .map(
      (t) => `
      <blockquote class="card">
        <p>“${escapeHtml(t.quote)}”</p>
        <footer>— ${escapeHtml(t.name)}${t.role ? `, ${escapeHtml(t.role)}` : ""}${t.company ? ` at ${escapeHtml(t.company)}` : ""}</footer>
      </blockquote>`
    )
    .join("");

  const blog =
    data.showBlog && data.blogPosts.some((b) => b.title.trim())
      ? `<section id="blog">${sectionTitle("Blog")}<div class="grid">${data.blogPosts
          .filter((b) => b.title.trim())
          .map(
            (b) =>
              `<article class="card"><h3>${b.url ? `<a href="${escapeHtml(b.url)}" target="_blank" rel="noreferrer">${escapeHtml(b.title)}</a>` : escapeHtml(b.title)}</h3><p>${escapeHtml(b.excerpt)}</p><p class="meta">${escapeHtml(b.date)}</p></article>`
          )
          .join("")}</div></section>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta name="twitter:card" content="summary_large_image" />
  ${data.customDomain ? `<link rel="canonical" href="https://${escapeHtml(data.customDomain)}" />` : ""}
  <style>
    :root { --accent: ${accent}; --bg: ${bg}; --fg: ${fg}; --muted: ${muted}; --card: ${card}; --border: ${border}; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: var(--bg); color: var(--fg); line-height: 1.6; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .wrap { max-width: 960px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    nav { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
    nav .links { display: flex; gap: 0.9rem; flex-wrap: wrap; font-size: 0.9rem; color: var(--muted); }
    .hero { display: grid; gap: 1.5rem; margin-bottom: 3.5rem; }
    @media (min-width: 768px) { .hero { grid-template-columns: 1.4fr 0.8fr; align-items: center; } }
    .eyebrow { color: var(--accent); font-weight: 700; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; }
    h1 { font-size: clamp(2rem, 4vw, 3rem); line-height: 1.1; margin: 0.4rem 0; }
    .title { color: var(--accent); font-weight: 600; margin: 0; }
    .lead { color: var(--muted); max-width: 40rem; }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.7rem 1.1rem; border-radius: 0.75rem; font-weight: 600; border: 1px solid transparent; }
    .btn-primary { background: var(--accent); color: white; }
    .btn-ghost { border-color: var(--border); color: var(--fg); background: transparent; }
    .avatar { width: 160px; height: 160px; border-radius: 1.5rem; background: linear-gradient(135deg, var(--accent), #a855f7); display: grid; place-items: center; color: white; font-size: 2.5rem; font-weight: 800; margin-left: auto; margin-right: auto; }
    section { margin: 3rem 0; scroll-margin-top: 1.5rem; }
    .section-title { font-size: 1.35rem; margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border); }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.1rem 1.2rem; }
    .grid { display: grid; gap: 1rem; }
    @media (min-width: 700px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    .badge { display: inline-block; font-size: 0.7rem; font-weight: 700; color: white; background: var(--accent); padding: 0.15rem 0.5rem; border-radius: 999px; margin-bottom: 0.4rem; }
    .tech, .meta { color: var(--muted); font-size: 0.9rem; }
    .skill-group { margin-bottom: 1.25rem; }
    .skill-group h3 { font-size: 0.95rem; margin: 0 0 0.6rem; }
    .skill-row { margin-bottom: 0.55rem; }
    .skill-meta { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.2rem; }
    .bar { height: 8px; background: var(--border); border-radius: 999px; overflow: hidden; }
    .bar span { display: block; height: 100%; background: var(--accent); }
    .timeline { display: grid; gap: 1.25rem; border-left: 2px solid var(--border); padding-left: 1.1rem; }
    .timeline-item { position: relative; }
    .timeline-dot { position: absolute; left: -1.42rem; top: 0.35rem; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }
    footer { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid var(--border); color: var(--muted); font-size: 0.9rem; text-align: center; }
    form { display: grid; gap: 0.75rem; }
    input, textarea { width: 100%; padding: 0.7rem 0.8rem; border-radius: 0.7rem; border: 1px solid var(--border); background: var(--bg); color: var(--fg); font: inherit; }
    button[type=submit] { justify-self: start; }
  </style>
</head>
<body>
  <div class="wrap">
    <nav>
      <strong>${escapeHtml(data.fullName || "Portfolio")}</strong>
      <div class="links">
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#experience">Experience</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>

    <header class="hero">
      <div>
        <div class="eyebrow">Hello, I'm</div>
        <h1>${escapeHtml(data.fullName || "Your Name")}</h1>
        <p class="title">${escapeHtml(data.title || "Professional Title")}</p>
        <p class="lead">${escapeHtml(data.introduction || "Your introduction appears here.")}</p>
        <div class="actions">
          ${data.resumeUrl ? `<a class="btn btn-primary" href="${escapeHtml(data.resumeUrl)}" target="_blank" rel="noreferrer">Download Resume</a>` : ""}
          <a class="btn btn-ghost" href="#contact">${escapeHtml(data.heroCtaLabel || "Contact")}</a>
        </div>
      </div>
      <div class="avatar" aria-hidden="true">${escapeHtml((data.fullName || "Y").trim().charAt(0).toUpperCase())}</div>
    </header>

    <section id="about">
      ${sectionTitle("About")}
      <p>${escapeHtml(data.biography || "Your biography will appear here.")}</p>
      ${data.careerObjective ? `<p><strong>Career objective:</strong> ${escapeHtml(data.careerObjective)}</p>` : ""}
      ${data.yearsExperience ? `<p><strong>Experience:</strong> ${escapeHtml(data.yearsExperience)} years</p>` : ""}
    </section>

    <section id="skills">
      ${sectionTitle("Skills")}
      ${data.skillsSummary ? `<p class="lead">${escapeHtml(data.skillsSummary)}</p>` : ""}
      ${skillsByCat || "<p class='meta'>Add skills in the builder.</p>"}
    </section>

    <section id="projects">
      ${sectionTitle("Projects")}
      <div class="grid">${projects || "<p class='meta'>Add projects in the builder.</p>"}</div>
    </section>

    ${timeline(data.experience, "Experience")}
    ${timeline(data.education, "Education")}

    ${certs ? `<section id="certifications">${sectionTitle("Certifications")}<ul>${certs}</ul></section>` : ""}
    ${achievements ? `<section id="achievements">${sectionTitle("Achievements")}<ul>${achievements}</ul></section>` : ""}
    ${services}
    ${testimonials ? `<section id="testimonials">${sectionTitle("Testimonials")}<div class="grid">${testimonials}</div></section>` : ""}
    ${blog}

    <section id="contact">
      ${sectionTitle("Contact")}
      <p>
        ${data.email ? `Email: <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a><br/>` : ""}
        ${data.phone ? `Phone: ${escapeHtml(data.phone)}<br/>` : ""}
        ${data.location ? `Location: ${escapeHtml(data.location)}<br/>` : ""}
        ${data.linkedin ? `<a href="${escapeHtml(data.linkedin)}" target="_blank" rel="noreferrer">LinkedIn</a> · ` : ""}
        ${data.github ? `<a href="${escapeHtml(data.github)}" target="_blank" rel="noreferrer">GitHub</a> · ` : ""}
        ${data.portfolioUrl ? `<a href="${escapeHtml(data.portfolioUrl)}" target="_blank" rel="noreferrer">Website</a>` : ""}
      </p>
      <form onsubmit="event.preventDefault(); alert('Thanks! Connect this form to your backend or Formspree for production.');">
        <input name="name" placeholder="Your name" required />
        <input name="email" type="email" placeholder="Your email" required />
        <textarea name="message" rows="4" placeholder="Your message" required></textarea>
        <button class="btn btn-primary" type="submit">Send message</button>
      </form>
    </section>

    <footer>
      <p>© ${new Date().getFullYear()} ${escapeHtml(data.fullName || "Portfolio")}. ${escapeHtml(data.footerTagline || "")}</p>
      ${data.customDomain ? `<p>Custom domain: ${escapeHtml(data.customDomain)}</p>` : ""}
    </footer>
  </div>
</body>
</html>`;
}

export function downloadStaticPortfolio(data: PortfolioData) {
  const html = buildStaticPortfolioHtml(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = data.slug || "portfolio";
  a.href = url;
  a.download = `${slug}-portfolio.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
