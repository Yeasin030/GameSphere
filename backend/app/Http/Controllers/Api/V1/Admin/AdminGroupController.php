<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminGroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $groups = Group::latest()->paginate(20);
        return response()->json([
            'data' => $groups->items(),
            'meta' => ['total' => $groups->total()]
        ]);
    }

    public function destroy(Group $group): JsonResponse
    {
        $group->delete();
        return response()->json(['message' => 'Group deleted.']);
    }
}
