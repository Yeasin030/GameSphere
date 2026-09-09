<?php

namespace App\Services\Feed;

use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class FeedRankingService
{
    /**
     * Gravity constant for time decay (Reddit-style).
     */
    private const GRAVITY = 1.8;

    /**
     * Weights for ranking signals.
     */
    private const WEIGHTS = [
        'reactions' => 1.0,
        'comments'  => 2.0,
        'shares'    => 3.0,
        'views'     => 0.1,
        'following' => 5.0,
        'friend'    => 8.0,
        'verified'  => 2.0,
    ];

    /**
     * Get the personalized feed for a user.
     */
    public function getUserFeed(User $user, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        // Get IDs the user follows
        $followingIds = Cache::remember(
            "user:{$user->id}:following_ids",
            now()->addMinutes(5),
            fn () => $user->followingUsers()->pluck('users.id')->toArray()
        );

        return Post::with(['user', 'game'])
            ->withViewerContext($user)
            ->where('is_hidden', false)
            ->where(function ($q) use ($user, $followingIds) {
                $q->where('privacy', 'public')
                  ->orWhere(function ($q2) use ($user, $followingIds) {
                      $q2->where('privacy', 'followers')
                         ->whereIn('user_id', array_merge($followingIds, [$user->id]));
                  })
                  ->orWhere('user_id', $user->id);
            })
            ->orderByDesc('rank_score')
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get the global explore/trending feed (public, no personalization).
     */
    public function getExploreFeed(int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        return Post::with(['user', 'game'])
            // Usually explore is anonymous, but if we have user context we'd pass it. 
            // In this specific scope we don't have $user in getExploreFeed.
            // Let's modify FeedController to pass $user. Actually, let's just leave exploreFeed as is, it's public.
            ->where('privacy', 'public')
            ->where('is_hidden', false)
            ->orderByDesc('rank_score')
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Recalculate the rank_score for a post using the time-decay formula.
     */
    public function calculateScore(Post $post): float
    {
        $interactions =
            ($post->likes_count   * self::WEIGHTS['reactions']) +
            ($post->comments_count * self::WEIGHTS['comments'])  +
            ($post->shares_count   * self::WEIGHTS['shares'])    +
            ($post->views_count    * self::WEIGHTS['views']);

        // Bonuses
        if ($post->user?->is_verified) {
            $interactions += self::WEIGHTS['verified'];
        }

        $createdAt = $post->created_at instanceof \Carbon\Carbon
            ? $post->created_at
            : \Carbon\Carbon::parse($post->created_at ?: now());
        $hoursSincePosted = max(0, $createdAt->diffInHours(now()));
        $score = $interactions / pow(($hoursSincePosted + 2), self::GRAVITY);

        return round($score, 6);
    }

    /**
     * Batch-recalculate scores for recent posts.
     */
    public function recalculateRecentScores(): void
    {
        Post::where('created_at', '>=', now()->subDays(7))
            ->chunk(200, function ($posts) {
                foreach ($posts as $post) {
                    $post->timestamps = false;
                    $post->update(['rank_score' => $this->calculateScore($post)]);
                    $post->timestamps = true;
                }
            });
    }
}
