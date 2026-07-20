<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport d'État des Stocks de Phosphate</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #233928;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.5;
        }
        .header {
            border-bottom: 2px solid #236534;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .logo-title {
            float: left;
        }
        .logo-title h1 {
            font-size: 18px;
            margin: 0 0 4px 0;
            color: #236534;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .logo-title p {
            margin: 0;
            font-size: 10px;
            color: #64748b;
        }
        .meta-info {
            float: right;
            text-align: right;
            font-size: 9px;
            color: #64748b;
        }
        .clearfix {
            clear: both;
        }
        .kpi-container {
            margin-bottom: 25px;
        }
        .kpi-card {
            width: 30%;
            float: left;
            background-color: #F5FAF5;
            border: 1px solid #C8E6CC;
            border-radius: 8px;
            padding: 10px;
            margin-right: 3%;
        }
        .kpi-card.last {
            margin-right: 0;
        }
        .kpi-value {
            font-size: 16px;
            font-weight: bold;
            color: #236534;
            margin-bottom: 2px;
        }
        .kpi-label {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 20px;
        }
        th {
            background-color: #236534;
            color: white;
            font-weight: bold;
            text-align: left;
            padding: 8px 10px;
            font-size: 9px;
            text-transform: uppercase;
        }
        td {
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background-color: #fafdfb;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            color: white;
            font-size: 8px;
            font-weight: bold;
        }
        .badge-green { background-color: #236534; }
        .badge-blue { background-color: #2563EB; }
        .badge-orange { background-color: #D97706; }
        .badge-red { background-color: #DC2626; }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
        }
        .font-mono {
            font-family: monospace, Courier, monospace;
        }
        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo-title">
            <h1>RAPPORT DE GESTION DES FLUX (RAPPORT GF)</h1>
            <p>Plateforme Digitale de Supervision des Stocks - OCP Group</p>
        </div>
        <div class="meta-info">
            <strong>Date du rapport :</strong> {{ now()->format('d/MM/Y H:i') }}<br>
            <strong>Généré par :</strong> {{ auth()->user()?->name ?? 'Directeur Admin' }}
        </div>
        <div class="clearfix"></div>
    </div>

    <div class="kpi-container">
        <div class="kpi-card">
            <div class="kpi-value">{{ number_format($totalStock, 0, ',', ' ') }} T</div>
            <div class="kpi-label">Stock Total Disponible</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value">{{ $siloCount }}</div>
            <div class="kpi-label">Silos Actifs Supervisés</div>
        </div>
        <div class="kpi-card last">
            <div class="kpi-value">{{ $highBplPercentage }}%</div>
            <div class="kpi-label">Proportion Haute Teneur</div>
        </div>
        <div class="clearfix"></div>
    </div>

    <h2>État Consolidé des Silos</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Complexe Minier</th>
                <th>Silo / Zone</th>
                <th>Type Phosphate</th>
                <th>Classe BPL</th>
                <th>Code Qualité</th>
                <th class="text-right">Stock Actuel</th>
                <th class="text-right">Capacité Max</th>
                <th class="text-right">Occupation</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stocks as $stock)
                @php
                    $q = (float) $stock->quantite;
                    $cap = (float) $stock->location->capacite_max;
                    $pct = $cap > 0 ? round(($q / $cap) * 100) : 0;
                    $qualCode = "{$stock->unite}-{$stock->bpl_class}-{$stock->quality_index}-{$stock->niveau}-{$stock->zone}-{$stock->carreau}-{$stock->traitement_1}-{$stock->traitement_2}";
                @endphp
                <tr>
                    <td class="font-mono text-muted">ST-{{ str_pad($stock->id, 3, '0', STR_PAD_LEFT) }}</td>
                    <td><strong>{{ $stock->location->site->name }}</strong></td>
                    <td class="font-mono">{{ $stock->location->name }}</td>
                    <td>{{ $stock->phosphateType->name }}</td>
                    <td>
                        <span class="badge badge-green">{{ $stock->bpl_class }}</span>
                    </td>
                    <td class="font-mono">{{ $qualCode }}</td>
                    <td class="text-right font-mono"><strong>{{ number_format($q, 0, ',', ' ') }} T</strong></td>
                    <td class="text-right font-mono text-muted">{{ number_format($cap, 0, ',', ' ') }} T</td>
                    <td class="text-right font-mono">{{ $pct }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Document officiel confidentiel - Propriété exclusive du Groupe OCP - Page 1/1
    </div>

</body>
</html>
