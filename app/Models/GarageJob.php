<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GarageJob extends Model
{
    use HasFactory;

    protected $table = 'garage_jobs';

    protected $fillable = [
        'partner_id',
        'vehicle_id',
        'job_date',
        'state', // pending, in_progress, completed
        'total_parts_cost',
        'total_labor_cost',
        'total_tax',
        'total_discount',
        'total_amount',
    ];

    protected $casts = [
        'job_date' => 'date',
        'total_parts_cost' => 'decimal:2',
        'total_labor_cost' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public static function fields(): array
    {
        return [
        'partner_id' => ['label' => 'Customer', 'type' => 'many2one', 'relation' => 'partners'],
        'vehicle_id' => ['label' => 'Vehicle', 'type' => 'many2one', 'relation' => 'vehicles'],
        'job_date' => ['label' => 'Job Date', 'type' => 'date'],
        'employee_ids' => ['label' => 'Mechanics', 'type' => 'many2many', 'relation' => 'employees'],
        'state' => ['label' => 'State', 'type' => 'char'],
    ];
    }

    /* ==========================
     | Relationships
     ========================== */

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'employee_garage_job')->withTimestamps();
    }

    public function lines()
    {
        return $this->hasMany(GarageJobLine::class);
    }

    public function invoices()
    {
        return $this->belongsToMany(Invoice::class, 'garage_job_invoice')->withTimestamps();
    }
}
