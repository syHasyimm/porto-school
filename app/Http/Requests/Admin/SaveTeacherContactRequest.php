<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use App\Support\WhatsAppNumber;
use Illuminate\Foundation\Http\FormRequest;

class SaveTeacherContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() instanceof User && $this->user()->isAdmin();
    }

    protected function prepareForValidation(): void
    {
        $phone = $this->input('phone');
        if (is_string($phone)) {
            $this->merge(['phone' => WhatsAppNumber::normalize($phone) ?? $phone]);
        }
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'required_if:notifications_enabled,1,true', 'string', 'max:30', 'regex:/^628[1-9][0-9]{6,10}$/D'],
            'is_active' => ['required', 'boolean'],
            'notifications_enabled' => ['required', 'boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama guru wajib diisi.',
            'phone.required_if' => 'Nomor WhatsApp wajib diisi untuk menerima notifikasi.',
            'phone.regex' => 'Masukkan nomor seluler Indonesia yang valid, misalnya 08123456789.',
        ];
    }
}
