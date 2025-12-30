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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            // Supplier (partner with supplier_rank > 0)
            $table->foreignId('partner_id')
                ->constrained('partners')
                ->cascadeOnDelete();

            $table->date('order_date');

            // draft → confirmed → received → cancelled
            $table->string('state')->default('draft');

            $table->decimal('total_amount', 10, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
