<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\Auth\OAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class OAuthController extends Controller
{
    public function __construct(private readonly OAuthService $oauthService) {}

    /**
     * Redirect to OAuth provider.
     */
    public function redirect(string $provider): JsonResponse|RedirectResponse
    {
        $url = $this->oauthService->getRedirectUrl($provider);

        return response()->json(['redirect_url' => $url]);
    }

    /**
     * Handle OAuth callback.
     */
    public function callback(string $provider): JsonResponse
    {
        $result = $this->oauthService->handleCallback($provider);

        return response()->json([
            'message' => $result['is_new'] ? 'Account created via OAuth.' : 'Logged in via OAuth.',
            'data'    => [
                'user'   => new UserResource($result['user']),
                'token'  => $result['token'],
                'is_new' => $result['is_new'],
            ],
        ]);
    }
}
