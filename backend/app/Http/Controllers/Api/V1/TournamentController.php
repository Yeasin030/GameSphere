<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Models\TournamentRegistration;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TournamentController extends Controller
{
    /**
     * Resolve currently authenticated user or fall back to demo user.
     */
    private function resolveUser(Request $request): ?User
    {
        return $request->user('sanctum') ?? $request->user() ?? User::where('email', 'demo@gamesphere.com')->first() ?? User::first();
    }

    /**
     * List tournaments with filters and user context.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $status = $request->query('status');
        $gameId = $request->query('game_id');
        $gameSlug = $request->query('game');
        $search = $request->query('q');

        $query = Tournament::with([
            'host:id,username,display_name,avatar,is_verified',
            'game:id,name,slug,cover_image',
            'registrations' => function ($q) {
                $q->with('user:id,username,display_name,avatar')->limit(6);
            }
        ]);

        // Status filter
        if ($status && $status !== 'all') {
            if ($status === 'live' || $status === 'in_progress') {
                $query->where('status', 'in_progress');
            } elseif ($status === 'upcoming' || $status === 'registration') {
                $query->whereIn('status', ['registration', 'draft', 'check_in']);
            } elseif ($status === 'completed') {
                $query->where('status', 'completed');
            } else {
                $query->where('status', $status);
            }
        }

        // Game filter
        if ($gameId) {
            $query->where('game_id', $gameId);
        } elseif ($gameSlug) {
            $query->whereHas('game', function ($q) use ($gameSlug) {
                $q->where('slug', $gameSlug);
            });
        }

        // Search query
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('game', function ($gq) use ($search) {
                      $gq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Ordering: live first, then registration, then soonest starts_at, then completed
        $tournaments = $query
            ->orderByRaw("CASE WHEN status = 'in_progress' THEN 1 WHEN status = 'registration' THEN 2 WHEN status = 'check_in' THEN 3 ELSE 4 END")
            ->orderBy('starts_at', 'asc')
            ->paginate(12);

        $registeredTournamentIds = [];
        if ($user) {
            $registeredTournamentIds = TournamentRegistration::where('user_id', $user->id)
                ->whereIn('tournament_id', $tournaments->pluck('id'))
                ->pluck('tournament_id')
                ->toArray();
        }

        $items = collect($tournaments->items())->map(function ($t) use ($registeredTournamentIds) {
            $data = $t->toArray();
            $data['is_registered'] = in_array($t->id, $registeredTournamentIds);
            $data['participants_preview'] = $t->registrations->map(fn($r) => $r->user)->filter()->values();
            return $data;
        });

        // Quick aggregate stats
        $totalPrizeAmount = Tournament::sum('entry_fee');
        $stats = [
            'total_tournaments' => Tournament::count(),
            'live_count' => Tournament::where('status', 'in_progress')->count(),
            'registration_open_count' => Tournament::where('status', 'registration')->count(),
            'total_players' => TournamentRegistration::count(),
        ];

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $tournaments->currentPage(),
                'last_page' => $tournaments->lastPage(),
                'per_page' => $tournaments->perPage(),
                'total' => $tournaments->total(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Create tournament.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'banner' => 'nullable|string',
            'rules' => 'nullable|string',
            'format' => 'required|in:single_elimination,double_elimination,round_robin,league,battle_royale,swiss,custom',
            'team_mode' => 'required|in:solo,2v2,3v3,4v4,5v5,custom',
            'team_size' => 'nullable|integer|min:1',
            'max_participants' => 'required|integer|min:2',
            'entry_fee' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'prize_info' => 'nullable|string|max:500',
            'region' => 'nullable|string|max:100',
            'platform_type' => 'nullable|in:pc,console,mobile,cross_platform',
            'starts_at' => 'required|date',
            'registration_ends_at' => 'required|date',
        ]);

        $tournament = Tournament::create([
            'user_id' => $user->id,
            'slug' => Str::slug($request->name) . '-' . Str::random(6),
            'status' => 'registration',
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Tournament created successfully!',
            'data' => $tournament->load(['host', 'game'])
        ], 201);
    }

    /**
     * Get tournament details.
     */
    public function show(Tournament $tournament, Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $tournament->load([
            'host:id,username,display_name,avatar,is_verified',
            'game:id,name,slug,cover_image',
            'registrations.user:id,username,display_name,avatar',
            'matches' => function ($q) {
                $q->with([
                    'participantA.user:id,username,display_name,avatar',
                    'participantB.user:id,username,display_name,avatar',
                    'winner.user:id,username,display_name,avatar'
                ])->orderBy('round_number')->orderBy('match_number');
            }
        ]);

        $isRegistered = false;
        if ($user) {
            $isRegistered = $tournament->registrations->contains('user_id', $user->id);
        }

        $data = $tournament->toArray();
        $data['is_registered'] = $isRegistered;

        return response()->json(['data' => $data]);
    }

    /**
     * Register for tournament.
     */
    public function register(Tournament $tournament, Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($tournament->status, ['registration', 'draft', 'check_in'])) {
            return response()->json(['message' => 'Registration is currently closed for this tournament.'], 400);
        }

        if ($tournament->registered_count >= $tournament->max_participants) {
            return response()->json(['message' => 'Tournament bracket is currently full.'], 400);
        }

        $existing = TournamentRegistration::where('tournament_id', $tournament->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You are already registered for this tournament.',
                'registered_count' => $tournament->registered_count,
                'is_registered' => true,
            ], 200);
        }

        $registration = TournamentRegistration::create([
            'tournament_id' => $tournament->id,
            'user_id' => $user->id,
            'registered_at' => now(),
            'status' => 'approved',
            'seed' => $tournament->registered_count + 1,
        ]);

        $tournament->increment('registered_count');
        $tournament->refresh();

        return response()->json([
            'message' => 'Registered successfully for ' . $tournament->name . '!',
            'registered_count' => $tournament->registered_count,
            'is_registered' => true,
            'data' => $registration->load('user:id,username,display_name,avatar'),
        ]);
    }

    /**
     * Unregister from tournament.
     */
    public function unregister(Tournament $tournament, Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($tournament->status === 'completed') {
            return response()->json(['message' => 'Cannot leave a completed tournament.'], 400);
        }

        $registration = TournamentRegistration::where('tournament_id', $tournament->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$registration) {
            return response()->json([
                'message' => 'You are not currently registered for this tournament.',
                'registered_count' => $tournament->registered_count,
                'is_registered' => false,
            ], 400);
        }

        $registration->delete();

        if ($tournament->registered_count > 0) {
            $tournament->decrement('registered_count');
        }
        $tournament->refresh();

        return response()->json([
            'message' => 'Successfully left the tournament.',
            'registered_count' => $tournament->registered_count,
            'is_registered' => false,
        ]);
    }

    /**
     * Get tournament bracket.
     */
    public function bracket(Tournament $tournament): JsonResponse
    {
        $matches = $tournament->matches()
            ->with([
                'participantA.user:id,username,display_name,avatar',
                'participantB.user:id,username,display_name,avatar',
                'winner.user:id,username,display_name,avatar'
            ])
            ->orderBy('round_number')
            ->orderBy('match_number')
            ->get();

        // Group matches by round for seamless UI rendering
        $rounds = $matches->groupBy('round_name')->map(function ($roundMatches, $roundName) {
            return [
                'round_name' => $roundName,
                'round_number' => $roundMatches->first()->round_number ?? 1,
                'matches' => $roundMatches->values(),
            ];
        })->values();

        return response()->json([
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'format' => $tournament->format,
                'status' => $tournament->status,
            ],
            'rounds' => $rounds,
            'matches' => $matches,
        ]);
    }

    /**
     * Get participants.
     */
    public function participants(Tournament $tournament): JsonResponse
    {
        $participants = $tournament->registrations()
            ->with('user:id,username,display_name,avatar,is_verified')
            ->orderBy('seed')
            ->get();

        return response()->json(['data' => $participants]);
    }

    /**
     * Get user's registered tournaments.
     */
    public function myTournaments(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['data' => []]);
        }

        $tournaments = Tournament::with(['game:id,name,slug,cover_image'])
            ->whereHas('registrations', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orWhere('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json(['data' => $tournaments]);
    }
}
