<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\LoginService;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __construct(private readonly LoginService $loginService) {}

    /**
     * Authenticate user and return token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->loginService->login(
            $request->validated(),
            $request->ip() ?? '127.0.0.1',
            $request->userAgent() ?? 'GameSphere App'
        );

        if ($result['requires_2fa']) {
            return response()->json([
                'message'       => 'Two-factor authentication required.',
                'requires_2fa'  => true,
                'two_fa_token'  => $result['two_fa_token'],
            ], 200);
        }

        return response()->json([
            'message' => 'Login successful.',
            'data'    => [
                'user'  => new UserResource($result['user']),
                'token' => $result['token'],
            ],
        ]);
    }
}
