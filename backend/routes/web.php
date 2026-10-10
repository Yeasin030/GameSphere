<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function ($any = '/') {
    $path = public_path($any);
    if ($any !== '/' && file_exists($path . '.html')) {
        return file_get_contents($path . '.html');
    }
    if (file_exists($path . '/index.html')) {
        return file_get_contents($path . '/index.html');
    }
    if (file_exists($path) && is_file($path)) {
        return file_get_contents($path);
    }
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api).*$');

Route::get('/verify-email/{id}/{hash}', [\App\Http\Controllers\Api\V1\Auth\EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
