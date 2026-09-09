<?php

namespace App\Services\Auth;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class OAuthService
{
    private const SUPPORTED_PROVIDERS = [
        'google', 'discord', 'steam', 'twitch', 'github', 'twitter',
    ];

    /**
     * Return the OAuth provider redirect URL.
     */
    public function getRedirectUrl(string $provider): string
    {
        $this->validateProvider($provider);
        return Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();
    }

    /**
     * Handle the callback and return user + token.
     *
     * @return array{user: User, token: string, is_new: bool}
     */
    public function handleCallback(string $provider): array
    {
        $this->validateProvider($provider);

        $socialUser = Socialite::driver($provider)->stateless()->user();

        return DB::transaction(function () use ($provider, $socialUser) {
            // Find existing social account
            $account = SocialAccount::where('provider', $provider)
                ->where('provider_user_id', $socialUser->getId())
                ->first();

            if ($account) {
                // Update token
                $account->update([
                    'access_token'  => encrypt($socialUser->token),
                    'refresh_token' => $socialUser->refreshToken ? encrypt($socialUser->refreshToken) : null,
                    'expires_at'    => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
                ]);

                $user   = $account->user;
                $isNew  = false;
            } else {
                // Try to find user by email
                $user = $socialUser->getEmail()
                    ? User::where('email', $socialUser->getEmail())->first()
                    : null;

                if (! $user) {
                    // Create new user
                    $user = User::create([
                        'username'     => $this->generateUsername($socialUser->getNickname() ?? $socialUser->getName()),
                        'email'        => $socialUser->getEmail(),
                        'password'     => bcrypt(Str::random(32)),
                        'display_name' => $socialUser->getName(),
                        'avatar'       => $socialUser->getAvatar(),
                        'is_active'    => true,
                        'email_verified_at' => now(), // OAuth emails are considered verified
                    ]);

                    $user->privacySettings()->create([
                        'profile_visibility'    => 'public',
                        'show_online_status'    => true,
                        'allow_friend_requests' => true,
                        'allow_messages_from'   => 'everyone',
                    ]);
                    $user->notificationPreferences()->create([
                        'email_new_follower'    => true,
                        'email_post_reactions'  => true,
                        'email_comments'        => true,
                        'email_messages'        => true,
                        'push_new_follower'     => true,
                        'push_post_reactions'   => true,
                        'push_comments'         => true,
                        'push_messages'         => true,
                    ]);
                    $user->assignRole('user');
                }

                $user->socialAccounts()->create([
                    'provider'          => $provider,
                    'provider_user_id'  => $socialUser->getId(),
                    'access_token'      => encrypt($socialUser->token),
                    'refresh_token'     => $socialUser->refreshToken ? encrypt($socialUser->refreshToken) : null,
                    'expires_at'        => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
                ]);

                $isNew = true;
            }

            $user->updateLastSeen();
            $token = $user->createToken("{$provider}_token", ['*'], now()->addDays(30))->plainTextToken;

            return ['user' => $user, 'token' => $token, 'is_new' => $isNew];
        });
    }

    private function validateProvider(string $provider): void
    {
        if (! in_array($provider, self::SUPPORTED_PROVIDERS)) {
            abort(404, "OAuth provider '{$provider}' is not supported.");
        }
    }

    private function generateUsername(string $base): string
    {
        $slug = Str::slug($base, '_');
        $slug = substr($slug, 0, 20);

        $username = $slug;
        $i        = 1;
        while (User::where('username', $username)->exists()) {
            $username = "{$slug}_{$i}";
            $i++;
        }

        return $username;
    }
}
