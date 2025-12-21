<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Uom extends Model
{
    use HasFactory;

    protected $table = 'uoms';

    protected $fillable = [
        'name',
        'category_id',
        'factor',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function category()
    {
        return $this->belongsTo(UomCategory::class, 'category_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'uom_id');
    }
}
