<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminModerationController extends Controller
{
    public function queue(Request $request): JsonResponse
    {
        // Dummy implementation for moderation queue
        return response()->json(['data' => []]);
    }
}
