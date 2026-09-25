<?php

namespace App\Http\Requests\Guru;

use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User && $user->isGuru();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $profile = $this->user()?->teacherProfile;

        return [
            'nip' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('teacher_profiles', 'nip')->ignore(
                    $profile instanceof TeacherProfile ? $profile->id : null,
                ),
            ],
            'photo' => ['nullable', File::image()->max(2 * 1024)],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'subject' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
