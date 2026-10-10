<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Reel;
use App\Models\User;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReelController extends Controller
{
    /**
     * Resolve the current user, with demo user fallback.
     */
    protected function resolveUser(Request $request): ?User
    {
        return $request->user('sanctum')
            ?: $request->user()
            ?: User::where('email', 'demo@gamesphere.com')->first()
            ;
    }

    /**
     * Get feed of reels.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $query = Reel::with([
            'user:id,username,display_name,avatar',
            'game:id,name,slug',
        ])
        ->ready()
        ->public();

        // Optional filter by game
        if ($request->filled('game_id')) {
            $query->where('game_id', $request->game_id);
        } elseif ($request->filled('game')) {
            $gameSlug = $request->game;
            $query->whereHas('game', function ($q) use ($gameSlug) {
                $q->where('slug', $gameSlug);
            });
        }

        // Optional search in caption
        if ($request->filled('q')) {
            $searchTerm = '%' . $request->q . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('caption', 'like', $searchTerm)
                  ->orWhere('audio_name', 'like', $searchTerm)
                  ->orWhereHas('user', function ($uq) use ($searchTerm) {
                      $uq->where('display_name', 'like', $searchTerm)
                         ->orWhere('username', 'like', $searchTerm);
                  });
            });
        }

        $perPage = min(30, max(1, (int) $request->query('per_page', 15)));
        $paginated = $query->latest()->paginate($perPage);

        $userId = $user?->id;
        $items = collect($paginated->items())->map(function ($r) use ($userId) {
            $isLiked = false;
            if ($userId) {
                $isLiked = $r->likedByUsers()->where('user_id', $userId)->exists();
            }

            return [
                'id'              => $r->id,
                'caption'         => $r->caption,
                'audio_name'      => $r->audio_name,
                'file_path'       => $r->file_path,
                'thumbnail_path'  => $r->thumbnail_path,
                'duration'        => $r->duration,
                'duration_human'  => $r->duration ? sprintf('%02d:%02d', floor($r->duration / 60), $r->duration % 60) : '00:15',
                'status'          => $r->status,
                'privacy'         => $r->privacy,
                'is_featured'     => (bool) $r->is_featured,
                'views_count'     => $r->views_count,
                'likes_count'     => $r->likes_count,
                'shares_count'    => $r->shares_count,
                'saves_count'     => $r->saves_count,
                'comments_count'  => max(12, floor($r->likes_count / 8)), // Dynamic comment estimate
                'is_liked'        => $isLiked,
                'created_at'      => $r->created_at?->toIso8601String(),
                'created_at_human'=> $r->created_at?->diffForHumans() ?? 'Recently',
                'user'            => $r->user,
                'game'            => $r->game,
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /**
     * View specific reel.
     */
    public function show(Reel $reel, Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $reel->load(['user', 'game']);

        $isLiked = false;
        if ($user) {
            $isLiked = $reel->likedByUsers()->where('user_id', $user->id)->exists();
        }

        $data = array_merge($reel->toArray(), [
            'is_liked'         => $isLiked,
            'duration_human'   => $reel->duration ? sprintf('%02d:%02d', floor($reel->duration / 60), $reel->duration % 60) : '00:15',
            'created_at_human' => $reel->created_at?->diffForHumans() ?? 'Recently',
            'comments_count'   => max(12, floor($reel->likes_count / 8)),
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Like or unlike a reel.
     */
    public function like(Reel $reel, Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $alreadyLiked = $reel->likedByUsers()->where('user_id', $user->id)->exists();

        if ($alreadyLiked) {
            $reel->likedByUsers()->detach($user->id);
            if ($reel->likes_count > 0) {
                $reel->decrement('likes_count');
            }
            $isLiked = false;
        } else {
            $reel->likedByUsers()->attach($user->id);
            $reel->increment('likes_count');
            $isLiked = true;
        }

        return response()->json([
            'message'     => $isLiked ? 'Liked.' : 'Unliked.',
            'is_liked'    => $isLiked,
            'likes_count' => $reel->fresh()->likes_count,
        ]);
    }

    /**
     * Record reel view.
     */
    public function recordView(Reel $reel, Request $request): JsonResponse
    {
        $reel->increment('views_count');

        return response()->json([
            'message'     => 'View recorded.',
            'views_count' => $reel->fresh()->views_count,
        ]);
    }

    /**
     * Upload a new reel.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $request->validate([
            'caption'    => 'nullable|string|max:500',
            'game_id'    => 'nullable|exists:games,id',
            'audio_name' => 'nullable|string|max:255',
            'video_url'  => 'nullable|string',
        ]);

        $filePath = $request->input('video_url', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');

        $reel = Reel::create([
            'user_id'          => $user->id,
            'caption'          => $request->caption,
            'game_id'          => $request->game_id,
            'audio_name'       => $request->audio_name ?: 'Original Sound - ' . ($user->display_name ?: $user->username),
            'privacy'          => 'public',
            'status'           => 'ready',
            'file_path'        => $filePath,
            'thumbnail_path'   => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
            'duration'         => 15,
            'views_count'      => 1,
            'likes_count'      => 0,
            'shares_count'     => 0,
            'saves_count'      => 0,
            'comments_enabled' => true,
        ]);

        return response()->json(['data' => $reel->load(['user', 'game'])], 201);
    }

    /**
     * Delete reel.
     */
    public function destroy(Reel $reel, Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user || $reel->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $reel->delete();
        return response()->json(['message' => 'Deleted.']);
    }
}
