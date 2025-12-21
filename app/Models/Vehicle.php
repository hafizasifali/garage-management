<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vehicle extends Model
{
    use HasFactory;

    protected $table = 'vehicles';

    protected $fillable = [
        'partner_id',
        'license_plate',
        'model',
        'year',
        'active',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function garageJobs()
    {
        return $this->hasMany(GarageJob::class);
    }
}
