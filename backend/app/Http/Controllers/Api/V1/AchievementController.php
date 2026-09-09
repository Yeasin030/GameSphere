<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AchievementController extends Controller
{
    /**
     * List all available achievements.
     */
    public function index(): JsonResponse
    {
        try {
            $achievements = DB::table('achievements')->get();
        } catch (\Throwable $e) {
            $achievements = collect([
                ['id' => 1, 'name' => 'First Blood', 'description' => 'Made your first post', 'icon' => 'sword', 'points' => 10],
                ['id' => 2, 'name' => 'Squad Up', 'description' => 'Joined your first group', 'icon' => 'users', 'points' => 25],
                ['id' => 3, 'name' => 'Tournament Veteran', 'description' => 'Participated in a tournament', 'icon' => 'trophy', 'points' => 50],
            ]);
        }

        return response()->json(['data' => $achievements]);
    }

    /**
     * Get unlocked achievements for a specific user.
     */
    public function userAchievements(string $username): JsonResponse
    {
        $user = User::where('username', $username)->firstOrFail();

        try {
            $userAchievements = DB::table('user_achievements')
                ->join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
                ->where('user_achievements.user_id', $user->id)
                ->select('achievements.*', 'user_achievements.unlocked_at')
                ->get();
        } catch (\Throwable $e) {
            $userAchievements = collect();
        }

        return response()->json(['data' => $userAchievements]);
    }
}
