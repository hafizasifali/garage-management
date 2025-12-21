<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments';

    protected $fillable = [
        'invoice_id',
        'payment_date',
        'amount',
        'payment_method',
        'reference',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount'       => 'decimal:2',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
