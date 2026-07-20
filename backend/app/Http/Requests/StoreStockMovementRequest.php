<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockMovementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Handled by policies, return true here
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'location_id' => 'required|exists:locations,id',
            'phosphate_type_id' => 'required|exists:phosphate_types,id',
            'movement_type_id' => 'required|exists:movement_types,id',
            'quantite' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:1000',
            'unite' => 'required|string|in:UL,UL1,UL2,UL3,US,UC,UC2,UC3,UC4',
            'bpl_class' => 'required|string|in:SHT,THT,HTN,HTM,MT,BTR,BTN,BTP,TBT,XBT',
            'quality_index' => 'required|string|in:RC,RF,FMgO,NONE',
            'niveau' => 'required|string|in:SA2,SB,C0,C1EXP,C1NOR,C2INF,C2SUP,C3INF,CSGLO,C4,C4AD,C2,C2 export,C3 sup,C5,C6',
            'zone' => 'required|string|in:L30,L31,L33,L34,P1,P2,P3,P4,R1,R2,R3,B2P1,B2P2,B2P3,B2P4,B2P5,BMS',
            'carreau' => 'required|string|in:BO,MZ,BG',
            'traitement_1' => 'required|string|in:B,L,F,LF,S,C,SCAL,K',
            'traitement_2' => 'required|string|in:B,L,F,LF,S,C,SCAL,K',
            'moyen_transport' => 'nullable|string|in:Camion,Train,Convoyeur',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'location_id.required' => 'La zone de dépôt (localisation) est requise.',
            'location_id.exists' => 'La localisation sélectionnée est invalide.',
            'phosphate_type_id.required' => 'Le type de phosphate est requis.',
            'phosphate_type_id.exists' => 'Le type de phosphate sélectionné est invalide.',
            'movement_type_id.required' => 'Le type de mouvement est requis.',
            'movement_type_id.exists' => 'Le type de mouvement sélectionné est invalide.',
            'quantite.required' => 'La quantité est requise.',
            'quantite.numeric' => 'La quantité doit être un nombre.',
            'quantite.min' => 'La quantité minimale à déplacer est de 0.01 T.',
        ];
    }
}
