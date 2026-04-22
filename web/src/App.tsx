import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import { fetchNews, type ApiArticle } from "./lib/newsapi";

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
const placeholderImage = "https://picsum.photos/1200/700?placeholder";

function normalizeArticle(article: ApiArticle, index: number): Article {
  return {
    id: article.url || `article-${index}`,
    title: article.title || "Untitled article",
    description: article.description || "No description available.",
    url: article.url || "#",
    image: article.image || `${placeholderImage}&i=${index}`,
    publishedAt: article.publishedAt || new Date().toISOString(),
    source: { name: article.source?.name || "Unknown source" },
  };
}

export default function App() {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("technology");
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveArticles, setLiveArticles] = useState<Article[]>([]);
  const [cache, setCache] = useState<Record<string, Article[]>>({});

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

  const pageNumber = Math.floor(index / PAGE_SIZE) + 1;
  const indexOnPage = index % PAGE_SIZE;

  const cacheKey = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase();

    if (trimmedSearch) {
      return `search:${trimmedSearch}:page:${pageNumber}`;
    }

    return `category:${selectedCategory}:page:${pageNumber}`;
  }, [search, selectedCategory, pageNumber]);

  useEffect(() => {
    if (showFavorites) return;

    let cancelled = false;

    async function loadArticles() {
      if (cache[cacheKey]) {
        setLiveArticles(cache[cacheKey]);
        setError("");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await fetchNews({
          q: search.trim() || undefined,
          category: search.trim() ? undefined : selectedCategory,
          page: pageNumber,
        });

        if (cancelled) return;

        const normalized = (data.articles || []).map(normalizeArticle);
        setLiveArticles(normalized);

        setCache((prev) => ({
          ...prev,
          [cacheKey]: normalized,
        }));
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Failed to fetch news.";
        setError(message);
        setLiveArticles([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadArticles();

    return () => {
      cancelled = true;
    };
  }, [search, selectedCategory, showFavorites, cache, cacheKey, pageNumber]);

  useEffect(() => {
    if (showFavorites) return;
    if (liveArticles.length < 2) return;
    if (indexOnPage !== 1) return;

    const nextPage = pageNumber + 1;
    const trimmedSearch = search.trim().toLowerCase();

    const nextKey = trimmedSearch
      ? `search:${trimmedSearch}:page:${nextPage}`
      : `category:${selectedCategory}:page:${nextPage}`;

    if (cache[nextKey]) return;

    fetchNews({
      q: search.trim() || undefined,
      category: search.trim() ? undefined : selectedCategory,
      page: nextPage,
    })
      .then((data) => {
        const normalized = (data.articles || []).map(normalizeArticle);

        setCache((prev) => ({
          ...prev,
          [nextKey]: normalized,
        }));
      })
      .catch(() => {});
  }, [
    cache,
    indexOnPage,
    liveArticles.length,
    pageNumber,
    search,
    selectedCategory,
    showFavorites,
  ]);

  useEffect(() => {
    setIndex(0);
  }, [search, selectedCategory, showFavorites]);

  const filteredArticles = useMemo(() => {
    if (showFavorites) {
      const allCachedArticles = Object.values(cache).flat();
      const uniqueById = new Map<string, Article>();

      allCachedArticles.forEach((article) => {
        uniqueById.set(article.id, article);
      });

      return Array.from(uniqueById.values()).filter((article) =>
        favoriteIds.includes(article.id)
      );
    }

    return liveArticles;
  }, [cache, favoriteIds, liveArticles, showFavorites]);

  const pagedArticles = useMemo(() => {
    if (showFavorites) {
      return filteredArticles;
    }

    const trimmedSearch = search.trim().toLowerCase();
    const prefix = trimmedSearch
      ? `search:${trimmedSearch}:page:`
      : `category:${selectedCategory}:page:`;

    const matchingPages = Object.entries(cache)
      .filter(([key]) => key.startsWith(prefix))
      .sort(([a], [b]) => {
        const pageA = Number(a.split(":").pop() || 0);
        const pageB = Number(b.split(":").pop() || 0);
        return pageA - pageB;
      })
      .flatMap(([, articles]) => articles);

    return matchingPages.length > 0 ? matchingPages : liveArticles;
  }, [cache, filteredArticles, liveArticles, search, selectedCategory, showFavorites]);

  const article = pagedArticles[index] || null;

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
    setError("");
  }

  function handleFavoritesClick() {
    setShowFavorites(true);
    setSearch("");
    setIndex(0);
    setError("");
    setIsLoading(false);
  }

  function handleSearchChange(value: string) {
    setShowFavorites(false);
    setSearch(value);
    setIndex(0);
  }

  const currentPageDots = showFavorites
    ? filteredArticles.slice(
        pageNumber * PAGE_SIZE - PAGE_SIZE,
        pageNumber * PAGE_SIZE
      )
    : liveArticles;

  const canGoNext = index < pagedArticles.length - 1;
  const canGoPrev = index > 0;

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

        {isLoading ? (
          <section className="empty-state">
            <h2>Loading...</h2>
          </section>
        ) : error ? (
          <section className="empty-state">
            <h2>News Reader</h2>
            <p>{error}</p>
          </section>
        ) : !article ? (
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
                  setIndex((i) => Math.min(i + 1, pagedArticles.length - 1))
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