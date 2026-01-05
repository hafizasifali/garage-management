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
        'active',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'active'     => 'boolean',
    ];

    /* ==========================
     | Display helpers
     ========================== */

    public function getDisplayNameAttribute()
    {
        return "{$this->name}";
    }

    /* ==========================
     | Dynamic Form Fields
     ========================== */

    public static function fields(): array
    {
        return [
            'name' => [
                'type' => 'char',
                'label' => 'Product Name',
                'required' => true,
            ],
            'category_id' => [
                'type' => 'many2one',
                'label' => 'Category',
                'relation' => 'product_categories',
                'required' => true,
            ],
            'uom_id' => [
                'type' => 'many2one',
                'label' => 'Unit of Measure',
                'relation' => 'uoms',
                'required' => true,
            ],
            'type' => [
                'type' => 'many2one',
                'label' => 'Product Type',
                'options' => [
                    ['value' => 'product', 'label' => 'Storable Product'],
                    ['value' => 'service', 'label' => 'Service'],
                ],
                'required' => true,
            ],
            'cost_price' => [
                'type' => 'char',
                'label' => 'Cost Price',
            ],
            'sale_price' => [
                'type' => 'char',
                'label' => 'Sale Price',
                'required' => true,
            ],
        ];
    }

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
