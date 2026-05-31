'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Vector3 } from 'three';
import SignLanguageAvatar, { type SignFrame } from './SignLanguageAvatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

type CameraView = 'close' | 'general';

const CAMERA_PRESETS: Record<CameraView, { pos: [number, number, number]; target: [number, number, number]; fov: number }> = {
  close:   { pos: [0, 0.7, 2.2], target: [0, 0.3, 0], fov: 45 },
  general: { pos: [0, 1.0, 2.8], target: [0, 0.0, 0], fov: 55 },
};

function CameraController({ view }: { view: CameraView }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const isAnimating = useRef(false);
  const isFirstRender = useRef(true);
  const targetPos = useRef(new Vector3(...CAMERA_PRESETS[view].pos));
  const targetLook = useRef(new Vector3(...CAMERA_PRESETS[view].target));

  useEffect(() => {
    const p = CAMERA_PRESETS[view];
    targetPos.current.set(...p.pos);
    targetLook.current.set(...p.target);
    (camera as any).fov = p.fov;
    (camera as any).updateProjectionMatrix?.();
    if (isFirstRender.current) {
      camera.position.set(...p.pos);
      if (controlsRef.current) {
        controlsRef.current.target.set(...p.target);
        controlsRef.current.update();
      }
      isFirstRender.current = false;
      return;
    }
    isAnimating.current = true;
  }, [view, camera]);

  useFrame(() => {
    if (!isAnimating.current) return;
    camera.position.lerp(targetPos.current, 0.08);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, 0.08);
      controlsRef.current.update();
    }
    if (camera.position.distanceTo(targetPos.current) < 0.005) {
      camera.position.copy(targetPos.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLook.current);
        controlsRef.current.update();
      }
      isAnimating.current = false;
    }
  });

  return <OrbitControls ref={controlsRef} enablePan={false} minDistance={1.0} maxDistance={6} />;
}

function signIdToLabel(id: string): string {
  return id
    .replace(/^\d+_/, '')
    .replace(/_\d+$/, '')
    .replace(/_rsquo_/g, "'")
    .replace(/_/g, ' ')
    .replace(/\b\w/, c => c.toUpperCase());
}

