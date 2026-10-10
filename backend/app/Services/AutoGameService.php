<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use App\Models\GameLog;

class AutoGameService
{
    public function logEvent(string $gameId, string $eventType, array $payload)
    {
        // 1. Log to MongoDB
        GameLog::create([
            'game_id' => $gameId,
            'event_type' => $eventType,
            'payload' => $payload,
            'timestamp' => microtime(true)
        ]);

        // 2. Update Leaderboard in Redis
        if ($eventType === 'score_update') {
            $userId = $payload['user_id'] ?? 'unknown';
            $score = $payload['score'] ?? 0;
            
            // Assuming ZINCRBY or ZADD for leaderboards
            // We'll use ZADD to set the exact score
            Redis::zadd("leaderboard:{$gameId}", $score, $userId);
        }
    }

    public function getLeaderboard(string $gameId, int $top = 10)
    {
        // ZREVRANGE to get highest scores first
        return Redis::zrevrange("leaderboard:{$gameId}", 0, $top - 1, 'WITHSCORES');
    }
}
