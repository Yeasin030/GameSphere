<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'GameSphere API',
        'status' => 'online',
        'documentation' => url('/api/documentation'),
        'version' => 'v1'
    ]);
});

Route::get('/verify-email/{id}/{hash}', [\App\Http\Controllers\Api\V1\Auth\EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
