<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTournamentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tournaments = Tournament::latest()->paginate(20);
        return response()->json([
            'data' => $tournaments->items(),
            'meta' => ['total' => $tournaments->total()]
        ]);
    }

    public function feature(Tournament $tournament, Request $request): JsonResponse
    {
        $tournament->update(['is_featured' => true]);
        return response()->json(['message' => 'Tournament featured.']);
    }
}
