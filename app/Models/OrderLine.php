<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderLine extends Model
{
    use HasFactory;

    protected $table = 'order_lines';

    protected $fillable = [
        'order_id',
        'employee_id',
        'product_id',
        'quantity',
        'unit_price',
        'tax',
        'discount',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function employee(){
        return $this->belongsTo(Employee::class);
    }

    public function scopeParts($q)
    {
        return $q->whereHas('product', fn ($p) => $p->where('type', 'product'));
    }

    public function scopeLabour($q)
    {
        return $q->whereHas('product', fn ($p) => $p->where('type', 'service'));
    }

}
