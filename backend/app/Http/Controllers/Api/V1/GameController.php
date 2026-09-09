<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Models\Genre;
use App\Models\Platform;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GameController extends Controller
{
    /**
     * List / search games.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Game::with(['genres', 'platforms']);

        if ($request->filled('q')) {
            $query->search($request->q);
        }

        if ($request->filled('genre')) {
            $genreTerm = $request->genre;
            $query->whereHas('genres', function($q) use ($genreTerm) {
                $q->where('slug', $genreTerm)->orWhere('name', 'LIKE', "%{$genreTerm}%");
            });
        }

        if ($request->filled('platform')) {
            $platformTerm = $request->platform;
            $query->whereHas('platforms', function($q) use ($platformTerm) {
                $q->where('slug', $platformTerm)->orWhere('name', 'LIKE', "%{$platformTerm}%");
            });
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->boolean('trending')) {
            $query->where('is_trending', true);
        }

        if ($request->filled('sort')) {
            match ($request->sort) {
                'players'    => $query->orderByDesc('players_count'),
                'rating'     => $query->orderByDesc('average_rating'),
                'release'    => $query->orderByDesc('release_date'),
                'trending'   => $query->orderByDesc('is_trending')->orderByDesc('players_count'),
                default      => $query->orderBy('name'),
            };
        } else {
            $query->orderByDesc('players_count');
        }

        $games = $query->paginate($request->integer('per_page', 24));

        return response()->json([
            'data' => GameResource::collection($games),
            'meta' => [
                'current_page' => $games->currentPage(),
                'last_page'    => $games->lastPage(),
                'total'        => $games->total(),
            ],
        ]);
    }

    /**
     * Store / Upload a new game.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'developer'        => 'nullable|string',
            'publisher'        => 'nullable|string',
            'cover_image'      => 'nullable|string',
            'background_image' => 'nullable|string',
            'release_date'     => 'nullable|date',
            'rating'           => 'nullable|numeric',
            'players_count'    => 'nullable|integer',
            'is_featured'      => 'nullable|boolean',
            'is_trending'      => 'nullable|boolean',
            'is_free'          => 'nullable|boolean',
            'genres'           => 'nullable',
            'platforms'        => 'nullable',
        ]);

        $game = Game::create([
            'name'                  => $validated['name'],
            'slug'                  => Str::slug($validated['name']) . '-' . rand(100, 999),
            'description'           => $validated['description'] ?? 'An exciting multiplayer competitive gaming title on GameSphere.',
            'short_description'     => Str::limit($validated['description'] ?? 'An exciting multiplayer competitive gaming title on GameSphere.', 140),
            'developer'             => $validated['developer'] ?? 'GameSphere Studios',
            'publisher'             => $validated['publisher'] ?? 'GameSphere Publishing',
            'cover_image'           => $validated['cover_image'] ?? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
            'background_image'      => $validated['background_image'] ?? '/battlestation_setup.jpg',
            'release_date'          => $validated['release_date'] ?? now()->toDateString(),
            'average_rating'        => $request->filled('rating') ? (float)$request->rating : 4.8,
            'players_count'         => $request->filled('players_count') ? (int)$request->players_count : rand(12000, 95000),
            'is_featured'           => $request->boolean('is_featured', false),
            'is_trending'           => $request->boolean('is_trending', false),
            'is_free'               => $request->boolean('is_free', true),
            'is_multiplayer'        => true,
            'is_online_multiplayer' => true,
            'is_active'             => true,
        ]);

        // Attach genres if provided
        if ($request->filled('genres')) {
            $genres = is_array($request->genres) ? $request->genres : explode(',', $request->genres);
            foreach ($genres as $gName) {
                $gName = trim($gName);
                if (!$gName) continue;
                $genre = Genre::firstOrCreate(
                    ['slug' => Str::slug($gName)],
                    ['name' => $gName]
                );
                $game->genres()->syncWithoutDetaching([$genre->id]);
            }
        }

        // Attach platforms if provided
        if ($request->filled('platforms')) {
            $platforms = is_array($request->platforms) ? $request->platforms : explode(',', $request->platforms);
            foreach ($platforms as $pName) {
                $pName = trim($pName);
                if (!$pName) continue;
                $platform = Platform::firstOrCreate(
                    ['slug' => Str::slug($pName)],
                    ['name' => $pName]
                );
                $game->platforms()->syncWithoutDetaching([$platform->id]);
            }
        }

        return response()->json([
            'message' => 'Game created successfully.',
            'data'    => new GameResource($game->load(['genres', 'platforms'])),
        ], 201);
    }

    /**
     * Show a single game by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $game = Game::where('slug', $slug)
            ->with(['genres', 'platforms', 'storeLinks'])
            ->firstOrFail();

        return response()->json(['data' => new GameResource($game)]);
    }

    /**
     * Get posts tagged with a game.
     */
    public function posts(Request $request, string $slug): JsonResponse
    {
        $game  = Game::where('slug', $slug)->firstOrFail();
        $posts = $game->posts()
            ->with(['user', 'media', 'hashtags'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => \App\Http\Resources\PostResource::collection($posts),
            'meta' => ['total' => $posts->total()],
        ]);
    }
}
