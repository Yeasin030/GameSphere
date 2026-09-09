<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsSource;
use App\Models\NewsArticle;
use App\Jobs\FetchNewsFromSources;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNewsController extends Controller
{
    /**
     * Get all news sources.
     */
    public function sources(): JsonResponse
    {
        $sources = NewsSource::paginate(20);
        return response()->json(['data' => $sources->items(), 'meta' => ['total' => $sources->total()]]);
    }

    /**
     * Create a news source.
     */
    public function createSource(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string|unique:news_sources',
            'website_url' => 'required|url',
            'feed_url' => 'nullable|url',
            'api_endpoint' => 'nullable|url',
            'feed_type' => 'required|in:rss,atom,api,scraper',
            'credibility' => 'required|in:official,major,community,blog',
            'is_active' => 'boolean',
        ]);

        $source = NewsSource::create($request->all());

        return response()->json(['message' => 'Source created.', 'data' => $source], 201);
    }

    /**
     * Update a news source.
     */
    public function updateSource(Request $request, NewsSource $source): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string',
            'slug' => 'sometimes|string|unique:news_sources,slug,' . $source->id,
            'website_url' => 'sometimes|url',
            'feed_url' => 'nullable|url',
            'api_endpoint' => 'nullable|url',
            'feed_type' => 'sometimes|in:rss,atom,api,scraper',
            'credibility' => 'sometimes|in:official,major,community,blog',
            'is_active' => 'boolean',
        ]);

        $source->update($request->all());

        return response()->json(['message' => 'Source updated.', 'data' => $source]);
    }

    /**
     * Delete a news source.
     */
    public function deleteSource(NewsSource $source): JsonResponse
    {
        $source->delete();
        return response()->json(['message' => 'Source deleted.']);
    }

    /**
     * Trigger manual fetch of news.
     */
    public function triggerFetch(): JsonResponse
    {
        FetchNewsFromSources::dispatch();
        return response()->json(['message' => 'News fetch job dispatched.']);
    }

    /**
     * Get all articles (for moderation).
     */
    public function articles(): JsonResponse
    {
        $articles = NewsArticle::with('source')->latest('published_at')->paginate(20);
        return response()->json(['data' => $articles->items(), 'meta' => ['total' => $articles->total()]]);
    }

    /**
     * Update article details.
     */
    public function updateArticle(Request $request, NewsArticle $article): JsonResponse
    {
        $request->validate([
            'title' => 'sometimes|string',
            'summary' => 'sometimes|string',
            'status' => 'sometimes|in:draft,pending_review,published,rejected',
        ]);

        $article->update($request->all());

        return response()->json(['message' => 'Article updated.', 'data' => $article]);
    }

    /**
     * Publish an article.
     */
    public function publish(Request $request, NewsArticle $article): JsonResponse
    {
        $article->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return response()->json(['message' => 'Article published.', 'data' => $article]);
    }

    /**
     * Delete an article.
     */
    public function deleteArticle(NewsArticle $article): JsonResponse
    {
        $article->delete();
        return response()->json(['message' => 'Article deleted.']);
    }
}
