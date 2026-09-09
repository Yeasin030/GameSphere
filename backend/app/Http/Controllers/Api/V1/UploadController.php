<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload an image file or return upload URL.
     */
    public function image(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:10240', // 10MB max
            'folder' => 'nullable|string|in:avatars,posts,banners,games',
        ]);

        $folder = $request->input('folder', 'uploads');
        $path = $request->file('file')->store("public/{$folder}");
        $url = asset(Storage::url($path));

        return response()->json([
            'message' => 'Image uploaded successfully',
            'url' => $url,
            'path' => $path,
        ]);
    }

    /**
     * Upload a video file.
     */
    public function video(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|mimes:mp4,mov,avi,webm|max:102400', // 100MB max
        ]);

        $path = $request->file('file')->store('public/videos');
        $url = asset(Storage::url($path));

        return response()->json([
            'message' => 'Video uploaded successfully',
            'url' => $url,
            'path' => $path,
        ]);
    }

    /**
     * Upload an audio file.
     */
    public function audio(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|mimes:mp3,wav,ogg|max:20480', // 20MB max
        ]);

        $path = $request->file('file')->store('public/audio');
        $url = asset(Storage::url($path));

        return response()->json([
            'message' => 'Audio uploaded successfully',
            'url' => $url,
            'path' => $path,
        ]);
    }
}
