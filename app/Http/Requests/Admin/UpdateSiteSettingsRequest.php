<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UpdateSiteSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User && $user->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'school_name' => ['required', 'string', 'max:255'],
            'school_address' => ['required', 'string', 'max:1000'],
            'school_phone' => ['required', 'string', 'max:30'],
            'school_email' => ['required', 'email:rfc', 'max:255'],
            'school_description' => ['required', 'string', 'max:2000'],
            'school_history' => ['nullable', 'string', 'max:5000'],
            'school_vision' => ['nullable', 'string', 'max:2000'],
            'school_mission' => ['nullable', 'string', 'max:5000'],
            'school_facilities' => ['nullable', 'string', 'max:5000'],
            'school_extracurriculars' => ['nullable', 'string', 'max:5000'],
            'headmaster_name' => ['nullable', 'string', 'max:255'],
            'npsn' => ['nullable', 'string', 'max:30'],
            'facebook_url' => ['nullable', 'url:http,https', 'max:2000'],
            'instagram_url' => ['nullable', 'url:http,https', 'max:2000'],
            'map_embed_url' => ['nullable', 'url:http,https', 'max:2000'],
            'logo' => ['nullable', File::image()->max(2 * 1024)],
        ];
    }
}
