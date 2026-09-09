<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Friendship;
use App\Models\Post;
use App\Models\User;
use App\Services\Feed\FeedRankingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    public function __construct(private readonly FeedRankingService $feedService) {}

    private function resolveUser(Request $request): User
    {
        return $request->user('sanctum')
            ?? $request->user() 
            ?? User::where('email', 'demo@gamesphere.com')->first() 
            ?? User::first();
    }

    private function formatResponse($feed): JsonResponse
    {
        return response()->json([
            'data'  => PostResource::collection($feed),
            'meta'  => [
                'current_page'  => $feed->currentPage(),
                'last_page'     => $feed->lastPage(),
                'per_page'      => $feed->perPage(),
                'total'         => $feed->total(),
                'has_more'      => $feed->hasMorePages(),
            ],
        ]);
    }

    /**
     * Personalized home feed for user (with guest/demo fallback).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $feed = $this->feedService->getUserFeed(
            $user,
            $request->integer('page', 1),
            $request->integer('per_page', 20)
        );

        return $this->formatResponse($feed);
    }

    /**
     * Public explore / trending feed (no auth required).
     */
    public function explore(Request $request): JsonResponse
    {
        $user = $request->user();
        $feed = Post::with(['user', 'game'])
            ->withViewerContext($user)
            ->where('privacy', 'public')
            ->where('is_hidden', false)
            ->orderByDesc('rank_score')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20), ['*'], 'page', $request->integer('page', 1));

        return $this->formatResponse($feed);
    }

    /**
     * Trending posts.
     */
    public function trending(Request $request): JsonResponse
    {
        $user = $request->user();
        $feed = Post::with(['user', 'game'])
            ->withViewerContext($user)
            ->where('privacy', 'public')
            ->where('is_hidden', false)
            ->orderByDesc('rank_score')
            ->orderByDesc('likes_count')
            ->paginate($request->integer('per_page', 20), ['*'], 'page', $request->integer('page', 1));

        return $this->formatResponse($feed);
    }

    /**
     * Posts from followed gamers.
     */
    public function following(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $followingIds = $user ? $user->followingUsers()->pluck('users.id')->toArray() : [];

        $query = Post::with(['user', 'game'])->withViewerContext($user)->where('is_hidden', false);
        if (!empty($followingIds)) {
            $query->whereIn('user_id', array_merge($followingIds, [$user->id]));
        } else {
            $query->where('privacy', 'public');
        }

        $feed = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20), ['*'], 'page', $request->integer('page', 1));

        return $this->formatResponse($feed);
    }

    /**
     * Posts from friends.
     */
    public function friends(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $friendIds = $user ? Friendship::where(function ($q) use ($user) {
            $q->where('requester_id', $user->id)->orWhere('recipient_id', $user->id);
        })->where('status', 'accepted')->get()->map(function ($f) use ($user) {
            return $f->requester_id === $user->id ? $f->recipient_id : $f->requester_id;
        })->toArray() : [];

        $query = Post::with(['user', 'game'])->withViewerContext($user)->where('is_hidden', false);
        if (!empty($friendIds)) {
            $query->whereIn('user_id', array_merge($friendIds, [$user->id]));
        } else {
            $query->where('privacy', 'public');
        }

        $feed = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20), ['*'], 'page', $request->integer('page', 1));

        return $this->formatResponse($feed);
    }

    /**
     * Gaming specific posts (tagged game or gaming tags).
     */
    public function gaming(Request $request): JsonResponse
    {
        $user = $request->user();
        $feed = Post::with(['user', 'game'])
            ->withViewerContext($user)
            ->where('privacy', 'public')
            ->where('is_hidden', false)
            ->where(function ($q) {
                $q->whereNotNull('game_id')
                  ->orWhere('content', 'like', '%#%')
                  ->orWhere('content', 'like', '%game%')
                  ->orWhere('content', 'like', '%play%')
                  ->orWhere('content', 'like', '%rank%')
                  ->orWhere('content', 'like', '%Valorant%')
                  ->orWhere('content', 'like', '%Warzone%')
                  ->orWhere('content', 'like', '%Cyberpunk%');
            })
            ->orderByDesc('rank_score')
            ->paginate($request->integer('per_page', 20), ['*'], 'page', $request->integer('page', 1));

        return $this->formatResponse($feed);
    }

    /**
     * Latest posts sorted chronologically.
     */
    public function latest(Request $request): JsonResponse
    {
        $user = $request->user();
        $feed = Post::with(['user', 'game'])
            ->withViewerContext($user)
            ->where('privacy', 'public')
            ->where('is_hidden', false)
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20), ['*'], 'page', $request->integer('page', 1));

        return $this->formatResponse($feed);
    }
}
