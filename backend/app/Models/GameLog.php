<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameLog extends Model
{

    protected $table = 'game_logs';

    protected $fillable = [
        'game_id',
        'event_type',
        'payload',
        'timestamp',
    ];
}
