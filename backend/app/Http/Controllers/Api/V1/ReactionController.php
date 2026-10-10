<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Reaction;
use App\Services\Feed\FeedRankingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    public function __construct(private readonly FeedRankingService $feedService) {}

    /**
     * React to a post (like, love, wow, haha, sad, angry).
     */
    public function reactToPost(Request $request, Post $post): JsonResponse
    {
        $request->validate([
            'type' => ['required', 'string', 'in:like,love,wow,haha,sad,angry,fire,gaming'],
        ]);

        $user = $request->user();
        $type = $request->type;

        $existing = \App\Models\PostReaction::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();

        if ($existing) {
            $existing->update(['type' => $type]);
        } else {
            \App\Models\PostReaction::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
                'type'    => $type,
            ]);
            $post->increment('likes_count');
        }

        $post->timestamps = false;
        $post->update(['rank_score' => $this->feedService->calculateScore($post->fresh())]);
        $post->timestamps = true;

        return response()->json([
            'message'         => 'Reaction saved.',
            'reactions_count' => $post->fresh()->likes_count,
            'likes_count'     => $post->fresh()->likes_count,
            'your_reaction'   => $type,
        ]);
    }

    /**
     * Un-react to a post.
     */
    public function unreactPost(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();
        $deleted = \App\Models\PostReaction::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->delete();

        if ($deleted) {
            $post->decrement('likes_count');
            $post->timestamps = false;
            $post->update(['rank_score' => $this->feedService->calculateScore($post->fresh())]);
            $post->timestamps = true;
        }

        return response()->json([
            'message'         => 'Reaction removed.',
            'reactions_count' => $post->fresh()->likes_count,
            'likes_count'     => $post->fresh()->likes_count,
            'your_reaction'   => null,
        ]);
    }

    /**
     * React to a comment.
     */
    public function reactToComment(Request $request, \App\Models\Comment $comment): JsonResponse
    {
        $request->validate([
            'type' => ['required', 'string', 'in:like,love,wow,haha,sad,angry,fire,gaming'],
        ]);

        $user = $request->user();
        $type = $request->type;

        $existing = Reaction::where('user_id', $user->id)
            ->where('reactable_type', \App\Models\Comment::class)
            ->where('reactable_id', $comment->id)
            ->first();

        if ($existing) {
            if ($existing->type === $type) {
                $existing->delete();
                $comment->decrement('likes_count'); // Assuming likes_count is used for reactions on comments
                return response()->json(['message' => 'Reaction removed.']);
            }
            $existing->update(['type' => $type]);
        } else {
            Reaction::create([
                'user_id'        => $user->id,
                'reactable_type' => \App\Models\Comment::class,
                'reactable_id'   => $comment->id,
                'type'           => $type,
            ]);
            $comment->increment('likes_count');
        }

        return response()->json(['message' => 'Reaction saved.']);
    }

    /**
     * Get all reactions for a post.
     */
    public function index(Post $post): JsonResponse
    {
        $reactions = Reaction::where('reactable_type', Post::class)
            ->where('reactable_id', $post->id)
            ->with('user:id,username,display_name,avatar')
            ->latest()
            ->paginate(50);

        $summary = Reaction::where('reactable_type', Post::class)
            ->where('reactable_id', $post->id)
            ->selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type');

        return response()->json([
            'summary'  => $summary,
            'data'     => $reactions->items(),
            'total'    => $reactions->total(),
        ]);
    }
}
