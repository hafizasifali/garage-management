<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Country extends Model
{
    use HasFactory;

    protected $table = 'countries';

    protected $fillable = [
        'name',
        'code',
        'active',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function companies()
    {
        return $this->hasMany(Company::class, 'country_id');
    }
}
