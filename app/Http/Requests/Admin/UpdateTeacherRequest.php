<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;
use Illuminate\Validation\Rules\Password;

class UpdateTeacherRequest extends FormRequest
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
        $teacher = $this->route('teacher');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($teacher instanceof User ? $teacher->id : null),
            ],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'nip' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('teacher_profiles', 'nip')->ignore(
                    $teacher instanceof User ? $teacher->teacherProfile?->id : null,
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
