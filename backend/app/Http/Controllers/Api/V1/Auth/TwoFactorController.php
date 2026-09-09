<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\TwoFactorVerifyRequest;
use App\Services\Auth\TwoFactorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TwoFactorController extends Controller
{
    public function __construct(private readonly TwoFactorService $twoFactorService) {}

    /**
     * Enable 2FA - returns QR code and secret.
     */
    public function enable(Request $request): JsonResponse
    {
        $result = $this->twoFactorService->enable($request->user());

        return response()->json([
            'message' => '2FA setup initiated. Scan the QR code with your authenticator app.',
            'data'    => $result,
        ]);
    }

    /**
     * Confirm 2FA by verifying a TOTP code.
     */
    public function confirm(TwoFactorVerifyRequest $request): JsonResponse
    {
        $confirmed = $this->twoFactorService->confirm(
            $request->user(),
            $request->input('code')
        );

        if (! $confirmed) {
            return response()->json(['message' => 'Invalid 2FA code.'], 422);
        }

        return response()->json([
            'message'        => '2FA enabled successfully.',
            'recovery_codes' => $request->user()->two_factor_recovery_codes,
        ]);
    }

    /**
     * Disable 2FA.
     */
    public function disable(TwoFactorVerifyRequest $request): JsonResponse
    {
        $disabled = $this->twoFactorService->disable(
            $request->user(),
            $request->input('code')
        );

        if (! $disabled) {
            return response()->json(['message' => 'Invalid 2FA code.'], 422);
        }

        return response()->json(['message' => '2FA disabled successfully.']);
    }

    /**
     * Verify a TOTP code during login (challenge flow).
     */
    public function challenge(TwoFactorVerifyRequest $request): JsonResponse
    {
        $result = $this->twoFactorService->challenge(
            $request->input('two_fa_token'),
            $request->input('code')
        );

        if (! $result) {
            return response()->json(['message' => 'Invalid or expired 2FA code.'], 401);
        }

        return response()->json([
            'message' => 'Two-factor authentication passed.',
            'data'    => $result,
        ]);
    }

    /**
     * Regenerate recovery codes.
     */
    public function regenerateRecoveryCodes(Request $request): JsonResponse
    {
        $codes = $this->twoFactorService->regenerateRecoveryCodes($request->user());

        return response()->json([
            'message'        => 'Recovery codes regenerated.',
            'recovery_codes' => $codes,
        ]);
    }
}
