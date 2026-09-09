<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'type',
        'rarity',
        'points',
        'criteria',
        'is_secret',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'points'    => 'integer',
            'criteria'  => 'array',
            'is_secret' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withPivot(['unlocked_at', 'is_displayed'])
            ->withTimestamps();
    }
}
