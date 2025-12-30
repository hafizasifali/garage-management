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
    ];

    // Accessor for dropdown display
    public function getDisplayNameAttribute()
    {
        return trim(($this->license_plate ? $this->license_plate . ' - ' : '') 
                    . $this->model 
                    . ($this->year ? ' (' . $this->year . ')' : ''));
    }

    public static function fields(): array
    {
        return [
            'partner_id' => [
                'type' => 'many2one',
                'label' => 'Partner',
                'relation' => 'partners',
                'required' => true,
            ],
            'license_plate' => [
                'type' => 'char',
                'label' => 'License Plate',
                'required' => true,
            ],
            'model' => [
                'type' => 'char',
                'label' => 'Model',
                'required' => true,
            ],
            'year' => [
                'type' => 'number',
                'label' => 'Year',
            ],
        ];
    }

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