const SIGNS_LIST = [
  '0_tres_nul_zero_3','0_zero_1','1000_mille','100_cent','10_dix_1','110_cent_dix','11_onze_2','120_cent_vingt',
  '12_douze_2','130_cent_trente','13_treize_3','140_cent_quarante','14_quatorze_1','150_cent_cinquante','15_quinze_1','160_cent_soixante',
  '16_seize_1','170_cent_septante','17_dix_sept_1','180_cent_quatre_vingts','18_dix_huit_1','190_cent_nonante','19_dix_neuf_1','1_an',
  '1_an_duree','1_mois_2','1_semaine','1_un','2000_deux_mille','200_deux_cents','20_vingt_1','2_ans',
  '2_ans_duree','2_deux','2_mois_1','2_semaines_2','3000_trois_mille_1','300_trois_cents_1','30_trente_1','3_ans_1',
  '3_ans_duree','3_jours_apres','3_jours_avant','3_mois_1','3_semaines_1','3_trois_1','4000_quatre_mille','400_quatre_cents',
  '40_quarante','4_ans','4_ans_duree','4_mois_1','4_quatre','4_semaines','5000_cinq_mille','500_cinq_cents',
  '50_cinquante','5_ans','5_ans_duree','5_cinq','5_mois_1','5_semaines','5_sens','600_six_cents_1',
  '60_soixante','6_mois','6_six_1','700_sept_cents_1','70_septante','7_mois','7_sept_1','800_huit_cents_1',
  '80_quatre_vingts','8_huit_1','8_mois','900_neuf_cents_1','90_nonante','9_mois_1','9_neuf_1','a_1',
  'a_10_heures_a_22_heures_1','a_11_heures_a_23_heures_2','a_1_heure_a_13_heures','a_2_heures_a_14_heures','a_3_heures_a_15_heures_1','a_4_heures_a_16_heures','a_5_heures_a_17_heures','a_6_heures_a_18_heures',
  'a_7_heures_a_19_heures','a_8_heures_a_20_heures','a_9_heures_a_21_heures_1','a_bientot_1','a_bout_a_fond','a_cote_de_1','a_cote_de_aupres_de_voisin_1','a_l_avance_anticiper_avant_de',
  'a_la_fin_1','a_la_fin_2_fin','a_la_main_main_d_rsquo_oeuvre','a_la_poubelle_jeter_1','a_la_poubelle_jeter_2_lancer','a_mon_avis_opinion','a_mon_tour','a_part_ca_autre_theme',
  'a_partir_de_depart_desormais','a_partir_de_maintenant','a_pied_marcher_1','a_present_maintenant','a_son_avis_opinion','a_son_tour','a_suivre_suite','a_ton_avis_opinion',
  'a_ton_tour','aa_alcooliques_anonymes','aarschot_ville','abaisse_langue','abandonner','abattoir_boucher_boucherie_1','abces_corps','abces_dent',
  'abeille','abils_asbl','abimer_2','abonnement_1','aborigenes_d_rsquo_australie_2','aboyer_1','abraham_religion','abreger_bref_court_resume_synthese',
  'abreger_compresser_contraction','abricot_2','absent_manquer','absinthe','absorber','academie','acceder_acces','accelerer_depecher_fort_rapide_turbo_vite',
  'accent_voix_2','accepter_accorder_1','acces_accessibilite','accessible','accident','accident_du_travail','accident_vasculaire_cerebral_avc_1','accident_vehicule_terrestre',
  'accompagner_conduire_quelqu_un_guider','accompagner_suivre','accordeon','accorder_d_rsquo_accord_1','accoucher_naissance_naitre_1','accrobranche','accrocher_portemanteau_1','accroitre_ameliorer_progresser_2',
  'accueil_2','accumuler_accroitre_quantite_1','accuser_condamner_inculpation','acheter','achever_arreter_3_cesser_finir_terminer_2','achever_arreter_4_cesser_finir_terminer_3','achever_finir_terminer_1','acide_1',
  'acier_fer_metal_2','acompte','acquerir','acteur_1','action_1','actionnaire_coupon','activite','actuel_aujourd_rsquo_hui_maintenant_present',
  'acupuncture','adam_catholique','adam_temoins_de_jehovah','adapte','adapter','addiction_dependance','addition_et_plus_ajouter_2','adherer',
  'adidas','adieu','adjectif_1','adjoint_assistant_2','administration','adn_genetique','adolescence_1','adolf_hitler_2',
  'adopter','adorer','adresse_3','adroit_fin_malin','adulte','adultere_2','adverbe','adversaire_contre_ennemi_1',
  'adversaire_contre_ennemi_opposer_2','aerer','aerer_air_frais_rafraichir','aerographe','aeroport','affaire_1','affaires_etrangeres','affiche_poster',
  'affilier','affirmation_grammaire','affreux','affreux_laid_moche_vilain_2','afghanistan_1','afin_de_but_objectif','afrique_1','afrique_du_sud_2',
  'agacer_2','age_anniversaire_1','age_vieillir_vieux','agence','agenda_calendrier','agenouiller','agent_police_1','agglomeration',
  'agneau','agrafeuse_1','agreable','agressif_brutal','agriculteur_ferme_fermier_1','ah_etonne_surprise_emotion_2','aider_au_secours_1','aigle',
  'ail_1','aile_poulet','aile_s_rsquo_envoler_voler_oiseau','aimer_1','aimer_a_la_folie_2','ainsi_comme_ca','air','airbnb',
  'aire_endroit_espace_lieu_place_zone','ajouter_supplement','aka_alphabet_des_kinemes_assistes','alarme_alerte','alaska_usa','albanie_1','albert_einstein','albert_ier_roi_de_belgique',
  'albert_ii_roi_de_belgique','albert_prenom','album','alcool_2','aldi_2','alfa_romeo','algerie_2','algorithme',
  'algue','aliment_manger_nourriture_repas','allah','allaiter','allee_chemin_sentier_2','allemagne_allemand_2','aller_3','allergie_1',
  'allergique','alligator_caiman_crocodile','allocation_1','allonge','allonger','allonger_repos','allumer_la_lampe_lampe_2','allumette',
  'alors_2','alost_ville','alpha_signes_asbl','alphabet_dactylologie_epeler','alzheimer','amande','amateur_1','amazon_2',
  'amazonie','ambassade_1','ambiance','ambulance_2','ameliorer_mieux_en_mieux','amende','amer','americain_etats_unis_d_amerique_usa_2',
  'amerique_centrale_1','amerique_du_nord_2','amerique_du_sud_2','ami','ami_amical_camarade_copain_2','amnesty_international','amortisseur_vehicule','amour_2',
  'amphibiens','ampoule','amsterdam_pays_bas','amuser_1','amygdale','amygdalectomie_enlever_les_amygdales','an_age','anaconda_2',
  'analyser','ananas_3','ancien_2','andenne_ville','anderlecht_ville_2','android','ane_1','ane_pas_doue',
  'ange_2','anglais_angleterre_britannique_royaume_uni','angle','angoisse','angola','animal','animal_bete','animateur_animation',
  'anne','anneau_bague_2','anneau_contraceptif_anneau_vaginal','anneau_structure_en_forme_de_cercle','annee','annelides_1','anniversaire_3','annoncer_declarer',
  'annuler','anormal','ans_annee','antenne_animal','antenne_reseau_telephonique','anti_contre_detester','antibiotique_1','anticyclone',
  'antiquite','antivirus_2','antoine_dresse','antoing_ville','anvers_ville_2','aout_1','apedaf_asbl','apercevoir',
  'apercevoir_remarquer_1','aperitif_1','app_store_2','apparaitre_surgir','appareil_auditif_prothese_auditive_2','appareil_photo_photo_photographie_1','appartement_2','appartenir_1',
  'appeler_insistance_sur_l_actif','appeler_insistance_sur_le_passif','appendice','applaudir_bravo_felicitations_1','application_app','apporter_transporter_2','apprendre','apprendre_encore_apprentissage_avoir_beaucoup_a_apprendre',
  'apprendre_entendre_dire_1','apprendre_gaver','apprendre_quelqu_un_dresser_enseigner_2','approcher','approuver','apres_3','apres_demain','apres_ensuite_puis',
  'apres_midi_3','apres_periode','apresmidi','arabe_1','arabie_saoudite_2','arachnides','araignee_3','araignee_d_rsquo_eau',
  'arbitre_siffler_sifflet_1','arbre','arc_en_ciel_1','arc_tir_a_l_rsquo_arc_2','archer','archeveque','architecte_1','ardenne_ville',
  'arene','arete_os_1','argent','argent_cout_monnaie_sou_tarif','argent_de_poche','argent_matiere','argentine_1','argumenter',
  'arlequin_carnaval_1','arlon_ville','armee_militaire_soldat_1','armenie','armistice_1','armoire_3','arnaque_escroquer_2','arobase',
  'arracher_une_dent_extraction_dentaire_1','arranger','arret_transport_en_commun','arreter','arreter_2_stopper','arriere_derriere_1','arriver_1_point_de_vue_interne','arriver_2_point_de_vue_externe',
  'arriver_3_point_de_vue_externe','arriver_4','arroser_1','art_1_artiste','art_2','arthropodes','artichaut','as_jeu_de_cartes',
  'assemblee_congres','asseoir','assez_suffire_2','assiette','assister_observer_regarder_assister','association','association_1_societe','assommer_dormir',
  'assurance_1','assurer_la_confiance','asteroide','astronomie_telescope','atelier_activite_2','ateliers_du_monceau_asbl','ath_ville','athenes_grece',
  'atmosphere','atome','atomium_monument_heysel_ville','attacher_lacet_nouer_2','attaquant_football','attaquer','attendre_1','attendre_longtemps',
  'attentat_suicide_kamikaze','attentif_attention_prudent_2','attention_danger_1','attention_dangereux_2','atterrir_1','attirer','attitude_1','attraper',
  'attraper_contamination_2','attribuer','au_revoir_3','au_secours_sauvegarder_sauver','au_septieme_ciel','aube','aubel_ville','aubergine',
  'aucun_6','aucun_il_n_rsquo_y_a_pas_5','auderghem_ville_1','audi_1','audisme','augmenter','augmenter_elever','aujourdhui',
  'aussi_egalement_meme_2_pareil_1','australie_3','autisme','auto_automobile_vehicule_voiture_1','auto_automobile_voiture_2','autobus_bus_1','autocar_car_vehicule','automatique_1',
  'automne','autonome','autoriser_permettre_pouvoir_autoriser','autoroute','autre_2','autrefois_avant_1','autrefois_il_etait_une_fois_2','autriche_2',
  'autruche','avalanche','avaler','avancer','avant','avant_autrefois','avant_hier','avant_passe',
  'avant_periode_precedent','avant_procedure_precedent','avant_recemment','avantage','avare_radin','avatar','avec_2','avec_ensemble_1',
  'avenir_futur_1_plus_tard_prochain_1','avenir_futur_2','aventure_3','avenue_2','averse_pleuvoir_fort_pluie_forte_3','avertir_prevenir','aveugle_2','avion',
  'aviq_awiph','avocat_1','avocat_fruit_1','avoine','avoir_envie_vouloir_1','avoir_exister_il_y_a_la_posseder_1','avoir_l_rsquo_air','avoir_le_bras_long_pistonner',
  'avoir_le_coup_de_foudre_tomber_amoureux','avoir_le_temps_1','avoir_les_paupieres_lourdes_1','avoir_mal_douleur_1','avorter','avouer_1','avril_1','aywaille_ville',
  'azerbaidjan_2','b_1','babylone','babysitter','bac_baccalaureat_bachelier','bac_caisse','bacterie_1','badminton',
  'baffle_musique_resonnante','bagage_valise','bagarre_se_battre','bague_1','baguette_magique','baguette_pain_francais','bailler_2','bain_salle_de_bain_1',
  'baiser_bisou_embrasser_bouche_1','baiser_bisou_embrasser_joue','baiser_coiter_faire_l_amour_1','baiser_par_plusieurs_personnes','baiser_vulgaire_1','bal_boite_de_nuit_discotheque_1','balader_se_promener_2','balai_balayer_2',
  'balancer_peser','balancoire_1','balayette','bale_suisse','baleine','bali_indonesie','balle_3_ballon_de_foot_1','balle_4_ballon_de_foot_2',
  'balle_boule_1','balle_cartouche_arme','ballon','ballon_d_rsquo_anniversaire','banane','banane_plantain','banc','bande_dessinee_bd',
  'bandeau','banderole','bandes_de_circulation','bandit','bangladesh','banque_compte_1','banquet_1','bapteme_1',
  'bar','barack_obama','barbe','barbecue_1','barcelone_espagne_catalan','barque_pagayer_ramer','barrage_2','barrage_de_police',
  'barre_oblique_diagonale_fraction','barrer_1','barres_paralleles','barriere_cloture','barriere_douane_frontiere','bas_localisation_2','bas_vetement','base_2',
  'base_ball','basket_ball_1','bastogne_ville','bateau','bateau_naviguer_navire_1','batiment_domicile_foyer_habitation_maison_2','batiment_immeuble','batir_construire_1',
  'batman','batonnet_ouate_coton_tige','batterie_instrument','batterie_pile','battre_en_jeu_1','baudouin_ier_roi_de_belgique','bavarder_1','baver_2',
  'bavoir_2','bazar_desordre_1','bazooka_lance_roquettes','beau','beau_joli_magnifique_1','beaucoup_1_trop','beaucoup_2','beaucoup_en_abondance_enormement_plein_1',
  'beaumont_ville','bebe','bec','bechamel_1','beche','beige','belgacom','belgique_2',
  'belier','belize','bellewaerde','benefice','benin','bequille_1','berchem_sainte_agathe_ville_1','berger',
  'berlin_allemagne','berne_suisse','besoin','besoin_necessaire_utile_utiliser_1','bete','bete_stupide_2','beton_1_ciment','beton_2',
  'beurre_2','bhoutan','biberon','bible_catholique','bible_temoins_de_jehovah','bibliotheque','bic_stylo_1','biche',
  'bicyclette_cycliste_velo_1','bicyclette_velo_2','bielorussie_1','bien','bien_etre_1','bien_sur_logique_2','biensur','bientot',
  'bienvenue','biere_3','bierset_ville','bikini','bilan_comptable_1','bilingue_2','billet_ticket','binche_ville',
  'biplan_avion','bipolaire_double_tendance_indecis_2','bipolaire_trouble_de_l_humeur_1','birmanie_myanmar','biscuit_2','bisexuel_2','bison_1','bivalves',
  'bizarre','bizarre_drole_etrange_1','bla_bla_1','blague_1_plaisanter_1','blague_3_plaisanter_2','blague_histoire_2','blanc','blatte_cafard',
  'ble_gluten','blesser_1','bleu_2','blocus_1','blond_3','bloquer_coincer_2','bmw','boa',
  'bobbejaanland','bodybuilding_culturisme','boeuf_1','boire','boire_beaucoup_d_alcool','bois_1','boisson','boite_caisse_caisse_finance_colis_paquet',
  'boite_petite_taille','boiter','bol','bolivie_2','bolognaise','bombarder_1','bombe','bombe_atomique_1',
  'bombe_exploser','bon_1','bon_appetit_1','bon_coeur','bonamanger','bonbon_1','bonheur_heureux','bonhomme_de_neige_2',
  'bonjour_1','bonne_annee','bonne_idee','bonne_journee','bonne_nuit_2','bonne_soiree_2','bonnet','bonsoir',
  'bord','bordeaux','bordeaux_france_1','bosnie_herzegovine_1','bosse','bossu_2','boston_usa','botswana_1',
  'botte','bouche_levre','boucher_empecher_la_circulation','bouchon_embouteillage_1','boucle_d_rsquo_oreille_2','bouddha_2','bouder','boudin',
  'boue','bouee','bouge_ville','bouger_1','bougie_2','bouillir','boulanger_boulangerie','boulangerie',
  'bouleau_2','boulette_viande_2','boulevard','bouleversement_chaos_crise_revolution','boulot_emploi_metier_profession_travailler_1','boulot_metier_travailler_3','bouquin_livre','bourdon_insecte_1',
  'bourgmestre_maire','bourse_2','bousculer_heurter_quelqu_rsquo_un','boussole','bouteille_1','boutique_magasin_2','bouton','bouton_vetement',
  'boutonner','boutonner_bouton_pression','bowling_2','boxe','boxer','brabant_1','brabant_flamand','brabant_wallon',
  'bracelet','brachiosaure','braille_1','braine_le_comte_ville','branche','branche_scolaire_cours_1','bras','bras_d_honneur_va_te_faire_foutre',
  'brassard','bratislava_slovaquie','brave_courage_1','bresil_2','bricolage_bricoler','brillant','briller','brique_1',
  'briquet','briser_casser_detruire_2','brochette','brocoli','bronzage','bronzer_1','brosse','brosse_a_chaussures',
  'brosse_a_cheveux','brosse_a_dent_electrique','brosse_a_dents_1','brosse_a_vetements','brosser_secher_1','brouette','brouillard','brouillon',
  'broyer','bruce_lee','bruges_ville_1','bruit_son_bruitage_3','bruler_flambe_incendie','brun_1','brun_3_chatain','brushing',
  'bruxelles_ville_1','buanderie_laver_vetement','buffet','buffle','bulgarie_2','bulldozer','bulletin_2','bureau_1',
  'burkina_faso_1','burn_out','burundi_4','buter_football_marquer_football','c','c_est_amusant_c_est_hilarant_c_est_marrant','c_est_il_s_agit_de','c_est_tout',
  'c_est_un_hasard_c_est_une_coincidence_tout_juste','c_rsquo_est_comme_ca','c_rsquo_est_la_vie_1','c_rsquo_etait_vachement_genial','ca_arrive','ca_ce_ceci_cela_celui','ca_coute_les_yeux_de_la_tete','ca_me_rend_malade_degouter',
  'ca_monte_et_ca_descend','ca_ne_marche_pas_ca_ne_va_pas','ca_ne_vaut_pas_la_peine','ca_s_est_retourne_contre_soi_karma_1','ca_tombe_bien','ca_va','ca_veut_dire_cela_signifie_que_c_est_a_dire_que_1','cabine_chambre_piece_habitation_2',
  'cabriolet_decapotable','caca_crotte_selle','cacahuete','cacao_1','cacher_2','cacher_camouflage_dissimuler_ne_pas_voir_directement','cactus','cadavre_deceder_mort_mourir_1',
  'cadeau','cadenas','cadre_photo_ou_tableau','cadre_structure_discipline','cafe','cafe_lieu_2','cafesignes','cafetiere_1',
  'cage_point_de_vue_externe','cage_point_de_vue_interne','cagoule','cahier','caillou','caissiere','cake_1','calculatrice',
  'calculer','calculer_mathematique_3','californie_usa','calin','call_girl_prostitution_travailleuse_du_sexe','calme_1','calme_toi','cambodge',
  'cambrioler_voler_2','camera','camera_filmer','cameroun','camion_1','campagne_village_1','camping_tente_1','canada_1',
  'canal','canal_voie_d_rsquo_eau','canape_fauteuil_1','canard_1','canari','cancer','cancer_maladie_1','candidature',
  'canette','canicule_vague_de_chaleur_1','canif','cannabis_joint','canne_de_marche','cannelle','cannes_france','canon_2',
  'canon_marque','caoutchouc_elastique_1','cap_vert','capable_possible_probable','capacite','capitaine_armee','capitaine_football','capitale_2',
  'capitulation','cappuccino','capuchon_chaperon','caracas_venezuela','caractere','caravane','cardinal','careme',
  'caresser_1','carnaval','carnet','carnivore','carotte','carpe_poisson','carre_forme_geometrique_2','carreau_verre_materiau',
  'carrefour','carrefour_magasin_1','cartable_mallette','carte_d_rsquo_identite','carte_envoi_postal','carte_jeu','carton_2','cartouche_encre',
  'casablanca_maroc','cascade_chute_d_rsquo_eau_torrent_2','cash','casier_judiciaire_dossier_noir_en_justice','casino','casque_moto','casquette_1','casse_toi_degage_toi',
  'casser','casserole','cassette_video_video_videocassette_3','catastrophe','catch','catherine','catholique_chretien','cauchemar',
  'cause_faute_par','cave','caviar','ce1d','ceb','ceder_code_de_la_route','ceinture','ceinture_securite',
  'celebre','celibataire_1','celtes','cendrier','centime_1','centimetre_cm_2','centre_2','centre_commercial_shopping',
  'centre_comprendre_et_parler_asbl','centre_lui_et_nous_asbl','cephalopodes_1','cercle_rond_1','cereale_aliment_transforme_1','cereale_plante_cultivee_1','cerf','cerf_volant',
  'cerise_2','cerne','cerner_encercler','cerner_yeux','certain_1','certificat_1','cerveau_2','cesarienne',
  'cess','cfls_asbl_2','chacun_chaque','chagrin_2','chagrine','chaine','chaine_tv','chaise_monte_escalier',
  'chaise_s_rsquo_asseoir_1','chambre','chameau','chamois','champagne','champignon','champion_1','champion_magasin',
  'champion_ville','chance','chandeleur','changer','changer_d_avis_plusieurs_fois_3','changer_d_avis_retourner_sa_veste_se_desister_2','changer_devenir_2','changer_ecole_demenager',
  'changer_modifier_3','changer_transformer_4','chansigne_chantsigne','chanter_2','chape','chapeau','chapiteau','chapitre_1',
  'chaque_annee','char_de_combat_tank','charbon','charcuterie','chargeur','chariot','charite','charlemagne',
  'charleroi_ville_2','charles_chaplin_1','charrette','chasse_d_rsquo_eau_1','chasser','chasser_prendre','chasseur_2','chat_1',
  'chataigne','chateau_2','chateau_de_versailles_1','chatgpt_1','chatouiller','chatter_tchatter_1','chaud','chaud_lapin',
  'chauffage','chauffage_radiateur_2','chauffer','chaussee','chaussette_1','chaussure_soulier','chauve_2','chef_1',
  'chemin_de_fer_rail','cheminee','chemise_2','chene','chenille','cheque','cher_4','chercher',
  'chercher_aller_prendre_prendre','chercheur_rechercher','cheval','cheval_de_trait','chevalier','cheveu','cheveux','cheveux_boucles',
  'cheveux_courts','cheveux_lisses','cheveux_longs','cheveux_longs_homme','chevre_2','chevreuil','chewing_gum','chiant_1',
  'chic_1','chicon_endive','chien_2','chievres_ville','chiffre_1','chiffre_2_numero_2','chili','chimie',
  'chimiotherapie_2','chine_chinois_1','chiny_ville','chips_2','chique','chirurgien_operer','chisinau_moldavie','chocolat_1',
  'choisir','choisir_2_elire_selectionner','cholesterol','chomage_1','choquer','chose_quelque_chose','chou_de_bruxelles','chou_de_fleur',
  'chouette','christian_christophe','chs_irsa','chuchoter_2','chut_silence_1','chypre','cible','cidre',
  'ciel','cigale','cigare','cigarette','cigogne','cimetiere_enterrement_enterrer_tombe_1','cimetiere_enterrement_tombe_2','cinema_1',
  'ciney_ville','cinquieme','circulation_dans_les_deux_sens_2','circulation_sanguine','cirque_1_clown','cirque_2','ciseaux','cisjordanie_palestine',
  'citadelle_1','citoyen','citoyen_civil_2','citoyen_civil_gens_population','citroen_2','citron_1','civilisation_maya_3','clair',
  'clair_comprehension_2','claquer_cramper_musculaire','claquer_etre_fatigue','clarinette','classe','classeur_farde','classificateur','classique',
  'clavier','cle_1','cle_usb','clef','clenche_poignee','client_patient_malade_3','cligner_l_rsquo_oeil','climat_meteo_temps_2',
  'clinique_hopital_1','cliquer','clitellate','cloche','clonage_clone','clou','club','cobra_1',
  'coca_cola_1','cocaine','coccinelle','cochon','cochon_sale','cochonnerie','cocktail','cocof',
  'cocon','coda','code_langue','code_secret','coelentere_1','coeur','coffre','coffre_fort',
  'cognac','cogner_coup','coiffeur_2','coin_2','col_romain','colere_1_fache_1_furieux','colere_2_gronder_1','colere_3_gronder_2',
  'colere_4_fache_2','collection_1','collection_groupe','college','collegue_1','coller_3','collier','colloque',
  'cologne_allemagne_1','colombe','colombie_1','colporter_repandre_des_rumeurs','colruyt_2','columbo_serie_televisee_et_personnage','coma_2','combattre_lutter_militant_2',
  'combien','comedie_1_drole','comedie_2','comedien','comete','comite','comite_reunion_1','commander',
  'comme_meme_1_pareil_2','commencer_debut_1','comment_1','comment_2_comment_faire','commentaire','commentaire_reseaux_sociaux','commerce','commissaire_de_police',
  'commissaire_delegue','commission','commode','commun','commun_accord','communaute','commune_1','communication_communiquer',
  'communion_1','communion_confirmation','communiquer','communiquer_dur','communisme','comores','compagnon','comparer',
  'compas','competence','competent_intelligent','competition','complementaire','complet_3_entier','complet_plein_1','complice_complot',
  'complique','comportement','compote','comprendre','comprendre_contenu_1','comprendre_contenu_2_dont_inclure','con_1','concentrer',
  'concentrer_1_se_pencher_sur','concept','concierge_1','conciliant_flexible_souple','conclusion','concombre_1','concours_course','concret',
  'condition','conditionnel_conjugaison_2','conduire','conference','conference_1_discours','confiance_se_fier','configuration_informatique','configuration_parametre_de_ls',
  'confirmer_decider_fixer_1','confiture','confondre_confusion_1_trouble','confondre_confusion_2','confortable','conge_3','conge_sabbatique','congo_2',
  'congres','conjugaison','connaitre','conquerir_envahir','conseil_d_administration_ca','conseiller','conseiller_prevenir','consequence',
  'conserve','conserver_garder_longtemps_1','consommer_energie','consonne','constellation','consulter_controler_faire_l_examen_inspecter_verifier','contacter_1','conte_1',
  'contenir_interieur','content','content_satisfaire','contexte','continent','continuer_1','contour_contourner_detour','contourner_les_regles_deroger_desobeir_1',
  'contraction_grossesse','contraire_inverse','contrat','contribution_impot_3','controle_interrogation_test','controle_parental','controle_technique_ct_2','convaincre',
  'convenir','convoquer_2','cookie','cool','copenhague_danemark','copier_imiter','copier_objet_dupliquer','coq_2',
  'corail_2','coran','corbeau','corbeille_poubelle','corde_1','corde_a_sauter','cordonnier','coree_du_nord',
  'coree_du_sud','coronavirus','corps','corps_du_garde','corpus','correct_exact_juste_net_2','correction_corriger_modifier','corriger',
  'corse_france','cosens_coop','costa_rica','cote_anatomie','cote_d_rsquo_ivoire_1','cotisation','cotiser','cou',
  'coude','coudre','coudre_couture','couille_2_oeuf_2_testicule_2','couille_3_oeuf_3_testicule_3','couler_1','couler_bateau','couleur',
  'couleuvre','couloir_rayon_magasin_1','coupable','coupe','coupe_de_cheveux_a_la_brosse','couper','couper_cheveux','couper_la_conversation_interrompre_occuper_1',
  'couper_ongles','couple','cour_recreation','courage_2','courgette','courir','courir_course_a_pied_faire_du_jogging_1','couronne',
  'courrier_electronique_e_mail_mail','cours','court','courtrai_ville','couscous_1','cousin_1','couteau','couter_paiement_payer_1',
  'couverture_objet_de_literie_drap','couverture_protection','covoiturage_1','cow_boy_western_1','crabe','cracher','craie_1','craindre_peur_2',
  'crampon','crane_tete_visage_3','crapaud_grenouille_1','cravate_1','crayon_1','createur_de_mode_styliste_2','creatif','creche',
  'credit_dette','cree_asbl_1','creer_1','creer_2_fonder','creme','creme_chantilly','creme_cosmetique_pommade','creme_produit_laitier_1',
  'crepe','crepes','creve','crever_pneu','crevette','crier','crier_hurler_1','criquet_1',
  'crise_cardiaque','crise_disputer_2','crise_serrer_la_ceinture_finance','critere','critiquer','croatie','crocheter','croire_1',
  'croiser','croiser_les_doigts_esperer','croix_1','croix_gammee_nazie_1','croque_madame','croque_monsieur_1','croquer_1','croquette',
  'crossfit_2','crustaces','cuba_1','cube','cueillir_2','cuillere','cuir_1','cuire_cuisiniere_1',
  'cuisine','cuisiner','cuisse_jambe','culotte_2','cultiver','culture','cunnilingus_1','cure_dent_1',
  'cure_pretre_1','curieux_1_curiosite','curieux_2','curriculum_vit_cv','cycle_de_vie','cycle_groupe','cycle_nature','cyclone_depression_meteo',
  'cyclone_ouragan_typhon','cygne','d_1','d_accord','d_accord_acquiescer_ok','d_rsquo_abord_premier_1','dactylologie','danemark',
  'dangereux','daniel','dans_1_an','dans_2_ans','dans_3_ans_1','dans_4_ans','dans_5_ans','dans_interieur_parmi',
  'danser','date','date_des_que_lorsque_quand_conjonction','dauphin','david','de','de_brouckere','de_lui_1',
  'de_moi_1','de_rien','de_toi_1','debarrasser','debat_1','debloquer','deborde','debout_2',
  'debrouiller','decapiter','decapsuleur','deceder_mort_mourir_2','decembre_2','decevoir_decu','dechirer_2','decimetre_dm',
  'decoller','decollete_1','decor','decorer_orner','decouper','decouverte','decouvrir_trouver','decrire_description_detail',
  'defaut_objet','defendre','defenseur_football','defi_1','definition_2','degonfler','degoutant_degueulasse_repugnant_1','degre_temperature',
  'deguster_1','dehors_exterieur_1','deja_2','delhaize','delhi_inde','deliberement_faire_expres','delicieux','demain_lendemain_1',
  'demander','demandeur_d_rsquo_asile','demanger','demarrer_vehicule','demi_heure','demi_moitie_2','demiheure','demissionner',
  'democratie','demolir_1','demon_diable','dent','dentifrice','dentiste_1','dents_de_requin_code_de_la_route','deontologie',
  'depanneuse','depasser','depasser_plus','dependre','depenser_frais_finance','deplacer_remettre_reporter_1','deposer_1','depoussierer',
  'depression_1','deprime','depuceler_se_faire_perdre_sa_virginite','depuis_1','deranger','dernier_3','des_fois','descendre_2',
  'desert','deshabiller','desirer','desole','desole_excuser_pardon_1','desordre','dessert_2','dessin',
  'dessin_anime','dessiner_2','dessous_inferieur_2','dessus','detruire','deux_point','deuxieme','devant_1',
  'developper','developper_photo','devenir','deviner_invention_trouver_une_idee','devisager','devoir_falloir_2','devoir_scolaire_2','devoirs',
  'diabete_2','diable','diabolo','dialogue','diamant','diapositive','diarrhee','dictature_pouvoir',
  'dictee_1','dictionnaire_2','diesel_1','diest_ville','dieu','different','difficile_2','diffuser',
  'digerer_2','dimanche','diminuer_reduire_1','dinant_ville','dinde_dindon_2','dinosaure_2','diplome_3','dire',
  'direct','directement','directeur_1','diriger_gerer','discrimination_1','discuter','disney','disney_disneyland_mickey_mouse_walt_disney_1',
  'dison_ville','disparaitre','disponible_libre_1','dispositif_intra_uterin_sterilet_1','disputer','disque_compact_cd','disque_dur_1','dissimuler_ne_pas_faire_savoir_ne_pas_montrer',
  'distribuer_1','divers_2','diviser_3','division_football_1','divorcer','divorcer_rompre_1','djibouti_1','docile_obeir',
  'docteur','docteur_medecin_1','doctorat_these','document_dossier','doigt_1','doigt_d_rsquo_honneur','dollar_1','domicile_maison_1',
  'domino','dommage_regretter','don_2','donner','doodle','doof_vlaanderen_vzw_asbl','dopage','dormir',
  'dormir_difficilement','dos_3','double_1','double_tennis','doubler_scolaire_recommencer_2','douche','doudou_nounours_1','douleur_4_souffrir',
  'doux','dracula_vampire','dragon','dragon_ball','draguer','drapeau','dreamland','dressing_penderie_placard',
  'drogue_1','droit_justice','droit_moral','droite_code_de_la_route','droite_localisation_1','droitier','drole','dubai_emirats_arabes_unis_1',
  'dublin_irlande','dur_1','durbuy_ville_2','duree_long_longtemps_1','durer_heure','dvd','dynamique_hyperactivite','dynastie',
  'dyslexie_2','dysphasie','dyspraxie','e_1','eau','ebay','ebisu_asbl','ebola',
  'echanger','echangiste','echarpe','echasseur','echec_echouer_rater_1','echec_perdre_competition_1','echelle','echinodermes_1',
  'echographie','eclipse_1','ecluse','ecole','ecole_et_surdite_asbl','ecole_le_tremplin','ecole_scolaire_3','ecolo_politique',
  'ecologie','economie_1_epargne','economie_2','ecosse','ecouter','ecouter_entendant','ecouter_sourd','ecraser',
  'ecraser_1_vaincre_2','ecrire','ecrire_ecriture_ecrivain_2','ecureuil','edbu_european_deafblind_union','edition','educateur_2','education_elever',
  'effacer_supprimer_2','effet_de_serre','efficace_meilleur_2','effondrement','effort','efsli_european_forum_of_sign_language_interpreters','efslidi','efteling',
  'egal_match_nul_meme_3','egal_mathematique','eghezee_ville','eglise','eglise_messe','egoiste_3','egorger','egratignure',
  'egypte_2','ejaculation','ejaculer_sperme_1','ejecter','el_salvador','elan','elan_logiciel','election_voter_1',
  'electricien_electricite_electronique_2','electron','elephant','eleve_2','elfe','elle_iel_il_lui','elles_eux_iels_ils','elvis_presley_1',
  'email','embarrasser','embetant_embeter_1','embouteillage','embrasser','embrasser_amoureux_1','embrayage','embryon',
  'emigrant','emirats_arabes_unis_eau','emission_1','empathie','empereur','emplacement_grammaire','employe','employer_utiliser_3',
  'emporter_de_l_argent_gagner_de_l_argent','en_1_heure','en_2_heures','en_3_heures_2','en_4_heures','en_5_heures','en_6_heures','en_7_heures',
  'en_8_heures','en_9_heures_2','en_distanciel_1','en_distanciel_2_teletravail','en_face_l_un_de_l_autre_face_a_face','en_forme','en_permanence_1','en_presentiel_face_a',
  'en_retard','en_voie_de','enceinte','enceinte_grossesse_3','encore_1','encourager','enculer_2','endometriose',
  'endormir','energie_ressource','energie_solaire_photovoltaique_1','energie_vitalite_ou_force','enfant','enfant_gosse_1','enfin_1','engager_participer_1',
  'engager_recruter','enlever_3','enqueter','enregistrer_2','enseignement','enseigner','ensemble_depuis_longtemps','ensemble_equipe_groupe_2',
  'entendant','entendre_1','entourer','entrainer_exercice','entre_2','entree_piece_hall_2','entree_plat','entreprise',
  'entreprise_industrie_societe_usine','entrer','entrer_penetrer','entretien_interview_1','enveloppe','envie','environ_moyen_1','environnement_societe',
  'envoyer','envoyer_un_sms_1','eolienne','epais_1','epaule','epee_escrime','epinard','episode_serie',
  'eponge','epoque','epoque_moderne_temps_modernes','epoux_femme_epouse_mari','epuise_vide_1','equateur','equateur_terrestre','equilibre_1',
  'equipe','equipe_groupe_personnel_1','equitation','erable_1','erasmus','erotique','erreur','erreur_faute_tort',
  'erythree_2','escabeau_escalier_1','escalade','escalade_du_conflit','escargot','escargot_cuisine_1','esclave','escrime',
  'espagne_espagnol','espece_type','esperanto','esperer_espoir','espion_1','esprit','essayer_1_tenter_test','essayer_2_s_rsquo_efforcer',
  'essayer_de_trouver','essence_mazout_petrole_1','essoufflement_3','est_1','estomac_2','estonie','etage_2','etagere',
  'etat_finance','etat_pays','ete','eteindre_1','eternuer_1','ethiopie','etiqueter_une_personne_1_insistance_sur_l_actif','etiqueter_une_personne_2_insistance_sur_le_passif',
  'etiquette','etoile_1_etoile_classification_2','etoile_2_etoile_classification_3','etoile_3_etoile_classification_4','etoile_classification_1','etoile_filante','etonne_surprise_emotion_1','etouffer_1',
  'etourdir','etourdissement','etranger','etre_capable_pouvoir_oser_oser_1','etre_epuise_s_rsquo_en_lasser','etre_orgueil_orgueilleux','etre_rigoureux_strict','etre_se_presenter',
  'etterbeek_ville','etudiant','etudiant_etudier_1','etudier_2','etymologie_original_origine','eud_european_union_of_the_deaf','eudy_european_union_of_the_deaf_youth','eupen_ville',
  'euro','europe_3','europe_europeen_1','euros','euthanasie_2','evacuer_fuir_s_rsquo_enfuir_2','evaluation_1','evangelique',
  'eve_temoins_de_jehovah','evenement','eveque','evere_ville_1','evier_lavabo','eviter','exagerer_1','examen',
  'excellent_magnifique_3_parfait','excite_hater_2','exclamer','excursion','exemple','exhibition','experience','expert_inspecteur_1',
  'expliquer_2','exposition_1','expression_faciale','expression_francais','exprimer','exterminer','extrait','f_2',
  'fable_2','fabophilie_feve_de_galettes_des_rois','fabriquer','facebook_2','facebook_messenger_1','facetime','fache','facile_1',
  'facteur_1','facture','faible_force_sante','faible_niveau','faible_physique','faillite_1','faim','faim_famine',
  'faineant_paresseux_3','faire_3','faire_l_imbecile_se_foutre_1','faire_la_vaisselle_1','faire_le_lit','faire_les_courses_1','faire_un_tour','faire_une_partie_de_jambes_en_l_rsquo_air_s_rsquo_envoyer_en_l_rsquo_air_1',
  'faisan','famille_2','fantastique','fantome_monstre','farine','fatigue','faucon','fauteuil',
  'fauteuil_a_bascule','fauteuil_roulant','faux_1','fax','fedasil_accueil_des_demandeurs_d_rsquo_asile','federation_2','fee_2','feliciter',
  'fellation_2','feminisme','femme','femme_de_menage_1','fenetre','fenetre_2_vitre','fer_a_cheval_de_trait','ferie_fete_3',
  'ferme','fermer','ferrari_2','fesse_1','festival','fete_2','feu','feu_d_rsquo_artifice',
  'feuille_1_papier_1','feuille_2','feuille_flore','feuilledarbre','feutre_marqueur','feux_les_signaux_lumineux_feux_des_signalisation','feve','fevrier_1',
  'ffsb_asbl','ffsb_jeunes','fiancailles','fiance_1','fiat_1','fidele','fidji','fier',
  'fievre_2','figue','fil_ligne_1','filet','filet_americain','fille','filleul_2','film',
  'fils_2','fils_de_pute','filtre','fin_mince','final','fini','finir_4_rompre_3','finir_5_foutre_rompre_4',
  'finlande','finta','fitness','fixer_2','flamand_flandre_neerlandais','flamant_rose','flash5_lsfb_asbl','flash_photo',
  'flash_super_heros','fleche_2','fleur_1','fleurus_ville_1','fleuve','floreffe_ville','floride_usa','flou_1',
  'fluo','flute','foetus','foie_2','foin','foire_kermesse_manege_1','fois','folie_fou_1',
  'fonce_sombre','fonction_mathematique','fonction_role_2','fonctionner','fonctionner_marcher','fond_organisation','fondre','fondu',
  'fontaine','foot','football_1','force_fort_1','forcement_obliger_2','ford_1','forem','forest_ville',
  'foret','foreuse_percer_perceuse','formation','forme','formule_1','formule_mathematique_1','fort','fort_boyard_1',
  'fort_incroyable_terrible','forum','fossile','foudre_orage_2','fouet','foulard_1','foulard_religion','foule',
  'four','fourche','fourchette','fourmi_1','foutu_panne_2','foyer_l_arc_en_ciel_chsm_asbl','fraction_mathematique','fragile',
  'fraise_2','framboise','franc','franc_belge','francais','francais_branche_1','francais_france_1','francais_signe_1',
  'france_2','francfort_allemagne','frapper_1_taper_1','frapper_2_gifler_taper_2','frapper_a_la_main_2','fraude','freiner_a_main','freiner_vehicule',
  'frelon','frere_1','frere_religieux','frigo_refrigerateur','frimer','frite_2','friterie','friteuse',
  'froid','froid_refroidir','fromage_3','front_anatomie_1','fruit','frustre','fuite_liquide','fumee_vapeur',
  'fumer','funambule','fusee_1','fusil_1','fute_malin_ruse_sournois_1','futsal_mini_foot','futur_anterieur_temps_de_l_indicatif','futur_simple_temps_de_l_indicatif',
  'g_1','gagner_reussir_vaincre_1_vainqueur_victoire','gala','galaxie','gallaudet','galoper','gambie','gamin',
  'gand_ville_1','ganshoren_ville','gant_2','gants','garage','garantie','garcon','garder_2',
  'garder_en_tete_retenir_1','gardien_football','gare_2','garer_parking_stationner_2','gargouiller','gasteropodes','gateau_1_patisserie_tarte','gateau_2',
  'gater','gauche_2','gauche_code_de_la_route','gaucher','gaufre','gaulois','gay_homosexuel','gaz_2',
  'gaza_palestine','gazon_herbe_pelouse_2','geant','gel','geler_glace_1','gembloux_ville_2','gendarme_1','gener_1_honte',
  'gener_2','general_1_global','general_2','generation','genereux','genou','genre_concept_socioculturel','gentil_2',
  'geographie_1','geometrie_1','georgie','gerard_depardieu_1','gestuno','geuze','ghana','ghlin_ville_1',
  'gilet_2','gilet_sans_manche','gille_de_binche','girafe','gitan_1','glace','glace_alimentation_1','gladiateur',
  'glisser','global','goinfre_2','golf','gomme','gonfler','gonfler_ballon','google',
  'goreact','gorge','gorille','gosselies_ville','gourmand_2','gout_2','gout_alimentation_gouter','goutte',
  'gouvernement','gps_1','grace_hollogne_ville','graine','graines','graisse_1','grammaire_1','gramme_g_2',
  'grand_de_grand_format','grand_excessif','grand_grand_en_hauteur','grand_grand_en_largeur_2','grand_immense','grand_mere','grand_parents_1','grand_pere',
  'gratter_demanger','gratter_jouer_au_loto','gratuit_3','grave','graver_cd_dvd','grec_grece_2','grele_1','grenade',
  'grenadine_sirop','grenier_1','grenouille','greve','griffer','grille','grille_pain_pain_grille_toast','griller_un_feu_rouge',
  'grimper_1','grincer_des_dents','grippe','gris_1','groenland','gronder','gronder_mettre_en_garde','gros_cou',
  'gros_penis','gros_physique','groseille_1','grossier','grossir','grotte','grue','gsm_2',
  'guatemala','guepe_1','guerir','guerre_1','guerre_a_l_attaque','gueule_taire_2','guide','guillemins_gare',
  'guinee','guitare','guyane_francaise','gymnastique_1','gynecologue_1','h_1','habiller_habit_linge_vetement','habiter_3',
  'habits','habitude_1','hache_1','haguette_carnaval','haie','hainaut_province_mons_ville_1','haiti','halal_1',
  'haleine','halloween','hambourg_allemagne_1','hamburger_2','hamster','handball','handicap_1','handisport',
  'hannut_ville','haricot_1','harpe','harry_potter_1','hasard','haschich','hasselt_ville_1','hater_1',
  'haut_1','hawai_usa','hebreu_israel_1','helicoptere','helsinki_finlande','hemisphere_nord','hemisphere_sud','hemorragie_saigner',
  'herbivore','herisson','heritier','herstal_ville','hesiter_2','heterosexuel','hetre','heure',
  'heure_de_pointe','hibou_2','hier','hippocampe','hippopotame_1','hirondelle_1','histoire_1','histoire_2_legende',
  'historique','hiver','hockey_sur_gazon','hockey_sur_glace','hollande_pays_bas_1','hollywood_usa','homard','home_maison_de_repos',
  'hommage_honneur','homme','homme_humain_masculin_2','homme_muscle','homo_erectus_2','homo_habilis_1','homo_sapiens','honda',
  'honduras','hong_kong_chine','hongrie_2','honnete','hopital','hoquet_roter','horaire_1','hormone',
  'horoscope_1','horreur_1','hot_dog','hotel_1','hotesse_steward','houffalize_ville','htva','huawei_1',
  'huile_1','huissier_de_justice_1','huitieme','humain','humide_mouiller','humour','huy_ville','hypocrite_1',
  'i_2','ia_intelligence_artificielle','ici','iconicite_iconique','idee','identite_sourd','idiot_1','idiot_imbecile',
  'ignore_le_laisse_le_ne_lui_ecoute_pas','ignorer_ne_pas_savoir','il_fait_beau_temps_2','il_fait_mauvais_temps_1','il_reste','il_y_a_1_an','il_y_a_2_ans','il_y_a_3_ans_1',
  'il_y_a_4_ans','il_y_a_5_ans','ile','ilyapas','image','imaginer_1','imam','imiter',
  'immediat_vite_2','immersion','immigrant','imparfait_temps_de_l_indicatif','implant_cochleaire_2','implant_contraceptif','important','impossible_1',
  'imprimante_imprimer','improviser','inchange_toujours_le_meme','inclusion','incompetent_je_suis_nul','incomprehension_malentendu','incroyable','inde_1',
  'independant','indicatif','indice_2','indien_1','indifference_tant_pis','indigene','individuel','indonesie',
  'infection','infinitif','infirmier','infirmiere_1','influencer','information_informer','informatique_ordinateur','informer',
  'infrabel','infrarouge','ingenieur','ingredient','innocent','inondation','inquiet','inquieter_3',
  'inscrire_2','insecte_2','insister_1','inspirer_air','instagram_1','installer','institut_ecole_de_berchem_sainte_agathe','instituteur_professeur_2',
  'institution','insulter','integration_1_personne','integration_plusieurs_personnes','intelligent_1','intelligent_plus_pratique','interdire_1','interdit',
  'interessant_1','interet_finance','internat','international','international_sport','internet','interprete','interrogation_interroger_question_3',
  'intersectionnalite_1','intervenir','intestin_grele','intoxication_alimentaire_1','inventer','inventer_n_rsquo_importe','inverse_1','investir',
  'inviter','iran','iraq_2','irhov_ecole_pour_les_sourds_2','irlande','irlande_du_nord','iron_man','ironique',
  'irsa_ecole_pour_les_sourds','isabelle','islam_mosquee_musulman_2','islam_musulman_1','islande_1','isolation_materiaux','isole','israel_2',
  'italie_italien_2','itinerants_personnes_sans_abri_sdf_sans_domicile_fixe_1','ivre','ivre_soul_1','ixelles_ville_1','j','j_rsquo_en_ai_marre_2','jacques_prenom',
  'jacuzzi','jaloux','jamaique','jamais','jamais_vu','jambes_ville_1','jambon_1','janvier_1',
  'japon_japonais_nippon_3','jardin','jarretiere','jaune_1','je_m_en_fiche_je_m_en_fous_3','je_moi','je_n_en_peux_plus_peter_des_plombs','jean_claude_van_damme_2',
  'jeans','jeep_2','jesus','jette_ville','jeu_de_billes','jeu_de_societe','jeu_jouer_jouet_2','jeu_video',
  'jeudi_2','jeune','jeux_olympiques_jo','jeuxolympiques','job_etudiant_2','jongleur','jordanie','joseph',
  'jouer','joueur_football','jouir_sexe','jour','journal','journaliste','journee_1','journee_mondiale_des_sourds_jms',
  'joyeux','judo','juge_juger_jury_justice_tribunal','juif_1','juillet','juin_2','jules_cesar','jumeau_2',
  'jungle','jupe_1','jupiter_planete','jurer_promettre','jury_1','jus_d_rsquo_orange','jusqu_rsquo_au_bout','jusque_1',
  'juste','justifier_motif_raison_1','k_1','kaki_fruit','kangourou','karate','karting','katana',
  'kayak','kazakhstan','kenya','ketchup','kia','kiev_ukraine','kilogramme_kg_1','kilometre_km',
  'kilometre_par_heure_km_h','kinesitherapeute','kippa','kiwi','klaxon','koekelberg_ville','koh_lanta_2','kosovo',
  'kot','koweit','l','l_rsquo_ecole_integree_ecole_pour_les_sourds_1','l_rsquo_epee_asbl','l_rsquo_escale_asbl','la_1','la_bas',
  'la_bastide_asbl','la_cle_asbl_1','la_panne_ville','laboratoire','lac','lacher','lada','laeken_ville',
  'laine','laisser','laisser_tomber','lait_1','lama','lame','lampe_1','lampe_de_chevet',
  'lange','langue_1','langue_anatomie','langue_des_signes_noetomalalier_signe_signer','laos','lapin_2','lard','large',
  'large_d_rsquo_esprit','larme','lasagne','latin','latitude','latte_1','laurent_clerc','lausanne_suisse',
  'lave_linge_machine_a_laver','laver','laver_nettoyer_2','le_caire_egypte','le_foyer_les_mains_ardentes_asbl','leche_cul','lecher_animal','lecher_personne',
  'lecon','lecture','legal_legislation_loi_1','leger_3','legitime_2','lego','legume_1','lemurien',
  'lent_1','lentille_de_contact','leopard','leopold_ier_roi_de_belgique','leopold_ii_roi_de_belgique_1','leopold_iii_roi_de_belgique','les_dates_sont_deja_prises','les_deux',
  'les_echecs_jeu_d_rsquo_echecs_1','les_mains_ardentes_asbl','lesbienne_2','lesotho','lettonie','lettre','lettre_caractere_de_l_rsquo_alphabet_2','lettre_communication_ecrite',
  'lettre_enveloppe','leverdujour','levier_de_vitesse','levure','lexique_liste','lezard','lgbtqia','liban',
  'libellule','liberia','libramont_ville_1','libye','licence_informatique','lidl_1','liechtenstein','liege_ville',
  'lien_unir_1','lievre','ligature_des_trompes_2','lille_france','limace','lime','limite_1','limonade',
  'lion_3','lire','lisbonne_portugal','liste','lit_2','litchi','litre','lituanie',
  'livre','local_foyer_des_sourds','location_louer_2','logiciel_2','logo','logopedie_orthophonie_3','loin','londres_royaume_uni_1',
  'long','long_longtemps_3','longitude','losange_2','louis_2','louis_de_funes','loup','loupe',
  'lourd_2','louvain_la_neuve_ville_2','lpc_langage_parle_complete','lsfb_asbl','luigi','lumiere_2','lunch_garden','lundi_1',
  'lune','lunettes','luxe','luxembourg_1','lynx','m','m_038_m_rsquo_s','ma_mes_mien_mon_2',
  'macedonie','mache_salade_de_ble','macher','machine_2','machine_a_coudre_1','macho','macintosch_mac_2','macon',
  'madagascar','madame_3','mademoiselle_2','madou_metro_de_bruxelles','madrid_espagne','maffle_ville','mafia_1','magasin',
  'magicien_magie_magique_4','magnifique','mahatma_gandhi_2','mahomet_musulman','mai','maigre_mince_1','maillot_feminin','maillot_masculin',
  'main_2','mains','maintenant','mais','mais_1_sauf','maison','maison_des_sourds_de_bruxelles','majorite_1',
  'mal','mal_au_ventre','mal_de_tete','mal_signer','malade','malade_1_patient','maladroit_2','malaisie',
  'malawi','malentendant','malheureux','mali_1','malines_ville','malmedy_ville','malno_indonesie','malte',
  'maltraitance_torturer','maman','maman_maternel_mere_1','mamelon_teton_2','mammifere','manage_ville','manche_tennis','mandarine',
  'mandat','manger','manhattan_usa','maniaque','manifestation','manipuler','manivelle','manneke_pis',
  'mannequin_2','mante_religieuse','manteau','maquillage','maquiller_1','marathon','marbre_1','marche_3',
  'marche_en_famenne_ville','marcher','marcher_en_arriere_reculer_revenir_en_arriere','mardi','mariage','mariage_noce','marie','marie_prenom',
  'marie_se_marier','marin_2','marionnette','marlboro','maroc_1','marquage_au_sol','marque_3','marraine_1',
  'marron','mars_4','mars_planete','marseille_france','marteau_2','masque','massacre','massage_masser',
  'masse_poids','massepain','master_1','masturber_femme','masturber_homme_1','mat','match','match_magasin',
  'match_nul_1','match_tennis','materiel','maternelle','mathematique_4','mathilde_reine_de_belgique','matiere','matin',
  'matrice_uterus','maturite','mauvais_1','mauvais_perimee_vilain_1','mauve_violet_1','maximum','mayonnaise_3','mazout_petrole_4',
  'mcdonald_rsquo_s_1','mecanicien_plombier','mechant_2','mechant_vagabond_voyou','medaille','media','media_markt_magasin','mediateur',
  'medicament_2','meduse','melanger','melbourne_australie','melon','membre_3','memoire','menage_2',
  'mendiant','menopause_1','mensonge_mentir','menthe','menton','menu','menuisier','mer_plage_2',
  'mercedes_benz_1','merci_beaucoup','merci_remercier','mercredi_2','mercure_planete','merde_1_zut_4','merde_2_zut_3','mere_teresa',
  'message','mesurer_1','metaphore_etre_frais','meteorite','methode','metisse','metre_1','metro',
  'mettre','mettre_a_la_porte_renvoyer','mettre_en_garde','meuble_1','meuse','mexique_3','miami_usa','michael_jackson',
  'micro_ondes','microbe','microscope_2','microsoft_excel','microsoft_powerpoint','microsoft_teams','microsoft_windows','microsoft_word',
  'midi','miel_1','mieux','mignon','migrant','milan_italie','milieu','mille_pattes',
  'milliard_2','milliardaire','millimetre_mm','million_1','milou_bd_8211_tintin','mime','mime_pantomime','mine_2',
  'mini','minimum_2','ministre_2','minitel','minorite_2','minuit_1','minute','miroir_1',
  'mise_a_jour_2','miss','mite','mitrailleuse','mitsubishi','mobylette','mode_2','modele',
  'modem','moi_meme_2','moine','moins_cher_pas_cher','moins_quantite','moins_soustraction_2','mois','moldavie_1',
  'molecule_2','molenbeek_ville_1','mollusques','mon_oeil','monaco_1','monde_1','mongolie_1','monsieur_2',
  'montage','montagne_2','montegnee_ville_2','montenegro_1','monter_1','montgolfiere','montre_1','montreal_canada',
  'montrer_1','moodle','moquer','morceaux','mordre','morse_animal','moscou_russie_1','mot_1',
  'moteur_1','motiver','moto_2','motocross','mou','mouche_2','mouche_tse_tse_1','mouchoir',
  'mouette','moule','moulin','mouscron_ville','mousse','mousse_au_chocolat','mousse_de_savon','moustache',
  'moustique_2','moutarde','mouton_1','moyen_age','mozambique','mozette','muet_1','mug',
  'muguet','multiple_de_femmes','multiplication','mur','mure','muscle','musee','musee_du_louvre',
  'musique','musk_asbl','mutuelle_3','mygale','myriapodes_2','myrtille_2','mystere','n',
  'nager_natation_piscine','naif','nain','naitre','namibie','namur_ville_2','napoleon','nappe',
  'narcose','national','nature','naviguer','ne_pas_aimer_detester_3','ne_pas_avoir_peur_1_trop_facile','ne_pas_avoir_peur_2','ne_pas_comprendre_tout',
  'ne_pas_ecouter_1','ne_pas_etre_capable_de_faire','ne_pas_finir_pas_encore','ne_plus_longtemps_2','neandertal','negatif_parole_2','negation_grammaire','neige',
  'nelson_mandela','nemo_disney','nepal','nepasaimer','neptune','nerveux_2','netflix_1','nettoyer_1',
  'neuf_nouveau_2','neutre_1','neutron','neuvieme_2','neveu_1','new_york_usa','nez','nicaragua',
  'nid','niece','niger','nigeria','nike','nintendo','nintendo_switch_1','niveau',
  'niveau_outil_2','nivelles_ville','noel_4','noeud_papillon','noir','noir_couleur_de_peau_1','noisette_1','noix_1',
  'noix_de_coco','noix_de_muscade','nom','nom_commun','nom_de_signe','nom_propre','nom_s_rsquo_appeler_1','nombre',
  'non_ce_n_rsquo_est_pas_ca','non_merci_1','non_merci_vulgaire_2','non_refuser','nonne_soeur_religieuse','nord_1','normal_1','norme',
  'norvege_1','notaire','note','noter_1','noter_2_remplir_un_formulaire','notre_nous','nourrir','nourriture',
  'nouveau','nouvel_an','nouvelle_zelande_1','novembre_1','noyer_1','nu_2','nuage','nucleaire',
  'nuit_1','nuit_blanche','nul_1','numerique','numero_3','nuque_2','o','objectif_photo',
  'objet','obliger_1','obtenir_recevoir','occasion','occasion_evenement','occuper_2','occuper_reserver_reserver_prendre','ocean_2',
  'oceanie','octobre_1','odeur','odeur_sentir_odorat_3','oeil','oeil_au_beurre_noir','oeuf_1','oeuf_a_la_coque',
  'officiel_1','offrir_1','ognon_oignon_1','oie_2','oignon','oiseau_1','olorotitan','oman',
  'ombre_2','omelette','omnipresent','on_verra_regarder_voir_2','oncle','ongle','oovoo','opel_1',
  'oppose','option','or_2','oral_articulation','orange','orbite','ordinateur','ordinateur_portable',
  'ordonner','ordre_alphabetique','oreille_1','organigramme','organiser','orge','orientation_parametre_de_ls','origine_nation_sang_originel',
  'orthographe','ostende_ville_1','otage','otarie_2','otite_1','ou','ou_1_2','ou_2_2',
  'oublier','ouest_1','ouf_rassurer_soulager_2','ouganda','oui_1_affirmation','oui_2_affirmation_emphatique','ouragan','ours',
  'ours_polaire','oursin','outil','ouvre_boite','ouvrier_2','ouvrir_1','ouzbekistan','ovaire',
  'ovni_objet_volant_non_identifie_1','ovni_objet_volant_non_identifie_2_soucoupe','p_1','pablo_ruiz_picasso','pachycephalosaure','padel','page_1','paille_ustensile',
  'pain','pain_tartine_2','paire_1','pairi_daiza_paradisio_2','paix_1','pakistan_1','palais','palaos',
  'pale','palestine_1','palme','pampers','pamplemousse','panama','panda','panier',
  'panne_1','panneau_de_signalisation_2','pansement','pantalon','pantoufle_2','paon','papa','papa_paternel_pere_1',
  'pape','papier_1','papier_toilette_1','papillon','papoter_prendre_la_nouvelle_1','paques_1','paquet_de_cigarette_1','par_1',
  'par_coeur','parabole_radiotelescope_satellite','parachute','paragraphe','paraguay','parallele_mathematique','paralyse','parametres_composante_du_signe',
  'parapluie_2','parasaurolophus','parasol','parc','parc_du_cinquantenaire_2','parce_que','pardon_2','pare_chocs',
  'pare_feu_1','parent_2','parents','parfait','parfois_1','parfum_3','parfumer','parier',
  'paris_france_1','parlement_2','parler_1_parole_2','parler_2','parler_3_parole_1','parler_dans_le_dos','parrain_1','partager',
  'parterre_sol_1','parti_socialiste_1','partie','partir','partir_s_rsquo_en_aller_3','partout','partout_sur_le_corps','pas_confirme',
  'pas_de_probleme_1','pas_de_probleme_pas_de_souci_2','pas_interessant_2','pas_rien_1','pas_vouloir','passage_pour_pietons','passe','passe_anterieur_temps_de_l_indicatif',
  'passe_compose_temps_de_l_indicatif','passe_muraille_asbl','passe_simple_temps_de_l_indicatif','passeport','passer_traverser_1_point_de_vue_interne','passer_traverser_2_point_de_vue_externe','passion','pasteque',
  'pasvouloir','patch_contraceptif','patch_nicotine','pate_spaghetti','pates','patient','patinage','patins_a_glace_patins_a_roulettes_1',
  'patins_a_roulettes_2','patron_2','patte','patte_insectes','paul_prenom','paume','paupiere','pause_2',
  'pauvre','pauvre_argent','pauvre_pitie_1','payer_3','payer_par_mois_1','pays','pays_de_galles','paysan',
  'peau_2','peche_religion_2','pecher','pecher_trouver_la_personne_en_amour','pedaler','pede','peigne','peignoir',
  'peindre_peintre_peinture_2','peindre_peintre_peinture_pinceau_1','peket','pekin_chine','pelle','pelleteuse','pellicule_photo','peloter_seins_1',
  'penalty_2','pendant','pendre_suicide_2','penetrer_sexe','penis_zizi_2','penser','penser_songer','pension_hebergement',
  'pension_retraite_1','pentecote','pepinster_ville','perdre_1','perdre_competition_3','perdre_depite','perdre_la_motivation','perdrix',
  'perdu','pere_noel_1','perforeuse','perle_lsfb_asbl','permis_de_conduire','perou','perroquet','personne',
  'personne_etre_humain','personnel_prive_2','pervers_1','petanque','petard','peter_1','petit','petit_ami',
  'petit_de_petit_format','petit_petit_en_hauteur','petit_petit_en_largeur','petit_pois_2','petit_serre','petit_vraiment_petit_en_hauteur','petit_vraiment_petit_en_largeur','petit_zizi_1',
  'petitdejeuner','petition','peu_2','peugeot_1','peur','peut_etre_1','phantasialand','pharaon',
  'phare','phare_vehicule','pharmacie','philippe_2','philippe_ier_roi_de_belgique_2','philippines_2','philips_marque_2','philosophie_3',
  'phonologie_langue_des_signes_1','phonologie_voix','phoque','photo','photo_photographie_2','photocopier','photosynthese','phrase_ecrit',
  'phrase_langue_des_signes','physique','piano','pic_vert','piece_habitation_1','piece_monnaie_2','piece_objet_1','pied',
  'piege_2','pierre_prenom','pierre_rocher_2','pierrot_carnaval','pieton','pieuvre','pigeon_2','pilote_d_rsquo_avion',
  'pilote_informatique','pilule','piment_piquant_2','pince_a_linge','ping_pong_tennis_de_table_1','pingouin','pinocchio_disney_1','pipe',
  'pipi','pique_carte_2','pique_nique_1','piquer_1','piqure_2','pirate','pire','pisang',
  'pistache_1','piste_cyclable','pistolet_arme_a_feu_1','pistolet_type_de_pain','pita','pizza','place_sainte_catherine_bruxelles','placenta',
  'plafond','plafonner_2','plage','plaindre','plaisir','plan_1','plan_a_trois','planete',
  'plante','planter_2','plaque_d_rsquo_immatriculation','plaquette_de_frein','plaquette_sang','plasma','plastique_2','plat_forme',
  'plat_mets_ou_nourriture','platre_de_bras','playmobil_1','pleurer','pleuvoir_pluie_2','plier','plongee','plongeon_plongeur',
  'pluie','plumier','pluriel_plusieurs','plus','plus_en_plus','plus_jamais','plus_quantite','plus_que_parfait_temps_de_l_indicatif',
  'plus_tard_duree','plusieurs','plutot_mourir_que_8230','pneu_1','pneu_roue_2','pneu_toute_saison','poche','poele',
  'poeme_poesie_poete','poignarder_tuer_3','poignet','poil_1','poil_torse_homme_animal_2','point_score_1','point_virgule','pointage',
  'pointu_2','poire_1','poireau_1','poison_2','poisson','poisson_cuisine','poivre','poivron',
  'polaroid','poli_1','politique','pollen','pollution','pologne_1','polypes_marin','pomme',
  'pomme_de_pin','pomme_de_terre','pompe','pompier','pondre','poney','pont','popcorn',
  'porc','porcelaine','pornographie','porsche','portable','porte_3','porte_jarretelles','portefeuille',
  'porter','porto_rico','portugais_portugal_2','positif','post_it_1','poste','pot_1','pou_puce_1',
  'pouce','poudre','poule','poule_poulet_2','poumon','poupee','pour_2','pour_ca',
  'pourcentage_1','pourquoi','pourquoi_pas_1','pourrir','poursuivre','pousser','pousser_dent','pousser_flore',
  'poussette','poussiere','poussin','pouvoir','pouvoir_liberer_1','pouvoir_possible','poux','prague_tchequie',
  'praline_2','pratique','precis','precompte_immobilier','preferer','prehistoire_2','prelevement','premier_principal_2',
  'prendre_sur_le_fait_insistance_sur_l_actif','prendre_sur_le_fait_insistance_sur_le_passif','prenom','preparer','prerequis','pres_de','presenter','preservatif_1',
  'president','presque','presse','presser','presser_comprimer','pret_emprunt_preter_1','pret_prepare','preter',
  'preuve_1','prevenir','prevention_1','prevoir_1','prier','primaire_2','prime_1','prince',
  'princesse','printemps_2','priorite','priorite_a_droite','prise_de_courant','prison_1','prive_3','privilege',
  'prix_1','prix_nobel','probleme_souci_1','prochain','prochain_fois','procuration','produire','professeur',
  'professionnel','profil','profiter','profond','programme','progresser','projet','prolonger_1',
  'pronom_personnel_langue_des_signes','proposer','propre','proprietaire_1','prostate','protection_subsidiaire','proteger_de_quelque_chose','proteger_quelqu_rsquo_un_d_rsquo_autre',
  'proteine','protestante','proton','province_2','provision_reserver','provisoire_temporaire','provoquer','proximus_1',
  'prudent_1','prune','psychiatrie','psychologie','psychologue','pteranodon','pub','public_2',
  'publicite_2','puer_1','puissant_1','puit_2','pull_a_col_roule','pull_over','punaise_attache','punir_3',
  'puree','putain_pute','puzzle','pyjama_1','pyramide','q_1','qatar','qu_il_y_a_que_se_passe_t_il',
  'quadrille_1','quadruple','quand_1','quand_meme_1','quart_1','quatrieme','que_comparaison_1','que_faire',
  'quebec_canada_2','question','questionnaire_1','queue','qui_1','quitter_scolaire','quoi_2','quotidien_2',
  'r_2','rabbin','race_1','racine_2','raciste_1','raclette','raclette_savoyarde','raconter_1',
  'radar','radio','radiographie','radis','raie_poisson','raisin','raler_1','rallye',
  'ramadan_1','ramasser','rambo','rampe_de_skate','randonnee','randonner','ranger_1','rapace',
  'rapide_vite_1','rapide_vitesse','rappeler_1','rapport','rare','rasage_electrique','raser','rassure',
  'rat_2','rateau','rater','rattraper_recuperer','realite_reel_sincere_veritable_verite_vrai','rebelle','recemment','reception',
  'recette','recevoir','reclamer','recommencer_3','reconnaitre_reconnu','record','refaire_recommencer_repeter_2','reflechir_2',
  'reflexe_2','refugie','regarder','regarder_attentivement_voir_3','regarder_voir_1_vue','regie','regime_3','region_2',
  'registre_langue','regle_instrument_de_mesure','regle_menstruation','regle_reglement_1','regretter_eprouver_le_sentiment','regulier','reine','reine_roi_royal_royaume_1',
  'rejoindre','relais_signes','relation','religion_1','rembourser','remorque','remplacer','remplir',
  'renard','renault_1','rencontre','rencontrer','rendez_vous_1','rendezvous','rendre_visite_a_quelqu_rsquo_un','rene_magritte',
  'renouer','renseigner_1','repandre','reparer','reparer_restaurer','repasser_le_linge','repetition','repondeur',
  'repondre','reportage_1','repos_reposer','reptile_2','repu_1','republique','republique_dominicaine','repugnant_degoutant_incapable_de_toucher_1',
  'reputation_1','requin','reseau_informatique','reseau_social','reserve_naturelle','respecter_1','respirer_1','responsable_2',
  'ressembler_sembler','restaurant','rester','resultat','retour','retour_retourner_1','retroviseur','reunion_2',
  'reveil','reveiller','revenir','rever','reviser','revision','revolte','rez_de_chaussee',
  'rhinoceros','rhubarbe','rhume_1','riche','ride','rideau','rien_2','rien_a_faire',
  'riga_lettonie','rigoler_rire_2','rincer','rio_de_janeiro_bresil','risquer','rituel_1','riviere_1','riz_2',
  'robe','robin_des_bois','robinet_2','robot','robot_menager','rochefort_ville','roi','roland_garros',
  'role','rollers','rolls_royce_1','romain','rome_italie','rompre_2','rond_point_1','ronger_les_ongles',
  'rose_1','rose_flore','rouge_2','rouge_a_levres','rouiller','rouleau_a_patisserie','rouleau_de_bandage','rouler',
  'roumanie_1','route','route_rue_2','roux','ruche_1','rue','rugby','ruisseau',
  'rumeur_1','russe_russie_3','rwanda','ryanair_4','rythme','s_2','s_rsquo_ennuyer','s_rsquo_entailler_les_veines_du_poignet',
  's_rsquo_evanouir_tomber_dans_les_pommes','s_rsquo_il_vous_plait_svp_1','sa_ses_sien_son_2','sabena','sable','sabot_2','sabot_ongle','sabre',
  'sac_1','sac_a_dos','sac_a_main','sac_banane','sadomaso','safari_navigateur','sage','sage_femme_1',
  'saigner_du_nez','saint_2','saint_gilles_ville_1','saint_josse_ten_noode_ville_1','saint_marin_san_marino','saint_nicolas_1','saint_nicolas_ville','saint_petersbourg_russie',
  'saisir','saison_3','salade','salade_de_roquette','salami_2','salarie_salarie','sale','sale_sel_1',
  'saliere_sel_2','salle_1','salledebain','salon_1','salon_heysel','salope_1','salopette','salvador_dali',
  'sambre_riviere','samedi','samourai','samsung','sandwich','sandwich_au_beurre','sang','sang_froid',
  'sanglier','sangloter','sans_3','sante','sapin','sarajevo_bosnie_herzegovine','sardaigne_italie_1','saturne',
  'sauce','saucisse','saucisse_saucisson','saucisson','sauna_1','sauter_avancer','sauter_rester','sauterelle_1',
  'sauvage_1','savane','savoir','savoir_insistance_sur_le_sujet','savoir_insistance_sur_le_verbe','savon','savon1main','scampi_1',
  'scanner','schaerbeek_ville_1','schizophrenie_1','scie','sciences_3','sclessin_ville','scorpion_1','scout_1',
  'scout_baladins_3','se_charger_2','se_coucher_sante','se_depecher_1','se_laver_2','se_lever_1','se_lever_3_se_reveiller_2','se_pencher',
  'se_renfermer_sur_soi','se_reveiller_1','se_sentir_negativement','se_tromper_3','se_venger_1','seau','sebalader','sebrosserlesdents',
  'sec','sechoir','secondaire','seconde','secretaire_1','secte','secteur_section','securite',
  'seducteur','sefaireavoir','seffondrer','sein_3','seisme_tremblement_de_terre','sel','selfie','semaine',
  'semer','senegal','sens','sens_unique_1','senseo','sentiment','sentir_percevoir_3','separer',
  'septembre_1','septieme','serbie','sereposer','serieux_1','seropositive_hiv','serpent','serpent_a_sonnette',
  'serre','serrer_exercer_une_pression_1','serrer_la_main_2','serveur_informatique','serveur_restaurant_ou_cafe','service','service_phare','serviette',
  'serviette_de_bain','seul_singulier_solitaire_unique_1','seul_solitaire_unique_3','severe_1','sexe_sexuel','shampooing','shooter_tirer_football','short',
  'si_1','sicile_italie','sida_1','siecle','signaire','signature','signe_de_croix','signer',
  'signwriting','sigra_lsfb_asbl','silence_2','simple','singapour_2','singe','sionisme','sirene_creature_mythologique_1',
  'sisb_info_sourds_de_bruxelles_asbl','sisw_asbl','site','site_site_internet_ou_web','situation_2','sixieme','skateboard','ski',
  'ski_de_fond_1','skier','skype','slovaquie','slovenie','sms','snapchat','snob',
  'social_1','socialisme','societe_entreprise','sodomie','soeur_2','soif_1','soigner','soignies_ville_2',
  'soir_1','solde_2','soleil_1','solidarite','solide','solution','somalie','sommet',
  'sonde_spatiale_2','sonner','sonnerie_ecole','sony','sorciere_1','sorteur','sortie_autoroute','sortir',
  'souffler','souffrant','soumis','soupe','source_eau_2','sourcil','sourd','sourire',
  'souris','sous','sous_marin','sous_titre_1','soustitres','soutenir','soutien_gorge','souvenir',
  'souvent','spaghetti','special_2','speculoos_1','speedster_bateau','spiderman','spongiaires','sport_1',
  'spray_1','sprite','squash_2','squelette_1','sri_lanka','stade','stage_2','standard_club_de_football_1',
  'station_lavage','statistique','statue_2','statut','stavelot_ville','steak','stethoscope','stresser_1',
  'string','structure_syntaxe_1','studio_1','style','stylo','subjonctif_conjugaison','subside_2','sucer_son_doigt',
  'sucette','sucon_ecchymose','sucre','sud_1','suede_1','suer_transpirer_2','suicide_1','suisse_3',
  'suivant','suje_asbl','sujet_theme_titre','super','super_heros','super_mario_bros_2','superieur','superman',
  'supporter_admettre','supporter_fan_2','supporter_soutenir','sur_1','surdimobile_asbl','surface','surprise','surprise_evenement_inattendu_1',
  'surveiller_2','survivre_1','sushi','suspendre','sydney_australie','syllabe','syllabus_enseignement','symbole',
  'sympa','syndicat','syrie_1','systeme','systeme_anatomie','systeme_solaire','t_4','t_shirt_1',
  'ta_tes_tien_ton_1','tabac','tabacologue','table','tableau','tablette','tabou_2','tache',
  'tache_salissure_2','taco','tadjikistan','taille','tailleur','taire_1','taiwan_chine','taliban',
  'talon_2','tambour','tampon_dispositif_absorbant','tandem','tante_1','tantot_1','tanzanie','taper_le_clavier',
  'tapis','taquiner','tard','tartiflette','tasse','tatouage','taupe','taureau',
  'taxe_4','taxi','tchequie','tchetchenie_russie','tda_trouble_du_deficit_de_l_rsquo_attention','technique_technologie_2','teheran_iran','teindre_teinture',
  'tel_aviv_israel','telecommande_zapper','telegram_1','telephone_1','telephoner','teleski','television','television_tv_1',
  'temoignage_temoin_1','temoin','temoins_de_jehovah_1','tempe_2','temperature','temperature_descend','temperature_monte','tenir',
  'tennis_1','tentative_de_meurtre','termite_1','terrain','terrain_terre','terrasse_2','terre_planete','terroriste',
  'tesla_1','tete_tourne_vertige','tete_visage_2','tetine','tetu_2','texas_usa','texte','tfe_travail_de_fin_d_rsquo_etudes',
  'tgv_train_a_grande_vitesse','thailande','the_1','the_2_tisane','theatre','thermometre','thyroide_3','tibet_chine',
  'tic','tiede','tigre','tiktok_1','tilleur_ville','timbre_2','timide','tintin_bd',
  'tique','tir_canon_tir_de_force_tir_fulgurant_football','tiramisu','tirer_fusil_1','tiroir_1','tissu_1','titulaire_tuteur','toboggan',
  'togo','toi_tu','toile_d_rsquo_araignee','toilette_wc_3','toilettes','toit_2','toit_ouvrant_vehicule','tokyo_japon',
  'tomate_2','tomber','tomber_a_la_renverse','tomber_objet_2','tombola_4','tondeuse','tongres_ville','toque',
  'torah_3','toronto_canada','tortue','tortue_de_mer','tot_2','total_1','toucher_1','toujours',
  'toupie','tour_architecture','tour_batiment','tour_de_babel','tour_eiffel','tourisme_2','tournai_ville','tourner_a_droite_1',
  'tourner_a_gauche','tournesol','tournesol_bd_8211_tintin','tournevis','tournoi','tous_les_deux_1','tous_les_dimanches','tous_les_jeudis',
  'tous_les_lundis','tous_les_mardis','tous_les_mercredis_2','tous_les_mois_une_fois_par_mois','tous_les_samedis','tous_les_vendredis','toussaint','tousser_toux',
  'tout_2','tout_de_suite','tout_droit_2','tout_est_en_ordre','tout_le_monde_2','toyota','trace_figure','tracteur',
  'tradition','traduction_traduire_2','train_2','trainer','traiteur','trajet_transport_1','tram_3','tranche',
  'tranchee_militaire_2','trancheuse','tranquille','transfert_de_situation_ts','transfert_de_taille_et_de_forme_ttf','transfert_personnel_tp','transformer','transgenre',
  'transparent_1','transport_2','transporter_3','traumatise_1','traumatisme_cranien','travailler','travaux_2','trefle_carte_1',
  'trembler','trepied','tres_competent_tres_intelligent','tres_facile_jeu_d_enfants_4','tresorerie','triangle_1','triathlon_1','triceratops',
  'tricher_1','tricoter','trimestre','triple','trisomique','triste_2','troisieme_1','trombone',
  'trompe','trompette','tronc_d_rsquo_un_arbre_1','tronc_du_corps_humain_1','trottinette_1','trottoir','trou_3','troubles_dys',
  'turkmenistan','turnhout_ville','turquie','turquoise_1','tuyau_1','tuyau_d_arrosage','tva','twitter',
  'twix','typique','tyrannosaurus_rex','u_1','uccle_ville','uf','ukraine_2','ultraviolet_uv',
  'une_autre_fois','unicef','univers','universite','uranus','urbex','urgent','uruguay',
  'usb','user','v','va','vacances_2','vaccin_2','vache','vagin_vulve_3',
  'vague','valais_suisse','valencia_venezuela','valeur_valoir','vallee','vampire','vanille_4','vapeur_train',
  'varsovie_pologne','vase_2','vaste','vatican','veau_1','vegan_1','vegetal','vegetalien',
  'veine','velo','velours','vendre','vendre_vente_1','vendredi','venezuela','venir',
  'vent','ventre','venus','ver','ver_de_terre','veranda','verbe','verglas',
  'vernis_a_onglets','verre','verre_contenant','versailles_france','verser','vert_1','vertebres_1','verviers_ville',
  'vessie','veste','veterinaire_1','veuf','vexe','vexer','viande','vibrer_1',
  'vice_versa','victime_2','victor_hugo','vide_3','vie','vie_vivre_1','vielsam_ville','viens',
  'viet_nam_1','vieux','vignette_mutualite','vikings','villa_1','ville','vin','vinaigre_1',
  'vincent_van_gogh','viol_1','violence_1','violon','violoncelle','vip_1','vipere_1','virgule',
  'virus_1','vis','visa_carte_bancaire','visa_document_de_voyage_1','visio','visiter','visuel','vitamine',
  'vite','vitrine','vivant','vocabulaire_1','voici','voie_1','voila','voir',
  'voiture','volcan_1','voler','voler_ailes','volkswagen_vw','volkswagen_vw_coccinelle','volleyball','volonte',
  'volume_dimension_physique','volvo','vomir','votre_vous','vouloir','vouloir_objectif','voyage_1','voyage_pays_en_pays_2',
  'voyelle','vraiment','vulgaire_1','w_1','walibi_1','wallonie_belgique_1','waremme_ville','washington_dc_usa',
  'wasli_world_association_of_sign_language_interpreters','waterloo_ville_1','watermael_boitsfort_ville','waterpolo','wavre_ville_1','webcam_1','week_end_1','wetransfert',
  'whatsapp_1','whisky_1','wi_fi_1','wok','woluwe_ville_1','wonder_woman','workshop_direct','wow_1',
  'x_1','x_ex_twitter','xylophone','y_1','yaourt','yemen','yeux','yo_yo',
  'yougoslavie','youtube','z_1','zambie','zaventem','zaventem_ville_1','zebre','zen',
  'zimbabwe','zoo','zoom','zoom_video_communications','zut',
];

