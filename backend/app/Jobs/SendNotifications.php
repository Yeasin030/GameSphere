<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class SendNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public User $recipient, public array $notificationData)
    {
    }

    public function handle(): void
    {
        // Actually send push notification or email
        \Log::info("Sending notification to {$this->recipient->email}: {$this->notificationData['message']}");
    }
}
