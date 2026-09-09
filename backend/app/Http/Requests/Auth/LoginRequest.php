<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('login') && $this->has('email')) {
            $this->merge([
                'login' => $this->input('email'),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'login'    => ['required', 'string'],          // email or username
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
            'device'   => ['nullable', 'string', 'max:100'],
        ];
    }
}
