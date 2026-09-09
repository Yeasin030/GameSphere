<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NewsArticle;
use App\Models\NewsSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    /**
     * Get a paginated list of news articles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NewsArticle::with(['source', 'game', 'category'])->published()->latest('published_at');

        if ($request->filled('source_id')) {
            $query->where('source_id', $request->source_id);
        }

        if ($request->filled('game_id')) {
            $query->where('game_id', $request->game_id);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($b) use ($q) {
                $b->where('title', 'LIKE', "%{$q}%")
                  ->orWhere('summary', 'LIKE', "%{$q}%")
                  ->orWhere('author', 'LIKE', "%{$q}%");
            });
        }

        if ($request->filled('tag')) {
            $tag = $request->tag;
            $query->where('tags', 'LIKE', "%\"{$tag}\"%")
                  ->orWhere('tags', 'LIKE', "%{$tag}%");
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $articles = $query->paginate(20);

        return response()->json([
            'data' => $articles->items(),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page'    => $articles->lastPage(),
                'total'        => $articles->total(),
            ],
        ]);
    }

    /**
     * Create / Upload a news article via API.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:500',
            'summary'      => 'required|string',
            'image_url'    => 'nullable|string',
            'source_url'   => 'nullable|string',
            'author'       => 'nullable|string',
            'tags'         => 'nullable',
            'is_breaking'  => 'nullable|boolean',
            'is_featured'  => 'nullable|boolean',
        ]);

        $source = NewsSource::firstOrCreate(
            ['slug' => 'gamesphere-official'],
            [
                'name' => 'GameSphere News Desk',
                'website_url' => 'http://localhost:3000',
                'feed_type' => 'api',
                'credibility' => 'official',
                'is_active' => true,
            ]
        );

        $slug = Str::slug($validated['title']) . '-' . time();
        
        $tags = $request->tags;
        if (is_string($tags)) {
            $tags = array_map('trim', explode(',', $tags));
        } elseif (!is_array($tags)) {
            $tags = ['Gaming', 'Update'];
        }

        $article = NewsArticle::create([
            'source_id'    => $source->id,
            'title'        => $validated['title'],
            'slug'         => $slug,
            'summary'      => $validated['summary'],
            'image_url'    => $validated['image_url'] ?? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
            'source_url'   => $validated['source_url'] ?? 'http://localhost:3000/news',
            'author'       => $validated['author'] ?? 'GameSphere Editorial',
            'tags'         => $tags,
            'status'       => 'published',
            'is_featured'  => $request->boolean('is_featured', false),
            'is_breaking'  => $request->boolean('is_breaking', false),
            'views_count'  => rand(100, 500),
            'saves_count'  => rand(10, 50),
            'published_at' => now(),
        ]);

        return response()->json([
            'message' => 'News article published successfully.',
            'data'    => $article->load(['source', 'game', 'category']),
        ], 201);
    }

    /**
     * Get a single news article by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $article = NewsArticle::with(['source', 'game', 'category'])
            ->where('slug', $slug)
            ->firstOrFail();

        $article->increment('views_count');

        return response()->json(['data' => $article]);
    }

    /**
     * Save/bookmark a news article.
     */
    public function save(Request $request, NewsArticle $article): JsonResponse
    {
        $user = $request->user();

        if (!$user->savedNewsArticles()->where('article_id', $article->id)->exists()) {
            $user->savedNewsArticles()->attach($article->id);
            $article->increment('saves_count');
        }

        return response()->json(['message' => 'Article saved.']);
    }

    /**
     * Unsave a news article.
     */
    public function unsave(Request $request, NewsArticle $article): JsonResponse
    {
        $request->user()->savedNewsArticles()->detach($article->id);
        $article->decrement('saves_count');

        return response()->json(['message' => 'Article unsaved.']);
    }

    /**
     * Get saved articles for the authenticated user.
     */
    public function savedArticles(Request $request): JsonResponse
    {
        $articles = $request->user()->savedNewsArticles()->with('source')->latest()->paginate(20);

        return response()->json([
            'data' => $articles->items(),
            'meta' => ['total' => $articles->total()]
        ]);
    }
}
