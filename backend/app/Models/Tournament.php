<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tournament extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'game_id',
        'name',
        'slug',
        'description',
        'banner',
        'rules',
        'format',
        'team_mode',
        'team_size',
        'max_participants',
        'registered_count',
        'entry_fee',
        'currency',
        'prize_info',
        'region',
        'platform_type',
        'status',
        'is_featured',
        'is_verified',
        'require_check_in',
        'registration_starts_at',
        'registration_ends_at',
        'check_in_starts_at',
        'check_in_ends_at',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'team_size'              => 'integer',
            'max_participants'       => 'integer',
            'registered_count'       => 'integer',
            'entry_fee'              => 'decimal:2',
            'is_featured'            => 'boolean',
            'is_verified'            => 'boolean',
            'require_check_in'       => 'boolean',
            'registration_starts_at' => 'datetime',
            'registration_ends_at'   => 'datetime',
            'check_in_starts_at'     => 'datetime',
            'check_in_ends_at'       => 'datetime',
            'starts_at'              => 'datetime',
            'ends_at'                => 'datetime',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(TournamentRegistration::class);
    }

    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class);
    }
}
