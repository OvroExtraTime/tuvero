/**
 * Strings for Toasts, headers, default contents and whatever you can think of.
 *
 * TODO (in the reference:) show where and how each string is used
 *
 * @return Strings
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(['strings'], function(LocalStrings) {
  var Strings;

  Strings = {
    autosaveoff: 'Automatisches  Speichern aus',
    autosaveon: 'Automatisches Speichern an',
    autoupdateoff: 'Automatische Aktualisierung aus',
    autoupdateon: 'Automatische Aktualisierung an',
    clearstorage: 'Wirklich alle Turniere löschen?',
    confirmtreeremoval: 'Das Turnier "%s" wirklich löschen?',
    confirmactivetreeremoval: 'Das laufende Turnier "%s" wirklich löschen?',
    confirmleave: 'Fenster schließen, ohne das Turnier zu speichern?',
    upvote: '▲',
    downvote: '▼',
    byevote: '∅',
    byename: 'Freilos',
    byeid: '∅',
    onlyonefile: 'Zu viele Dateien. Bitte nur eine Datei laden',
    nofiles: 'Keine Dateien ausgewählt',
    fileabort: 'Lesen abgebrochen',
    fileerror: 'Lesefehler',
    filenotfound: 'Datei wurde nicht gefunden',
    filenotreadable: 'Datei ist nicht lesbar',
    gamefinished: 'Spiel beendet',
    invalidresult: 'Ungültiges Ergebnis',
    loaded: 'Turnier geladen',
    loadfailed: 'Ladevorgang fehlgeschlagen!',
    newtournament: 'Neues Turnier begonnen',
    notournament: 'Noch kein Turnier gestartet',
    notimplemented: 'Funktion noch nicht verfügbar',
    pageload: 'Seite geladen',
    pointchangeaborted: 'Änderung verworfen',
    pointchangeapplied: 'Änderung gespeichert',
    toolatetournamentfinished: 'Neues Ergebnis beeinflusst Folgerunden nicht!',
    rankingupdate: 'Ranking wurde berechnet',
    roundfailed: 'Auslosung fehlgeschlagen',
    roundfinished: '%s. Runde abgeschlossen',
    roundstarted: '%s. Runde ausgelost',
    roundrunning: 'Runde %s läuft',
    registrationclosed: 'Registrierung geschlossen',
    saved: 'gespeichert',
    savefailed: 'Speichern fehlgeschlagen',
    exportfailed: 'Export fehlgeschlagen',
    startfailed: 'Auslosung fehlgeschlagen. Zu wenige Teams?',
    teamadded: 'Team %s registriert',
    notenoughteams: 'Zu wenige Teams',
    teamtext: 'Spieler',
    teamstext: 'Spieler',
    namechanged: 'Umbenannt: %s',
    namechangeaborted: 'Name verworfen',
    teamsnotempty: 'Teilnehmer wurden schon eingetragen',
    emptyname: 'N.N.',
    differentteamsizes: 'Teams haben unterschiedliche Größe',
    invalidteamsize: 'Unzulässige Spielerzahl pro Team',
    alltabsreloaded: 'Alle Tabs neu geladen',
    modsvariableadded: 'window.mods erstellt',
    tournamentfinished: 'Turnier beendet',
    autocompleteloaded: 'Namensvorschläge geladen',
    autocompletereloadfailed: 'Konnte Namensvorschläge nicht laden',
    fileempty: 'Datei ist leer',
    teamdeleted: 'Anmeldung %s gelöscht',
    deleteallteamsconfirmation: 'Wirklich alle Anmeldungen löschen?',
    nofilereader: 'Dieser Browser kann keine Speicherstände laden!',
    nojson: 'Dieser Browser kann keine Speicherstände erstellen!',
    nostorage: 'Dieser Browser kann keine Spielstände speichern!',
    updatedownloading: 'Neue Version wird geladen...',
    updatefailed: 'Fehler beim Download der neuen Version',
    updateavailable: 'Neu laden für neue Version',
    dev: 'Entwicklerversion',
    rc: 'Versionsvorschau',
    reset: 'Gespeicherte Daten gelöscht',
    defaultnameswiss: 'Schweizer System',
    defaultnameko: 'KO-Turnier',
    defaultnamepoule: 'Poule-System',
    defaultnameround: 'Rundenturnier',
    defaultnamesupermelee: 'Supermelee',
    offlineconfirmexit: 'Tuvero ist gerade nicht offline verfügbar. Beenden?',
    winstatustrue: 'S',
    winstatusfalse: 'N',
    winstatusundefined: '',
    nomanifest: 'Offline-Modus deaktiviert',
    tournamentalreadyfinished: 'Turnier ist schon beendet',
    gamesstillrunning: 'Es gibt noch offene Spiele',
    tournamentstarted: 'Turnier gestartet',
    tabupdateerror: 'Fehler bei Aktualisierung vom %s-Tab',
    tab_teams: 'Mannschaften',
    tab_new: 'Turniersysteme',
    tab_games: 'Laufende Spiele',
    tab_ranking: 'Platzierungen',
    tab_history: 'Spielverlauf',
    tab_debug: 'Debugging Console',
    tab_settings: 'Optionen und Einstellungen',
    tab_about: 'Über...',
    nodata: 'Keine Daten',
    svgns: 'http://www.w3.org/2000/svg',
    firstplace: '1. Platz',
    thirdplace: '3. Platz',
    ranking_numgames: 'Spiele',
    ranking_wins: 'Siege',
    ranking_points: 'Kleine Punkte',
    ranking_lostpoints: 'Gegnerpunkte',
    ranking_saldo: 'Saldo-Punkte',
    ranking_buchholz: 'Buchholz-Punkte',
    ranking_finebuchholz: 'Feinbuchholz-Punkte',
    ranking_sonneborn: 'Sonneborn-Berger-Zahl',
    ranking_id: 'Startnummer',
    ranking_ko: 'KO-Wertung',
    ranking_headtohead: 'Direkter Vergleich',
    ranking_tac: 'TAC-Punkte',
    ranking_votes: 'Lose (nur Anzeige)',
    ranking_ranks: 'Platz',
    ranking_short_numgames: 'Sp.',
    ranking_short_wins: 'S',
    ranking_short_points: 'P',
    ranking_short_lostpoints: 'GP',
    ranking_short_saldo: 'SP',
    ranking_short_buchholz: 'BH',
    ranking_short_finebuchholz: 'FBH',
    ranking_short_sonneborn: 'SB',
    ranking_short_id: 'No.',
    ranking_short_ko: 'KO',
    ranking_short_headtohead: 'VGL',
    ranking_short_tac: 'TAC',
    ranking_short_votes: 'L',
    ranking_short_ranks: 'Pl.',
    ranking_medium_numgames: 'Spiele',
    ranking_medium_wins: 'Siege',
    ranking_medium_points: 'Punkte',
    ranking_medium_lostpoints: 'Gegnerpunkte',
    ranking_medium_saldo: 'Saldo',
    ranking_medium_buchholz: 'Buchholz',
    ranking_medium_finebuchholz: 'Feinbuchholz',
    ranking_medium_sonneborn: 'SB-Zahl',
    ranking_medium_id: 'Startnummer',
    ranking_medium_ko: 'KO-Wertung',
    ranking_medium_headtohead: 'Vergleich',
    ranking_medium_tac: 'TAC',
    ranking_medium_votes: 'Lose',
    ranking_medium_ranks: 'Platz',
    tournamenterrorprefix: 'Turnierfehler',
    oldsaveformat: 'Fehler beim Umwandeln eines alten 1.4-Speicherstandes',
    tournament_initial: 'Unterturnier erstellt',
    tournament_running: 'Runde gestartet',
    tournament_idle: 'Runde beendet',
    tournament_finished: 'Unterturnier beendet',
    namechangeprompt: 'Neuen Namen eingeben',
    teamdeleteprompt: 'Zum Löschen Team anklicken',
    csvheader_teams: 'No.,Name',
    csvheader_history: 'Runde,Spielno.,"No. 1","No. 2","Punkte 1","Punkte 2"',
    csvheader_ranking: 'Platz,No.',
    popout_adblocked: 'Ein Werbeblocker verhindert das Öffnen eines Fensters',
    display_error: 'Anzeigefehler. Bitte neu laden.'
  };

  Object.keys(LocalStrings).forEach(function(key) {
    Strings[key] = LocalStrings[key];
  });

  return Strings;
});
