<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerGroup extends Model
{
        protected $fillable = ['name', 'active'];
 
    protected $casts = [
        'active' => 'boolean',
    ];
 
    // All store customers belonging to this group
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
 
    // Portal users who have access to this group
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

}
