<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'username'         => $this->username,
            'display_name'     => $this->display_name,
            'email'            => $this->when($this->isCurrentUser($request), $this->email),
            'avatar_url'       => $this->avatar_url,
            'cover_image_url'  => $this->cover_image_url,
            'bio'              => $this->bio,
            'website'          => $this->website,
            'country'          => $this->country,
            'account_type'     => $this->account_type,
            'is_verified'      => $this->is_verified,
            'is_online'        => $this->is_online,
            'last_seen_at'     => $this->when(
                $this->show_online_status || $this->isCurrentUser($request),
                $this->last_seen_at?->diffForHumans()
            ),
            'followers_count'  => $this->followers_count,
            'following_count'  => $this->following_count,
            'friends_count'    => $this->friends_count,
            'posts_count'      => $this->posts_count,

            // Current user specific
            'email_verified_at'   => $this->when($this->isCurrentUser($request), $this->email_verified_at),
            'two_factor_enabled'  => $this->when($this->isCurrentUser($request), $this->two_factor_confirmed),
            'locale'              => $this->when($this->isCurrentUser($request), $this->locale),
            'timezone'            => $this->when($this->isCurrentUser($request), $this->timezone),

            // Relationship status (for other users' profiles)
            'is_following'     => $this->when(
                ! $this->isCurrentUser($request) && $request->user(),
                fn () => $request->user()?->isFollowing($this->resource)
            ),
            'is_friend'        => $this->when(
                ! $this->isCurrentUser($request) && $request->user(),
                fn () => $request->user()?->isFriendWith($this->resource)
            ),
            'has_blocked'      => $this->when(
                ! $this->isCurrentUser($request) && $request->user(),
                fn () => $request->user()?->hasBlocked($this->resource)
            ),

            'created_at'       => $this->created_at?->toDateString(),

            // Eager-loaded relationships
            'privacy_settings'       => $this->whenLoaded('privacySettings', fn () => [
                'profile_visibility'   => $this->privacySettings->profile_visibility,
                'show_online_status'   => $this->privacySettings->show_online_status,
                'allow_messages_from'  => $this->privacySettings->allow_messages_from,
            ]),
        ];
    }

    private function isCurrentUser(Request $request): bool
    {
        return $request->user()?->id === $this->id;
    }
}
