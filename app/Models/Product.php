<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'name',
        'category_id',
        'uom_id',
        'cost_price',
        'sale_price',
        'type',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function uom()
    {
        return $this->belongsTo(Uom::class, 'uom_id');
    }

    public function garageJobLines()
    {
        return $this->hasMany(GarageJobLine::class);
    }

    public function invoiceLines()
    {
        return $this->hasMany(InvoiceLine::class);
    }
}
