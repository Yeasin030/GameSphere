<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminGameController extends Controller
{
    /**
     * Store a newly created game in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'developer' => 'nullable|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'release_date' => 'nullable|date',
            'genres' => 'nullable|array',
            'platforms' => 'nullable|array',
        ]);

        $game = Game::create($request->only([
            'name', 'description', 'developer', 'publisher', 'release_date',
            'short_description', 'age_rating', 'is_multiplayer', 'is_online_multiplayer',
            'is_free', 'official_website', 'is_featured', 'is_trending', 'is_active',
        ]));

        if ($request->filled('genres')) {
            $game->genres()->sync($request->genres);
        }

        if ($request->filled('platforms')) {
            $game->platforms()->sync($request->platforms);
        }

        return response()->json([
            'message' => 'Game created successfully.',
            'data' => $game,
        ], 201);
    }

    /**
     * Update the specified game in storage.
     */
    public function update(Request $request, Game $game): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'developer' => 'nullable|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'release_date' => 'nullable|date',
            'genres' => 'nullable|array',
            'platforms' => 'nullable|array',
        ]);

        $game->update($request->only([
            'name', 'description', 'developer', 'publisher', 'release_date',
            'short_description', 'age_rating', 'is_multiplayer', 'is_online_multiplayer',
            'is_free', 'official_website', 'is_featured', 'is_trending', 'is_active',
        ]));

        if ($request->has('genres')) {
            $game->genres()->sync($request->genres);
        }

        if ($request->has('platforms')) {
            $game->platforms()->sync($request->platforms);
        }

        return response()->json([
            'message' => 'Game updated successfully.',
            'data' => $game,
        ]);
    }

    /**
     * Remove the specified game from storage.
     */
    public function destroy(Game $game): JsonResponse
    {
        $game->delete();

        return response()->json([
            'message' => 'Game deleted successfully.',
        ]);
    }
}
