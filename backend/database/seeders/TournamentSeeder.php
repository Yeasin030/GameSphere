<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\TournamentRegistration;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TournamentSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $hostUser = $users->first();
        $otherUsers = $users->slice(1);

        $tournamentsData = [
            [
                'name' => 'Valorant Champions Invitational 2026',
                'slug' => 'valorant-champions-invitational-2026',
                'game_slug' => 'valorant',
                'description' => 'The ultimate 5v5 tactical showdown. 16 elite squads battle through double elimination brackets for glory, VCT circuit points, and the grand championship cup.',
                'banner' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
                'rules' => "• Standard competitive tournament mode, Best-of-3 series.\n• Map pool: Ascent, Bind, Haven, Split, Sunset, Lotus, Abyss.\n• Riot Vanguard anti-cheat strictly mandatory.\n• All players must join the tournament Discord voice room 15 minutes prior to match start.",
                'format' => 'double_elimination',
                'team_mode' => '5v5',
                'team_size' => 5,
                'max_participants' => 16,
                'entry_fee' => 0.00,
                'currency' => 'USD',
                'prize_info' => '$25,000 Total Prize Pool ($15,000 1st, $7,000 2nd, $3,000 3rd)',
                'region' => 'North America',
                'platform_type' => 'pc',
                'status' => 'in_progress',
                'is_featured' => true,
                'is_verified' => true,
                'require_check_in' => true,
                'registration_starts_at' => Carbon::now()->subDays(14),
                'registration_ends_at' => Carbon::now()->subDays(2),
                'starts_at' => Carbon::now()->subDays(1),
                'ends_at' => Carbon::now()->addDays(2),
            ],
            [
                'name' => 'CS2 Premier Major: Global Offensive',
                'slug' => 'cs2-premier-major-global-offensive',
                'game_slug' => 'counter-strike-2',
                'description' => 'High-stakes Counter-Strike 2 tournament featuring MR12 regulation overtime, 128-tick sub-tick servers, and live caster commentary.',
                'banner' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
                'rules' => "• MR12 rules with Max 1 tactical timeout per half.\n• Overtime: MR3 with $10,000 starting cash.\n• Active duty maps: Mirage, Inferno, Nuke, Dust II, Ancient, Anubis, Vertigo.\n• VAC & server-side demo recording enforced.",
                'format' => 'single_elimination',
                'team_mode' => '5v5',
                'team_size' => 5,
                'max_participants' => 32,
                'entry_fee' => 20.00,
                'currency' => 'USD',
                'prize_info' => '$50,000 Championship Pool ($30k Winner takes the lion share)',
                'region' => 'Europe',
                'platform_type' => 'pc',
                'status' => 'registration',
                'is_featured' => true,
                'is_verified' => true,
                'require_check_in' => true,
                'registration_starts_at' => Carbon::now()->subDays(5),
                'registration_ends_at' => Carbon::now()->addDays(3),
                'starts_at' => Carbon::now()->addDays(4),
                'ends_at' => Carbon::now()->addDays(7),
            ],
            [
                'name' => 'Apex Legends Predator Trios Championship',
                'slug' => 'apex-legends-predator-trios-championship',
                'game_slug' => 'apex-legends',
                'description' => '20 trios drop onto Storm Point and World\'s Edge. Match point format: race to 50 points, then secure a Champions victory to claim the throne.',
                'banner' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
                'rules' => "• 6 matches total across Storm Point and World's Edge.\n• Standard ALGS scoring system (1 point per kill, placement points 12/9/7/5/4).\n• Crossplay enabled, PC & Console lobbies synchronized.",
                'format' => 'battle_royale',
                'team_mode' => '3v3',
                'team_size' => 3,
                'max_participants' => 20,
                'entry_fee' => 0.00,
                'currency' => 'USD',
                'prize_info' => '$15,000 + Apex Coins & Custom Predator Badges',
                'region' => 'Global',
                'platform_type' => 'cross_platform',
                'status' => 'registration',
                'is_featured' => false,
                'is_verified' => true,
                'require_check_in' => true,
                'registration_starts_at' => Carbon::now()->subDays(2),
                'registration_ends_at' => Carbon::now()->addDays(5),
                'starts_at' => Carbon::now()->addDays(6),
                'ends_at' => Carbon::now()->addDays(8),
            ],
            [
                'name' => 'Helldivers 2: Galactic Defense Blitz',
                'slug' => 'helldivers-2-galactic-defense-blitz',
                'game_slug' => 'helldivers-2',
                'description' => 'Speedrun Super Helldive (Diff 10) operations against Automaton and Terminid planet invasions. Highest mission star rating and fastest clear time wins.',
                'banner' => 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
                'rules' => "• Helldive difficulty (Diff 9 or 10 required).\n• 4-player squad must extract all members with Super Samples intact.\n• Official unedited Twitch VOD / YouTube recording required for submission.",
                'format' => 'league',
                'team_mode' => '4v4',
                'team_size' => 4,
                'max_participants' => 24,
                'entry_fee' => 0.00,
                'currency' => 'USD',
                'prize_info' => '$12,000 + Super Earth Medals and Merch bundle',
                'region' => 'Global',
                'platform_type' => 'cross_platform',
                'status' => 'registration',
                'is_featured' => false,
                'is_verified' => true,
                'require_check_in' => false,
                'registration_starts_at' => Carbon::now()->subDays(3),
                'registration_ends_at' => Carbon::now()->addDays(7),
                'starts_at' => Carbon::now()->addDays(8),
                'ends_at' => Carbon::now()->addDays(12),
            ],
            [
                'name' => 'Elden Ring Colosseum Duels: Shadow of Erdtree',
                'slug' => 'elden-ring-colosseum-duels-shadow-of-erdtree',
                'game_slug' => 'elden-ring',
                'description' => 'Level 125 Meta Duel tournament in Leyndell Colosseum. Pure skill, poise management, and frame-perfect spacing.',
                'banner' => 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&auto=format&fit=crop&q=80',
                'rules' => "• Rune Level 125, Max weapon upgrade +25 / +10.\n• No Crimson Flasks, No BHS spam, No Rune Arcs.\n• Best 2 out of 3 rounds per match.",
                'format' => 'single_elimination',
                'team_mode' => 'solo',
                'team_size' => 1,
                'max_participants' => 16,
                'entry_fee' => 0.00,
                'currency' => 'USD',
                'prize_info' => '$5,000 USD Prize Pool + Custom Physical Malenia Blade Trophy',
                'region' => 'Global',
                'platform_type' => 'pc',
                'status' => 'completed',
                'is_featured' => false,
                'is_verified' => true,
                'require_check_in' => false,
                'registration_starts_at' => Carbon::now()->subDays(30),
                'registration_ends_at' => Carbon::now()->subDays(20),
                'starts_at' => Carbon::now()->subDays(18),
                'ends_at' => Carbon::now()->subDays(15),
            ],
            [
                'name' => 'League of Legends: Summoner Rift Clash',
                'slug' => 'league-of-legends-summoner-rift-clash',
                'game_slug' => 'league-of-legends',
                'description' => '8-team single elimination clash bracket. Full tournament draft, fear-less draft in tiebreaker, with MVP awards.',
                'banner' => 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
                'rules' => "• Tournament draft 5v5 Summoner's Rift.\n• Finals Bo3; Quarter & Semis Bo1.\n• Standard Riot competitive ruleset.",
                'format' => 'single_elimination',
                'team_mode' => '5v5',
                'team_size' => 5,
                'max_participants' => 8,
                'entry_fee' => 10.00,
                'currency' => 'USD',
                'prize_info' => '$8,000 Prize Pool + Riot Points for top 4 teams',
                'region' => 'North America',
                'platform_type' => 'pc',
                'status' => 'in_progress',
                'is_featured' => false,
                'is_verified' => true,
                'require_check_in' => true,
                'registration_starts_at' => Carbon::now()->subDays(7),
                'registration_ends_at' => Carbon::now()->subDays(1),
                'starts_at' => Carbon::now()->subHours(12),
                'ends_at' => Carbon::now()->addHours(24),
            ],
            [
                'name' => 'Call of Duty: Warzone Resurgence Showdown',
                'slug' => 'call-of-duty-warzone-resurgence-showdown',
                'game_slug' => 'call-of-duty-warzone',
                'description' => 'Fast-paced Rebirth Island kill-race tournament. Duo squads racing for the highest total squad kills across 4 queued drops.',
                'banner' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
                'rules' => "• Rebirth Island Duos.\n• 1 kill = 1 point, Victory Royale = +10 bonus points.\n• 3-hour kill race window.",
                'format' => 'battle_royale',
                'team_mode' => '2v2',
                'team_size' => 2,
                'max_participants' => 30,
                'entry_fee' => 0.00,
                'currency' => 'USD',
                'prize_info' => '$10,000 Cash Prize + COD Points',
                'region' => 'North America',
                'platform_type' => 'cross_platform',
                'status' => 'registration',
                'is_featured' => false,
                'is_verified' => true,
                'require_check_in' => false,
                'registration_starts_at' => Carbon::now()->subDays(1),
                'registration_ends_at' => Carbon::now()->addDays(4),
                'starts_at' => Carbon::now()->addDays(5),
                'ends_at' => Carbon::now()->addDays(6),
            ],
        ];

        foreach ($tournamentsData as $data) {
            $gameSlug = $data['game_slug'];
            unset($data['game_slug']);

            $game = Game::where('slug', $gameSlug)->orWhere('slug', 'like', "{$gameSlug}%")->first()
                ?? Game::first();

            $tournament = Tournament::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'user_id' => $hostUser->id,
                    'game_id' => $game ? $game->id : 1,
                ])
            );

            // Seed participants
            $tournament->registrations()->delete();
            $tournament->matches()->delete();

            // Pick 4 to 8 users to register
            $registeredUsers = $users->random(min($users->count(), rand(4, 8)));
            $registrations = [];
            $seedIndex = 1;

            foreach ($registeredUsers as $regUser) {
                $status = ($tournament->status === 'completed') ? 'checked_in' : (($tournament->status === 'in_progress') ? 'checked_in' : 'approved');
                $reg = TournamentRegistration::create([
                    'tournament_id' => $tournament->id,
                    'user_id' => $regUser->id,
                    'status' => $status,
                    'seed' => $seedIndex++,
                    'registered_at' => Carbon::now()->subDays(rand(1, 5)),
                    'checked_in_at' => ($status === 'checked_in') ? Carbon::now()->subHours(rand(1, 10)) : null,
                ]);
                $registrations[] = $reg;
            }

            $tournament->update(['registered_count' => count($registrations)]);

            // If in_progress or completed, generate rich bracket matches
            if (in_array($tournament->status, ['in_progress', 'completed']) && count($registrations) >= 4) {
                $this->seedBracketMatches($tournament, $registrations);
            }
        }
    }

    private function seedBracketMatches(Tournament $tournament, array $registrations): void
    {
        $regCount = count($registrations);
        if ($regCount < 4) {
            return;
        }

        // Quarterfinals (Round 1)
        $m1 = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'round_name' => 'Quarter-Final 1',
            'round_number' => 1,
            'match_number' => 1,
            'participant_a_id' => $registrations[0]->id,
            'participant_b_id' => $registrations[1]->id,
            'winner_id' => $registrations[0]->id,
            'score' => ['team_a' => 2, 'team_b' => 1],
            'status' => 'completed',
            'scheduled_at' => Carbon::now()->subHours(8),
            'completed_at' => Carbon::now()->subHours(7),
        ]);

        $m2 = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'round_name' => 'Quarter-Final 2',
            'round_number' => 1,
            'match_number' => 2,
            'participant_a_id' => $registrations[2]->id,
            'participant_b_id' => $registrations[3]->id,
            'winner_id' => $registrations[2]->id,
            'score' => ['team_a' => 2, 'team_b' => 0],
            'status' => 'completed',
            'scheduled_at' => Carbon::now()->subHours(6),
            'completed_at' => Carbon::now()->subHours(5),
        ]);

        // Semi-Final (Round 2)
        $semiWinner = ($tournament->status === 'completed') ? $registrations[0]->id : null;
        $semiStatus = ($tournament->status === 'completed') ? 'completed' : 'in_progress';

        $m3 = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'round_name' => 'Semi-Final',
            'round_number' => 2,
            'match_number' => 3,
            'participant_a_id' => $registrations[0]->id,
            'participant_b_id' => $registrations[2]->id,
            'winner_id' => $semiWinner,
            'score' => ($tournament->status === 'completed') ? ['team_a' => 2, 'team_b' => 1] : ['team_a' => 1, 'team_b' => 1],
            'status' => $semiStatus,
            'scheduled_at' => Carbon::now()->subHours(4),
            'completed_at' => ($tournament->status === 'completed') ? Carbon::now()->subHours(3) : null,
        ]);

        // Grand Final (Round 3)
        if ($tournament->status === 'completed') {
            TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round_name' => 'Grand Championship Final',
                'round_number' => 3,
                'match_number' => 4,
                'participant_a_id' => $registrations[0]->id,
                'participant_b_id' => $registrations[2]->id,
                'winner_id' => $registrations[0]->id,
                'score' => ['team_a' => 3, 'team_b' => 2],
                'status' => 'completed',
                'scheduled_at' => Carbon::now()->subHours(2),
                'completed_at' => Carbon::now()->subHours(1),
            ]);
        } else {
            TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round_name' => 'Grand Championship Final',
                'round_number' => 3,
                'match_number' => 4,
                'participant_a_id' => $registrations[0]->id,
                'participant_b_id' => null,
                'winner_id' => null,
                'score' => null,
                'status' => 'scheduled',
                'scheduled_at' => Carbon::now()->addHours(3),
            ]);
        }
    }
}
