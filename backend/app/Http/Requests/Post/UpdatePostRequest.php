<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content'    => ['sometimes', 'string', 'max:5000'],
            'visibility' => ['sometimes', 'string', 'in:public,friends,private'],
            'is_spoiler' => ['boolean'],
            'feeling'    => ['nullable', 'string', 'max:50'],
        ];
    }
}
