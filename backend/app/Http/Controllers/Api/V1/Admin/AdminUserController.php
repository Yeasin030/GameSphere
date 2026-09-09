<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List users.
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::latest()->paginate(20);
        return response()->json([
            'data' => $users->items(),
            'meta' => ['total' => $users->total()]
        ]);
    }

    /**
     * View user details.
     */
    public function show(User $user): JsonResponse
    {
        return response()->json(['data' => $user->loadCount(['posts', 'followers', 'following'])]);
    }

    /**
     * Update user details.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'username' => 'sometimes|string|unique:users,username,' . $user->id,
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|in:user,moderator,admin',
        ]);

        $user->update($request->all());
        return response()->json(['data' => $user]);
    }

    /**
     * Ban user.
     */
    public function ban(User $user, Request $request): JsonResponse
    {
        // Simple implementation of ban
        $user->update(['status' => 'banned', 'banned_at' => now(), 'ban_reason' => $request->reason]);
        return response()->json(['message' => 'User banned.']);
    }

    /**
     * Unban user.
     */
    public function unban(User $user): JsonResponse
    {
        $user->update(['status' => 'active', 'banned_at' => null, 'ban_reason' => null]);
        return response()->json(['message' => 'User unbanned.']);
    }

    /**
     * Verify user.
     */
    public function verify(User $user): JsonResponse
    {
        $user->update(['is_verified' => true]);
        return response()->json(['message' => 'User verified.']);
    }

    /**
     * Delete user.
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(['message' => 'User deleted.']);
    }
}
