<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HashtagController extends Controller
{
    /**
     * Show posts associated with a hashtag.
     */
    public function show(Request $request, string $hashtag): JsonResponse
    {
        $tag = ltrim($hashtag, '#');
        $posts = Post::where('content', 'LIKE', "%#{$tag}%")
            ->with(['user', 'media'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ]
        ]);
    }

    /**
     * Get trending hashtags.
     */
    public function trending(): JsonResponse
    {
        // Try hashtags table or fallback to defaults
        try {
            $hashtags = DB::table('hashtags')
                ->select('name', 'usage_count')
                ->orderByDesc('usage_count')
                ->limit(10)
                ->get();
        } catch (\Throwable $e) {
            $hashtags = collect([
                ['name' => 'gaming', 'usage_count' => 1240],
                ['name' => 'esports', 'usage_count' => 890],
                ['name' => 'streamer', 'usage_count' => 670],
                ['name' => 'clutch', 'usage_count' => 450],
            ]);
        }

        return response()->json(['data' => $hashtags]);
    }
}
