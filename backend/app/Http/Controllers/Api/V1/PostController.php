<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Post\StorePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\Feed\FeedRankingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    public function __construct(private readonly FeedRankingService $feedService) {}

    /**
     * Display a single post.
     */
    public function show(Post $post): JsonResponse
    {
        Gate::authorize('view', $post);

        $post->load(['user', 'media', 'hashtags', 'taggedGames', 'topLevelComments.user']);
        $post->increment('views_count');

        return response()->json(['data' => new PostResource($post)]);
    }

    /**
     * Create a new post.
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $user = $request->user('sanctum') ?? $request->user() ?? \App\Models\User::first();

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        } elseif ($request->hasFile('media')) {
            $media = $request->file('media');
            $file = is_array($media) ? $media[0] : $media;
            if ($file && $file->isValid()) {
                $imagePath = $file->store('posts', 'public');
            }
        }

        $post = DB::transaction(function () use ($request, $user, $imagePath) {
            /** @var Post $post */
            $post = $user->posts()->create([
                'type'       => $imagePath ? 'image' : $request->input('type', 'text'),
                'content'    => $request->input('content', ''),
                'privacy'    => $request->input('visibility', $request->input('privacy', 'public')),
                'link_image' => $imagePath,
            ]);

            // Set initial ranking score
            $post->timestamps = false;
            $post->update(['rank_score' => $this->feedService->calculateScore($post)]);
            $post->timestamps = true;

            // Increment user posts_count
            $user->increment('posts_count');

            return $post;
        });

        $post->load(['user']);

        return response()->json(['message' => 'Post created.', 'data' => new PostResource($post)], 201);
    }

    /**
     * Update a post.
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        Gate::authorize('update', $post);

        $post->update($request->only(['content', 'visibility', 'is_spoiler', 'feeling']));

        return response()->json(['message' => 'Post updated.', 'data' => new PostResource($post)]);
    }

    /**
     * Delete a post.
     */
    public function destroy(Request $request, Post $post): JsonResponse
    {
        Gate::authorize('delete', $post);

        $post->delete();
        $request->user()->decrement('posts_count');

        return response()->json(['message' => 'Post deleted.']);
    }

    public function index(Request $request): JsonResponse
    {
        $posts = Post::with(['user', 'game'])
            ->where('privacy', 'public')
            ->where('is_hidden', false)
            ->latest()
            ->paginate($request->integer('per_page', 20), ['*'], 'page', $request->integer('page', 1));

        return response()->json([
            'data' => PostResource::collection($posts),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'total'        => $posts->total(),
                'has_more'     => $posts->hasMorePages(),
            ],
        ]);
    }

    public function save(Request $request, Post $post): JsonResponse
    {
        $post->increment('saves_count');
        return response()->json(['message' => 'Post saved.', 'is_saved' => true, 'saves_count' => $post->saves_count]);
    }

    public function unsave(Request $request, Post $post): JsonResponse
    {
        if ($post->saves_count > 0) {
            $post->decrement('saves_count');
        }
        return response()->json(['message' => 'Post unsaved.', 'is_saved' => false, 'saves_count' => $post->saves_count]);
    }

    /**
     * Get posts by a specific user.
     */
    public function userPosts(Request $request, \App\Models\User $user): JsonResponse
    {
        $posts = Post::with(['user', 'media', 'hashtags'])
            ->where('user_id', $user->id)
            ->visible($request->user())
            ->whereNull('parent_id')
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => PostResource::collection($posts),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'total'        => $posts->total(),
                'has_more'     => $posts->hasMorePages(),
            ],
        ]);
    }
}
