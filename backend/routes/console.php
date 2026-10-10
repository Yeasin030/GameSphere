<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Fetch news automatically every minute.
// The FetchNewsFromSources job checks the fetch_interval_minutes 
// of each source to decide if it actually needs to fetch new items.
Schedule::command('news:fetch')->everyMinute();
Schedule::command('games:fetch')->everyMinute();
