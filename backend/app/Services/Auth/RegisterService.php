<?php

namespace App\Services\Auth;

use Illuminate\Auth\Events\Registered;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegisterService
{
    /**
     * Register a new user and issue an API token.
     *
     * @return array{user: User, token: string}
     */
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            /** @var User $user */
            $user = User::create([
                'username'     => $data['username'],
                'email'        => $data['email'],
                'password'     => $data['password'],
                'display_name' => $data['display_name'] ?? $data['username'],
                'country'      => $data['country'] ?? null,
                'locale'       => $data['locale'] ?? 'en',
                'is_active'    => true,
            ]);

            // Create default privacy settings
            $user->privacySettings()->create([
                'profile_visibility'     => 'public',
                'show_online_status'     => true,
                'allow_friend_requests'  => true,
                'allow_messages_from'    => 'everyone',
            ]);

            // Create default notification preferences
            $user->notificationPreferences()->create([
                'email_new_follower'     => true,
                'email_post_reactions'   => true,
                'email_comments'         => true,
                'email_messages'         => true,
                'push_new_follower'      => true,
                'push_post_reactions'    => true,
                'push_comments'          => true,
                'push_messages'          => true,
            ]);

            // Assign default role
            $user->assignRole('user');

            // Send email verification (best effort so registration succeeds even if mail server is offline)
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Email verification send failed: ' . $e->getMessage());
            }

            event(new Registered($user));

            $token = $user->createToken('api_token', ['*'], now()->addDays(30))->plainTextToken;

            return ['user' => $user, 'token' => $token];
        });
    }
}
