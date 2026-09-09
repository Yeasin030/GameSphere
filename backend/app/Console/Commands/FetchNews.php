<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\FetchNewsFromSources;

class FetchNews extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'news:fetch';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch the job to fetch news from all active RSS sources';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Dispatching FetchNewsFromSources job...');
        FetchNewsFromSources::dispatch();
        $this->info('Job dispatched.');
    }
}
