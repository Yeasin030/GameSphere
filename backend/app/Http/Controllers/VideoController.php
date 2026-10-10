<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VideoController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'video' => 'required|mimes:mp4,mov,avi|max:500000',
        ]);

        $file = $request->file('video');
        $path = $file->store('videos', 's3');

        $video = Video::create([
            'user_id' => $request->user()->id,
            'url' => Storage::disk('s3')->url($path),
            's3_path' => $path,
            'status' => 'uploaded'
        ]);

        return response()->json(['video' => $video], 201);
    }

    public function show(Video $video)
    {
        return response()->json([
            'video_url' => env('CDN_URL', Storage::disk('s3')->url($video->s3_path))
        ]);
    }
}
