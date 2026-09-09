<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    /**
     * Return the currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'privacySettings',
            'notificationPreferences',
        ]);

        // Update last seen timestamp silently
        $user->updateLastSeen();

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }
}
