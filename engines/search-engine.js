// SSDK Search Engine - Indexes and fuzzy-matches tools dynamically
// Coordinates caching, score weightings, recent searches history and auto-suggestions.

export class SearchEngine {
  constructor() {
    this.core = null;
    this.historyKey = "ssdk-recent-searches";
  }

  async init(core) {
    this.core = core;
  }

  /**
   * Search tool manifests against query parameters with weighted relevance scoring.
   */
  async search(query) {
    const q = query.trim().toLowerCase();
    const config = this.core.getEngine("config");
    const tools = await config.getTools();

    if (!q) return tools;

    // Weighted Fuzzy rank scoring
    const results = tools.map(tool => {
      let score = 0;
      const name = (tool.name || "").toLowerCase();
      const desc = (tool.description || "").toLowerCase();
      const cat = (tool.category || "").toLowerCase();
      const sub = (tool.subcategory || "").toLowerCase();
      
      // Strict matching matches
      if (name === q) {
        score += 150;
      } else if (name.startsWith(q)) {
        score += 80;
      } else if (name.includes(q)) {
        score += 40;
      }

      if (desc.includes(q)) {
        score += 15;
      }
      if (cat.includes(q)) {
        score += 25;
      }
      if (sub.includes(q)) {
        score += 35;
      }

      // Tag/Keyword matches
      if (tool.keywords && Array.isArray(tool.keywords)) {
        tool.keywords.forEach(kw => {
          const cleanKw = kw.toLowerCase();
          if (cleanKw === q) {
            score += 60;
          } else if (cleanKw.includes(q)) {
            score += 30;
          }
        });
      }

      if (tool.tags && Array.isArray(tool.tags)) {
        tool.tags.forEach(tag => {
          const cleanTag = tag.toLowerCase();
          if (cleanTag === q) {
            score += 50;
          } else if (cleanTag.includes(q)) {
            score += 20;
          }
        });
      }

      // Add small boost for popular/featured tools to resolve ties
      if (tool.featured) {
        score += 5;
      }

      return { tool, score };
    });

    return results
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.tool);
  }

  /**
   * Returns list of auto-suggestions based on initial letter inputs.
   */
  async getSuggestions(query) {
    if (!query || query.trim().length < 2) return [];
    const list = await this.search(query);
    return list.slice(0, 5).map(t => t.name);
  }

  getRecentSearches() {
    try {
      const stored = localStorage.getItem(this.historyKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn("[SearchEngine] Failed to read recent searches", e);
      return [];
    }
  }

  addRecentSearch(query) {
    const clean = query.trim();
    if (!clean || clean.length < 2) return;

    let list = this.getRecentSearches();
    list = list.filter(q => q.toLowerCase() !== clean.toLowerCase());
    list.unshift(clean);

    if (list.length > 5) {
      list.pop();
    }
    localStorage.setItem(this.historyKey, JSON.stringify(list));
  }

  clearRecentSearches() {
    localStorage.removeItem(this.historyKey);
  }
}
