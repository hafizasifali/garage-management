<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InvoiceLine extends Model
{
    use HasFactory;

    protected $table = 'invoice_lines';

    protected $fillable = [
        'invoice_id',
        'product_id',
        'quantity',
        'unit_price',
        'tax',
        'discount',
        'subtotal',
    ];

    protected $casts = [
        'quantity'  => 'decimal:2',
        'unit_price' => 'decimal:2',
        'tax'       => 'decimal:2',
        'discount'  => 'decimal:2',
        'subtotal'  => 'decimal:2',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
