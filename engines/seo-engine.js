// SSDK SEO Engine - Manages dynamic page titles, descriptions, metadata and JSON-LD crawlers schemas
// Compiles dynamic Open Graph blocks and formats local sitemap XML indices.

export class SEOEngine {
  constructor() {
    this.core = null;
  }

  async init(core) {
    this.core = core;
  }

  /**
   * Applies metadata configuration parameters onto the document header.
   */
  updateMetadata(tool) {
    if (!tool) return;

    // Set Title
    document.title = `${tool.name} • Free ${tool.category} - SSDK TOOLS HUB`;

    // Update Description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.name = "description";
      document.head.appendChild(descMeta);
    }
    descMeta.content = tool.description;

    // Open Graph Elements
    this.setOGMeta("og:title", `${tool.name} • SSDK TOOLS HUB`);
    this.setOGMeta("og:description", tool.description);
    this.setOGMeta("og:type", "website");
    this.setOGMeta("og:url", window.location.href);

    // Inject JSON-LD Schema
    this.injectJSONLD(tool);
  }

  setOGMeta(property, content) {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", property);
      document.head.appendChild(el);
    }
    el.content = content;
  }

  injectJSONLD(tool) {
    // Remove existing schemas if any
    const existing = document.getElementById("ssdk-jsonld-schema");
    if (existing) {
      existing.remove();
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": tool.name,
      "description": tool.description,
      "url": window.location.href,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "author": {
        "@type": "Person",
        "name": "Swarnava Das"
      }
    };

    const script = document.createElement("script");
    script.id = "ssdk-jsonld-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  /**
   * Generates a standard XML sitemap for search crawlers indexing.
   */
  async generateSitemapXML() {
    const config = this.core.getEngine("config");
    const tools = await config.getTools();
    const domain = window.location.origin;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add homepage
    xml += `  <url>\n    <loc>${domain}/index.html</loc>\n    <priority>1.00</priority>\n  </url>\n`;

    // Add static sheets
    const pages = ["about.html", "contact.html", "faq.html", "login.html"];
    pages.forEach(p => {
      xml += `  <url>\n    <loc>${domain}/pages/${p}</loc>\n    <priority>0.50</priority>\n  </url>\n`;
    });

    // Add all registered tools
    tools.forEach(t => {
      xml += `  <url>\n    <loc>${domain}/${t.url}</loc>\n    <priority>0.80</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  }
}
