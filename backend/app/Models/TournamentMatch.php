<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TournamentMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'round_name',
        'round_number',
        'match_number',
        'participant_a_id',
        'participant_b_id',
        'winner_id',
        'score',
        'status',
        'match_url',
        'notes',
        'scheduled_at',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'round_number' => 'integer',
            'match_number' => 'integer',
            'score'        => 'array',
            'scheduled_at' => 'datetime',
            'started_at'   => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function participantA(): BelongsTo
    {
        return $this->belongsTo(TournamentRegistration::class, 'participant_a_id');
    }

    public function participantB(): BelongsTo
    {
        return $this->belongsTo(TournamentRegistration::class, 'participant_b_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(TournamentRegistration::class, 'winner_id');
    }
}