// Base URL CDN (Vercel Blob) — définie via NEXT_PUBLIC_SIGNS_CDN dans .env.local
// Si absente, utilise les fichiers locaux /signs/
const SIGNS_CDN = (process.env.NEXT_PUBLIC_SIGNS_CDN ?? '').replace(/\/$/, '');

function signUrl(id: string): string {
  return SIGNS_CDN ? `${SIGNS_CDN}/signs/${id}.json` : `/signs/${id}.json`;
}

// Décode le format compressé {p,la,ra,l,r} → SignFrame
function decodeFrame(raw: Record<string, unknown>): SignFrame {
  if ('pose' in raw) return raw as unknown as SignFrame; // déjà décompressé
  const toXYZ = (arr: number[]) => ({ x: arr[0], y: arr[1], z: arr[2] });
  const p = (raw.p as number[][]).map(toXYZ);
  const frame: SignFrame = { pose: p };
  if (raw.r) frame.right_hand = (raw.r as number[][]).map(toXYZ);
  if (raw.l) frame.left_hand  = (raw.l as number[][]).map(toXYZ);
  if (raw.ra) {
    const [s, u, f] = raw.ra as number[][];
    frame.right_arm = { shoulder: toXYZ(s), upper_arm: toXYZ(u), forearm: toXYZ(f) };
  }
  if (raw.la) {
    const [s, u, f] = raw.la as number[][];
    frame.left_arm = { shoulder: toXYZ(s), upper_arm: toXYZ(u), forearm: toXYZ(f) };
  }
  return frame;
}

