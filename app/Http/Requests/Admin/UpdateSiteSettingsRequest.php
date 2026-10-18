<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UpdateSiteSettingsRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->boolean('history_editor') && ! $this->has('history_entries')) {
            $this->merge(['history_entries' => []]);
        }
    }

    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User && $user->isAdmin();
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
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
            'headmaster_message' => ['nullable', 'string', 'max:5000'],
            'registration_url' => ['nullable', 'url:http,https', 'max:2000'],
            'alumni_count' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'active_students_count' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'teacher_staff_count' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'accreditation' => ['nullable', 'string', 'max:100'],
            'npsn' => ['nullable', 'string', 'max:30'],
            'facebook_url' => ['nullable', 'url:http,https', 'max:2000'],
            'instagram_url' => ['nullable', 'url:http,https', 'max:2000'],
            'map_embed_url' => ['nullable', 'url:http,https', 'max:2000'],
            'logo' => ['nullable', File::image()->max(2 * 1024)],
            'hero_image' => ['nullable', File::image()->max(4 * 1024)],
            'headmaster_photo' => ['nullable', File::image()->max(4 * 1024)],
            'profile_image' => ['nullable', File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max(4 * 1024)],
            'remove_profile_image' => ['sometimes', 'boolean'],
            'history_editor' => ['sometimes', 'boolean'],
            'history_entries' => ['exclude_unless:history_editor,1', 'present', 'array', 'max:50'],
            'history_entries.*' => ['array:id,period,title,description,photo,is_published,remove_photo'],
            'history_entries.*.id' => ['nullable', 'integer', 'distinct', 'exists:school_histories,id'],
            'history_entries.*.period' => ['required', 'string', 'max:80'],
            'history_entries.*.title' => ['required', 'string', 'max:160'],
            'history_entries.*.description' => ['required', 'string', 'max:5000'],
            'history_entries.*.is_published' => ['required', 'boolean'],
            'history_entries.*.remove_photo' => ['sometimes', 'boolean'],
            'history_entries.*.photo' => ['nullable', File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max(4 * 1024)],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'history_entries.max' => 'Maksimal 50 cerita dalam storyline sejarah.',
            'history_entries.*.period.required' => 'Tahun / periode cerita wajib diisi.',
            'history_entries.*.period.max' => 'Tahun / periode maksimal 80 karakter.',
            'history_entries.*.title.required' => 'Judul cerita wajib diisi.',
            'history_entries.*.title.max' => 'Judul cerita maksimal 160 karakter.',
            'history_entries.*.description.required' => 'Isi cerita wajib diisi.',
            'history_entries.*.description.max' => 'Isi cerita maksimal 5.000 karakter.',
            'history_entries.*.id.exists' => 'Cerita ini sudah tidak tersedia. Muat ulang pengaturan.',
            'history_entries.*.id.distinct' => 'Cerita yang sama tidak boleh ditambahkan dua kali.',
            'history_entries.*.photo.image' => 'Foto cerita harus berupa gambar.',
            'history_entries.*.photo.mimes' => 'Gunakan foto JPG, PNG, atau WebP.',
            'history_entries.*.photo.max' => 'Foto cerita maksimal 4 MB.',
            'profile_image.image' => 'Foto halaman profil harus berupa gambar.',
            'profile_image.mimes' => 'Gunakan foto JPG, PNG, atau WebP.',
            'profile_image.max' => 'Foto halaman profil maksimal 4 MB.',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'history_entries.*.period' => 'tahun / periode cerita',
            'history_entries.*.title' => 'judul cerita',
            'history_entries.*.description' => 'isi cerita',
            'history_entries.*.photo' => 'foto cerita',
            'history_entries.*.is_published' => 'status cerita',
            'profile_image' => 'foto halaman profil',
        ];
    }
}
