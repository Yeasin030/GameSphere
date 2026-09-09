<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginService
{
    /**
     * Authenticate a user by email/username + password.
     *
     * @return array{user?: User, token?: string, requires_2fa?: bool, two_fa_token?: string}
     * @throws ValidationException
     */
    public function login(array $credentials, string $ip, ?string $userAgent = 'GameSphere'): array
    {
        $user = $this->resolveUser($credentials['login']);

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->is_suspended) {
            throw ValidationException::withMessages([
                'login' => ['Your account has been suspended.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'login' => ['Your account is inactive. Please contact support.'],
            ]);
        }

        // 2FA check
        if ($user->two_factor_confirmed) {
            $twoFaToken = Str::random(64);
            Cache::put("2fa_pending:{$twoFaToken}", $user->id, now()->addMinutes(10));

            return [
                'requires_2fa' => true,
                'two_fa_token' => $twoFaToken,
            ];
        }

        // Expire tokens if 'remember' is not set
        $expiry = ($credentials['remember'] ?? false)
            ? now()->addDays(60)
            : now()->addDays(7);

        $token = $user->createToken(
            $credentials['device'] ?? 'web',
            ['*'],
            $expiry
        )->plainTextToken;

        $user->updateLastSeen();

        return [
            'requires_2fa' => false,
            'user'         => $user,
            'token'        => $token,
        ];
    }

    private function resolveUser(string $login): ?User
    {
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        return User::where($field, $login)->first();
    }
}
