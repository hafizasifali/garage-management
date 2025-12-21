<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Invoice extends Model
{
    use HasFactory;

    protected $table = 'invoices';

    protected $fillable = [
        'partner_id',
        'invoice_date',
        'due_date',
        'total_tax',
        'total_discount',
        'total_amount',
        'state', // draft, posted, paid
    ];

    protected $casts = [
        'invoice_date'  => 'date',
        'due_date'      => 'date',
        'total_tax'     => 'decimal:2',
        'total_discount' => 'decimal:2',
        'total_amount'  => 'decimal:2',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function lines()
    {
        return $this->hasMany(InvoiceLine::class);
    }

    public function garageJobs()
    {
        return $this->belongsToMany(GarageJob::class, 'garage_job_invoice')->withTimestamps();
    }
}
