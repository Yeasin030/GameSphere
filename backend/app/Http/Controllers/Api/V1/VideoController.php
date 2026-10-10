<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Models\User;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VideoController extends Controller
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
     * Get feed of long-form videos with filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $query = Video::with([
            'user:id,username,display_name,avatar',
            'game:id,name,slug,cover_image',
        ])
        ->ready()
        ->public();

        // Filter by category
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', strtolower($request->category));
        }

        // Filter by game
        if ($request->filled('game_id')) {
            $query->where('game_id', $request->game_id);
        } elseif ($request->filled('game')) {
            $gameSlug = $request->game;
            $query->whereHas('game', function ($q) use ($gameSlug) {
                $q->where('slug', $gameSlug);
            });
        }

        // Search query
        if ($request->filled('q')) {
            $searchTerm = '%' . $request->q . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                  ->orWhere('description', 'like', $searchTerm)
                  ->orWhereHas('user', function ($uq) use ($searchTerm) {
                      $uq->where('display_name', 'like', $searchTerm)
                         ->orWhere('username', 'like', $searchTerm);
                  })
                  ->orWhereHas('game', function ($gq) use ($searchTerm) {
                      $gq->where('name', 'like', $searchTerm);
                  });
            });
        }

        // Sorting
        $sort = $request->query('sort', 'latest');
        if ($sort === 'trending') {
            $query->orderByRaw('(views_count + (likes_count * 3)) DESC');
        } elseif ($sort === 'popular') {
            $query->orderByDesc('likes_count');
        } elseif ($sort === 'views') {
            $query->orderByDesc('views_count');
        } else {
            $query->latest();
        }

        $perPage = min(50, max(1, (int) $request->query('per_page', 20)));
        $paginated = $query->paginate($perPage);

        // Map items and compute like status
        $userId = $user?->id;
        $items = collect($paginated->items())->map(function ($v) use ($userId) {
            $isLiked = false;
            if ($userId) {
                $isLiked = $v->likedByUsers()->where('user_id', $userId)->exists();
            }

            return [
                'id'              => $v->id,
                'title'           => $v->title,
                'slug'            => $v->slug,
                'description'     => $v->description,
                'file_path'       => $v->file_path,
                'thumbnail_path'  => $v->thumbnail_path,
                'poster_path'     => $v->poster_path,
                'duration'        => $v->duration,
                'duration_human'  => $v->duration ? sprintf('%02d:%02d', floor($v->duration / 60), $v->duration % 60) : '00:00',
                'category'        => $v->category,
                'visibility'      => $v->visibility,
                'status'          => $v->status,
                'is_featured'     => (bool) $v->is_featured,
                'views_count'     => $v->views_count,
                'likes_count'     => $v->likes_count,
                'shares_count'    => $v->shares_count,
                'is_liked'        => $isLiked,
                'created_at'      => $v->created_at?->toIso8601String(),
                'created_at_human'=> $v->created_at?->diffForHumans() ?? 'Recently',
                'user'            => $v->user,
                'game'            => $v->game,
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
     * View specific video.
     */
    public function show(Video $video, Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $video->load(['user', 'game']);

        $isLiked = false;
        if ($user) {
            $isLiked = $video->likedByUsers()->where('user_id', $user->id)->exists();
        }

        $data = array_merge($video->toArray(), [
            'is_liked'         => $isLiked,
            'duration_human'   => $video->duration ? sprintf('%02d:%02d', floor($video->duration / 60), $video->duration % 60) : '00:00',
            'created_at_human' => $video->created_at?->diffForHumans() ?? 'Recently',
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Like or unlike a video.
     */
    public function like(Video $video, Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $alreadyLiked = $video->likedByUsers()->where('user_id', $user->id)->exists();

        if ($alreadyLiked) {
            $video->likedByUsers()->detach($user->id);
            if ($video->likes_count > 0) {
                $video->decrement('likes_count');
            }
            $isLiked = false;
        } else {
            $video->likedByUsers()->attach($user->id);
            $video->increment('likes_count');
            $isLiked = true;
        }

        return response()->json([
            'message'     => $isLiked ? 'Liked.' : 'Unliked.',
            'is_liked'    => $isLiked,
            'likes_count' => $video->fresh()->likes_count,
        ]);
    }

    /**
     * Record video view.
     */
    public function recordView(Video $video, Request $request): JsonResponse
    {
        $video->increment('views_count');

        return response()->json([
            'message'     => 'View recorded.',
            'views_count' => $video->fresh()->views_count,
        ]);
    }

    /**
     * Upload a new video.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'game_id'     => 'nullable|exists:games,id',
            'category'    => 'required|in:gameplay,walkthrough,tutorial,review,highlights,esports,tournament,guide,funny,news,other',
            'video_url'   => 'nullable|string',
        ]);

        $filePath = $request->input('video_url', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

        $video = Video::create([
            'user_id'        => $user->id,
            'title'          => $request->title,
            'slug'           => Str::slug($request->title) . '-' . Str::random(6),
            'description'    => $request->description,
            'game_id'        => $request->game_id,
            'category'       => $request->category,
            'visibility'     => 'public',
            'status'         => 'ready',
            'file_path'      => $filePath,
            'thumbnail_path' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
            'poster_path'    => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
            'duration'       => rand(300, 1800),
            'views_count'    => 1,
            'likes_count'    => 0,
        ]);

        return response()->json(['data' => $video->load(['user', 'game'])], 201);
    }
}
