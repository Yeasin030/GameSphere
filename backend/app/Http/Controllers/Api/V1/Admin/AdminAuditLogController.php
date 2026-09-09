<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class AdminAuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = AuditLog::with(['user', 'auditable'])
            ->latest()
            ->paginate(50);

        return response()->json([
            'data' => $logs->items(),
            'meta' => ['total' => $logs->total()]
        ]);
    }

    public function show(AuditLog $auditLog): JsonResponse
    {
        $auditLog->load(['user', 'auditable']);
        return response()->json(['data' => $auditLog]);
    }
}
