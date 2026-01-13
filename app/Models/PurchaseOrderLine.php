<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseOrderLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'quantity',
        'unit_price',
        'tax',
        'discount',
        'subtotal',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function order()
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /* ==========================
     | Model Events
     ========================== */

    protected static function booted()
    {
        static::saving(function ($line) {
            $line->subtotal = $line->quantity * $line->unit_price;
        });

        static::saved(function ($line) {
            $line->order->recalculateTotal();
        });

        static::deleted(function ($line) {
            $line->order->recalculateTotal();
        });
    }
}
