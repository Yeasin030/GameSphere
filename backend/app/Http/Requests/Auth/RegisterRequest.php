<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username'     => ['required', 'string', 'min:3', 'max:30', 'unique:users,username', 'regex:/^[a-zA-Z0-9_]+$/'],
            'email'        => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'password'     => ['required', 'confirmed', Password::min(8)->letters()->numbers()->symbols()],
            'display_name' => ['nullable', 'string', 'max:50'],
            'country'      => ['nullable', 'string', 'size:2'],
            'locale'       => ['nullable', 'string', 'max:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.regex'  => 'Username may only contain letters, numbers, and underscores.',
            'username.unique' => 'This username is already taken.',
            'email.unique'    => 'An account with this email already exists.',
        ];
    }
}
