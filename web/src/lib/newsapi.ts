export type ApiArticle = {
  title: string;
  description?: string;
  url: string;
  image?: string;
  publishedAt?: string;
  source?: {
    name?: string;
  };
};

export async function fetchNews(params: {
  q?: string;
  category?: string;
  page?: number;
}) {
  const url = new URL("/api/news/all", window.location.origin);

  if (params.q?.trim()) {
    url.searchParams.set("search", params.q.trim());
  } else if (params.category) {
    url.searchParams.set("categories", params.category);
  }

  url.searchParams.set("page", String(params.page ?? 1));

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data.error === "string" ? data.error : "Failed to fetch news";

    if (res.status === 429) {
      throw new Error("Daily request limit reached. Please wait a bit and try again later.");
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error("The news API authentication failed.");
    }

    throw new Error(message);
  }

  return data as { articles?: ApiArticle[] };
}