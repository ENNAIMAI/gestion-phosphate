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
        // 1. sites
        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            $table->index('code');
        });

        // 2. locations
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->onDelete('cascade');
            $table->string('name');
            $table->string('zone')->nullable();
            $table->decimal('capacite_max', 15, 2); // capacity in tons
            $table->softDeletes();
            $table->timestamps();

            $table->index('site_id');
        });

        // 3. phosphate_types
        Schema::create('phosphate_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->decimal('densite', 5, 2)->nullable();
            $table->text('description')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('code');
        });

        // 4. stocks
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained('locations')->onDelete('cascade');
            $table->foreignId('phosphate_type_id')->constrained('phosphate_types')->onDelete('cascade');
            $table->decimal('quantite', 15, 2)->default(0.00); // stock in tons
            $table->string('unite', 20)->default('UL');
            $table->string('bpl_class', 20)->default('SHT');
            $table->string('quality_index', 20)->default('NONE');
            $table->string('niveau', 20)->default('SA2');
            $table->string('zone', 20)->default('L30');
            $table->string('carreau', 20)->default('BO');
            $table->string('traitement_1', 20)->default('B');
            $table->string('traitement_2', 20)->default('K');
            $table->timestamp('derniere_mise_a_jour')->useCurrent();
            $table->timestamps();

            $table->unique(['location_id', 'phosphate_type_id', 'unite', 'bpl_class', 'quality_index', 'niveau', 'zone', 'carreau', 'traitement_1', 'traitement_2'], 'stocks_quality_unique');
            $table->index('location_id');
            $table->index('phosphate_type_id');
        });

        // 5. movement_types
        Schema::create('movement_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('direction', ['IN', 'OUT']);
            $table->timestamps();

            $table->index('code');
        });

        // 6. stock_movements
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_id')->constrained('stocks')->onDelete('cascade');
            $table->foreignId('movement_type_id')->constrained('movement_types');
            $table->decimal('quantite', 15, 2);
            $table->timestamp('date_mouvement')->useCurrent();
            $table->foreignId('user_id')->constrained('users');
            $table->text('description')->nullable();
            $table->string('moyen_transport', 30)->nullable(); // Camion, Train, Convoyeur
            $table->timestamps();

            $table->index('stock_id');
            $table->index('movement_type_id');
            $table->index('user_id');
            $table->index('date_mouvement');
        });

        // 7. alert_rules
        Schema::create('alert_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('phosphate_type_id')->constrained('phosphate_types')->onDelete('cascade');
            $table->decimal('seuil_min', 15, 2)->nullable();
            $table->decimal('seuil_max', 15, 2)->nullable();
            $table->boolean('active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index('phosphate_type_id');
        });

        // 8. alerts
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alert_rule_id')->constrained('alert_rules')->onDelete('cascade');
            $table->foreignId('stock_id')->constrained('stocks')->onDelete('cascade');
            $table->string('type_alerte'); // MIN_SEUIL, MAX_SEUIL
            $table->text('message');
            $table->enum('statut', ['NEW', 'RESOLVED'])->default('NEW');
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamps();

            $table->index('alert_rule_id');
            $table->index('stock_id');
            $table->index('statut');
        });

        // 9. demand_predictions
        Schema::create('demand_predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phosphate_type_id')->constrained('phosphate_types')->onDelete('cascade');
            $table->date('date_prediction');
            $table->decimal('quantite_predite', 15, 2);
            $table->decimal('score_confiance', 5, 2); // 0.00 to 100.00
            $table->json('metadonnees')->nullable();
            $table->timestamps();

            $table->index('phosphate_type_id');
            $table->index('date_prediction');
        });

        // 10. documents
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->string('chemin_fichier');
            $table->string('type_document'); // Bon de livraison, Facture, Rapport, etc.
            $table->foreignId('stock_movement_id')->nullable()->constrained('stock_movements')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->softDeletes();
            $table->timestamps();

            $table->index('stock_movement_id');
            $table->index('user_id');
        });

        // 11. audit_logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action'); // create, update, delete
            $table->string('auditable_type'); // Model Class
            $table->unsignedBigInteger('auditable_id'); // Model ID
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index(['auditable_type', 'auditable_id']);
        });

        // 12. chatbot_conversations
        Schema::create('chatbot_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title')->default('Nouvelle discussion');
            $table->softDeletes();
            $table->timestamps();

            $table->index('user_id');
        });

        // 13. chatbot_messages
        Schema::create('chatbot_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chatbot_conversation_id')->constrained('chatbot_conversations')->onDelete('cascade');
            $table->enum('sender', ['user', 'bot']);
            $table->text('message');
            $table->timestamps();

            $table->index('chatbot_conversation_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chatbot_messages');
        Schema::dropIfExists('chatbot_conversations');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('demand_predictions');
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('alert_rules');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('movement_types');
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('phosphate_types');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('sites');
    }
};
