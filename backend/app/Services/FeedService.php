<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use App\Models\Post;

class FeedService
{
    /**
     * Add post to user feed in Redis.
     */
    public function pushToFeed(int $userId, string $postId, float $timestamp)
    {
        Redis::zadd("feed:{$userId}", $timestamp, $postId);
    }

    /**
     * Fetch feed using cursor (timestamp).
     */
    public function getFeed(int $userId, float $cursor = null, int $limit = 20)
    {
        $cursor = $cursor ?? microtime(true);
        $postIds = Redis::zrevrangebyscore("feed:{$userId}", $cursor, '-inf', ['withscores' => false, 'limit' => [0, $limit]]);

        if (empty($postIds)) {
            return [];
        }

        // Fetch documents from MongoDB
        return Post::whereIn('_id', $postIds)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
