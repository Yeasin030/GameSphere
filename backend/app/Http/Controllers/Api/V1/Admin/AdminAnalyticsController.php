<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => ['message' => 'Overview analytics']]);
    }

    public function users(Request $request): JsonResponse
    {
        return response()->json(['data' => ['message' => 'User analytics']]);
    }

    public function content(Request $request): JsonResponse
    {
        return response()->json(['data' => ['message' => 'Content analytics']]);
    }

    public function engagement(Request $request): JsonResponse
    {
        return response()->json(['data' => ['message' => 'Engagement analytics']]);
    }
}
