<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserGameController extends Controller
{
    /**
     * Get tracked games for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');
        
        $query = $request->user()->trackedGames();
        
        if ($status) {
            $query->wherePivot('status', $status);
        }

        $games = $query->paginate(20);

        return response()->json([
            'data' => $games->items(),
            'meta' => [
                'current_page' => $games->currentPage(),
                'last_page'    => $games->lastPage(),
                'total'        => $games->total(),
            ],
        ]);
    }

    /**
     * Track or update status of a game for the user.
     */
    public function track(Request $request, Game $game): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(['playing', 'completed', 'on_hold', 'dropped', 'plan_to_play'])],
            'rating' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        $user = $request->user();

        $user->trackedGames()->syncWithoutDetaching([
            $game->id => [
                'status' => $request->status,
                'rating' => $request->rating,
            ]
        ]);

        // If the rating is updated, we might need to recalculate the game's average rating.
        // Assuming there is an Observer or we can do it here.

        return response()->json(['message' => "Game tracking updated to {$request->status}."]);
    }

    /**
     * Remove a tracked game.
     */
    public function untrack(Request $request, Game $game): JsonResponse
    {
        $request->user()->trackedGames()->detach($game->id);

        return response()->json(['message' => 'Game tracking removed.']);
    }
}
