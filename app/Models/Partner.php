<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Partner extends Model
{
    use HasFactory;

    protected $table = 'partners';

    protected $fillable = [
        'name',
        'type',
        'email',
        'phone',
        'address',
        'active',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function garageJobs()
    {
        return $this->hasMany(GarageJob::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
