<?php

namespace App\Models;

use Database\Factories\ComplaintResponseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $complaint_id
 * @property int|null $user_id
 * @property string $response
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['complaint_id', 'user_id', 'response'])]
class ComplaintResponse extends Model
{
    /** @use HasFactory<ComplaintResponseFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Complaint, $this>
     */
    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function responder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
