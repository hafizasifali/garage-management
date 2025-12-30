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
        Schema::table('partners', function (Blueprint $table) {
            $table->tinyInteger('is_company')->default(1)->after('name');
            $table->bigInteger('parent_id')->unsigned()->nullable()->after('is_company');
            $table->integer('customer_rank')->default(0)->after('parent_id');
            $table->integer('supplier_rank')->default(0)->after('customer_rank');

            // Optional foreign key for parent_id
            $table->foreign('parent_id')->references('id')->on('partners')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
             $table->dropForeign(['parent_id']);
            $table->dropColumn(['is_company', 'parent_id', 'customer_rank', 'supplier_rank']);
        });
    }
};
