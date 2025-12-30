<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_moves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('quantity', 10, 2);

            $table->foreignId('source_location_id')
                ->constrained('stock_locations');

            $table->foreignId('dest_location_id')
                ->constrained('stock_locations');

            $table->string('reference_type')->nullable(); // garage_job, invoice, purchase
            $table->unsignedBigInteger('reference_id')->nullable();

            $table->string('state')->default('draft');

            // Optional but Odoo-style (future-proof)
            $table->decimal('unit_cost', 10, 2)->nullable();

            $table->timestamps();

            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_moves');
    }
};
