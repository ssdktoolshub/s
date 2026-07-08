// SSDK Config Engine - Manifest Database Loader & Parser
// Configures and caches database objects from the /assets/json/ store, merging Firestore items.

export class ConfigEngine {
  constructor(prefix = ".") {
    this.prefix = prefix;
    this.cache = {};
  }

  /**
   * Loads a JSON config file from the assets/json database.
   */
  async loadJSON(filename) {
    if (this.cache[filename]) {
      return this.cache[filename];
    }
    
    try {
      const response = await fetch(`${this.prefix}/assets/json/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status} loading ${filename}`);
      }
      const data = await response.json();
      this.cache[filename] = data;
      return data;
    } catch (e) {
      console.error(`[ConfigEngine] Failed to load JSON manifest [${filename}]:`, e);
      return null;
    }
  }

  /**
   * Fetches the entire tools registry index database.
   * Dynamically queries Firestore to merge dynamic tools from the Admin Panel.
   */
  async getTools() {
    const staticTools = await this.loadJSON("tools.json") || [];
    
    // Attempt to merge dynamic tools from Firestore if online
    const firebaseEngine = this.core ? this.core.getEngine("firebase") : null;
    if (firebaseEngine && firebaseEngine.db) {
      try {
        const snap = await firebaseEngine.db.collection("tools").get();
        const dynamicTools = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.n || data.name,
            category: data.cat || data.category,
            description: data.d || data.description,
            icon: data.i || data.icon,
            url: data.u || data.url,
            type: data.type || "js",
            featured: data.featured || false,
            addedDate: data.addedDate || new Date().toISOString().split("T")[0]
          };
        });
        
        // Merge without duplicate IDs
        const merged = [...staticTools];
        dynamicTools.forEach(t => {
          if (!merged.some(m => m.id === t.id)) {
            merged.push(t);
          }
        });
        return merged;
      } catch (err) {
        console.warn("[ConfigEngine] Failed to load dynamic tools, using static fallback:", err);
      }
    }
    return staticTools;
  }

  /**
   * Fetches the list of active categories.
   */
  async getCategories() {
    return await this.loadJSON("categories.json") || [];
  }

  /**
   * Fetches FAQ schemas.
   */
  async getFAQ() {
    return await this.loadJSON("faq.json") || [];
  }

  /**
   * Fetches global application configurations.
   */
  async getSettings() {
    return await this.loadJSON("settings.json") || {};
  }

  /**
   * Fetches the navigation schema.
   */
  async getNavigation() {
    return await this.loadJSON("navigation.json") || [];
  }

  /**
   * Fetches a specific tool details by its string ID identifier.
   */
  async getToolById(toolId) {
    const tools = await this.getTools();
    return tools.find(t => t.id === toolId || t.url === `tools/${toolId}.html` || t.url.endsWith(`/${toolId}.html`)) || null;
  }
}
export default ConfigEngine;
