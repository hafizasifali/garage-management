<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'joining_date',
        'birthday',
        'company_id',
        'country_id',
        'user_id',
    ];

    protected $casts = [
        'joining_date' => 'date',
        'birthday'     => 'date',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function garageJobs()
    {
        return $this->belongsToMany(
            GarageJob::class,
            'employee_garage_job'
        )->withTimestamps();
    }
}
