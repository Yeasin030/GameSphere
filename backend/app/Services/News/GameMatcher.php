<?php

namespace App\Services\News;

use App\Models\NewsArticle;
use App\Models\Game;
use Illuminate\Support\Str;

class GameMatcher
{
    /**
     * Tries to find if the article is about a specific game in the DB.
     */
    public function matchGames(NewsArticle $article): void
    {
        // Very simplistic matching: look for game names in the title
        $games = Game::select('id', 'name')->get();

        foreach ($games as $game) {
            // Case insensitive boundary match
            if (preg_match('/\b' . preg_quote($game->name, '/') . '\b/i', $article->title)) {
                $article->update(['game_id' => $game->id]);
                break; // Only match one game for simplicity in this schema
            }
        }
    }
}
