<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatbotMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => 'required|string|max:5000',
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Le message ne peut pas être vide.',
            'message.max' => 'La longueur maximale du message est de 5000 caractères.',
        ];
    }
}
