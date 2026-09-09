<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Game;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard stats.
     */
    public function index(Request $request): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'total_posts' => Post::count(),
            'total_games' => Game::count(),
            'total_tournaments' => Tournament::count(),
            'new_users_today' => User::whereDate('created_at', today())->count(),
        ];

        return response()->json(['data' => $stats]);
    }
}
