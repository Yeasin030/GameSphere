<?php

namespace App\Jobs;

use App\Models\Game;
use App\Models\Genre;
use App\Models\Platform;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FetchGamesFromRawg implements ShouldQueue
{
    use Queueable;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $apiKey = env('RAWG_API_KEY');
        if (!$apiKey) {
            Log::error('RAWG_API_KEY is not set.');
            return;
        }

        try {
            // Fetch 20 random games from recent highly rated or trending games.
            $response = Http::get('https://api.rawg.io/api/games', [
                'key' => $apiKey,
                'page_size' => 20,
                'page' => rand(1, 50),
                'ordering' => '-added',
                'dates' => now()->subMonths(12)->format('Y-m-d') . ',' . now()->format('Y-m-d'),
            ]);

            if ($response->successful()) {
                $gamesData = $response->json()['results'] ?? [];

                foreach ($gamesData as $gameData) {
                    $this->processGame($gameData);
                }
            } else {
                Log::error('RAWG API returned an error: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch from RAWG: ' . $e->getMessage());
        }
    }

    protected function processGame(array $data): void
    {
        $rawgId = $data['id'];
        $name = current(explode(':', $data['name'])); // sometimes games have long names, we keep it simple or just take it as is.
        $name = $data['name'];
        $slug = Str::slug($name);

        // Avoid completely overwriting if we manually modified the game, but for now we updateOrCreate
        $game = Game::firstOrNew(['rawg_id' => $rawgId]);
        
        if (!$game->exists) {
            $game = Game::firstOrNew(['slug' => $slug]);
        }

        $game->name = $name;
        $game->slug = $slug;
        $game->rawg_id = $rawgId;
        $game->release_date = $data['released'] ?? null;
        $game->cover_image = $data['background_image'] ?? null;
        $game->background_image = $data['background_image'] ?? null;
        $game->average_rating = isset($data['metacritic']) ? $data['metacritic'] / 20 : (isset($data['rating']) ? $data['rating'] : 0);
        $game->is_active = true;
        
        // Ensure description fields are set even if RAWG basic endpoint doesn't return full desc
        if (!$game->description) {
            $game->description = "An exciting game available on multiple platforms.";
            $game->short_description = "A new game.";
        }
        
        $game->save();

        // Process Platforms
        $platformIds = [];
        if (isset($data['platforms'])) {
            foreach ($data['platforms'] as $p) {
                $pName = $p['platform']['name'] ?? null;
                if ($pName) {
                    $platform = Platform::firstOrCreate(
                        ['slug' => Str::slug($pName)],
                        ['name' => $pName]
                    );
                    $platformIds[] = $platform->id;
                }
            }
        }
        if (!empty($platformIds)) {
            $game->platforms()->syncWithoutDetaching($platformIds);
        }

        // Process Genres
        $genreIds = [];
        if (isset($data['genres'])) {
            foreach ($data['genres'] as $g) {
                $gName = $g['name'] ?? null;
                if ($gName) {
                    $genre = Genre::firstOrCreate(
                        ['slug' => Str::slug($gName)],
                        ['name' => $gName]
                    );
                    $genreIds[] = $genre->id;
                }
            }
        }
        if (!empty($genreIds)) {
            $game->genres()->syncWithoutDetaching($genreIds);
        }
    }
}
