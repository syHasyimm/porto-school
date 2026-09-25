<?php

namespace App\Models;

use Database\Factories\TeacherProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $nip
 * @property string|null $photo_path
 * @property string|null $phone
 * @property string|null $address
 * @property Carbon|null $birth_date
 * @property string|null $subject
 * @property string|null $bio
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'nip', 'photo_path', 'phone', 'address', 'birth_date', 'subject', 'bio'])]
class TeacherProfile extends Model
{
    /** @use HasFactory<TeacherProfileFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
