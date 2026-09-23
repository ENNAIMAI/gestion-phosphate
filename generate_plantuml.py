import zlib
import base64
import urllib.request

plantuml_code = """@startuml
left to right direction
skinparam packageStyle rectangle
skinparam usecase {
    BackgroundColor white
    BorderColor black
    ArrowColor black
}
skinparam actor {
    BackgroundColor white
    BorderColor black
}
skinparam backgroundcolor white

actor "Administrateur" as Admin
actor "Responsable Stock" as Resp
actor "Opérateur Terrain" as Op

rectangle "Plateforme Digitale de Gestion des Stocks de Phosphate" {
    package "Authentification" <<Rectangle>> {
        usecase "Se connecter / Se déconnecter" as UC_Auth
    }
    package "Gestion des Utilisateurs" <<Rectangle>> {
        usecase "Gérer les utilisateurs et rôles" as UC_Users
    }
    package "Gestion des Sites et Silos" <<Rectangle>> {
        usecase "Consulter les sites et silos" as UC_ViewSites
        usecase "Gérer les sites et silos" as UC_ManageSites
    }
    package "Gestion des Stocks" <<Rectangle>> {
        usecase "Consulter et filtrer les stocks\\n(par site, silo, classe BPL)" as UC_Stocks
    }
    package "Gestion des Mouvements" <<Rectangle>> {
        usecase "Consulter l'historique" as UC_MvtHist
        usecase "Enregistrer une réception (Entrée)" as UC_MvtIn
        usecase "Enregistrer une expédition (Sortie)" as UC_MvtOut
    }
    package "Rapports" <<Rectangle>> {
        usecase "Consulter les rapports" as UC_Reports
        usecase "Exporter en Excel/CSV" as UC_Export
    }
    package "Prévisions IA" <<Rectangle>> {
        usecase "Consulter les prévisions\\n(Graphe & Tableau)" as UC_Pred
    }
    package "Alertes" <<Rectangle>> {
        usecase "Consulter les alertes et stocks critiques" as UC_Alerts
    }
    package "Assistant Intelligent (Chatbot)" <<Rectangle>> {
        usecase "Interroger le chatbot\\n(Stocks, BPL, Alertes, IA, Sites)" as UC_Chatbot
    }
}

Op --> UC_Auth
Op --> UC_ViewSites
Op --> UC_Stocks
Op --> UC_MvtHist
Op --> UC_Alerts
Op --> UC_Chatbot

Resp --> UC_Auth
Resp --> UC_ViewSites
Resp --> UC_Stocks
Resp --> UC_MvtHist
Resp --> UC_MvtIn
Resp --> UC_MvtOut
Resp --> UC_Reports
Resp --> UC_Pred
Resp --> UC_Alerts
Resp --> UC_Chatbot

UC_Reports ..> UC_Export : <<include>>

Admin --> UC_Users
Admin --> UC_ManageSites
Admin -up-|> Resp : "Hérite des droits"
@enduml"""

def encode_plantuml(text):
    import zlib
    import string
    
    # Compress the string
    zlibbed_str = zlib.compress(text.encode('utf-8'))
    # Remove header (2 bytes) and checksum (4 bytes)
    compressed_string = zlibbed_str[2:-4]

    # Standard base64 characters
    b64_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    # PlantUML base64 characters
    plantuml_alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
    
    # Base64 encode
    import base64
    b64_encoded = base64.b64encode(compressed_string).decode('utf-8')
    
    # Translate
    trans = str.maketrans(b64_alphabet, plantuml_alphabet)
    return b64_encoded.translate(trans).replace("=", "")

encoded = encode_plantuml(plantuml_code)
url = f"http://www.plantuml.com/plantuml/svg/{encoded}"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
svg_data = urllib.request.urlopen(req).read()
output_path = r"C:\Users\hp\.gemini\antigravity\brain\edb55388-74c1-4ec7-8181-9803c9aa1ea8\diagramme_cas_utilisation.svg"
with open(output_path, "wb") as f:
    f.write(svg_data)

print(f"SVG generated successfully at {output_path}")
