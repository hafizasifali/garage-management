<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_group_user', function (Blueprint $table) {
            $table->foreignId('customer_group_id')
                  ->constrained('customer_groups')
                  ->cascadeOnDelete();
 
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
 
            $table->primary(['customer_group_id', 'user_id']);
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('customer_group_user');
    }

};
