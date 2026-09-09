<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;

class CallController extends Controller
{
    /**
     * Generate a LiveKit token for the given room.
     */
    public function generateToken(Request $request)
    {
        $request->validate([
            'room_id' => 'required|string|max:255',
        ]);

        $apiKey = env('LIVEKIT_API_KEY', 'devkey');
        $apiSecret = env('LIVEKIT_API_SECRET', 'secret');
        $user = $request->user();

        // LiveKit JWT payload structure
        $payload = [
            'iss' => $apiKey,
            'sub' => (string) $user->id,
            'name' => $user->name,
            'video' => [
                'room' => $request->room_id,
                'roomJoin' => true,
            ],
            'iat' => time(),
            'exp' => time() + 3600, // 1 hour token
            'nbf' => time()
        ];

        $token = JWT::encode($payload, $apiSecret, 'HS256');

        return response()->json([
            'token' => $token,
            'url' => env('LIVEKIT_URL', 'ws://localhost:7880'),
        ]);
    }
}
