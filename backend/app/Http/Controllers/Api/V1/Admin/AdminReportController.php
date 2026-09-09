<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Report;

class AdminReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');
        $reports = Report::with(['reporter', 'reportable'])
            ->where('status', $status)
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $reports->items(),
            'meta' => ['total' => $reports->total()]
        ]);
    }

    public function show(Report $report): JsonResponse
    {
        $report->load(['reporter', 'resolver', 'reportable']);
        return response()->json(['data' => $report]);
    }

    public function resolve(Report $report, Request $request): JsonResponse
    {
        $report->update([
            'status' => 'resolved',
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'Report resolved.', 'data' => $report]);
    }

    public function dismiss(Report $report, Request $request): JsonResponse
    {
        $report->update([
            'status' => 'dismissed',
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'Report dismissed.', 'data' => $report]);
    }
}
