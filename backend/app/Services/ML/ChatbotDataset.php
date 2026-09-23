<?php

namespace App\Services\ML;

class ChatbotDataset
{
    public static function getTrainingData(): array
    {
        return [
            // GREETING
            ['text' => 'bonjour', 'intent' => 'greeting'],
            ['text' => 'bonsoir', 'intent' => 'greeting'],
            ['text' => 'salut', 'intent' => 'greeting'],
            ['text' => 'hello', 'intent' => 'greeting'],
            ['text' => 'hi', 'intent' => 'greeting'],
            ['text' => 'coucou', 'intent' => 'greeting'],
            ['text' => 'cc', 'intent' => 'greeting'],
            ['text' => 'salam', 'intent' => 'greeting'],
            ['text' => 'slm', 'intent' => 'greeting'],
            ['text' => 'salam alikoum', 'intent' => 'greeting'],
            
            // CASUAL
            ['text' => 'ca va', 'intent' => 'casual'],
            ['text' => 'cv', 'intent' => 'casual'],
            ['text' => 'kif dayr', 'intent' => 'casual'],
            ['text' => 'kifach nta', 'intent' => 'casual'],
            ['text' => 'labas', 'intent' => 'casual'],
            ['text' => 'labass', 'intent' => 'casual'],
            ['text' => 'hamdoulah', 'intent' => 'casual'],
            
            // THANKS
            ['text' => 'merci', 'intent' => 'thanks'],
            ['text' => 'merci beaucoup', 'intent' => 'thanks'],
            ['text' => 'thanks', 'intent' => 'thanks'],
            ['text' => 'thx', 'intent' => 'thanks'],
            ['text' => 'barak allah fik', 'intent' => 'thanks'],
            ['text' => 'chokran', 'intent' => 'thanks'],
            
            // HELP
            ['text' => 'aide', 'intent' => 'help'],
            ['text' => 'help', 'intent' => 'help'],
            ['text' => 'que peux tu faire', 'intent' => 'help'],
            ['text' => 'comment peux tu m aider', 'intent' => 'help'],
            ['text' => 'que sais tu faire', 'intent' => 'help'],
            ['text' => 'aide moi', 'intent' => 'help'],
            
            // STOCK GENERAL
            ['text' => 'quel est le stock', 'intent' => 'stock_general'],
            ['text' => 'donne moi l etat des stocks', 'intent' => 'stock_general'],
            ['text' => 'combien avons nous de phosphate', 'intent' => 'stock_general'],
            ['text' => 'quels sont les stocks actuels', 'intent' => 'stock_general'],
            ['text' => 'montre moi les quantites disponibles', 'intent' => 'stock_general'],
            ['text' => 'quelle quantite de phosphate avons nous', 'intent' => 'stock_general'],
            ['text' => 'quel est le niveau actuel des stocks', 'intent' => 'stock_general'],
            ['text' => 'ch7al 3ndna dial stock', 'intent' => 'stock_general'],
            ['text' => 'ch7al kayn', 'intent' => 'stock_general'],
            ['text' => 'quel est le stock total', 'intent' => 'stock_general'],
            
            // STOCK BY LOCATION/SILO/SITE/BPL
            // The NLP will classify "stock" based on keywords. The parameter extraction will specify which one it is.
            // So we can group all specific stock requests into a generic "stock_specific" or just "stock_general" 
            // and let the business rules override it to 'stock_by_location' if a location is found.
            // Or we train the NLP to recognize "silo" -> stock_by_location.
            ['text' => 'quel est le stock du silo', 'intent' => 'stock_by_location'],
            ['text' => 'combien contient le silo', 'intent' => 'stock_by_location'],
            ['text' => 'quelle quantite se trouve dans le silo', 'intent' => 'stock_by_location'],
            ['text' => 'le silo contient combien', 'intent' => 'stock_by_location'],
            ['text' => 'donne moi la quantite stockee dans le silo', 'intent' => 'stock_by_location'],
            ['text' => 'ch7al f silo', 'intent' => 'stock_by_location'],
            ['text' => 'que contient le silo', 'intent' => 'stock_by_location'],
            
            ['text' => 'quels sont les stocks tht', 'intent' => 'stock_by_bpl'],
            ['text' => 'quel est le stock sht', 'intent' => 'stock_by_bpl'],
            ['text' => 'combien avons nous de btr', 'intent' => 'stock_by_bpl'],
            ['text' => 'donne moi le stock btr', 'intent' => 'stock_by_bpl'],
            ['text' => 'ch7al kayn f btr', 'intent' => 'stock_by_bpl'],
            ['text' => 'ou se trouve le btr', 'intent' => 'stock_by_bpl'], // also location but relies on bpl
            
            ['text' => 'quel phosphate est stocke a', 'intent' => 'stock_by_site'],
            ['text' => 'quel est le stock du site', 'intent' => 'stock_by_site'],
            ['text' => 'stock de jorf lasfar', 'intent' => 'stock_by_site'],
            
            // BPL DEFINITION
            ['text' => 'qu est ce que le bpl', 'intent' => 'bpl_definition'],
            ['text' => 'c est quoi le bpl', 'intent' => 'bpl_definition'],
            ['text' => 'que signifie bpl', 'intent' => 'bpl_definition'],
            ['text' => 'a quoi sert le bpl', 'intent' => 'bpl_purpose'],
            ['text' => 'pourquoi utilise t on le bpl', 'intent' => 'bpl_purpose'],
            ['text' => 'explique moi le bpl', 'intent' => 'bpl_definition'],
            ['text' => 'donne moi une definition du bpl', 'intent' => 'bpl_definition'],
            ['text' => 'comment fonctionne la classification bpl', 'intent' => 'bpl_classification'],
            ['text' => 'chno howa bpl', 'intent' => 'bpl_definition'],
            ['text' => 'achno howa bpl', 'intent' => 'bpl_definition'],
            ['text' => 'quelles sont les classes bpl', 'intent' => 'bpl_classification'],
            ['text' => 'niveaux bpl', 'intent' => 'bpl_classification'],
            ['text' => 'les bpl', 'intent' => 'bpl_classification'],
            
            // BPL ACRONYMS
            ['text' => 'c est quoi le tht', 'intent' => 'bpl_acronym'],
            ['text' => 'que veut dire sht', 'intent' => 'bpl_acronym'],
            ['text' => 'definition btr', 'intent' => 'bpl_acronym'],
            ['text' => 'difference entre tht et sht', 'intent' => 'bpl_acronym'],
            ['text' => 'que signifie btn', 'intent' => 'bpl_acronym'],
            ['text' => 'c est quoi htn et htm', 'intent' => 'bpl_acronym'],
            ['text' => 'expliquer le sigle btp', 'intent' => 'bpl_acronym'],
            
            // ALERTS
            ['text' => 'quelles sont les alertes', 'intent' => 'alerts_general'],
            ['text' => 'y a t il des alertes', 'intent' => 'alerts_general'],
            ['text' => 'est ce qu il y a des problemes de stock', 'intent' => 'alerts_general'],
            ['text' => 'montre moi les alertes actuelles', 'intent' => 'alerts_general'],
            ['text' => 'quels stocks sont en alerte', 'intent' => 'alerts_general'],
            ['text' => 'quels sont les stocks critiques', 'intent' => 'alerts_critical'],
            ['text' => 'y a t il des stocks faibles', 'intent' => 'alerts_general'],
            ['text' => 'wach kaynin alertes', 'intent' => 'alerts_general'],
            ['text' => 'alerte critique', 'intent' => 'alerts_critical'],
            ['text' => 'danger', 'intent' => 'alerts_critical'],
            
            // PREDICTIONS
            ['text' => 'quelle est la prochaine prevision', 'intent' => 'prediction_next'],
            ['text' => 'quelles sont les previsions', 'intent' => 'prediction_general'],
            ['text' => 'que prevoit l ia', 'intent' => 'prediction_general'],
            ['text' => 'que va t il se passer avec les stocks', 'intent' => 'prediction_general'],
            ['text' => 'quelle est la demande prevue', 'intent' => 'prediction_general'],
            ['text' => 'donne moi les previsions de demande', 'intent' => 'prediction_general'],
            ['text' => 'quelle sera la demande dans les prochains jours', 'intent' => 'prediction_next'],
            ['text' => 'quelle sera la demande', 'intent' => 'prediction_general'],
            ['text' => 'montre moi les predictions', 'intent' => 'prediction_general'],
            ['text' => 'que predit prophet', 'intent' => 'prediction_general'],
            
            // SITES / LOCATIONS
            ['text' => 'quels sont les sites', 'intent' => 'sites_list'],
            ['text' => 'quels sites avons nous', 'intent' => 'sites_list'],
            ['text' => 'donne moi les sites disponibles', 'intent' => 'sites_list'],
            ['text' => 'ou sont stockes les phosphates', 'intent' => 'sites_list'],
            ['text' => 'quels sont les silos', 'intent' => 'location_information'],
            ['text' => 'quels sont les emplacements', 'intent' => 'location_information'],
            ['text' => 'quels sont les emplacements disponibles', 'intent' => 'location_information'],
            ['text' => 'explique site', 'intent' => 'site_information'],
            ['text' => 'information site', 'intent' => 'site_information'],
            ['text' => 'parle moi du site', 'intent' => 'site_information'],
        ];
    }
}
