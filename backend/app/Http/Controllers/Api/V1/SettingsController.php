<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SettingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load(['privacySettings', 'notificationPreferences']);
        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'privacy' => $user->privacySettings,
                'notifications' => $user->notificationPreferences,
            ]
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'display_name' => 'sometimes|string|max:100',
            'name' => 'sometimes|string|max:100',
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|string|max:500',
            'cover_photo' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255',
        ]);

        if (isset($validated['name']) && !isset($validated['display_name'])) {
            $validated['display_name'] = $validated['name'];
            unset($validated['name']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => new UserResource($user)
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function updatePrivacy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'is_private' => 'sometimes|boolean',
            'allow_friend_requests' => 'sometimes|boolean',
            'show_online_status' => 'sometimes|boolean',
            'show_game_activity' => 'sometimes|boolean',
        ]);

        $privacy = $request->user()->privacySettings()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'message' => 'Privacy settings updated',
            'data' => $privacy
        ]);
    }

    public function updateNotifications(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email_notifications' => 'sometimes|boolean',
            'push_notifications' => 'sometimes|boolean',
            'mention_notifications' => 'sometimes|boolean',
        ]);

        $prefs = $request->user()->notificationPreferences()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'message' => 'Notification preferences updated',
            'data' => $prefs
        ]);
    }

    public function updateAccount(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'username' => 'sometimes|string|max:50|unique:users,username,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Account details updated',
            'data' => new UserResource($user)
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = $request->user();
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }
}
