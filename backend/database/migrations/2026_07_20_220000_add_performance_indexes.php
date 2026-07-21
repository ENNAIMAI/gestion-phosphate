<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alerts', function (Blueprint $table) {
            $table->index(['statut', 'date_creation'], 'alerts_status_created_at_index');
            $table->index(['stock_id', 'alert_rule_id', 'statut'], 'alerts_stock_rule_status_index');
        });

        Schema::table('alert_rules', function (Blueprint $table) {
            $table->index(['phosphate_type_id', 'active'], 'alert_rules_type_active_index');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index('created_at', 'audit_logs_created_at_index');
            $table->index(['auditable_type', 'created_at'], 'audit_logs_type_created_at_index');
        });

        Schema::table('demand_predictions', function (Blueprint $table) {
            $table->index(['phosphate_type_id', 'date_prediction'], 'predictions_type_date_index');
        });
    }

    public function down(): void
    {
        Schema::table('demand_predictions', function (Blueprint $table) {
            $table->dropIndex('predictions_type_date_index');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('audit_logs_type_created_at_index');
            $table->dropIndex('audit_logs_created_at_index');
        });

        Schema::table('alert_rules', function (Blueprint $table) {
            $table->dropIndex('alert_rules_type_active_index');
        });

        Schema::table('alerts', function (Blueprint $table) {
            $table->dropIndex('alerts_stock_rule_status_index');
            $table->dropIndex('alerts_status_created_at_index');
        });
    }
};
