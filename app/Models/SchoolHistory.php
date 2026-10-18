<?php

namespace App\Models;

use Database\Factories\SchoolHistoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $period
 * @property string $title
 * @property string $description
 * @property string|null $photo_path
 * @property bool $is_published
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['period', 'title', 'description', 'photo_path', 'is_published', 'sort_order'])]
class SchoolHistory extends Model
{
    /** @use HasFactory<SchoolHistoryFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'sort_order' => 'integer'];
    }
}
