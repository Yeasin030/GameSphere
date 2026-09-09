<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    /**
     * Resolve the current user, with demo user fallback.
     */
    protected function resolveUser(Request $request): ?User
    {
        return $request->user('sanctum')
            ?: $request->user()
            ?: User::where('email', 'demo@gamesphere.com')->first()
            ?: User::first();
    }

    /**
     * Get notifications for the user with optional filter.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json([
                'data'         => [],
                'unread_count' => 0,
                'meta'         => [
                    'current_page' => 1,
                    'last_page'    => 1,
                    'total'        => 0,
                ],
            ]);
        }

        $filter = $request->query('filter', 'all');

        $query = $user->notifications();

        if ($filter === 'unread') {
            $query = $user->unreadNotifications();
        }

        $notifications = $query->latest()->paginate(30);

        $items = collect($notifications->items())->map(function ($n) {
            $data = is_array($n->data) ? $n->data : json_decode($n->data, true);
            if (!is_array($data)) {
                $data = [];
            }

            return [
                'id'               => $n->id,
                'type'             => $n->type,
                'category'         => $data['category'] ?? 'system',
                'title'            => $data['title'] ?? 'Notification',
                'message'          => $data['message'] ?? '',
                'action_url'       => $data['action_url'] ?? '/feed',
                'actor'            => $data['actor'] ?? null,
                'read_at'          => $n->read_at ? $n->read_at->toIso8601String() : null,
                'created_at'       => $n->created_at ? $n->created_at->toIso8601String() : null,
                'created_at_human' => $n->created_at ? $n->created_at->diffForHumans() : 'Just now',
            ];
        });

        // Filter by category if a specific category was requested
        if ($filter && !in_array($filter, ['all', 'unread'])) {
            $items = $items->filter(function ($item) use ($filter) {
                return strtolower($item['category']) === strtolower($filter);
            })->values();
        }

        return response()->json([
            'data'         => $items,
            'unread_count' => $user->unreadNotifications()->count(),
            'meta'         => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'total'        => $notifications->total(),
            ],
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);

        if ($user) {
            $notification = $user->notifications()->where('id', $id)->first();
            if ($notification) {
                $notification->markAsRead();
            }
        }

        $unreadCount = $user ? $user->unreadNotifications()->count() : 0;

        return response()->json([
            'message'      => 'Notification marked as read.',
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if ($user) {
            $user->unreadNotifications->markAsRead();
        }

        return response()->json([
            'message'      => 'All notifications marked as read.',
            'unread_count' => 0,
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);

        if ($user) {
            $notification = $user->notifications()->where('id', $id)->first();
            if ($notification) {
                $notification->delete();
            }
        }

        $unreadCount = $user ? $user->unreadNotifications()->count() : 0;

        return response()->json([
            'message'      => 'Notification deleted.',
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get unread notification count.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        return response()->json([
            'count' => $user ? $user->unreadNotifications()->count() : 0,
        ]);
    }

    /**
     * Generate a test notification for live preview and testing.
     */
    public function sendTest(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return response()->json(['message' => 'No user found'], 404);
        }

        $templates = [
            [
                'category'   => 'tournament',
                'title'      => 'Championship Finals Bracket',
                'message'    => 'The Valorant Grand Final matches start in 30 minutes! Join the stream.',
                'action_url' => '/tournaments',
                'actor'      => [
                    'name'     => 'GameSphere Arena',
                    'username' => 'arena_bot',
                    'avatar'   => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'category'   => 'social',
                'title'      => 'Kaito Ken commented on your clip',
                'message'    => 'Kaito Ken replied: "Insane reflexes! Which mouse DPI do you use?"',
                'action_url' => '/feed',
                'actor'      => [
                    'name'     => 'Kaito Ken',
                    'username' => 'cyber_samurai',
                    'avatar'   => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'category'   => 'social',
                'title'      => 'New Squad Request',
                'message'    => 'Imane Cozy sent you a friend request for Valorant competitive.',
                'action_url' => '/profile',
                'actor'      => [
                    'name'     => 'Imane Cozy',
                    'username' => 'pokimane_vibes',
                    'avatar'   => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'category'   => 'game',
                'title'      => 'Steam Weekend Publisher Sale',
                'message'    => 'EA Sports FC 24 and Elden Ring are currently 40% off on Steam!',
                'action_url' => '/games',
                'actor'      => [
                    'name'     => 'Game Deals',
                    'username' => 'game_deals',
                    'avatar'   => 'https://images.unsplash.com/photo-1612287233207-6b450148154c?w=150&auto=format&fit=crop&q=80',
                ],
            ],
        ];

        $chosen = $templates[array_rand($templates)];
        $id = (string) Str::uuid();

        DB::table('notifications')->insert([
            'id'              => $id,
            'type'            => 'App\\Notifications\\LiveGamingNotification',
            'notifiable_type' => 'App\\Models\\User',
            'notifiable_id'   => $user->id,
            'data'            => json_encode($chosen),
            'read_at'         => null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return response()->json([
            'message'      => 'Test notification generated successfully.',
            'notification' => array_merge($chosen, [
                'id'               => $id,
                'read_at'          => null,
                'created_at'       => now()->toIso8601String(),
                'created_at_human' => 'Just now',
            ]),
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Update notification preferences.
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $request->validate([
            'email_notifications' => 'boolean',
            'push_notifications'  => 'boolean',
        ]);

        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $settings = $user->settings ?? $user->settings()->create();
        $settings->update($request->only(['email_notifications', 'push_notifications']));

        return response()->json(['message' => 'Preferences updated.', 'data' => $settings]);
    }
}
