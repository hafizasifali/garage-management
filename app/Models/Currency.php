<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Currency extends Model
{
    use HasFactory;

    protected $table = 'currencies';

    protected $fillable = [
        'name',
        'symbol',
        'rate',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function companies()
    {
        return $this->hasMany(Company::class, 'currency_id');
    }
}
