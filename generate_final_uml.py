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

actor "Opérateur Terrain" as Op
actor "Administrateur" as Admin
actor "Responsable Stock" as Resp

rectangle "Plateforme Digitale de Gestion des Stocks de Phosphate" {
    
    package "Authentification" <<Rectangle>> {
        usecase "Se connecter" as UC_Login
        usecase "Se déconnecter" as UC_Logout
    }
    
    package "Tableau de bord" <<Rectangle>> {
        usecase "Consulter le tableau de bord" as UC_Dash
    }

    package "Stocks" <<Rectangle>> {
        usecase "Consulter les stocks" as UC_Stocks
        usecase "Filtrer les stocks" as UC_FilterStocks
        usecase "Consulter les produits / définitions BPL" as UC_BPL
        UC_Stocks <.. UC_FilterStocks : <<extend>>
    }

    package "Sites & Silos" <<Rectangle>> {
        usecase "Consulter les sites" as UC_ViewSites
        usecase "Gérer les sites" as UC_ManageSites
        usecase "Gérer les silos" as UC_ManageSilos
    }

    package "Mouvements" <<Rectangle>> {
        usecase "Enregistrer une réception" as UC_MvtIn
        usecase "Enregistrer une expédition" as UC_MvtOut
        usecase "Consulter l'historique des mouvements" as UC_MvtHist
        usecase "Gérer / consulter les mouvements" as UC_MvtManage
    }

    package "Rapports" <<Rectangle>> {
        usecase "Générer un rapport" as UC_Report
        usecase "Exporter en Excel" as UC_ExpXls
        usecase "Exporter en CSV" as UC_ExpCsv
        UC_Report ..> UC_ExpXls : <<include>>
        UC_Report ..> UC_ExpCsv : <<include>>
    }

    package "Alertes" <<Rectangle>> {
        usecase "Consulter les alertes" as UC_Alerts
        usecase "Consulter les stocks critiques" as UC_Crit
        UC_Alerts <.. UC_Crit : <<extend>>
    }

    package "Prévisions IA" <<Rectangle>> {
        usecase "Consulter les prévisions" as UC_Pred
        usecase "Analyser les prévisions IA" as UC_PredAnal
        UC_Pred <.. UC_PredAnal : <<extend>>
    }

    package "Chatbot" <<Rectangle>> {
        usecase "Interroger le chatbot" as UC_Chatbot
    }

    package "Administration" <<Rectangle>> {
        usecase "Gérer les utilisateurs" as UC_Users
        usecase "Gérer les rôles" as UC_Roles
        usecase "Configurer les paramètres" as UC_Settings
    }
}

' Relations Opérateur
Op -- UC_Login
Op -- UC_Logout
Op -- UC_Dash
Op -- UC_Stocks
Op -- UC_BPL
Op -- UC_ViewSites
Op -- UC_Chatbot

' Relations Responsable
UC_Login -- Resp
UC_Logout -- Resp
UC_Dash -- Resp
UC_Stocks -- Resp
UC_BPL -- Resp
UC_ViewSites -- Resp
UC_Alerts -- Resp
UC_Pred -- Resp
UC_Report -- Resp
UC_MvtIn -- Resp
UC_MvtOut -- Resp
UC_MvtHist -- Resp
UC_Settings -- Resp
UC_Chatbot -- Resp

' Héritage
Admin -|> Resp

' Relations exclusives Administrateur
Admin -- UC_Users
Admin -- UC_Roles
Admin -- UC_ManageSites
Admin -- UC_ManageSilos
Admin -- UC_MvtManage

@enduml"""

def encode_plantuml(text):
    import zlib
    import string
    
    zlibbed_str = zlib.compress(text.encode('utf-8'))
    compressed_string = zlibbed_str[2:-4]

    b64_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    plantuml_alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
    
    import base64
    b64_encoded = base64.b64encode(compressed_string).decode('utf-8')
    
    trans = str.maketrans(b64_alphabet, plantuml_alphabet)
    return b64_encoded.translate(trans).replace("=", "")

encoded = encode_plantuml(plantuml_code)
url = f"http://www.plantuml.com/plantuml/svg/{encoded}"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
svg_data = urllib.request.urlopen(req).read()
output_path = r"C:\Users\hp\.gemini\antigravity\brain\1c670976-e088-4e09-bd6d-53ef1b567dd9\diagramme_cas_utilisation_final.svg"
with open(output_path, "wb") as f:
    f.write(svg_data)

print(f"SVG generated successfully at {output_path}")
