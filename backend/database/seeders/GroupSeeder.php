<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\User;
use App\Models\Game;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GroupSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::first();
        if (!$owner) return;

        $groups = [
            [
                'name' => 'Valorant Bangladesh Squad',
                'description' => 'The official competitive community for Valorant players in Bangladesh. Daily 5v5 customs, tournament scrims, and rank grinds.',
                'avatar' => '/squad_emblem.jpg',
                'cover_image' => '/squad_emblem.jpg',
                'type' => 'public',
                'is_verified' => true,
                'members_count' => 12340,
                'posts_count' => 840,
                'game_slug' => 'valorant',
            ],
            [
                'name' => 'PC Gamers BD',
                'description' => 'The premier hub for PC enthusiasts! GPU discussions, custom liquid-cooling desk setups, Steam sales, and troubleshooting.',
                'avatar' => '/battlestation_setup.jpg',
                'cover_image' => '/battlestation_setup.jpg',
                'type' => 'public',
                'is_verified' => true,
                'members_count' => 18650,
                'posts_count' => 1420,
                'game_slug' => 'cyberpunk-2077',
            ],
            [
                'name' => 'Minecraft Master Builders',
                'description' => 'A creative haven for architects, redstone engineers, and survival squad players. Share megabuilds, shader packs, and server IPs.',
                'avatar' => '/minecraft_castle.jpg',
                'cover_image' => '/minecraft_castle.jpg',
                'type' => 'public',
                'is_verified' => true,
                'members_count' => 9820,
                'posts_count' => 610,
                'game_slug' => 'minecraft',
            ],
            [
                'name' => 'Call of Duty: Warzone Zone',
                'description' => 'Drop in, squad up! Find teammates with mics, share loadout builds, weapon recoil patterns, and high-kill Resurgence gameplay clips.',
                'avatar' => '/clutch_gameplay.jpg',
                'cover_image' => '/clutch_gameplay.jpg',
                'type' => 'public',
                'is_verified' => true,
                'members_count' => 15200,
                'posts_count' => 990,
                'game_slug' => 'call-of-duty-warzone',
            ],
            [
                'name' => 'Apex Legends Ranked Predators',
                'description' => 'High-tier competitive Apex squad searching, diamond-to-predator pushes, meta discussions, and vod reviews.',
                'avatar' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=80',
                'cover_image' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
                'type' => 'public',
                'is_verified' => false,
                'members_count' => 7400,
                'posts_count' => 430,
                'game_slug' => 'apex-legends',
            ],
            [
                'name' => 'Soulsborne Veterans',
                'description' => 'For those who walk the Lands Between, Yharnam, and Lordran. Boss strategies, lore deep-dives, and no-hit speedruns.',
                'avatar' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80',
                'cover_image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
                'type' => 'public',
                'is_verified' => true,
                'members_count' => 11100,
                'posts_count' => 720,
                'game_slug' => 'elden-ring',
            ],
            [
                'name' => 'eFootball & FC 24 League BD',
                'description' => 'Weekly online esports cups, 1v1 divisions, squad tactics, and mobile & console tournament registration.',
                'avatar' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
                'cover_image' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
                'type' => 'public',
                'is_verified' => true,
                'members_count' => 14500,
                'posts_count' => 880,
                'game_slug' => 'efootball-2024',
            ],
            [
                'name' => 'GTA V Roleplay Community',
                'description' => 'Serious GTA V RP servers, FiveM custom scripts, law enforcement academies, and gang factions in Los Santos.',
                'avatar' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
                'cover_image' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
                'type' => 'public',
                'is_verified' => false,
                'members_count' => 8900,
                'posts_count' => 510,
                'game_slug' => 'grand-theft-auto-v',
            ],
        ];

        foreach ($groups as $gData) {
            $gameSlug = $gData['game_slug'];
            unset($gData['game_slug']);

            $game = Game::where('slug', $gameSlug)->first();

            $slug = Str::slug($gData['name']);
            $group = Group::updateOrCreate(
                ['slug' => $slug],
                array_merge($gData, [
                    'owner_id'    => $owner->id,
                    'game_id'     => $game?->id,
                    'country'     => 'BD',
                    'language'    => 'en',
                    'is_active'   => true,
                ])
            );

            // Ensure owner is a member
            $group->members()->syncWithoutDetaching([
                $owner->id => ['role' => 'owner', 'status' => 'approved']
            ]);
        }
    }
}
