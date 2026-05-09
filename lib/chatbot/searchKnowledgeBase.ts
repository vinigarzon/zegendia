import Fuse from "fuse.js";

import knowledgeBaseJson from "../../content/chatbot/knowledge-base.json";

import { normalizeText } from "lib/chatbot/intentDetector";
import type {
  ChatIntent,
  ChatLanguage,
  KnowledgeBaseEntry,
  SearchKnowledgeBaseResult
} from "types/chat";

const knowledgeBase = knowledgeBaseJson as KnowledgeBaseEntry[];

const fuse = new Fuse(knowledgeBase, {
  includeScore: true,
  keys: [
    { name: "title", weight: 0.24 },
    { name: "keywords", weight: 0.38 },
    { name: "answer_es", weight: 0.2 },
    { name: "answer_en", weight: 0.18 }
  ],
  threshold: 0.38
});

type SearchOptions = {
  intent?: ChatIntent;
  language?: ChatLanguage;
  limit?: number;
};

export function searchKnowledgeBase(
  query: string,
  options: SearchOptions = {}
): SearchKnowledgeBaseResult[] {
  const normalizedQuery = normalizeText(query);
  const language = options.language ?? "es";
  const limit = options.limit ?? 5;

  if (!normalizedQuery) {
    return [];
  }

  const fuseResults = fuse.search(query, { limit: Math.max(limit * 3, 6) });
  const fuseMap = new Map(
    fuseResults.map((result) => [result.item.id, 1 - Math.min(result.score ?? 1, 1)])
  );

  return knowledgeBase
    .map((entry) => {
      const localizedAnswer = language === "en" ? entry.answer_en : entry.answer_es;
      const keywordHits = entry.keywords.filter((keyword) => {
        const normalizedKeyword = normalizeText(keyword);
        return normalizedQuery.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedQuery);
      }).length;
      const titleMatch = normalizeText(entry.title).includes(normalizedQuery) ? 1 : 0;
      const answerMatch = normalizeText(localizedAnswer).includes(normalizedQuery) ? 1 : 0;

      let score = 0;
      score += keywordHits * 18;
      score += titleMatch * 12;
      score += answerMatch * 9;
      score += (fuseMap.get(entry.id) ?? 0) * 40;

      if (options.intent && entry.intent === options.intent) {
        score += 24;
      } else if (options.intent && entry.intent === "general") {
        score += 4;
      }

      const matchType: SearchKnowledgeBaseResult["matchType"] =
        keywordHits > 0 ? "keyword" : options.intent && entry.intent === options.intent ? "intent" : "fuse";

      return {
        entry,
        matchType,
        score
      };
    })
    .filter((result) => result.score > 8)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function getBestKnowledgeBaseMatch(query: string, options: SearchOptions = {}) {
  return searchKnowledgeBase(query, { ...options, limit: 1 })[0] ?? null;
}
