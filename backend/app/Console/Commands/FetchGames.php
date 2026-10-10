<?php

namespace App\Console\Commands;

use App\Jobs\FetchGamesFromRawg;
use Illuminate\Console\Command;

class FetchGames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'games:fetch';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the latest games from RAWG API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Dispatching FetchGamesFromRawg job...');
        FetchGamesFromRawg::dispatch();
        $this->info('Job dispatched.');
    }
}
