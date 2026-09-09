<?php

namespace App\Services\News;

use App\Models\NewsArticle;

class DuplicateDetector
{
    /**
     * Check if a similar article was published recently.
     * Real-world implementation might use Elasticsearch or similar.
     */
    public function isDuplicate(string $title, int $sourceId): bool
    {
        // Simple implementation: check if there's an article with a similar title in the last 24h
        $recentArticles = NewsArticle::where('source_id', '!=', $sourceId)
            ->where('created_at', '>=', now()->subDay())
            ->get();

        foreach ($recentArticles as $article) {
            // Using similar_text or a basic similarity check
            similar_text(strtolower($title), strtolower($article->title), $percent);
            if ($percent > 80) { // 80% similarity
                return true;
            }
        }

        return false;
    }
}
