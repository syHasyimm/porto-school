<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use App\Support\WhatsAppNumber;
use Illuminate\Foundation\Http\FormRequest;

class UpdateWhatsAppSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() instanceof User && $this->user()->isAdmin();
    }

    protected function prepareForValidation(): void
    {
        $phone = $this->input('admin_phone');
        if (is_string($phone)) {
            $this->merge(['admin_phone' => WhatsAppNumber::normalize($phone) ?? $phone]);
        }
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        return [
            'token' => ['nullable', 'string', 'max:1000', 'regex:/^[^\s,]+$/D'],
            'reminders_enabled' => ['required', 'boolean'],
            'send_time' => ['required', 'date_format:H:i'],
            'timezone' => ['required', 'timezone'],
            'admin_phone' => ['nullable', 'string', 'max:30', 'regex:/^628[1-9][0-9]{6,10}$/D'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'token.regex' => 'Masukkan satu token Fonnte tanpa spasi atau koma.',
            'send_time.date_format' => 'Jam kirim harus menggunakan format HH:MM.',
            'timezone.timezone' => 'Pilih zona waktu yang valid.',
            'admin_phone.regex' => 'Masukkan nomor WhatsApp admin yang valid.',
        ];
    }
}
