<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles;

    protected $fillable = [
        'username',
        'email',
        'password',
        'display_name',
        'avatar',
        'cover_image',
        'bio',
        'website',
        'country',
        'timezone',
        'account_type',
        'is_verified',
        'is_active',
        'show_online_status',
        'locale',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'         => 'datetime',
            'last_seen_at'              => 'datetime',
            'suspended_until'           => 'datetime',
            'is_verified'               => 'boolean',
            'is_active'                 => 'boolean',
            'is_suspended'              => 'boolean',
            'show_online_status'        => 'boolean',
            'two_factor_confirmed'      => 'boolean',
            'followers_count'           => 'integer',
            'following_count'           => 'integer',
            'friends_count'             => 'integer',
            'posts_count'               => 'integer',
            'password'                  => 'hashed',
        ];
    }

    // ─── Relationships ──────────────────────────────────────────────

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    public function reels(): HasMany
    {
        return $this->hasMany(Reel::class);
    }

    public function videos(): HasMany
    {
        return $this->hasMany(Video::class);
    }

    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function privacySettings(): HasOne
    {
        return $this->hasOne(UserPrivacySetting::class);
    }

    public function notificationPreferences(): HasOne
    {
        return $this->hasOne(UserNotificationPreference::class);
    }

    // Follow system
    public function followings(): HasMany
    {
        return $this->hasMany(Follower::class, 'follower_id');
    }

    public function followers(): HasMany
    {
        return $this->hasMany(Follower::class, 'following_id');
    }

    public function followingUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'followers', 'follower_id', 'following_id')
            ->withTimestamps();
    }

    public function followerUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'followers', 'following_id', 'follower_id')
            ->withTimestamps();
    }

    // Friendship system
    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'requester_id');
    }

    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'recipient_id');
    }

    public function friends(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'friendships', 'requester_id', 'recipient_id')
            ->wherePivot('status', 'accepted')
            ->withTimestamps()
            ->union(
                $this->belongsToMany(User::class, 'friendships', 'recipient_id', 'requester_id')
                    ->wherePivot('status', 'accepted')
            );
    }

    // Blocks
    public function blockedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'blocks', 'blocker_id', 'blocked_id')
            ->withTimestamps();
    }

    // Games
    public function games(): BelongsToMany
    {
        return $this->belongsToMany(Game::class, 'user_games')
            ->withPivot(['status', 'display_order', 'show_on_profile', 'playtime_hours', 'rating'])
            ->withTimestamps()
            ->orderByPivot('display_order');
    }

    public function favoriteGames(): BelongsToMany
    {
        return $this->belongsToMany(Game::class, 'user_games')
            ->wherePivot('status', 'favorite')
            ->wherePivot('show_on_profile', true)
            ->withPivot(['status', 'display_order'])
            ->orderByPivot('display_order');
    }

    // Groups
    public function ownedGroups(): HasMany
    {
        return $this->hasMany(Group::class, 'owner_id');
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_members')
            ->withPivot(['role', 'status'])
            ->withTimestamps();
    }

    // Achievements
    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot(['unlocked_at', 'is_displayed'])
            ->withTimestamps();
    }

    // Conversations
    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_members')
            ->withPivot(['role', 'last_read_at', 'is_muted', 'is_archived'])
            ->withTimestamps();
    }

    // Tournaments
    public function tournaments(): HasMany
    {
        return $this->hasMany(Tournament::class);
    }

    public function tournamentRegistrations(): HasMany
    {
        return $this->hasMany(TournamentRegistration::class);
    }

    // News
    public function savedNewsArticles(): BelongsToMany
    {
        return $this->belongsToMany(NewsArticle::class, 'saved_news', 'user_id', 'article_id')
            ->withTimestamps();
    }

    // ─── Scopes ─────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('is_suspended', false);
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('username', 'LIKE', "%{$term}%")
              ->orWhere('display_name', 'LIKE', "%{$term}%");
        });
    }

    // ─── Accessors ──────────────────────────────────────────────────

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
                return $this->avatar;
            }
            return \Storage::disk('s3')->url($this->avatar);
        }
        return "https://api.dicebear.com/8.x/initials/svg?seed={$this->username}";
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        if ($this->cover_image) {
            if (str_starts_with($this->cover_image, 'http://') || str_starts_with($this->cover_image, 'https://')) {
                return $this->cover_image;
            }
            return \Storage::disk('s3')->url($this->cover_image);
        }
        return null;
    }

    public function getIsOnlineAttribute(): bool
    {
        if (! $this->show_online_status) {
            return false;
        }
        return $this->last_seen_at && $this->last_seen_at->diffInMinutes(now()) < 5;
    }

    // ─── Helpers ────────────────────────────────────────────────────

    public function isFollowing(User $user): bool
    {
        return $this->followingUsers()->where('following_id', $user->id)->exists();
    }

    public function isFriendWith(User $user): bool
    {
        return Friendship::where(function ($q) use ($user) {
            $q->where('requester_id', $this->id)->where('recipient_id', $user->id);
        })->orWhere(function ($q) use ($user) {
            $q->where('requester_id', $user->id)->where('recipient_id', $this->id);
        })->where('status', 'accepted')->exists();
    }

    public function hasBlocked(User $user): bool
    {
        return $this->blockedUsers()->where('blocked_id', $user->id)->exists();
    }

    public function updateLastSeen(): void
    {
        $this->timestamps = false;
        $this->update(['last_seen_at' => now()]);
        $this->timestamps = true;
    }
}
