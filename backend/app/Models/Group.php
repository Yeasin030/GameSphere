<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Group extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'game_id',
        'name',
        'slug',
        'description',
        'avatar',
        'cover_image',
        'type',
        'country',
        'language',
        'require_approval',
        'is_verified',
        'is_active',
        'members_count',
        'posts_count',
    ];

    protected function casts(): array
    {
        return [
            'is_verified'      => 'boolean',
            'is_active'        => 'boolean',
            'require_approval' => 'boolean',
            'members_count'    => 'integer',
            'posts_count'      => 'integer',
        ];
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) return null;
        if (str_starts_with($this->avatar, 'http') || str_starts_with($this->avatar, '/')) {
            return $this->avatar;
        }
        return url('storage/' . $this->avatar);
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        if (!$this->cover_image) return null;
        if (str_starts_with($this->cover_image, 'http') || str_starts_with($this->cover_image, '/')) {
            return $this->cover_image;
        }
        return url('storage/' . $this->cover_image);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_members')
            ->withPivot(['role', 'status'])
            ->withTimestamps();
    }

    public function activeMembers(): BelongsToMany
    {
        return $this->members()->wherePivot('status', 'approved');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function scopePublic($query)
    {
        return $query->where('type', 'public');
    }
}
