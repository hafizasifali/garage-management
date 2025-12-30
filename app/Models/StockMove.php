<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockMove extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'source_location_id',
        'dest_location_id',
        'reference_type',
        'reference_id',
        'state',
        'unit_cost',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function sourceLocation()
    {
        return $this->belongsTo(StockLocation::class, 'source_location_id');
    }

    public function destLocation()
    {
        return $this->belongsTo(StockLocation::class, 'dest_location_id');
    }

    /* ==========================
     | Scopes
     ========================== */

    public function scopeDone($query)
    {
        return $query->where('state', 'done');
    }
}
