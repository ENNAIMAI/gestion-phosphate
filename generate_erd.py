import urllib.request

plantuml_code = """@startuml
skinparam roundcorner 5
skinparam linetype ortho
skinparam shadowing false
skinparam class {
    BackgroundColor white
    ArrowColor #2688d4
    BorderColor #2688d4
}

entity "User" as user {
  * id : bigint <<PK>>
  --
  * name : varchar
  * email : varchar
  * role : varchar
  * password : varchar
}

entity "Site" as site {
  * id : bigint <<PK>>
  --
  * name : varchar
  * code : varchar
}

entity "Location (Silo)" as location {
  * id : bigint <<PK>>
  --
  * site_id : bigint <<FK>>
  * name : varchar
  * capacite_max : decimal
}

entity "PhosphateType" as ptype {
  * id : bigint <<PK>>
  --
  * name : varchar
  * code : varchar
  * densite : decimal
}

entity "Stock" as stock {
  * id : bigint <<PK>>
  --
  * location_id : bigint <<FK>>
  * phosphate_type_id : bigint <<FK>>
  * quantite : decimal
  * bpl_class : varchar
}

entity "StockMovement" as mvt {
  * id : bigint <<PK>>
  --
  * stock_id : bigint <<FK>>
  * movement_type_id : bigint <<FK>>
  * user_id : bigint <<FK>>
  * quantite : decimal
  * statut : varchar
}

entity "AlertRule" as arule {
  * id : bigint <<PK>>
  --
  * phosphate_type_id : bigint <<FK>>
  * seuil_min : decimal
  * seuil_max : decimal
}

entity "Alert" as alert {
  * id : bigint <<PK>>
  --
  * stock_id : bigint <<FK>>
  * alert_rule_id : bigint <<FK>>
  * type_alerte : varchar
  * message : varchar
}

site "1" -- "0..*" location
location "1" -- "0..*" stock
ptype "1" -- "0..*" stock
stock "1" -- "0..*" mvt
user "1" -- "0..*" mvt
ptype "1" -- "0..*" arule
stock "1" -- "0..*" alert
arule "1" -- "0..*" alert

@enduml"""

def encode_plantuml(text):
    import zlib
    import string
    import base64
    zlibbed_str = zlib.compress(text.encode('utf-8'))
    compressed_string = zlibbed_str[2:-4]
    b64_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    plantuml_alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
    b64_encoded = base64.b64encode(compressed_string).decode('utf-8')
    trans = str.maketrans(b64_alphabet, plantuml_alphabet)
    return b64_encoded.translate(trans).replace("=", "")

encoded = encode_plantuml(plantuml_code)
url = f"http://www.plantuml.com/plantuml/svg/{encoded}"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
svg_data = urllib.request.urlopen(req).read()
output_path = r"C:\Users\hp\.gemini\antigravity\brain\1c670976-e088-4e09-bd6d-53ef1b567dd9\erd_diagram.svg"
with open(output_path, "wb") as f:
    f.write(svg_data)

print(f"SVG generated successfully at {output_path}")
