<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\NewsSource;
use App\Services\News\RssFetcherService;

class FetchNewsFromSources implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(RssFetcherService $fetcher): void
    {
        // Fetch active sources that are due for fetching
        $sources = NewsSource::active()
            ->where(function ($query) {
                $query->whereNull('last_fetched_at')
                      ->orWhereRaw('last_fetched_at <= DATE_SUB(NOW(), INTERVAL fetch_interval_minutes MINUTE)');
            })
            ->get();

        foreach ($sources as $source) {
            $fetcher->fetchSource($source);
        }
    }
}
