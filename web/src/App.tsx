import { useEffect, useMemo, useState } from "react";
import "./styles.css";

type Category =
  | "technology"
  | "general"
  | "science"
  | "sports"
  | "business"
  | "health"
  | "entertainment"
  | "politics"
  | "food"
  | "travel";

type Article = {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string };
  category: Category;
};

const categories: Category[] = [
  "technology",
  "general",
  "science",
  "sports",
  "business",
  "health",
  "entertainment",
  "politics",
  "food",
  "travel",
];

const FAVORITES_KEY = "news-reader-favorites";
const PAGE_SIZE = 3;

const demoArticles: Article[] = [
  {
    id: "1",
    title: "AI tools are reshaping how teams work",
    description:
      "Companies are adopting AI for research, customer support, and workflow automation across many industries.",
    url: "https://example.com/ai-tools",
    image: "https://picsum.photos/1200/700?1",
    publishedAt: "2026-04-20T10:00:00Z",
    source: { name: "Tech Journal" },
    category: "technology",
  },
  {
    id: "2",
    title: "Scientists report progress in quantum computing",
    description:
      "New approaches to stability and error correction are helping researchers move closer to practical systems.",
    url: "https://example.com/quantum",
    image: "https://picsum.photos/1200/700?2",
    publishedAt: "2026-04-20T09:00:00Z",
    source: { name: "Science Daily" },
    category: "science",
  },
  {
    id: "3",
    title: "NBA playoff race heats up in final stretch",
    description:
      "Fans are watching key matchups as teams fight for playoff positioning and momentum.",
    url: "https://example.com/nba",
    image: "https://picsum.photos/1200/700?3",
    publishedAt: "2026-04-20T08:00:00Z",
    source: { name: "Sports Weekly" },
    category: "sports",
  },
  {
    id: "4",
    title: "Travel demand rises for shorter weekend getaways",
    description:
      "Airlines and hotels are seeing strong demand for flexible spring and summer trips.",
    url: "https://example.com/travel",
    image: "https://picsum.photos/1200/700?4",
    publishedAt: "2026-04-20T07:00:00Z",
    source: { name: "Travel Weekly" },
    category: "travel",
  },
  {
    id: "5",
    title: "Healthy meal planning gets easier with small routines",
    description:
      "Nutrition experts recommend simple repeatable habits instead of extreme diet changes.",
    url: "https://example.com/food",
    image: "https://picsum.photos/1200/700?5",
    publishedAt: "2026-04-20T06:00:00Z",
    source: { name: "Health & Food" },
    category: "food",
  },
  {
    id: "6",
    title: "Streaming platforms compete with event-style releases",
    description:
      "Studios are experimenting with shorter release windows and bigger digital premieres.",
    url: "https://example.com/entertainment",
    image: "https://picsum.photos/1200/700?6",
    publishedAt: "2026-04-20T05:00:00Z",
    source: { name: "Entertainment Now" },
    category: "entertainment",
  },
  {
    id: "7",
    title: "Business leaders prepare for a cautious quarter",
    description:
      "Executives are balancing cost control with selective investments in growth and hiring.",
    url: "https://example.com/business",
    image: "https://picsum.photos/1200/700?7",
    publishedAt: "2026-04-20T04:00:00Z",
    source: { name: "Market Brief" },
    category: "business",
  },
  {
    id: "8",
    title: "Healthcare startups focus on remote monitoring",
    description:
      "Wearables and easier communication tools are helping shape the next wave of digital health.",
    url: "https://example.com/health",
    image: "https://picsum.photos/1200/700?8",
    publishedAt: "2026-04-20T03:00:00Z",
    source: { name: "Health Watch" },
    category: "health",
  },
  {
    id: "9",
    title: "General news roundup: stories shaping the week",
    description:
      "A quick overview of developments across policy, markets, science, and culture.",
    url: "https://example.com/general",
    image: "https://picsum.photos/1200/700?9",
    publishedAt: "2026-04-20T02:00:00Z",
    source: { name: "Daily Brief" },
    category: "general",
  },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("technology");
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const filteredArticles = useMemo(() => {
    if (showFavorites) {
      return demoArticles.filter((article) => favoriteIds.includes(article.id));
    }

    const trimmedSearch = search.trim().toLowerCase();

    if (trimmedSearch) {
      return demoArticles.filter((article) =>
        `${article.title} ${article.description} ${article.source.name}`
          .toLowerCase()
          .includes(trimmedSearch)
      );
    }

    return demoArticles.filter((article) => article.category === selectedCategory);
  }, [favoriteIds, search, selectedCategory, showFavorites]);

  useEffect(() => {
    setIndex(0);
  }, [search, selectedCategory, showFavorites]);

  const article = filteredArticles[index] || null;
  const pageNumber = Math.floor(index / PAGE_SIZE) + 1;
  const currentPageDots = filteredArticles.slice(
    pageNumber * PAGE_SIZE - PAGE_SIZE,
    pageNumber * PAGE_SIZE
  );

  const canGoNext = index < filteredArticles.length - 1;
  const canGoPrev = index > 0;

  function handleFavoriteToggle(id: string) {
    setFavoriteIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  }

  function handleCategoryClick(category: Category) {
    setShowFavorites(false);
    setSearch("");
    setSelectedCategory(category);
    setIndex(0);
  }

  function handleFavoritesClick() {
    setShowFavorites(true);
    setSearch("");
    setIndex(0);
  }

  function handleSearchChange(value: string) {
    setShowFavorites(false);
    setSearch(value);
    setIndex(0);
  }

  return (
    <div className="layout">
      <aside className={`sidebar ${showFilters ? "sidebar-open" : ""}`}>
        <div className="sidebar-inner">
          <h1 className="brand">News Reader</h1>

          <button
            className="mobile-toggle inside-toggle"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <div className="search-group">
            <label htmlFor="search" className="label">
              Search
            </label>
            <input
              id="search"
              className="search-input"
              type="text"
              placeholder="Search headlines..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="category-group">
            <p className="label">Categories</p>
            <div className="category-list">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${
                    !showFavorites &&
                    !search.trim() &&
                    selectedCategory === category
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`favorites-btn ${showFavorites ? "active" : ""}`}
            onClick={handleFavoritesClick}
          >
            Favorites ({favoriteIds.length})
          </button>
        </div>
      </aside>

      <main className="content">
        <button
          className="mobile-toggle top-toggle"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {!article ? (
          <section className="empty-state">
            <h2>No articles found</h2>
            <p>Try another category, search term, or favorites list.</p>
          </section>
        ) : (
          <section className="featured-wrap">
            <article className="featured-card">
              <img
                src={article.image}
                alt={article.title}
                className="featured-image"
              />

              <div className="featured-overlay">
                <div className="article-meta">
                  <span>{article.source.name}</span>
                  <span>•</span>
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="article-title">{article.title}</h2>
                <p className="article-description">{article.description}</p>

                <div className="article-actions">
                  <a
                    className="article-link"
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Full Article
                  </a>

                  <button
                    className={`favorite-toggle ${
                      favoriteIds.includes(article.id) ? "saved" : ""
                    }`}
                    onClick={() => handleFavoriteToggle(article.id)}
                  >
                    {favoriteIds.includes(article.id)
                      ? "Remove Favorite"
                      : "Save to Favorites"}
                  </button>
                </div>
              </div>
            </article>

            <div className="pager">
              <button
                className="pager-btn"
                onClick={() => setIndex(0)}
                disabled={!canGoPrev}
              >
                «
              </button>

              <button
                className="pager-btn"
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                disabled={!canGoPrev}
              >
                ‹
              </button>

              <div className="pager-dots">
                {currentPageDots.map((_, i) => {
                  const absoluteIndex = (pageNumber - 1) * PAGE_SIZE + i;

                  return (
                    <button
                      key={absoluteIndex}
                      className={`pager-dot ${
                        absoluteIndex === index ? "active" : ""
                      }`}
                      onClick={() => setIndex(absoluteIndex)}
                    >
                      {absoluteIndex + 1}
                    </button>
                  );
                })}
              </div>

              <button
                className="pager-btn"
                onClick={() =>
                  setIndex((i) => Math.min(i + 1, filteredArticles.length - 1))
                }
                disabled={!canGoNext}
              >
                ›
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}