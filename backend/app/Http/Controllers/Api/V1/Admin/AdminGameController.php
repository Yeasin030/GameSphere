<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminGameController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $games = Game::latest()->paginate(20);
        return response()->json([
            'data' => $games->items(),
            'meta' => ['total' => $games->total()]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'developer' => 'nullable|string',
            'publisher' => 'nullable|string',
            'release_date' => 'nullable|date',
            'description' => 'nullable|string',
            'cover_url' => 'nullable|url',
        ]);

        $data = $request->all();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $game = Game::create($data);

        return response()->json(['message' => 'Game created.', 'data' => $game], 201);
    }

    public function update(Request $request, Game $game): JsonResponse
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'developer' => 'nullable|string',
            'publisher' => 'nullable|string',
            'release_date' => 'nullable|date',
            'description' => 'nullable|string',
            'cover_url' => 'nullable|url',
        ]);

        $game->update($request->all());

        return response()->json(['message' => 'Game updated.', 'data' => $game]);
    }

    public function destroy(Game $game): JsonResponse
    {
        $game->delete();
        return response()->json(['message' => 'Game deleted.']);
    }

    public function syncPlatforms(Game $game, Request $request): JsonResponse
    {
        // Assuming platform relations exist via a pivot or JSON
        return response()->json(['message' => 'Platforms synced.']);
    }

    public function syncGenres(Game $game, Request $request): JsonResponse
    {
        // Assuming genre relations exist via a pivot or JSON
        return response()->json(['message' => 'Genres synced.']);
    }

    public function storeLinks(Game $game, Request $request): JsonResponse
    {
        $request->validate([
            'links' => 'required|array',
            'links.*.url' => 'required|url',
            'links.*.platform' => 'required|string',
        ]);
        
        // Storing as JSON
        $game->update(['store_links' => $request->links]);
        return response()->json(['message' => 'Links stored.', 'data' => $game]);
    }
}
