<?php

namespace App\Models;

use App\Enums\ComplaintCategory;
use App\Enums\ComplaintStatus;
use Database\Factories\ComplaintFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['reference_number', 'reporter_name', 'email', 'phone', 'student_name', 'student_class', 'category', 'body', 'attachment_path', 'status'])]
class Complaint extends Model
{
    /** @use HasFactory<ComplaintFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category' => ComplaintCategory::class,
            'status' => ComplaintStatus::class,
        ];
    }

    /**
     * @return HasMany<ComplaintResponse, $this>
     */
    public function responses(): HasMany
    {
        return $this->hasMany(ComplaintResponse::class);
    }
}
