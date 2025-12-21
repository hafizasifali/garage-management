<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UomCategory extends Model
{
    protected $fillable = [
        'name',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function uoms()
    {
        return $this->hasMany(Uom::class, 'category_id');
    }
}
