<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $demoUser = User::where('email', 'demo@gamesphere.com')->first() ?? User::first();

        if (!$demoUser) {
            return;
        }

        // Clean existing notifications for demo user before seeding fresh ones
        DB::table('notifications')->where('notifiable_id', $demoUser->id)->delete();

        $sampleNotifications = [
            [
                'id'         => (string) Str::uuid(),
                'type'       => 'App\\Notifications\\TournamentBracketLive',
                'category'   => 'tournament',
                'title'      => 'Valorant Custom 5v5',
                'message'    => 'Tournament bracket is now live! Check your match schedule against Team Phantom.',
                'action_url' => '/tournaments',
                'actor'      => [
                    'name'     => 'GameSphere Arena',
                    'username' => 'arena_bot',
                    'avatar'   => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
                ],
                'read_at'    => null, // Unread
                'created_at' => now()->subMinutes(3),
            ],
            [
                'id'         => (string) Str::uuid(),
                'type'       => 'App\\Notifications\\PostLiked',
                'category'   => 'social',
                'title'      => 'AlexTheGreat liked your clip',
                'message'    => 'AlexTheGreat reacted with 🔥 to your post: "Just hit Radiant in Valorant! 🚀"',
                'action_url' => '/feed',
                'actor'      => [
                    'name'     => 'AlexTheGreat',
                    'username' => 'alexthegreat',
                    'avatar'   => 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
                ],
                'read_at'    => null, // Unread
                'created_at' => now()->subMinutes(18),
            ],
            [
                'id'         => (string) Str::uuid(),
                'type'       => 'App\\Notifications\\UserFollowed',
                'category'   => 'social',
                'title'      => 'New Follower Alert',
                'message'    => 'Tyler "Ninja" started following your gaming profile.',
                'action_url' => '/profile',
                'actor'      => [
                    'name'     => 'Tyler "Ninja"',
                    'username' => 'ninja_gamer',
                    'avatar'   => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                ],
                'read_at'    => null, // Unread
                'created_at' => now()->subHours(1),
            ],
            [
                'id'         => (string) Str::uuid(),
                'type'       => 'App\\Notifications\\GroupInvitation',
                'category'   => 'group',
                'title'      => 'Community Invite',
                'message'    => 'SarahSniper invited you to join the "Apex Legends Community" squad.',
                'action_url' => '/groups',
                'actor'      => [
                    'name'     => 'SarahSniper',
                    'username' => 'pixel_queen',
                    'avatar'   => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                ],
                'read_at'    => null, // Unread
                'created_at' => now()->subHours(3),
            ],
            [
                'id'         => (string) Str::uuid(),
                'type'       => 'App\\Notifications\\GameDealAlert',
                'category'   => 'game',
                'title'      => 'Wishlist Deal Alert',
                'message'    => 'Cyberpunk 2077: Phantom Liberty is now on sale! 50% off for the next 48 hours.',
                'action_url' => '/games',
                'actor'      => [
                    'name'     => 'Steam Store',
                    'username' => 'steam_deals',
                    'avatar'   => 'https://images.unsplash.com/photo-1612287233207-6b450148154c?w=150&auto=format&fit=crop&q=80',
                ],
                'read_at'    => now()->subDays(1), // Read
                'created_at' => now()->subDays(1),
            ],
            [
                'id'         => (string) Str::uuid(),
                'type'       => 'App\\Notifications\\TournamentRegistration',
                'category'   => 'tournament',
                'title'      => 'Registration Confirmed',
                'message'    => 'Your slot in the Apex Legends Trios Championship #4 has been confirmed! Starts Saturday.',
                'action_url' => '/tournaments',
                'actor'      => [
                    'name'     => 'Apex Competitive',
                    'username' => 'apex_esports',
                    'avatar'   => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
                ],
                'read_at'    => now()->subDays(2), // Read
                'created_at' => now()->subDays(2),
            ],
            [
                'id'         => (string) Str::uuid(),
                'type'       => 'App\\Notifications\\PostCommented',
                'category'   => 'social',
                'title'      => 'New Comment on your video',
                'message'    => 'Michael Aim replied: "That 1v4 clutch on Site B was absolutely insane!"',
                'action_url' => '/feed',
                'actor'      => [
                    'name'     => 'Michael Aim',
                    'username' => 'shroud_fps',
                    'avatar'   => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                ],
                'read_at'    => now()->subDays(3), // Read
                'created_at' => now()->subDays(3),
            ],
        ];

        foreach ($sampleNotifications as $n) {
            DB::table('notifications')->insert([
                'id'              => $n['id'],
                'type'            => $n['type'],
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id'   => $demoUser->id,
                'data'            => json_encode([
                    'category'   => $n['category'],
                    'title'      => $n['title'],
                    'message'    => $n['message'],
                    'action_url' => $n['action_url'],
                    'actor'      => $n['actor'],
                ]),
                'read_at'         => $n['read_at'],
                'created_at'      => $n['created_at'],
                'updated_at'      => $n['created_at'],
            ]);
        }
    }
}