async function parseSign(res: Response): Promise<{ frames: SignFrame[]; fps: number }> {
  const data = await res.json();
  if (Array.isArray(data)) return { frames: data as SignFrame[], fps: 25 };
  const frames = (data.frames as Record<string, unknown>[]).map(decodeFrame);
  return { frames, fps: data.fps ?? 25 };
}

async function loadSign(id: string): Promise<{ frames: SignFrame[]; fps: number }> {
  // Strip _N suffix for local fallback (e.g. bonjour_1 → bonjour)
  const baseId = id.replace(/_\d+$/, '');
  const candidates = SIGNS_CDN
    ? [
        `${SIGNS_CDN}/signs/${id}.json`,
        `/signs/${id}.json`,
        ...(baseId !== id ? [`${SIGNS_CDN}/signs/${baseId}.json`, `/signs/${baseId}.json`] : []),
      ]
    : [
        `/signs/${id}.json`,
        ...(baseId !== id ? [`/signs/${baseId}.json`] : []),
      ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) return await parseSign(res);
    } catch { /* CORS ou erreur réseau, essai suivant */ }
  }
  throw new Error(`Signe "${id}" introuvable`);
}

export default function SignAvatarPlayer({ text, ts, language = 'fr' }: { text: string; ts: number; language?: string }) {
  const { t } = useLanguage();
  const { dark } = useDarkMode();
  const canvasBg = 'bg-slate-900';
  const [frames, setFrames] = useState<SignFrame[]>([]);
  const [fps, setFps] = useState(25);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSign, setActiveSign] = useState<string | null>(null);
  const [allSigns, setAllSigns] = useState<string[]>([]);
  const [currentSignIdx, setCurrentSignIdx] = useState(-1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cameraView, setCameraView] = useState<CameraView>('close');
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [idleFrame, setIdleFrame] = useState<SignFrame | null>(null);
  const [transitionFrame, setTransitionFrame] = useState<SignFrame | null>(null);
  const preloadCache = useRef<Map<string, { frames: SignFrame[]; fps: number }>>(new Map());
  const queueRef = useRef<string[]>([]);
  const originalSignsRef = useRef<string[]>([]);
  const signIdxRef = useRef(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [showWord, setShowWord] = useState(false);
  const originalWordsRef = useRef<string[]>([]);

  useEffect(() => {
    loadSign('comprendre')
      .then(({ frames }) => { if (frames.length > 0) setIdleFrame(frames[0]); })
      .catch(() => {});
  }, []);

  const prefetchSign = useCallback((id: string) => {
    if (preloadCache.current.has(id)) {
      setTransitionFrame(preloadCache.current.get(id)!.frames[0] ?? null);
      return;
    }
    loadSign(id)
      .then(data => {
        preloadCache.current.set(id, data);
        setTransitionFrame(data.frames[0] ?? null);
      })
      .catch(() => {});
  }, []);

  const playSign = async (id: string, keepPlaying = false, idx = 0) => {
    setError(null);
    setStatus('loading');
    setIsPaused(false);
    if (!keepPlaying) setIsPlaying(false);
    setActiveSign(id);
    signIdxRef.current = idx;
    setCurrentSignIdx(idx);
    try {
      const cached = preloadCache.current.get(id);
      const data = cached ?? await loadSign(id);
      if (!cached) preloadCache.current.set(id, data);
      setFrames([...data.frames]);
      setFps(data.fps);
      setIsPlaying(true);
      setStatus('playing');
      if (queueRef.current.length > 0) prefetchSign(queueRef.current[0]);
    } catch {
      setError(`Signe "${id}" introuvable dans le lexique`);
      setStatus('idle');
      setActiveSign(null);
      queueRef.current = [];
    }
  };

  useEffect(() => {
    if (!ts) return;
    const raw = text.trim();
    if (!raw) return;
    setStatus('loading');
    fetch('/api/segment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: raw, language }),
    })
      .then(r => r.json())
      .then(({ signs, words: wordLabels }) => {
        if (!signs || signs.length === 0) {
          setError(`${t.dashboard.avatarNoSign} "${raw}"`);
          setStatus('idle');
          return;
        }
        setError(null);
        originalSignsRef.current = signs;
        originalWordsRef.current = wordLabels ?? [];
        setAllSigns(signs);
        setWords(wordLabels ?? []);
        queueRef.current = signs.slice(1);
        playSign(signs[0], false, 0);
      })
      .catch(() => {
        setError('Erreur lors de la segmentation');
        setStatus('idle');
      });
  }, [ts]);

  const handleDone = () => {
    if (queueRef.current.length > 0) {
      const nextIdx = signIdxRef.current + 1;
      playSign(queueRef.current.shift()!, true, nextIdx);
    } else {
      setIsPlaying(false);
      setStatus('done');
    }
  };

  const handlePlayPause = () => {
    if (status === 'idle' || status === 'loading' || allSigns.length === 0) return;
    if (status === 'done') {
      handleReplay();
      return;
    }
    if (isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    if (originalSignsRef.current.length === 0) return;
    const signs = originalSignsRef.current;
    queueRef.current = signs.slice(1);
    setWords(originalWordsRef.current);
    setIsPaused(false);
    setError(null);
    playSign(signs[0], false, 0);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPlaying(false);
    setIsPaused(false);
    setStatus('idle');
    setAllSigns([]);
    setFrames([]);
    setCurrentSignIdx(-1);
    setWords([]);
    queueRef.current = [];
    originalSignsRef.current = [];
    originalWordsRef.current = [];
  };

  const handleSpeak = () => {
    if (!text.trim() || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    if (isSpeaking) { setIsSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text.trim());
    const langMap: Record<string, string> = { fr: 'fr-FR', en: 'en-GB', tr: 'tr-TR' };
    utterance.lang = langMap[language] ?? 'fr-FR';
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const canPlay = allSigns.length > 0 && avatarLoaded;
  const isActive = status === 'playing' || status === 'done' || isPaused;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Canvas avatar */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900" style={{ height: '540px' }}>
        {!avatarLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-900 rounded-2xl">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#5ba4b0] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#5ba4b0] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-400 animate-pulse">Chargement de l'avatar…</p>
          </div>
        )}

        <Canvas camera={{ position: [0, 0.7, 2.2], fov: 45 }} shadows>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <Environment files="/potsdamer_platz_1k.hdr" />
            <SignLanguageAvatar
              frames={frames}
              isPlaying={isPlaying}
              paused={isPaused}
              fps={fps}
              onDone={handleDone}
              onLoad={() => setAvatarLoaded(true)}
              idleFrame={idleFrame}
              transitionFrame={transitionFrame}
              activeSign={activeSign}
            />
            <CameraController view={cameraView} />
          </Suspense>
        </Canvas>

        {/* Camera view buttons (coin bas-gauche) */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-10">
          {([
            { id: 'close'   as CameraView, label: t.dashboard.camClose },
            { id: 'general' as CameraView, label: t.dashboard.camGeneral },
          ]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setCameraView(id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow backdrop-blur-sm cursor-pointer"
              style={cameraView === id
                ? { background: '#5ba4b0', color: '#ffffff' }
                : { background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.8)' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Badge statut (coin haut-droit) */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
          status === 'loading'  ? 'bg-amber-500 text-white' :
          status === 'done'     ? 'bg-emerald-500 text-white' :
          isPaused              ? 'bg-slate-600 text-white' :
          status === 'idle'     ? 'bg-slate-700 text-slate-300' : 'bg-transparent'
        }`}>
          {status === 'idle'    && t.dashboard.avatarReady}
          {status === 'loading' && t.dashboard.avatarLoading}
          {status === 'done'    && t.dashboard.avatarDone}
          {isPaused             && 'Pause'}
        </div>
      </div>

      {/* Barre de contrôle */}
      <div className="flex items-center gap-2 px-1">
        {/* Replay */}
        <button
          onClick={handleReplay}
          disabled={!canPlay || status === 'loading'}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 shadow cursor-pointer shrink-0"
          style={{ background: 'rgba(91,164,176,0.15)', color: '#5ba4b0' }}
          title="Rejouer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>

        {/* Stop / Reset */}
        <button
          onClick={handleStop}
          disabled={status === 'idle'}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 shadow cursor-pointer shrink-0"
          style={{ background: status !== 'idle' ? 'rgba(239,68,68,0.15)' : 'rgba(91,164,176,0.1)', color: status !== 'idle' ? '#ef4444' : '#5ba4b0' }}
          title="Arrêter et réinitialiser"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>

        {/* Son / TTS */}
        <button
          onClick={handleSpeak}
          disabled={!text.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 shadow cursor-pointer shrink-0"
          style={{ background: isSpeaking ? '#5ba4b0' : 'rgba(91,164,176,0.15)', color: isSpeaking ? 'white' : '#5ba4b0' }}
          title={isSpeaking ? 'Arrêter la lecture' : 'Lire la phrase'}
        >
          {isSpeaking ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>

        {/* Word toggle */}
        <button
          onClick={() => setShowWord(v => !v)}
          disabled={!canPlay}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 shadow cursor-pointer shrink-0"
          style={{ background: showWord ? '#5ba4b0' : 'rgba(91,164,176,0.15)', color: showWord ? 'white' : '#5ba4b0' }}
          title="Afficher le mot en cours"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 4h10" />
          </svg>
        </button>

        {/* Current word display */}
        {showWord && currentSignIdx >= 0 && words[currentSignIdx] && (
          <span
            className="ml-auto px-4 py-2 rounded-xl font-semibold text-sm capitalize transition-all"
            style={{ background: 'rgba(91,164,176,0.12)', color: '#5ba4b0', border: '1px solid rgba(91,164,176,0.25)' }}
          >
            {words[currentSignIdx]}
          </span>
        )}

      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
