<?php

namespace App\Services\Auth;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    public function __construct(private readonly Google2FA $google2fa) {}

    /**
     * Generate a new 2FA secret and QR code URL.
     */
    public function enable(User $user): array
    {
        $secret = $this->google2fa->generateSecretKey();

        // Store secret temporarily until confirmed
        $user->forceFill(['two_factor_secret' => encrypt($secret)])->save();

        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return [
            'secret'       => $secret,
            'qr_code_url'  => $qrCodeUrl,
        ];
    }

    /**
     * Confirm 2FA by verifying the first TOTP code.
     */
    public function confirm(User $user, string $code): bool
    {
        $secret = decrypt($user->two_factor_secret);

        $valid = $this->google2fa->verifyKey($secret, $code);

        if ($valid) {
            $recoveryCodes = $this->generateRecoveryCodes();
            $user->forceFill([
                'two_factor_confirmed'      => true,
                'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
            ])->save();
        }

        return $valid;
    }

    /**
     * Disable 2FA after verifying a code.
     */
    public function disable(User $user, string $code): bool
    {
        if (! $user->two_factor_confirmed) {
            return false;
        }

        $secret = decrypt($user->two_factor_secret);
        $valid  = $this->google2fa->verifyKey($secret, $code);

        if ($valid) {
            $user->forceFill([
                'two_factor_secret'         => null,
                'two_factor_confirmed'      => false,
                'two_factor_recovery_codes' => null,
            ])->save();
        }

        return $valid;
    }

    /**
     * Verify a TOTP code for the pending 2FA challenge.
     */
    public function challenge(string $twoFaToken, string $code): ?array
    {
        $userId = Cache::pull("2fa_pending:{$twoFaToken}");

        if (! $userId) {
            return null;
        }

        /** @var User $user */
        $user   = User::findOrFail($userId);
        $secret = decrypt($user->two_factor_secret);
        $valid  = $this->google2fa->verifyKey($secret, $code);

        if (! $valid) {
            return null;
        }

        $token = $user->createToken('api_token', ['*'], now()->addDays(7))->plainTextToken;
        $user->updateLastSeen();

        return [
            'user'  => new UserResource($user),
            'token' => $token,
        ];
    }

    /**
     * Regenerate recovery codes.
     */
    public function regenerateRecoveryCodes(User $user): array
    {
        $codes = $this->generateRecoveryCodes();
        $user->forceFill([
            'two_factor_recovery_codes' => encrypt(json_encode($codes)),
        ])->save();

        return $codes;
    }

    private function generateRecoveryCodes(int $count = 8): array
    {
        return array_map(fn() => sprintf(
            '%s-%s',
            strtoupper(substr(bin2hex(random_bytes(4)), 0, 5)),
            strtoupper(substr(bin2hex(random_bytes(4)), 0, 5))
        ), range(1, $count));
    }
}
