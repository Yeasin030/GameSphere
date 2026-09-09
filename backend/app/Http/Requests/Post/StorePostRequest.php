<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'       => ['nullable', 'string'],
            'content'    => ['nullable', 'string', 'max:5000'],
            'visibility' => ['nullable', 'string'],
            'privacy'    => ['nullable', 'string'],
            'image'      => ['nullable'],
            'media'      => ['nullable'],
        ];
    }
}
