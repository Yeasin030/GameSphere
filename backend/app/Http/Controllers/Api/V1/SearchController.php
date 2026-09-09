<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Group;
use App\Models\NewsArticle;
use App\Models\Post;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Unified search endpoint across users, games, groups, posts, news, tournaments.
     */
    public function index(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));
        if (strlen($q) < 2) {
            return response()->json([
                'data' => [
                    'users' => [],
                    'games' => [],
                    'groups' => [],
                    'posts' => [],
                    'tournaments' => [],
                ]
            ]);
        }

        $users = User::where('display_name', 'LIKE', "%{$q}%")
            ->orWhere('username', 'LIKE', "%{$q}%")
            ->limit(5)->get(['id', 'display_name', 'username', 'avatar', 'is_verified']);

        $games = Game::where('title', 'LIKE', "%{$q}%")
            ->limit(5)->get(['id', 'title', 'slug', 'cover_image', 'rating']);

        $groups = Group::where('name', 'LIKE', "%{$q}%")
            ->limit(5)->get(['id', 'name', 'slug', 'avatar', 'members_count']);

        $posts = Post::where('content', 'LIKE', "%{$q}%")
            ->with('user:id,display_name,username,avatar')
            ->latest()->limit(5)->get();

        $tournaments = Tournament::where('title', 'LIKE', "%{$q}%")
            ->limit(5)->get(['id', 'title', 'slug', 'status', 'start_date']);

        return response()->json([
            'data' => [
                'users' => $users,
                'games' => $games,
                'groups' => $groups,
                'posts' => $posts,
                'tournaments' => $tournaments,
            ]
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));
        $users = User::where('display_name', 'LIKE', "%{$q}%")
            ->orWhere('username', 'LIKE', "%{$q}%")
            ->paginate(15);
        return response()->json(['data' => $users->items(), 'meta' => ['total' => $users->total()]]);
    }

    public function games(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));
        $games = Game::where('title', 'LIKE', "%{$q}%")->paginate(15);
        return response()->json(['data' => $games->items(), 'meta' => ['total' => $games->total()]]);
    }

    public function groups(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));
        $groups = Group::where('name', 'LIKE', "%{$q}%")->paginate(15);
        return response()->json(['data' => $groups->items(), 'meta' => ['total' => $groups->total()]]);
    }

    public function posts(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));
        $posts = Post::where('content', 'LIKE', "%{$q}%")->with('user')->latest()->paginate(15);
        return response()->json(['data' => $posts->items(), 'meta' => ['total' => $posts->total()]]);
    }

    public function news(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));
        $news = NewsArticle::where('title', 'LIKE', "%{$q}%")->latest()->paginate(15);
        return response()->json(['data' => $news->items(), 'meta' => ['total' => $news->total()]]);
    }

    public function tournaments(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));
        $tournaments = Tournament::where('title', 'LIKE', "%{$q}%")->latest()->paginate(15);
        return response()->json(['data' => $tournaments->items(), 'meta' => ['total' => $tournaments->total()]]);
    }

    public function hashtags(Request $request): JsonResponse
    {
        $q = ltrim(trim($request->input('q', '')), '#');
        try {
            $tags = DB::table('hashtags')
                ->where('name', 'LIKE', "%{$q}%")
                ->orderByDesc('usage_count')
                ->limit(20)
                ->get();
        } catch (\Throwable $e) {
            $tags = collect();
        }
        return response()->json(['data' => $tags]);
    }
}
